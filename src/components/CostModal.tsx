import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessConfig, BusinessType } from '@/lib/business-config';
import { CostClassification, addCustomCategory, getCustomCategories, removeCustomCategory } from '@/lib/finance';
import { Package, Building2, ChevronLeft, Plus, X } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { getModeCopyFromType } from '@/lib/modes';

interface CostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, type: 'product' | 'business', spreadDays: number, description?: string, category?: string, subcategory?: string, classification?: CostClassification) => void;
  config: BusinessConfig;
}

export default function CostModal({ open, onClose, onSubmit, config }: CostModalProps) {
  const state = useStore();
  const labels = getModeCopyFromType(state.businessType).glossary;
  const [step, setStep] = useState<'describe' | 'details'>('describe');
  const [description, setDescription] = useState('');
  const [costType, setCostType] = useState<'product' | 'business'>('product');
  const [classification, setClassification] = useState<CostClassification>('variable');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [value, setValue] = useState('');
  const [spreadDays, setSpreadDays] = useState(5);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryText, setNewCategoryText] = useState('');
  const descRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const newCatRef = useRef<HTMLInputElement>(null);

  const savedCategories = useMemo(
    () => getCustomCategories(),
    // Re-read whenever the store updates or the modal reopens
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.customCategories, state.businessType, open],
  );

  useEffect(() => {
    if (open) {
      setStep('describe');
      setDescription('');
      setValue('');
      setSpreadDays(5);
      setCostType('product');
      setClassification('variable');
      setCategory('');
      setSubcategory('');
      setAddingCategory(false);
      setNewCategoryText('');
      setTimeout(() => descRef.current?.focus(), 100);
    }
  }, [open]);

  const goToDetails = () => {
    setStep('details');
    setTimeout(() => valueRef.current?.focus(), 100);
  };

  const handleSubmit = () => {
    const num = parseFloat(value.replace(',', '.'));
    if (num > 0) {
      const finalSpreadDays = classification === 'fixed' ? 30 : spreadDays;
      onSubmit(num, costType, finalSpreadDays, description, category, subcategory, classification);
    }
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
            className="w-full max-w-lg rounded-t-3xl p-6 safe-bottom card-elevated border-t border-border max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />

            {step === 'describe' ? (
              <>
                <h2 className="text-lg font-bold text-foreground mb-1">{labels.costModalTitle}</h2>
                <p className="text-muted-foreground text-xs mb-5">{labels.costModalSubtitle}</p>

                {/* Description input */}
                <div className="mb-4">
                  <input
                    ref={descRef}
                    type="text"
                    placeholder={labels.costPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors text-sm"
                  />
                </div>

                {/* Manual type selection */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Tipo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setCostType('product'); setClassification('variable'); }}
                      className={`p-3 rounded-xl border text-left transition-all text-sm ${
                        costType === 'product' ? 'border-accent/40 bg-accent/5' : 'border-border bg-secondary/30 hover:bg-secondary/50'
                      }`}
                    >
                      <Package className={`h-4 w-4 mb-1 ${costType === 'product' ? 'text-accent' : 'text-muted-foreground'}`} />
                      <p className="font-medium text-foreground text-xs">{labels.variableLabel}</p>
                      <p className="text-[10px] text-muted-foreground">{labels.variableHint}</p>
                    </button>
                    <button
                      onClick={() => { setCostType('business'); setClassification('fixed'); }}
                      className={`p-3 rounded-xl border text-left transition-all text-sm ${
                        costType === 'business' ? 'border-purple-400/40 bg-purple-500/5' : 'border-border bg-secondary/30 hover:bg-secondary/50'
                      }`}
                    >
                      <Building2 className={`h-4 w-4 mb-1 ${costType === 'business' ? 'text-purple-400' : 'text-muted-foreground'}`} />
                      <p className="font-medium text-foreground text-xs">{labels.fixedLabel}</p>
                      <p className="text-[10px] text-muted-foreground">{labels.fixedHint}</p>
                    </button>
                  </div>
                </div>

                {/* Category selector */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Categoria</p>
                    {!addingCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingCategory(true);
                          setTimeout(() => newCatRef.current?.focus(), 50);
                        }}
                        className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        Nova
                      </button>
                    )}
                  </div>

                  {savedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {savedCategories.map((c) => {
                        const active = category === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCategory(active ? '' : c)}
                            className={`group inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full border text-[11px] transition-all ${
                              active
                                ? 'border-primary/50 bg-primary/10 text-foreground'
                                : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-border/80'
                            }`}
                          >
                            <span>{c}</span>
                            <span
                              role="button"
                              tabIndex={-1}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCustomCategory(c);
                                if (active) setCategory('');
                              }}
                              className="opacity-40 group-hover:opacity-100 hover:text-destructive transition-opacity"
                              aria-label={`Remover ${c}`}
                            >
                              <X className="h-2.5 w-2.5" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {addingCategory ? (
                    <div className="flex gap-2">
                      <input
                        ref={newCatRef}
                        type="text"
                        placeholder={labels.categoryPlaceholder}
                        value={newCategoryText}
                        onChange={(e) => setNewCategoryText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const v = newCategoryText.trim();
                            if (v) {
                              addCustomCategory(v);
                              setCategory(v);
                              setNewCategoryText('');
                              setAddingCategory(false);
                            }
                          } else if (e.key === 'Escape') {
                            setNewCategoryText('');
                            setAddingCategory(false);
                          }
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const v = newCategoryText.trim();
                          if (v) {
                            addCustomCategory(v);
                            setCategory(v);
                            setNewCategoryText('');
                            setAddingCategory(false);
                          }
                        }}
                        className="px-3 rounded-xl bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors"
                      >
                        OK
                      </button>
                    </div>
                  ) : savedCategories.length === 0 ? (
                    <input
                      type="text"
                      placeholder={labels.categoryPlaceholder}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors text-sm"
                    />
                  ) : null}
                </div>

                <button
                  onClick={goToDetails}
                  className="w-full py-3.5 rounded-2xl gradient-accent text-accent-foreground font-semibold text-sm active:scale-[0.97] transition-all shadow-lg shadow-accent/15"
                >
                  Continuar
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setStep('describe')} className="flex items-center gap-1 text-xs text-muted-foreground mb-4 hover:text-foreground transition-colors">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Voltar
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${costType === 'product' ? 'bg-accent/10' : 'bg-purple-500/10'}`}>
                    {costType === 'product' ? <Package className="h-4 w-4 text-accent" /> : <Building2 className="h-4 w-4 text-purple-400" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {description || (costType === 'product' ? config.productCostLabel : config.businessCostLabel)}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      {category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{category}</span>}
                      {subcategory && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{subcategory}</span>}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {classification === 'fixed' ? 'Fixo' : 'Variável'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 p-4 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-xl font-bold text-muted-foreground">R$</span>
                  <input
                    ref={valueRef}
                    type="number"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="flex-1 text-3xl font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                  />
                </div>

                {classification === 'fixed' ? (
                  <div className="mb-5 p-3 rounded-xl bg-purple-500/5 border border-purple-400/15">
                    <p className="text-xs font-medium text-purple-400 mb-1">📅 {config.isPersonal ? 'Gasto mensal' : 'Custo mensal'}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Este {config.isPersonal ? 'gasto' : 'custo'} será distribuído ao longo de <span className="text-foreground font-semibold">30 dias</span> automaticamente.
                    </p>
                  </div>
                ) : (
                  <div className="mb-5">
                    <p className="text-sm text-muted-foreground mb-3">Esse {config.isPersonal ? 'gasto' : 'custo'} dura quantos dias?</p>
                    <div className="flex gap-2">
                      {[3, 5, 7, 15, 30].map((d) => (
                        <button
                          key={d}
                          onClick={() => setSpreadDays(d)}
                          className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                            spreadDays === d
                              ? 'gradient-primary text-primary-foreground shadow-md shadow-primary/15'
                              : 'bg-secondary text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {config.isPersonal
                        ? `Ex: uma compra que dura ${spreadDays} dias será dividida igualmente nesse período.`
                        : `Ex: uma compra de insumos que dura ${spreadDays} dias será dividida igualmente nesse período.`}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!value || parseFloat(value.replace(',', '.')) <= 0}
                  className="w-full py-4 rounded-2xl gradient-accent text-accent-foreground font-semibold text-lg disabled:opacity-30 active:scale-[0.97] transition-all shadow-lg shadow-accent/15"
                >
                  {labels.costModalButton}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
