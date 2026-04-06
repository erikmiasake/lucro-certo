import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getDaySummary, getDateString, getInsight, addEntry, addCostMapItem, updateCostMapItem, getCostMap, getDayRevenueSource, CostClassification } from '@/lib/store';
import EntryModal from './EntryModal';
import CostModal from './CostModal';
import FeedbackToast from './FeedbackToast';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Plus, Minus } from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const today = getDateString();
  const summary = getDaySummary(today);
  const insight = getInsight(today);

  const [showEntry, setShowEntry] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleEntry = (amount: number) => {
    addEntry(amount);
    setShowEntry(false);
    const updated = getDaySummary(today);
    setFeedback(`Receita atualizada: ${formatCurrency(updated.totalRevenue)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number, description?: string, category?: string, subcategory?: string, classification?: CostClassification) => {
    const inferredClassification = classification || (type === 'business' ? 'fixed' : 'variable');
    addCostMapItem(description || category || (type === 'product' ? 'Custo variável' : 'Custo fixo'), inferredClassification, amount);
    const costMap = getCostMap();
    const lastItem = costMap.fixed.concat(costMap.variable).sort((a, b) => b.createdAt - a.createdAt)[0];
    if (lastItem && inferredClassification === 'variable' && spreadDays !== 7) {
      updateCostMapItem(lastItem.id, { spreadDays });
    }
    setShowCost(false);
    const updated = getDaySummary(today);
    setFeedback(`Lucro atual: ${formatCurrency(updated.profit)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-bottom">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-muted-foreground text-sm">{config.label}</p>
        <h1 className="text-xl font-bold text-foreground">Seu dia</h1>
      </div>

      {/* Main blocks */}
      <div className="px-5 flex-1">
        <div className="flex flex-col gap-3 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="h-4 w-4 text-blue-400" />
              <p className="text-muted-foreground text-sm">Receita hoje</p>
            </div>
            <p className="text-3xl font-extrabold text-foreground">
              {formatCurrency(summary.totalRevenue)}
            </p>
            {summary.totalRevenue > 0 && (
              <p className={`text-[10px] mt-1 ${getDayRevenueSource(today) === 'manual' ? 'text-primary' : getDayRevenueSource(today) === 'distributed' ? 'text-accent' : 'text-muted-foreground'}`}>
                {getDayRevenueSource(today) === 'manual' ? 'Informado pelo usuário' : getDayRevenueSource(today) === 'distributed' ? 'Calculado automaticamente' : 'Estimado com base na média'}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-5 bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="h-4 w-4 text-accent" />
              <p className="text-muted-foreground text-sm">Custo real do dia</p>
            </div>
            <p className="text-3xl font-extrabold text-accent">
              {formatCurrency(summary.totalRealCost)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5 bg-card border-2 border-primary/30"
          >
            <div className="flex items-center gap-2 mb-1">
              {summary.profit >= 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
              <p className="text-muted-foreground text-sm">Lucro líquido</p>
            </div>
            <p className={`text-3xl font-extrabold ${summary.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(summary.profit)}
            </p>
          </motion.div>
        </div>

        {/* Insight */}
        <AnimatePresence>
          {insight && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium"
            >
              {insight}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-6 pt-4 flex gap-3">
        <button
          onClick={() => setShowEntry(true)}
          className="flex-1 py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Registrar receita do dia
        </button>
        <button
          onClick={() => setShowCost(true)}
          className="flex-1 py-4 rounded-2xl bg-card border-2 border-border text-foreground font-semibold text-base active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
        >
          <Minus className="h-5 w-5 text-accent" />
          Registrar custo
        </button>
      </div>

      <EntryModal open={showEntry} onClose={() => setShowEntry(false)} onSubmit={handleEntry} label={config.entryLabel} />
      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
