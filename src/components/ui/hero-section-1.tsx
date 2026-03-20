import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { TextEffect } from '@/components/ui/text-effect';
import { cn } from '@/lib/utils';
import heroDashboard from '@/assets/hero-dashboard.jpg';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <section>
          <div className="relative pt-24 md:pt-36">
            {/* Background gradient */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_10%,transparent_40%,hsl(var(--primary))_100%)]"
            />
            <div className="absolute inset-0 -z-10 size-full opacity-20 [background:radial-gradient(50%_50%_at_50%_50%,hsl(var(--primary)/0.3)_0%,transparent_100%)]" />

            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                {/* Badge */}
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    to="#"
                    className="hover:bg-muted bg-card group mx-auto flex w-fit items-center gap-4 rounded-full border border-border p-1 pl-4 shadow-md shadow-primary/5 transition-all duration-300"
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
                    <Button size="lg" className="rounded-xl px-6 text-base" asChild>
                      <Link to="/">
                        <span>Começar agora</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div>
                    <Button
                      size="lg"
                      variant="ghost"
                      className="rounded-xl px-6 text-base"
                      asChild
                    >
                      <Link to="/como-funciona">
                        <span>Como funciona</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </AnimatedGroup>
              </div>
            </div>

            {/* Hero Image */}
            <AnimatedGroup
              variants={transitionVariants}
              className="relative mx-auto mt-12 max-w-4xl px-6"
            >
              <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
                <img
                  src={heroDashboard}
                  alt="Dashboard Lucro Real mostrando gráficos de vendas e lucro"
                  className="rounded-xl w-full"
                />
              </div>
            </AnimatedGroup>
          </div>
        </section>

        {/* Social proof / Features section */}
        <section className="bg-background py-16 md:py-24" id="como-funciona">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center">
              <p className="text-muted-foreground font-medium text-sm">
                Feito para todos os tipos de negócio
              </p>
            </div>

            <AnimatedGroup
              preset="blur-slide"
              className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4"
            >
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-5">
                <span className="text-3xl">🍽️</span>
                <span className="text-sm font-medium text-foreground">Restaurante</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-5">
                <span className="text-3xl">💇</span>
                <span className="text-sm font-medium text-foreground">Salão</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-5">
                <span className="text-3xl">🐾</span>
                <span className="text-sm font-medium text-foreground">Pet Shop</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-5">
                <span className="text-3xl">🛍️</span>
                <span className="text-sm font-medium text-foreground">Loja</span>
              </div>
            </AnimatedGroup>

            <AnimatedGroup
              preset="fade"
              className="mt-12 grid gap-6 sm:grid-cols-3"
            >
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <p className="text-3xl mb-3">💰</p>
                <h3 className="font-semibold text-foreground text-base mb-1">Registre suas vendas</h3>
                <p className="text-sm text-muted-foreground">Em poucos segundos, sem complicação.</p>
              </div>
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <p className="text-3xl mb-3">📊</p>
                <h3 className="font-semibold text-foreground text-base mb-1">Custos inteligentes</h3>
                <p className="text-sm text-muted-foreground">Distribui custos de produto ao longo dos dias.</p>
              </div>
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <p className="text-3xl mb-3">🟢</p>
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
  { name: 'Como funciona', href: '#como-funciona' },
  { name: 'Para quem', href: '#para-quem' },
];

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-lg font-bold text-foreground">Lucro Real</span>
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuState(!menuState)}
            aria-label={menuState ? 'Close Menu' : 'Open Menu'}
            className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
          >
            {menuState ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            ))}
            <Button size="sm" className="rounded-xl" asChild>
              <Link to="/">Começar grátis</Link>
            </Button>
          </div>

          {/* Mobile nav */}
          {menuState && (
            <div className="fixed inset-0 z-10 bg-background/95 backdrop-blur-md lg:hidden">
              <div className="flex flex-col items-center justify-center h-full gap-6">
                {menuItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuState(false)}
                    className="text-lg text-foreground font-medium"
                  >
                    {item.name}
                  </a>
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
