import { Helmet } from 'react-helmet-async';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingNarrative } from '@/components/LandingNarrative';
import DashboardShowcase from '@/components/DashboardShowcase';
import { GenerativeArtGallery } from '@/components/ui/generative-art-gallery';
import { BeamsBackground } from '@/components/ui/beams-background';

export default function Landing() {
  return (
    <BeamsBackground intensity="subtle" className="bg-background">
      <Helmet>
        <title>LucroReal — Gestão de Lucro e Custos com IA</title>
        <meta name="description" content="Descubra quanto realmente sobra no seu negócio. Controle custos, vendas e receba insights inteligentes de IA para aumentar seu lucro real." />
        <link rel="canonical" href="https://lucroreal.live/" />
        <meta property="og:title" content="LucroReal — Gestão de Lucro e Custos com IA" />
        <meta property="og:description" content="Descubra quanto realmente sobra no seu negócio. Controle custos, vendas e receba insights inteligentes de IA para aumentar seu lucro real." />
        <meta property="og:url" content="https://lucroreal.live/" />
      </Helmet>
      <LandingHeader />
      <DashboardShowcase />
      <GenerativeArtGallery />
      <LandingNarrative />
    </BeamsBackground>
  );
}
