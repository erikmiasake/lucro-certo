import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getDaySummary, getDateString, getInsight, getWeekSummary, getMonthSummary, addEntry, addCost } from '@/lib/store';
import EntryModal from '@/components/EntryModal';
import CostModal from '@/components/CostModal';
import FeedbackToast from '@/components/FeedbackToast';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function VisaoGeral() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const today = getDateString();
  const summary = getDaySummary(today);
  const week = getWeekSummary();
  const month = getMonthSummary();
  const insight = getInsight(today);

  const [showEntry, setShowEntry] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleEntry = (amount: number) => {
    addEntry(amount);
    setShowEntry(false);
    const updated = getDaySummary(today);
    setFeedback(`Hoje você já fez ${formatCurrency(updated.totalRevenue)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number) => {
    addCost(amount, type, spreadDays);
    setShowCost(false);
    const updated = getDaySummary(today);
    setFeedback(`Hoje sobrou ${formatCurrency(updated.profit)} pra você`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const profitColor = summary.profit >= 0 ? 'text-success' : 'text-destructive';

  return (
    <div className="p-5 max-w-2xl mx-auto safe-bottom">
      <h1 className="text-xl font-bold text-foreground mb-1">Hoje no seu negócio</h1>
      <p className="text-muted-foreground text-sm mb-5">{config.icon} {config.label}</p>

      {/* Today cards */}
      <div className="flex flex-col gap-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 bg-card border border-border">
          <p className="text-muted-foreground text-sm mb-1">💰 Você ganhou hoje</p>
          <p className="text-3xl font-extrabold text-foreground">{formatCurrency(summary.totalRevenue)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl p-5 bg-card border border-border">
          <p className="text-muted-foreground text-sm mb-1">💸 Quanto custou para vender hoje</p>
          <p className="text-3xl font-extrabold text-accent">{formatCurrency(summary.totalRealCost)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-5 bg-card border-2 border-primary/30">
          <p className="text-muted-foreground text-sm mb-1">{summary.profit >= 0 ? '🟢' : '🔴'} Sobrou pra você</p>
          <p className={`text-3xl font-extrabold ${profitColor}`}>{formatCurrency(summary.profit)}</p>
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
            💡 {insight}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Week/Month summaries */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="rounded-2xl p-4 bg-card border border-border">
          <p className="text-muted-foreground text-xs mb-1">Semana</p>
          <p className={`text-lg font-bold ${week.profit >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(week.profit)}</p>
          <p className="text-xs text-muted-foreground">de lucro</p>
        </div>
        <div className="rounded-2xl p-4 bg-card border border-border">
          <p className="text-muted-foreground text-xs mb-1">Mês</p>
          <p className={`text-lg font-bold ${month.profit >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(month.profit)}</p>
          <p className="text-xs text-muted-foreground">de lucro</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button onClick={() => setShowEntry(true)} className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.97] transition-transform">
          + Registrar entrada
        </button>
        <button onClick={() => setShowCost(true)} className="flex-1 py-4 rounded-2xl bg-card border-2 border-border text-foreground font-semibold text-base active:scale-[0.97] transition-transform">
          − Registrar custo
        </button>
      </div>

      <EntryModal open={showEntry} onClose={() => setShowEntry(false)} onSubmit={handleEntry} label={config.entryLabel} />
      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
