import { useStore } from '@/hooks/use-store';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';

export default function Index() {
  const state = useStore();

  if (!state.businessType) {
    return <Onboarding />;
  }

  return <Dashboard />;
}
