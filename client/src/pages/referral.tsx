import { useUser } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Users,
  Copy,
  Share2,
  ChevronLeft,
  Coins,
  UserCheck,
  TrendingUp,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ReferralData {
  count: number;
  totalEarned: number;
  referrals: { username: string; joinedAt: number }[];
}

export default function ReferralPage() {
  const { data: user } = useUser();
  const { toast } = useToast();

  const { data: referralData, isLoading } = useQuery<ReferralData>({
    queryKey: ["/api/referrals"],
    enabled: !!user,
  });

  const referralLink = user
    ? `${window.location.origin}/register?ref=${user.referralCode}`
    : "";

  const handleCopyCode = () => {
    if (!user?.referralCode) return;
    navigator.clipboard.writeText(user.referralCode);
    toast({ title: "Copied!", description: "Referral code copied to clipboard." });
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join CashFlow & Earn!",
        text: `Use my referral code ${user?.referralCode} to sign up and start earning coins!`,
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 pt-8 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/">
          <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Referrals</h1>
          <p className="text-sm text-muted-foreground">Earn 2% of every friend's coins — forever</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-primary/10"
        >
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Friends Invited</p>
            <p className="text-2xl font-bold leading-tight">
              {isLoading ? "—" : referralData?.count ?? 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-primary/10"
        >
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Coins Earned</p>
            <p className="text-2xl font-bold leading-tight">
              {isLoading ? "—" : (referralData?.totalEarned ?? 0).toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* How it works banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl p-4 mb-5 flex items-start gap-3 border border-primary/20 bg-primary/5"
      >
        <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm mb-0.5">2% Lifetime Commission</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every time a friend you invited watches an ad or mines coins, you automatically
            receive 2% of what they earn — for life, with no cap.
          </p>
        </div>
      </motion.div>

      {/* Referral Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-3xl p-5 mb-5 border border-primary/10"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
          Your Referral Code
        </p>
        <div className="flex items-center justify-between bg-black/30 rounded-2xl px-4 py-3 border border-white/5 mb-3">
          <span className="text-2xl font-mono font-bold tracking-widest">
            {user?.referralCode ?? "---"}
          </span>
          <button
            onClick={handleCopyCode}
            data-testid="button-copy-code"
            className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-emerald-400 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            data-testid="button-copy-link"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors py-2.5 text-sm font-medium"
          >
            <LinkIcon className="w-4 h-4" />
            Copy Link
          </button>
          <button
            onClick={handleShare}
            data-testid="button-share"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-emerald-400 transition-colors py-2.5 text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </motion.div>

      {/* Referral List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-3xl p-5 border border-primary/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Friends You Invited</h2>
          <span className="ml-auto text-xs text-muted-foreground bg-white/5 rounded-full px-2 py-0.5">
            {referralData?.count ?? 0} total
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !referralData?.referrals?.length ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No referrals yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Share your code to start earning commissions
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {referralData.referrals.map((r, i) => (
              <motion.div
                key={r.username}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3"
                data-testid={`row-referral-${i}`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {r.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm flex-1 truncate">
                  {r.username}
                </span>
                <span className="text-xs text-muted-foreground">Member</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
