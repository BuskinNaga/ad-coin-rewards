import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { PlaySquare, Gift, Smartphone, Users, ChevronRight, Star, Zap, Shield, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-auth";

const REFERRAL_REGISTER = "/register?ref=10491592";

export default function Landing() {
  const { data: user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/icon-192.png" alt="Felix Network" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg">Felix Network</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
              Sign In
            </button>
          </Link>
          <Link href={REFERRAL_REGISTER}>
            <button className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-xl font-medium hover:bg-primary/90 transition-colors">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <img src="/icon-192.png" alt="Felix Network logo" className="w-20 h-20 rounded-2xl shadow-lg shadow-primary/20" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
            Felix Network
          </h1>
          <p className="text-xl text-primary font-semibold mb-6 tracking-wide">
            Earn • Grow • Reward
          </p>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Felix Network is a rewards platform where users can participate, complete activities, and earn rewards.
          </p>
          <Link href={REFERRAL_REGISTER}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-lg font-bold px-10 py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
              data-testid="button-get-started-hero"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Free to join. No hidden fees.
          </p>
        </motion.div>
      </section>

      {/* About */}
      <section className="bg-secondary/30 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">About Felix Network</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Felix Network is a growing rewards community. Users create an account, take part in platform activities, and earn coins as rewards. The platform is designed to be simple, accessible, and mobile-friendly — so anyone can participate and benefit from growing with the Felix Network community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground">Three simple steps to get started</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Create an Account",
              desc: "Sign up for free in seconds. No complicated forms — just a username, email, and password.",
              icon: Star,
            },
            {
              step: "02",
              title: "Start Using Felix Network",
              desc: "Explore platform features, watch ads, claim daily rewards, and invite friends to grow together.",
              icon: Zap,
            },
            {
              step: "03",
              title: "Earn Rewards & Grow",
              desc: "Accumulate coins, climb the network ranks, and grow your account as the Felix Network community expands.",
              icon: Shield,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 border border-primary/10"
            >
              <div className="text-4xl font-black text-primary/20 mb-3">{item.step}</div>
              <item.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/30 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">Platform Features</h2>
            <p className="text-muted-foreground">Everything you need in one place</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              {
                icon: PlaySquare,
                title: "Watch Ads & Earn",
                desc: "Complete short ad sessions and earn coins directly to your account.",
              },
              {
                icon: Gift,
                title: "Daily Rewards",
                desc: "Come back every day to claim your daily reward bonus.",
              },
              {
                icon: Smartphone,
                title: "Mobile Friendly",
                desc: "Fast and simple experience optimised for any device.",
              },
              {
                icon: Users,
                title: "Community Growth",
                desc: "Invite friends and earn a share of their rewards — forever.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card rounded-2xl p-5 border border-primary/10 text-center"
              >
                <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join Felix Network?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            🚀 Felix Network is coming soon! Join early and become part of the community. Start mining rewards today.
          </p>
          <Link href={REFERRAL_REGISTER}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-lg font-bold px-10 py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
              data-testid="button-join-felix-network"
            >
              Join Felix Network
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/icon-192.png" alt="Felix Network" className="w-5 h-5 rounded" />
          <span className="font-semibold text-foreground">Felix Network</span>
        </div>
        <p>© {new Date().getFullYear()} Felix Network. All rights reserved.</p>
      </footer>
    </div>
  );
}
