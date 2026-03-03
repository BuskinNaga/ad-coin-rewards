import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
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

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  coins: true, 
  totalEarned: true, 
  dailyAdsWatched: true, 
  lastAdDate: true, 
  referralCode: true 
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type History = typeof history.$inferSelect;
