import { db } from "./db.js";
import {
  users, history, coinOrders, coinTransactions,
  type InsertUser, type User, type History,
  type CoinOrder, type CoinTransaction,
  type InsertCoinOrder, type InsertCoinTransaction,
} from "../shared/schema.js";
import { eq, sql, and, desc } from "drizzle-orm";

const DAILY_AD_LIMIT = 20;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getReferralsByCode(referralCode: string): Promise<User[]>;
  createUser(user: InsertUser & { referralCode: string; referredBy?: string }): Promise<User>;
  updateUserCoins(id: number, coinsToAdd: number): Promise<User>;
  addReferralBonus(id: number, coinsToAdd: number): Promise<User>;
  updateMineReward(userId: number, reward: number): Promise<User>;
  addHistory(record: Omit<History, "id" | "date">): Promise<History>;
  getHistory(userId: number): Promise<History[]>;
  checkDailyLimit(userId: number): Promise<boolean>;
  // ── Market ─────────────────────────────────────────────────────────
  createCoinOrder(order: InsertCoinOrder): Promise<CoinOrder>;
  getCoinOrders(type?: "buy" | "sell"): Promise<CoinOrder[]>;
  getCoinOrderById(id: number): Promise<CoinOrder | undefined>;
  updateCoinOrderStatus(id: number, status: string, adminNote?: string): Promise<CoinOrder>;
  getUserCoinOrders(userId: number): Promise<CoinOrder[]>;
  createCoinTransaction(tx: InsertCoinTransaction): Promise<CoinTransaction>;
  getCoinTransactions(userId: number): Promise<CoinTransaction[]>;
  updateTransactionStatus(id: number, status: string, adminNote?: string): Promise<CoinTransaction>;
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

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getReferralsByCode(referralCode: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.referredBy, referralCode));
  }

  async createUser(
    insertUser: InsertUser & { referralCode: string; referredBy?: string }
  ): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateMineReward(userId: number, reward: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        coins: sql`${users.coins} + ${reward}`,
        totalEarned: sql`${users.totalEarned} + ${reward}`,
        lastMineDate: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserCoins(id: number, coinsToAdd: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isNewDay = !user.lastAdDate || user.lastAdDate < today;
    const dailyAdsWatched = isNewDay ? 1 : user.dailyAdsWatched + 1;

    const [updated] = await db
      .update(users)
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

  // Used only for referral bonuses — does NOT touch ad-tracking fields
  async addReferralBonus(id: number, coinsToAdd: number): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({
        coins: sql`${users.coins} + ${coinsToAdd}`,
        totalEarned: sql`${users.totalEarned} + ${coinsToAdd}`,
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
    return await db
      .select()
      .from(history)
      .where(eq(history.userId, userId))
      .orderBy(history.date);
  }

  async checkDailyLimit(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastAdDate && user.lastAdDate >= today) {
      return user.dailyAdsWatched < DAILY_AD_LIMIT;
    }

    return true; // New day — limit resets
  }

  // ── Market methods ───────────────────────────────────────────────────

  async createCoinOrder(order: InsertCoinOrder): Promise<CoinOrder> {
    const [row] = await db.insert(coinOrders).values(order).returning();
    return row;
  }

  async getCoinOrders(type?: "buy" | "sell"): Promise<CoinOrder[]> {
    if (type) {
      return db.select().from(coinOrders)
        .where(and(eq(coinOrders.type, type), eq(coinOrders.isActive, true)))
        .orderBy(desc(coinOrders.createdAt));
    }
    return db.select().from(coinOrders)
      .where(eq(coinOrders.isActive, true))
      .orderBy(desc(coinOrders.createdAt));
  }

  async getCoinOrderById(id: number): Promise<CoinOrder | undefined> {
    const [row] = await db.select().from(coinOrders).where(eq(coinOrders.id, id));
    return row;
  }

  async updateCoinOrderStatus(id: number, status: string, adminNote?: string): Promise<CoinOrder> {
    const [row] = await db.update(coinOrders)
      .set({ status, ...(adminNote ? { adminNote } : {}), isActive: status === "open" })
      .where(eq(coinOrders.id, id))
      .returning();
    return row;
  }

  async getUserCoinOrders(userId: number): Promise<CoinOrder[]> {
    return db.select().from(coinOrders)
      .where(eq(coinOrders.userId, userId))
      .orderBy(desc(coinOrders.createdAt));
  }

  async createCoinTransaction(tx: InsertCoinTransaction): Promise<CoinTransaction> {
    const [row] = await db.insert(coinTransactions).values(tx).returning();
    return row;
  }

  async getCoinTransactions(userId: number): Promise<CoinTransaction[]> {
    return db.select().from(coinTransactions)
      .where(eq(coinTransactions.buyerId, userId))
      .orderBy(desc(coinTransactions.createdAt));
  }

  async updateTransactionStatus(id: number, status: string, adminNote?: string): Promise<CoinTransaction> {
    const [row] = await db.update(coinTransactions)
      .set({ status, ...(adminNote ? { adminNote } : {}) })
      .where(eq(coinTransactions.id, id))
      .returning();
    return row;
  }
}

export const storage = new DatabaseStorage();
