import { motion } from 'framer-motion';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { setBusinessType } from '@/lib/store';

const types: BusinessType[] = ['restaurante', 'salao', 'petshop', 'loja', 'outro'];

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        <div className="text-5xl mb-4">💰</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Lucro Real</h1>
        <p className="text-muted-foreground mb-8 text-base">
          Saiba quanto realmente sobra no seu bolso.
        </p>

        <p className="text-foreground font-semibold text-lg mb-4">
          Qual é o seu tipo de negócio?
        </p>

        <div className="flex flex-col gap-3">
          {types.map((type, i) => {
            const config = businessConfigs[type];
            return (
              <motion.button
                key={type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                onClick={() => setBusinessType(type)}
                className="flex items-center gap-4 w-full p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-secondary transition-all text-left active:scale-[0.98]"
              >
                <span className="text-3xl">{config.icon}</span>
                <span className="text-foreground font-medium text-base">{config.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
