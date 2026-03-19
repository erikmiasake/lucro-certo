import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getRecentCosts, addCost, deleteCost, getCostBreakdown, getWeekSummary } from '@/lib/store';
import { Trash2, Plus, Package, Building2, AlertTriangle, PieChart } from 'lucide-react';
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
  const breakdown = getCostBreakdown();
  const week = getWeekSummary();
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground text-sm">{formatCurrency(c.amount)}</p>
                  {breakdown.total > 0 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {((c.amount / breakdown.total) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(c.date)}
                  {c.category && ` · ${c.category}`}
                  {c.type === 'product' && ` · ${c.spreadDays}d`}
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

      {/* Alert - high cost */}
      {breakdown.isHighCost && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Custos elevados!</p>
            <p className="text-xs text-destructive/80 mt-0.5">
              Seus custos representam mais de 70% da receita semanal. Revise seus gastos.
            </p>
          </div>
        </motion.div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 card-elevated relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-3.5 w-3.5 text-accent" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Produto</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(breakdown.totalProduct)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/10 text-accent">
              {breakdown.productPercentage.toFixed(0)}%
            </span>
          </div>
          {breakdown.total > 0 && (
            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${breakdown.productPercentage}%` }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="h-full rounded-full gradient-accent"
              />
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl p-4 card-elevated relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-3.5 w-3.5 text-purple-400" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Negócio</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(breakdown.totalBusiness)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
              {breakdown.businessPercentage.toFixed(0)}%
            </span>
          </div>
          {breakdown.total > 0 && (
            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${breakdown.businessPercentage}%` }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="h-full rounded-full bg-purple-500"
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Top costs breakdown */}
      {breakdown.categories.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-4 card-elevated mb-5">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Maiores custos</p>
          </div>
          <div className="space-y-2.5">
            {breakdown.categories.slice(0, 5).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatCurrency(cat.amount)}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        cat.percentage > 40 ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'
                      }`}>
                        {cat.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                      className={`h-full rounded-full ${cat.percentage > 40 ? 'bg-destructive' : 'bg-primary/50'}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
