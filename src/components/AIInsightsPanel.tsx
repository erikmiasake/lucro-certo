import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, RefreshCw, ArrowUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getFinancialSummary } from '@/lib/store';
import { getModeCopyFromType, getMode } from '@/lib/modes';
import { cn } from '@/lib/utils';

// ── ColorOrb ─────────────────────────────────────────────────────────
interface OrbProps { dimension?: string; className?: string; spinDuration?: number; }
const ColorOrb: React.FC<OrbProps> = ({ dimension = '32px', className, spinDuration = 20 }) => {
  const palette = {
    base: 'oklch(22% 0.02 160)',
    accent1: 'oklch(70% 0.18 155)',
    accent2: 'oklch(65% 0.12 200)',
    accent3: 'oklch(72% 0.14 280)',
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

// ── Sugestões por modo ─────────────────────────────────────────────
const SUGGESTIONS_BUSINESS = [
  'Onde estou gastando mais?',
  'Qual meu maior custo?',
  'Como aumentar meu lucro?',
  'Quanto lucrei esse mês?',
  'Meu negócio está crescendo?',
  'Qual foi meu melhor dia?',
];

const SUGGESTIONS_PERSONAL = [
  'Onde estou gastando mais?',
  'Quanto sobrou esse mês?',
  'Qual meu maior gasto?',
  'Como posso economizar?',
  'Estou gastando acima do normal?',
  'Qual categoria consome mais minha renda?',
];

// ── Tipos ───────────────────────────────────────────────────────────
type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string };
interface AIChatProps { businessType: string; period?: string; }

// ── Componente principal ────────────────────────────────────────────
export default function AIChat({ businessType, period = 'semana' }: AIChatProps) {
  const appMode = getMode(businessType as any);
  const copy = getModeCopyFromType(businessType as any);
  const suggestions = appMode === 'personal' ? SUGGESTIONS_PERSONAL : SUGGESTIONS_BUSINESS;

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = useCallback(async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    setInput('');
    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const summary = getFinancialSummary(period);
      const { data: result, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: { financialSummary: summary, businessType, appMode, mode: 'question', question },
      });
      if (fnError) throw new Error(fnError.message);
      if (result?.error) throw new Error(result.error);
      const answer = result?.answer || 'Sem resposta disponível no momento.';
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: answer }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao processar pergunta';
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: msg }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [businessType, appMode, period, loading]);

  const greeting = appMode === 'personal'
    ? 'Pergunte sobre seus gastos, sua economia ou seus hábitos do mês.'
    : 'Pergunte sobre seu lucro, seus custos ou o desempenho do seu negócio.';

  const empty = messages.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/15 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.04), hsl(var(--background)))' }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-primary/8">
        <div className="flex items-center gap-2.5">
          <ColorOrb dimension="24px" spinDuration={15} />
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Assistente IA</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            Nova conversa
          </button>
        )}
      </div>

      {/* Conversation area */}
      <div ref={scrollRef} className="px-4 py-4 max-h-[420px] overflow-y-auto">
        {empty ? (
          <div className="flex flex-col items-center text-center py-3">
            <ColorOrb dimension="56px" spinDuration={10} />
            <p className="mt-3 text-base font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Como posso te ajudar?
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-[260px] leading-relaxed">
              {greeting}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(m => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {m.role === 'assistant' && (
                  <div className="mr-2 mt-1 shrink-0">
                    <ColorOrb dimension="20px" spinDuration={18} />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] text-sm leading-relaxed rounded-2xl px-3.5 py-2.5',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-secondary/50 text-foreground/95 border border-primary/10 rounded-bl-sm'
                  )}
                >
                  {m.content.split(/\n+/).filter(Boolean).map((paragraph, i) => {
                    const parts = paragraph.split(/\*\*(.*?)\*\*/g);
                    return (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>
                        {parts.map((part, j) =>
                          j % 2 === 1
                            ? <strong key={j} className="font-semibold">{part}</strong>
                            : <span key={j}>{part}</span>
                        )}
                      </p>
                    );
                  })}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="mr-2 mt-1 shrink-0">
                  <ColorOrb dimension="20px" spinDuration={4} />
                </div>
                <div className="bg-secondary/50 border border-primary/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '120ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-3 pt-1">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input); }}
              placeholder={appMode === 'personal' ? 'Pergunte sobre seus gastos...' : 'Pergunte sobre seu negócio...'}
              className="w-full text-sm pl-3.5 pr-10 py-2.5 rounded-full bg-secondary/50 border border-primary/10 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/30 transition-colors"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-70">
              <ColorOrb dimension="16px" spinDuration={10} />
            </div>
          </div>
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="w-10 h-10 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-all active:scale-95 hover:bg-primary/90"
            aria-label="Enviar"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>

        {/* Suggestion cards */}
        <AnimatePresence>
          {empty && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3"
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-2 px-1">
                Sugestões
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={loading}
                    className="text-left text-xs leading-snug px-3 py-2.5 rounded-xl bg-secondary/40 border border-primary/10 hover:border-primary/30 hover:bg-secondary/70 text-foreground/85 transition-all active:scale-[0.98]"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestions.slice(4).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={loading}
                    className="text-[11px] px-2.5 py-1.5 rounded-full bg-secondary/30 border border-primary/8 hover:border-primary/25 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
