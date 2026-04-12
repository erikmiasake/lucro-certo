import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import {
  getWeekSummary, getMonthSummary, getDaySummary, getDateString,
  getWeekDailyData, getBestAndWorstDay, getPreviousWeekSummary,
  getMarginTrend, getMonthlyProjection,
  isOperatingDay,
} from '@/lib/store';
import ProactiveAlerts from '@/components/ProactiveAlerts';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import GoalsProgress from '@/components/GoalsProgress';
import {
  TrendingUp, TrendingDown, BarChart3, Trophy, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Percent, Target,
  CalendarOff,
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
  const weekData = getWeekDailyData();
  const bestWorst = getBestAndWorstDay();
  const todayDate = getDateString();
  const marginTrend = getMarginTrend();
  const projection = getMonthlyProjection();

  const hasAnyData = weekData.some(d => d.revenue > 0 || d.cost > 0);
  const maxVal = Math.max(...weekData.map(d => Math.max(d.revenue, d.cost)), 1);
  const weekDiff = prevWeek.totalRevenue > 0 ? week.profit - prevWeek.profit : null;

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto safe-bottom">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Desempenho</h1>
        <p className="text-muted-foreground text-sm mt-1">Evolução e inteligência do seu negócio</p>
      </motion.div>

      {/* Proactive Alerts */}
      <div className="mb-4">
        <ProactiveAlerts />
      </div>

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

      {/* Margin trend */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-3 gap-2 mb-4">
        <motion.div variants={fadeUp} className="rounded-2xl p-3.5 card-elevated text-center">
          <ArrowUpRight className="h-3.5 w-3.5 text-blue-400 mx-auto mb-1" />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Entradas</p>
          <p className="text-sm font-bold text-foreground">
            {week.totalEntries > 0 ? week.totalEntries : '—'}
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl p-3.5 card-elevated text-center">
          <BarChart3 className="h-3.5 w-3.5 text-accent mx-auto mb-1" />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Receita média/dia</p>
          <p className="text-sm font-bold text-foreground">
            {week.totalEntries > 0 ? formatCurrency(week.totalRevenue / 7) : '—'}
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl p-3.5 card-elevated text-center">
          {marginTrend.direction === 'up' ? (
            <TrendingUp className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
          ) : marginTrend.direction === 'down' ? (
            <TrendingDown className="h-3.5 w-3.5 text-destructive mx-auto mb-1" />
          ) : (
            <Percent className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
          )}
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Margem</p>
          <p className={`text-sm font-bold ${
            marginTrend.direction === 'up' ? 'text-primary' : marginTrend.direction === 'down' ? 'text-destructive' : 'text-foreground'
          }`}>
            {marginTrend.direction === 'up' ? 'Subindo' : marginTrend.direction === 'down' ? 'Caindo' : 'Estável'}
          </p>
        </motion.div>
      </motion.div>

      {/* Monthly projection */}
      {projection.revenue > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4 mb-4 border border-primary/20 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(152 76% 52% / 0.06), hsl(228 14% 10%))' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-[0.04] rounded-full blur-3xl -translate-y-8 translate-x-8" />
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Projeção mensal</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Receita</p>
              <p className="text-sm font-bold text-foreground">{formatCurrency(projection.revenue)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Custos</p>
              <p className="text-sm font-bold text-accent">{formatCurrency(projection.cost)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Lucro</p>
              <p className={`text-sm font-bold ${projection.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(projection.profit)}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Baseado no ritmo atual · Margem projetada: {formatPercent(projection.margin)}
          </p>
        </motion.div>
      )}

      {/* Goals progress */}
      <div className="mb-4">
        <GoalsProgress />
      </div>

      {/* Bar chart — Revenue vs Cost 7 days */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5 md:p-6 card-elevated mb-4">
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

        {hasAnyData ? (
          <div className="flex items-end gap-2 h-40">
            {weekData.map((d, i) => {
              const operating = isOperatingDay(d.date);
              const revH = maxVal > 0 ? Math.max((d.revenue / maxVal) * 100, d.revenue > 0 ? 8 : 0) : 0;
              const costH = maxVal > 0 ? Math.max((d.cost / maxVal) * 100, d.cost > 0 ? 8 : 0) : 0;
              const isToday = d.date === todayDate;

              if (!operating && d.revenue === 0 && d.cost === 0) {
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 justify-end h-full">
                    <CalendarOff className="h-3.5 w-3.5 text-muted-foreground/40" />
                    <span className="text-[9px] font-medium text-muted-foreground/50">{d.label}</span>
                  </div>
                );
              }

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="flex items-end gap-0.5 w-full h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${revH}%` }}
                      transition={{ delay: 0.25 + i * 0.05, duration: 0.5 }}
                      className={`flex-1 rounded-t-md ${isToday ? 'gradient-primary' : 'bg-primary/30'}`}
                      style={{ minHeight: revH > 0 ? '4px' : '0px' }}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${costH}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                      className={`flex-1 rounded-t-md ${isToday ? 'gradient-accent' : 'bg-accent/30'}`}
                      style={{ minHeight: costH > 0 ? '4px' : '0px' }}
                    />
                  </div>
                  <span className={`text-[9px] font-medium ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Sem dados nos últimos 7 dias</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Registre receitas e custos para ver o gráfico</p>
          </div>
        )}
      </motion.div>

      {/* Best & worst */}
      {bestWorst && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-4 card-elevated">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-primary" />
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Melhor dia</p>
            </div>
            <p className="text-lg font-bold text-primary">{formatCurrency(bestWorst.best.profit)}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatDateBR(bestWorst.best.date)} · {formatCurrency(getDaySummary(bestWorst.best.date).totalRevenue)} receita</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl p-4 card-elevated">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Pior dia</p>
            </div>
            <p className="text-lg font-bold text-destructive">{formatCurrency(bestWorst.worst.profit)}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatDateBR(bestWorst.worst.date)} · {formatCurrency(getDaySummary(bestWorst.worst.date).totalRevenue)} receita</p>
          </motion.div>
        </div>
      )}

      {/* AI Insights — enriched with more context */}
      <div className="mb-4">
        <AIInsightsPanel
          summary={week}
          businessType={state.businessType || 'outro'}
          period="semana"
        />
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
