import { motion } from 'framer-motion';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { setBusinessType } from '@/lib/store';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { TextEffect } from '@/components/ui/text-effect';
import { ArrowRight } from 'lucide-react';

const types: BusinessType[] = ['restaurante', 'salao', 'petshop', 'loja', 'outro'];

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 safe-bottom relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm text-center"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
          className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg glow-primary"
        >
          💰
        </motion.div>

        <TextEffect
          preset="blur"
          as="h1"
          className="text-3xl font-bold text-foreground mb-2 tracking-tight"
        >
          Lucro Real
        </TextEffect>
        
        <TextEffect
          preset="fade"
          delay={0.3}
          as="p"
          className="text-muted-foreground mb-10 text-base"
        >
          Saiba quanto realmente sobra no seu bolso.
        </TextEffect>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-foreground font-semibold text-lg mb-5"
        >
          Qual é o seu tipo de negócio?
        </motion.p>

        <AnimatedGroup
          preset="blur-slide"
          className="flex flex-col gap-3"
        >
          {types.map((type) => {
            const config = businessConfigs[type];
            return (
              <button
                key={type}
                onClick={() => setBusinessType(type)}
                className="group flex items-center gap-4 w-full p-4 rounded-2xl card-elevated hover:border-primary/40 transition-all text-left active:scale-[0.98] hover:glow-primary"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {config.icon}
                </div>
                <div className="flex-1">
                  <span className="text-foreground font-semibold text-base block">{config.label}</span>
                  <span className="text-muted-foreground text-xs">{config.entryLabel}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </AnimatedGroup>
      </motion.div>
    </div>
  );
}
