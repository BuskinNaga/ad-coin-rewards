import { db } from "./db";
import { users, history, type InsertUser, type User, type History } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { referralCode: string; referredBy?: string }): Promise<User>;
  updateUserCoins(id: number, coinsToAdd: number): Promise<User>;
  addHistory(record: Omit<History, "id" | "date">): Promise<History>;
  getHistory(userId: number): Promise<History[]>;
  checkDailyLimit(userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser & { referralCode: string; referredBy?: string }): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserCoins(id: number, coinsToAdd: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isNewDay = !user.lastAdDate || user.lastAdDate < today;
    const dailyAdsWatched = isNewDay ? 1 : user.dailyAdsWatched + 1;

    const [updated] = await db.update(users)
      .set({
        coins: user.coins + coinsToAdd,
        totalEarned: user.totalEarned + coinsToAdd,
        dailyAdsWatched,
        lastAdDate: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
      
    return updated;
  }

  async addHistory(record: Omit<History, "id" | "date">): Promise<History> {
    const [newHistory] = await db.insert(history).values(record).returning();
    return newHistory;
  }

  async getHistory(userId: number): Promise<History[]> {
    return await db.select().from(history).where(eq(history.userId, userId)).orderBy(history.date);
  }

  async checkDailyLimit(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastAdDate && user.lastAdDate >= today) {
      return user.dailyAdsWatched < 50;
    }
    return true; // new day
  }
}

export const storage = new DatabaseStorage();