import { motion } from 'framer-motion';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { CheckCircle2, DollarSign, Tag, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-lg px-5 py-8 sm:py-12 flex flex-col items-center text-center relative"
    >
      {/* Glow background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Badge variant="outline" className="mb-5 px-3 py-1 text-xs font-medium border-primary/20 text-primary bg-primary/5">
          <Sparkles className="h-3 w-3 mr-1.5" />
          Análise concluída
        </Badge>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-2xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight leading-tight"
      >
        Seu negócio está{' '}
        <span className="text-primary">pronto</span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-sm sm:text-base text-muted-foreground mb-8 max-w-sm leading-relaxed"
      >
        Criamos uma estrutura personalizada para o seu tipo de negócio com base nas informações fornecidas
      </motion.p>

      {/* Summary container with rectangle border style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 mb-8 relative overflow-hidden"
      >
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

        <div className="space-y-3 relative">
          {/* Business type */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/40">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider">Negócio</p>
              <p className="text-sm font-semibold text-foreground">{config.label}</p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-primary/60" />
          </div>

          {/* Average sales */}
          {avgSales && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/40">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-accent" />
              </div>
              <div className="text-left flex-1">
                <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider">Vendas/dia</p>
                <p className="text-sm font-semibold text-foreground">R$ {avgSales}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-primary/60" />
            </div>
          )}

          {/* Costs */}
          {selectedCosts.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/40">
              <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                <Tag className="h-4 w-4 text-primary/80" />
              </div>
              <div className="text-left flex-1">
                <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wider mb-1.5">{selectedCosts.length} custos mapeados</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCosts.slice(0, 5).map(c => (
                    <span key={c} className="px-2 py-0.5 rounded-md bg-secondary/80 text-[11px] font-medium text-secondary-foreground">{c}</span>
                  ))}
                  {selectedCosts.length > 5 && (
                    <span className="px-2 py-0.5 rounded-md bg-secondary/50 text-[11px] text-muted-foreground">+{selectedCosts.length - 5}</span>
                  )}
                </div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-primary/60 mt-0.5" />
            </div>
          )}
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="w-full relative"
      >
        <button
          onClick={onEnter}
          className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          Entrar no meu painel
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Glow under button */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary/15 blur-2xl rounded-full pointer-events-none" />
      </motion.div>

      {/* Footer text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="text-[11px] text-muted-foreground/40 mt-6"
      >
        Powered by inteligência artificial
      </motion.p>
    </motion.div>
  );
}
