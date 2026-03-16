import { useState, useEffect, useRef } from "react";
import { useReward } from "@/hooks/use-ads";
import { useUser } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import confetti from "canvas-confetti";

const MONETAG_DIRECT_LINK = "https://omg10.com/4/10632799";
const WATCH_DURATION = 15;
const DAILY_LIMIT = 50;

type Status = "idle" | "watching" | "rewarding" | "success" | "error";

export default function WatchPage() {
  const { data: user, refetch: refetchUser } = useUser();
  const reward = useReward();

  const [status, setStatus] = useState<Status>("idle");
  const [timeLeft, setTimeLeft] = useState(WATCH_DURATION);
  const [earned, setEarned] = useState(0);
  const rewardCalledRef = useRef(false);

  const adsWatched = user?.dailyAdsWatched ?? 0;
  const limitReached = adsWatched >= DAILY_LIMIT;

  // 15-second countdown — only runs during "watching" state
  useEffect(() => {
    if (status !== "watching") return;

    if (timeLeft === 0) {
      // Timer done — claim reward exactly once
      if (!rewardCalledRef.current) {
        rewardCalledRef.current = true;
        setStatus("rewarding");
        reward.mutate(undefined, {
          onSuccess: (data) => {
            setEarned(data.coinsEarned);
            setStatus("success");
            refetchUser();
            triggerConfetti();
          },
          onError: () => {
            setStatus("error");
          },
        });
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const handleStartVideo = () => {
    if (limitReached) return;

    // Open Monetag Direct Link in new tab on the exact button tap
    window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer");

    // Reset and start 15-second countdown immediately
    rewardCalledRef.current = false;
    setTimeLeft(WATCH_DURATION);
    setStatus("watching");
  };

  const handleWatchAnother = () => {
    setStatus("idle");
    setTimeLeft(WATCH_DURATION);
    rewardCalledRef.current = false;
  };

  const triggerConfetti = () => {
    const duration = 2500;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#10b981", "#f59e0b", "#ffffff"] });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#10b981", "#f59e0b", "#ffffff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  // Progress fraction for the ring (1 = full, 0 = empty)
  const ringProgress = timeLeft / WATCH_DURATION;

  return (
    <div className="max-w-md mx-auto p-4 pt-12 min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold mb-2">Watch & Earn</h1>
        <p className={`text-sm font-medium ${limitReached ? "text-red-400" : "text-muted-foreground"}`}>
          Daily Limit: {adsWatched} / {DAILY_LIMIT}
          {limitReached && " — Come back tomorrow!"}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">

          {/* ── IDLE: Show Start button ── */}
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full"
            >
              <div className="glass-card rounded-[2rem] p-8 text-center border-t border-white/10">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${limitReached ? "bg-red-500/10" : "bg-primary/10"}`}>
                  {limitReached
                    ? <Lock className="w-10 h-10 text-red-400" />
                    : <Play className="w-10 h-10 text-primary ml-2" />
                  }
                </div>

                {limitReached ? (
                  <>
                    <h2 className="text-xl font-semibold mb-2 text-red-400">Daily Limit Reached</h2>
                    <p className="text-muted-foreground text-sm px-4">
                      You've watched {DAILY_LIMIT} ads today. Come back tomorrow to earn more coins!
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-2">Ready to watch?</h2>
                    <p className="text-muted-foreground mb-8 text-sm px-4">
                      Watch a short 15-second sponsor video to earn 5–10 coins instantly.
                    </p>
                    <button
                      onClick={handleStartVideo}
                      data-testid="button-start-video"
                      className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                      Start Video
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── WATCHING: 15-second countdown ── */}
          {status === "watching" && (
            <motion.div
              key="watching"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="text-center"
            >
              <div className="relative w-52 h-52 mx-auto mb-6">
                {/* Inner card */}
                <div className="absolute inset-0 bg-secondary rounded-3xl border border-white/5 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    <span className="text-xs tracking-widest uppercase font-semibold text-muted-foreground">Sponsor Ad</span>
                  </div>
                </div>

                {/* Circular progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle cx="104" cy="104" r="98" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                  <motion.circle
                    cx="104" cy="104" r="98"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={{ pathLength: 1 }}
                    animate={{ pathLength: ringProgress }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>

                {/* Countdown number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display font-bold text-5xl text-white drop-shadow-md">
                    {timeLeft}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground text-sm animate-pulse mb-2">
                Stay on this page to earn your reward...
              </p>
              <p className="text-xs text-muted-foreground/60">Do not refresh or navigate away</p>
            </motion.div>
          )}

          {/* ── REWARDING: API call in flight ── */}
          {status === "rewarding" && (
            <motion.div
              key="rewarding"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="text-center"
            >
              <div className="glass-card rounded-[2rem] p-10 border-t border-white/10 flex flex-col items-center">
                <Loader2 className="w-14 h-14 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-1">Claiming Reward</h2>
                <p className="text-muted-foreground text-sm">Adding coins to your balance...</p>
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-center"
            >
              <div className="glass-card rounded-[2rem] p-8 border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-1">Reward Claimed!</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Ads watched today: {adsWatched} / {DAILY_LIMIT}
                </p>
                <div className="text-6xl font-display font-bold text-emerald-400 my-4">
                  +{earned}
                </div>
                <p className="text-muted-foreground mb-8 text-sm">Coins added to your balance.</p>

                {adsWatched >= DAILY_LIMIT ? (
                  <div className="w-full py-4 rounded-2xl bg-secondary/60 text-muted-foreground font-semibold text-center">
                    Daily limit reached — see you tomorrow!
                  </div>
                ) : (
                  <button
                    onClick={handleWatchAnother}
                    data-testid="button-watch-another"
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold active:scale-95 transition-all"
                  >
                    Watch Another ({DAILY_LIMIT - adsWatched} left)
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-center"
            >
              <div className="glass-card rounded-[2rem] p-8 border border-red-500/20">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Oops!</h2>
                <p className="text-muted-foreground mb-8">
                  {limitReached
                    ? "Daily limit reached. Come back tomorrow."
                    : reward.error?.message || "Failed to claim reward. Please try again."}
                </p>
                <button
                  onClick={handleWatchAnother}
                  data-testid="button-go-back"
                  className="w-full py-4 rounded-2xl bg-secondary text-white font-semibold active:scale-95 transition-all"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
