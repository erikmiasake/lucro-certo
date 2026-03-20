import { motion } from 'framer-motion';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { CheckCircle2, DollarSign, Tag, ArrowRight, Sparkles, Building2 } from 'lucide-react';

interface Props {
  businessType: BusinessType;
  avgSales: string;
  selectedCosts: string[];
  onEnter: () => void;
}

export default function OnboardingConfirmation({ businessType, avgSales, selectedCosts, onEnter }: Props) {
  const config = businessConfigs[businessType];

  return (
    <motion.div
      key="confirmation"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md px-5 py-8 sm:py-12 flex flex-col items-center text-center"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight"
      >
        Seu negócio está pronto
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground mb-8 max-w-xs"
      >
        Criamos uma estrutura personalizada para o seu tipo de negócio
      </motion.p>

      {/* Summary cards */}
      <div className="w-full space-y-3 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Tipo de negócio</p>
            <p className="text-sm font-semibold text-foreground">{config.label}</p>
          </div>
        </motion.div>

        {avgSales && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Média de vendas/dia</p>
              <p className="text-sm font-semibold text-foreground">R$ {avgSales}</p>
            </div>
          </motion.div>
        )}

        {selectedCosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.49 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Tag className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground mb-1.5">Custos mapeados</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedCosts.slice(0, 6).map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-secondary text-xs text-secondary-foreground">{c}</span>
                ))}
                {selectedCosts.length > 6 && (
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground">+{selectedCosts.length - 6}</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex items-center gap-2 text-xs text-muted-foreground/60 mb-6"
      >
        <Sparkles className="h-3 w-3 text-primary/50" />
        Análise personalizada por inteligência artificial
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.97 }}
        onClick={onEnter}
        className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
      >
        Entrar no meu painel
        <ArrowRight className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
}
