import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getRecentCosts, addCost, deleteCost } from '@/lib/store';
import { Trash2, Plus, Package, Building2 } from 'lucide-react';
import CostModal from '@/components/CostModal';
import FeedbackToast from '@/components/FeedbackToast';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string) {
  const [, m, d] = dateStr.split('-');
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
  const total = totalProduct + totalBusiness;

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number) => {
    addCost(amount, type, spreadDays);
    setShowCost(false);
    setFeedback('Custo registrado!');
    setTimeout(() => setFeedback(null), 2500);
  };

  const CostList = ({ items, label, icon: Icon, color }: { items: typeof costs; label: string; icon: typeof Package; color: string }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${color}`} />
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-6 rounded-xl bg-secondary/30 border border-border/50">
          <p className="text-muted-foreground text-sm">Nenhum custo registrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-3.5 rounded-xl card-elevated group hover:border-accent/20 transition-all"
            >
              <div>
                <p className="font-semibold text-foreground text-sm">{formatCurrency(c.amount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(c.date)}
                  {c.type === 'product' && ` · distribuído em ${c.spreadDays} dias`}
                </p>
              </div>
              <button
                onClick={() => deleteCost(c.id)}
                className="p-2 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto safe-bottom">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Custos</h1>
        <p className="text-muted-foreground text-sm mt-1">Entenda o que custa para o negócio funcionar</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 card-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-xl -translate-y-4 translate-x-4" />
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-3.5 w-3.5 text-accent" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Produto</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(totalProduct)}</p>
          {total > 0 && (
            <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full gradient-accent" style={{ width: `${(totalProduct / total) * 100}%` }} />
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl p-4 card-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl -translate-y-4 translate-x-4" />
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-3.5 w-3.5 text-purple-400" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Negócio</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(totalBusiness)}</p>
          {total > 0 && (
            <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-purple-500" style={{ width: `${(totalBusiness / total) * 100}%` }} />
            </div>
          )}
        </motion.div>
      </div>

      <button
        onClick={() => setShowCost(true)}
        className="w-full py-3.5 rounded-2xl gradient-accent text-accent-foreground font-semibold text-sm mb-6 active:scale-[0.97] transition-all shadow-lg shadow-accent/15 flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Registrar custo
      </button>

      <CostList items={productCosts} label={config.productCostLabel} icon={Package} color="text-accent" />
      <CostList items={businessCosts} label={config.businessCostLabel} icon={Building2} color="text-purple-400" />

      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
