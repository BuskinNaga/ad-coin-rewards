import { useUser, useLogout } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Coins, PlaySquare, Wallet, History, LogOut,
  TrendingUp, Zap, Sun, Moon, ChevronRight,
  HelpCircle, FileText, ShieldCheck, Users, Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { data: user } = useUser();
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  const usdtEquivalent = (user.coins / 1000).toFixed(2);
  const progressToWithdraw = Math.min((user.coins / 10000) * 100, 100);

  return (
    <div className="max-w-xl mx-auto p-4 pt-8 md:pt-12">
      {/* ── Header ── */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Hello, {user.username} 👋</h1>
          <p className="text-muted-foreground text-sm">Ready to earn some cash?</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid="button-user-menu"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <Link href="/faq">
                <DropdownMenuItem className="cursor-pointer gap-3">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  FAQs
                </DropdownMenuItem>
              </Link>
              <Link href="/whitepaper">
                <DropdownMenuItem className="cursor-pointer gap-3">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Whitepaper
                </DropdownMenuItem>
              </Link>
              <Link href="/kyc">
                <DropdownMenuItem className="cursor-pointer gap-3">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  KYC Verification
                </DropdownMenuItem>
              </Link>
              <Link href="/referral">
                <DropdownMenuItem className="cursor-pointer gap-3">
                  <Users className="w-4 h-4 text-purple-400" />
                  Referrals
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-3 text-destructive focus:text-destructive"
                onClick={() => logout.mutate()}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Balance card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-800 p-6 md:p-8 shadow-xl shadow-primary/20 mb-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary-foreground/80 mb-1">
              <Coins className="w-5 h-5" />
              <span className="font-medium">Total Balance</span>
            </div>
            <div className="text-5xl md:text-6xl font-display font-bold text-white mb-2">
              {user.coins.toLocaleString()}
            </div>
            <div className="inline-block px-3 py-1 bg-black/20 rounded-full text-sm font-medium text-white/90 backdrop-blur-sm">
              ≈ ${usdtEquivalent} USDT
            </div>
          </div>

          <div className="w-full md:w-1/3 bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Withdrawal Goal</span>
              <span>10K Coins</span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToWithdraw}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-accent rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass-card rounded-3xl p-5 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-3 text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold font-display">{user.totalEarned.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Earned</span>
        </div>

        <div className="glass-card rounded-3xl p-5 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-3 text-accent">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold font-display">
            {user.dailyAdsWatched} <span className="text-sm text-muted-foreground">/ 50</span>
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Ads Today</span>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-lg ml-2">Quick Actions</h3>

        <Link href="/watch">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <PlaySquare className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Watch & Earn</h4>
              <p className="text-sm text-muted-foreground mt-0.5">Earn 5–10 coins per ad</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>

        <Link href="/withdraw">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Withdraw Funds</h4>
              <p className="text-sm text-muted-foreground mt-0.5">Convert coins to USDT</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>

        <Link href="/history">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <History className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Earning History</h4>
              <p className="text-sm text-muted-foreground mt-0.5">View your transactions</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>

        {/* ── Secondary links ── */}
        <div className="pt-2">
          <h3 className="font-display font-semibold text-base ml-2 mb-3 text-muted-foreground">More</h3>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/faq">
              <div className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors text-center" data-testid="link-faq">
                <HelpCircle className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium">FAQs</span>
              </div>
            </Link>
            <Link href="/whitepaper">
              <div className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors text-center" data-testid="link-whitepaper">
                <FileText className="w-6 h-6 text-amber-400" />
                <span className="text-xs font-medium">Whitepaper</span>
              </div>
            </Link>
            <Link href="/kyc">
              <div className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors text-center" data-testid="link-kyc">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
                <span className="text-xs font-medium">KYC</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
