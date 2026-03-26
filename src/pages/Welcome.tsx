import { useNavigate } from 'react-router-dom';
import HeroScreen from '@/components/HeroScreen';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <HeroScreen
        onStart={() => navigate('/onboarding')}
        onLearnMore={() => navigate('/como-funciona')}
      />
    </div>
  );
}
