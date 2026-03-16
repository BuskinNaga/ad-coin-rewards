import { motion } from "framer-motion";
import { Coins, TrendingUp, Shield, Globe, Zap, Users } from "lucide-react";

const sections = [
  {
    icon: Zap,
    color: "text-primary bg-primary/10",
    title: "The Problem",
    body: "Digital advertising generates billions of dollars every year. However, the people who actually consume these ads — everyday users — receive nothing in return. Ad networks and platforms capture all the value while users give away their time and attention for free.",
  },
  {
    icon: Coins,
    color: "text-amber-400 bg-amber-400/10",
    title: "The CashFlow Solution",
    body: "CashFlow is a reward-sharing platform that puts the value back in users' hands. Every time a user watches a sponsored ad, the platform shares a portion of the ad revenue directly with them in the form of coins. No surveys, no data selling — just watch and earn.",
  },
  {
    icon: TrendingUp,
    color: "text-emerald-400 bg-emerald-400/10",
    title: "The Reward System",
    body: "Users earn 5 to 10 coins per ad watched, with a maximum of 50 ads per day. Coins accumulate in the user's balance and can be redeemed for real value. The conversion rate is fixed at 1000 coins = 1 USDT, giving users a transparent and predictable earning potential of up to 0.5 USDT per day.",
  },
  {
    icon: Shield,
    color: "text-blue-400 bg-blue-400/10",
    title: "Security & Trust",
    body: "All accounts are protected with industry-standard security including encrypted passwords and secure session management. Before withdrawals are enabled, users will complete a KYC (Know Your Customer) verification process to prevent fraud and ensure every real user can safely claim their earnings.",
  },
  {
    icon: Users,
    color: "text-purple-400 bg-purple-400/10",
    title: "Referral & Community Growth",
    body: "CashFlow grows through word of mouth. Users who refer friends will earn bonus coins when those friends watch their first ads. This referral reward system creates a thriving community of earners who are incentivised to grow the platform together.",
  },
  {
    icon: Globe,
    color: "text-orange-400 bg-orange-400/10",
    title: "Future Plans",
    body: "Phase 1 is the Watch & Earn core (live now). Phase 2 will introduce USDT withdrawals via crypto wallets and KYC verification. Phase 3 will add an enhanced referral program with tiered bonuses, a leaderboard, and loyalty rewards for consistent daily users. Phase 4 will expand the ad inventory with more premium sponsors, increasing per-ad coin rewards and introducing limited-time bonus events.",
  },
];

export default function WhitepaperPage() {
  return (
    <div className="max-w-xl mx-auto p-4 pt-10 pb-32">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
          <Coins className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-1">CashFlow Whitepaper</h1>
        <p className="text-muted-foreground text-sm">v1.0 — March 2026</p>
      </motion.div>

      {/* Intro card */}
      <div className="glass-card rounded-3xl p-6 mb-6 border-t border-primary/20">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">CashFlow</span> is a mobile-first,
          watch-to-earn platform that redistributes digital advertising revenue to everyday users.
          This document outlines our core mission, the reward mechanism, and the roadmap for
          building a sustainable, transparent earning ecosystem.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-base">{s.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground/60 mt-8 px-4">
        This whitepaper is for informational purposes only and is subject to updates as the platform evolves.
      </p>
    </div>
  );
}
