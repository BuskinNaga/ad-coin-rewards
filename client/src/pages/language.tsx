import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Globe, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧", available: true },
  { code: "es", label: "Spanish", native: "Español", flag: "🇪🇸", available: false },
  { code: "fr", label: "French", native: "Français", flag: "🇫🇷", available: false },
  { code: "de", label: "German", native: "Deutsch", flag: "🇩🇪", available: false },
  { code: "pt", label: "Portuguese", native: "Português", flag: "🇵🇹", available: false },
  { code: "ar", label: "Arabic", native: "العربية", flag: "🇸🇦", available: false },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳", available: false },
  { code: "zh", label: "Chinese", native: "中文", flag: "🇨🇳", available: false },
];

export default function LanguagePage() {
  const [selected, setSelected] = useState("en");
  const { toast } = useToast();

  function handleSelect(code: string, available: boolean) {
    if (!available) {
      toast({ title: "Coming Soon", description: "This language will be available in a future update." });
      return;
    }
    setSelected(code);
    toast({ title: "Language updated", description: "English is set as your display language." });
  }

  return (
    <div className="max-w-xl mx-auto p-4 pt-12 pb-28 min-h-screen">
      {/* Back */}
      <Link href="/dashboard">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">Back to Dashboard</span>
        </button>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <Globe className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Language</h1>
          <p className="text-xs text-muted-foreground">Select your preferred display language</p>
        </div>
      </div>

      {/* Language list */}
      <div className="space-y-2">
        {languages.map((lang, i) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleSelect(lang.code, lang.available)}
            data-testid={`button-language-${lang.code}`}
            className={`w-full glass-card p-4 rounded-2xl flex items-center gap-4 text-left transition-all ${
              lang.available
                ? "hover:bg-primary/5 active:scale-[0.98] cursor-pointer"
                : "opacity-50 cursor-default"
            } ${selected === lang.code ? "ring-2 ring-primary/50" : ""}`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{lang.label}</p>
              <p className="text-xs text-muted-foreground">{lang.native}</p>
            </div>
            {selected === lang.code ? (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            ) : !lang.available ? (
              <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-400/20 rounded-full px-2 py-0.5 flex-shrink-0">
                Soon
              </span>
            ) : null}
          </motion.button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        More languages coming soon. Want your language added?{" "}
        <a
          href="https://t.me/CashFlowRewardsHub"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Let us know
        </a>
      </p>
    </div>
  );
}
