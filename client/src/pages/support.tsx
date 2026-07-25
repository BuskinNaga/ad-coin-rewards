import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, MessageCircle, ExternalLink, Bell, Users, Megaphone } from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "Announcements",
    description: "Stay informed with the latest Felix Network updates and news.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with other Felix Network users and share tips.",
  },
  {
    icon: Megaphone,
    title: "Updates",
    description: "Get notified about new features, rewards, and improvements.",
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-xl mx-auto p-4 pt-12 pb-28 min-h-screen">
      {/* Back */}
      <Link href="/dashboard">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">Back to Dashboard</span>
        </button>
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-500 p-8 mb-8 shadow-xl shadow-blue-500/20"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
            Contact Support
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Need help? Our official Telegram support channel is the fastest way to
            get assistance from our team and community.
          </p>
        </div>
      </motion.div>

      {/* Channel features */}
      <div className="space-y-3 mb-8">
        {features.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 rounded-2xl flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-3xl text-center"
      >
        <h2 className="text-lg font-display font-bold text-foreground mb-2">
          Join our Support Channel
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Join our official Telegram support channel for announcements, updates,
          and community assistance.
        </p>
        <a
          href="https://t.me/CashFlowRewardsHub"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="button-join-support"
          className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all"
        >
          <ExternalLink className="w-5 h-5" />
          Join Support Channel
        </a>
        <p className="text-xs text-muted-foreground mt-3">Opens Telegram → @CashFlowRewardsHub</p>
      </motion.div>
    </div>
  );
}
