import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazyWithRetry } from "@/lib/lazy-retry";
import AuthGuard from "./components/auth/AuthGuard.tsx";


// Lazy load everything else — massive initial bundle reduction (esp. on mobile)
const Auth = lazyWithRetry(() => import("./pages/Auth.tsx"));
const Welcome = lazyWithRetry(() => import("./pages/Welcome.tsx"));
const VerifyEmail = lazyWithRetry(() => import("./pages/VerifyEmail.tsx"));
const OnboardingPage = lazyWithRetry(() => import("./pages/OnboardingPage.tsx"));
const Summary = lazyWithRetry(() => import("./pages/Summary.tsx"));
const Processing = lazyWithRetry(() => import("./pages/Processing.tsx"));
const Tutorial = lazyWithRetry(() => import("./pages/Tutorial.tsx"));
const Index = lazyWithRetry(() => import("./pages/Index.tsx"));

const NotFound = lazyWithRetry(() => import("./pages/NotFound.tsx"));

const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword.tsx"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 min before marking stale — cuts repeated network
      // fetches when navigating between tabs on mobile.
      staleTime: 5 * 60 * 1000,
      // Keep unused data in memory for 10 min (avoids re-fetching on back-nav).
      gcTime: 10 * 60 * 1000,
      // Single retry on failure is enough; 3 retries block the UI too long on
      // a slow mobile connection.
      retry: 1,
      // Don't refetch just because the user switches browser tabs.
      refetchOnWindowFocus: false,
      // Do refetch when the device reconnects (important for offline-then-back).
      refetchOnReconnect: "always",
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen w-full bg-background flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />


            {/* Protected routes */}
            <Route path="/welcome" element={<AuthGuard><Welcome /></AuthGuard>} />
            <Route path="/onboarding" element={<AuthGuard><OnboardingPage /></AuthGuard>} />
            <Route path="/summary" element={<AuthGuard><Summary /></AuthGuard>} />
            <Route path="/processing" element={<AuthGuard><Processing /></AuthGuard>} />
            <Route path="/tutorial" element={<AuthGuard><Tutorial /></AuthGuard>} />
            <Route path="/dashboard/*" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/movimentacoes" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/custos" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/desempenho" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/configuracoes" element={<AuthGuard><Index /></AuthGuard>} />


            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
