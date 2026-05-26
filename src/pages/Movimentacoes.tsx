import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ArrowUpRight, ArrowDownRight, CalendarDays, TrendingUp, TrendingDown,
  Check, Edit2, Package, Building2, Trash2, Sparkles, BarChart3, Brain
} from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getModeCopyFromType } from '@/lib/modes';
import {
  getRecentCosts, deleteCost, setDayRevenue, getDayRevenue, getDayRevenueSource, registerCost,
  getDaySummary, getDateString, getWeekSummary, getMonthSummary,
  getWeekDailyData, getSmartInsights, getPreviousWeekSummary, getCostAnalysisAmount,
  isOperatingDay, addEntry, updateEntry, deleteEntry, getRecentEntries, getWeeksOfMonth,
  type EntrySource, type CostClassification
} from '@/lib/finance';
import CostModal from '@/components/CostModal';
import EntryModal from '@/components/EntryModal';
import FeedbackToast from '@/components/FeedbackToast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type Period = 'dia' | 'semana' | 'mes';

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtShort(value: number) {
  return fmt(value);
}

function formatDateLabel(dateStr: string) {
  const today = getDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);
  if (dateStr === today) return 'Hoje';
  if (dateStr === yesterdayStr) return 'Ontem';
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

function getLast14Days(): string[] {
  const days: string[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDateString(d));
  }
  return days;
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDateString(d));
  }
  return days;
}

// getWeeksOfMonth moved to @/lib/finance (single source of truth)

export default function Movimentacoes() {
  const navigate = useNavigate();
  const state = useStore();
  const isPersonal = state.businessType === 'pessoal';
  const config = businessConfigs[state.businessType!];
  const glossary = getModeCopyFromType(state.businessType).glossary;
  const costs = getRecentCosts();
  const allEntries = getRecentEntries(100);
  const visibleEntries = allEntries.filter((e) => e.source !== 'distributed');
  const [period, setPeriod] = useState<Period>(isPersonal ? 'mes' : 'dia');
  const [showCost, setShowCost] = useState(false);
  const [showEntry, setShowEntry] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingPeriod, setEditingPeriod] = useState<'semana' | 'mes' | null>(null);
  const [periodEditValue, setPeriodEditValue] = useState('');
  const [, setTick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const periodInputRef = useRef<HTMLInputElement>(null);
  const today = getDateString();

  // Auto-refresh when the date changes (e.g. app open at midnight)
  useEffect(() => {
    let currentDate = getDateString();
    const interval = setInterval(() => {
      const now = getDateString();
      if (now !== currentDate) {
        currentDate = now;
        setTick(t => t + 1);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const todaySummary = getDaySummary(today);
  const weekSummary = getWeekSummary();
  const monthSummary = getMonthSummary();
  const prevWeek = getPreviousWeekSummary();
  const weekData = getWeekDailyData(true).map(d => {
    const s = getDaySummary(d.date);
    const opProfit = s.totalRevenue - s.totalCosts;
    return {
      ...d,
      cost: s.totalCosts,
      profit: opProfit,
      margin: s.totalRevenue > 0 ? (opProfit / s.totalRevenue) * 100 : 0,
    };
  });
  const insights = getSmartInsights();

  const weekChange = prevWeek.totalRevenue > 0
    ? ((weekSummary.totalRevenue - prevWeek.totalRevenue) / prevWeek.totalRevenue * 100)
    : 0;

  useEffect(() => {
    if (editingDate) setTimeout(() => inputRef.current?.focus(), 50);
  }, [editingDate]);

  useEffect(() => {
    if (editingPeriod) setTimeout(() => periodInputRef.current?.focus(), 50);
  }, [editingPeriod]);

  const handleSaveDayRevenue = (date: string) => {
    const num = parseFloat(editValue.replace(',', '.'));
    if (num >= 0 && !isNaN(num)) {
      setDayRevenue(date, num, 'manual');
      const summary = getDaySummary(date);
      setFeedback(`${formatDateLabel(date)}: ${fmt(num)} · Lucro: ${fmt(summary.profit)}`);
      setTimeout(() => setFeedback(null), 3000);
    }
    setEditingDate(null);
    setEditValue('');
  };

  const handleSavePeriodRevenue = () => {
    const num = parseFloat(periodEditValue.replace(',', '.'));
    if (num >= 0 && !isNaN(num) && editingPeriod) {
      if (editingPeriod === 'semana') {
        // Last 7 days
        const allDates: string[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          allDates.push(getDateString(d));
        }
        const operatingDates = allDates.filter(d => isOperatingDay(d));
        const activeDays = operatingDates.length || 1;
        const perDay = num / activeDays;
        allDates.forEach(dateStr => {
          if (isOperatingDay(dateStr)) {
            setDayRevenue(dateStr, perDay, 'distributed');
          }
        });
        setFeedback(`Receita distribuída em ${activeDays} dias úteis (${fmt(perDay)}/dia)`);
      } else {
        // Full calendar month: divide by all operating days and apply to the whole month
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const allMonthDates: string[] = [];
        for (let d = 1; d <= daysInMonth; d++) {
          allMonthDates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
        }

        const operatingDates = allMonthDates.filter(dateStr => isOperatingDay(dateStr));
        const totalOperatingDays = operatingDates.length || 1;
        const perDay = num / totalOperatingDays;

        operatingDates.forEach(dateStr => {
          setDayRevenue(dateStr, perDay, 'distributed');
        });

        setFeedback(`Receita de ${fmt(num)} distribuída em ${totalOperatingDays} dias úteis (${fmt(perDay)}/dia)`);
      }
      setTimeout(() => setFeedback(null), 4000);
    }
    setEditingPeriod(null);
    setPeriodEditValue('');
  };

  const startEditing = (date: string) => {
    const current = getDayRevenue(date);
    setEditingDate(date);
    setEditValue(current > 0 ? current.toString() : '');
  };

  const startPeriodEdit = (p: 'semana' | 'mes') => {
    const current = p === 'semana' ? weekSummary.totalRevenue : monthSummary.totalRevenue;
    setEditingPeriod(p);
    setPeriodEditValue(current > 0 ? current.toFixed(0) : '');
  };

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number, description?: string, category?: string, subcategory?: string, classification?: CostClassification) => {
    registerCost(amount, type, spreadDays, description, category, subcategory, classification);
    setShowCost(false);
    const updated = getDaySummary(today);
    setFeedback(`Custo registrado · Lucro: ${fmt(updated.profit)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const days14 = getLast14Days();

  // Average revenue for comparison
  const avgRevenue = useMemo(() => {
    const daysWithRevenue = days14.filter(d => getDayRevenue(d) > 0);
    if (daysWithRevenue.length === 0) return 0;
    return daysWithRevenue.reduce((s, d) => s + getDayRevenue(d), 0) / daysWithRevenue.length;
  }, [days14]);

  const weeksOfMonth = useMemo(() => getWeeksOfMonth(), []);
  const [editingWeekIdx, setEditingWeekIdx] = useState<number | null>(null);
  const [weekEditValue, setWeekEditValue] = useState('');
  const weekInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingWeekIdx !== null) setTimeout(() => weekInputRef.current?.focus(), 50);
  }, [editingWeekIdx]);

  const startWeekEdit = (idx: number) => {
    // For the current week (last item in weeksOfMonth, idx === 3), use
    // weekSummary.totalRevenue so the prefilled value matches the rest of the
    // page. Older weeks keep using weeksOfMonth (historical chart data).
    const week = weeksOfMonth[idx];
    const isCurrentWeek = idx === weeksOfMonth.length - 1;
    const prefill = isCurrentWeek ? weekSummary.totalRevenue : week.revenue;
    setEditingWeekIdx(idx);
    setWeekEditValue(prefill > 0 ? prefill.toFixed(0) : '');
  };

  const handleSaveWeekRevenue = () => {
    const num = parseFloat(weekEditValue.replace(',', '.'));
    if (num >= 0 && !isNaN(num) && editingWeekIdx !== null) {
      const weekOffset = (3 - editingWeekIdx) * 7;
      const operatingDates: string[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date();
        date.setDate(date.getDate() - (weekOffset + d));
        const dateStr = getDateString(date);
        if (isOperatingDay(dateStr)) operatingDates.push(dateStr);
      }
      const activeDays = operatingDates.length || 1;
      const perDay = num / activeDays;
      operatingDates.forEach(dateStr => setDayRevenue(dateStr, perDay, 'distributed'));
      setFeedback(`Semana ${editingWeekIdx + 1}: ${fmt(num)} em ${activeDays} dias úteis (${fmt(perDay)}/dia)`);
      setTimeout(() => setFeedback(null), 4000);
    }
    setEditingWeekIdx(null);
    setWeekEditValue('');
  };

  const sourceLabel = (source: EntrySource): string => {
    switch (source) {
      case 'manual': return 'Informado pelo usuário';
      case 'distributed': return '';
      case 'estimated': return 'Estimado com base na média';
      case 'onboarding': return 'Automática do onboarding';
      default: return '';
    }
  };

  const sourceColor = (source: EntrySource): string => {
    switch (source) {
      case 'manual': return 'text-primary';
      case 'distributed': return 'text-accent';
      case 'estimated': return 'text-muted-foreground';
      case 'onboarding': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const handleAddEntry = (data: { amount: number; description: string; category: string; date: string }) => {
    if (editingEntryId) {
      updateEntry(editingEntryId, data);
      setEditingEntryId(null);
      setShowEntry(false);
      setFeedback(`Movimentação atualizada: ${fmt(data.amount)}`);
    } else {
      addEntry(data.amount, data.description, data.category, 'manual', data.date);
      setShowEntry(false);
      setFeedback(`${isPersonal ? 'Entrada' : 'Receita'} registrada: ${fmt(data.amount)}`);
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const openEditEntry = (id: string) => {
    setEditingEntryId(id);
    setShowEntry(true);
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    setFeedback('Movimentação removida');
    setTimeout(() => setFeedback(null), 2500);
  };

  const editingEntryData = editingEntryId
    ? (() => {
        const e = allEntries.find((x) => x.id === editingEntryId);
        return e ? { amount: e.amount, description: e.description || '', category: e.category || '', date: e.date } : null;
      })()
    : null;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto safe-bottom pb-24">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
          {isPersonal ? 'Suas finanças' : 'Movimentações'}
        </h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          {isPersonal ? 'Entradas, gastos e quanto sobrou' : 'Receitas e custos do seu negócio'}
        </p>
      </div>

      {/* ═══════ PERSONAL MODE ═══════ */}
      {isPersonal ? (
        <>
          {/* Month summary cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Entradas', value: monthSummary.totalRevenue, color: 'text-primary' },
              { label: 'Gastos', value: monthSummary.totalCosts, color: 'text-destructive/80' },
              { label: 'Sobrou', value: monthSummary.totalRevenue - monthSummary.totalCosts, color: (monthSummary.totalRevenue - monthSummary.totalCosts) >= 0 ? 'text-primary' : 'text-destructive' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl card-elevated"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{item.label}</p>
                <p className={`text-sm font-bold ${item.color}`}>{fmtShort(item.value)}</p>
              </motion.div>
            ))}
          </div>

          {/* Monthly income input */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 card-elevated mb-4 border-l-4 border-l-primary"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold text-foreground">Renda mensal</p>
              </div>
              <span className="text-[10px] text-muted-foreground">
                Sobrou: <span className={monthSummary.profit >= 0 ? 'text-primary font-medium' : 'text-destructive font-medium'}>{fmt(monthSummary.profit)}</span>
              </span>
            </div>

            {editingPeriod === 'mes' ? (
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-muted-foreground">R$</span>
                <input
                  ref={periodInputRef}
                  type="number"
                  inputMode="decimal"
                  placeholder="Ex: 3.000"
                  value={periodEditValue}
                  onChange={(e) => setPeriodEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePeriodRevenue()}
                  className="flex-1 text-xl font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                />
                <button onClick={handleSavePeriodRevenue} className="p-2 rounded-lg bg-primary text-primary-foreground active:scale-95 transition-all">
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => startPeriodEdit('mes')} className="w-full flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all group">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                  <span className="text-base font-bold text-foreground">
                    {monthSummary.totalRevenue > 0 ? fmt(monthSummary.totalRevenue) : 'Informar renda mensal'}
                  </span>
                </div>
                <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {monthSummary.totalRevenue > 0 && (
              <div className="flex gap-3 mt-3 pt-3 border-t border-border/50">
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-muted-foreground">Entradas</p>
                  <p className="text-xs font-semibold text-foreground">{fmtShort(monthSummary.totalRevenue)}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-muted-foreground">Gastos</p>
                  <p className="text-xs font-semibold text-destructive/80">{fmtShort(monthSummary.totalCosts)}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-muted-foreground">Sobrou</p>
                  <p className={`text-xs font-bold ${monthSummary.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>{fmtShort(monthSummary.profit)}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Entradas registradas */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {isPersonal ? 'Entradas registradas' : 'Receitas registradas'}
              </p>
              <span className="text-[10px] text-muted-foreground">{visibleEntries.length} registros</span>
            </div>
            {visibleEntries.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {visibleEntries.slice(0, 10).map((e, i) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-xl card-elevated group"
                  >
                    <button
                      onClick={() => openEditEntry(e.id)}
                      className="flex items-center gap-2.5 flex-1 text-left"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10">
                        <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground truncate">{fmt(e.amount)}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {e.description || e.category || (isPersonal ? 'Entrada' : 'Receita')}
                          {e.category && e.description ? ` · ${e.category}` : ''}
                          {' · '}{formatDateLabel(e.date)}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditEntry(e.id)}
                        className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all"
                        aria-label="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(e.id)}
                        className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-xl card-elevated">
                <p className="text-muted-foreground text-xs">{isPersonal ? 'Nenhuma entrada registrada' : 'Nenhuma receita registrada'}</p>
              </div>
            )}
          </div>

          {/* Gastos recentes */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Gastos recentes</p>
              <span className="text-[10px] text-muted-foreground">{costs.length} registros</span>
            </div>
            {costs.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {costs.slice(0, 8).map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-xl card-elevated group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-destructive/10">
                        <ArrowDownRight className="h-3.5 w-3.5 text-destructive/70" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-foreground">{fmt(getCostAnalysisAmount(c))}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {c.description || 'Gasto'}
                          {' · '}{formatDateLabel(c.date)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCost(c.id)}
                      className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-xl card-elevated">
                <p className="text-muted-foreground text-xs">Nenhum gasto registrado</p>
              </div>
            )}
          </div>

          {/* Floating Actions — Personal */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEntry(true)}
              className="px-5 py-3 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar entrada
            </motion.button>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/custos')}
              className="px-4 py-3 rounded-2xl bg-card border border-border text-foreground font-semibold text-sm shadow-lg flex items-center gap-2"
            >
              <ArrowDownRight className="h-4 w-4 text-destructive/70" />
              Gasto
            </motion.button>
          </div>

          <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
          <EntryModal
            open={showEntry}
            onClose={() => { setShowEntry(false); setEditingEntryId(null); }}
            onSubmit={handleAddEntry}
            isPersonal={true}
            initial={editingEntryData}
            mode={editingEntryId ? 'edit' : 'create'}
          />
          <FeedbackToast message={feedback} />
        </>
      ) : (
      /* ═══════ BUSINESS MODE (original) ═══════ */
      <>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Diário', revenue: todaySummary.totalRevenue, profit: todaySummary.totalRevenue - todaySummary.totalCosts },
          { label: 'Semana', revenue: weekSummary.totalRevenue, profit: weekSummary.profit },
          { label: 'Mês', revenue: monthSummary.totalRevenue, profit: monthSummary.profit },

        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setPeriod(i === 0 ? 'dia' : i === 1 ? 'semana' : 'mes')}
            className={`p-3 rounded-xl cursor-pointer transition-all ${
              (i === 0 && period === 'dia') || (i === 1 && period === 'semana') || (i === 2 && period === 'mes')
                ? 'card-elevated border-primary/30 ring-1 ring-primary/20'
                : 'card-elevated hover:border-border'
            }`}
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{item.label}</p>
            <p className="text-sm font-bold text-foreground">{fmtShort(item.revenue)}</p>
            <p className={`text-[10px] font-medium flex items-center gap-0.5 mt-0.5 ${item.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {item.profit >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {fmtShort(item.profit)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Period Toggle */}
      <div className="flex gap-1 mb-4 p-0.5 rounded-lg bg-secondary/50">
        {(['dia', 'semana', 'mes'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-md font-medium text-xs transition-all ${
              period === p
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p === 'dia' ? 'Dia' : p === 'semana' ? 'Semana' : 'Mês'}
          </button>
        ))}
      </div>


      <AnimatePresence mode="wait">
        {/* ───── DIA ───── */}
        {period === 'dia' && (
          <motion.div key="dia" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Today Input */}
            <div className="rounded-xl p-4 card-elevated mb-3 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">Hoje</p>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Lucro: <span className={(todaySummary.totalRevenue - todaySummary.totalCosts) >= 0 ? 'text-primary font-medium' : 'text-destructive font-medium'}>{fmt(todaySummary.totalRevenue - todaySummary.totalCosts)}</span>

                </span>
              </div>

              {editingDate === today ? (
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-muted-foreground">R$</span>
                  <input
                    ref={inputRef}
                    type="number"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveDayRevenue(today)}
                    className="flex-1 text-xl font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                  />
                  <button onClick={() => handleSaveDayRevenue(today)} className="p-2 rounded-lg bg-primary text-primary-foreground active:scale-95 transition-all">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => startEditing(today)} className="w-full flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all group">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-base font-bold text-foreground">
                        {getDayRevenue(today) > 0 ? fmt(getDayRevenue(today)) : 'Registrar receita do dia'}
                      </span>
                      {getDayRevenue(today) > 0 && sourceLabel(getDayRevenueSource(today)) && (
                        <p className={`text-[10px] ${sourceColor(getDayRevenueSource(today))}`}>
                          {sourceLabel(getDayRevenueSource(today))}
                        </p>
                      )}
                    </div>
                  </div>
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}

              {/* Revenue / Cost / Profit breakdown */}
              {todaySummary.totalRevenue > 0 && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-border/50">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground">Receita</p>
                    <p className="text-xs font-semibold text-foreground">{fmtShort(todaySummary.totalRevenue)}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground">Custos</p>
                    <p className="text-xs font-semibold text-destructive/80">{fmtShort(todaySummary.totalCosts)}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground">Lucro</p>
                    <p className={`text-xs font-bold ${(todaySummary.totalRevenue - todaySummary.totalCosts) >= 0 ? 'text-primary' : 'text-destructive'}`}>{fmtShort(todaySummary.totalRevenue - todaySummary.totalCosts)}</p>
                  </div>

                </div>
              )}
            </div>

            {/* Recent days list */}
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 px-1">Últimos 14 dias</p>
            <div className="flex flex-col gap-1.5">
              {days14.slice(1).map((date, i) => {
                const operating = isOperatingDay(date);
                const revenue = getDayRevenue(date);
                const summary = getDaySummary(date);
                const isEditing = editingDate === date;
                const aboveAvg = avgRevenue > 0 && revenue > avgRevenue;
                const belowAvg = avgRevenue > 0 && revenue > 0 && revenue < avgRevenue;
                const source = getDayRevenueSource(date);

                return (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center justify-between p-3 rounded-xl card-elevated group transition-all ${!operating ? 'opacity-50' : 'hover:border-primary/20'}`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-bold text-muted-foreground">R$</span>
                        <input
                          ref={inputRef}
                          type="number"
                          inputMode="decimal"
                          placeholder="0,00"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveDayRevenue(date)}
                          className="flex-1 text-base font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                        />
                        <button onClick={() => handleSaveDayRevenue(date)} className="p-1.5 rounded-lg bg-primary text-primary-foreground active:scale-95">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 cursor-pointer flex-1" onClick={() => startEditing(date)}>
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">{formatDateLabel(date)}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-sm text-foreground">
                                {!operating && revenue === 0 ? <span className="text-muted-foreground text-xs">Fechado</span> : revenue > 0 ? fmt(revenue) : <span className="text-muted-foreground text-xs">—</span>}
                              </p>
                              {aboveAvg && <TrendingUp className="h-3 w-3 text-primary" />}
                              {belowAvg && <TrendingDown className="h-3 w-3 text-destructive/60" />}
                            </div>
                            {revenue > 0 && (
                              <p className="text-[10px] text-muted-foreground">
                                Lucro: <span className={(summary.totalRevenue - summary.totalCosts) >= 0 ? 'text-primary' : 'text-destructive'}>{fmt(summary.totalRevenue - summary.totalCosts)}</span>

                                {aboveAvg && <span className="ml-1 text-primary/60">acima da média</span>}
                                {belowAvg && <span className="ml-1 text-destructive/50">abaixo da média</span>}
                                {sourceLabel(source) && <span className={`ml-1.5 ${sourceColor(source)}`}>· {sourceLabel(source)}</span>}
                              </p>
                            )}
                          </div>
                        </div>
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => startEditing(date)} />
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ───── SEMANA ───── */}
        {period === 'semana' && (
          <motion.div key="semana" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Week chart — Receita, Custo, Lucro */}
            <div className="rounded-xl p-4 card-elevated mb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">Receita vs Custo (dias operacionais)</p>
                </div>
                {weekChange !== 0 && (
                  <span className={`text-[10px] font-medium flex items-center gap-0.5 ${weekChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {weekChange >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {weekChange >= 0 ? '+' : ''}{weekChange.toFixed(0)}% vs semana anterior
                  </span>
                )}
              </div>
              {weekData.length > 0 ? (
                <div className="space-y-2">
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekData} barSize={16} barGap={2}>
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                          formatter={(value: number, name: string) => [fmt(value), name]}
                          labelFormatter={(label) => label}
                        />
                        <Bar dataKey="revenue" name="Receita" fill="hsl(var(--primary))" opacity={0.8} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cost" name="Custo" fill="hsl(var(--accent))" opacity={0.7} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Profit row */}
                  <div className="flex gap-1">
                    {weekData.map((d) => (
                      <div key={d.date} className="flex-1 text-center">
                        <p className={`text-[9px] font-bold ${d.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {d.profit !== 0 ? (d.profit >= 0 ? '+' : '') + fmtShort(d.profit) : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados para exibir</p>
              )}
            </div>

            {/* Week breakdown */}
            <div className="rounded-xl p-4 card-elevated mb-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center justify-between">
                Resumo da semana
                <button onClick={() => startPeriodEdit('semana')} className="text-primary text-[10px] font-medium hover:underline flex items-center gap-1">
                  <Edit2 className="h-2.5 w-2.5" /> Editar faturamento semanal
                </button>
              </p>

              {editingPeriod === 'semana' && (
                <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
                  <span className="text-sm font-bold text-muted-foreground">R$</span>
                  <input
                    ref={periodInputRef}
                    type="number"
                    inputMode="decimal"
                    placeholder="Receita total da semana"
                    value={periodEditValue}
                    onChange={(e) => setPeriodEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSavePeriodRevenue()}
                    className="flex-1 text-lg font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                  />
                  <button onClick={handleSavePeriodRevenue} className="p-2 rounded-lg bg-primary text-primary-foreground active:scale-95 transition-all">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Receita</p>
                  <p className="text-sm font-bold text-foreground">{fmtShort(weekSummary.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Custos</p>
                  <p className="text-sm font-bold text-destructive/80">{fmtShort(weekSummary.totalCosts)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Lucro</p>
                  <p className={`text-sm font-bold ${(weekSummary.totalRevenue - weekSummary.totalCosts) >= 0 ? 'text-primary' : 'text-destructive'}`}>{fmtShort(weekSummary.totalRevenue - weekSummary.totalCosts)}</p>
                </div>
              </div>
              {weekSummary.totalRevenue > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Margem de lucro</span>
                    <span className={`text-xs font-bold ${weekSummary.margin >= 20 ? 'text-primary' : 'text-destructive'}`}>{Math.round(weekSummary.margin)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary mt-1.5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${weekSummary.margin >= 20 ? 'bg-primary' : 'bg-destructive'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(weekSummary.margin, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Daily detail list — editable */}
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 px-1">Dias da semana</p>
            <div className="flex flex-col gap-1.5">
              {weekData.map((day, i) => {
                const isEditing = editingDate === day.date;
                return (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-xl card-elevated group hover:border-primary/20 transition-all"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-bold text-muted-foreground">R$</span>
                        <input
                          ref={inputRef}
                          type="number"
                          inputMode="decimal"
                          placeholder="0,00"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveDayRevenue(day.date)}
                          className="flex-1 text-base font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                        />
                        <button onClick={() => handleSaveDayRevenue(day.date)} className="p-1.5 rounded-lg bg-primary text-primary-foreground active:scale-95">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 cursor-pointer flex-1" onClick={() => startEditing(day.date)}>
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">{day.label}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{day.revenue > 0 ? fmt(day.revenue) : '—'}</p>
                            {day.revenue > 0 && (
                              <p className="text-[10px] text-muted-foreground">
                                Custo: {fmtShort(day.cost)} · Lucro: <span className={day.profit >= 0 ? 'text-primary' : 'text-destructive'}>{fmtShort(day.profit)}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {day.revenue > 0 && (
                            <span className={`text-[10px] font-medium ${day.margin >= 20 ? 'text-primary' : 'text-destructive/70'}`}>
                              {day.margin.toFixed(0)}%
                            </span>
                          )}
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => startEditing(day.date)} />
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ───── MÊS ───── */}
        {period === 'mes' && (
          <motion.div key="mes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Month summary */}
            <div className="rounded-xl p-4 card-elevated mb-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center justify-between">
                Resumo do mês
                <button onClick={() => startPeriodEdit('mes')} className="text-primary text-[10px] font-medium hover:underline flex items-center gap-1">
                  <Edit2 className="h-2.5 w-2.5" /> Editar faturamento mensal
                </button>
              </p>

              {editingPeriod === 'mes' && (
                <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
                  <span className="text-sm font-bold text-muted-foreground">R$</span>
                  <input
                    ref={periodInputRef}
                    type="number"
                    inputMode="decimal"
                    placeholder="Receita total do mês"
                    value={periodEditValue}
                    onChange={(e) => setPeriodEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSavePeriodRevenue()}
                    className="flex-1 text-lg font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                  />
                  <button onClick={handleSavePeriodRevenue} className="p-2 rounded-lg bg-primary text-primary-foreground active:scale-95 transition-all">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Receita</p>
                  <p className="text-sm font-bold text-foreground">{fmtShort(monthSummary.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Custos</p>
                  <p className="text-sm font-bold text-destructive/80">{fmtShort(monthSummary.totalCosts)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Lucro</p>
                  <p className={`text-sm font-bold ${(monthSummary.totalRevenue - monthSummary.totalCosts) >= 0 ? 'text-primary' : 'text-destructive'}`}>{fmtShort(monthSummary.totalRevenue - monthSummary.totalCosts)}</p>
                </div>
              </div>
              {monthSummary.totalRevenue > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">Margem</span>
                  <span className={`text-xs font-bold ${monthSummary.margin >= 20 ? 'text-primary' : 'text-destructive'}`}>{Math.round(monthSummary.margin)}%</span>
                </div>
              )}
            </div>

            {/* Weekly chart */}
            <div className="rounded-xl p-4 card-elevated mb-3">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold text-foreground">Receita por semana</p>
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeksOfMonth} barSize={28}>
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(value: number) => [fmt(value), '']}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" opacity={0.8} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weeks detail */}
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 px-1">Semanas do mês</p>
            <div className="flex flex-col gap-1.5">
              {weeksOfMonth.map((week, i) => (
                <motion.div
                  key={week.label}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl card-elevated group hover:border-primary/20 transition-all cursor-pointer"
                  onClick={() => editingWeekIdx !== i && startWeekEdit(i)}
                >
                  {editingWeekIdx === i ? (
                    <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                      <span className="text-sm font-bold text-muted-foreground">R$</span>
                      <input
                        ref={weekInputRef}
                        type="number"
                        inputMode="decimal"
                        placeholder="Receita total da semana"
                        value={weekEditValue}
                        onChange={(e) => setWeekEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveWeekRevenue()}
                        className="flex-1 text-base font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                      />
                      <button onClick={handleSaveWeekRevenue} className="p-1.5 rounded-lg bg-primary text-primary-foreground active:scale-95">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{week.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Receita: {fmtShort(week.revenue)} · Custo: {fmtShort(week.cost)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`text-sm font-bold ${week.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>{fmtShort(week.profit)}</p>
                          <p className="text-[10px] text-muted-foreground">lucro</p>
                        </div>
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Editable daily list for month */}
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 mt-4 px-1">Últimos 30 dias</p>
            <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
              {getLast30Days().map((date, i) => {
                const revenue = getDayRevenue(date);
                const summary = getDaySummary(date);
                const isEditing = editingDate === date;
                return (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="flex items-center justify-between p-3 rounded-xl card-elevated group hover:border-primary/20 transition-all"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-bold text-muted-foreground">R$</span>
                        <input
                          ref={inputRef}
                          type="number"
                          inputMode="decimal"
                          placeholder="0,00"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveDayRevenue(date)}
                          className="flex-1 text-base font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                        />
                        <button onClick={() => handleSaveDayRevenue(date)} className="p-1.5 rounded-lg bg-primary text-primary-foreground active:scale-95">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 cursor-pointer flex-1" onClick={() => startEditing(date)}>
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">{formatDateLabel(date)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {revenue > 0 ? fmt(revenue) : <span className="text-muted-foreground text-xs">—</span>}
                            </p>
                            {revenue > 0 && (
                              <p className="text-[10px] text-muted-foreground">
                                Lucro: <span className={summary.profit >= 0 ? 'text-primary' : 'text-destructive'}>{fmt(summary.profit)}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => startEditing(date)} />
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receitas registradas */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Receitas registradas</p>
          <span className="text-[10px] text-muted-foreground">{visibleEntries.length} registros</span>
        </div>
        {visibleEntries.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {visibleEntries.slice(0, 8).map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl card-elevated group"
              >
                <button onClick={() => openEditEntry(e.id)} className="flex items-center gap-2.5 flex-1 text-left">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10">
                    <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-foreground truncate">{fmt(e.amount)}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {e.description || e.category || 'Receita'}
                      {e.category && e.description ? ` · ${e.category}` : ''}
                      {' · '}{formatDateLabel(e.date)}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditEntry(e.id)}
                    className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all"
                    aria-label="Editar"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(e.id)}
                    className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl card-elevated">
            <p className="text-muted-foreground text-xs">Nenhuma receita registrada</p>
          </div>
        )}
      </div>

      {/* Costs Section */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Custos recentes</p>
          <span className="text-[10px] text-muted-foreground">{costs.length} registros</span>
        </div>
        {costs.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {costs.slice(0, 5).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl card-elevated group"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.type === 'product' ? 'bg-accent/10' : 'bg-purple-500/10'}`}>
                    {c.type === 'product' ? <Package className="h-3.5 w-3.5 text-accent" /> : <Building2 className="h-3.5 w-3.5 text-purple-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-foreground">{fmt(getCostAnalysisAmount(c))}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {c.description || (c.type === 'product' ? config.productCostLabel : config.businessCostLabel)}
                      {' · '}{formatDateLabel(c.date)}
                      {c.id.startsWith('costmap-') && (
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-semibold">Mapa</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteCost(c.id)}
                  className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl card-elevated">
            <p className="text-muted-foreground text-xs">Nenhum custo registrado</p>
          </div>
        )}
      </div>

      {/* Floating Actions */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowEntry(true)}
          className="px-5 py-3 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {glossary.addInflow}
        </motion.button>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/custos')}
          className="px-4 py-3 rounded-2xl bg-card border border-border text-foreground font-semibold text-sm shadow-lg flex items-center gap-2"
        >
          <ArrowDownRight className="h-4 w-4 text-destructive/70" />
          {glossary.addOutflow}
        </motion.button>
      </div>

      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <EntryModal
        open={showEntry}
        onClose={() => { setShowEntry(false); setEditingEntryId(null); }}
        onSubmit={handleAddEntry}
        isPersonal={false}
        initial={editingEntryData}
        mode={editingEntryId ? 'edit' : 'create'}
      />
      <FeedbackToast message={feedback} />
      </>
      )}
    </div>
  );
}
