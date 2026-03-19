import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getWeekSummary, getMonthSummary, getDaySummary, getDateString } from '@/lib/store';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getWeekDays() {
  const days: { label: string; date: string }[] = [];
  const today = new Date();
  const weekday = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ label: weekday[d.getDay()], date: getDateString(d) });
  }
  return days;
}

export default function Desempenho() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const week = getWeekSummary();
  const month = getMonthSummary();
  const weekDays = getWeekDays();

  const dailyProfits = weekDays.map((d) => {
    const s = getDaySummary(d.date);
    return { ...d, profit: s.profit, revenue: s.totalRevenue };
  });

  const maxRevenue = Math.max(...dailyProfits.map((d) => d.revenue), 1);
  const todayDate = getDateString();

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto safe-bottom">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Desempenho</h1>
        <p className="text-muted-foreground text-sm mt-1">{config.icon} Como está indo o seu negócio</p>
      </div>

      {/* Period cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 card-elevated relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 gradient-primary opacity-[0.06] rounded-full blur-2xl -translate-y-6 translate-x-6" />
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Semana</p>
          <p className={`text-2xl font-extrabold tracking-tight ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(week.profit)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {week.profit >= 0 ? <TrendingUp className="h-3 w-3 text-primary" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
            <p className="text-[11px] text-muted-foreground">{formatCurrency(week.totalRevenue)} vendas</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-5 card-elevated relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 gradient-accent opacity-[0.06] rounded-full blur-2xl -translate-y-6 translate-x-6" />
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Mês</p>
          <p className={`text-2xl font-extrabold tracking-tight ${month.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(month.profit)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {month.profit >= 0 ? <TrendingUp className="h-3 w-3 text-primary" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
            <p className="text-[11px] text-muted-foreground">{formatCurrency(month.totalRevenue)} vendas</p>
          </div>
        </motion.div>
      </div>

      {/* Bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 md:p-6 card-elevated"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Últimos 7 dias</p>
        </div>
        <div className="flex items-end gap-2 h-36">
          {dailyProfits.map((d, i) => {
            const height = maxRevenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, 6) : 6;
            const isToday = d.date === todayDate;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`w-full rounded-lg transition-colors ${
                    isToday
                      ? d.profit >= 0 ? 'gradient-primary shadow-lg shadow-primary/20' : 'gradient-accent shadow-lg shadow-accent/20'
                      : d.profit >= 0 ? 'bg-primary/30' : 'bg-accent/30'
                  }`}
                />
                <span className={`text-[10px] font-medium ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Summary table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 rounded-2xl p-5 md:p-6 card-elevated"
      >
        <p className="text-sm font-semibold text-foreground mb-4">Resumo da semana</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Vendas</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(week.totalRevenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Custos</span>
            <span className="text-sm font-semibold text-accent">{formatCurrency(week.totalRealCost)}</span>
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
