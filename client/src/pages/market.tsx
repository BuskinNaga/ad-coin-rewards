import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ShoppingCart,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Users2,
  Clock,
  Shield,
  CheckCircle,
  Smartphone,
  Building2,
  Info,
  History,
  Zap,
} from "lucide-react";
import { useUser } from "@/hooks/use-auth";

const TABS = [
  { id: "buy",     label: "Buy Coins",  icon: ArrowDownLeft },
  { id: "sell",    label: "Sell Coins", icon: ArrowUpRight  },
  { id: "p2p",     label: "P2P Trade",  icon: Users2        },
  { id: "history", label: "History",    icon: History       },
] as const;

type Tab = typeof TABS[number]["id"];

const PAYMENT_METHODS = [
  { id: "upi",           label: "UPI / QR Pay",    icon: Smartphone, color: "text-purple-400 bg-purple-400/10" },
  { id: "bank_transfer", label: "Bank Transfer",    icon: Building2,  color: "text-blue-400 bg-blue-400/10"   },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Choose amount",   desc: "Select how many coins you want to buy or sell." },
  { step: "2", title: "Pick payment",    desc: "Choose UPI or bank transfer as your payment method." },
  { step: "3", title: "Submit request",  desc: "Submit your order — admin verifies within 24 hours." },
  { step: "4", title: "Coins credited",  desc: "Coins added to your wallet after payment confirmation." },
];

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-400/20 rounded-full px-2.5 py-0.5">
      <Zap className="w-2.5 h-2.5" /> Coming Soon
    </span>
  );
}

function ComingSoonOverlay() {
  return (
    <div className="absolute inset-0 z-10 rounded-2xl bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
        <Clock className="w-6 h-6 text-amber-400" />
      </div>
      <p className="font-semibold text-sm">Coming Soon</p>
      <p className="text-xs text-muted-foreground text-center px-6">
        This feature is in preparation. Your account is already set up for it.
      </p>
    </div>
  );
}

function BuyTab() {
  return (
    <div className="space-y-4">
      <div className="relative glass-card rounded-2xl p-5 overflow-hidden">
        <ComingSoonOverlay />
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Amount</p>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold">500</div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-black/20 rounded-xl px-3 py-3">
            <Coins className="w-4 h-4 text-yellow-400" /> Coins
          </div>
        </div>
        <div className="flex justify-between text-sm mb-5">
          <span className="text-muted-foreground">You pay</span>
          <span className="font-semibold">≈ 0.50 USDT</span>
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Payment Method</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PAYMENT_METHODS.map((m) => (
            <div key={m.id} className={`flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 ${m.id === "upi" ? "border-primary/40 bg-primary/5" : ""}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
                <m.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium">{m.label}</span>
              {m.id === "upi" && <CheckCircle className="w-3.5 h-3.5 text-primary ml-auto" />}
            </div>
          ))}
        </div>
        <div className="w-full rounded-xl bg-primary/50 text-primary-foreground py-3 text-sm font-semibold text-center opacity-50 cursor-not-allowed">
          Buy Coins
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-primary/10">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Rate: <span className="font-semibold text-foreground">1000 coins = 1 USDT</span>.
          Minimum purchase: 500 coins. Admin manually verifies each payment before coins are credited to your wallet.
        </p>
      </div>
    </div>
  );
}

function SellTab() {
  return (
    <div className="space-y-4">
      <div className="relative glass-card rounded-2xl p-5 overflow-hidden">
        <ComingSoonOverlay />
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Coins to Sell</p>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold">1000</div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-black/20 rounded-xl px-3 py-3">
            <Coins className="w-4 h-4 text-yellow-400" /> Coins
          </div>
        </div>
        <div className="flex justify-between text-sm mb-5">
          <span className="text-muted-foreground">You receive</span>
          <span className="font-semibold">≈ 1.00 USDT</span>
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Payout Method</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PAYMENT_METHODS.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
                <m.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="w-full rounded-xl bg-rose-500/50 text-white py-3 text-sm font-semibold text-center opacity-50 cursor-not-allowed">
          Sell Coins
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-amber-400/10">
        <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Selling requires KYC verification. Your wallet balance updates once admin approves the payout request.
        </p>
      </div>
    </div>
  );
}

function P2PTab() {
  const mockOrders = [
    { type: "buy",  coins: 2000, price: "2.00", method: "UPI",  user: "user_***" },
    { type: "sell", coins: 5000, price: "5.00", method: "Bank", user: "user_***" },
    { type: "buy",  coins: 1000, price: "1.00", method: "UPI",  user: "user_***" },
  ];

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-10 rounded-2xl bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Users2 className="w-6 h-6 text-amber-400" />
          </div>
          <p className="font-semibold text-sm">P2P Trading — Coming Soon</p>
          <p className="text-xs text-muted-foreground text-center px-8">
            Trade directly with other users. Order book infrastructure is ready.
          </p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 px-4 py-2.5 border-b border-white/5 text-xs text-muted-foreground font-medium">
            <span>Type</span>
            <span>Coins</span>
            <span>USDT</span>
            <span>Method</span>
          </div>
          {mockOrders.map((o, i) => (
            <div key={i} className="grid grid-cols-4 px-4 py-3 border-b border-white/5 text-sm items-center">
              <span className={`font-semibold text-xs ${o.type === "buy" ? "text-emerald-400" : "text-rose-400"}`}>
                {o.type.toUpperCase()}
              </span>
              <span>{o.coins.toLocaleString()}</span>
              <span>${o.price}</span>
              <span className="text-xs text-muted-foreground">{o.method}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-primary/10">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          P2P allows user-to-user coin trades. Each transaction is verified by admin before coins or funds are released.
        </p>
      </div>
    </div>
  );
}

function HistoryTab() {
  return (
    <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
        <History className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="font-semibold text-sm mb-1">No transactions yet</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Your coin purchase and sale history will appear here once the marketplace goes live.
      </p>
    </div>
  );
}

export default function MarketPage() {
  const { data: user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("buy");

  const usdtValue = user ? (user.coins / 1000).toFixed(2) : "0.00";

  return (
    <div className="max-w-xl mx-auto p-4 pt-8 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold">Coin Market</h1>
            <ComingSoonBadge />
          </div>
          <p className="text-sm text-muted-foreground">Buy, sell, and trade Felix Network coins</p>
        </div>
      </div>

      {/* Rate card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-800 p-5 mb-5 shadow-xl shadow-primary/20"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70 uppercase tracking-widest mb-1">Exchange Rate</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-display font-bold text-white">1,000</span>
              <span className="text-white/80 font-medium">coins</span>
              <span className="text-white/60 mx-1">=</span>
              <span className="text-3xl font-display font-bold text-white">$1</span>
              <span className="text-white/80 font-medium">USDT</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-2xl mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`tab-market-${tab.id}`}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {activeTab === "buy"     && <BuyTab />}
        {activeTab === "sell"    && <SellTab />}
        {activeTab === "p2p"     && <P2PTab />}
        {activeTab === "history" && <HistoryTab />}
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 glass-card rounded-3xl p-5"
      >
        <h2 className="font-display font-bold text-base mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          How it will work
        </h2>
        <div className="space-y-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features coming */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { icon: Shield,    label: "Admin Approval",    desc: "Every order verified" },
          { icon: Smartphone, label: "UPI & Bank",       desc: "Multiple payment methods" },
          { icon: Users2,    label: "P2P Trading",       desc: "User-to-user trades" },
          { icon: CheckCircle, label: "KYC Required",    desc: "For withdrawals & selling" },
        ].map((f) => (
          <div key={f.label} className="glass-card rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <f.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight">{f.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
