import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { storage } from "../server/storage.js";

const JWT_SECRET = process.env.SESSION_SECRET || "cashflow-secret-key-default-123";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/api/mine", async (req, res) => {
  // ── Auth ────────────────────────────────────────────────────────────
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  let userId: number;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    userId = decoded.userId;
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  // ── Mining logic ─────────────────────────────────────────────────────
  try {
    const user = await storage.getUser(userId);
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
    const updatedUser = await storage.updateMineReward(userId, reward);

    // 2% lifetime referral commission
    if (user.referredBy) {
      const referrer = await storage.getUserByReferralCode(user.referredBy);
      if (referrer) {
        const bonus = Math.max(1, Math.floor(reward * 0.02));
        await storage.updateUserCoins(referrer.id, bonus);
        await storage.addHistory({ userId: referrer.id, coinsEarned: bonus, type: "referral" });
      }
    }

    await storage.addHistory({ userId, coinsEarned: reward, type: "mine" });

    return res.status(200).json({ success: true, coins: updatedUser.coins });
  } catch (err) {
    console.error("MINE ERROR:", err);
    return res.status(500).json({ message: "Mining failed" });
  }
});

export default app;
