import { useState } from "react";
import { useRegister } from "@/hooks/use-auth";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Coins, Loader2, UserPlus } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ username, email, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-accent to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30 mb-6 -rotate-12">
            <Coins className="w-8 h-8 text-white rotate-12" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Join CashFlow</h1>
          <p className="text-muted-foreground mt-2">Start earning coins today.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-3xl w-full">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-black/20 border border-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="Choose a cool username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-black/20 border border-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-black/20 border border-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="Create a strong password"
              />
            </div>

            <button
              type="submit"
              disabled={register.isPending}
              className="w-full mt-6 group px-6 py-4 rounded-2xl font-semibold bg-gradient-to-r from-accent to-orange-500 text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {register.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-semibold hover:text-amber-400 transition-colors">
              Sign In
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
