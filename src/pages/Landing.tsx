import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingNarrative } from '@/components/LandingNarrative';
import DashboardShowcase from '@/components/DashboardShowcase';
import { GenerativeArtGallery } from '@/components/ui/generative-art-gallery';
import TransitionScreen from '@/components/auth/TransitionScreen';
import { supabase } from '@/integrations/supabase/client';

export default function Landing() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Check session on mount (handles OAuth redirects)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsTransitioning(true);
      }
    });

    // Listen for auth state changes (e.g. user finishes OAuth flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsTransitioning(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuthSuccess = () => {
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    navigate('/');
  };

  return (
    <div className="bg-background relative">
      <LandingHeader />
      <DashboardShowcase />
      <GenerativeArtGallery />
      <LandingNarrative />

      {isTransitioning && (
        <TransitionScreen onComplete={handleTransitionComplete} />
      )}
    </div>
  );
}
