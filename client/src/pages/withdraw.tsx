import { Wallet, Construction } from "lucide-react";

export default function WithdrawPage() {
  return (
    <div className="max-w-md mx-auto p-4 pt-12 min-h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto">
          <Wallet className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-background">
          <Construction className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
      
      <h1 className="text-3xl font-display font-bold mb-4">Coming Soon</h1>
      
      <div className="glass-card p-6 rounded-2xl max-w-sm">
        <p className="text-lg text-white font-medium leading-relaxed">
          Withdrawals are coming soon. We are working on secure payout integration.
        </p>
      </div>
    </div>
  );
}
