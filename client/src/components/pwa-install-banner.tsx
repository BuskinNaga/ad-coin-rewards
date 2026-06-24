import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Share2, Plus } from "lucide-react";
import { usePWAInstall, isInStandaloneMode } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";

const BANNER_KEY = "cf-pwa-v3";

// ── iOS guide modal — lives at PAGE level so it survives dropdown close ───────

interface InstallGuideProps {
  platform: "ios" | "android" | "other";
  onClose: () => void;
}

export function InstallGuideModal({ platform, onClose }: InstallGuideProps) {
  const isIOS = platform === "ios";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm glass-card rounded-3xl p-6 border border-primary/20 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-secondary/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-base leading-tight">Install Felix Network</p>
              <p className="text-xs text-muted-foreground">
                {isIOS ? "Add to your iPhone/iPad" : "Add to your home screen"}
              </p>
            </div>
          </div>

          {isIOS ? (
            <div className="space-y-3.5">
              <GuideStep number={1} icon={<Share2 className="w-4 h-4" />}>
                Tap the <strong className="text-foreground">Share</strong> button{" "}
                <Share2 className="inline w-3.5 h-3.5 mx-0.5 text-primary" />
                {" "}at the bottom of <strong className="text-foreground">Safari</strong>
              </GuideStep>
              <GuideStep number={2} icon={<Plus className="w-4 h-4" />}>
                Scroll and tap{" "}
                <strong className="text-foreground">"Add to Home Screen"</strong>
              </GuideStep>
              <GuideStep number={3} icon={<Smartphone className="w-4 h-4" />}>
                Tap <strong className="text-foreground">"Add"</strong> — done! Felix Network will appear on your home screen.
              </GuideStep>
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                ⚠️ This only works in Safari on iOS. Not in Chrome or Firefox.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                To install Felix Network on your device:
              </p>
              <GuideStep number={1} icon={<Download className="w-4 h-4" />}>
                Open this page in <strong className="text-foreground">Chrome</strong> on Android
              </GuideStep>
              <GuideStep number={2} icon={<Share2 className="w-4 h-4" />}>
                Tap the <strong className="text-foreground">menu (⋮)</strong> then{" "}
                <strong className="text-foreground">"Add to Home screen"</strong>
              </GuideStep>
              <GuideStep number={3} icon={<Smartphone className="w-4 h-4" />}>
                Tap <strong className="text-foreground">"Add"</strong> to install
              </GuideStep>
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                The install dialog appears automatically when you use Chrome on Android.
              </p>
            </div>
          )}

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full mt-5 rounded-2xl border-primary/25 hover:border-primary/50"
          >
            Got it!
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function GuideStep({ number, icon, children }: { number: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 text-primary mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Step {number}</span>
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// ── Auto-popup banner — shows 4 s after first visit ───────────────────────────

export function PWAInstallBanner() {
  const { isInstallable, platform, promptInstall, isInstalled } = usePWAInstall();
  const [visible, setVisible]             = useState(false);
  const [showGuide, setShowGuide]         = useState(false);

  const isIOS   = platform === "ios";
  const canShow = (isInstallable || isIOS) && !isInstalled && !isInStandaloneMode();

  useEffect(() => {
    if (!canShow) return;
    if (localStorage.getItem(BANNER_KEY)) return;
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [canShow]);

  const handleInstall = async () => {
    setVisible(false);
    if (isIOS) {
      setShowGuide(true);
    } else {
      await promptInstall();
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(BANNER_KEY, "1");
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-5 left-3 right-3 z-40 max-w-sm mx-auto"
          >
            <div className="glass-card rounded-3xl p-4 border border-primary/25 shadow-2xl backdrop-blur-xl flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">Install Felix Network</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Add to home screen for the best experience
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="rounded-xl h-8 px-3 text-xs font-semibold"
                  data-testid="button-pwa-install"
                >
                  Install
                </Button>
                <button
                  onClick={handleDismiss}
                  className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide modal — lives outside the banner so it persists after banner hides */}
      {showGuide && (
        <InstallGuideModal platform={platform} onClose={() => setShowGuide(false)} />
      )}
    </>
  );
}
