import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, BarChart3, Sparkles, TrendingUp } from 'lucide-react';

const steps = [
  { icon: Brain, text: 'Entendendo seu modelo de negócio…' },
  { icon: BarChart3, text: 'Calculando custos operacionais…' },
  { icon: TrendingUp, text: 'Mapeando oportunidades de lucro…' },
  { icon: Sparkles, text: 'Gerando insights personalizados…' },
];

interface AILoadingScreenProps {
  onComplete: () => void;
}

export default function AILoadingScreen({ onComplete }: AILoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [onComplete]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Pulsing icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-7 w-7 text-primary" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl sm:text-2xl font-bold text-foreground mb-2 text-center"
      >
        Preparando a análise do seu negócio
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-sm mb-10"
      >
        Isso leva apenas alguns segundos
      </motion.p>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-8">
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Dynamic phrases */}
      <div className="h-12 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 text-muted-foreground"
          >
            {(() => {
              const Icon = steps[currentStep].icon;
              return <Icon className="h-4 w-4 text-primary" />;
            })()}
            <span className="text-sm">{steps[currentStep].text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
