import { LandingHeader } from '@/components/LandingHeader';
import { LandingNarrative } from '@/components/LandingNarrative';
import DashboardShowcase from '@/components/DashboardShowcase';
import { GenerativeArtGallery } from '@/components/ui/generative-art-gallery';
import { BeamsBackground } from '@/components/ui/beams-background';

export default function Landing() {
  return (
    <BeamsBackground intensity="subtle" className="bg-background">
      <LandingHeader />
      <DashboardShowcase />
      <GenerativeArtGallery />
      <LandingNarrative />
    </BeamsBackground>
  );
}
