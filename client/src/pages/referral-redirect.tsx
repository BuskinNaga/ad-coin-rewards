import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function ReferralRedirect() {
  const params = useParams<{ userId: string }>();
  const [, navigate] = useLocation();

  useEffect(() => {
    const userId = params.userId;
    if (userId) {
      localStorage.setItem("felix_referral", userId.toUpperCase().trim());
    }
    navigate("/register", { replace: true });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
