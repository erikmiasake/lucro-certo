import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

export default function Desempenho() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const copy = getModeCopyFromType(state.businessType).glossary;
  const labels = copy;
  const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana');

  const week = useMemo(() => getWeekSummary(), [state]);
  const month = useMemo(() => getMonthSummary(), [state]);
  const prevWeek = useMemo(() => getPreviousWeekSummary(), [state]);
  const weekData = useMemo(() => getWeekDailyData(true), [state]);

  const ativo = periodo === 'semana' ? week : month;
  const weekDiff = week.profit - prevWeek.profit;

  const maxRevenue = Math.max(...weekData.map((d) => d.revenue), 1);

  const diasComReceita = weekData.filter((d) => d.revenue > 0);
  const melhorDia = diasComReceita.length
    ? diasComReceita.reduce((acc, d) => (d.profit > acc.profit ? d : acc), diasComReceita[0])
    : null;
  const piorDia = diasComReceita.length
    ? diasComReceita.reduce((acc, d) => (d.profit < acc.profit ? d : acc), diasComReceita[0])
    : null;

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto safe-bottom">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{labels.performanceTitle}</h1>
        <p className="text-muted-foreground text-sm mt-1">{labels.performanceSubtitle}</p>
      </motion.div>

      {/* BLOCO 1 — Seletor de período */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl p-5 md:p-6 card-elevated mb-4">
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-secondary rounded-xl">
          <button
            onClick={() => setPeriodo('semana')}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              periodo === 'semana' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriodo('mes')}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              periodo === 'mes' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Mês
          </button>
        </div>

        <div className="text-center mb-5">
          <p className={`text-4xl md:text-5xl font-extrabold tracking-tight ${ativo.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(ativo.profit)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{copy.inflow}</p>
            <p className="text-sm font-bold text-foreground">{formatCurrency(ativo.totalRevenue)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{copy.outflow}</p>
            <p className="text-sm font-bold text-accent">{formatCurrency(ativo.totalCosts)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{copy.marginLabel}</p>
            <p className={`text-sm font-bold ${ativo.margin >= 20 ? 'text-primary' : 'text-destructive'}`}>{formatPercent(ativo.margin)}</p>
          </div>
        </div>
      </motion.div>

      {/* BLOCO 2 — Comparação */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 mb-4">
        <motion.div variants={fadeUp} className="rounded-2xl p-5 card-elevated">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Esta semana vs anterior</p>
          <p className={`text-2xl font-extrabold tracking-tight ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(week.profit)}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${weekDiff >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {weekDiff >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            <span>{weekDiff >= 0 ? '+' : ''}{formatCurrency(weekDiff)}</span>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl p-5 card-elevated">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">No mês</p>
          <p className={`text-2xl font-extrabold tracking-tight ${month.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(month.profit)}
          </p>
          <p className={`text-xs font-medium mt-2 ${month.margin >= 20 ? 'text-primary' : 'text-accent'}`}>
            {formatPercent(month.margin)} {copy.marginLabel.toLowerCase()}
          </p>
        </motion.div>
      </motion.div>

      {/* BLOCO 3 — Gráfico de barras */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl p-5 md:p-6 card-elevated mb-4">
        <p className="text-sm font-semibold text-foreground mb-4">Últimos 7 dias</p>
        <div className="flex items-end justify-between gap-2">
          {weekData.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="flex items-end gap-0.5 h-[80px]">
                <div
                  className="w-2.5 bg-primary rounded-t"
                  style={{ height: `${(day.revenue / maxRevenue) * 80}px` }}
                />
                <div
                  className="w-2.5 bg-accent rounded-t"
                  style={{ height: `${(day.cost / maxRevenue) * 80}px` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">{day.label}</p>
              <p className={`text-[10px] font-semibold ${day.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(day.profit)}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* BLOCO 4 — Melhor e pior dia */}
      {melhorDia && piorDia && (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 mb-4">
          <motion.div variants={fadeUp} className="rounded-2xl p-5 card-elevated">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Melhor dia</p>
            <p className="text-sm text-foreground font-medium">{melhorDia.label}</p>
            <p className={`text-lg font-extrabold tracking-tight mt-1 ${melhorDia.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(melhorDia.profit)}
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-2xl p-5 card-elevated">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Pior dia</p>
            <p className="text-sm text-foreground font-medium">{piorDia.label}</p>
            <p className={`text-lg font-extrabold tracking-tight mt-1 ${piorDia.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(piorDia.profit)}
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* BLOCO 5 — Resumo */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl p-5 md:p-6 card-elevated">
        <p className="text-sm font-semibold text-foreground mb-4">Resumo</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{copy.inflow}</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(ativo.totalRevenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{copy.outflow}</span>
            <span className="text-sm font-semibold text-accent">{formatCurrency(ativo.totalCosts)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{copy.marginLabel}</span>
            <span className={`text-sm font-semibold ${ativo.margin >= 20 ? 'text-primary' : 'text-accent'}`}>{formatPercent(ativo.margin)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="text-sm font-bold text-foreground">{copy.result}</span>
            <span className={`text-sm font-bold ${ativo.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(ativo.profit)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
