import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getDaySummary, getDateString, getInsight, getWeekSummary, getMonthSummary, addEntry, addCost } from '@/lib/store';
import EntryModal from '@/components/EntryModal';
import CostModal from '@/components/CostModal';
import FeedbackToast from '@/components/FeedbackToast';
import { Plus, Minus, TrendingUp, TrendingDown, Lightbulb, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

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

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto safe-bottom">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-base">{config.icon}</div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{config.label}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Hoje no seu negócio</h1>
      </motion.div>

      {/* Main metric cards */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-3 md:gap-4">
        {/* Revenue */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5 md:p-6 card-elevated relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 gradient-revenue opacity-[0.06] rounded-full blur-2xl -translate-y-8 translate-x-8" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Você ganhou hoje
              </p>
              <p className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                {formatCurrency(summary.totalRevenue)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Cost */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5 md:p-6 card-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 gradient-accent opacity-[0.06] rounded-full blur-2xl -translate-y-8 translate-x-8" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Quanto custou para vender
              </p>
              <p className="text-3xl md:text-4xl font-extrabold text-accent tracking-tight">
                {formatCurrency(summary.totalRealCost)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <ArrowDownRight className="h-5 w-5 text-accent" />
            </div>
          </div>
        </motion.div>

        {/* Profit - hero card */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5 md:p-6 relative overflow-hidden glow-primary border border-primary/20"
          style={{ background: 'linear-gradient(135deg, hsl(152 76% 52% / 0.08), hsl(228 14% 10%))' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 gradient-primary opacity-[0.08] rounded-full blur-3xl -translate-y-10 translate-x-10" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${summary.profit >= 0 ? 'bg-primary' : 'bg-destructive'}`} />
                Sobrou pra você
              </p>
              <p className={`text-3xl md:text-4xl font-extrabold tracking-tight ${summary.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(summary.profit)}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${summary.profit >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              {summary.profit >= 0 ? <TrendingUp className="h-5 w-5 text-primary" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Insight */}
      <AnimatePresence>
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 px-4 py-3 rounded-xl bg-secondary border border-border flex items-start gap-3"
          >
            <Lightbulb className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-secondary-foreground leading-relaxed">{insight}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Period summaries */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-3 mt-6">
        <div className="rounded-2xl p-4 card-elevated">
          <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-2 font-medium">Semana</p>
          <p className={`text-xl font-bold ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(week.profit)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {formatCurrency(week.totalRevenue)} em vendas
          </p>
        </div>
        <div className="rounded-2xl p-4 card-elevated">
          <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-2 font-medium">Mês</p>
          <p className={`text-xl font-bold ${month.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(month.profit)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {formatCurrency(month.totalRevenue)} em vendas
          </p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-3 mt-6">
        <button
          onClick={() => setShowEntry(true)}
          className="flex-1 py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base active:scale-[0.97] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Registrar entrada
        </button>
        <button
          onClick={() => setShowCost(true)}
          className="flex-1 py-4 rounded-2xl card-elevated text-foreground font-semibold text-base active:scale-[0.97] transition-all hover:border-accent/40 flex items-center justify-center gap-2"
        >
          <Minus className="h-5 w-5 text-accent" />
          Registrar custo
        </button>
      </motion.div>

      <EntryModal open={showEntry} onClose={() => setShowEntry(false)} onSubmit={handleEntry} label={config.entryLabel} />
      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
