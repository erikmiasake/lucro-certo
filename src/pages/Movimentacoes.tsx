import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
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
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

export default function Movimentacoes() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const entries = getRecentEntries();
  const costs = getRecentCosts();
  const [tab, setTab] = useState<'entradas' | 'custos'>('entradas');
  const [showEntry, setShowEntry] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleEntry = (amount: number) => {
    addEntry(amount);
    setShowEntry(false);
    setFeedback('Entrada registrada!');
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number) => {
    addCost(amount, type, spreadDays);
    setShowCost(false);
    setFeedback('Custo registrado!');
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="p-5 max-w-2xl mx-auto safe-bottom">
      <h1 className="text-xl font-bold text-foreground mb-4">Movimentações</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('entradas')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${tab === 'entradas' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          Entradas
        </button>
        <button
          onClick={() => setTab('custos')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${tab === 'custos' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          Custos
        </button>
      </div>

      {/* Add button */}
      <button
        onClick={() => tab === 'entradas' ? setShowEntry(true) : setShowCost(true)}
        className="w-full py-3 rounded-2xl bg-card border-2 border-dashed border-border text-muted-foreground font-medium text-sm mb-4 active:scale-[0.98] transition-transform"
      >
        + Adicionar {tab === 'entradas' ? 'entrada' : 'custo'}
      </button>

      {/* List */}
      <div className="flex flex-col gap-2">
        {tab === 'entradas' ? (
          entries.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhuma entrada registrada</p>
          ) : (
            entries.map((e) => (
              <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <div>
                  <p className="font-semibold text-foreground">{formatCurrency(e.amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                </div>
                <button onClick={() => deleteEntry(e.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))
          )
        ) : (
          costs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum custo registrado</p>
          ) : (
            costs.map((c) => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <div>
                  <p className="font-semibold text-foreground">{formatCurrency(c.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.type === 'product' ? '📦' : '🏢'} {c.type === 'product' ? config.productCostLabel : config.businessCostLabel}
                    {c.type === 'product' && ` · ${c.spreadDays} dias`}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.date)}</p>
                </div>
                <button onClick={() => deleteCost(c.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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
