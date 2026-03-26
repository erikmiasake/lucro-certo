import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Auth from "./pages/Auth.tsx";
import Welcome from "./pages/Welcome.tsx";
import VerifyEmail from "./pages/VerifyEmail.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import Summary from "./pages/Summary.tsx";
import Processing from "./pages/Processing.tsx";
import Index from "./pages/Index.tsx";
import ComoFunciona from "./pages/ComoFunciona.tsx";
import NotFound from "./pages/NotFound.tsx";
import GenerativeArtDemo from "./pages/GenerativeArtDemo.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import AuthGuard from "./components/auth/AuthGuard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/generative-art-demo" element={<GenerativeArtDemo />} />

          {/* Protected routes */}
          <Route path="/welcome" element={<AuthGuard><Welcome /></AuthGuard>} />
          <Route path="/onboarding" element={<AuthGuard><OnboardingPage /></AuthGuard>} />
          <Route path="/summary" element={<AuthGuard><Summary /></AuthGuard>} />
          <Route path="/processing" element={<AuthGuard><Processing /></AuthGuard>} />
          <Route path="/dashboard/*" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/movimentacoes" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/custos" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/desempenho" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/configuracoes" element={<AuthGuard><Index /></AuthGuard>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
