import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface TransitionScreenProps {
  onComplete: () => void;
}

const PHRASES = [
  'Preparando seu ambiente...',
  'Criando sua estrutura inicial...',
  'Organizando seus dados...',
  'Preparando sua análise...',
];

export default function TransitionScreen({ onComplete }: TransitionScreenProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // 3 seconds total. 4 phrases. Switch every ~750ms
    const interval = setInterval(() => {
      setIndex((current) => {
        if (current >= PHRASES.length - 1) {
          clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, 750);

    const timer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border border-primary/30 border-t-primary/80 border-r-primary/80 shadow-[0_0_40px_rgba(20,184,105,0.3)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={index}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.4 }}
              className="text-xl md:text-2xl font-semibold text-foreground tracking-tight text-center"
            >
              {PHRASES[index]}
            </motion.h2>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
