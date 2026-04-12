import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, DollarSign, ShoppingBag, TrendingUp, Target, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getFinancialSummary, type FinancialSummary } from '@/lib/store';
import { useStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';

// ── ColorOrb (from ai-input) ────────────────────────────────────────
interface OrbProps {
  dimension?: string;
  className?: string;
  tones?: { base?: string; accent1?: string; accent2?: string; accent3?: string };
  spinDuration?: number;
}

const ColorOrb: React.FC<OrbProps> = ({ dimension = '32px', className, tones, spinDuration = 20 }) => {
  const palette = {
    base: 'oklch(22% 0.02 160)',
    accent1: 'oklch(70% 0.18 155)',
    accent2: 'oklch(65% 0.12 200)',
    accent3: 'oklch(72% 0.14 280)',
    ...tones,
  };
  const dim = parseInt(dimension.replace('px', ''), 10);
  const blur = dim < 50 ? Math.max(dim * 0.008, 1) : Math.max(dim * 0.015, 4);
  const contrast = dim < 50 ? Math.max(dim * 0.004, 1.2) : Math.max(dim * 0.008, 1.5);
  const dot = dim < 50 ? Math.max(dim * 0.004, 0.05) : Math.max(dim * 0.008, 0.1);
  const shadow = dim < 50 ? Math.max(dim * 0.004, 0.5) : Math.max(dim * 0.008, 2);
  const mask = dim < 30 ? '0%' : dim < 50 ? '5%' : dim < 100 ? '15%' : '25%';
  const adjContrast = dim < 30 ? 1.1 : dim < 50 ? Math.max(contrast * 1.2, 1.3) : contrast;

  return (
    <div className={cn('relative', className)}>
      <style>{`
        @property --orb-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
        .ai-orb { display: grid; grid-template-areas: "s"; overflow: hidden; border-radius: 50%; position: relative; transform: scale(1.1); }
        .ai-orb::before, .ai-orb::after { content: ""; display: block; grid-area: s; width: 100%; height: 100%; border-radius: 50%; transform: translateZ(0); }
        .ai-orb::before {
          background:
            conic-gradient(from calc(var(--orb-angle)*2) at 25% 70%, var(--a3), transparent 20% 80%, var(--a3)),
            conic-gradient(from calc(var(--orb-angle)*2) at 45% 75%, var(--a2), transparent 30% 60%, var(--a2)),
            conic-gradient(from calc(var(--orb-angle)*-3) at 80% 20%, var(--a1), transparent 40% 60%, var(--a1)),
            conic-gradient(from calc(var(--orb-angle)*2) at 15% 5%, var(--a2), transparent 10% 90%, var(--a2)),
            conic-gradient(from calc(var(--orb-angle)*1) at 20% 80%, var(--a1), transparent 10% 90%, var(--a1)),
            conic-gradient(from calc(var(--orb-angle)*-2) at 85% 10%, var(--a3), transparent 20% 80%, var(--a3));
          box-shadow: inset var(--ob) 0 0 var(--os) calc(var(--os)*0.2);
          filter: blur(var(--obl)) contrast(var(--oc));
          animation: orb-spin var(--osd) linear infinite;
        }
        .ai-orb::after {
          background-image: radial-gradient(circle at center, var(--ob) var(--od), transparent var(--od));
          background-size: calc(var(--od)*2) calc(var(--od)*2);
          backdrop-filter: blur(calc(var(--obl)*2)) contrast(calc(var(--oc)*2));
          mix-blend-mode: overlay;
          mask-image: radial-gradient(black var(--om), transparent 75%);
        }
        @keyframes orb-spin { to { --orb-angle: 360deg; } }
        @media (prefers-reduced-motion: reduce) { .ai-orb::before { animation: none; } }
      `}</style>
      <div
        className="ai-orb"
        style={{
          width: dimension, height: dimension,
          '--ob': palette.base, '--a1': palette.accent1, '--a2': palette.accent2, '--a3': palette.accent3,
          '--obl': `${blur}px`, '--oc': adjContrast, '--od': `${dot}px`, '--os': `${shadow}px`,
          '--om': mask, '--osd': `${spinDuration}s`,
        } as React.CSSProperties}
      />
    </div>
  );
};

// ── Config ───────────────────────────────────────────────────────────
interface InsightItem { category: 'receita' | 'custos' | 'lucro'; text: string; }
interface AIInsightsData { insights: InsightItem[]; recommendation: string; }
interface AIInsightsPanelProps { businessType: string; period?: string; }

const categoryConfig: Record<string, { label: string; icon: typeof DollarSign; colorClass: string }> = {
  receita: { label: 'Receita', icon: DollarSign, colorClass: 'text-primary' },
  custos: { label: 'Custos', icon: ShoppingBag, colorClass: 'text-accent' },
  lucro: { label: 'Lucro', icon: TrendingUp, colorClass: 'text-primary' },
};

const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

// ── Main component ──────────────────────────────────────────────────
export default function AIInsightsPanel({ businessType, period = 'semana' }: AIInsightsPanelProps) {
  const store = useStore();
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const buildSummary = (): FinancialSummary => getFinancialSummary(period);

  const fetchInsights = async () => {
    setLoading(true); setError(null); setAnswer(null);
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
    setAnswerLoading(true); setAnswer(null);
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

  const openQuestion = useCallback(() => {
    setQuestionOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Click outside to close question
  useEffect(() => {
    if (!questionOpen) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setQuestionOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [questionOpen]);

  // ── CTA state (not yet loaded) ──
  if (!data && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 border border-primary/15 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform group"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.04), hsl(var(--background)))' }}
        onClick={fetchInsights}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <ColorOrb dimension="40px" spinDuration={12} />
            <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Copiloto IA
            </p>
            <p className="text-xs text-muted-foreground">Toque para gerar análise inteligente</p>
          </div>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-primary/40"
          >
            <Send className="h-4 w-4" />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ── Loading state ──
  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-5 card-elevated">
        <div className="flex items-center gap-3">
          <ColorOrb dimension="36px" spinDuration={4} />
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

  // ── Error state ──
  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-4 card-elevated border border-destructive/20">
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={fetchInsights} className="text-xs text-primary mt-2 hover:underline">Tentar novamente</button>
      </motion.div>
    );
  }

  // ── Loaded state with insights ──
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/15 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.04), hsl(var(--background)))' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-primary/8">
            <div className="flex items-center gap-2.5">
              <ColorOrb dimension="24px" spinDuration={15} />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Copiloto IA</p>
            </div>
            <button onClick={fetchInsights} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Insights */}
          <div className="p-4 space-y-3">
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
            <div className="mx-4 mb-3 p-3 rounded-xl bg-primary/8 border border-primary/15">
              <div className="flex items-start gap-2">
                <Target className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold mb-0.5">Ação recomendada</p>
                  <p className="text-sm text-primary font-medium leading-relaxed">{data.recommendation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Question section — morph input */}
          <div className="px-4 pb-4 pt-2 border-t border-primary/8">
            <AnimatePresence mode="wait">
              {!questionOpen ? (
                <motion.button
                  key="trigger"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={openQuestion}
                  className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors py-1.5"
                >
                  <div className="w-5 h-5 rounded-md bg-secondary/60 flex items-center justify-center">
                    <Send className="h-2.5 w-2.5" />
                  </div>
                  Pergunte algo sobre seus dados...
                </motion.button>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={SPRING}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') askQuestion();
                          if (e.key === 'Escape') setQuestionOpen(false);
                        }}
                        placeholder="Ex: Como reduzir custos?"
                        className="w-full text-sm px-3 py-2 rounded-xl bg-secondary/40 border border-primary/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/25 transition-colors"
                        disabled={answerLoading}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <ColorOrb dimension="16px" spinDuration={8} />
                      </div>
                    </div>
                    <button
                      onClick={askQuestion}
                      disabled={answerLoading || !question.trim()}
                      className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 transition-all active:scale-95"
                    >
                      {answerLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {answer && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-3 rounded-xl bg-secondary/30 border border-primary/10"
                    >
                      <div className="text-sm text-foreground/90 leading-relaxed space-y-2">
                        {answer.split(/\n+/).filter(Boolean).map((paragraph, i) => {
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
