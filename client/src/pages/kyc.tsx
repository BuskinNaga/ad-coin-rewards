import { motion } from "framer-motion";
import { ShieldCheck, Clock, FileText, Camera, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Provide ID Document",
    desc: "Upload a government-issued ID such as a passport, national ID card, or driver's license.",
  },
  {
    icon: Camera,
    title: "Selfie Verification",
    desc: "Take a selfie holding your ID to confirm you are the account owner.",
  },
  {
    icon: CheckCircle2,
    title: "Review & Approval",
    desc: "Our team reviews your submission. Approval typically takes 24-48 hours.",
  },
];

export default function KYCPage() {
  return (
    <div className="max-w-xl mx-auto p-4 pt-10 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">KYC Verification</h1>
        <p className="text-muted-foreground text-sm px-4">
          Identity verification to protect your earnings and enable withdrawals.
        </p>
      </motion.div>

      {/* Coming soon banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-6 mb-6 border border-blue-500/20 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <Clock className="w-3.5 h-3.5" />
            Coming Soon
          </div>
          <h2 className="font-display font-bold text-lg mb-2">Not Available Yet</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            KYC verification will be required before withdrawals are enabled. We are working on
            building a fast, secure, and user-friendly verification process. Stay tuned for the
            official launch announcement.
          </p>
        </div>
      </motion.div>

      {/* Why KYC */}
      <div className="glass-card rounded-3xl p-6 mb-6">
        <h3 className="font-display font-bold text-base mb-3">Why is KYC required?</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          KYC (Know Your Customer) is a standard compliance requirement for any platform that
          handles real money or cryptocurrency payouts. It protects legitimate users from fraud,
          ensures every withdrawal goes to a verified account, and keeps the CashFlow platform
          sustainable and trustworthy for everyone.
        </p>
      </div>

      {/* Process steps */}
      <div className="mb-6">
        <h3 className="font-display font-bold text-base mb-3 ml-1">How the process will work</h3>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="glass-card rounded-2xl p-4 flex items-start gap-4 opacity-60"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-400">
                <step.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5">
                  Step {i + 1}: {step.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Notify CTA placeholder */}
      <div className="glass-card rounded-3xl p-5 text-center border border-white/5">
        <p className="text-sm text-muted-foreground">
          Keep earning coins now — your balance will be ready when withdrawals go live.
        </p>
      </div>
    </div>
  );
}
