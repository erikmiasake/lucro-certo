import { useNavigate, Navigate } from 'react-router-dom';
import HeroScreen from '@/components/HeroScreen';
import { useStore } from '@/hooks/use-store';

export default function Welcome() {
  const navigate = useNavigate();
  const state = useStore();

  if (state.onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <HeroScreen
        onStart={() => navigate('/onboarding')}
        onLearnMore={() => navigate('/como-funciona')}
      />
    </div>
  );
}
