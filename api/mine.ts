import type { VercelRequest, VercelResponse } from "@vercel/node";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { storage } from "../server/storage";

const JWT_SECRET =
  process.env.SESSION_SECRET || "cashflow-secret-key-default-123";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reward = 20;
    const updatedUser = await storage.updateMineReward(userId, reward);

    return res.status(200).json({
      success: true,
      coins: updatedUser.coins,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Mining failed" });
  }
}