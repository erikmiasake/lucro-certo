import { useState } from 'react';
import { motion } from 'framer-motion';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { setBusinessType, setOnboardingData } from '@/lib/store';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { TextEffect } from '@/components/ui/text-effect';
import { ArrowRight, ArrowLeft, DollarSign, Tag } from 'lucide-react';

const types: BusinessType[] = ['restaurante', 'salao', 'petshop', 'loja', 'outro'];

export default function Onboarding() {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [avgSales, setAvgSales] = useState('');
  const [selectedCosts, setSelectedCosts] = useState<string[]>([]);

  const handleSelectType = (type: BusinessType) => {
    setSelectedType(type);
    setStep('details');
    setSelectedCosts([]);
  };

  const handleFinish = () => {
    if (!selectedType) return;
    const avg = parseFloat(avgSales.replace(',', '.'));
    setOnboardingData({
      averageSales: avg > 0 ? avg : undefined,
      mainCosts: selectedCosts.length > 0 ? selectedCosts : undefined,
    });
    setBusinessType(selectedType);
  };

  const config = selectedType ? businessConfigs[selectedType] : null;
  const allCostCategories = config
    ? [...config.costCategories.product, ...config.costCategories.business]
    : [];

  const toggleCost = (cost: string) => {
    setSelectedCosts(prev =>
      prev.includes(cost) ? prev.filter(c => c !== cost) : [...prev, cost]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 safe-bottom relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      {step === 'type' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
            className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg glow-primary"
          >
            💰
          </motion.div>

          <TextEffect preset="blur" as="h1" className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Lucro Real
          </TextEffect>

          <TextEffect preset="fade" delay={0.3} as="p" className="text-muted-foreground mb-10 text-base">
            Seu assistente inteligente de lucro.
          </TextEffect>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-foreground font-semibold text-lg mb-5"
          >
            Qual é o seu tipo de negócio?
          </motion.p>

          <AnimatedGroup preset="blur-slide" className="flex flex-col gap-3">
            {types.map((type) => {
              const c = businessConfigs[type];
              return (
                <button
                  key={type}
                  onClick={() => handleSelectType(type)}
                  className="group flex items-center gap-4 w-full p-4 rounded-2xl card-elevated hover:border-primary/40 transition-all text-left active:scale-[0.98] hover:glow-primary"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {c.icon}
                  </div>
                  <div className="flex-1">
                    <span className="text-foreground font-semibold text-base block">{c.label}</span>
                    <span className="text-muted-foreground text-xs">{c.entryLabel}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </AnimatedGroup>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <button
            onClick={() => setStep('type')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
              {config?.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{config?.label}</h2>
              <p className="text-muted-foreground text-sm">Personalize seu app</p>
            </div>
          </div>

          {/* Average sales */}
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

          {/* Main costs */}
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
    </div>
  );
}
