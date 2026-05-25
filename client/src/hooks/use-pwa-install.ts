import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Store deferred prompt globally — survives component unmounts and banner dismissal
let _deferred: BeforeInstallPromptEvent | null = null;
const _subs: Array<(p: BeforeInstallPromptEvent | null) => void> = [];

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    _deferred = e as BeforeInstallPromptEvent;
    _subs.forEach((fn) => fn(_deferred));
  });
}

export function detectPlatform(): "ios" | "android" | "other" {
  if (typeof window === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

export function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function usePWAInstall() {
  const [prompt, setPrompt]         = useState<BeforeInstallPromptEvent | null>(_deferred);
  const [isInstalled, setInstalled] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) setInstalled(true);

    const onInstalled = () => {
      setInstalled(true);
      _deferred = null;
      setPrompt(null);
    };

    const sub = (p: BeforeInstallPromptEvent | null) => setPrompt(p);
    _subs.push(sub);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      const i = _subs.indexOf(sub);
      if (i > -1) _subs.splice(i, 1);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!_deferred) return false;
    try {
      await _deferred.prompt();
      const { outcome } = await _deferred.userChoice;
      if (outcome === "accepted") {
        _deferred = null;
        setPrompt(null);
      }
      return outcome === "accepted";
    } catch {
      return false;
    }
  };

  return {
    hasNativePrompt: !!prompt,       // Android Chrome — real install prompt available
    isInstallable:   !!prompt && !isInstalled,
    isInstalled,
    platform: detectPlatform(),
    promptInstall,
  };
}
