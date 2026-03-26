import { useStore } from '@/hooks/use-store';
import Onboarding from '@/components/Onboarding';
import AppLayout from '@/components/AceternitySidebar';
import { useLocation } from 'react-router-dom';
import VisaoGeral from './VisaoGeral';
import Movimentacoes from './Movimentacoes';
import Custos from './Custos';
import Desempenho from './Desempenho';
import Configuracoes from './Configuracoes';

export default function Index() {
  const state = useStore();
  const location = useLocation();

  if (!state.businessType) {
    return <Onboarding />;
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
