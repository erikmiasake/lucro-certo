import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, Check, CalendarDays, CalendarRange } from 'lucide-react';

export interface EntryFormData {
  amount: number;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
}

function eachDay(start: string, end: string): string[] {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return [start];
  const out: string[] = [];
  const cur = new Date(s);
  while (cur <= e) {
    out.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EntryFormData) => void;
  isPersonal: boolean;
  initial?: Partial<EntryFormData> | null;
  mode?: 'create' | 'edit';
}

const PERSONAL_CATEGORIES = ['Salário', 'Freelancer', 'PIX recebido', 'Renda extra', 'Venda', 'Outros'];
const BUSINESS_CATEGORIES = ['Venda', 'Serviço', 'PIX recebido', 'Encomenda', 'Outros'];

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function EntryModal({ open, onClose, onSubmit, isPersonal, initial, mode = 'create' }: Props) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(todayStr());
  const [period, setPeriod] = useState<'diario' | 'semanal' | 'mensal'>('diario');
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = isPersonal ? PERSONAL_CATEGORIES : BUSINESS_CATEGORIES;
  const isEdit = mode === 'edit';
  const titleLabel = isEdit
    ? (isPersonal ? 'Editar entrada' : 'Editar receita')
    : (isPersonal ? 'Adicionar entrada' : 'Adicionar receita');
  const subLabel = isEdit
    ? 'Atualize os dados desta movimentação'
    : (isPersonal ? 'Registre um dinheiro que entrou' : 'Registre uma nova receita do negócio');

  useEffect(() => {
    if (open) {
      setDescription(initial?.description ?? '');
      setAmount(initial?.amount ? String(initial.amount).replace('.', ',') : '');
      setCategory(initial?.category ?? '');
      setDate(initial?.date ?? todayStr());
      setPeriod('diario');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, initial]);

  const computeDays = (): string[] => {
    if (period === 'diario' || isEdit) return [date];
    const ref = new Date(date + 'T00:00:00');
    if (isNaN(ref.getTime())) return [date];
    if (period === 'semanal') {
      // 7 dias terminando na data selecionada
      const start = new Date(ref);
      start.setDate(ref.getDate() - 6);
      return eachDay(start.toISOString().split('T')[0], ref.toISOString().split('T')[0]);
    }
    // mensal: dias do mês da data selecionada (limitado até hoje se for o mês atual)
    const first = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const last = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = last > today ? today : last;
    return eachDay(first.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const days = computeDays();
  const value = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
  const perDay = days.length > 0 ? value / days.length : value;

  const handleSubmit = () => {
    if (!description.trim() || !value || value <= 0) return;
    const baseDesc = description.trim().slice(0, 80);
    const cat = (category || 'Outros').slice(0, 40);
    if (!isEdit && days.length > 1) {
      days.forEach((d) => {
        onSubmit({ amount: perDay, description: baseDesc, category: cat, date: d });
      });
    } else {
      onSubmit({ amount: value, description: baseDesc, category: cat, date });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl p-5 max-w-lg mx-auto safe-bottom"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{titleLabel}</h3>
                  <p className="text-[10px] text-muted-foreground">{subLabel}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nome */}
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Nome da entrada
              </span>
              <input
                ref={inputRef}
                type="text"
                maxLength={80}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Salário, venda do dia, freelancer, PIX recebido"
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-secondary/40 border border-border outline-none text-sm text-foreground placeholder:text-muted focus:border-primary/50"
              />
            </label>

            {/* Valor */}
            <label className="block mt-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Valor
              </span>
              <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/50">
                <span className="text-sm font-bold text-muted-foreground">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Ex: 500"
                  className="flex-1 bg-transparent outline-none text-base font-bold text-foreground placeholder:text-muted"
                />
              </div>
            </label>

            {/* Período */}
            {!isEdit && (
              <div className="mt-3 flex gap-1.5">
                {([
                  { id: 'diario', label: 'Diário' },
                  { id: 'semanal', label: 'Semanal' },
                  { id: 'mensal', label: 'Mensal' },
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPeriod(opt.id)}
                    className={`flex-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                      period === opt.id
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-secondary/40 border-border text-muted-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            <label className="block mt-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {period === 'diario' || isEdit ? 'Data' : period === 'semanal' ? 'Final da semana' : 'Mês de referência'}
              </span>
              <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/50">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={date}
                  max={todayStr()}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground"
                />
              </div>
            </label>

            {!isEdit && period !== 'diario' && value > 0 && days.length > 0 && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                Distribuído em {days.length} {days.length === 1 ? 'dia' : 'dias'} · R$ {perDay.toFixed(2).replace('.', ',')} por dia
              </p>
            )}

            {/* Categoria */}
            <div className="mt-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Categoria
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      category === c
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                type="text"
                maxLength={40}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ou digite uma categoria"
                className="mt-2 w-full px-3 py-2 rounded-xl bg-secondary/40 border border-border outline-none text-xs text-foreground placeholder:text-muted focus:border-primary/50"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!description.trim() || !amount}
              className="mt-5 w-full py-3 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
              {isEdit ? 'Salvar alterações' : 'Salvar entrada'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
