import { useEffect, useState } from "react";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Coins,
  PlaySquare,
  Wallet,
  History,
  LogOut,
  TrendingUp,
  Zap,
  Sun,
  Moon,
  ChevronRight,
  HelpCircle,
  FileText,
  ShieldCheck,
  Users,
  Menu,
  Pickaxe,
  MessageCircle,
  Send,
  Clock,
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

  const [miningTimeLeft, setMiningTimeLeft] = useState(0);
  const [canMine, setCanMine] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const lastMine = localStorage.getItem("lastMineTime");

      if (!lastMine) {
        setCanMine(true);
        setMiningTimeLeft(0);
        return;
      }

      const nextMine = Number(lastMine) + 24 * 60 * 60 * 1000;
      const remaining = nextMine - Date.now();

      if (remaining <= 0) {
        setCanMine(true);
        setMiningTimeLeft(0);
      } else {
        setCanMine(false);
        setMiningTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const res = await fetch("/api/users/count");
        const data = await res.json();
        setTotalUsers(data.count || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTotalUsers();
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleMine = async () => {
    if (!canMine) return;

    try {
      const res = await fetch("/api/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Mine error:", data.message);
        return;
      }

      localStorage.setItem("lastMineTime", Date.now().toString());
      setCanMine(false);
      setMiningTimeLeft(24 * 60 * 60 * 1000);

      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  const usdtEquivalent = (user.coins / 1000).toFixed(2);
  const progressToWithdraw = Math.min((user.coins / 10000) * 100, 100);
  const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;

const shareMessage = `Join CASH FLOW and start mining coins with me! Use my referral link: ${referralLink}`;

const whatsappShare = () => {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
    "_blank"
  );
};

const telegramShare = () => {
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(
      referralLink
    )}&text=${encodeURIComponent(
      "Join CASH FLOW and start mining with me!"
    )}`,
    "_blank"
  );
};

  return (
    <div className="max-w-xl mx-auto p-4 pt-8 md:pt-12">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Hello, {user.username} 👋‹</h1>
          <p className="text-muted-foreground text-sm">Ready to earn some cash?</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

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

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Community card */}
        <div className="glass-card rounded-3xl p-4 flex flex-col items-center justify-center gap-2 border border-primary/10 text-center">
          <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm leading-tight">Community</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalUsers.toLocaleString()} users
            </p>
          </div>
        </div>

        {/* Daily Mine card */}
        <div className="glass-card rounded-3xl p-4 flex flex-col items-center justify-center gap-2 border border-primary/10 text-center">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${canMine ? "bg-gradient-to-br from-yellow-500 to-orange-600" : "bg-muted"}`}>
            {canMine ? <Pickaxe className="w-5 h-5" /> : <Clock className="w-5 h-5 text-muted-foreground" />}
          </div>

          {canMine ? (
            <>
              <p className="text-xs text-muted-foreground leading-tight">+20 coins</p>
              <Button
                onClick={handleMine}
                className="w-full rounded-2xl text-sm py-1.5"
                data-testid="button-mine"
              >
                Mine
              </Button>
            </>
          ) : (
            <>
              <p className="text-[10px] text-muted-foreground leading-tight">Next mine in</p>
              <p className="text-xs font-mono font-semibold text-yellow-500 leading-tight tabular-nums">
                {formatTime(miningTimeLeft)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-card rounded-3xl p-5 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Invite & Earn</h3>
              <p className="text-sm text-muted-foreground">
                Earn 10% of your friends' mining rewards
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Your Referral Code
              </p>
              <div className="px-4 py-3 rounded-2xl bg-black/20 border border-white/10 font-bold text-lg tracking-widest text-center">
                {user.referralCode}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Your Referral Link
              </p>
              <input
  readOnly
  value={referralLink}
  className="w-full px-4 py-3 rounded-2xl bg-black/20 border border-white/10 text-sm text-foreground"
/>
              <div className="grid grid-cols-2 gap-3 mt-3">
  <button
    onClick={whatsappShare}
    className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 hover:bg-green-700 text-white py-3 font-semibold transition"
  >
    <MessageCircle className="w-5 h-5" />
    WhatsApp
  </button>

  <button
    onClick={telegramShare}
    className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white py-3 font-semibold transition"
  >
    <Send className="w-5 h-5" />
    Telegram
  </button>
</div>
            </div>
          </div>
        </div>

        <h3 className="font-display font-semibold text-lg ml-2 mb-2 -mt-2">Quick Actions</h3>

        <Link href="/watch">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <PlaySquare className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Watch & Earn</h4>
              <p className="text-sm text-muted-foreground mt-0.5">Earn 5 - 10 coins per ad</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}