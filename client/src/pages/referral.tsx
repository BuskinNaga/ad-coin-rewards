import { useUser } from "@/hooks/use-auth";
import { Users, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReferralPage() {
  const { data: user } = useUser();
  const { toast } = useToast();

  const handleCopy = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard.",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 pt-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold">Refer Friends</h1>
      </div>

      <div className="glass-card rounded-[2rem] p-8 text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-tr from-accent to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/20">
          <Share2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Invite & Earn (Soon)</h2>
        <p className="text-muted-foreground mb-8 text-sm">
          Share your referral code with friends. The reward system for referrals will be activated in the next update!
        </p>

        <div className="bg-black/30 rounded-2xl p-4 flex items-center justify-between border border-white/5">
          <div className="text-left">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider block mb-1">Your Code</span>
            <span className="text-xl font-mono font-bold text-white tracking-widest">{user?.referralCode || "---"}</span>
          </div>
          <button 
            onClick={handleCopy}
            className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-md"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-2xl text-sm text-muted-foreground text-center">
        Referral stats will appear here once the system is live. Keep building your network!
      </div>
    </div>
  );
}
