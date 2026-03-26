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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/dashboard/*" element={<Index />} />
          <Route path="/movimentacoes" element={<Index />} />
          <Route path="/custos" element={<Index />} />
          <Route path="/desempenho" element={<Index />} />
          <Route path="/configuracoes" element={<Index />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/generative-art-demo" element={<GenerativeArtDemo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
