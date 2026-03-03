import { Link, useLocation } from "wouter";
import { Home, PlaySquare, History, Wallet, Users } from "lucide-react";
import { motion } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/watch", icon: PlaySquare, label: "Watch" },
    { href: "/withdraw", icon: Wallet, label: "Wallet" },
    { href: "/history", icon: History, label: "History" },
    { href: "/referral", icon: Users, label: "Referrals" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 md:pb-4 md:px-6 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto">
        <div className="glass-card rounded-3xl flex items-center justify-between px-2 py-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/20 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon 
                  className={`w-6 h-6 relative z-10 transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`} 
                />
                <span 
                  className={`text-[10px] mt-1 font-medium relative z-10 transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
