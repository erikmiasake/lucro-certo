import { useStore } from '@/hooks/use-store';
import AppLayout from '@/components/AceternitySidebar';
import { useLocation, Navigate } from 'react-router-dom';
import VisaoGeral from './VisaoGeral';
import Movimentacoes from './Movimentacoes';
import Custos from './Custos';
import Desempenho from './Desempenho';
import Configuracoes from './Configuracoes';
import Relatorio from './Relatorio';

export default function Index() {
  const state = useStore();
  const location = useLocation();

  if (!state.onboardingComplete) {
    return <Navigate to="/welcome" replace />;
  }

  const renderPage = () => {
    const path = location.pathname;
    if (path === '/movimentacoes' || path === '/dashboard/movimentacoes') return <Movimentacoes />;
    if (path === '/custos' || path === '/dashboard/custos') return <Custos />;
    if (path === '/desempenho' || path === '/dashboard/desempenho') return <Desempenho />;
    if (path === '/configuracoes' || path === '/dashboard/configuracoes') return <Configuracoes />;
    if (path === '/relatorio' || path === '/dashboard/relatorio') return <Relatorio />;
    return <VisaoGeral />;
  };

  return (
    <AppLayout>
      {renderPage()}
    </AppLayout>
  );
}
  const state = useStore();
  const location = useLocation();

  // Guard: redirect to onboarding if not complete
  if (!state.onboardingComplete) {
    return <Navigate to="/welcome" replace />;
  }

  const renderPage = () => {
    const path = location.pathname;
    if (path === '/movimentacoes' || path === '/dashboard/movimentacoes') return <Movimentacoes />;
    if (path === '/custos' || path === '/dashboard/custos') return <Custos />;
    if (path === '/desempenho' || path === '/dashboard/desempenho') return <Desempenho />;
    if (path === '/configuracoes' || path === '/dashboard/configuracoes') return <Configuracoes />;
    return <VisaoGeral />;
  };

  return (
    <AppLayout>
      {renderPage()}
    </AppLayout>
  );
}
