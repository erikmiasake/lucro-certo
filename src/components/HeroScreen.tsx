import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, TrendingUp, PieChart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';

interface HeroScreenProps {
  onStart: () => void;
  onLearnMore: () => void;
}

export default function HeroScreen({ onStart, onLearnMore }: HeroScreenProps) {
  const steps = [
    { icon: BarChart3, label: 'Tipo de negócio' },
    { icon: TrendingUp, label: 'Receitas e custos' },
    { icon: PieChart, label: 'Diagnóstico completo' },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Full-screen background image with slow zoom */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
      >
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </motion.div>

      {/* Dark overlay + gradient */}
      <div className="absolute inset-0 z-[1] bg-background/80" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Conta ativada com sucesso
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight mb-4"
        >
          Vamos diagnosticar
          <br />
          <span className="text-primary">seu negócio</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-muted-foreground text-lg sm:text-xl max-w-xl mb-10 leading-relaxed"
        >
          Responda algumas perguntas rápidas e nossa IA vai gerar um diagnóstico financeiro personalizado para você.
        </motion.p>

        {/* Steps preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex items-center gap-3 sm:gap-5 mb-10"
        >
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 border border-border/30 backdrop-blur-sm">
                <step.icon className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-4 sm:w-6 h-px bg-border/50" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Single CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <Button
            size="lg"
            onClick={onStart}
            className="rounded-xl px-10 py-6 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            Iniciar diagnóstico
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-10 text-muted-foreground/40 text-xs tracking-wide"
        >
          Leva menos de 2 minutos • 100% personalizado • Resultados imediatos
        </motion.p>
      </div>
    </div>
  );
}
