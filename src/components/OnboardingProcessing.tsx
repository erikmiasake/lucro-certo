import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, BarChart3, TrendingUp, Layers, Settings2 } from 'lucide-react';

const steps = [
  { icon: Brain, text: 'Entendendo a estrutura do seu negócio…' },
  { icon: BarChart3, text: 'Identificando padrões do seu setor…' },
  { icon: Layers, text: 'Organizando seus principais custos…' },
  { icon: TrendingUp, text: 'Calculando métricas iniciais…' },
  { icon: Settings2, text: 'Personalizando seu painel…' },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingProcessing({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  const stableComplete = useCallback(onComplete, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(stableComplete, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [stableComplete]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/6 blur-[120px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Pulsing icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-7"
      >
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="h-6 w-6 text-primary" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl sm:text-2xl font-bold text-foreground mb-1.5 text-center"
      >
        Preparando sua análise inteligente
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-muted-foreground text-sm mb-8"
      >
        Isso leva apenas alguns segundos
      </motion.p>

      {/* Progress */}
      <div className="w-full max-w-xs mb-8">
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Dynamic phrases */}
      <div className="h-10 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2.5 text-muted-foreground"
          >
            {(() => {
              const Icon = steps[currentStep].icon;
              return <Icon className="h-4 w-4 text-primary" />;
            })()}
            <span className="text-sm">{steps[currentStep].text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
