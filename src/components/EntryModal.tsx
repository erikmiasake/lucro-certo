import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface EntryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  label: string;
}

export default function EntryModal({ open, onClose, onSubmit, label }: EntryModalProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = () => {
    const num = parseFloat(value.replace(',', '.'));
    if (num > 0) onSubmit(num);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg rounded-t-3xl p-6 safe-bottom card-elevated border-t border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Registrar {label.toLowerCase()}</h2>
                <p className="text-muted-foreground text-xs">Quanto você recebeu?</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6 p-4 rounded-xl bg-secondary/50 border border-border">
              <span className="text-xl font-bold text-muted-foreground">R$</span>
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 text-3xl font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!value || parseFloat(value.replace(',', '.')) <= 0}
              className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-lg disabled:opacity-30 active:scale-[0.97] transition-all shadow-lg shadow-primary/20"
            >
              Confirmar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
