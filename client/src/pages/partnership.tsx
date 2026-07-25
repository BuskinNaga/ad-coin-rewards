import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Megaphone, Handshake, Users, Share2, BadgePercent, ExternalLink } from "lucide-react";

const opportunities = [
  {
    icon: Megaphone,
    title: "Advertising Opportunities",
    description:
      "Reach an engaged audience of active users who watch ads and interact with content daily. We offer targeted ad placements within our rewards ecosystem.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Handshake,
    title: "Strategic Partnerships",
    description:
      "Collaborate with Felix Network to co-develop features, integrations, or joint campaigns that benefit both platforms and their communities.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Users,
    title: "Community Collaborations",
    description:
      "Partner with us to engage our growing community through challenges, events, giveaways, or exclusive in-app promotions.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: BadgePercent,
    title: "Affiliate Partnerships",
    description:
      "Join our affiliate programme and earn commissions by promoting Felix Network. Ideal for influencers, content creators, and marketers.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Share2,
    title: "Brand Promotions",
    description:
      "Boost your brand visibility inside Felix Network with sponsored content, featured placements, and co-branded reward campaigns.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
];

export default function PartnershipPage() {
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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-700 p-8 mb-8 shadow-xl shadow-primary/20"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Handshake className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
            Partnership &amp; Advertising
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Grow with Felix Network. We welcome advertisers, partners, and collaborators
            who share our vision of rewarding users for their time and attention.
          </p>
        </div>
      </motion.div>

      {/* Opportunities */}
      <div className="space-y-4 mb-8">
        {opportunities.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-5 rounded-2xl flex gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 rounded-3xl text-center"
      >
        <h2 className="text-lg font-display font-bold text-foreground mb-2">Ready to partner with us?</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Reach out to our business team on Telegram. We respond promptly to all
          serious enquiries.
        </p>
        <a
          href="https://t.me/FelixNetworkBusiness"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="button-business-enquiry"
          className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all"
        >
          <ExternalLink className="w-5 h-5" />
          Business Enquiries
        </a>
        <p className="text-xs text-muted-foreground mt-3">Opens Telegram → @FelixNetworkBusiness</p>
      </motion.div>
    </div>
  );
}
