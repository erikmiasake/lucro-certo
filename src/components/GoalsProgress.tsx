import { motion } from 'framer-motion';
import { getGoalsProgress } from '@/lib/store';
import { useStore } from '@/hooks/use-store';
import { Target, TrendingUp, Percent } from 'lucide-react';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function GoalsProgress() {
  const state = useStore();
  const goals = state.goals;
  
  if (!goals.monthlyProfit && !goals.monthlyMargin) return null;

  const progress = getGoalsProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 card-elevated"
    >
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Metas do mês</p>
        <span className="text-[10px] text-muted-foreground ml-auto">{progress.daysRemaining} dias restantes</span>
      </div>

      <div className="space-y-3">
        {/* Profit goal */}
        {progress.profit.target && progress.profit.target > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">Lucro</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {formatCurrency(progress.profit.current)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  / {formatCurrency(progress.profit.target)}
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress.profit.progress, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  progress.profit.progress >= 100
                    ? 'bg-primary'
                    : progress.profit.onTrack
                    ? 'bg-primary/70'
                    : 'bg-yellow-500'
                }`}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-[10px] font-medium ${
                progress.profit.progress >= 100 ? 'text-primary' : progress.profit.onTrack ? 'text-muted-foreground' : 'text-yellow-500'
              }`}>
                {progress.profit.progress >= 100 ? 'Meta atingida!' : `${progress.profit.progress.toFixed(0)}% da meta`}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {progress.monthProgress.toFixed(0)}% do mês
              </span>
            </div>
          </div>
        )}

        {/* Margin goal */}
        {progress.margin.target && progress.margin.target > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Percent className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-muted-foreground">Margem</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {progress.margin.current.toFixed(1)}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  / {progress.margin.target}%
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress.margin.progress, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                className={`h-full rounded-full ${
                  progress.margin.progress >= 100
                    ? 'bg-blue-400'
                    : progress.margin.onTrack
                    ? 'bg-blue-400/70'
                    : 'bg-yellow-500'
                }`}
              />
            </div>
            <span className={`text-[10px] font-medium ${
              progress.margin.progress >= 100 ? 'text-blue-400' : progress.margin.onTrack ? 'text-muted-foreground' : 'text-yellow-500'
            }`}>
              {progress.margin.progress >= 100 ? 'Meta atingida!' : `${progress.margin.progress.toFixed(0)}% da meta`}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
