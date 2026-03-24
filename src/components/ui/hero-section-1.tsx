import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Menu, X, Utensils, Scissors, PawPrint, ShoppingBag, DollarSign, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { TextEffect } from '@/components/ui/text-effect';
import { cn } from '@/lib/utils';
import heroBg from '@/assets/hero-bg.jpg';
import heroDashboard from '@/assets/hero-dashboard.jpg';

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { type: 'spring', bounce: 0.3, duration: 1.5 },
    },
  },
};

export function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        {/* ── HERO: Full-screen ── */}
        <section className="relative w-screen min-h-screen flex items-center justify-center overflow-hidden">
          {/* Layer 1 — Full-screen background */}
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 24, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          >
            <img
              src={heroBg}
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Overlays for contrast */}
          <div className="absolute inset-0 z-[1] bg-background/70" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/60 via-transparent to-transparent" />

          {/* Radial glow */}
          <div
            aria-hidden
            className="absolute inset-0 z-[2] opacity-30 [background:radial-gradient(60%_50%_at_50%_60%,hsl(var(--primary)/0.25)_0%,transparent_100%)]"
          />

          {/* Layer 2 — Centered content */}
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32 text-center">
            {/* Badge */}
            <AnimatedGroup variants={transitionVariants}>
              <Link
                to="#"
                className="hover:bg-muted bg-card/60 backdrop-blur-md group mx-auto flex w-fit items-center gap-4 rounded-full border border-border p-1 pl-4 shadow-md shadow-primary/5 transition-all duration-300"
              >
                <span className="text-foreground text-sm">
                  Gestão simples para seu negócio
                </span>
                <span className="bg-primary text-primary-foreground block rounded-full px-2 py-0.5 text-xs">
                  Novo
                </span>
              </Link>
            </AnimatedGroup>

            {/* Heading */}
            <TextEffect
              preset="blur"
              as="h1"
              className="mt-8 text-balance text-4xl md:text-6xl lg:text-7xl font-bold text-foreground"
            >
              Saiba quanto realmente sobra no seu bolso
            </TextEffect>

            {/* Description */}
            <TextEffect
              per="line"
              preset="fade"
              delay={0.5}
              as="p"
              className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
            >
              Controle suas vendas e custos de forma simples. Sem complicação, sem termos técnicos. Feito para quem empreende todos os dias.
            </TextEffect>

            {/* CTA Buttons */}
            <AnimatedGroup
              variants={transitionVariants}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <div>
                <Button size="lg" className="rounded-xl px-6 text-base shadow-lg shadow-primary/25" asChild>
                  <Link to="/">
                    <span>Começar agora</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div>
                <Button size="lg" variant="ghost" className="rounded-xl px-6 text-base" asChild>
                  <Link to="/como-funciona">
                    <span>Como funciona</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </AnimatedGroup>

            {/* Trust line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="mt-10 text-muted-foreground/40 text-xs tracking-wide"
            >
              Grátis • Sem cadastro • Resultados em segundos
            </motion.p>

            {/* Hero Image */}
            <AnimatedGroup variants={transitionVariants} className="relative mx-auto mt-12 max-w-4xl">
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-2 shadow-2xl shadow-primary/10">
                <img
                  src={heroDashboard}
                  alt="Dashboard Lucro Real mostrando gráficos de vendas e lucro"
                  className="rounded-xl w-full"
                />
              </div>
            </AnimatedGroup>
          </div>
        </section>

        {/* ── Social proof / Features ── */}
        <section className="bg-background py-16 md:py-24" id="como-funciona">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center">
              <p className="text-muted-foreground font-medium text-sm">
                Feito para todos os tipos de negócio
              </p>
            </div>

            <AnimatedGroup preset="blur-slide" className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Restaurante</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Scissors className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Salão</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PawPrint className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Pet Shop</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Loja</span>
              </div>
            </AnimatedGroup>

            <AnimatedGroup preset="fade" className="mt-12 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-1">Registre suas vendas</h3>
                <p className="text-sm text-muted-foreground">Em poucos segundos, sem complicação.</p>
              </div>
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-1">Custos inteligentes</h3>
                <p className="text-sm text-muted-foreground">Distribui custos de produto ao longo dos dias.</p>
              </div>
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-1">Lucro real</h3>
                <p className="text-sm text-muted-foreground">Veja quanto realmente sobra pra você.</p>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: 'Como funciona', href: '/como-funciona' },
  { name: 'Para quem', href: '#como-funciona' },
];

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header>
      <nav
        className={cn(
          'fixed z-50 w-full transition-all duration-300',
          isScrolled
            ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">Lucro Real</span>
          </Link>

          <button
            onClick={() => setMenuState(!menuState)}
            aria-label={menuState ? 'Close Menu' : 'Open Menu'}
            className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
          >
            {menuState ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
          </button>

          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Button size="sm" className="rounded-xl" asChild>
              <Link to="/">Começar grátis</Link>
            </Button>
          </div>

          {menuState && (
            <div className="fixed inset-0 z-10 bg-background/95 backdrop-blur-md lg:hidden">
              <div className="flex flex-col items-center justify-center h-full gap-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMenuState(false)}
                    className="text-lg text-foreground font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
                <Button size="lg" className="rounded-xl mt-4" asChild>
                  <Link to="/" onClick={() => setMenuState(false)}>
                    Começar grátis
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
