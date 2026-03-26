import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/hooks/use-store';
import OnboardingConfirmation from '@/components/OnboardingConfirmation';
import { useEffect } from 'react';

export default function Summary() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useStore();

  const routeState = location.state as {
    businessType?: string;
    avgSales?: string;
    selectedCosts?: string[];
  } | null;

  const businessType = state.businessType;
  const avgSales = routeState?.avgSales || '';
  const selectedCosts = routeState?.selectedCosts || state.mainCosts || [];

  useEffect(() => {
    if (!businessType) {
      navigate('/onboarding', { replace: true });
    }
  }, [businessType, navigate]);

  if (!businessType) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center safe-bottom relative overflow-hidden">
      <OnboardingConfirmation
        businessType={businessType}
        avgSales={avgSales}
        selectedCosts={selectedCosts}
        onEnter={() => navigate('/processing')}
      />
    </div>
  );
}
