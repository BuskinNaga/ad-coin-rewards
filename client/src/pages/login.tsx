import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Coins, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6 rotate-12">
            <Coins className="w-8 h-8 text-white -rotate-12" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gradient-primary">CashFlow</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Ready to earn?</p>
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full mt-6 group px-6 py-4 rounded-2xl font-semibold bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {login.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:text-emerald-400 transition-colors">
              Create one now
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
