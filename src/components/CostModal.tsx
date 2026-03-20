import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessConfig } from '@/lib/business-config';
import { CostClassification } from '@/lib/store';
import { Package, Building2, Sparkles, Loader2, Tag, ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/hooks/use-store';

interface CostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, type: 'product' | 'business', spreadDays: number, description?: string, category?: string, subcategory?: string, classification?: CostClassification) => void;
  config: BusinessConfig;
}

interface AISuggestion {
  type: 'product' | 'business';
  classification: CostClassification;
  category: string;
  subcategory: string;
}

export default function CostModal({ open, onClose, onSubmit, config }: CostModalProps) {
  const state = useStore();
  const [step, setStep] = useState<'describe' | 'details'>('describe');
  const [description, setDescription] = useState('');
  const [costType, setCostType] = useState<'product' | 'business'>('product');
  const [classification, setClassification] = useState<CostClassification>('variable');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [value, setValue] = useState('');
  const [spreadDays, setSpreadDays] = useState(5);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestionApplied, setSuggestionApplied] = useState(false);
  const descRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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
      setAiSuggestion(null);
      setSuggestionApplied(false);
      setTimeout(() => descRef.current?.focus(), 100);
    }
  }, [open]);

  const fetchSuggestion = useCallback(async (desc: string) => {
    if (desc.length < 3) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('classify-cost', {
        body: { description: desc, businessType: state.businessType },
      });
      if (!error && data && !data.error) {
        setAiSuggestion(data);
      }
    } catch {
      // silent fail
    } finally {
      setAiLoading(false);
    }
  }, [state.businessType]);

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    setSuggestionApplied(false);
    setAiSuggestion(null);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestion(val), 800);
  };

  const applySuggestion = () => {
    if (!aiSuggestion) return;
    setCostType(aiSuggestion.type);
    setClassification(aiSuggestion.classification);
    setCategory(aiSuggestion.category);
    setSubcategory(aiSuggestion.subcategory);
    setSuggestionApplied(true);
  };

  const goToDetails = () => {
    setStep('details');
    setTimeout(() => valueRef.current?.focus(), 100);
  };

  const handleSubmit = () => {
    const num = parseFloat(value.replace(',', '.'));
    if (num > 0) {
      onSubmit(num, costType, costType === 'product' ? spreadDays : 1, description, category, subcategory, classification);
    }
  };

  const allCategories = [...config.costCategories.product, ...config.costCategories.business];

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
                <h2 className="text-lg font-bold text-foreground mb-1">Registrar custo</h2>
                <p className="text-muted-foreground text-xs mb-5">Descreva o custo e a IA sugere a categoria</p>

                {/* Description input */}
                <div className="mb-4">
                  <input
                    ref={descRef}
                    type="text"
                    placeholder="Ex: compra de chocolate, conta de luz, aluguel..."
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors text-sm"
                  />
                </div>

                {/* AI suggestion */}
                {aiLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    <span className="text-xs text-muted-foreground">Classificando...</span>
                  </div>
                )}

                {aiSuggestion && !suggestionApplied && (
                  <motion.button
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={applySuggestion}
                    className="w-full p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-left mb-4 active:scale-[0.98] transition-all hover:bg-primary/15"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">Sugestão da IA</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-foreground font-medium">
                        {aiSuggestion.classification === 'fixed' ? 'Fixo' : 'Variável'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-foreground font-medium">
                        {aiSuggestion.type === 'product' ? 'Produto' : 'Negócio'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                        {aiSuggestion.category}
                      </span>
                      {aiSuggestion.subcategory && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-medium">
                          {aiSuggestion.subcategory}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">Toque para aplicar</p>
                  </motion.button>
                )}

                {suggestionApplied && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">Classificação aplicada ✓</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-foreground font-medium">
                        {classification === 'fixed' ? '📌 Fixo' : '📊 Variável'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-foreground font-medium">
                        {costType === 'product' ? '📦 Produto' : '🏢 Negócio'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{category}</span>
                      {subcategory && <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-medium">{subcategory}</span>}
                    </div>
                  </motion.div>
                )}

                {/* Manual type selection */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Tipo de custo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setCostType('product'); setClassification('variable'); }}
                      className={`p-3 rounded-xl border text-left transition-all text-sm ${
                        costType === 'product' ? 'border-accent/40 bg-accent/5' : 'border-border bg-secondary/30 hover:bg-secondary/50'
                      }`}
                    >
                      <Package className={`h-4 w-4 mb-1 ${costType === 'product' ? 'text-accent' : 'text-muted-foreground'}`} />
                      <p className="font-medium text-foreground text-xs">Variável</p>
                      <p className="text-[10px] text-muted-foreground">Insumos, produtos</p>
                    </button>
                    <button
                      onClick={() => { setCostType('business'); setClassification('fixed'); }}
                      className={`p-3 rounded-xl border text-left transition-all text-sm ${
                        costType === 'business' ? 'border-purple-400/40 bg-purple-500/5' : 'border-border bg-secondary/30 hover:bg-secondary/50'
                      }`}
                    >
                      <Building2 className={`h-4 w-4 mb-1 ${costType === 'business' ? 'text-purple-400' : 'text-muted-foreground'}`} />
                      <p className="font-medium text-foreground text-xs">Fixo</p>
                      <p className="text-[10px] text-muted-foreground">Aluguel, contas</p>
                    </button>
                  </div>
                </div>

                {/* Category quick select */}
                {!suggestionApplied && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Categoria</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(costType === 'product' ? config.costCategories.product : config.costCategories.business).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-all ${
                            category === cat ? 'bg-primary/15 text-primary font-medium' : 'bg-secondary text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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

                {costType === 'product' && (
                  <div className="mb-5">
                    <p className="text-sm text-muted-foreground mb-3">Distribuir em quantos dias?</p>
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
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!value || parseFloat(value.replace(',', '.')) <= 0}
                  className="w-full py-4 rounded-2xl gradient-accent text-accent-foreground font-semibold text-lg disabled:opacity-30 active:scale-[0.97] transition-all shadow-lg shadow-accent/15"
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
