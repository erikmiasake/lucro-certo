import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getWeekSummary, getMonthSummary, getDaySummary, getDateString } from '@/lib/store';

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

  return (
    <div className="p-5 max-w-2xl mx-auto safe-bottom">
      <h1 className="text-xl font-bold text-foreground mb-1">Desempenho</h1>
      <p className="text-muted-foreground text-sm mb-5">{config.icon} Como está indo o seu negócio</p>

      {/* Week/Month summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Resultado da semana</p>
          <p className={`text-2xl font-extrabold ${week.profit >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(week.profit)}</p>
          <p className="text-xs text-muted-foreground mt-1">Vendas: {formatCurrency(week.totalRevenue)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl p-5 bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Resultado do mês</p>
          <p className={`text-2xl font-extrabold ${month.profit >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(month.profit)}</p>
          <p className="text-xs text-muted-foreground mt-1">Vendas: {formatCurrency(month.totalRevenue)}</p>
        </motion.div>
      </div>

      {/* Simple bar chart */}
      <div className="rounded-2xl p-5 bg-card border border-border">
        <p className="text-sm font-semibold text-foreground mb-4">Últimos 7 dias</p>
        <div className="flex items-end gap-2 h-32">
          {dailyProfits.map((d, i) => {
            const height = maxRevenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, 4) : 4;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className={`w-full rounded-t-lg ${d.profit >= 0 ? 'bg-primary/70' : 'bg-destructive/50'}`}
                />
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Margins */}
      <div className="mt-6 rounded-2xl p-5 bg-card border border-border">
        <p className="text-sm font-semibold text-foreground mb-3">Resumo</p>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Vendas (semana)</span>
            <span className="text-sm font-medium text-foreground">{formatCurrency(week.totalRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Custos (semana)</span>
            <span className="text-sm font-medium text-accent">{formatCurrency(week.totalRealCost)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="text-sm font-semibold text-foreground">Lucro (semana)</span>
            <span className={`text-sm font-bold ${week.profit >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(week.profit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
