import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DollarSign, BarChart3, TrendingUp, Sparkles, Utensils, Scissors, PawPrint, ShoppingBag, ArrowRight, AlertTriangle, Brain, Target } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Props {
  onCtaClick: () => void;
}

function NarrativeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { y: 80, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0, opacity: 1, filter: 'blur(0px)',
          duration: 1.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function LandingNarrative({ onCtaClick }: Props) {
  return (
    <div className="relative z-10 bg-background">
      {/* Section 1 — Problem */}
      <section className="py-24 md:py-32 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <NarrativeSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium mb-8">
              <AlertTriangle className="w-4 h-4" />
              O problema
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Você vende todos os dias, mas nem sempre sabe quanto{' '}
              <span className="text-primary">realmente lucra</span>.
            </h2>
            <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
              Custos escondidos, contas misturadas e a sensação de que o dinheiro some sem explicação. Isso acaba agora.
            </p>
          </NarrativeSection>
        </div>
      </section>

      {/* Divider — "Veja como funciona" */}
      <section className="py-16 md:py-20 px-6">
        <NarrativeSection>
          <div className="mx-auto max-w-3xl flex flex-col items-center text-center gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Como funciona
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Veja como funciona
            </h2>
            <p className="text-muted-foreground text-base max-w-xl">
              Em três passos simples, você descobre exatamente quanto está sobrando no seu negócio.
            </p>
          </div>
        </NarrativeSection>
      </section>

      {/* Section 2 — Simple Registration */}
      <section className="py-24 md:py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <NarrativeSection className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
                <DollarSign className="w-4 h-4" />
                Passo 1
              </div>
              <h3 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
                Registre suas vendas em segundos.
              </h3>
              <p className="text-muted-foreground text-base mt-4 leading-relaxed">
                Sem planilhas, sem complicação. Basta informar o valor e pronto.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              {['Almoço executivo', 'Corte + Barba', 'Banho e tosa'].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <span className="text-foreground text-sm font-medium">{item}</span>
                  <span className="text-primary font-bold text-sm">R$ {(Math.random() * 100 + 30).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </NarrativeSection>
        </div>
      </section>

      {/* Section 3 — Organized Costs */}
      <section className="py-24 md:py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <NarrativeSection className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-2xl border border-border bg-card p-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Custos Variáveis</p>
                {['Ingredientes', 'Embalagens'].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <span className="text-foreground text-sm">{c}</span>
                    <span className="text-accent font-bold text-sm">R$ —</span>
                  </div>
                ))}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">Custos Fixos</p>
                {['Aluguel', 'Energia', 'Funcionários'].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <span className="text-foreground text-sm">{c}</span>
                    <span className="text-accent font-bold text-sm">R$ —</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-6">
                <BarChart3 className="w-4 h-4" />
                Passo 2
              </div>
              <h3 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
                Custos organizados automaticamente.
              </h3>
              <p className="text-muted-foreground text-base mt-4 leading-relaxed">
                A IA classifica seus custos em fixos e variáveis. Você só preenche os valores.
              </p>
            </div>
          </NarrativeSection>
        </div>
      </section>

      {/* Section 4 — AI Analysis */}
      <section className="py-24 md:py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <NarrativeSection className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
                <Brain className="w-4 h-4" />
                Passo 3
              </div>
              <h3 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
                IA analisa e revela seu lucro real.
              </h3>
              <p className="text-muted-foreground text-base mt-4 leading-relaxed">
                Insights automáticos, alertas de custos altos e recomendações personalizadas para aumentar sua margem.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              {[
                { icon: TrendingUp, text: 'Sua margem subiu 12% esta semana', color: 'text-primary' },
                { icon: AlertTriangle, text: 'Custo de embalagens acima da média', color: 'text-accent' },
                { icon: Target, text: 'Reduza 8% em insumos para meta mensal', color: 'text-primary' },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                  <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 ${insight.color}`}>
                    <insight.icon className="w-4 h-4" />
                  </div>
                  <p className="text-foreground text-sm mt-1">{insight.text}</p>
                </div>
              ))}
            </div>
          </NarrativeSection>
        </div>
      </section>

      {/* Section 5 — Who it's for */}
      <section className="py-24 md:py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-4xl text-center">
          <NarrativeSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Para quem é
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-12">
              Feito para todos os tipos de negócio.
            </h2>
          </NarrativeSection>
          <NarrativeSection className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Utensils, name: 'Restaurante' },
              { icon: Scissors, name: 'Salão' },
              { icon: PawPrint, name: 'Pet Shop' },
              { icon: ShoppingBag, name: 'Loja' },
            ].map((biz) => (
              <div key={biz.name} className="flex flex-col items-center gap-3 rounded-2xl bg-card border border-border p-6 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <biz.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{biz.name}</span>
              </div>
            ))}
          </NarrativeSection>
        </div>
      </section>

      {/* Section 6 — Final CTA */}
      <section className="py-24 md:py-32 px-6 border-t border-border">
        <div className="mx-auto max-w-3xl text-center">
          <NarrativeSection>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Comece agora e descubra seu{' '}
              <span className="text-primary">lucro real</span>.
            </h2>
            <p className="text-muted-foreground text-lg mt-6 max-w-xl mx-auto leading-relaxed">
              Grátis, sem cadastro, resultados em segundos.
            </p>
            <button
              onClick={onCtaClick}
              className="mt-10 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              Começar grátis
              <ArrowRight className="w-5 h-5" />
            </button>
          </NarrativeSection>
        </div>
      </section>
    </div>
  );
}
