import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessType, businessConfigs, businessImages, isPersonalMode } from '@/lib/business-config';
import { BusinessProfile, getMonthSummary } from '@/lib/finance';
import {
  ArrowRight, ArrowLeft, DollarSign, Tag, Brain, Plus, X, Sparkles,
  Building2, MapPin, Calendar, Users, Crosshair, TrendingUp, Percent,
  CheckCircle2, Wallet, PiggyBank, BarChart3, Shield, Package, Repeat, Target
} from 'lucide-react';

// Sugestão de faturamento médio MENSAL por tipo de negócio
// (≈ média diária × 26 dias operacionais por mês)
const suggestedAvgSales: Partial<Record<BusinessType, string>> = {
  restaurante: '40.000',
  salao: '20.000',
  petshop: '30.000',
  loja: '50.000',
  academia: '80.000',
  outro: '25.000',
};

const aiHints = [
  'Estimando faturamento mensal…',
  'Calculando possíveis custos…',
  'Analisando margens do setor…',
  'Preparando insights personalizados…',
];

const personalAiHints = [
  'Analisando seu perfil financeiro…',
  'Calculando seus gastos principais…',
  'Preparando dicas de economia…',
  'Gerando insights sobre suas finanças…',
];

const objectives = [
  { value: 'increase_profit', label: 'Aumentar lucro', icon: TrendingUp },
  { value: 'reduce_costs', label: 'Reduzir custos', icon: Percent },
  { value: 'organize', label: 'Organizar financeiro', icon: Calendar },
] as const;

const personalObjectives = [
  { value: 'organize_expenses', label: 'Organizar meus gastos', icon: BarChart3 },
  { value: 'understand_balance', label: 'Entender quanto sobra', icon: Wallet },
  { value: 'reduce_expenses', label: 'Reduzir despesas', icon: Percent },
  { value: 'build_reserve', label: 'Criar reserva financeira', icon: Shield },
] as const;

const incomeFrequencies = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'variable', label: 'Variável' },
] as const;

const personalVariableCategories = [
  'Alimentação', 'Transporte', 'Lazer', 'Compras', 'Saúde',
];
const personalFixedCategories = [
  'Moradia', 'Contas fixas', 'Assinaturas', 'Educação',
];
const personalExpenseCategories = [...personalVariableCategories, ...personalFixedCategories];

export interface OnboardingFinishData {
  avgSales: string;
  selectedCosts: string[];
  profile: Partial<BusinessProfile>;
  employeePayroll?: number;
  monthlyIncome?: number;
  /** Faturamento médio mensal do negócio (modo business) */
  monthlyRevenue?: number;
  /** Meta de lucro/sobra mensal em R$ */
  goalProfit?: number;
  /** Meta de margem mensal em % */
  goalMargin?: number;
}

interface Props {
  selectedType: BusinessType;
  onBack: () => void;
  onFinish: (data: OnboardingFinishData) => void;
}

export default function OnboardingDetails({ selectedType, onBack, onFinish }: Props) {
  const isPersonal = isPersonalMode(selectedType);

  // Shared state
  const [city, setCity] = useState('');
  const [selectedCosts, setSelectedCosts] = useState<string[]>([]);
  const [newCost, setNewCost] = useState('');
  const [showAddCost, setShowAddCost] = useState(false);
  const [aiHintIndex, setAiHintIndex] = useState(-1);
  const [showAiHint, setShowAiHint] = useState(false);
  const [objective, setObjective] = useState('');

  // Business-only state
  const [avgSales, setAvgSales] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [operatingWeekdays, setOperatingWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [employeeCount, setEmployeeCount] = useState('');
  const [averageSalary, setAverageSalary] = useState('');

  // Personal-only state
  const [profileName, setProfileName] = useState('');
  const [incomeFrequency, setIncomeFrequency] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  // Goals (both modes)
  const [goalProfit, setGoalProfit] = useState('');
  const [goalMargin, setGoalMargin] = useState('');
  const [lastEditedGoal, setLastEditedGoal] = useState<'profit' | 'margin' | null>(null);

  const config = businessConfigs[selectedType];

  const allCostCategories = useMemo(
    () => isPersonal ? personalExpenseCategories : [...config.costCategories.product, ...config.costCategories.business],
    [config, isPersonal]
  );

  useEffect(() => {
    if (isPersonal) {
      setSelectedCosts(['Alimentação', 'Transporte', 'Moradia', 'Contas fixas']);
    } else {
      const preSelected = [
        ...config.costCategories.product.slice(0, 2),
        ...config.costCategories.business.slice(0, 2),
      ];
      setSelectedCosts(preSelected);
    }
  }, [config, isPersonal]);

  const currentHints = isPersonal ? personalAiHints : aiHints;

  useEffect(() => {
    const hasInput = isPersonal
      ? (monthlyIncome.length > 0 || selectedCosts.length > 0)
      : (avgSales.length > 0 || selectedCosts.length > 0);
    if (hasInput) {
      setShowAiHint(true);
      const interval = setInterval(() => {
        setAiHintIndex(prev => (prev + 1) % currentHints.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [avgSales, monthlyIncome, selectedCosts, isPersonal, currentHints]);

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

  const parseCurrencyValue = (value: string) => parseInt(value.replace(/\D/g, ''), 10) || 0;
  const parsePercentValue = (value: string) => parseFloat(value.replace(',', '.')) || 0;

  const handleSalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvgSales(formatCurrency(e.target.value));
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyIncome(formatCurrency(e.target.value));
  };

  const weekdayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const toggleWeekday = (day: number) => {
    setOperatingWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const parsedEmployees = parseInt(employeeCount) || 0;
  const parsedSalary = parseInt(averageSalary.replace(/\D/g, '')) || 0;
  const totalPayroll = parsedEmployees * parsedSalary;

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAverageSalary(formatCurrency(e.target.value));
  };

  // Base de receita/entrada mensal usada para sincronizar meta R$ ↔ %.
  // Prioriza receita real do mês (camada central). Fallback: valor digitado
  // acima nesta tela de onboarding.
  const baseMonthlyRevenue = useMemo(() => {
    const central = getMonthSummary().totalRevenue || 0;
    if (central > 0) return central;
    const raw = isPersonal ? monthlyIncome : avgSales;
    return parseInt(raw.replace(/\D/g, ''), 10) || 0;
  }, [isPersonal, monthlyIncome, avgSales]);

  // Formata % com até 1 casa decimal (evita mostrar "0" quando o valor
  // é pequeno em relação à receita — ex: R$ 20 sobre R$ 15.000 = 0,1%).
  const formatPct = (pct: number) => {
    const clamped = Math.min(100, Math.max(0, pct));
    const rounded = Math.round(clamped * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toString().replace('.', ',');
  };

  const handleGoalProfitChange = (raw: string) => {
    setLastEditedGoal('profit');
    const formatted = formatCurrency(raw);
    setGoalProfit(formatted);
    const val = parseCurrencyValue(formatted);
    if (val === 0) {
      setGoalMargin('');
      return;
    }
    if (baseMonthlyRevenue > 0) {
      setGoalMargin(formatPct((val / baseMonthlyRevenue) * 100));
    } else {
      setGoalMargin('');
    }
  };

  const handleGoalMarginChange = (raw: string) => {
    setLastEditedGoal('margin');
    const clean = raw.replace(/[^\d.,]/g, '');
    setGoalMargin(clean);
    const pct = parsePercentValue(clean);
    if (pct === 0) {
      setGoalProfit('');
      return;
    }
    if (baseMonthlyRevenue > 0 && pct <= 100) {
      const amount = Math.round((pct / 100) * baseMonthlyRevenue);
      setGoalProfit(amount.toLocaleString('pt-BR'));
    } else {
      setGoalProfit('');
    }
  };

  useEffect(() => {
    if (!lastEditedGoal || baseMonthlyRevenue <= 0) return;

    if (lastEditedGoal === 'profit') {
      const val = parseCurrencyValue(goalProfit);
      if (val > 0) {
        setGoalMargin(formatPct((val / baseMonthlyRevenue) * 100));
      }
      return;
    }

    const pct = parsePercentValue(goalMargin);
    if (pct > 0 && pct <= 100) {
      setGoalProfit(Math.round((pct / 100) * baseMonthlyRevenue).toLocaleString('pt-BR'));
    }
  }, [baseMonthlyRevenue, lastEditedGoal, goalProfit, goalMargin]);




  const handleFinish = () => {
    const parsedGoalProfit = parseCurrencyValue(goalProfit);
    const parsedGoalMargin = parsePercentValue(goalMargin);
    const goalsPayload = {
      goalProfit: parsedGoalProfit > 0 ? parsedGoalProfit : undefined,
      goalMargin: parsedGoalMargin > 0 && parsedGoalMargin <= 100 ? parsedGoalMargin : undefined,
    };

    if (isPersonal) {
      // Convert monthly income to a daily average (30 days)
      const monthlyVal = parseCurrencyValue(monthlyIncome);
      const dailyAvg = monthlyVal > 0 ? Math.round(monthlyVal / 30) : 0;
      onFinish({
        avgSales: dailyAvg > 0 ? dailyAvg.toLocaleString('pt-BR') : '',
        selectedCosts,
        monthlyIncome: monthlyVal > 0 ? monthlyVal : undefined,
        ...goalsPayload,
        profile: {
          name: profileName || 'Minhas finanças',
          city: '',
          operatingDays: 7,
          operatingWeekdays: [0, 1, 2, 3, 4, 5, 6],
          employeeCount: 0,
          objective: objective as BusinessProfile['objective'],
        },
      });
    } else {
      // avgSales aqui contém o faturamento MENSAL digitado pelo usuário
      const monthlyVal = parseCurrencyValue(avgSales);
      // Conta dias operacionais do mês corrente para converter mensal → diário
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let opDaysInMonth = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        if (operatingWeekdays.includes(new Date(year, month, d).getDay())) opDaysInMonth++;
      }
      const dailyAvg = opDaysInMonth > 0 && monthlyVal > 0
        ? Math.round(monthlyVal / opDaysInMonth)
        : 0;
      onFinish({
        avgSales: dailyAvg > 0 ? dailyAvg.toLocaleString('pt-BR') : '',
        monthlyRevenue: monthlyVal > 0 ? monthlyVal : undefined,
        selectedCosts,
        employeePayroll: totalPayroll > 0 ? totalPayroll : undefined,
        ...goalsPayload,
        profile: {
          name: businessName,
          city: '',
          operatingDays: operatingWeekdays.length,
          operatingWeekdays,
          employeeCount: parsedEmployees,
          objective: objective as BusinessProfile['objective'],
        },
      });
    }
  };

  // Progress
  const filledFields = isPersonal
    ? (monthlyIncome.length > 0 ? 1 : 0) + (selectedCosts.length > 0 ? 1 : 0) + (profileName.length > 0 ? 0.5 : 0) + (objective ? 0.5 : 0)
    : (avgSales.length > 0 ? 1 : 0) + (selectedCosts.length > 0 ? 1 : 0) + (businessName.length > 0 ? 0.5 : 0) + (objective ? 0.5 : 0);
  const progress = Math.min(filledFields / 3, 1);

  const checklistItems = isPersonal
    ? [
        { label: 'Nome do perfil', done: profileName.length > 0 },
        { label: 'Renda mensal', done: monthlyIncome.length > 0 },
        { label: 'Objetivo definido', done: objective.length > 0 },
        { label: 'Categorias de gastos', done: selectedCosts.length > 0 },
      ]
    : [
        { label: 'Nome do negócio', done: businessName.length > 0 },
        
        { label: 'Faturamento mensal', done: avgSales.length > 0 },
        { label: 'Objetivo definido', done: objective.length > 0 },
        { label: 'Custos selecionados', done: selectedCosts.length > 0 },
      ];

  // ===== PERSONAL FORM =====
  const personalFormContent = (
    <>
      {/* Back + Progress */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Etapa 2 de 2</span>
          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div className="h-full rounded-full bg-primary" initial={{ width: '50%' }} animate={{ width: `${50 + progress * 50}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-1.5">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Wallet className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Finanças Pessoais</h2>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-5">
        <p className="text-sm text-muted-foreground">Organize seus ganhos, gastos e entenda quanto sobra no fim do mês.</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">Quanto mais preciso, melhores serão seus insights</p>
      </motion.div>

      {/* Profile Name */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Wallet className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Nome do perfil</label>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
          <input
            type="text"
            placeholder="Ex: Minhas finanças"
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
          />
        </div>
      </motion.div>


      {/* Income Frequency */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Calendar className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Frequência de renda</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {incomeFrequencies.map(freq => {
            const isActive = incomeFrequency === freq.value;
            return (
              <button
                key={freq.value}
                onClick={() => setIncomeFrequency(freq.value)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/15 border border-primary/30 text-primary shadow-sm shadow-primary/10'
                    : 'bg-secondary/40 border border-border text-muted-foreground hover:border-primary/20'
                }`}
              >
                {freq.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Monthly Income */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <DollarSign className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Renda média mensal</label>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
          <span className="text-sm font-bold text-muted-foreground">R$</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ex: R$ 3.000 por mês"
            value={monthlyIncome}
            onChange={handleIncomeChange}
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
        <div className="grid grid-cols-2 gap-2">
          {personalObjectives.map(obj => {
            const isActive = objective === obj.value;
            return (
              <button
                key={obj.value}
                onClick={() => setObjective(obj.value)}
                className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-primary/15 border border-primary/30 shadow-sm shadow-primary/10'
                    : 'bg-secondary/40 border border-border hover:border-primary/20'
                }`}
              >
                <obj.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium leading-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{obj.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Expense Categories — separated by type */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="h-4 w-4 text-accent" />
          <label className="text-sm font-medium text-foreground">Principais categorias de gastos</label>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3 flex items-center gap-1.5">
          <Brain className="h-3 w-3 text-primary/60" />
          Separamos seus gastos entre variáveis (mudam mês a mês) e fixos (sempre iguais)
        </p>

        {/* Variable expenses */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Package className="h-3 w-3 text-accent" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">Gastos Variáveis</span>
            <span className="text-[10px] text-muted-foreground/50">— variam por mês</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {personalVariableCategories.map(cost => (
              <motion.button
                key={cost}
                whileTap={{ scale: 0.93 }}
                onClick={() => toggleCost(cost)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCosts.includes(cost)
                    ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm shadow-accent/10'
                    : 'bg-secondary/50 text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                {cost}
              </motion.button>
            ))}
            {selectedCosts
              .filter(c => !personalExpenseCategories.includes(c))
              .map(cost => (
                <motion.button
                  key={cost}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => toggleCost(cost)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/15 text-accent border border-accent/30 flex items-center gap-1"
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
                  placeholder="Nome do gasto"
                  autoFocus
                  className="px-3 py-1.5 rounded-lg text-xs bg-secondary/50 border border-border text-foreground outline-none focus:border-accent/40 w-28"
                />
                <button onClick={addCustomCost} className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
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
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground border border-dashed border-border hover:border-accent/30 hover:text-accent transition-all flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Adicionar
              </motion.button>
            )}
          </div>
        </div>

        {/* Fixed expenses */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Repeat className="h-3 w-3 text-purple-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Gastos Fixos</span>
            <span className="text-[10px] text-muted-foreground/50">— todo mês</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {personalFixedCategories.map(cost => (
              <motion.button
                key={cost}
                whileTap={{ scale: 0.93 }}
                onClick={() => toggleCost(cost)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCosts.includes(cost)
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-400/30 shadow-sm shadow-purple-500/10'
                    : 'bg-secondary/50 text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                {cost}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Goals (optional) - Personal */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Suas metas do mês</label>
          <span className="text-[10px] text-muted-foreground/60 ml-1">(opcional)</span>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-2.5">
          Aparecem no Dashboard com o progresso em tempo real
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
            <label className="text-[10px] text-muted-foreground/60 mb-0.5 block">Quanto quer poupar</label>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-muted-foreground">R$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="500"
                value={goalProfit}
                onChange={(e) => handleGoalProfitChange(e.target.value)}
                className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
            <label className="text-[10px] text-muted-foreground/60 mb-0.5 block">% da renda</label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                inputMode="decimal"
                placeholder="20"
                value={goalMargin}
                onChange={(e) => handleGoalMarginChange(e.target.value)}
                className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
              />
              <span className="text-xs font-bold text-muted-foreground">%</span>
            </div>
          </div>
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
            <span className="text-xs text-primary/80">{currentHints[aiHintIndex]}</span>
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
        Organizar minhas finanças
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </>
  );

  // ===== BUSINESS FORM =====
  const businessFormContent = (
    <>
      {/* Back + Progress */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Etapa 2 de 2</span>
          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div className="h-full rounded-full bg-primary" initial={{ width: '50%' }} animate={{ width: `${50 + progress * 50}%` }} transition={{ duration: 0.5 }} />
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
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
            <label className="text-[10px] text-muted-foreground/60 mb-0.5 block">Quantidade</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={employeeCount}
              onChange={e => setEmployeeCount(e.target.value)}
              className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
            <label className="text-[10px] text-muted-foreground/60 mb-0.5 block">Salário médio</label>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-muted-foreground">R$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1.500"
                value={averageSalary}
                onChange={handleSalaryChange}
                className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
        </div>
        {totalPayroll > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-primary mt-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Custo mensal com equipe: R$ {totalPayroll.toLocaleString('pt-BR')}
          </motion.p>
        )}
      </motion.div>

      {/* Revenue Input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <DollarSign className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Faturamento médio mensal</label>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
          <span className="text-sm font-bold text-muted-foreground">R$</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder={`Ex: R$ ${suggestedAvgSales[selectedType]} por mês`}
            value={avgSales}
            onChange={handleSalesChange}
            className="flex-1 text-sm font-bold bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 placeholder:font-normal"
          />
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1.5">
          Quanto seu negócio fatura por mês (vendas brutas, antes dos custos). Vamos dividir automaticamente pelos seus dias de funcionamento.
        </p>
      </motion.div>

      {/* Goals (optional) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Suas metas do mês</label>
          <span className="text-[10px] text-muted-foreground/60 ml-1">(opcional)</span>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-2.5">
          Aparecem no Dashboard com o progresso em tempo real
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
            <label className="text-[10px] text-muted-foreground/60 mb-0.5 block">Lucro mensal</label>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-muted-foreground">R$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="10.000"
                value={goalProfit}
                onChange={(e) => handleGoalProfitChange(e.target.value)}
                className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 border border-border focus-within:border-primary/40 transition-all">
            <label className="text-[10px] text-muted-foreground/60 mb-0.5 block">Margem desejada</label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                inputMode="decimal"
                placeholder="20"
                value={goalMargin}
                onChange={(e) => handleGoalMarginChange(e.target.value)}
                className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
              />
              <span className="text-xs font-bold text-muted-foreground">%</span>
            </div>
          </div>
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
            <span className="text-xs text-primary/80">{currentHints[aiHintIndex]}</span>
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

  const formContent = isPersonal ? personalFormContent : businessFormContent;

  const desktopPanelTitle = isPersonal ? 'Sua análise financeira' : 'Sua análise personalizada';
  const desktopPanelDesc = isPersonal
    ? 'Preencha os dados ao lado para receber insights personalizados sobre suas finanças pessoais.'
    : `Preencha os dados ao lado para que nossa IA gere um diagnóstico completo do seu ${config.label.toLowerCase()}.`;

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
          {/* Background */}
          <div className="absolute inset-0 z-0">
            {!isPersonal && businessImages[selectedType] && (
              <>
                <img src={businessImages[selectedType]} alt="" className="w-full h-full object-cover opacity-20" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
              </>
            )}
            {isPersonal && (
              <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/5 to-primary/5" />
            )}
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
                  {isPersonal ? <PiggyBank className="h-6 w-6 text-primary" /> : <Sparkles className="h-6 w-6 text-primary" />}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{desktopPanelTitle}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desktopPanelDesc}</p>
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
                    <CheckCircle2 className={`h-4 w-4 transition-colors duration-300 ${item.done ? 'text-primary' : 'text-muted-foreground/30'}`} />
                    <span className={`text-sm font-medium transition-colors duration-300 ${item.done ? 'text-foreground' : 'text-muted-foreground/50'}`}>
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
                    <span className="text-sm text-primary/80">{currentHints[aiHintIndex]}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile: single column */}
      <div className="lg:hidden flex justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-md">
          {formContent}
        </div>
      </div>
    </motion.div>
  );
}
