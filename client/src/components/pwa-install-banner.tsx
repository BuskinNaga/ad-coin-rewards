import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Share2, Plus, ArrowUp } from "lucide-react";
import { usePWAInstall, isInStandaloneMode } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "cf-pwa-banner-v2";

// ── iOS "Add to Home Screen" guide modal ─────────────────────────────────────

function IOSGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm glass-card rounded-3xl p-6 border border-primary/20 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/30">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-base">Install CashFlow</p>
            <p className="text-xs text-muted-foreground">Add to your home screen</p>
          </div>
        </div>

        <div className="space-y-3">
          <Step number={1} icon={<ArrowUp className="w-4 h-4" />}>
            Tap the <strong>Share</strong> button{" "}
            <Share2 className="inline w-3.5 h-3.5 mx-0.5 text-primary" /> at the bottom of Safari
          </Step>
          <Step number={2} icon={<Plus className="w-4 h-4" />}>
            Scroll down and tap{" "}
            <strong className="text-foreground">"Add to Home Screen"</strong>
          </Step>
          <Step number={3} icon={<Smartphone className="w-4 h-4" />}>
            Tap <strong className="text-foreground">"Add"</strong> — CashFlow will appear on your home screen
          </Step>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-4 leading-relaxed">
          Open Safari on your iPhone or iPad to use this feature
        </p>
      </motion.div>
    </motion.div>
  );
}

function Step({ number, icon, children }: { number: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{children}</p>
    </div>
  );
}

// ── Auto-popup banner (appears after 4s on first visit) ──────────────────────

export function PWAInstallBanner() {
  const { isInstallable, hasNativePrompt, platform, promptInstall, isInstalled } = usePWAInstall();
  const [visible, setVisible]         = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const isIOS = platform === "ios";
  const showable = (isInstallable || isIOS) && !isInstalled && !isInStandaloneMode();

  useEffect(() => {
    if (!showable) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [showable]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      setVisible(false);
    } else {
      await promptInstall();
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
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
            <div className="glass-card rounded-3xl p-4 border border-primary/25 shadow-2xl shadow-black/40 backdrop-blur-xl flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">Install CashFlow</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
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
                  data-testid="button-pwa-dismiss"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIOSGuide && <IOSGuideModal onClose={() => setShowIOSGuide(false)} />}
      </AnimatePresence>
    </>
  );
}

// ── "Download App" menu item — always visible, never hidden ──────────────────

export function DownloadAppItem({ onAction }: { onAction?: () => void }) {
  const { isInstallable, hasNativePrompt, platform, promptInstall, isInstalled } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const isIOS = platform === "ios";
  const alreadyInstalled = isInstalled || isInStandaloneMode();

  const handleClick = async () => {
    onAction?.();
    if (alreadyInstalled) return;
    if (hasNativePrompt) {
      await promptInstall();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Desktop or unsupported — clear the dismissed flag so banner shows again
      localStorage.removeItem(DISMISSED_KEY);
      window.dispatchEvent(new Event("cf-show-install-banner"));
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        data-testid="menu-install-app"
        className="w-full flex items-center gap-3 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Download className={`w-4 h-4 ${alreadyInstalled ? "text-emerald-400" : "text-primary"}`} />
        {alreadyInstalled ? (
          <span className="text-emerald-400 font-medium">App Installed ✓</span>
        ) : (
          <span>Download App</span>
        )}
      </button>

      <AnimatePresence>
        {showIOSGuide && <IOSGuideModal onClose={() => setShowIOSGuide(false)} />}
      </AnimatePresence>
    </>
  );
}
