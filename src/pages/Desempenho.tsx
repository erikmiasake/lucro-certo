import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import {
  getWeekSummary, getMonthSummary, getDaySummary, getDateString,
  getWeekDailyData, getPreviousWeekSummary,
  getMonthlyProjection,
  isOperatingDay,
} from '@/lib/store';



import GoalsProgress from '@/components/GoalsProgress';
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
  const week = getWeekSummary();
  const month = getMonthSummary();
  const prevWeek = getPreviousWeekSummary();
  const weekData = getWeekDailyData(true); // only operating days
  
  const todayDate = getDateString();
  
  const projection = getMonthlyProjection();

  const weekDiff = prevWeek.totalRevenue > 0 ? week.profit - prevWeek.profit : null;

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto safe-bottom">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Desempenho</h1>
        <p className="text-muted-foreground text-sm mt-1">Evolução e inteligência do seu negócio</p>
      </motion.div>


      {/* Period cards */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 mb-4">
        <motion.div variants={fadeUp} className="rounded-2xl p-5 card-elevated relative overflow-hidden">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Semana</p>
          <p className={`text-2xl font-extrabold tracking-tight ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(week.profit)}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${week.margin >= 20 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {formatPercent(week.margin)} margem
            </span>
            {weekDiff !== null && (
              <span className={`text-[10px] flex items-center gap-0.5 ${weekDiff >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {weekDiff >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {weekDiff >= 0 ? '+' : ''}{formatCurrency(weekDiff)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{formatCurrency(week.totalRevenue)} receita · {formatCurrency(week.totalRealCost)} custos</p>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl p-5 card-elevated relative overflow-hidden">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Mês</p>
          <p className={`text-2xl font-extrabold tracking-tight ${month.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(month.profit)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${month.margin >= 20 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {formatPercent(month.margin)} margem
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{formatCurrency(month.totalRevenue)} receita · {formatCurrency(month.totalRealCost)} custos</p>
        </motion.div>
      </motion.div>

      {/* Key metrics */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-3 gap-2 mb-4">
        <motion.div variants={fadeUp} className="rounded-2xl p-3.5 card-elevated text-center">
          <ArrowUpRight className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Receita</p>
          <p className="text-sm font-bold text-foreground">
            {week.totalRevenue > 0 ? formatCurrency(week.totalRevenue) : '—'}
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl p-3.5 card-elevated text-center">
          <ArrowDownRight className="h-3.5 w-3.5 text-accent mx-auto mb-1" />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Custos</p>
          <p className="text-sm font-bold text-accent">
            {week.totalRealCost > 0 ? formatCurrency(week.totalRealCost) : '—'}
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl p-3.5 card-elevated text-center">
          <Percent className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Margem</p>
          <p className={`text-sm font-bold ${week.margin >= 20 ? 'text-primary' : 'text-destructive'}`}>
            {week.totalRevenue > 0 ? formatPercent(week.margin) : '—'}
          </p>
        </motion.div>
      </motion.div>
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-3 gap-2 mb-4">
        <motion.div variants={fadeUp} className="rounded-2xl p-3.5 card-elevated text-center">
          <TrendingUp className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Lucro real</p>
          <p className={`text-sm font-bold ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {week.totalRevenue > 0 ? formatCurrency(week.profit) : '—'}
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl p-3.5 card-elevated text-center">
          <BarChart3 className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Lucro/dia</p>
          <p className={`text-sm font-bold ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {week.totalEntries > 0 ? formatCurrency(week.profit / Math.max(weekData.length, 1)) : '—'}
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl p-3.5 card-elevated text-center">
          <ArrowDownRight className="h-3.5 w-3.5 text-accent mx-auto mb-1" />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Custo/dia</p>
          <p className="text-sm font-bold text-accent">
            {week.totalRealCost > 0 ? formatCurrency(week.totalRealCost / Math.max(weekData.length, 1)) : '—'}
          </p>
        </motion.div>
      </motion.div>


      {/* Goals progress */}
      <div className="mb-4">
        <GoalsProgress />
      </div>

      {/* Weekly summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-5 md:p-6 card-elevated">
        <p className="text-sm font-semibold text-foreground mb-4">Resumo da semana</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Entradas ({week.totalEntries})</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(week.totalRevenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Custos</span>
            <span className="text-sm font-semibold text-accent">{formatCurrency(week.totalRealCost)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Margem</span>
            <span className={`text-sm font-semibold ${week.margin >= 20 ? 'text-primary' : 'text-accent'}`}>{formatPercent(week.margin)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="text-sm font-bold text-foreground">Lucro real</span>
            <span className={`text-sm font-bold ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(week.profit)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
