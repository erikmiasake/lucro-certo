import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { setBusinessType, setOnboardingData } from '@/lib/store';
import { TextEffect } from '@/components/ui/text-effect';
import { Sparkles, Zap, Clock } from 'lucide-react';
import HeroScreen from '@/components/HeroScreen';
import AILoadingScreen from '@/components/AILoadingScreen';
import OnboardingDetails from '@/components/OnboardingDetails';

const types: BusinessType[] = ['restaurante', 'salao', 'petshop', 'loja', 'academia', 'outro'];

const businessImages: Record<BusinessType, string> = {
  restaurante: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
  salao: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
  petshop: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=600&auto=format&fit=crop',
  loja: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
  academia: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
  outro: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
};

const businessIcons: Record<BusinessType, string> = {
  restaurante: '🍽️',
  salao: '💇',
  petshop: '🐾',
  loja: '🛍️',
  academia: '💪',
  outro: '📦',
};

export default function Onboarding() {
  const [step, setStep] = useState<'hero' | 'loading' | 'type' | 'details'>('hero');
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [clickedType, setClickedType] = useState<BusinessType | null>(null);

  const handleHeroStart = () => setStep('loading');
  const handleLoadingComplete = useCallback(() => setStep('type'), []);

  const handleSelectType = (type: BusinessType) => {
    setClickedType(type);
    setTimeout(() => {
      setSelectedType(type);
      setStep('details');
      setClickedType(null);
    }, 300);
  };

  const handleFinish = (avgSales: string, selectedCosts: string[]) => {
    if (!selectedType) return;
    const avg = parseFloat(avgSales.replace(/\./g, '').replace(',', '.'));
    setOnboardingData({
      averageSales: avg > 0 ? avg : undefined,
      mainCosts: selectedCosts.length > 0 ? selectedCosts : undefined,
    });
    setBusinessType(selectedType);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center safe-bottom relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'hero' ? (
          <HeroScreen key="hero" onStart={handleHeroStart} onLearnMore={() => {}} />
        ) : step === 'loading' ? (
          <AILoadingScreen key="loading" onComplete={handleLoadingComplete} />
        ) : step === 'type' ? (
          <motion.div
            key="type-step"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl px-6 py-10"
          >
            {/* Header Section */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
                className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg glow-primary"
              >
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </motion.div>

              <TextEffect preset="blur" as="h1" className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2 tracking-tight leading-tight">
                Descubra quanto você realmente lucra
              </TextEffect>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="text-muted-foreground text-base mb-2 max-w-md mx-auto">
                  Escolha seu tipo de negócio e receba análises inteligentes personalizadas
                </p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground/70 text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Configuração rápida — menos de 30 segundos</span>
                </div>
              </motion.div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {types.map((type, index) => {
                const c = businessConfigs[type];
                const isClicked = clickedType === type;

                return (
                  <motion.button
                    key={type}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isClicked ? 0.95 : 1,
                    }}
                    transition={{
                      delay: index * 0.08,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectType(type)}
                    className="group relative rounded-2xl overflow-hidden border border-border bg-card text-left transition-shadow duration-300 hover:shadow-[0_8px_40px_hsl(var(--primary)/0.12)] hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {/* Image */}
                    <div className="relative h-32 sm:h-36 overflow-hidden">
                      <img
                        src={businessImages[type]}
                        alt={c.label}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                      
                      {/* Hover glow overlay */}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                      
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-4 pt-1">
                      <h3 className="text-foreground font-bold text-sm sm:text-base leading-tight mb-1 group-hover:text-primary transition-colors duration-200">
                        {c.label}
                      </h3>
                      <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-primary/60" />
                        {c.entryLabel}
                      </p>
                    </div>

                    {/* Selection indicator line */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </motion.button>
                );
              })}
            </div>

            {/* Trust indicator */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-muted-foreground/50 text-xs mt-8"
            >
              Powered by inteligência artificial • Análises em tempo real
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="details-step"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm px-6 py-10"
          >
            <button
              onClick={() => setStep('type')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-border">
                <img
                  src={selectedType ? businessImages[selectedType] : ''}
                  alt={config?.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{config?.label}</h2>
                <p className="text-muted-foreground text-sm">Personalize sua análise</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <label className="text-sm font-medium text-foreground">Média de vendas por dia (opcional)</label>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
                <span className="text-lg font-bold text-muted-foreground">R$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={avgSales}
                  onChange={(e) => setAvgSales(e.target.value)}
                  className="flex-1 text-xl font-bold bg-transparent outline-none text-foreground placeholder:text-muted"
                />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-accent" />
                <label className="text-sm font-medium text-foreground">Seus principais custos (opcional)</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {allCostCategories.map((cost) => (
                  <button
                    key={cost}
                    onClick={() => toggleCost(cost)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.95] ${
                      selectedCosts.includes(cost)
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-secondary text-muted-foreground border border-border hover:text-foreground'
                    }`}
                  >
                    {cost}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-lg active:scale-[0.97] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              Começar a usar
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
