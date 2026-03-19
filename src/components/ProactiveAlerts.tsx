import { motion, AnimatePresence } from 'framer-motion';
import { getProactiveAlerts, ProactiveAlert } from '@/lib/store';
import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, ChevronRight } from 'lucide-react';

const alertStyles: Record<ProactiveAlert['type'], { border: string; bg: string; iconColor: string }> = {
  danger: { border: 'border-destructive/30', bg: 'bg-destructive/5', iconColor: 'text-destructive' },
  warning: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', iconColor: 'text-yellow-500' },
  success: { border: 'border-primary/30', bg: 'bg-primary/5', iconColor: 'text-primary' },
  info: { border: 'border-blue-400/30', bg: 'bg-blue-400/5', iconColor: 'text-blue-400' },
};

export default function ProactiveAlerts() {
  const alerts = getProactiveAlerts();

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {alerts.map((alert, i) => {
          const style = alertStyles[alert.type];
          return (
            <motion.div
              key={`${alert.title}-${i}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl p-3.5 border ${style.border} ${style.bg} transition-all`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0 mt-0.5">{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.message}</p>
                  {alert.actionHint && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <ChevronRight className="h-3 w-3 text-primary" />
                      <span className="text-[11px] font-medium text-primary">{alert.actionHint}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
