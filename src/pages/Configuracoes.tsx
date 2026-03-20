import { useStore } from '@/hooks/use-store';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { setBusinessType, resetAll, setGoals, setBusinessProfile } from '@/lib/store';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check, Trash2, Target, TrendingUp, Percent, Building2,
  MapPin, Calendar, Users, Crosshair, ChevronDown, Save
} from 'lucide-react';

const types: BusinessType[] = ['restaurante', 'salao', 'petshop', 'loja', 'academia', 'outro'];

const objectives = [
  { value: 'increase_profit', label: 'Aumentar lucro', icon: TrendingUp },
  { value: 'reduce_costs', label: 'Reduzir custos', icon: Percent },
  { value: 'organize', label: 'Organizar financeiro', icon: Calendar },
] as const;

export default function Configuracoes() {
  const state = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [profitGoal, setProfitGoal] = useState(state.goals?.monthlyProfit?.toString() || '');
  const [marginGoal, setMarginGoal] = useState(state.goals?.monthlyMargin?.toString() || '');
  const [goalsSaved, setGoalsSaved] = useState(false);

  const [businessName, setBusinessName] = useState(state.businessProfile?.name || '');
  const [city, setCity] = useState(state.businessProfile?.city || '');
  const [operatingDays, setOperatingDays] = useState(state.businessProfile?.operatingDays?.toString() || '6');
  const [employeeCount, setEmployeeCount] = useState(state.businessProfile?.employeeCount?.toString() || '0');
  const [objective, setObjective] = useState(state.businessProfile?.objective || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const [showType, setShowType] = useState(false);

  const handleReset = () => {
    if (confirmReset) {
      resetAll();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const handleSaveGoals = () => {
    const profit = parseFloat(profitGoal.replace(',', '.'));
    const margin = parseFloat(marginGoal.replace(',', '.'));
    setGoals({
      monthlyProfit: !isNaN(profit) && profit > 0 ? profit : null,
      monthlyMargin: !isNaN(margin) && margin > 0 ? margin : null,
    });
    setGoalsSaved(true);
    setTimeout(() => setGoalsSaved(false), 2000);
  };

  const handleSaveProfile = () => {
    setBusinessProfile({
      name: businessName,
      city,
      operatingDays: parseInt(operatingDays) || 6,
      employeeCount: parseInt(employeeCount) || 0,
      objective: objective as any,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const config = state.businessType ? businessConfigs[state.businessType] : null;

  const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
    </div>
  );

  const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = 'text', inputMode }: any) => (
    <div>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border focus-within:border-primary/30 transition-colors">
        <input
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-sm font-medium bg-transparent outline-none text-foreground placeholder:text-muted"
        />
      </div>
    </div>
  );

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto safe-bottom">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Meu Negócio</h1>
        <p className="text-muted-foreground text-sm mt-1">Perfil e estrutura do seu negócio</p>
      </div>

      {/* Business Profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 card-elevated mb-5">
        <SectionTitle icon={Building2} title="Perfil" />
        <div className="space-y-4">
          <InputField label="Nome do negócio" icon={Building2} value={businessName} onChange={setBusinessName} placeholder="Ex: Restaurante do João" />
          <InputField label="Cidade / Região" icon={MapPin} value={city} onChange={setCity} placeholder="Ex: São Paulo, SP" />

          {/* Business type selector */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Crosshair className="h-3 w-3" />
              Tipo de negócio
            </label>
            <button
              onClick={() => setShowType(!showType)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{config?.label || 'Selecione'}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showType ? 'rotate-180' : ''}`} />
            </button>
            {showType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1"
              >
                {types.map((type) => {
                  const c = businessConfigs[type];
                  const isActive = state.businessType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => { setBusinessType(type); setShowType(false); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-primary/10 border border-primary/30'
                          : 'bg-secondary/30 border border-transparent hover:border-border hover:bg-secondary/60'
                      }`}
                    >
                      <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>{c.label}</span>
                      {isActive && <Check className="h-4 w-4 text-primary ml-auto" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Operation */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl p-5 card-elevated mb-5">
        <SectionTitle icon={Calendar} title="Operação" />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Dias de funcionamento/semana" icon={Calendar} value={operatingDays} onChange={setOperatingDays} placeholder="6" type="number" inputMode="numeric" />
          <InputField label="Número de funcionários" icon={Users} value={employeeCount} onChange={setEmployeeCount} placeholder="0" type="number" inputMode="numeric" />
        </div>
      </motion.div>

      {/* Objective */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-5 card-elevated mb-5">
        <SectionTitle icon={Crosshair} title="Objetivo principal" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {objectives.map(obj => {
            const isActive = objective === obj.value;
            return (
              <button
                key={obj.value}
                onClick={() => setObjective(obj.value)}
                className={`flex items-center gap-2.5 p-3.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-secondary/30 border border-transparent hover:border-border hover:bg-secondary/60'
                }`}
              >
                <obj.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>{obj.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Save profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-5">
        <button
          onClick={handleSaveProfile}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            profileSaved
              ? 'bg-primary/10 text-primary'
              : 'gradient-primary text-primary-foreground shadow-md shadow-primary/15 active:scale-[0.97]'
          }`}
        >
          {profileSaved ? <><Check className="h-4 w-4" /> Perfil salvo!</> : <><Save className="h-4 w-4" /> Salvar perfil</>}
        </button>
      </motion.div>

      {/* Goals */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl p-5 card-elevated mb-5">
        <SectionTitle icon={Target} title="Metas mensais" />
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <TrendingUp className="h-3 w-3" />
              Meta de lucro mensal (R$)
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border focus-within:border-primary/30 transition-colors">
              <span className="text-sm font-bold text-muted-foreground">R$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Ex: 5000"
                value={profitGoal}
                onChange={(e) => setProfitGoal(e.target.value)}
                className="flex-1 text-sm font-medium bg-transparent outline-none text-foreground placeholder:text-muted"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Percent className="h-3 w-3" />
              Meta de margem (%)
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border focus-within:border-primary/30 transition-colors">
              <input
                type="number"
                inputMode="decimal"
                placeholder="Ex: 25"
                value={marginGoal}
                onChange={(e) => setMarginGoal(e.target.value)}
                className="flex-1 text-sm font-medium bg-transparent outline-none text-foreground placeholder:text-muted"
              />
              <span className="text-sm font-bold text-muted-foreground">%</span>
            </div>
          </div>

          <button
            onClick={handleSaveGoals}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              goalsSaved
                ? 'bg-primary/10 text-primary'
                : 'gradient-primary text-primary-foreground shadow-md shadow-primary/15 active:scale-[0.97]'
            }`}
          >
            {goalsSaved ? <><Check className="h-4 w-4" /> Metas salvas!</> : 'Salvar metas'}
          </button>
        </div>
      </motion.div>

      {/* Categories */}
      {state.businessType && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5 card-elevated mb-5">
          <SectionTitle icon={Crosshair} title="Categorias do negócio" />
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Custos de produto
            </p>
            <div className="flex flex-wrap gap-1.5">
              {businessConfigs[state.businessType].costCategories.product.map((cat) => (
                <span key={cat} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">{cat}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Custos do negócio
            </p>
            <div className="flex flex-wrap gap-1.5">
              {businessConfigs[state.businessType].costCategories.business.map((cat) => (
                <span key={cat} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">{cat}</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl p-5 border border-destructive/20 bg-destructive/5">
        <p className="text-xs uppercase tracking-wider text-destructive font-medium mb-3">Zona de perigo</p>
        <button
          onClick={handleReset}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            confirmReset
              ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trash2 className="h-4 w-4" />
          {confirmReset ? 'Toque para confirmar: apagar tudo' : 'Limpar todos os dados'}
        </button>
      </motion.div>
    </div>
  );
}
