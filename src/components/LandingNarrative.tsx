import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
      {/* Section 1 — Problem & Divider */}
      <section className="pt-24 md:pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <NarrativeSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium mb-8">
              <AlertTriangle className="w-4 h-4" />
              O problema
            </div>
            <h2 className="text-3xl md:text-6xl font-bold text-foreground leading-tight tracking-tight px-4">
              Você vende bem, mas <br/>
              <span className="text-primary text-4xl md:text-7xl">não vê a cor do dinheiro?</span>
            </h2>
            <p className="text-muted-foreground text-lg mt-8 max-w-2xl mx-auto leading-relaxed mb-16 px-4">
              Custos escondidos, taxas de cartão e desperdícios invisíveis são os verdadeiros ladrões do seu negócio. Isso acaba agora.
            </p>

            <div className="w-full flex flex-col items-center gap-8 pt-16 border-t border-white/5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Como funciona
              </div>
              <h2 className="text-3xl md:text-6xl font-bold text-foreground leading-tight">
                Veja como funciona.
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Você registra, a IA organiza — e o <span className="text-foreground font-medium">lucro real aparece</span>.
              </p>
            </div>
          </NarrativeSection>
        </div>
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
      <section className="py-24 md:py-32 px-6 border-t border-border bg-zinc-900/20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 px-4">
            <NarrativeSection>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                Para quem é
              </div>
              <h2 className="text-3xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
                Seu negócio merece essa <span className="text-primary">clareza</span>.
              </h2>
              <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto">
                Do balcão ao lucro real, o app foi feito para quem vive o dia a dia da operação.
              </p>
            </NarrativeSection>
          </div>

          <NarrativeSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                name: 'Restaurante', 
                image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop',
                phrase: 'Controle insumos e saiba sua margem por prato.' 
              },
              { 
                name: 'Salão & Barbearia', 
                image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
                phrase: 'Organize comissões e veja o lucro da cadeira.' 
              },
              { 
                name: 'Pet Shop', 
                image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
                phrase: 'Acompanhe banho, tosa e venda de produtos.' 
              },
              { 
                name: 'Comércio & Loja', 
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
                phrase: 'Gestão de estoque e vendas em tempo real.' 
              },
            ].map((biz) => (
              <motion.div 
                key={biz.name} 
                whileHover="hover"
                initial="initial"
                className="group relative h-[380px] rounded-3xl overflow-hidden border border-white/5 cursor-pointer"
              >
                {/* Background Image */}
                <motion.img 
                  src={biz.image}
                  alt={biz.name}
                  variants={{
                    hover: { scale: 1.1, filter: 'blur(2px)' },
                    initial: { scale: 1, filter: 'blur(0px)' }
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                      {biz.name}
                    </h3>
                    <motion.p 
                      variants={{
                        hover: { opacity: 1, y: 0, height: 'auto' },
                        initial: { opacity: 0, y: 10, height: 0 }
                      }}
                      transition={{ duration: 0.3 }}
                      className="text-primary-foreground/80 text-sm leading-relaxed font-medium"
                    >
                      {biz.phrase}
                    </motion.p>
                  </div>
                  
                  {/* Decorative bar */}
                  <div className="absolute left-8 bottom-6 w-8 h-1 bg-primary rounded-full transition-all duration-500 group-hover:w-16" />
                </div>

                {/* Subtle border glow on hover */}
                <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 rounded-3xl transition-colors duration-500" />
              </motion.div>
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
