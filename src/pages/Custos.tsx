import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs, BusinessType } from '@/lib/business-config';
import { getRecentCosts, addCost, deleteCost, getCostBreakdown, getWeekSummary, getMonthSummary, CostClassification } from '@/lib/store';
import {
  Trash2, Plus, Package, Building2, AlertTriangle, PieChart, TrendingDown,
  BarChart3, Layers, Target, Brain, ArrowDownRight, Lightbulb, Scale
} from 'lucide-react';
import CostModal from '@/components/CostModal';
import FeedbackToast from '@/components/FeedbackToast';
import AIInsightsPanel from '@/components/AIInsightsPanel';

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtShort(value: number) {
  if (Math.abs(value) >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return fmt(value);
}

function formatDate(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

// Benchmarks by business type (cost as % of revenue — industry averages)
const benchmarks: Record<BusinessType, { fixedRange: [number, number]; variableRange: [number, number]; totalRange: [number, number] }> = {
  restaurante: { fixedRange: [15, 25], variableRange: [25, 35], totalRange: [40, 60] },
  salao: { fixedRange: [20, 30], variableRange: [10, 20], totalRange: [30, 50] },
  petshop: { fixedRange: [15, 25], variableRange: [30, 40], totalRange: [45, 65] },
  loja: { fixedRange: [10, 20], variableRange: [40, 55], totalRange: [50, 75] },
  academia: { fixedRange: [30, 45], variableRange: [5, 15], totalRange: [35, 60] },
  outro: { fixedRange: [15, 30], variableRange: [20, 35], totalRange: [35, 65] },
};

function getBenchmarkStatus(value: number, range: [number, number]): 'good' | 'warning' | 'danger' {
  if (value <= range[1]) return 'good';
  if (value <= range[1] * 1.2) return 'warning';
  return 'danger';
}

const statusColors = {
  good: 'text-primary',
  warning: 'text-yellow-500',
  danger: 'text-destructive',
};

const statusBg = {
  good: 'bg-primary/10',
  warning: 'bg-yellow-500/10',
  danger: 'bg-destructive/10',
};

export default function Custos() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const costs = getRecentCosts();
  const breakdown = getCostBreakdown();
  const week = getWeekSummary();
  const month = getMonthSummary();
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'overview' | 'list'>('overview');

  const bType = state.businessType || 'outro';
  const bench = benchmarks[bType];

  const costPctOfRevenue = week.totalRevenue > 0 ? (breakdown.total / week.totalRevenue) * 100 : 0;
  const fixedPctOfRevenue = week.totalRevenue > 0 ? (breakdown.totalFixed / week.totalRevenue) * 100 : 0;
  const variablePctOfRevenue = week.totalRevenue > 0 ? (breakdown.totalVariable / week.totalRevenue) * 100 : 0;

  const totalStatus = getBenchmarkStatus(costPctOfRevenue, bench.totalRange);
  const fixedStatus = getBenchmarkStatus(fixedPctOfRevenue, bench.fixedRange);
  const variableStatus = getBenchmarkStatus(variablePctOfRevenue, bench.variableRange);

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number, description?: string, category?: string, subcategory?: string, classification?: CostClassification) => {
    addCost(amount, type, spreadDays, description, category, subcategory, classification);
    setShowCost(false);
    setFeedback('Custo registrado com sucesso');
    setTimeout(() => setFeedback(null), 2500);
  };

  // Generate smart cost insights
  const costInsights: string[] = [];
  if (costPctOfRevenue > bench.totalRange[1]) {
    costInsights.push(`Seus custos (${costPctOfRevenue.toFixed(0)}%) estão acima da média do setor (${bench.totalRange[0]}–${bench.totalRange[1]}%). Hora de otimizar.`);
  } else if (costPctOfRevenue > 0 && costPctOfRevenue <= bench.totalRange[1]) {
    costInsights.push(`Seus custos estão dentro da faixa saudável para ${config.label.toLowerCase()} (${bench.totalRange[0]}–${bench.totalRange[1]}%).`);
  }
  if (variablePctOfRevenue > bench.variableRange[1]) {
    costInsights.push(`Custos variáveis representam ${variablePctOfRevenue.toFixed(0)}% da receita — acima do ideal de ${bench.variableRange[1]}%.`);
  }
  if (breakdown.topCost && breakdown.topCost.percentage > 35) {
    const saving = breakdown.topCost.amount * 0.1;
    costInsights.push(`${breakdown.topCost.name} concentra ${breakdown.topCost.percentage.toFixed(0)}% dos custos. Reduzir 10% = +${fmtShort(saving)} de lucro.`);
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto safe-bottom pb-24">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Onde seu dinheiro está indo</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Análise inteligente de custos do seu negócio</p>
      </div>

      {/* Alert */}
      {breakdown.isHighCost && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5"
        >
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-destructive">Custos acima do ideal</p>
            <p className="text-[10px] text-destructive/80 mt-0.5">
              Seus custos representam {costPctOfRevenue.toFixed(0)}% da receita — a média do setor é {bench.totalRange[0]}–{bench.totalRange[1]}%.
            </p>
          </div>
        </motion.div>
      )}

      {/* AI Insight Banner */}
      {costInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4"
        >
          <Brain className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-primary/90 font-medium leading-relaxed">{costInsights[0]}</p>
            {costInsights.length > 1 && (
              <p className="text-[10px] text-primary/50 mt-1">+{costInsights.length - 1} insights</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Total cost with benchmark */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4 card-elevated mb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Custo total</p>
            <p className="text-xl font-bold text-foreground">{fmt(breakdown.total)}</p>
          </div>
          {week.totalRevenue > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">% da receita</p>
              <p className={`text-lg font-bold ${statusColors[totalStatus]}`}>{costPctOfRevenue.toFixed(0)}%</p>
            </div>
          )}
        </div>
        {/* Benchmark bar */}
        {week.totalRevenue > 0 && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Scale className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Benchmark do setor: {bench.totalRange[0]}–{bench.totalRange[1]}%</span>
            </div>
            <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(costPctOfRevenue, 100)}%` }}
                transition={{ duration: 0.6 }}
                className={`h-full rounded-full ${totalStatus === 'good' ? 'bg-primary' : totalStatus === 'warning' ? 'bg-yellow-500' : 'bg-destructive'}`}
              />
              {/* Benchmark markers */}
              <div className="absolute top-0 bottom-0 border-l border-dashed border-muted-foreground/30" style={{ left: `${bench.totalRange[0]}%` }} />
              <div className="absolute top-0 bottom-0 border-l border-dashed border-muted-foreground/30" style={{ left: `${bench.totalRange[1]}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground/50">0%</span>
              <span className={`text-[9px] font-medium ${statusColors[totalStatus]}`}>
                {totalStatus === 'good' ? 'Saudável' : totalStatus === 'warning' ? 'Atenção' : 'Acima do ideal'}
              </span>
              <span className="text-[9px] text-muted-foreground/50">100%</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Fixed vs Variable with revenue % */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl p-3.5 card-elevated">
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 className="h-3 w-3 text-purple-400" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Fixos</p>
          </div>
          <p className="text-base font-bold text-foreground">{fmtShort(breakdown.totalFixed)}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
              {breakdown.fixedPercentage.toFixed(0)}% dos custos
            </span>
          </div>
          {week.totalRevenue > 0 && (
            <p className={`text-[10px] mt-1.5 ${statusColors[fixedStatus]}`}>
              {fixedPctOfRevenue.toFixed(0)}% da receita
              <span className="text-muted-foreground/50 ml-1">(ideal: {bench.fixedRange[0]}–{bench.fixedRange[1]}%)</span>
            </p>
          )}
          {breakdown.total > 0 && (
            <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${breakdown.fixedPercentage}%` }} transition={{ delay: 0.3, duration: 0.6 }} className="h-full rounded-full bg-purple-500" />
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl p-3.5 card-elevated">
          <div className="flex items-center gap-1.5 mb-2">
            <Package className="h-3 w-3 text-accent" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Variáveis</p>
          </div>
          <p className="text-base font-bold text-foreground">{fmtShort(breakdown.totalVariable)}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/10 text-accent">
              {breakdown.variablePercentage.toFixed(0)}% dos custos
            </span>
          </div>
          {week.totalRevenue > 0 && (
            <p className={`text-[10px] mt-1.5 ${statusColors[variableStatus]}`}>
              {variablePctOfRevenue.toFixed(0)}% da receita
              <span className="text-muted-foreground/50 ml-1">(ideal: {bench.variableRange[0]}–{bench.variableRange[1]}%)</span>
            </p>
          )}
          {breakdown.total > 0 && (
            <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${breakdown.variablePercentage}%` }} transition={{ delay: 0.35, duration: 0.6 }} className="h-full rounded-full gradient-accent" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-0.5 rounded-lg bg-secondary/50">
        <button
          onClick={() => setViewTab('overview')}
          className={`flex-1 py-2 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
            viewTab === 'overview' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PieChart className="h-3.5 w-3.5" />
          Análise
        </button>
        <button
          onClick={() => setViewTab('list')}
          className={`flex-1 py-2 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
            viewTab === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Todos ({costs.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewTab === 'overview' ? (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Category ranking */}
            {breakdown.categories.length > 0 && (
              <div className="rounded-xl p-4 card-elevated mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">Ranking de custos</p>
                </div>
                <div className="space-y-3">
                  {breakdown.categories.map((cat, i) => {
                    const pctOfRevenue = week.totalRevenue > 0 ? (cat.amount / week.totalRevenue) * 100 : 0;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground w-4">#{i + 1}</span>
                            <span className="text-xs font-medium text-foreground">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">{fmt(cat.amount)}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              cat.percentage > 40 ? 'bg-destructive/10 text-destructive' : cat.percentage > 25 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {cat.percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.percentage}%` }}
                            transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                            className={`h-full rounded-full ${
                              cat.percentage > 40 ? 'bg-destructive' : cat.percentage > 25 ? 'bg-yellow-500' : 'bg-primary/50'
                            }`}
                          />
                        </div>
                        {week.totalRevenue > 0 && (
                          <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                            {pctOfRevenue.toFixed(1)}% da receita semanal
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Profit impact */}
            {breakdown.profitImpact.length > 0 && week.totalRevenue > 0 && (
              <div className="rounded-xl p-4 card-elevated mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  <p className="text-xs font-semibold text-foreground">Impacto no lucro</p>
                </div>
                <div className="space-y-2">
                  {breakdown.profitImpact.slice(0, 5).map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                      <span className={`text-xs font-medium ${item.profitImpactPercent > 30 ? 'text-destructive' : 'text-foreground'}`}>
                        -{item.profitImpactPercent.toFixed(0)}% da receita
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optimization tips */}
            {costInsights.length > 1 && (
              <div className="rounded-xl p-4 card-elevated mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                  <p className="text-xs font-semibold text-foreground">Oportunidades de otimização</p>
                </div>
                <div className="space-y-2">
                  {costInsights.slice(1).map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/30">
                      <ArrowDownRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] text-foreground/80 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subcategories */}
            {breakdown.subcategories.length > 0 && (
              <div className="rounded-xl p-4 card-elevated mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">Detalhamento</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.subcategories.map(sub => (
                    <div key={sub.name} className="px-2.5 py-1.5 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-[11px] font-medium text-foreground">{sub.name}</p>
                      <p className="text-[9px] text-muted-foreground">{fmt(sub.amount)} · {sub.percentage.toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>
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
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col gap-1.5">
              {costs.length === 0 ? (
                <div className="text-center py-10 rounded-xl card-elevated">
                  <Package className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-xs">Nenhum custo registrado</p>
                  <p className="text-muted-foreground/50 text-[10px] mt-1">Toque em "Registrar custo" para começar</p>
                </div>
              ) : (
                costs.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-3 rounded-xl card-elevated group"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${c.type === 'product' ? 'bg-accent/10' : 'bg-purple-500/10'}`}>
                        {c.type === 'product' ? <Package className="h-3.5 w-3.5 text-accent" /> : <Building2 className="h-3.5 w-3.5 text-purple-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-foreground text-xs">{fmt(c.amount)}</p>
                          {breakdown.total > 0 && (
                            <span className={`text-[9px] font-medium px-1 py-0.5 rounded ${
                              (c.amount / breakdown.total) * 100 > 30 ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {((c.amount / breakdown.total) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                          <span className="text-[9px] text-muted-foreground">{formatDate(c.date)}</span>
                          {c.description && <span className="text-[9px] text-foreground/70 truncate max-w-[100px]">{c.description}</span>}
                          {c.category && <span className="text-[9px] px-1 py-0.5 rounded bg-accent/10 text-accent">{c.category}</span>}
                          <span className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground">
                            {c.classification === 'fixed' ? 'Fixo' : 'Var'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCost(c.id)}
                      className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCost(true)}
          className="px-6 py-3 rounded-2xl gradient-accent text-accent-foreground font-semibold text-sm shadow-lg shadow-accent/20 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Registrar custo
        </motion.button>
      </div>

      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
