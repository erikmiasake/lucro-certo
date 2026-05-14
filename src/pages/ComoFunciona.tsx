import { Helmet } from 'react-helmet-async';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Store,
  Brain,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  BadgeDollarSign,
  Target,
  ShieldCheck,
  Zap,
  BarChart3,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── Shared animation helpers ── */
const ease = [0.16, 1, 0.3, 1];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay, duration: 0.7, ease },
});

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.7, ease }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ── Steps data ── */
const steps = [
  {
    num: '01',
    icon: Store,
    title: 'Informe seu negócio',
    desc: 'Tipo de negócio, vendas diárias e custos principais.',
    tag: 'Menos de 1 minuto',
  },
  {
    num: '02',
    icon: Brain,
    title: 'A IA analisa',
    desc: 'Organiza custos, identifica padrões e calcula sua margem real.',
    tag: 'Processamento inteligente',
  },
  {
    num: '03',
    icon: Lightbulb,
    title: 'Receba insights',
    desc: 'Veja lucro real, identifique problemas e saiba o que melhorar.',
    tag: 'Decisões claras',
  },
];

/* ── Differentials ── */
const diffs = [
  { before: 'Só controle', after: 'Análise inteligente', icon: BarChart3 },
  { before: 'Só números', after: 'Decisões práticas', icon: Target },
  { before: 'Planilhas', after: 'IA personalizada', icon: Sparkles },
];

/* ── Benefits ── */
const benefits = [
  { icon: BadgeDollarSign, text: 'Entenda seu lucro real' },
  { icon: TrendingDown, text: 'Identifique desperdícios' },
  { icon: ShieldCheck, text: 'Tome decisões melhores' },
  { icon: Zap, text: 'Tenha controle total do negócio' },
];

export default function ComoFunciona() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 h-14">
          <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Voltar</span>
          </Link>
          <Button size="sm" className="rounded-xl text-xs px-4" asChild>
            <Link to="/">Começar agora</Link>
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="pt-28 pb-16 px-5 max-w-3xl mx-auto text-center">
        <motion.div {...fadeUp(0.1)}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3" />
            Como funciona
          </span>
        </motion.div>
        <motion.h1
          {...fadeUp(0.2)}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-5"
          style={{ textWrap: 'balance' } as React.CSSProperties}
        >
          Transforme seus números{' '}
          <span className="text-primary">em decisões</span>
        </motion.h1>
        <motion.p
          {...fadeUp(0.35)}
          className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          style={{ textWrap: 'pretty' } as React.CSSProperties}
        >
          Veja como nossa IA analisa seu negócio e mostra onde você ganha e perde dinheiro.
        </motion.p>
      </header>

      {/* ── 3 Steps ── */}
      <Section className="px-5 pb-20 max-w-3xl mx-auto">
        <div className="space-y-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              className="group relative flex gap-4 p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300"
            >
              {/* Number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-primary/60 tracking-widest">{s.num}</span>
                  <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed mb-2">{s.desc}</p>
                <span className="inline-block text-[10px] text-primary/70 font-medium px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                  {s.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Real Example ── */}
      <Section className="px-5 pb-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Exemplo real</h2>
          <p className="text-muted-foreground text-sm">Simulação para uma lanchonete</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 space-y-5">
          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Receita', value: 'R$ 36.000', color: 'text-foreground', icon: TrendingUp },
              { label: 'Custos', value: 'R$ 28.000', color: 'text-destructive', icon: TrendingDown },
              { label: 'Lucro', value: 'R$ 8.000', color: 'text-primary', icon: BadgeDollarSign },
            ].map((m) => (
              <div key={m.label} className="text-center p-3 rounded-xl bg-secondary/40 border border-border/40">
                <m.icon className={`h-4 w-4 mx-auto mb-1.5 ${m.color}`} />
                <p className="text-[10px] text-muted-foreground mb-0.5">{m.label}</p>
                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Margin bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Margem de lucro</span>
              <span className="text-primary font-semibold">22,2%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                whileInView={{ width: '22.2%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease }}
              />
            </div>
          </div>

          {/* AI Insight */}
          <div className="flex gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/15">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground mb-0.5">Insight da IA</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reduzindo desperdícios em 10%, seu lucro aumentaria{' '}
                <span className="text-primary font-semibold">R$ 1.200/mês</span>.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Differentials ── */}
      <Section className="px-5 pb-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Por que isso é diferente?</h2>
          <p className="text-muted-foreground text-sm">Não é mais uma planilha</p>
        </div>

        <div className="space-y-3">
          {diffs.map((d, i) => (
            <motion.div
              key={d.before}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/40"
            >
              <d.icon className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-muted-foreground line-through">{d.before}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{d.after}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Benefits ── */}
      <Section className="px-5 pb-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">O que você ganha</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.text}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5, ease }}
              className="flex flex-col items-center text-center gap-2.5 p-5 rounded-2xl border border-border/50 bg-card/40"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <b.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground leading-snug">{b.text}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── CTA Final ── */}
      <Section className="px-5 pb-24 max-w-3xl mx-auto">
        <div className="relative rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/8 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Pronto para começar?</h2>
            <p className="text-muted-foreground text-sm mb-6">Leva menos de 1 minuto</p>
            <Button size="lg" className="rounded-xl px-8 text-sm font-semibold shadow-lg shadow-primary/20" asChild>
              <Link to="/login">
                Analisar meu negócio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
