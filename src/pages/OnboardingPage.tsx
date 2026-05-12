import { useState, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BusinessType, UsageMode, businessConfigs } from '@/lib/business-config';
import { setBusinessType, setOnboardingData, setBusinessProfile, initCostMapFromOnboarding, getState, addCostMapItem, addEntry, updateCostMapItem } from '@/lib/store';

// Example seed values for common cost categories (used to pre-fill business onboarding)
const COST_SEED_VALUES: Array<{ match: RegExp; value: number }> = [
  { match: /aluguel/i, value: 1500 },
  { match: /sal[áa]rio|folha/i, value: 1800 },
  { match: /internet|telefone/i, value: 150 },
  { match: /energia|luz/i, value: 300 },
  { match: /[áa]gua/i, value: 100 },
  { match: /contador|contabil/i, value: 250 },
  { match: /marketing|an[úu]ncio|publicidade/i, value: 200 },
  { match: /fornecedor|insumo|mat[ée]ria/i, value: 800 },
  { match: /transporte|frete|combust[íi]vel/i, value: 200 },
  { match: /embalagem/i, value: 150 },
  { match: /manuten[çc][ãa]o/i, value: 200 },
  { match: /limpeza/i, value: 100 },
  { match: /imposto|taxa/i, value: 300 },
];

function seedValueForCost(name: string, classification: 'fixed' | 'variable'): number {
  for (const { match, value } of COST_SEED_VALUES) {
    if (match.test(name)) return value;
  }
  return classification === 'fixed' ? 300 : 150;
}
import AILoadingScreen from '@/components/AILoadingScreen';
import OnboardingDetails, { OnboardingFinishData } from '@/components/OnboardingDetails';
import { Sparkles, Clock, Zap, Store, Wallet } from 'lucide-react';
import { TextEffect } from '@/components/ui/text-effect';

const businessTypes: BusinessType[] = ['restaurante', 'salao', 'petshop', 'loja', 'academia', 'outro'];

const businessImages: Partial<Record<BusinessType, string>> = {
  restaurante: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
  salao: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
  petshop: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=600&auto=format&fit=crop',
  loja: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
  academia: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
  outro: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'loading' | 'mode' | 'type' | 'details'>('loading');
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [clickedType, setClickedType] = useState<BusinessType | null>(null);

  const handleLoadingComplete = useCallback(() => setStep('mode'), []);

  if (getState().onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleModeSelect = (mode: UsageMode) => {
    if (mode === 'personal') {
      setSelectedType('pessoal');
      setStep('details');
    } else {
      setStep('type');
    }
  };

  const handleSelectType = (type: BusinessType) => {
    setClickedType(type);
    setTimeout(() => {
      setSelectedType(type);
      setStep('details');
      setClickedType(null);
    }, 300);
  };

  const handleFinish = (data: OnboardingFinishData) => {
    if (!selectedType) return;

    // Save data to store
    const avg = parseFloat(data.avgSales.replace(/\./g, '').replace(',', '.'));
    setOnboardingData({
      averageSales: avg > 0 ? avg : undefined,
      mainCosts: data.selectedCosts.length > 0 ? data.selectedCosts : undefined,
    });
    if (data.profile) {
      setBusinessProfile(data.profile);
    }
    if (data.selectedCosts.length > 0) {
      initCostMapFromOnboarding(data.selectedCosts);
    }
    // Add employee payroll as fixed cost
    if (data.employeePayroll && data.employeePayroll > 0) {
      addCostMapItem('Folha de pagamento', 'fixed', data.employeePayroll);
    }
    setBusinessType(selectedType);

    // Personal mode: auto-seed monthly income as initial entry (only once)
    if (selectedType === 'pessoal' && avg > 0) {
      const hasOnboardingEntry = getState().entries.some(
        (e) => e.source === 'onboarding' || e.category === 'Renda mensal'
      );
      if (!hasOnboardingEntry) {
        addEntry(avg, 'Renda mensal', 'Renda mensal', 'onboarding');
        try {
          sessionStorage.setItem('lr_personal_seed_msg', '1');
        } catch {}
      }
    }

    // Business mode: auto-seed initial revenue + example cost values (only once)
    if (selectedType !== 'pessoal') {
      const current = getState();
      const hasOnboardingEntry = current.entries.some(
        (e) => e.source === 'onboarding' || e.category === 'Vendas'
      );
      let seeded = false;
      if (avg > 0 && !hasOnboardingEntry) {
        addEntry(avg, 'Faturamento inicial', 'Vendas', 'onboarding');
        seeded = true;
      }
      // Pre-fill example values for cost map items still at 0
      getState().costMap.forEach((item) => {
        if (!item.value || item.value <= 0) {
          updateCostMapItem(item.id, { value: seedValueForCost(item.name, item.classification) });
          seeded = true;
        }
      });
      if (seeded) {
        try {
          sessionStorage.setItem('lr_business_seed_msg', '1');
        } catch {}
      }
    }

    // Navigate to summary with data in state
    navigate('/summary', {
      state: {
        businessType: selectedType,
        avgSales: data.avgSales,
        selectedCosts: data.selectedCosts,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center safe-bottom relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'loading' ? (
          <AILoadingScreen key="loading" onComplete={handleLoadingComplete} />
        ) : step === 'mode' ? (
          <motion.div
            key="mode-step"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg px-4 sm:px-6 py-6 sm:py-10"
          >
            <div className="text-center mb-6 sm:mb-10">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg glow-primary"
              >
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <TextEffect preset="blur" as="h1" className="text-xl sm:text-3xl font-extrabold text-foreground mb-2 tracking-tight leading-tight">
                Como você quer usar o LucroReal?
              </TextEffect>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto"
              >
                Escolha o modo que melhor se encaixa na sua realidade
              </motion.p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeSelect('business')}
                className="group relative rounded-2xl p-5 sm:p-6 border border-border bg-card text-left transition-shadow duration-300 hover:shadow-[0_8px_40px_hsl(var(--primary)/0.12)] hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors">Negócio</h3>
                    <p className="text-muted-foreground text-sm">Para empresas, microempreendedores e negócios</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeSelect('personal')}
                className="group relative rounded-2xl p-5 sm:p-6 border border-border bg-card text-left transition-shadow duration-300 hover:shadow-[0_8px_40px_hsl(var(--accent)/0.12)] hover:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Wallet className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold text-base sm:text-lg mb-1 group-hover:text-accent transition-colors">Uso pessoal</h3>
                    <p className="text-muted-foreground text-sm">Para organizar ganhos e gastos do dia a dia</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
              </motion.button>
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-muted-foreground/50 text-xs mt-6 sm:mt-8">
              Powered by inteligência artificial
            </motion.p>
          </motion.div>
        ) : step === 'type' ? (
          <motion.div
            key="type-step"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-10"
          >
            <div className="text-center mb-5 sm:mb-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg glow-primary"
              >
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </motion.div>

              <TextEffect preset="blur" as="h1" className="text-xl sm:text-3xl font-extrabold text-foreground mb-2 tracking-tight leading-tight">
                Descubra quanto você realmente lucra
              </TextEffect>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="text-muted-foreground text-sm sm:text-base mb-2 max-w-md mx-auto">
                  Escolha seu tipo de negócio e receba análises inteligentes personalizadas
                </p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground/70 text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Configuração rápida — menos de 30 segundos</span>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
              {businessTypes.map((type, index) => {
                const c = businessConfigs[type];
                const isClicked = clickedType === type;

                return (
                  <motion.button
                    key={type}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: isClicked ? 0.95 : 1 }}
                    transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectType(type)}
                    className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card text-left transition-shadow duration-300 hover:shadow-[0_8px_40px_hsl(var(--primary)/0.12)] hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <div className="relative h-24 sm:h-36 overflow-hidden">
                      <img src={businessImages[type]} alt={c.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                    </div>
                    <div className="px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
                      <h3 className="text-foreground font-bold text-xs sm:text-base leading-tight mb-0.5 sm:mb-1 group-hover:text-primary transition-colors duration-200">{c.label}</h3>
                      <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-primary/60" />
                        {c.entryLabel}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </motion.button>
                );
              })}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center text-muted-foreground/50 text-xs mt-5 sm:mt-8">
              Powered by inteligência artificial
            </motion.p>
          </motion.div>
        ) : step === 'details' && selectedType ? (
          <OnboardingDetails
            key="details-step"
            selectedType={selectedType}
            onBack={() => setStep(selectedType === 'pessoal' ? 'mode' : 'type')}
            onFinish={handleFinish}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
