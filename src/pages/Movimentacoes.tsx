import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, ArrowUpRight, ArrowDownRight, Zap, TrendingUp } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getRecentEntries, getRecentCosts, deleteEntry, deleteCost, addEntry, addCost, getDaySummary, getDateString } from '@/lib/store';
import EntryModal from '@/components/EntryModal';
import CostModal from '@/components/CostModal';
import FeedbackToast from '@/components/FeedbackToast';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

const QUICK_AMOUNTS = [10, 20, 50, 100];

export default function Movimentacoes() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const entries = getRecentEntries();
  const costs = getRecentCosts();
  const [tab, setTab] = useState<'entradas' | 'custos'>('entradas');
  const [showEntry, setShowEntry] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const today = getDateString();
  const summary = getDaySummary(today);

  const handleEntry = (amount: number) => {
    addEntry(amount);
    setShowEntry(false);
    const updated = getDaySummary(today);
    setFeedback(`Entrada registrada! Lucro atual: ${formatCurrency(updated.profit)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleQuickEntry = (amount: number) => {
    addEntry(amount);
    const updated = getDaySummary(today);
    setFeedback(`+${formatCurrency(amount)} · Lucro: ${formatCurrency(updated.profit)}`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number) => {
    addCost(amount, type, spreadDays);
    setShowCost(false);
    const updated = getDaySummary(today);
    setFeedback(`Custo registrado! Lucro: ${formatCurrency(updated.profit)}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto safe-bottom">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Movimentações</h1>
        <p className="text-muted-foreground text-sm mt-1">Histórico de entradas e custos</p>
      </div>

      {/* Quick entry */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 card-elevated mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Entrada rápida</p>
          <div className="ml-auto flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">Lucro: <span className={summary.profit >= 0 ? 'text-primary font-medium' : 'text-destructive font-medium'}>{formatCurrency(summary.profit)}</span></span>
          </div>
        </div>
        <div className="flex gap-2">
          {QUICK_AMOUNTS.map(amount => (
            <button
              key={amount}
              onClick={() => handleQuickEntry(amount)}
              className="flex-1 py-3 rounded-xl bg-primary/10 text-primary font-semibold text-sm active:scale-[0.95] transition-all hover:bg-primary/20"
            >
              +R${amount}
            </button>
          ))}
        </div>
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
          Entradas ({entries.length})
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

      {/* Add button */}
      <button
        onClick={() => tab === 'entradas' ? setShowEntry(true) : setShowCost(true)}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground font-medium text-sm mb-5 active:scale-[0.98] transition-all hover:border-primary/30 hover:text-primary flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Adicionar {tab === 'entradas' ? 'entrada' : 'custo'}
      </button>

      {/* List */}
      <div className="flex flex-col gap-2">
        {tab === 'entradas' ? (
          entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Nenhuma entrada registrada</p>
              <p className="text-muted-foreground text-xs mt-1">Use a entrada rápida acima ou toque em "Adicionar entrada"</p>
            </div>
          ) : (
            entries.map((e, i) => {
              // Calculate profit impact
              const profitImpact = e.date === today ? `Lucro +${formatCurrency(e.amount)}` : null;
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 rounded-xl card-elevated group hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <ArrowUpRight className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{formatCurrency(e.amount)}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                        {e.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{e.category}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry(e.id)}
                    className="p-2 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })
          )
        ) : (
          costs.length === 0 ? (
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
                      {' · '}{formatDate(c.date)}
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
          )
        )}
      </div>

      <EntryModal open={showEntry} onClose={() => setShowEntry(false)} onSubmit={handleEntry} label={config.entryLabel} />
      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
