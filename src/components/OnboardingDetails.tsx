import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { ArrowRight, ArrowLeft, DollarSign, Tag, Brain, Plus, X, Sparkles } from 'lucide-react';

const businessImages: Record<BusinessType, string> = {
  restaurante: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
  salao: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
  petshop: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=600&auto=format&fit=crop',
  loja: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
  academia: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
  outro: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
};

const suggestedAvgSales: Record<BusinessType, string> = {
  restaurante: '1.500',
  salao: '800',
  petshop: '1.200',
  loja: '2.000',
  academia: '3.000',
  outro: '1.000',
};

const aiHints = [
  'Estimando faturamento mensal…',
  'Calculando possíveis custos…',
  'Analisando margens do setor…',
  'Preparando insights personalizados…',
];

interface Props {
  selectedType: BusinessType;
  onBack: () => void;
  onFinish: (avgSales: string, selectedCosts: string[]) => void;
}

export default function OnboardingDetails({ selectedType, onBack, onFinish }: Props) {
  const [avgSales, setAvgSales] = useState('');
  const [selectedCosts, setSelectedCosts] = useState<string[]>([]);
  const [newCost, setNewCost] = useState('');
  const [showAddCost, setShowAddCost] = useState(false);
  const [aiHintIndex, setAiHintIndex] = useState(-1);
  const [showAiHint, setShowAiHint] = useState(false);

  const config = businessConfigs[selectedType];
  const allCostCategories = useMemo(
    () => [...config.costCategories.product, ...config.costCategories.business],
    [config]
  );

  // Pre-select common costs (first 3 product + first 2 business)
  useEffect(() => {
    const preSelected = [
      ...config.costCategories.product.slice(0, 2),
      ...config.costCategories.business.slice(0, 2),
    ];
    setSelectedCosts(preSelected);
  }, [config]);

  // Show AI hints when user interacts
  useEffect(() => {
    if (avgSales.length > 0 || selectedCosts.length > 0) {
      setShowAiHint(true);
      const interval = setInterval(() => {
        setAiHintIndex(prev => (prev + 1) % aiHints.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [avgSales, selectedCosts]);

  const toggleCost = (cost: string) => {
    setSelectedCosts(prev =>
      prev.includes(cost) ? prev.filter(c => c !== cost) : [...prev, cost]
    );
  };

  const addCustomCost = () => {
    const trimmed = newCost.trim();
    if (trimmed && !selectedCosts.includes(trimmed) && !allCostCategories.includes(trimmed)) {
      setSelectedCosts(prev => [...prev, trimmed]);
      setNewCost('');
      setShowAddCost(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers, 10);
    return amount.toLocaleString('pt-BR');
  };

  const handleSalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setAvgSales(formatted);
  };

  // Progress: step 2 of 2 (type selection was step 1)
  const filledFields = (avgSales.length > 0 ? 1 : 0) + (selectedCosts.length > 0 ? 1 : 0);
  const progress = filledFields / 2;

  return (
    <motion.div
      key="details-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md px-4 sm:px-6 py-6 sm:py-8"
    >
      {/* Back + Progress */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Etapa 2 de 2</span>
          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: '50%' }}
              animate={{ width: `${50 + progress * 50}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-2"
      >
        <div className="w-11 h-11 rounded-xl overflow-hidden border border-border shadow-sm">
          <img
            src={businessImages[selectedType]}
            alt={config.label}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{config.label}</h2>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <p className="text-sm text-muted-foreground">
          Configure sua análise inteligente
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Quanto mais preciso, mais exata será sua análise
        </p>
      </motion.div>

      {/* Revenue Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-5"
      >
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Média de vendas por dia</label>
        </div>
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 focus-within:bg-secondary/60 transition-all">
          <span className="text-base font-bold text-muted-foreground">R$</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder={`Ex: R$ ${suggestedAvgSales[selectedType]} por dia`}
            value={avgSales}
            onChange={handleSalesChange}
            className="flex-1 text-lg font-bold bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:text-sm"
          />
        </div>
      </motion.div>

      {/* Costs Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-5"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Tag className="h-4 w-4 text-accent" />
          <label className="text-sm font-medium text-foreground">Seus principais custos</label>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3 flex items-center gap-1.5">
          <Brain className="h-3 w-3 text-primary/60" />
          Pré-selecionamos os custos mais comuns do seu setor
        </p>
        <div className="flex flex-wrap gap-2">
          {allCostCategories.map((cost) => (
            <motion.button
              key={cost}
              whileTap={{ scale: 0.93 }}
              onClick={() => toggleCost(cost)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCosts.includes(cost)
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm shadow-primary/10'
                  : 'bg-secondary/50 text-muted-foreground border border-border hover:text-foreground hover:border-border'
              }`}
            >
              {cost}
            </motion.button>
          ))}

          {/* Custom costs added by user */}
          {selectedCosts
            .filter(c => !allCostCategories.includes(c))
            .map(cost => (
              <motion.button
                key={cost}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => toggleCost(cost)}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-primary/15 text-primary border border-primary/30 shadow-sm shadow-primary/10 flex items-center gap-1"
              >
                {cost}
                <X className="h-3 w-3" />
              </motion.button>
            ))}

          {/* Add custom cost */}
          {showAddCost ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              className="flex items-center gap-1"
            >
              <input
                type="text"
                value={newCost}
                onChange={e => setNewCost(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomCost()}
                placeholder="Nome do custo"
                autoFocus
                className="px-3 py-2 rounded-xl text-sm bg-secondary/50 border border-border text-foreground outline-none focus:border-primary/40 w-32"
              />
              <button
                onClick={addCustomCost}
                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { setShowAddCost(false); setNewCost(''); }}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setShowAddCost(true)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground border border-dashed border-border hover:border-primary/30 hover:text-primary transition-all flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* AI Hint */}
      <AnimatePresence mode="wait">
        {showAiHint && aiHintIndex >= 0 && (
          <motion.div
            key={aiHintIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-xs text-primary/80">{aiHints[aiHintIndex]}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onFinish(avgSales, selectedCosts)}
        className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base active:scale-[0.97] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
      >
        <Brain className="h-4.5 w-4.5" />
        Gerar minha análise
        <ArrowRight className="h-4.5 w-4.5" />
      </motion.button>
    </motion.div>
  );
}
