import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessConfig } from '@/lib/business-config';

interface CostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, type: 'product' | 'business', spreadDays: number) => void;
  config: BusinessConfig;
}

export default function CostModal({ open, onClose, onSubmit, config }: CostModalProps) {
  const [step, setStep] = useState<'type' | 'value'>('type');
  const [costType, setCostType] = useState<'product' | 'business'>('product');
  const [value, setValue] = useState('');
  const [spreadDays, setSpreadDays] = useState(5);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStep('type');
      setValue('');
      setSpreadDays(5);
    }
  }, [open]);

  useEffect(() => {
    if (step === 'value') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step]);

  const selectType = (type: 'product' | 'business') => {
    setCostType(type);
    setStep('value');
  };

  const handleSubmit = () => {
    const num = parseFloat(value.replace(',', '.'));
    if (num > 0) {
      onSubmit(num, costType, costType === 'product' ? spreadDays : 1);
    }
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

            {step === 'type' ? (
              <>
                <h2 className="text-xl font-bold text-foreground mb-1">Tipo de custo</h2>
                <p className="text-muted-foreground text-sm mb-5">Selecione o tipo</p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => selectType('product')}
                    className="p-4 rounded-2xl bg-background border border-border text-left active:scale-[0.98] transition-transform hover:border-primary/40"
                  >
                    <p className="font-semibold text-foreground text-base">📦 {config.productCostLabel}</p>
                    <p className="text-muted-foreground text-sm mt-1">{config.productCostExample}</p>
                    <p className="text-xs text-muted-foreground mt-1">Distribuído ao longo de dias</p>
                  </button>

                  <button
                    onClick={() => selectType('business')}
                    className="p-4 rounded-2xl bg-background border border-border text-left active:scale-[0.98] transition-transform hover:border-primary/40"
                  >
                    <p className="font-semibold text-foreground text-base">🏢 {config.businessCostLabel}</p>
                    <p className="text-muted-foreground text-sm mt-1">{config.businessCostExample}</p>
                    <p className="text-xs text-muted-foreground mt-1">Custo fixo do dia</p>
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {costType === 'product' ? config.productCostLabel : config.businessCostLabel}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">Quanto você gastou?</p>

                <div className="flex items-center gap-2 mb-4">
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

                {costType === 'product' && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      Distribuir em quantos dias?
                    </p>
                    <div className="flex gap-2">
                      {[3, 5, 7].map((d) => (
                        <button
                          key={d}
                          onClick={() => setSpreadDays(d)}
                          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                            spreadDays === d
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {d} dias
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!value || parseFloat(value.replace(',', '.')) <= 0}
                  className="w-full py-4 rounded-2xl bg-accent text-accent-foreground font-semibold text-lg disabled:opacity-40 active:scale-[0.97] transition-all"
                >
                  Registrar custo
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
