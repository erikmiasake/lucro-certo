import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { setOnboardingComplete, getState } from '@/lib/store';
import { saveProfileToDB } from '@/lib/profile-sync';
import OnboardingProcessing from '@/components/OnboardingProcessing';
import { toast } from 'sonner';

export default function Processing() {
  const navigate = useNavigate();

  const handleComplete = useCallback(() => {
    setOnboardingComplete(true);
    navigate('/dashboard', { replace: true });
    setTimeout(() => {
      toast.success('Sua personalização foi realizada com sucesso!', {
        description: 'Seu painel está pronto para uso.',
        duration: 4000,
      });
    }, 500);
  }, [navigate]);

  return <OnboardingProcessing onComplete={handleComplete} />;
}
