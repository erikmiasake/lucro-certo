import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ArrowUpRight, ArrowDownRight, Trash2, Calendar } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import {
  getRecentCosts, deleteCost, registerCost,
  getDaySummary, getDateString, getWeekSummary, getMonthSummary,
  addEntry, getAllTransactions,
  type CostClassification,
} from '@/lib/store';
import EntryModal from '@/components/EntryModal';
import CostModal from '@/components/CostModal';
import FeedbackToast from '@/components/FeedbackToast';

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDateLabel(dateStr: string) {
  const today = getDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === today) return 'Hoje';
  if (dateStr === y) return 'Ontem';
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

type FilterType = 'todas' | 'entrada' | 'saida';

export default function Movimentacoes() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const today = getDateString();
  const todaySummary = getDaySummary(today);
  const weekSummary = getWeekSummary();
  const monthSummary = getMonthSummary();

  const [showEntry, setShowEntry] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('todas');

  const transactions = useMemo(() => getAllTransactions(), [state]);

  const filtered = useMemo(() => {
    if (filter === 'todas') return transactions;
    return transactions.filter(t => t.tipo === filter);
  }, [transactions, filter]);

  const handleEntry = (amount: number) => {
    addEntry(amount);
    setShowEntry(false);
    const updated = getDaySummary(today);
    setFeedback(`Entrada registrada · Lucro: ${fmt(updated.profit)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number, description?: string, category?: string, subcategory?: string, classification?: CostClassification) => {
    registerCost(amount, type, spreadDays, description, category, subcategory, classification);
    setShowCost(false);
    const updated = getDaySummary(today);
    setFeedback(`Saída registrada · Lucro: ${fmt(updated.profit)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = (id: string, tipo: string) => {
    if (tipo === 'saida') {
      deleteCost(id);
      setFeedback('Custo removido');
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  // Group transactions by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const t of filtered) {
      if (!groups[t.data]) groups[t.data] = [];
      groups[t.data].push(t);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto safe-bottom pb-24">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Movimentações</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Todas as entradas e saídas do seu negócio</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Hoje', profit: todaySummary.profit },
          { label: 'Semana', profit: weekSummary.profit },
          { label: 'Mês', profit: monthSummary.profit },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl card-elevated"
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{item.label}</p>
            <p className={`text-sm font-bold ${item.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {fmt(item.profit)}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">lucro</p>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setShowEntry(true)}
          className="flex-1 py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Entrada
        </button>
        <button
          onClick={() => setShowCost(true)}
          className="flex-1 py-3.5 rounded-xl card-elevated text-foreground font-semibold text-sm active:scale-[0.97] transition-all hover:border-accent/40 flex items-center justify-center gap-2"
        >
          <Minus className="h-4 w-4 text-accent" />
          Saída
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-4 p-0.5 rounded-lg bg-secondary/50">
        {([
          { key: 'todas', label: 'Todas' },
          { key: 'entrada', label: 'Entradas' },
          { key: 'saida', label: 'Saídas' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-md font-medium text-xs transition-all ${
              filter === key ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma movimentação encontrada</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Registre entradas e saídas usando os botões acima</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 px-1">
                {formatDateLabel(date)}
              </p>
              <div className="flex flex-col gap-1">
                {items.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-3 rounded-xl card-elevated group hover:border-primary/15 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        t.tipo === 'entrada' ? 'bg-primary/10' : 'bg-accent/10'
                      }`}>
                        {t.tipo === 'entrada'
                          ? <ArrowUpRight className="h-4 w-4 text-primary" />
                          : <ArrowDownRight className="h-4 w-4 text-accent" />
                        }
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${t.tipo === 'entrada' ? 'text-primary' : 'text-accent'}`}>
                          {t.tipo === 'entrada' ? '+' : '-'}{fmt(t.valor)}
                        </p>
                        {t.categoria && (
                          <p className="text-[10px] text-muted-foreground">{t.categoria}</p>
                        )}
                      </div>
                    </div>
                    {t.tipo === 'saida' && (
                      <button
                        onClick={() => handleDelete(t.id, t.tipo)}
                        className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <EntryModal open={showEntry} onClose={() => setShowEntry(false)} onSubmit={handleEntry} label={config.entryLabel} />
      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
