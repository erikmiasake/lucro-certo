import { useStore } from '@/hooks/use-store';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { setBusinessType, resetAll } from '@/lib/store';
import { useState } from 'react';

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
    <div className="p-5 max-w-2xl mx-auto safe-bottom">
      <h1 className="text-xl font-bold text-foreground mb-5">Configurações</h1>

      {/* Business type */}
      <div className="rounded-2xl p-5 bg-card border border-border mb-6">
        <p className="text-sm font-semibold text-foreground mb-3">Tipo de negócio</p>
        <div className="flex flex-col gap-2">
          {types.map((type) => {
            const config = businessConfigs[type];
            const isActive = state.businessType === type;
            return (
              <button
                key={type}
                onClick={() => setBusinessType(type)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${isActive ? 'bg-primary/10 border-2 border-primary' : 'bg-background border border-border hover:border-primary/30'}`}
              >
                <span className="text-xl">{config.icon}</span>
                <span className={`text-sm ${isActive ? 'font-semibold text-primary' : 'text-foreground'}`}>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories preview */}
      {state.businessType && (
        <div className="rounded-2xl p-5 bg-card border border-border mb-6">
          <p className="text-sm font-semibold text-foreground mb-3">Categorias do seu negócio</p>
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">📦 Custos de produto</p>
            <div className="flex flex-wrap gap-1">
              {businessConfigs[state.businessType].costCategories.product.map((cat) => (
                <span key={cat} className="px-2 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs">{cat}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">🏢 Custos do negócio</p>
            <div className="flex flex-wrap gap-1">
              {businessConfigs[state.businessType].costCategories.business.map((cat) => (
                <span key={cat} className="px-2 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs">{cat}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={handleReset}
        className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all ${confirmReset ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`}
      >
        {confirmReset ? 'Confirmar: apagar tudo?' : 'Limpar todos os dados'}
      </button>
    </div>
  );
}
