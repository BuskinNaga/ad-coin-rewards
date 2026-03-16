import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import WatchPage from "./pages/watch";
import HistoryPage from "./pages/history";
import WithdrawPage from "./pages/withdraw";
import ReferralPage from "./pages/referral";
import FAQPage from "./pages/faq";
import WhitepaperPage from "./pages/whitepaper";
import KYCPage from "./pages/kyc";
import { AuthGuard } from "./components/layout/auth-guard";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/">
        <AuthGuard><Dashboard /></AuthGuard>
      </Route>
      <Route path="/watch">
        <AuthGuard><WatchPage /></AuthGuard>
      </Route>
      <Route path="/history">
        <AuthGuard><HistoryPage /></AuthGuard>
      </Route>
      <Route path="/withdraw">
        <AuthGuard><WithdrawPage /></AuthGuard>
      </Route>
      <Route path="/referral">
        <AuthGuard><ReferralPage /></AuthGuard>
      </Route>
      <Route path="/faq">
        <AuthGuard><FAQPage /></AuthGuard>
      </Route>
      <Route path="/whitepaper">
        <AuthGuard><WhitepaperPage /></AuthGuard>
      </Route>
      <Route path="/kyc">
        <AuthGuard><KYCPage /></AuthGuard>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
