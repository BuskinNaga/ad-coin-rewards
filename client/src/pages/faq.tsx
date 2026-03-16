import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "How does Watch & Earn work?",
    a: "Click the 'Start Video' button on the Watch & Earn page. An ad will open in a new tab and a 15-second timer will begin on your screen. Stay on the Watch page until the timer finishes and you will receive coins automatically.",
  },
  {
    q: "How do I receive coins?",
    a: "Coins are added to your account automatically as soon as the 15-second timer completes. You will see a 'Reward Claimed!' screen with the exact number of coins earned (between 5 and 10 coins per ad). Your balance on the Dashboard updates instantly.",
  },
  {
    q: "What is the daily limit?",
    a: "You can watch up to 50 ads per day. The counter resets every day at midnight. When you reach 50/50 the Start Video button becomes disabled and will show 'Daily limit reached — Come back tomorrow!'",
  },
  {
    q: "How can I withdraw coins?",
    a: "Withdrawals are coming soon. Once live, you will be able to convert your coins to USDT at a rate of 1000 coins = 1 USDT. Visit the Withdraw page for the latest status and to see your current progress toward the withdrawal goal.",
  },
  {
    q: "What happens if I refresh the page during a watch?",
    a: "If you refresh or navigate away before the 15-second timer finishes, the session is cancelled and no coins will be awarded. The ad will still open in the new tab, but you need to keep the CashFlow Watch page open for the full 15 seconds to earn.",
  },
  {
    q: "How does the Referral program work?",
    a: "The Referral program is currently under development. Soon you will be able to share your unique referral link and earn bonus coins every time a friend signs up and watches their first ad.",
  },
  {
    q: "What is KYC and why is it required?",
    a: "KYC (Know Your Customer) is an identity verification process that ensures only real users can withdraw funds. It protects the platform from fraud. KYC verification will be required before your first withdrawal and is coming soon.",
  },
  {
    q: "How many coins do I earn per ad?",
    a: "Each ad rewards you with a random amount between 5 and 10 coins. The exact amount is determined randomly at the moment the reward is claimed and cannot be predicted or influenced.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 text-left gap-4"
        data-testid={`faq-toggle-${q.slice(0, 20).replace(/\s/g, "-")}`}
      >
        <span className="font-semibold text-sm leading-snug">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-primary"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="max-w-xl mx-auto p-4 pt-10 pb-32">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">❓</span>
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">FAQs</h1>
        <p className="text-muted-foreground text-sm">
          Everything you need to know about CashFlow
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((item) => (
          <FAQItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
