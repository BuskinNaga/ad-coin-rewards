import { useHistory } from "@/hooks/use-history";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { History as HistoryIcon, PlusCircle, ArrowDownLeft } from "lucide-react";

export default function HistoryPage() {
  const { data: history, isLoading } = useHistory();

  return (
    <div className="max-w-xl mx-auto p-4 pt-12 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <HistoryIcon className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold">Earning History</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !history || history.length === 0 ? (
        <div className="text-center mt-20 p-8 glass-card rounded-3xl">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <HistoryIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No History Yet</h3>
          <p className="text-muted-foreground text-sm">Start watching ads to see your earnings here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.id}
              className="glass-card p-4 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white capitalize">{item.type} Reward</h4>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.date), "MMM d, yyyy • h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-accent font-bold">
                <PlusCircle className="w-4 h-4" />
                {item.coinsEarned}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
