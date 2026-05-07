import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { businessConfigs, BusinessType, getAdaptedLabels } from '@/lib/business-config';
import { getRecentCosts, deleteCost, getCostBreakdown, getWeekSummary, getMonthSummary, getCostAnalysisAmount, CostClassification, registerCost, getCostMap } from '@/lib/store';
import {
  Trash2, Plus, Package, Building2, AlertTriangle, PieChart, TrendingDown,
  BarChart3, Layers, Target, Brain, ArrowDownRight, Lightbulb, Scale, ChevronRight, Map
} from 'lucide-react';
import CostModal from '@/components/CostModal';
import CostMapSection from '@/components/CostMapSection';
import FeedbackToast from '@/components/FeedbackToast';

import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtShort(value: number) {
  return fmt(value);
}

function formatDate(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

const benchmarks: Record<BusinessType, { fixedRange: [number, number]; variableRange: [number, number]; totalRange: [number, number] }> = {
  restaurante: { fixedRange: [15, 25], variableRange: [25, 35], totalRange: [40, 60] },
  salao: { fixedRange: [20, 30], variableRange: [10, 20], totalRange: [30, 50] },
  petshop: { fixedRange: [15, 25], variableRange: [30, 40], totalRange: [45, 65] },
  loja: { fixedRange: [10, 20], variableRange: [40, 55], totalRange: [50, 75] },
  academia: { fixedRange: [30, 45], variableRange: [5, 15], totalRange: [35, 60] },
  outro: { fixedRange: [15, 30], variableRange: [20, 35], totalRange: [35, 65] },
  pessoal: { fixedRange: [30, 50], variableRange: [20, 40], totalRange: [50, 80] },
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

const CHART_COLORS = [
  'hsl(152, 76%, 52%)',
  'hsl(32, 95%, 58%)',
  'hsl(262, 60%, 58%)',
  'hsl(200, 70%, 55%)',
  'hsl(340, 65%, 55%)',
  'hsl(45, 85%, 55%)',
];

export default function Custos() {
  const state = useStore();
  const config = businessConfigs[state.businessType!];
  const labels = getAdaptedLabels(state.businessType);
  const isPersonal = state.businessType === 'pessoal';
  // Derive from state to ensure reactivity on every store change
  const costs = useMemo(() => getRecentCosts(), [state]);
  const breakdown = useMemo(() => getCostBreakdown(), [state]);
  const week = useMemo(() => getWeekSummary(), [state]);
  const month = useMemo(() => getMonthSummary(), [state]);
  const costMap = useMemo(() => getCostMap(), [state]);
  const [showCost, setShowCost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'map' | 'overview' | 'list'>('map');
  const [costView, setCostView] = useState<'real' | 'operacional'>('operacional');

  const bType = state.businessType || 'outro';
  const bench = benchmarks[bType];

  const costPctOfRevenue = month.totalRevenue > 0 ? (month.totalRealCost / month.totalRevenue) * 100 : 0;
  const fixedPctOfRevenue = month.totalRevenue > 0 ? (breakdown.totalFixed / month.totalRevenue) * 100 : 0;
  const variablePctOfRevenue = month.totalRevenue > 0 ? (breakdown.totalVariable / month.totalRevenue) * 100 : 0;

  const totalStatus = getBenchmarkStatus(costPctOfRevenue, bench.totalRange);
  const fixedStatus = getBenchmarkStatus(fixedPctOfRevenue, bench.fixedRange);
  const variableStatus = getBenchmarkStatus(variablePctOfRevenue, bench.variableRange);

  const handleCost = (amount: number, type: 'product' | 'business', spreadDays: number, description?: string, category?: string, subcategory?: string, classification?: CostClassification) => {
    registerCost(amount, type, spreadDays, description, category, subcategory, classification);
    setShowCost(false);
    setViewTab('map');
    setFeedback(labels.costFeedback);
    setTimeout(() => setFeedback(null), 2500);
  };

  const costInsights: string[] = [];
  if (costPctOfRevenue > bench.totalRange[1]) {
    costInsights.push(isPersonal
      ? `Gastos em ${costPctOfRevenue.toFixed(0)}% da sua renda — acima do ideal (${bench.totalRange[0]}–${bench.totalRange[1]}%).`
      : `Custos em ${costPctOfRevenue.toFixed(0)}% da receita — acima da média do setor (${bench.totalRange[0]}–${bench.totalRange[1]}%).`);
  } else if (costPctOfRevenue > 0 && costPctOfRevenue <= bench.totalRange[1]) {
    costInsights.push(isPersonal
      ? `Seus gastos estão dentro de uma faixa saudável (${bench.totalRange[0]}–${bench.totalRange[1]}% da renda).`
      : `Custos dentro da faixa saudável para ${config.label.toLowerCase()} (${bench.totalRange[0]}–${bench.totalRange[1]}%).`);
  }
  if (variablePctOfRevenue > bench.variableRange[1]) {
    costInsights.push(isPersonal
      ? `Gastos variáveis em ${variablePctOfRevenue.toFixed(0)}% da renda — acima do ideal de ${bench.variableRange[1]}%.`
      : `Custos variáveis em ${variablePctOfRevenue.toFixed(0)}% da receita — acima do ideal de ${bench.variableRange[1]}%.`);
  }
  if (breakdown.topCost && breakdown.topCost.percentage > 35) {
    const saving = breakdown.topCost.amount * 0.1;
    costInsights.push(isPersonal
      ? `${breakdown.topCost.name} concentra ${breakdown.topCost.percentage.toFixed(0)}% dos gastos. Reduzir 10% = +${fmtShort(saving)} de sobra.`
      : `${breakdown.topCost.name} concentra ${breakdown.topCost.percentage.toFixed(0)}% dos custos. Reduzir 10% = +${fmtShort(saving)} de lucro.`);
  }

  const pieData = useMemo(() => {
    if (breakdown.categories.length === 0) return [];
    return breakdown.categories.map(cat => ({
      name: cat.name,
      value: cat.amount,
      percentage: cat.percentage,
    }));
  }, [breakdown.categories]);

  const fixedVsVariableData = useMemo(() => {
    if (breakdown.total === 0) return [];
    return [
      { name: 'Fixos', value: breakdown.totalFixed },
      { name: 'Variáveis', value: breakdown.totalVariable },
    ];
  }, [breakdown.totalFixed, breakdown.totalVariable, breakdown.total]);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto safe-bottom pb-24">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{labels.costsPageTitle}</h1>
        <p className="text-muted-foreground text-xs mt-0.5">{labels.costsPageSubtitle}</p>
      </div>

      {/* Cost View Toggle: Real vs Operacional */}
      {(() => {
        const totalMonthly = costMap.totalMonthly || 0;
        if (totalMonthly === 0) return null;

        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const opDaysPerWeek = state.businessProfile?.operatingWeekdays?.length ?? 6;
        const weeksInMonth = daysInMonth / 7;
        const opDaysInMonth = Math.round(opDaysPerWeek * weeksInMonth);

        const realDaily = totalMonthly / daysInMonth;
        const realWeekly = realDaily * 7;

        const opDaily = totalMonthly / (opDaysInMonth || 1);
        const opWeekly = opDaily * opDaysPerWeek;

        return (
          <div className="mb-4 space-y-3">
            {/* Toggle */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/50">
              <button
                onClick={() => setCostView('operacional')}
                className={`flex-1 py-2 rounded-md font-medium text-xs transition-all ${
                  costView === 'operacional' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {labels.costOperationalLabel}
              </button>
              <button
                onClick={() => setCostView('real')}
                className={`flex-1 py-2 rounded-md font-medium text-xs transition-all ${
                  costView === 'real' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {labels.costRealLabel}
              </button>
            </div>

            {/* Values */}
            <motion.div
              key={costView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 card-elevated space-y-3"
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground font-medium">Diário</p>
                  <p className="text-lg font-bold text-foreground">{fmt(Math.round(costView === 'real' ? realDaily : opDaily))}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground font-medium">Semanal</p>
                  <p className="text-lg font-bold text-foreground">{fmt(Math.round(costView === 'real' ? realWeekly : opWeekly))}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground font-medium">Mensal</p>
                  <p className="text-lg font-bold text-foreground">{fmt(Math.round(totalMonthly))}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50">
                {costView === 'operacional' ? (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-foreground">{labels.costOperationalDesc}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {isPersonal
                        ? `Gastos distribuídos pelos ${daysInMonth} dias do mês.`
                        : <>Custos distribuídos apenas pelos <span className="text-foreground font-semibold">{opDaysInMonth} dias</span> em que o negócio abre neste mês ({opDaysPerWeek} dias/semana).</>}
                    </p>
                    <p className="text-[10px] text-primary/70 font-medium">
                      {isPersonal
                        ? '👉 Mostra quanto você gasta por dia em média.'
                        : '👉 Mostra quanto você precisa faturar por dia aberto para cobrir custos e gerar lucro.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-foreground">{labels.costRealDesc}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {isPersonal
                        ? <>Gastos distribuídos por todos os <span className="text-foreground font-semibold">{daysInMonth} dias</span> do mês.</>
                        : <>Custos distribuídos por todos os <span className="text-foreground font-semibold">{daysInMonth} dias</span> do mês — aberto ou não.</>}
                    </p>
                    <p className="text-[10px] text-primary/70 font-medium">
                      {isPersonal
                        ? '👉 Mostra o peso real dos seus gastos mensais.'
                        : '👉 Mostra o peso estrutural do negócio — o que você paga mesmo sem atender clientes.'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Fixed vs Variable summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl card-elevated">
                <div className="flex items-center gap-1 mb-1">
                  <Building2 className="h-2.5 w-2.5 text-purple-400" />
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Fixos</p>
                </div>
                <p className="text-sm font-bold text-foreground">{fmt(breakdown.totalFixed)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{breakdown.fixedPercentage.toFixed(0)}% dos custos</p>
              </div>
              <div className="p-3 rounded-xl card-elevated">
                <div className="flex items-center gap-1 mb-1">
                  <Package className="h-2.5 w-2.5 text-accent" />
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Variáveis</p>
                </div>
                <p className="text-sm font-bold text-foreground">{fmt(breakdown.totalVariable)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{breakdown.variablePercentage.toFixed(0)}% dos custos</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Alert */}
      {breakdown.isHighCost && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-destructive/8 border border-destructive/15 flex items-start gap-2.5"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-destructive">{labels.costAlertTitle}</p>
            <p className="text-[10px] text-destructive/70 mt-0.5">
              {costPctOfRevenue.toFixed(0)}% da {isPersonal ? 'renda' : 'receita'} — {isPersonal ? 'ideal' : 'média do setor'}: {bench.totalRange[0]}–{bench.totalRange[1]}%
            </p>
          </div>
        </motion.div>
      )}

      {/* AI Insight */}
      {costInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4"
        >
          <Brain className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-primary/90 font-medium leading-relaxed">{costInsights[0]}</p>
            {costInsights.length > 1 && (
              <p className="text-[10px] text-primary/40 mt-1">+{costInsights.length - 1} insights disponíveis</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-0.5 rounded-lg bg-secondary/50">
        <button
          onClick={() => setViewTab('map')}
          className={`flex-1 py-2 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
            viewTab === 'map' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Map className="h-3.5 w-3.5" />
          Mapa
        </button>
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
          Registros ({costs.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewTab === 'map' ? (
          <motion.div key="map" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CostMapSection />
          </motion.div>
        ) : viewTab === 'overview' ? (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">


            {/* Distribution Chart */}
            {pieData.length > 0 && (
              <div className="rounded-xl p-4 card-elevated">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">Distribuição por categoria</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Mini donut */}
                  <div className="w-24 h-24 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={28}
                          outerRadius={42}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => fmt(value)}
                          contentStyle={{
                            background: 'hsl(228, 14%, 10%)',
                            border: '1px solid hsl(228, 12%, 17%)',
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: 'hsl(210, 20%, 96%)',
                          }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-1.5">
                    {pieData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-[11px] text-foreground/80 truncate">{item.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-foreground ml-2">{item.percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Ranking */}
            {breakdown.categories.length > 0 && (
              <div className="rounded-xl p-4 card-elevated">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">{labels.costRankingTitle}</p>
                </div>
                <div className="space-y-2.5">
                  {breakdown.categories.map((cat, i) => {
                    const pctOfRevenue = month.totalRevenue > 0 ? (cat.amount / month.totalRevenue) * 100 : 0;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground/60 w-3">{i + 1}</span>
                            <span className="text-[11px] font-medium text-foreground">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-foreground">{fmtShort(cat.amount)}</span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                              cat.percentage > 40 ? 'bg-destructive/10 text-destructive' : cat.percentage > 25 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {cat.percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1 rounded-full bg-secondary overflow-hidden ml-5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.percentage}%` }}
                            transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                        </div>
                        {month.totalRevenue > 0 && (
                          <p className="text-[9px] text-muted-foreground/50 mt-0.5 ml-5">
                            {Math.round(pctOfRevenue)}% da {isPersonal ? 'renda' : 'receita'}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Profit impact */}
            {breakdown.profitImpact.length > 0 && month.totalRevenue > 0 && (
              <div className="rounded-xl p-4 card-elevated">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-3.5 w-3.5 text-destructive/70" />
                  <p className="text-xs font-semibold text-foreground">{isPersonal ? 'Impacto na sobra' : 'Impacto no lucro'}</p>
                </div>
                <div className="space-y-2">
                  {breakdown.profitImpact.slice(0, 5).map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive/50" />
                        <span className="text-[11px] text-foreground/70">{item.name}</span>
                      </div>
                      <span className={`text-[11px] font-semibold ${item.profitImpactPercent > 30 ? 'text-destructive' : 'text-foreground/80'}`}>
                        -{item.profitImpactPercent.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optimization tips */}
            {costInsights.length > 1 && (
              <div className="rounded-xl p-4 card-elevated">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-500/70" />
                  <p className="text-xs font-semibold text-foreground">Oportunidades</p>
                </div>
                <div className="space-y-2">
                  {costInsights.slice(1).map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/8">
                      <ArrowDownRight className="h-3 w-3 text-primary/70 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-foreground/70 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subcategories */}
            {breakdown.subcategories.length > 0 && (
              <div className="rounded-xl p-4 card-elevated">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">Detalhamento</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.subcategories.map(sub => (
                    <div key={sub.name} className="px-2.5 py-1.5 rounded-lg bg-secondary/40 border border-border/50">
                      <p className="text-[11px] font-medium text-foreground/80">{sub.name}</p>
                      <p className="text-[9px] text-muted-foreground">{fmtShort(sub.amount)} · {sub.percentage.toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col gap-1.5">
              {costs.length === 0 ? (
                <div className="text-center py-12 rounded-xl card-elevated">
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-xs font-medium">{labels.noCostsLabel}</p>
                  <p className="text-muted-foreground/40 text-[10px] mt-1">Registre {isPersonal ? 'gastos' : 'custos'} para ver sua análise</p>
                </div>
              ) : (
                costs.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-between p-3 rounded-xl card-elevated group"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.type === 'product' ? 'bg-accent/10' : 'bg-purple-500/10'}`}>
                        {c.type === 'product' ? <Package className="h-3.5 w-3.5 text-accent" /> : <Building2 className="h-3.5 w-3.5 text-purple-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-foreground text-xs">{fmt(getCostAnalysisAmount(c))}</p>
                          {breakdown.total > 0 && (
                            <span className={`text-[9px] font-medium px-1 py-0.5 rounded ${
                              (getCostAnalysisAmount(c) / breakdown.total) * 100 > 30 ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {((getCostAnalysisAmount(c) / breakdown.total) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                          <span className="text-[9px] text-muted-foreground">{formatDate(c.date)}</span>
                          {c.description && <span className="text-[9px] text-foreground/50 truncate max-w-[100px]">{c.description}</span>}
                          {c.category && <span className="text-[9px] px-1 py-0.5 rounded bg-accent/8 text-accent/80">{c.category}</span>}
                          <span className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground">
                            {c.classification === 'fixed' ? 'Fixo' : 'Var'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCost(c.id)}
                      className="p-1.5 rounded-lg text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
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
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCost(true)}
          className="px-6 py-3 rounded-2xl gradient-accent text-accent-foreground font-semibold text-sm shadow-lg shadow-accent/20 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {labels.costModalButton}
        </motion.button>
      </div>

      <CostModal open={showCost} onClose={() => setShowCost(false)} onSubmit={handleCost} config={config} />
      <FeedbackToast message={feedback} />
    </div>
  );
}
