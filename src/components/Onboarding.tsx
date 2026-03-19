import { useState } from 'react';
import { motion } from 'framer-motion';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { setBusinessType, setOnboardingData } from '@/lib/store';
import { TextEffect } from '@/components/ui/text-effect';
import { GalleryCard } from '@/components/ui/generative-art-gallery';
import { ArrowRight, ArrowLeft, DollarSign, Tag, TrendingUp } from 'lucide-react';

const types: BusinessType[] = ['restaurante', 'salao', 'petshop', 'loja', 'outro'];

const businessImages: Record<BusinessType, string> = {
  restaurante: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
  salao: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
  petshop: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=600&auto=format&fit=crop',
  loja: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
  outro: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
};

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10 safe-bottom relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      {step === 'type' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
            className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-lg glow-primary"
          >
            <TrendingUp className="h-7 w-7 text-primary-foreground" />
          </motion.div>

          <TextEffect preset="blur" as="h1" className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Lucro Real
          </TextEffect>

          <TextEffect preset="fade" delay={0.3} as="p" className="text-muted-foreground mb-8 text-base">
            Qual empreendimento vamos analisar?
          </TextEffect>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {types.map((type, index) => {
              const c = businessConfigs[type];
              return (
                <GalleryCard
                  key={type}
                  index={index}
                  onClick={() => handleSelectType(type)}
                  item={{
                    title: c.label,
                    category: c.entryLabel,
                    image: businessImages[type],
                  }}
                />
              );
            })}
          </div>
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
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <img
                src={selectedType ? businessImages[selectedType] : ''}
                alt={config?.label}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{config?.label}</h2>
              <p className="text-muted-foreground text-sm">Personalize seu app</p>
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
    </div>
  );
}
