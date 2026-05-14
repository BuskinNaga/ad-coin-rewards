import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  coins: integer("coins").default(0).notNull(),
  totalEarned: integer("total_earned").default(0).notNull(),
  dailyAdsWatched: integer("daily_ads_watched").default(0).notNull(),
  lastAdDate: timestamp("last_ad_date"),
  lastMineDate: timestamp("last_mine_date"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
});

export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  coinsEarned: integer("coins_earned").notNull(),
  type: text("type").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

// ── COIN ORDERS (P2P buy/sell listings) ──────────────────────────────
export const coinOrders = pgTable("coin_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),           // "buy" | "sell"
  coinAmount: integer("coin_amount").notNull(),
  priceUsdt: text("price_usdt").notNull(),
  paymentMethod: text("payment_method").notNull(), // "upi" | "bank_transfer"
  paymentDetails: text("payment_details"),
  status: text("status").notNull().default("pending"), // "pending" | "open" | "matched" | "completed" | "cancelled" | "rejected"
  adminNote: text("admin_note"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── COIN TRANSACTIONS (direct purchases & P2P trades) ─────────────────
export const coinTransactions = pgTable("coin_transactions", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id"),
  orderId: integer("order_id"),
  coinAmount: integer("coin_amount").notNull(),
  priceUsdt: text("price_usdt").notNull(),
  type: text("type").notNull(),           // "direct_buy" | "p2p"
  paymentMethod: text("payment_method").notNull(),
  paymentProof: text("payment_proof"),   // reference / screenshot URL
  status: text("status").notNull().default("pending"),
  // "pending" | "payment_submitted" | "admin_review" | "approved" | "completed" | "rejected"
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  coins: true, 
  totalEarned: true, 
  dailyAdsWatched: true, 
  lastAdDate: true, 
  referralCode: true 
});

export const insertCoinOrderSchema = createInsertSchema(coinOrders).omit({
  id: true, createdAt: true, status: true, isActive: true, adminNote: true,
});

export const insertCoinTransactionSchema = createInsertSchema(coinTransactions).omit({
  id: true, createdAt: true, status: true, adminNote: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type History = typeof history.$inferSelect;
export type CoinOrder = typeof coinOrders.$inferSelect;
export type CoinTransaction = typeof coinTransactions.$inferSelect;
export type InsertCoinOrder = z.infer<typeof insertCoinOrderSchema>;
export type InsertCoinTransaction = z.infer<typeof insertCoinTransactionSchema>;
