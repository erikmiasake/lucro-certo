import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import {
  getWeekSummary, getMonthSummary, getDaySummary, getDateString,
  getWeekDailyData, getBestAndWorstDay, getPreviousWeekSummary,
} from '@/lib/store';
import { TrendingUp, TrendingDown, BarChart3, Trophy, AlertTriangle, ArrowUpRight, ArrowDownRight, Percent } from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(v: number) {
  return `${v.toFixed(1)}%`;
}

function formatDateBR(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

export default function Desempenho() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const week = getWeekSummary();
  const month = getMonthSummary();
  const prevWeek = getPreviousWeekSummary();
  const weekData = getWeekDailyData();
  const bestWorst = getBestAndWorstDay();
  const todayDate = getDateString();

  const maxVal = Math.max(...weekData.map(d => Math.max(d.revenue, d.cost)), 1);
  const weekDiff = prevWeek.totalRevenue > 0 ? week.profit - prevWeek.profit : null;

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto safe-bottom">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Desempenho</h1>
        <p className="text-muted-foreground text-sm mt-1">{config.icon} Evolução do seu negócio</p>
      </div>

      {/* Period cards with comparison */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 card-elevated relative overflow-hidden">
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
          <p className="text-[11px] text-muted-foreground mt-1">{formatCurrency(week.totalRevenue)} vendas · {week.totalEntries} {config.entryVerb}s</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl p-5 card-elevated relative overflow-hidden">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Mês</p>
          <p className={`text-2xl font-extrabold tracking-tight ${month.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(month.profit)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${month.margin >= 20 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {formatPercent(month.margin)} margem
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{formatCurrency(month.totalRevenue)} vendas · {month.totalEntries} {config.entryVerb}s</p>
        </motion.div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-2xl p-4 card-elevated text-center">
          <Percent className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Margem semanal</p>
          <p className="text-lg font-bold text-foreground">{formatPercent(week.margin)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="rounded-2xl p-4 card-elevated text-center">
          <BarChart3 className="h-4 w-4 text-accent mx-auto mb-1" />
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Custo/venda</p>
          <p className="text-lg font-bold text-accent">
            {week.totalEntries > 0 ? formatCurrency(week.totalRealCost / week.totalEntries) : 'R$ 0'}
          </p>
        </motion.div>
      </div>

      {/* Bar chart - Revenue vs Cost */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl p-5 md:p-6 card-elevated mb-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Receita vs Custo — 7 dias</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] text-muted-foreground">Receita</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] text-muted-foreground">Custo</span>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {weekData.map((d, i) => {
            const revH = Math.max((d.revenue / maxVal) * 100, 4);
            const costH = Math.max((d.cost / maxVal) * 100, 4);
            const isToday = d.date === todayDate;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="flex items-end gap-0.5 w-full h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${revH}%` }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                    className={`flex-1 rounded-t-md ${isToday ? 'gradient-primary' : 'bg-primary/30'}`}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${costH}%` }}
                    transition={{ delay: 0.25 + i * 0.05, duration: 0.5 }}
                    className={`flex-1 rounded-t-md ${isToday ? 'gradient-accent' : 'bg-accent/30'}`}
                  />
                </div>
                <span className={`text-[9px] font-medium ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Best & worst day */}
      {bestWorst && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-4 card-elevated">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-primary" />
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Melhor dia</p>
            </div>
            <p className="text-lg font-bold text-primary">{formatCurrency(bestWorst.best.profit)}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatDateBR(bestWorst.best.date)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl p-4 card-elevated">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Pior dia</p>
            </div>
            <p className="text-lg font-bold text-destructive">{formatCurrency(bestWorst.worst.profit)}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatDateBR(bestWorst.worst.date)}</p>
          </motion.div>
        </div>
      )}

      {/* Weekly summary table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-5 md:p-6 card-elevated">
        <p className="text-sm font-semibold text-foreground mb-4">Resumo da semana</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Vendas ({week.totalEntries})</span>
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
