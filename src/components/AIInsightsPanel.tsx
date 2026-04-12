import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, DollarSign, ShoppingBag, TrendingUp, Target, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getFinancialSummary, type FinancialSummary } from '@/lib/store';
import { useStore } from '@/hooks/use-store';

interface InsightItem {
  category: 'receita' | 'custos' | 'lucro';
  text: string;
}

interface AIInsightsData {
  insights: InsightItem[];
  recommendation: string;
}

interface AIInsightsPanelProps {
  businessType: string;
  period?: string;
}

const categoryConfig: Record<string, { label: string; icon: typeof DollarSign; colorClass: string }> = {
  receita: { label: 'Receita', icon: DollarSign, colorClass: 'text-primary' },
  custos: { label: 'Custos', icon: ShoppingBag, colorClass: 'text-accent' },
  lucro: { label: 'Lucro', icon: TrendingUp, colorClass: 'text-primary' },
};

export default function AIInsightsPanel({ businessType, period = 'semana' }: AIInsightsPanelProps) {
  const store = useStore();
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionMode, setQuestionMode] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);

  const buildSummary = (): FinancialSummary => getFinancialSummary(period);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const summary = buildSummary();
      const { data: result, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: { financialSummary: summary, businessType, mode: 'auto' },
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

  const askQuestion = async () => {
    if (!question.trim()) return;
    setAnswerLoading(true);
    setAnswer(null);
    try {
      const summary = buildSummary();
      const { data: result, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: { financialSummary: summary, businessType, mode: 'question', question: question.trim() },
      });
      if (fnError) throw new Error(fnError.message);
      if (result?.error) throw new Error(result.error);
      setAnswer(result.answer || 'Sem resposta disponível.');
    } catch (e) {
      setAnswer(e instanceof Error ? e.message : 'Erro ao processar pergunta');
    } finally {
      setAnswerLoading(false);
    }
  };

  // Initial state — CTA to generate
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-5 card-elevated">
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-4 card-elevated border border-destructive/20">
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

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Copiloto IA</p>
            </div>
            <button onClick={fetchInsights} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Insights */}
          <div className="space-y-3 mb-4">
            {data.insights.map((insight, i) => {
              const config = categoryConfig[insight.category] || categoryConfig.lucro;
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

          {/* Interactive question mode */}
          <div className="mt-3 pt-3 border-t border-primary/10">
            {!questionMode ? (
              <button
                onClick={() => setQuestionMode(true)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" />
                Fazer uma pergunta sobre seus dados
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askQuestion()}
                    placeholder="Ex: Como posso reduzir custos?"
                    className="flex-1 text-sm px-3 py-2 rounded-lg bg-secondary/50 border border-primary/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
                    disabled={answerLoading}
                  />
                  <button
                    onClick={askQuestion}
                    disabled={answerLoading || !question.trim()}
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                  >
                    {answerLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {answer && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-secondary/30 border border-primary/10">
                    <div className="text-sm text-foreground/90 leading-relaxed space-y-2">
                      {answer.split(/\n+/).filter(Boolean).map((paragraph, i) => {
                        // Parse bold **text** and render
                        const parts = paragraph.split(/\*\*(.*?)\*\*/g);
                        return (
                          <p key={i}>
                            {parts.map((part, j) =>
                              j % 2 === 1
                                ? <strong key={j} className="font-semibold text-foreground">{part}</strong>
                                : <span key={j}>{part}</span>
                            )}
                          </p>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
