import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { BusinessProfile } from '@/lib/store';
import {
  ArrowRight, ArrowLeft, DollarSign, Tag, Brain, Plus, X, Sparkles,
  Building2, MapPin, Calendar, Users, Crosshair, TrendingUp, Percent,
  CheckCircle2
} from 'lucide-react';

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

const objectives = [
  { value: 'increase_profit', label: 'Aumentar lucro', icon: TrendingUp },
  { value: 'reduce_costs', label: 'Reduzir custos', icon: Percent },
  { value: 'organize', label: 'Organizar financeiro', icon: Calendar },
] as const;

export interface OnboardingFinishData {
  avgSales: string;
  selectedCosts: string[];
  profile: Partial<BusinessProfile>;
}

interface Props {
  selectedType: BusinessType;
  onBack: () => void;
  onFinish: (data: OnboardingFinishData) => void;
}

export default function OnboardingDetails({ selectedType, onBack, onFinish }: Props) {
  const [avgSales, setAvgSales] = useState('');
  const [selectedCosts, setSelectedCosts] = useState<string[]>([]);
  const [newCost, setNewCost] = useState('');
  const [showAddCost, setShowAddCost] = useState(false);
  const [aiHintIndex, setAiHintIndex] = useState(-1);
  const [showAiHint, setShowAiHint] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [operatingWeekdays, setOperatingWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [employeeCount, setEmployeeCount] = useState('');
  const [averageSalary, setAverageSalary] = useState('');
  const [objective, setObjective] = useState('');

  const config = businessConfigs[selectedType];
  const allCostCategories = useMemo(
    () => [...config.costCategories.product, ...config.costCategories.business],
    [config]
  );

  useEffect(() => {
    const preSelected = [
      ...config.costCategories.product.slice(0, 2),
      ...config.costCategories.business.slice(0, 2),
    ];
    setSelectedCosts(preSelected);
  }, [config]);

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

  const weekdayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const toggleWeekday = (day: number) => {
    setOperatingWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleFinish = () => {
    onFinish({
      avgSales,
      selectedCosts,
      profile: {
        name: businessName,
        city,
        operatingDays: operatingWeekdays.length,
        operatingWeekdays,
        employeeCount: parseInt(employeeCount) || 0,
        objective: objective as BusinessProfile['objective'],
      },
    });
  };

  const filledFields = (avgSales.length > 0 ? 1 : 0) + (selectedCosts.length > 0 ? 1 : 0) + (businessName.length > 0 ? 0.5 : 0) + (objective ? 0.5 : 0);
  const progress = Math.min(filledFields / 3, 1);

  // Checklist for the desktop side panel
  const checklistItems = [
    { label: 'Nome do negócio', done: businessName.length > 0 },
    { label: 'Localização', done: city.length > 0 },
    { label: 'Média de vendas', done: avgSales.length > 0 },
    { label: 'Objetivo definido', done: objective.length > 0 },
    { label: 'Custos selecionados', done: selectedCosts.length > 0 },
  ];

  const formContent = (
    <>
      {/* Back + Progress */}
      <div className="flex items-center justify-between mb-5">
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-1.5">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shadow-sm">
          <img src={businessImages[selectedType]} alt={config.label} className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{config.label}</h2>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-5">
        <p className="text-sm text-muted-foreground">Configure sua análise inteligente</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">Quanto mais preciso, mais exata será sua análise</p>
      </motion.div>

      {/* Business Name */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Building2 className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Nome do negócio</label>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
          <input
            type="text"
            placeholder="Ex: Restaurante do João"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
          />
        </div>
      </motion.div>

      {/* City */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <MapPin className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Cidade / Região</label>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
          <input
            type="text"
            placeholder="Ex: São Paulo, SP"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
          />
        </div>
      </motion.div>

      {/* Operating days */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="mb-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <label className="text-xs font-medium text-foreground">Dias de funcionamento</label>
        </div>
        <div className="flex gap-1.5">
          {weekdayLabels.map((label, idx) => {
            const isActive = operatingWeekdays.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleWeekday(idx)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-secondary/40 text-muted-foreground border border-border hover:border-primary/20'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Employees */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mb-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Users className="h-3.5 w-3.5 text-primary" />
          <label className="text-xs font-medium text-foreground">Funcionários</label>
        </div>
        <div className="p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={employeeCount}
            onChange={e => setEmployeeCount(e.target.value)}
            className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
          />
        </div>
      </motion.div>

      {/* Revenue Input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <DollarSign className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Média de vendas por dia</label>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
          <span className="text-sm font-bold text-muted-foreground">R$</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder={`Ex: R$ ${suggestedAvgSales[selectedType]} por dia`}
            value={avgSales}
            onChange={handleSalesChange}
            className="flex-1 text-sm font-bold bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 placeholder:font-normal"
          />
        </div>
      </motion.div>

      {/* Objective */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Crosshair className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Objetivo principal</label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {objectives.map(obj => {
            const isActive = objective === obj.value;
            return (
              <button
                key={obj.value}
                onClick={() => setObjective(obj.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all ${
                  isActive
                    ? 'bg-primary/15 border border-primary/30 shadow-sm shadow-primary/10'
                    : 'bg-secondary/40 border border-border hover:border-primary/20'
                }`}
              >
                <obj.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium leading-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{obj.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Costs Selection */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="h-4 w-4 text-accent" />
          <label className="text-sm font-medium text-foreground">Seus principais custos</label>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-2.5 flex items-center gap-1.5">
          <Brain className="h-3 w-3 text-primary/60" />
          Pré-selecionamos os custos mais comuns do seu setor
        </p>
        <div className="flex flex-wrap gap-2">
          {allCostCategories.map((cost) => (
            <motion.button
              key={cost}
              whileTap={{ scale: 0.93 }}
              onClick={() => toggleCost(cost)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCosts.includes(cost)
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm shadow-primary/10'
                  : 'bg-secondary/50 text-muted-foreground border border-border hover:text-foreground hover:border-border'
              }`}
            >
              {cost}
            </motion.button>
          ))}

          {selectedCosts
            .filter(c => !allCostCategories.includes(c))
            .map(cost => (
              <motion.button
                key={cost}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => toggleCost(cost)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/15 text-primary border border-primary/30 flex items-center gap-1"
              >
                {cost}
                <X className="h-3 w-3" />
              </motion.button>
            ))}

          {showAddCost ? (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} className="flex items-center gap-1">
              <input
                type="text"
                value={newCost}
                onChange={e => setNewCost(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomCost()}
                placeholder="Nome do custo"
                autoFocus
                className="px-3 py-1.5 rounded-lg text-xs bg-secondary/50 border border-border text-foreground outline-none focus:border-primary/40 w-28"
              />
              <button onClick={addCustomCost} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Plus className="h-3 w-3" />
              </button>
              <button onClick={() => { setShowAddCost(false); setNewCost(''); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setShowAddCost(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground border border-dashed border-border hover:border-primary/30 hover:text-primary transition-all flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
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
            className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10"
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
        onClick={handleFinish}
        className="w-full py-3.5 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
      >
        <Brain className="h-4 w-4" />
        Gerar minha análise
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </>
  );

  return (
    <motion.div
      key="details-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-h-[100dvh] overflow-y-auto"
    >
      {/* Desktop: split layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left - Form */}
        <div className="w-1/2 flex items-start justify-center overflow-y-auto py-10 px-8">
          <div className="w-full max-w-lg">
            {formContent}
          </div>
        </div>

        {/* Right - Contextual panel */}
        <div className="w-1/2 relative border-l border-border/30">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <img
              src={businessImages[selectedType]}
              alt=""
              className="w-full h-full object-cover opacity-20"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full px-12 py-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Sua análise personalizada
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Preencha os dados ao lado para que nossa IA gere um diagnóstico completo do seu {config.label.toLowerCase()}.
                </p>
              </div>

              {/* Live checklist */}
              <div className="space-y-3 mb-8">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Progresso</p>
                {checklistItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      item.done
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-card/40 border border-border/30'
                    }`}
                  >
                    <CheckCircle2
                      className={`h-4 w-4 transition-colors duration-300 ${
                        item.done ? 'text-primary' : 'text-muted-foreground/30'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium transition-colors duration-300 ${
                        item.done ? 'text-foreground' : 'text-muted-foreground/50'
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* AI Insight */}
              <AnimatePresence mode="wait">
                {showAiHint && aiHintIndex >= 0 && (
                  <motion.div
                    key={`desktop-hint-${aiHintIndex}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10"
                  >
                    <Sparkles className="h-4 w-4 text-primary animate-pulse flex-shrink-0" />
                    <span className="text-sm text-primary/80">{aiHints[aiHintIndex]}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile: original single column */}
      <div className="lg:hidden flex justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-md">
          {formContent}
        </div>
      </div>
    </motion.div>
  );
}
