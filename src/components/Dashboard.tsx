import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getDaySummary, getDateString, getInsight, addEntry, addCost } from '@/lib/store';
import EntryModal from './EntryModal';
import CostModal from './CostModal';
import FeedbackToast from './FeedbackToast';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
    <div className="min-h-screen bg-background flex flex-col safe-bottom">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-muted-foreground text-sm">{config.icon} {config.label}</p>
        <h1 className="text-xl font-bold text-foreground">Seu dia</h1>
      </div>

      {/* Main blocks */}
      <div className="px-5 flex-1">
        <div className="flex flex-col gap-3 mt-4">
          {/* Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 bg-card border border-border"
          >
            <p className="text-muted-foreground text-sm mb-1">💰 Você ganhou hoje</p>
            <p className="text-3xl font-extrabold text-foreground">
              {formatCurrency(summary.totalRevenue)}
            </p>
          </motion.div>

          {/* Cost */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-5 bg-card border border-border"
          >
            <p className="text-muted-foreground text-sm mb-1">💸 Custo real do dia</p>
            <p className="text-3xl font-extrabold text-accent">
              {formatCurrency(summary.totalRealCost)}
            </p>
          </motion.div>

          {/* Profit */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5 bg-card border-2 border-primary/30"
          >
            <p className="text-muted-foreground text-sm mb-1">
              {summary.profit >= 0 ? '🟢' : '🔴'} Sobrou pra você
            </p>
            <p className={`text-3xl font-extrabold ${profitColor}`}>
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
          className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.97] transition-transform"
        >
          + Registrar entrada
        </button>
        <button
          onClick={() => setShowCost(true)}
          className="flex-1 py-4 rounded-2xl bg-card border-2 border-border text-foreground font-semibold text-base active:scale-[0.97] transition-transform"
        >
          − Registrar custo
        </button>
      </div>

      {/* Modals */}
      <EntryModal
        open={showEntry}
        onClose={() => setShowEntry(false)}
        onSubmit={handleEntry}
        label={config.entryLabel}
      />
      <CostModal
        open={showCost}
        onClose={() => setShowCost(false)}
        onSubmit={handleCost}
        config={config}
      />

      {/* Feedback */}
      <FeedbackToast message={feedback} />
    </div>
  );
}
