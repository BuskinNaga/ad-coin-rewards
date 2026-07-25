import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { updateProfileSchema } from "../shared/schema.js";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import crypto from "crypto";

const JWT_SECRET = process.env.SESSION_SECRET || "cashflow-secret-key-default-123";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Returns all profile-safe fields (no password) — used by auth/me, login, register
function safeUser(user: Awaited<ReturnType<typeof storage.getUser>> & object) {
  return {
    id:              user.id,
    username:        user.username,
    email:           user.email,
    firstName:       user.firstName  ?? null,
    lastName:        user.lastName   ?? null,
    displayName:     user.displayName ?? null,
    phone:           user.phone      ?? null,
    avatarUrl:       user.avatarUrl  ?? null,
    coins:           user.coins,
    totalEarned:     user.totalEarned,
    dailyAdsWatched: user.dailyAdsWatched,
    referralCode:    user.referralCode,
    lastAdDate:      user.lastAdDate ?? null,
  };
}

export async function registerRoutes(httpServer: Server, app: Express) {
  app.use(cookieParser());

  // ── AUTH ─────────────────────────────────────────────────────────────

  app.post(api.auth.register.path, async (req: Request, res: Response) => {
    try {
      const input = api.auth.register.input.parse(req.body);

      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser)
        return res.status(400).json({ message: "Username already exists" });

      const existingEmail = await storage.getUserByEmail(input.email);
      if (existingEmail)
        return res.status(400).json({ message: "Email already exists" });

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();

      // Accept referrer's code as either "referralCode" (URL ?ref= convention)
      // or "referredBy" in the request body — read from raw body so Zod stripping
      // of the "referralCode" key (which is omitted in insertUserSchema) doesn't lose it
      const referrerCode: string | undefined =
        (req.body.referralCode as string | undefined) ??
        (input.referredBy as string | undefined) ??
        undefined;

      const user = await storage.createUser({
        username: input.username,
        email: input.email,
        password: hashedPassword,
        referralCode,
        referredBy: referrerCode || undefined,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth_token", token, COOKIE_OPTS);

      return res.status(201).json(safeUser(user));
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      if (err instanceof z.ZodError)
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req: Request, res: Response) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);

      // Accept either username or email in the username field
      const user =
        (await storage.getUserByUsername(username)) ??
        (await storage.getUserByEmail(username));
      if (!user)
        return res.status(401).json({ message: "Invalid username or password" });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid)
        return res.status(401).json({ message: "Invalid username or password" });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth_token", token, COOKIE_OPTS);

      return res.status(200).json(safeUser(user));
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.auth.me.path, authMiddleware, async (req: Request, res: Response) => {
    const user = await storage.getUser(req.userId!);
    if (!user) return res.status(401).json({ message: "User not found" });
    return res.status(200).json(safeUser(user));
  });

  app.post(api.auth.logout.path, (_req: Request, res: Response) => {
    res.clearCookie("auth_token");
    return res.status(200).json({ message: "Logged out successfully" });
  });

  // ── ADS ──────────────────────────────────────────────────────────────

  app.post(api.ads.reward.path, authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const canWatch = await storage.checkDailyLimit(userId);
      if (!canWatch)
        return res.status(400).json({ message: "Daily limit reached. Come back tomorrow." });

      const coinsEarned = Math.floor(Math.random() * 6) + 5;
      const updatedUser = await storage.updateUserCoins(userId, coinsEarned);

      // Referral bonus: 2% lifetime commission to referrer (coins only, no ad tracking)
      const currentUser = await storage.getUser(userId);
      if (currentUser?.referredBy) {
        const referrer = await storage.getUserByReferralCode(currentUser.referredBy);
        if (referrer) {
          const bonus = Math.max(1, Math.floor(coinsEarned * 0.02));
          await storage.addReferralBonus(referrer.id, bonus);
          await storage.addHistory({ userId: referrer.id, coinsEarned: bonus, type: "referral" });
        }
      }

      await storage.addHistory({ userId, coinsEarned, type: "ad" });

      return res.status(200).json({
        message: "Reward claimed successfully",
        coinsEarned,
        newBalance: updatedUser.coins,
      });
    } catch (err) {
      console.error("REWARD ERROR:", err);
      return res.status(500).json({ message: "Failed to process reward" });
    }
  });

  // ── DAILY REWARD ─────────────────────────────────────────────────────

  app.get("/api/daily-reward/status", authMiddleware, async (req: Request, res: Response) => {
    try {
      const status = await storage.getDailyRewardStatus(req.userId!);
      return res.json(status);
    } catch (err) {
      console.error("DAILY REWARD STATUS ERROR:", err);
      return res.status(500).json({ message: "Failed to get reward status" });
    }
  });

  app.post("/api/daily-reward/claim", authMiddleware, async (req: Request, res: Response) => {
    try {
      const status = await storage.getDailyRewardStatus(req.userId!);
      if (status.claimed) {
        return res.status(400).json({ message: "Daily reward already claimed. Come back tomorrow!" });
      }
      const result = await storage.claimDailyReward(req.userId!);
      await storage.addHistory({ userId: req.userId!, coinsEarned: result.coins, type: "daily_reward" });
      return res.json({ coins: result.coins, newBalance: result.newBalance });
    } catch (err) {
      console.error("DAILY REWARD CLAIM ERROR:", err);
      return res.status(500).json({ message: "Failed to claim reward" });
    }
  });

  // ── MINE ─────────────────────────────────────────────────────────────

  app.post("/api/mine", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) return res.status(404).json({ message: "User not found" });

      const now = new Date();
      if (
        user.lastMineDate &&
        now.getTime() - new Date(user.lastMineDate).getTime() < 24 * 60 * 60 * 1000
      ) {
        const remaining =
          24 * 60 * 60 * 1000 - (now.getTime() - new Date(user.lastMineDate).getTime());
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        return res.status(400).json({ message: `You can mine again in ${hours}h ${minutes}m` });
      }

      const reward = 20;
      const updatedUser = await storage.updateMineReward(req.userId!, reward);

      // Referral bonus: 2% lifetime commission to referrer on mining (coins only, no ad tracking)
      if (user.referredBy) {
        const referrer = await storage.getUserByReferralCode(user.referredBy);
        if (referrer) {
          const bonus = Math.max(1, Math.floor(reward * 0.02));
          await storage.addReferralBonus(referrer.id, bonus);
          await storage.addHistory({ userId: referrer.id, coinsEarned: bonus, type: "referral" });
        }
      }

      await storage.addHistory({ userId: req.userId!, coinsEarned: reward, type: "mine" });

      return res.status(200).json({ message: `You mined ${reward} coins!`, coins: updatedUser.coins });
    } catch (err) {
      console.error("MINE ERROR:", err);
      return res.status(500).json({ message: "Mining failed" });
    }
  });

  // ── PROFILE ───────────────────────────────────────────────────────────

  app.get("/api/profile", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safe } = user;
      return res.json(safe);
    } catch (err) {
      console.error("PROFILE GET ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", authMiddleware, async (req: Request, res: Response) => {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { username, email } = parsed.data;
      const currentUser = await storage.getUser(req.userId!);
      if (!currentUser) return res.status(404).json({ message: "User not found" });

      // Check username uniqueness (allow keeping own username)
      if (username !== currentUser.username) {
        const existing = await storage.getUserByUsername(username);
        if (existing) return res.status(409).json({ message: "Username already taken" });
      }

      // Check email uniqueness (allow keeping own email)
      if (email !== currentUser.email) {
        const existing = await storage.getUserByEmail(email);
        if (existing) return res.status(409).json({ message: "Email already in use" });
      }

      const updated = await storage.updateUserProfile(req.userId!, parsed.data);
      const { password: _, ...safe } = updated;
      return res.json(safe);
    } catch (err) {
      console.error("PROFILE PATCH ERROR:", err);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ── PROFILE AVATAR ────────────────────────────────────────────────────

  app.patch("/api/profile/avatar", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { avatarUrl } = req.body;
      if (typeof avatarUrl !== "string") {
        return res.status(400).json({ message: "Invalid avatar data" });
      }
      // Must be a base64 JPEG/PNG data URL
      if (!/^data:image\/(jpeg|png|webp);base64,/.test(avatarUrl)) {
        return res.status(400).json({ message: "Avatar must be a base64-encoded image" });
      }
      // Enforce ~200 KB limit on the base64 string (approx 150 KB decoded)
      if (avatarUrl.length > 280_000) {
        return res.status(400).json({ message: "Image too large. Please upload a smaller image." });
      }
      const updated = await storage.updateUserAvatar(req.userId!, avatarUrl);
      const { password: _, ...safe } = updated;
      return res.json(safe);
    } catch (err) {
      console.error("AVATAR UPDATE ERROR:", err);
      return res.status(500).json({ message: "Failed to update avatar" });
    }
  });

  // ── USERS COUNT ───────────────────────────────────────────────────────

  app.get("/api/users/count", async (_req: Request, res: Response) => {
    try {
      const allUsers = await storage.getAllUsers();
      return res.json({ count: allUsers.length });
    } catch (err) {
      console.error("USERS COUNT ERROR:", err);
      return res.status(500).json({ count: 0 });
    }
  });

  // ── REFERRALS ────────────────────────────────────────────────────────

  app.get("/api/referrals", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) return res.status(404).json({ message: "User not found" });

      const referrals = await storage.getReferralsByCode(user.referralCode);
      const history = await storage.getHistory(req.userId!);
      const totalEarned = history
        .filter((h) => h.type === "referral")
        .reduce((sum, h) => sum + h.coinsEarned, 0);

      return res.status(200).json({
        count: referrals.length,
        totalEarned,
        referrals: referrals.map((r) => ({
          username: r.username,
          joinedAt: r.id, // sequential ID used as join order proxy
        })),
      });
    } catch (err) {
      console.error("REFERRALS ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  // ── HISTORY ──────────────────────────────────────────────────────────

  app.get(api.history.list.path, authMiddleware, async (req: Request, res: Response) => {
    try {
      const records = await storage.getHistory(req.userId!);
      return res.status(200).json(records);
    } catch (err) {
      console.error("HISTORY ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.delete("/api/history", authMiddleware, async (req: Request, res: Response) => {
    try {
      await storage.clearHistory(req.userId!);
      return res.status(200).json({ message: "History cleared" });
    } catch (err) {
      console.error("CLEAR HISTORY ERROR:", err);
      return res.status(500).json({ message: "Failed to clear history" });
    }
  });

  // ── MARKET (future-ready, not yet activated) ──────────────────────────

  // GET /api/market/info — exchange rate + feature flags
  app.get("/api/market/info", authMiddleware, async (_req: Request, res: Response) => {
    return res.json({
      exchangeRate: 1000,          // 1000 coins = 1 USDT
      minCoins: 500,
      maxCoins: 100000,
      supportedMethods: ["upi", "bank_transfer"],
      features: {
        directBuy: false,          // not yet live
        directSell: false,
        p2p: false,
      },
      message: "Coin marketplace coming soon. Database and infrastructure are ready.",
    });
  });

  // GET /api/market/orders — list open P2P orders (future)
  app.get("/api/market/orders", authMiddleware, async (req: Request, res: Response) => {
    try {
      const type = req.query.type as "buy" | "sell" | undefined;
      const orders = await storage.getCoinOrders(type);
      return res.json(orders);
    } catch (err) {
      console.error("MARKET ORDERS ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // POST /api/market/orders — create P2P order (future — returns 503 until activated)
  app.post("/api/market/orders", authMiddleware, async (_req: Request, res: Response) => {
    return res.status(503).json({
      message: "P2P trading is coming soon. Your account is ready.",
      comingSoon: true,
    });
  });

  // GET /api/market/transactions — user's coin purchase history
  app.get("/api/market/transactions", authMiddleware, async (req: Request, res: Response) => {
    try {
      const txs = await storage.getCoinTransactions(req.userId!);
      return res.json(txs);
    } catch (err) {
      console.error("MARKET TXS ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // POST /api/market/buy — direct coin purchase (future — returns 503 until activated)
  app.post("/api/market/buy", authMiddleware, async (_req: Request, res: Response) => {
    return res.status(503).json({
      message: "Direct coin purchase is coming soon.",
      comingSoon: true,
    });
  });

  return httpServer;
}
