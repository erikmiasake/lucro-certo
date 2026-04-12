import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, DollarSign, ShoppingBag, Calendar, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  getCostBreakdown, getGoalsProgress, getRevenueStats,
  getBestAndWorstDay, getMarginTrend, getMonthlyProjection,
  getWeekDailyData, getMonthSummary,
} from '@/lib/store';
import { useStore } from '@/hooks/use-store';

interface InsightItem {
  category: 'receita' | 'custos' | 'operacao';
  text: string;
}

interface AIInsightsData {
  insights: InsightItem[];
  recommendation: string;
  prediction: string;
}

interface AIInsightsPanelProps {
  summary: {
    totalRevenue: number;
    totalRealCost: number;
    profit: number;
    margin: number;
    totalEntries: number;
  };
  businessType: string;
  period?: string;
}

const categoryConfig: Record<string, { label: string; icon: typeof DollarSign; colorClass: string }> = {
  receita: { label: 'Receita', icon: DollarSign, colorClass: 'text-primary' },
  custos: { label: 'Custos', icon: ShoppingBag, colorClass: 'text-accent' },
  operacao: { label: 'Operação', icon: Calendar, colorClass: 'text-muted-foreground' },
};

export default function AIInsightsPanel({ summary, businessType, period = 'semana' }: AIInsightsPanelProps) {
  const store = useStore();
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const breakdown = getCostBreakdown();
      const goalsProgress = getGoalsProgress();
      const revenueStats = getRevenueStats();
      const bestWorst = getBestAndWorstDay();
      const marginTrend = getMarginTrend();
      const projection = getMonthlyProjection();
      const weekData = getWeekDailyData();
      const month = getMonthSummary();

      const weeklyEvolution = weekData
        .filter(d => d.revenue > 0 || d.cost > 0)
        .map(d => ({ day: d.label, revenue: Math.round(d.revenue), cost: Math.round(d.cost), profit: Math.round(d.profit) }));

      const { data: result, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: {
          summary,
          businessType,
          period,
          costBreakdown: {
            topCost: breakdown.topCost?.name || null,
            topPercentage: breakdown.topCost?.percentage || 0,
            totalFixed: breakdown.totalFixed,
            totalVariable: breakdown.totalVariable,
            categories: breakdown.categories.slice(0, 5).map(c => ({ name: c.name, amount: Math.round(c.amount), pct: Math.round(c.percentage) })),
          },
          goals: store.goals.monthlyProfit ? {
            monthlyProfit: store.goals.monthlyProfit,
            progress: goalsProgress.profit.progress,
            onTrack: goalsProgress.profit.onTrack,
            daysRemaining: goalsProgress.daysRemaining,
          } : null,
          operatingContext: {
            operatingWeekdays: store.businessProfile.operatingWeekdays,
            operatingDaysPerWeek: store.businessProfile.operatingWeekdays.length,
            realDataPercentage: revenueStats.realDataPercentage,
            manualRevenueDays: revenueStats.manualDays,
            estimatedRevenueDays: revenueStats.estimatedDays,
          },
          performanceContext: {
            bestDay: bestWorst ? { date: bestWorst.best.date, profit: Math.round(bestWorst.best.profit) } : null,
            worstDay: bestWorst ? { date: bestWorst.worst.date, profit: Math.round(bestWorst.worst.profit) } : null,
            marginTrend: marginTrend.direction,
            monthlyProjection: projection.revenue > 0 ? {
              revenue: Math.round(projection.revenue),
              cost: Math.round(projection.cost),
              profit: Math.round(projection.profit),
              margin: Math.round(projection.margin),
            } : null,
            weeklyEvolution,
            monthProfit: Math.round(month.profit),
            monthRevenue: Math.round(month.totalRevenue),
          },
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (result?.error) throw new Error(result.error);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar insights');
    } finally {
      setLoading(false);
    }
  };

  if (!data && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 border border-primary/20 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--background)))' }}
        onClick={fetchInsights}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-8 translate-x-8" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Análise IA</p>
            <p className="text-xs text-muted-foreground">Toque para gerar insights inteligentes</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl p-5 card-elevated"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Analisando seus dados...</p>
            <p className="text-xs text-muted-foreground">Gerando insights com IA</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 rounded bg-secondary/50 shimmer" style={{ width: `${90 - i * 15}%` }} />
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl p-4 card-elevated border border-destructive/20"
      >
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={fetchInsights} className="text-xs text-primary mt-2 hover:underline">Tentar novamente</button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 border border-primary/20 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--background)))' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-10 translate-x-10" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Copiloto IA</p>
            </div>
            <button
              onClick={fetchInsights}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Categorized Insights */}
          <div className="space-y-3 mb-4">
            {data.insights.map((insight, i) => {
              const config = categoryConfig[insight.category] || categoryConfig.operacao;
              const Icon = config.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2.5"
                >
                  <div className={`mt-0.5 shrink-0 ${config.colorClass}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${config.colorClass} opacity-70`}>
                      {config.label}
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed">{insight.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Recommendation */}
          {data.recommendation && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-3">
              <div className="flex items-start gap-2">
                <Target className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold mb-0.5">Ação recomendada</p>
                  <p className="text-sm text-primary font-medium leading-relaxed">{data.recommendation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Prediction */}
          {data.prediction && (
            <div className="flex items-start gap-2 px-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-0.5">Previsão</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{data.prediction}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
