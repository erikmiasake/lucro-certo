import { LandingHeader } from '@/components/LandingHeader';
import { LandingNarrative } from '@/components/LandingNarrative';
import DashboardShowcase from '@/components/DashboardShowcase';
import { GenerativeArtGallery } from '@/components/ui/generative-art-gallery';

export default function Landing() {
  return (
    <div className="bg-background relative">
      <LandingHeader />
      <DashboardShowcase />
      <GenerativeArtGallery />
      <LandingNarrative />
    </div>
  );
}
