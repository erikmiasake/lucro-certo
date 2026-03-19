import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import { getRecentCosts, addCost, deleteCost, getCostBreakdown, getWeekSummary, CostClassification } from '@/lib/store';
import { Trash2, Plus, Package, Building2, AlertTriangle, PieChart, TrendingDown, BarChart3, Layers, Target } from 'lucide-react';
import CostModal from '@/components/CostModal';
import FeedbackToast from '@/components/FeedbackToast';
import AIInsightsPanel from '@/components/AIInsightsPanel';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

export default function Custos() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const costs = getRecentCosts();
  const breakdown = getCostBreakdown();
  const week = getWeekSummary();
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'overview' | 'list'>('overview');

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number, description?: string, category?: string, subcategory?: string, classification?: CostClassification) => {
    addCost(amount, type, spreadDays, description, category, subcategory, classification);
    setShowCost(false);
    setFeedback('Custo registrado');
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto safe-bottom">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Mapa de Custos</h1>
        <p className="text-muted-foreground text-sm mt-1">Entenda onde está gastando e onde pode otimizar</p>
      </div>

      {/* Alert */}
      {breakdown.isHighCost && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Custos elevados</p>
            <p className="text-xs text-destructive/80 mt-0.5">
              Seus custos representam mais de 70% da receita. Revise seus gastos.
            </p>
          </div>
        </motion.div>
      )}

      {/* Fixed vs Variable */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 card-elevated">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-3.5 w-3.5 text-purple-400" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Custos Fixos</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(breakdown.totalFixed)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
              {breakdown.fixedPercentage.toFixed(0)}%
            </span>
          </div>
          {breakdown.total > 0 && (
            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${breakdown.fixedPercentage}%` }} transition={{ delay: 0.3, duration: 0.6 }} className="h-full rounded-full bg-purple-500" />
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl p-4 card-elevated">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-3.5 w-3.5 text-accent" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Custos Variáveis</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(breakdown.totalVariable)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/10 text-accent">
              {breakdown.variablePercentage.toFixed(0)}%
            </span>
          </div>
          {breakdown.total > 0 && (
            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${breakdown.variablePercentage}%` }} transition={{ delay: 0.35, duration: 0.6 }} className="h-full rounded-full gradient-accent" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Total cost */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-4 card-elevated mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Custo total</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(breakdown.total)}</p>
          </div>
          {week.totalRevenue > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Impacto na receita</p>
              <p className={`text-lg font-bold ${(breakdown.total / week.totalRevenue) > 0.6 ? 'text-destructive' : 'text-primary'}`}>
                {((breakdown.total / week.totalRevenue) * 100).toFixed(0)}%
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add button */}
      <button
        onClick={() => setShowCost(true)}
        className="w-full py-3.5 rounded-2xl gradient-accent text-accent-foreground font-semibold text-sm mb-5 active:scale-[0.97] transition-all shadow-lg shadow-accent/15 flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Registrar custo
      </button>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 rounded-xl bg-secondary/50">
        <button
          onClick={() => setViewTab('overview')}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            viewTab === 'overview' ? 'bg-card text-primary shadow-md' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PieChart className="h-4 w-4" />
          Análise
        </button>
        <button
          onClick={() => setViewTab('list')}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            viewTab === 'list' ? 'bg-card text-primary shadow-md' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4" />
          Todos ({costs.length})
        </button>
      </div>

      {viewTab === 'overview' ? (
        <>
          {breakdown.categories.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 card-elevated mb-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Ranking de custos</p>
              </div>
              <div className="space-y-3">
                {breakdown.categories.map((cat, i) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                        <span className="text-sm font-medium text-foreground">{cat.name}</span>
                        <span className="text-[10px] text-muted-foreground">({cat.count}x)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(cat.amount)}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          cat.percentage > 40 ? 'bg-destructive/10 text-destructive' : cat.percentage > 25 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {cat.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                        className={`h-full rounded-full ${
                          cat.percentage > 40 ? 'bg-destructive' : cat.percentage > 25 ? 'bg-yellow-500' : 'bg-primary/50'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {breakdown.subcategories.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-4 card-elevated mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Detalhamento</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {breakdown.subcategories.map(sub => (
                  <div key={sub.name} className="px-3 py-2 rounded-xl bg-secondary/50 border border-border">
                    <p className="text-xs font-medium text-foreground">{sub.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatCurrency(sub.amount)} · {sub.percentage.toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {breakdown.profitImpact.length > 0 && week.totalRevenue > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl p-4 card-elevated mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <p className="text-sm font-semibold text-foreground">Impacto no lucro</p>
              </div>
              <div className="space-y-2">
                {breakdown.profitImpact.slice(0, 5).map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className={`font-medium ${item.profitImpactPercent > 30 ? 'text-destructive' : 'text-foreground'}`}>
                      -{item.profitImpactPercent.toFixed(0)}% da receita
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {breakdown.total > 0 && (
            <AIInsightsPanel
              summary={{
                totalRevenue: week.totalRevenue,
                totalRealCost: week.totalRealCost,
                profit: week.profit,
                margin: week.margin,
                ticketMedio: week.ticketMedio,
                totalEntries: week.totalEntries,
              }}
              businessType={state.businessType || 'outro'}
              period="custos"
            />
          )}
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {costs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Package className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Nenhum custo registrado</p>
              <p className="text-muted-foreground text-xs mt-1">Toque em "Registrar custo" para começar</p>
            </div>
          ) : (
            costs.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between p-3.5 rounded-xl card-elevated group hover:border-accent/20 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.type === 'product' ? 'bg-accent/10' : 'bg-purple-500/10'}`}>
                    {c.type === 'product' ? <Package className="h-4 w-4 text-accent" /> : <Building2 className="h-4 w-4 text-purple-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm">{formatCurrency(c.amount)}</p>
                      {breakdown.total > 0 && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          (c.amount / breakdown.total) * 100 > 30 ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {((c.amount / breakdown.total) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{formatDate(c.date)}</span>
                      {c.description && <span className="text-[10px] text-foreground/70 truncate max-w-[120px]">{c.description}</span>}
                      {c.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{c.category}</span>}
                      {c.subcategory && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">{c.subcategory}</span>}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {c.classification === 'fixed' ? 'Fixo' : 'Var'}
                      </span>
                      {c.type === 'product' && <span className="text-[10px] text-muted-foreground">{c.spreadDays}d</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteCost(c.id)}
                  className="p-2 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}

      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
