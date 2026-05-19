import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthGuard from "./components/auth/AuthGuard.tsx";

// Eagerly load only the entry point (Landing)
import Landing from "./pages/Landing.tsx";

// Lazy load everything else — massive initial bundle reduction (esp. on mobile)
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Welcome = lazy(() => import("./pages/Welcome.tsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.tsx"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage.tsx"));
const Summary = lazy(() => import("./pages/Summary.tsx"));
const Processing = lazy(() => import("./pages/Processing.tsx"));
const Tutorial = lazy(() => import("./pages/Tutorial.tsx"));
const Index = lazy(() => import("./pages/Index.tsx"));
const ComoFunciona = lazy(() => import("./pages/ComoFunciona.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));

const queryClient = new QueryClient();

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
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />

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
            <Route path="/impostos" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/relatorio" element={<AuthGuard><Index /></AuthGuard>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
