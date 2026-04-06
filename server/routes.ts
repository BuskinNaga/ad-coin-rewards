import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
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

      const user = await storage.createUser({
        username: input.username,
        email: input.email,
        password: hashedPassword,
        referralCode,
        referredBy: input.referredBy ?? undefined,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth_token", token, COOKIE_OPTS);

      return res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        totalEarned: user.totalEarned,
        dailyAdsWatched: user.dailyAdsWatched,
        referralCode: user.referralCode,
      });
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

      const user = await storage.getUserByUsername(username);
      if (!user)
        return res.status(401).json({ message: "Invalid username or password" });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid)
        return res.status(401).json({ message: "Invalid username or password" });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth_token", token, COOKIE_OPTS);

      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        totalEarned: user.totalEarned,
        dailyAdsWatched: user.dailyAdsWatched,
        referralCode: user.referralCode,
      });
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
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      coins: user.coins,
      totalEarned: user.totalEarned,
      dailyAdsWatched: user.dailyAdsWatched,
      referralCode: user.referralCode,
    });
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

      // Referral bonus: 10% of coins go to referrer
      const currentUser = await storage.getUser(userId);
      if (currentUser?.referredBy) {
        const referrer = await storage.getUserByReferralCode(currentUser.referredBy);
        if (referrer) {
          const bonus = Math.floor(coinsEarned * 0.1);
          await storage.updateUserCoins(referrer.id, bonus);
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

      const reward = 10;
      const updatedUser = await storage.updateMineReward(req.userId!, reward);
      return res.status(200).json({ message: `You mined ${reward} coins!`, coins: updatedUser.coins });
    } catch (err) {
      console.error("MINE ERROR:", err);
      return res.status(500).json({ message: "Mining failed" });
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

  return httpServer;
}
