import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs, getAdaptedLabels } from '@/lib/business-config';
import { getModeCopyFromType } from '@/lib/modes';
import {
  getWeekSummary, getMonthSummary, getDaySummary, getDateString,
  getWeekDailyData, getPreviousWeekSummary,
  getMonthlyProjection,
  isOperatingDay,
} from '@/lib/finance';

import GoalsProgress from '@/components/GoalsProgress';
import { StatCard } from '@/components/ui/stat-card';
import {
  TrendingUp, BarChart3,
  ArrowUpRight, ArrowDownRight, Percent, Target,
} from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPercent(v: number) {
  return `${Math.round(v)}%`;
}

function formatDateBR(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function Desempenho() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const labels = getAdaptedLabels(state.businessType);
  const copy = getModeCopyFromType(state.businessType).glossary;
  const week = getWeekSummary();
  const month = getMonthSummary();
  const prevWeek = getPreviousWeekSummary();
  const weekData = getWeekDailyData(true);
  
  const todayDate = getDateString();
  
  const projection = getMonthlyProjection();

  const weekDiff = prevWeek.totalRevenue > 0 ? week.profit - prevWeek.profit : null;

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto safe-bottom">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{labels.performanceTitle}</h1>
        <p className="text-muted-foreground text-sm mt-1">{labels.performanceSubtitle}</p>
      </motion.div>

      {/* Period cards */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 mb-4">
        <motion.div variants={fadeUp} className="rounded-2xl p-5 card-elevated card-interactive relative overflow-hidden" whileHover={{ scale: 1.06 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Semana</p>
          <p className={`text-2xl font-extrabold tracking-tight ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(week.profit)}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${week.margin >= 20 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {formatPercent(week.margin)} {labels.marginLabel.toLowerCase()}
            </span>
            {weekDiff !== null && (
              <span className={`text-[10px] flex items-center gap-0.5 ${weekDiff >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {weekDiff >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {weekDiff >= 0 ? '+' : ''}{formatCurrency(weekDiff)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{formatCurrency(week.totalRevenue)} {labels.revenueOfLabel} · {formatCurrency(week.totalRealCost)} {copy.outflowSingular}</p>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl p-5 card-elevated card-interactive relative overflow-hidden" whileHover={{ scale: 1.06 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Mês</p>
          <p className={`text-2xl font-extrabold tracking-tight ${month.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(month.profit)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${month.margin >= 20 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {formatPercent(month.margin)} {labels.marginLabel.toLowerCase()}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{formatCurrency(month.totalRevenue)} {labels.revenueOfLabel} · {formatCurrency(month.totalRealCost)} {copy.outflowSingular}</p>
        </motion.div>
      </motion.div>

      {/* Key metrics */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-3 gap-2 mb-4">
        <motion.div variants={fadeUp}>
          <StatCard
            label={copy.inflow}
            value={week.totalRevenue}
            icon={<ArrowUpRight className="h-3.5 w-3.5 text-primary" />}
            format={(n) => formatCurrency(n)}
            valueClassName="text-foreground"
            placeholder={week.totalRevenue > 0 ? undefined : '—'}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label={copy.outflow}
            value={week.totalRealCost}
            icon={<ArrowDownRight className="h-3.5 w-3.5 text-accent" />}
            format={(n) => formatCurrency(n)}
            valueClassName="text-accent"
            placeholder={week.totalRealCost > 0 ? undefined : '—'}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label={labels.marginLabel}
            value={week.margin}
            icon={<Percent className="h-3.5 w-3.5 text-muted-foreground" />}
            format={(n) => `${Math.round(n)}%`}
            valueClassName={week.margin >= 20 ? 'text-primary' : 'text-destructive'}
            placeholder={week.totalRevenue > 0 ? undefined : '—'}
          />
        </motion.div>
      </motion.div>
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-3 gap-2 mb-4">
        <motion.div variants={fadeUp}>
          <StatCard
            label={labels.profitRealLabel}
            value={week.profit}
            icon={<TrendingUp className="h-3.5 w-3.5 text-primary" />}
            format={(n) => formatCurrency(n)}
            valueClassName={week.profit >= 0 ? 'text-primary' : 'text-destructive'}
            placeholder={week.totalRevenue > 0 ? undefined : '—'}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label={labels.profitPerDay}
            value={week.totalEntries > 0 ? week.profit / Math.max(weekData.length, 1) : 0}
            icon={<BarChart3 className="h-3.5 w-3.5 text-primary" />}
            format={(n) => formatCurrency(n)}
            valueClassName={week.profit >= 0 ? 'text-primary' : 'text-destructive'}
            placeholder={week.totalEntries > 0 ? undefined : '—'}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label={labels.costPerDay}
            value={week.totalRealCost / Math.max(weekData.length, 1)}
            icon={<ArrowDownRight className="h-3.5 w-3.5 text-accent" />}
            format={(n) => formatCurrency(n)}
            valueClassName="text-accent"
            placeholder={week.totalRealCost > 0 ? undefined : '—'}
          />
        </motion.div>
      </motion.div>

      {/* Goals progress */}
      <div className="mb-4">
        <GoalsProgress />
      </div>

      {/* Weekly summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-5 md:p-6 card-elevated">
        <p className="text-sm font-semibold text-foreground mb-4">{labels.weekSummaryLabel}</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{copy.inflow} ({week.totalEntries})</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(week.totalRevenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{copy.outflow}</span>
            <span className="text-sm font-semibold text-accent">{formatCurrency(week.totalRealCost)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{labels.marginLabel}</span>
            <span className={`text-sm font-semibold ${week.margin >= 20 ? 'text-primary' : 'text-accent'}`}>{formatPercent(week.margin)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="text-sm font-bold text-foreground">{labels.weeklySummaryProfit}</span>
            <span className={`text-sm font-bold ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(week.profit)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
