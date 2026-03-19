import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import {
  getDaySummary, getDateString, getWeekSummary, getMonthSummary,
  addEntry, addCost, getSmartInsights, getWeekDailyData, getPreviousDaySummary,
} from '@/lib/store';
import EntryModal from '@/components/EntryModal';
import CostModal from '@/components/CostModal';
import FeedbackToast from '@/components/FeedbackToast';
import ProactiveAlerts from '@/components/ProactiveAlerts';
import GoalsProgress from '@/components/GoalsProgress';
import {
  Plus, Minus, TrendingUp, TrendingDown, Zap,
  ArrowUpRight, ArrowDownRight, Percent, Activity,
} from 'lucide-react';
import AIInsightsPanel from '@/components/AIInsightsPanel';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function VisaoGeral() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const today = getDateString();
  const summary = getDaySummary(today);
  const yesterday = getPreviousDaySummary();
  const week = getWeekSummary();
  const month = getMonthSummary();
  const insights = getSmartInsights();
  const weekData = getWeekDailyData();

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

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number) => {
    addCost(amount, type, spreadDays);
    setShowCost(false);
    const updated = getDaySummary(today);
    setFeedback(`Lucro atual: ${formatCurrency(updated.profit)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const profitDiff = yesterday.totalRevenue > 0 ? summary.profit - yesterday.profit : null;
  const maxRevenue = Math.max(...weekData.map(d => d.revenue), 1);

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto safe-bottom">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{config.label}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Visão geral</h1>
      </motion.div>

      {/* Proactive alerts */}
      <div className="mb-4">
        <ProactiveAlerts />
      </div>

      {/* Hero profit card */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-3 md:gap-4">
        <motion.div
          variants={fadeUp}
          className="rounded-2xl p-5 md:p-6 relative overflow-hidden glow-primary border border-primary/20"
          style={{ background: 'linear-gradient(135deg, hsl(152 76% 52% / 0.08), hsl(228 14% 10%))' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 gradient-primary opacity-[0.06] rounded-full blur-3xl -translate-y-10 translate-x-10" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${summary.profit >= 0 ? 'bg-primary' : 'bg-destructive'}`} />
                Lucro do dia
              </p>
              <p className={`text-4xl md:text-5xl font-extrabold tracking-tight ${summary.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(summary.profit)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${summary.profit >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              {summary.profit >= 0 ? <TrendingUp className="h-6 w-6 text-primary" /> : <TrendingDown className="h-6 w-6 text-destructive" />}
            </div>
          </div>
          {profitDiff !== null && (
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
              profitDiff >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
            }`}>
              {profitDiff >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {profitDiff >= 0 ? '+' : ''}{formatCurrency(profitDiff)} vs ontem
            </div>
          )}
        </motion.div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div variants={fadeUp} className="rounded-2xl p-4 card-elevated">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-400" />
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Receita</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(summary.totalRevenue)}</p>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl p-4 card-elevated">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="h-3.5 w-3.5 text-accent" />
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Custos</p>
            </div>
            <p className="text-xl font-bold text-accent">{formatCurrency(summary.totalRealCost)}</p>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl p-4 card-elevated">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-3.5 w-3.5 text-primary" />
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Margem</p>
            </div>
            <p className={`text-xl font-bold ${summary.margin >= 20 ? 'text-primary' : summary.margin >= 0 ? 'text-warning' : 'text-destructive'}`}>
              {formatPercent(summary.margin)}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Goals progress */}
      <div className="mt-4">
        <GoalsProgress />
      </div>

      {/* Mini chart - 7 days */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 rounded-2xl p-5 card-elevated"
      >
        <p className="text-sm font-semibold text-foreground mb-4">Últimos 7 dias</p>
        <div className="flex items-end gap-1.5 h-24">
          {weekData.map((d, i) => {
            const height = maxRevenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, 8) : 8;
            const isToday = d.date === today;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.35 + i * 0.05, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`w-full rounded-md ${
                    isToday
                      ? d.profit >= 0 ? 'gradient-primary shadow-md shadow-primary/20' : 'gradient-accent shadow-md shadow-accent/20'
                      : d.profit >= 0 ? 'bg-primary/25' : 'bg-accent/25'
                  }`}
                />
                <span className={`text-[9px] font-medium ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Smart Insights */}
      <AnimatePresence>
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.4 }}
            className="mt-4 rounded-2xl p-4 bg-secondary border border-border space-y-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Insights</p>
            </div>
            {insights.slice(0, 4).map((insight, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="text-sm text-secondary-foreground leading-relaxed"
              >
                {insight}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights */}
      <div className="mt-4">
        <AIInsightsPanel
          summary={week}
          businessType={state.businessType || 'outro'}
          period="semana"
        />
      </div>

      {/* Period summaries */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-2xl p-4 card-elevated">
          <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-2 font-medium">Semana</p>
          <p className={`text-xl font-bold ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(week.profit)}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-muted-foreground">{formatCurrency(week.totalRevenue)} vendas</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${week.margin >= 20 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {formatPercent(week.margin)}
            </span>
          </div>
        </div>
        <div className="rounded-2xl p-4 card-elevated">
          <p className="text-muted-foreground text-[11px] uppercase tracking-wider mb-2 font-medium">Mês</p>
          <p className={`text-xl font-bold ${month.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(month.profit)}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-muted-foreground">{formatCurrency(month.totalRevenue)} vendas</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${month.margin >= 20 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {formatPercent(month.margin)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="flex gap-3 mt-6">
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
