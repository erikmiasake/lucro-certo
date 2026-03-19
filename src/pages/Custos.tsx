import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getRecentCosts, addCost, deleteCost } from '@/lib/store';
import { Trash2 } from 'lucide-react';
import CostModal from '@/components/CostModal';
import FeedbackToast from '@/components/FeedbackToast';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

export default function Custos() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const costs = getRecentCosts();
  const productCosts = costs.filter((c) => c.type === 'product');
  const businessCosts = costs.filter((c) => c.type === 'business');
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const totalProduct = productCosts.reduce((s, c) => s + c.amount, 0);
  const totalBusiness = businessCosts.reduce((s, c) => s + c.amount, 0);

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number) => {
    addCost(amount, type, spreadDays);
    setShowCost(false);
    setFeedback('Custo registrado!');
    setTimeout(() => setFeedback(null), 2500);
  };

  const CostList = ({ items, label, icon }: { items: typeof costs; label: string; icon: string }) => (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-foreground mb-3">{icon} {label}</h2>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4 text-center">Nenhum custo registrado</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div>
                <p className="font-semibold text-foreground text-sm">{formatCurrency(c.amount)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(c.date)}
                  {c.type === 'product' && ` · ${c.spreadDays} dias`}
                </p>
              </div>
              <button onClick={() => deleteCost(c.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-5 max-w-2xl mx-auto safe-bottom">
      <h1 className="text-xl font-bold text-foreground mb-1">Custos</h1>
      <p className="text-muted-foreground text-sm mb-5">Entenda o que custa para o negócio funcionar</p>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl p-4 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">📦 Produto</p>
          <p className="text-lg font-bold text-foreground">{formatCurrency(totalProduct)}</p>
        </div>
        <div className="rounded-2xl p-4 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">🏢 Negócio</p>
          <p className="text-lg font-bold text-foreground">{formatCurrency(totalBusiness)}</p>
        </div>
      </div>

      <button
        onClick={() => setShowCost(true)}
        className="w-full py-3 rounded-2xl bg-accent text-accent-foreground font-semibold text-sm mb-6 active:scale-[0.97] transition-transform"
      >
        + Registrar custo
      </button>

      <CostList items={productCosts} label={config.productCostLabel} icon="📦" />
      <CostList items={businessCosts} label={config.businessCostLabel} icon="🏢" />

      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
