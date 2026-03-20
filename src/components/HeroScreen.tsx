import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';

interface HeroScreenProps {
  onStart: () => void;
  onLearnMore: () => void;
}

export default function HeroScreen({ onStart, onLearnMore }: HeroScreenProps) {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
      <div className="absolute inset-0 z-[1] bg-background/75" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-background/50 to-transparent" />

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
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Assistente financeiro com IA
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight mb-6"
        >
          Você sabe quanto
          <br />
          <span className="text-primary">realmente lucra</span>?
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-muted-foreground text-lg sm:text-xl max-w-xl mb-10 leading-relaxed"
        >
          Nossa IA analisa seu negócio e mostra exatamente onde você ganha e perde dinheiro.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Button
            size="lg"
            onClick={onStart}
            className="rounded-xl px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            Analisar meu negócio
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate('/como-funciona')}
            className="rounded-xl px-6 py-6 text-base text-muted-foreground hover:text-foreground"
          >
            Ver como funciona
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-12 text-muted-foreground/40 text-xs tracking-wide"
        >
          Grátis • Sem cadastro • Resultados em segundos
        </motion.p>
      </div>
    </div>
  );
}
