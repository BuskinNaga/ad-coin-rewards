import jwt from "jsonwebtoken";
import { storage } from "../server/storage.js";

const JWT_SECRET = process.env.SESSION_SECRET || "cashflow-secret-key-default-123";

function parseCookies(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k?.trim()) out[k.trim()] = decodeURIComponent(v.join("=").trim());
  }
  return out;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // ── Auth ──────────────────────────────────────────────────────────────
  const cookies = parseCookies(req.headers?.cookie ?? "");
  const token = cookies.auth_token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  let userId: number;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    userId = decoded.userId;
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  // ── Mining ────────────────────────────────────────────────────────────
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
      return res.status(400).json({ message: `Mine again in ${hours}h ${minutes}m` });
    }

    const reward = 20;
    const updatedUser = await storage.updateMineReward(userId, reward);

    // 2% referral commission
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
}
