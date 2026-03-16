import { useState, useEffect } from "react";
import { useReward } from "@/hooks/use-ads";
import { useUser } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

const MONETAG_DIRECT_LINK = "https://omg10.com/4/10632799";
const AD_DELAY_SECONDS = 3;
const VIDEO_DURATION_SECONDS = 10;

export default function WatchPage() {
  const { data: user } = useUser();
  const reward = useReward();

  const [status, setStatus] = useState<"idle" | "ad-delay" | "watching" | "success" | "error">("idle");
  const [timeLeft, setTimeLeft] = useState(VIDEO_DURATION_SECONDS);
  const [delayLeft, setDelayLeft] = useState(AD_DELAY_SECONDS);
  const [earned, setEarned] = useState(0);

  // Ad delay countdown before video starts
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "ad-delay" && delayLeft > 0) {
      timer = setInterval(() => {
        setDelayLeft((prev) => prev - 1);
      }, 1000);
    } else if (status === "ad-delay" && delayLeft === 0) {
      setStatus("watching");
      setTimeLeft(VIDEO_DURATION_SECONDS);
    }
    return () => clearInterval(timer);
  }, [status, delayLeft]);

  // Video countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "watching" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (status === "watching" && timeLeft === 0) {
      setStatus("idle");
      handleReward();
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const handleStartVideo = () => {
    if (user && user.dailyAdsWatched >= 50) {
      setStatus("error");
      return;
    }

    // Open Monetag Direct Link ad in a new tab on the exact button click gesture
    window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer");

    // Wait a few seconds then start the video countdown
    setDelayLeft(AD_DELAY_SECONDS);
    setStatus("ad-delay");
  };

  const handleReward = () => {
    reward.mutate(undefined, {
      onSuccess: (data) => {
        setEarned(data.coinsEarned);
        setStatus("success");
        triggerConfetti();
      },
      onError: () => {
        setStatus("error");
      },
    });
  };

  const triggerConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#10b981", "#f59e0b", "#ffffff"] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#10b981", "#f59e0b", "#ffffff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  return (
    <div className="max-w-md mx-auto p-4 pt-12 min-h-[80vh] flex flex-col">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold mb-2">Watch & Earn</h1>
        <p className="text-muted-foreground">
          {user ? `Daily Limit: ${user.dailyAdsWatched} / 50` : "Loading..."}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">

          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full"
            >
              <div className="glass-card rounded-[2rem] p-8 text-center border-t border-white/10">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="w-10 h-10 text-primary ml-2" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Ready to watch?</h2>
                <p className="text-muted-foreground mb-8 text-sm px-4">
                  Watch a short 10-second sponsor video to earn 5 to 10 coins instantly.
                </p>
                <button
                  onClick={handleStartVideo}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  Start Video
                </button>
              </div>
            </motion.div>
          )}

          {status === "ad-delay" && (
            <motion.div
              key="ad-delay"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="glass-card rounded-[2rem] p-8 border-t border-white/10 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-9 h-9 animate-spin text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Ad opened in new tab</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Your video will start in a moment...
                </p>
                <div className="text-5xl font-display font-bold text-primary my-2">
                  {delayLeft}
                </div>
              </div>
            </motion.div>
          )}

          {status === "watching" && (
            <motion.div
              key="watching"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="relative w-48 h-48 mx-auto mb-8">
                <div className="absolute inset-0 bg-secondary rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center">
                  <div className="text-muted-foreground flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                    <span className="text-xs tracking-widest uppercase font-semibold">Sponsor Ad</span>
                  </div>
                </div>

                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle cx="96" cy="96" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <motion.circle
                    cx="96" cy="96" r="90"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 1 }}
                    animate={{ pathLength: timeLeft / VIDEO_DURATION_SECONDS }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-4xl text-white drop-shadow-md">
                  {timeLeft}
                </div>
              </div>
              <p className="text-muted-foreground animate-pulse">Please wait for the reward...</p>
            </motion.div>
          )}

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
                <h2 className="text-2xl font-display font-bold text-white mb-2">Reward Claimed!</h2>
                <div className="text-5xl font-display font-bold text-gradient-gold my-6">
                  +{earned}
                </div>
                <p className="text-muted-foreground mb-8">Coins added to your balance.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="w-full py-4 rounded-2xl bg-secondary text-white font-semibold active:scale-95 transition-all"
                >
                  Watch Another
                </button>
              </div>
            </motion.div>
          )}

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
                  {user && user.dailyAdsWatched >= 50
                    ? "Daily limit reached. Come back tomorrow."
                    : reward.error?.message || "Failed to claim reward. Try again."}
                </p>
                <button
                  onClick={() => setStatus("idle")}
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
