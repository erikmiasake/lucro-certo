import { useStore } from '@/hooks/use-store';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { setBusinessType, resetAll } from '@/lib/store';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, ChevronRight } from 'lucide-react';

const types: BusinessType[] = ['restaurante', 'salao', 'petshop', 'loja', 'outro'];

export default function Configuracoes() {
  const state = useStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (confirmReset) {
      resetAll();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto safe-bottom">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalize o app para o seu negócio</p>
      </div>

      {/* Business type */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 card-elevated mb-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Tipo de negócio</p>
        <div className="flex flex-col gap-2">
          {types.map((type) => {
            const config = businessConfigs[type];
            const isActive = state.businessType === type;
            return (
              <button
                key={type}
                onClick={() => setBusinessType(type)}
                className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-primary/10 border border-primary/30 glow-primary'
                    : 'bg-secondary/30 border border-transparent hover:border-border hover:bg-secondary/60'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${isActive ? 'bg-primary/15' : 'bg-secondary'}`}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground block">{config.entryLabel}</span>
                </div>
                {isActive && (
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Categories */}
      {state.businessType && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-5 card-elevated mb-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Categorias do seu negócio</p>
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Custos de produto
            </p>
            <div className="flex flex-wrap gap-1.5">
              {businessConfigs[state.businessType].costCategories.product.map((cat) => (
                <span key={cat} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">{cat}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Custos do negócio
            </p>
            <div className="flex flex-wrap gap-1.5">
              {businessConfigs[state.businessType].costCategories.business.map((cat) => (
                <span key={cat} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">{cat}</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5 border border-destructive/20 bg-destructive/5">
        <p className="text-xs uppercase tracking-wider text-destructive font-medium mb-3">Zona de perigo</p>
        <button
          onClick={handleReset}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            confirmReset
              ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trash2 className="h-4 w-4" />
          {confirmReset ? 'Toque para confirmar: apagar tudo' : 'Limpar todos os dados'}
        </button>
      </motion.div>
    </div>
  );
}
