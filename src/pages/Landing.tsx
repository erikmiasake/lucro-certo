import { useNavigate } from 'react-router-dom';
import { CinematicHero } from '@/components/ui/cinematic-landing-hero';
import { LandingNarrative } from '@/components/LandingNarrative';
import { LandingHeader } from '@/components/LandingHeader';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-background">
      <LandingHeader />
      <CinematicHero
        onCtaClick={() => navigate('/')}
      />
      <LandingNarrative onCtaClick={() => navigate('/')} />
    </div>
  );
}
