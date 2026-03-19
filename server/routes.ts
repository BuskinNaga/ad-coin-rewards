import { type Express, type Request, type Response } from "express";
import { storage } from "./storage";
import { api } from "@shared/routes";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import cookieParser from "cookie-parser";

const JWT_SECRET = process.env.SESSION_SECRET || "cashflow-secret-key-default-123";

export async function registerRoutes(httpServer: any, app: Express) {
  app.use(cookieParser());

  app.post(api.auth.register.path, async (req: Request, res: Response) => {
    try {
      const input = api.auth.register.input.parse(req.body);

      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) return res.status(400).json({ message: "Username already exists" });

      const existingEmail = await storage.getUserByEmail(input.email);
      if (existingEmail) return res.status(400).json({ message: "Email already exists" });

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
      res.cookie("auth_token", token, { httpOnly: true });

      return res.status(201).json({ user, token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}