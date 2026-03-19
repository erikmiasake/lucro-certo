import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, ArrowUpRight, ArrowDownRight, CalendarDays, TrendingUp, Check, Edit2 } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getRecentCosts, deleteCost, setDayRevenue, getDayRevenue, addCost, getDaySummary, getDateString, getRecentEntries, deleteEntry } from '@/lib/store';
import CostModal from '@/components/CostModal';
import FeedbackToast from '@/components/FeedbackToast';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  const today = getDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  if (dateStr === today) return 'Hoje';
  if (dateStr === yesterdayStr) return 'Ontem';
  return `${d}/${m}`;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDateString(d));
  }
  return days;
}

export default function Movimentacoes() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const costs = getRecentCosts();
  const [tab, setTab] = useState<'entradas' | 'custos'>('entradas');
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const today = getDateString();
  const days = getLast7Days();

  useEffect(() => {
    if (editingDate) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [editingDate]);

  const handleSaveDayRevenue = (date: string) => {
    const num = parseFloat(editValue.replace(',', '.'));
    if (num >= 0 && !isNaN(num)) {
      setDayRevenue(date, num);
      const summary = getDaySummary(date);
      setFeedback(`${formatDateLabel(date)}: ${formatCurrency(num)} · Lucro: ${formatCurrency(summary.profit)}`);
      setTimeout(() => setFeedback(null), 3000);
    }
    setEditingDate(null);
    setEditValue('');
  };

  const startEditing = (date: string) => {
    const current = getDayRevenue(date);
    setEditingDate(date);
    setEditValue(current > 0 ? current.toString() : '');
  };

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number, description?: string, category?: string, subcategory?: string, classification?: any) => {
    addCost(amount, type, spreadDays, description, category, subcategory, classification);
    setShowCost(false);
    const updated = getDaySummary(today);
    setFeedback(`Custo registrado! Lucro: ${formatCurrency(updated.profit)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const todaySummary = getDaySummary(today);

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto safe-bottom">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Movimentações</h1>
        <p className="text-muted-foreground text-sm mt-1">Registre a receita total de cada dia</p>
      </div>

      {/* Today highlight */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 card-elevated mb-5 border-l-4 border-l-primary">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Hoje</p>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">
              Lucro: <span className={todaySummary.profit >= 0 ? 'text-primary font-medium' : 'text-destructive font-medium'}>{formatCurrency(todaySummary.profit)}</span>
            </span>
          </div>
        </div>

        {editingDate === today ? (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-muted-foreground">R$</span>
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              placeholder="0,00"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveDayRevenue(today)}
              className="flex-1 text-2xl font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
            />
            <button
              onClick={() => handleSaveDayRevenue(today)}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground active:scale-95 transition-all"
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => startEditing(today)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-all group"
          >
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-foreground">
                {getDayRevenue(today) > 0 ? formatCurrency(getDayRevenue(today)) : 'Informar receita do dia'}
              </span>
            </div>
            <Edit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 rounded-xl bg-secondary/50">
        <button
          onClick={() => setTab('entradas')}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            tab === 'entradas'
              ? 'bg-card text-primary shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          Receita diária
        </button>
        <button
          onClick={() => setTab('custos')}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            tab === 'custos'
              ? 'bg-card text-accent shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowDownRight className="h-4 w-4" />
          Custos ({costs.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        {tab === 'entradas' ? (
          /* Daily revenue list - last 7 days */
          days.slice(1).map((date, i) => {
            const revenue = getDayRevenue(date);
            const summary = getDaySummary(date);
            const isEditing = editingDate === date;

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-4 rounded-xl card-elevated group hover:border-primary/20 transition-all"
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
                      className="flex-1 text-lg font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                    />
                    <button
                      onClick={() => handleSaveDayRevenue(date)}
                      className="p-2 rounded-lg bg-primary text-primary-foreground active:scale-95 transition-all"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => startEditing(date)}>
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{formatDateLabel(date)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {revenue > 0 ? formatCurrency(revenue) : <span className="text-muted-foreground">—</span>}
                        </p>
                        {revenue > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Lucro: <span className={summary.profit >= 0 ? 'text-primary' : 'text-destructive'}>{formatCurrency(summary.profit)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <Edit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => startEditing(date)} />
                  </>
                )}
              </motion.div>
            );
          })
        ) : (
          <>
            <button
              onClick={() => setShowCost(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground font-medium text-sm mb-2 active:scale-[0.98] transition-all hover:border-primary/30 hover:text-primary flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar custo
            </button>
            {costs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <ArrowDownRight className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Nenhum custo registrado</p>
              </div>
            ) : (
              costs.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 rounded-xl card-elevated group hover:border-accent/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.type === 'product' ? 'bg-accent/10' : 'bg-purple-500/10'}`}>
                      <span className="text-base">{c.type === 'product' ? '📦' : '🏢'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{formatCurrency(c.amount)}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {c.type === 'product' ? 'Produto' : 'Negócio'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {c.type === 'product' ? config.productCostLabel : config.businessCostLabel}
                        {c.type === 'product' && ` · ${c.spreadDays}d`}
                        {' · '}{formatDateLabel(c.date)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCost(c.id)}
                    className="p-2 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))
            )}
          </>
        )}
      </div>

      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
