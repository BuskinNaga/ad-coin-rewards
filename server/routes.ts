import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
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
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use(cookieParser());

  // === AUTH ROUTES ===

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(input.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
      
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
        referralCode,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        totalEarned: user.totalEarned,
        dailyAdsWatched: user.dailyAdsWatched,
        referralCode: user.referralCode
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        totalEarned: user.totalEarned,
        dailyAdsWatched: user.dailyAdsWatched,
        referralCode: user.referralCode
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.auth.me.path, authMiddleware, async (req, res) => {
    const user = await storage.getUser(req.userId!);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      coins: user.coins,
      totalEarned: user.totalEarned,
      dailyAdsWatched: user.dailyAdsWatched,
      referralCode: user.referralCode
    });
  });

  app.post(api.auth.logout.path, (req, res) => {
    res.clearCookie("auth_token");
    res.status(200).json({ message: "Logged out successfully" });
  });

  // === ADS ROUTES ===

  app.post(api.ads.reward.path, authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      
      const canWatch = await storage.checkDailyLimit(userId);
      if (!canWatch) {
        return res.status(400).json({ message: "Daily limit reached. Come back tomorrow." });
      }

      // Random reward between 5 and 10 coins
      const coinsEarned = Math.floor(Math.random() * 6) + 5;
      
      const updatedUser = await storage.updateUserCoins(userId, coinsEarned);
      
      await storage.addHistory({
        userId,
        coinsEarned,
        type: "ad"
      });

      res.status(200).json({
        message: "Reward claimed successfully",
        coinsEarned,
        newBalance: updatedUser.coins
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to process reward" });
    }
  });

  // === HISTORY ROUTES ===

  app.get(api.history.list.path, authMiddleware, async (req, res) => {
    try {
      const records = await storage.getHistory(req.userId!);
      res.status(200).json(records);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  return httpServer;
}