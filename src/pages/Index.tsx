import { Suspense } from 'react';
import { useStore } from '@/hooks/use-store';
import { lazyWithRetry } from '@/lib/lazy-retry';
import AppLayout from '@/components/AceternitySidebar';
import { useLocation, Navigate } from 'react-router-dom';
import VisaoGeral from './VisaoGeral';
import { hasSeenTutorial } from './Tutorial';

// Lazy-load heavy sub-pages so the dashboard entry only pays for VisaoGeral.
// Movimentacoes + Custos pull in recharts; Relatorio pulls in jspdf/html2canvas.
const Movimentacoes = lazyWithRetry(() => import('./Movimentacoes'));
const Custos = lazyWithRetry(() => import('./Custos'));
const Desempenho = lazyWithRetry(() => import('./Desempenho'));
const Configuracoes = lazyWithRetry(() => import('./Configuracoes'));
// const Relatorio = lazyWithRetry(() => import('./Relatorio'));
// const Impostos = lazyWithRetry(() => import('./Impostos'));


const PageFallback = () => (
  <div className="min-h-[60vh] w-full flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

export default function Index() {
  const state = useStore();
  const location = useLocation();

  if (!state.onboardingComplete) {
    return <Navigate to="/welcome" replace />;
  }

  if (!hasSeenTutorial(state.businessType)) {
    return <Navigate to="/tutorial" replace />;
  }

  const renderPage = () => {
    const path = location.pathname;
    if (path === '/movimentacoes' || path === '/dashboard/movimentacoes') return <Movimentacoes />;
    if (path === '/custos' || path === '/dashboard/custos') return <Custos />;
    
    if (path === '/desempenho' || path === '/dashboard/desempenho') return <Desempenho />;
    if (path === '/configuracoes' || path === '/dashboard/configuracoes') return <Configuracoes />;
    // if (path === '/relatorio' || path === '/dashboard/relatorio') return <Relatorio />;
    // if (path === '/impostos' || path === '/dashboard/impostos') return <Impostos />;
    return <VisaoGeral />;
  };

  return (
    <AppLayout>
      <Suspense fallback={<PageFallback />}>
        {renderPage()}
      </Suspense>
    </AppLayout>
  );
}
