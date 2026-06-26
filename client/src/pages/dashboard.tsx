import { useEffect, useState } from "react";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
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
  Pickaxe,
  MessageCircle,
  Send,
  Clock,
  ShoppingCart,
  UserCircle,
  Download,
  Globe,
  Gift,
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { InstallGuideModal } from "@/components/pwa-install-banner";
import { usePWAInstall, isInStandaloneMode } from "@/hooks/use-pwa-install";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const { data: user } = useUser();
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { hasNativePrompt, isInstalled, platform, promptInstall } = usePWAInstall();

  const [miningTimeLeft, setMiningTimeLeft] = useState(0);
  const [canMine, setCanMine] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [claimedCoins, setClaimedCoins] = useState<number | null>(null);

  const { data: rewardStatus, refetch: refetchRewardStatus } = useQuery<{ claimed: boolean; lastClaimDate: string | null }>({
    queryKey: ["/api/daily-reward/status"],
    staleTime: 0,
  });

  const claimReward = useMutation({
    mutationFn: () => apiRequest("POST", "/api/daily-reward/claim"),
    onSuccess: async (data: any) => {
      const json = await data.json();
      setClaimedCoins(json.coins);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      refetchRewardStatus();
    },
    onError: async (err: any) => {
      toast({ title: "Already claimed", description: "Come back tomorrow for your next reward!", variant: "destructive" });
    },
  });

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

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Mining failed",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mining successful!",
        description: `You earned 20 coins. Come back in 24 hours to mine again.`,
      });

      localStorage.setItem("lastMineTime", Date.now().toString());
      setCanMine(false);
      setMiningTimeLeft(24 * 60 * 60 * 1000);

      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error(error);
      toast({
        title: "Mining failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  const referralLink = `https://ad-coin-rewards.vercel.app/r/${user.referralCode}`;

  const getNetworkRank = (coins: number) => {
    if (coins >= 100000) return { emoji: "💎", label: "Diamond Member" };
    if (coins >= 50000) return { emoji: "🥇", label: "Gold Member" };
    if (coins >= 10000) return { emoji: "🥈", label: "Silver Member" };
    return { emoji: "🥉", label: "Bronze Member" };
  };
  const rank = getNetworkRank(user.coins);

const shareMessage = `🚀 Felix Network is coming soon!\nJoin early and become part of the community.\nStart mining rewards with Felix Network.\nJoin here:\n${referralLink}`;

const whatsappShare = () => {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
    "_blank"
  );
};

const telegramShare = () => {
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
      "🚀 Felix Network is coming soon!\nJoin early and become part of the community.\nStart mining rewards with Felix Network."
    )}`,
    "_blank"
  );
};

  return (
    <>
    <div className="max-w-xl mx-auto p-4 pt-8 md:pt-12">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Hello, {user.displayName || (user.firstName ? user.firstName : user.username)} 👋</h1>
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
                className="rounded-full hover:ring-2 hover:ring-primary/40 hover:ring-offset-2 hover:ring-offset-background transition-all"
                aria-label="Open menu"
              >
                <UserAvatar user={user} size="md" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer gap-3" data-testid="menu-edit-profile">
                  <UserCircle className="w-4 h-4 text-emerald-400" />
                  Edit Profile
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator />

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

              <Link href="/market">
                <DropdownMenuItem className="cursor-pointer gap-3">
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  Coin Market
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-400/20 rounded-full px-1.5 py-0.5">Soon</span>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer gap-3"
                data-testid="menu-install-app"
                onClick={async () => {
                  if (isInstalled || isInStandaloneMode()) return;
                  if (hasNativePrompt) {
                    await promptInstall();
                  } else {
                    setShowInstallGuide(true);
                  }
                }}
              >
                <Download className="w-4 h-4 text-primary" />
                {isInstalled || isInStandaloneMode() ? (
                  <span className="text-emerald-400">App Installed ✓</span>
                ) : (
                  "Download App"
                )}
              </DropdownMenuItem>

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
              🪙 Coins
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm text-center min-w-[148px]">
            <div className="flex items-center justify-center gap-1.5 text-sm text-white/80 mb-3">
              <Globe className="w-4 h-4" />
              <span>Network Rank</span>
            </div>
            <div className="text-3xl mb-1.5">{rank.emoji}</div>
            <div className="text-sm font-bold text-white">{rank.label}</div>
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

      {/* Daily Reward */}
      <button
        onClick={() => { setClaimedCoins(null); setShowDailyReward(true); }}
        className="w-full glass-card rounded-3xl p-5 mb-6 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors text-left"
        data-testid="button-daily-reward"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${rewardStatus?.claimed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
          {rewardStatus?.claimed ? <CheckCircle2 className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base">Daily Reward</h3>
          <p className="text-sm text-muted-foreground">
            {rewardStatus?.claimed ? "Reward claimed today ✓" : "Login daily to earn rewards"}
          </p>
        </div>
        <div className="text-2xl">{rewardStatus?.claimed ? "✅" : "🎁"}</div>
      </button>

      <div className="space-y-4">
        <div className="glass-card rounded-3xl p-5 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Invite & Earn</h3>
              <p className="text-sm text-muted-foreground">
                Earn 2% of your friends' mining rewards
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

    {/* PWA install guide - rendered at page level so it survives dropdown close */}
    {showInstallGuide && (
      <InstallGuideModal
        platform={platform}
        onClose={() => setShowInstallGuide(false)}
      />
    )}

    {/* Daily Reward Modal */}
    <AnimatePresence>
      {showDailyReward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-24 sm:pb-0"
          onClick={() => setShowDailyReward(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm glass-card rounded-3xl p-6 border border-amber-400/20 shadow-2xl"
          >
            <button
              onClick={() => setShowDailyReward(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-secondary/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {claimedCoins === null ? (
              <>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-bold mb-1">Daily Reward</h2>
                  <p className="text-sm text-muted-foreground">
                    {rewardStatus?.claimed
                      ? "You've already claimed today's reward. Come back tomorrow!"
                      : "Claim your daily reward and earn 1–5 bonus coins!"}
                  </p>
                </div>

                {rewardStatus?.claimed ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Reward claimed today ✓
                  </div>
                ) : (
                  <Button
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/20"
                    onClick={() => claimReward.mutate()}
                    disabled={claimReward.isPending}
                    data-testid="button-claim-reward"
                  >
                    {claimReward.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Claiming...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Claim Reward</>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-2">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="text-6xl mb-4"
                >
                  🎁
                </motion.div>
                <h2 className="text-xl font-display font-bold mb-1">You earned coins!</h2>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-bold text-amber-400 mb-2"
                >
                  +{claimedCoins}
                </motion.div>
                <p className="text-sm text-muted-foreground mb-6">Come back tomorrow for another reward!</p>
                <Button
                  className="w-full rounded-2xl"
                  onClick={() => setShowDailyReward(false)}
                >
                  Awesome!
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}