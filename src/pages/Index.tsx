import { useStore } from '@/hooks/use-store';
import Onboarding from '@/components/Onboarding';
import AppLayout from '@/components/AceternitySidebar';
import { Routes, Route } from 'react-router-dom';
import VisaoGeral from './VisaoGeral';
import Movimentacoes from './Movimentacoes';
import Custos from './Custos';
import Desempenho from './Desempenho';
import Configuracoes from './Configuracoes';

export default function Index() {
  const state = useStore();

  if (!state.businessType) {
    return <Onboarding />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route index element={<VisaoGeral />} />
        <Route path="movimentacoes" element={<Movimentacoes />} />
        <Route path="custos" element={<Custos />} />
        <Route path="desempenho" element={<Desempenho />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Routes>
    </AppLayout>
  );
}
