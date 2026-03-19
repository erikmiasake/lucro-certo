import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-card rounded-t-3xl p-6 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
            <h2 className="text-xl font-bold text-foreground mb-1">Registrar {label.toLowerCase()}</h2>
            <p className="text-muted-foreground text-sm mb-5">Quanto você recebeu?</p>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-muted-foreground">R$</span>
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
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg disabled:opacity-40 active:scale-[0.97] transition-all"
            >
              Confirmar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
