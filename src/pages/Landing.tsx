import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CinematicHero } from '@/components/ui/cinematic-landing-hero';
import { LandingNarrative } from '@/components/LandingNarrative';
import { LandingHeader } from '@/components/LandingHeader';
import AuthOverlay from '@/components/auth/AuthOverlay';
import TransitionScreen from '@/components/auth/TransitionScreen';

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCtaClick = () => {
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthOpen(false);
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    navigate('/');
  };

  return (
    <div className="bg-background relative">
      <LandingHeader onCtaClick={handleCtaClick} />
      <CinematicHero onCtaClick={handleCtaClick} />
      <LandingNarrative onCtaClick={handleCtaClick} />

      <AuthOverlay
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {isTransitioning && (
        <TransitionScreen onComplete={handleTransitionComplete} />
      )}
    </div>
  );
}
