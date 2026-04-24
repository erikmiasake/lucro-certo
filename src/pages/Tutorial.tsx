import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/use-store';
import { safeGetItem, safeSetItem } from '@/lib/safe-storage';

const TUTORIAL_KEY = 'lucro_real_tutorial_seen';

export function hasSeenTutorial() {
  return safeGetItem(TUTORIAL_KEY) === '1';
}

export function markTutorialSeen() {
  safeSetItem(TUTORIAL_KEY, '1');
}

const steps = [
  {
    icon: ArrowUpCircle,
    title: 'Coloque o que entrou',
    desc: 'Ex: vendas do dia',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'shadow-[0_0_40px_-10px_hsl(142_70%_45%/0.3)]',
  },
  {
    icon: ArrowDownCircle,
    title: 'Coloque o que saiu',
    desc: 'Ex: custos, aluguel, produtos',
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    glow: 'shadow-[0_0_40px_-10px_hsl(0_70%_55%/0.3)]',
  },
  {
    icon: Sparkles,
    title: 'Veja quanto sobrou',
    desc: 'Seu lucro real aparece automaticamente',
    accent: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    glow: 'shadow-[0_0_40px_-10px_hsl(200_80%_55%/0.3)]',
  },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const state = useStore();

  if (!state.onboardingComplete) {
    return <Navigate to="/welcome" replace />;
  }

  const handleEnter = () => {
    markTutorialSeen();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10 sm:py-16 relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 sm:mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-5"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Tutorial rápido</span>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight mb-4">
            Tutorial
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Você só precisa colocar o que entrou e o que saiu.
            <br />
            <span className="text-foreground/90 font-medium">A gente mostra quanto você realmente lucrou.</span>
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3 sm:space-y-4 mb-10 sm:mb-12">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border ${step.border} bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 ${step.glow}`}
              >
                <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${step.bg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${step.accent}`} strokeWidth={2.2} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-mono text-muted-foreground/60">0{i + 1}</span>
                    <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Final phrase */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-center text-2xl sm:text-3xl font-extrabold text-foreground mb-8 tracking-tight"
        >
          Sem planilha. <span className="text-primary">Sem complicação.</span>
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            onClick={handleEnter}
            className="group h-14 px-8 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
          >
            Ir para o meu painel
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
