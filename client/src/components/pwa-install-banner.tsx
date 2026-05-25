import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "cf-pwa-banner-v1";

export function PWAInstallBanner() {
  const { isInstallable, promptInstall } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isInstallable) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;
    // Show after 4 s so page is fully loaded
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [isInstallable]);

  const handleInstall = async () => {
    await promptInstall();
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-5 left-3 right-3 z-50 max-w-sm mx-auto"
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
  );
}

// Standalone trigger button — used in menus / settings
export function InstallAppButton({ className = "" }: { className?: string }) {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  if (isInstalled) {
    return (
      <span className={`flex items-center gap-2 text-sm text-emerald-400 ${className}`}>
        <Download className="w-4 h-4" />
        App Installed ✓
      </span>
    );
  }

  if (!isInstallable) return null;

  return (
    <button
      onClick={promptInstall}
      data-testid="button-install-app"
      className={`flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors ${className}`}
    >
      <Download className="w-4 h-4" />
      Download App
    </button>
  );
}
