import { useStore } from '@/hooks/use-store';
import { BusinessType, businessConfigs } from '@/lib/business-config';
import { setBusinessType, resetAll, setGoals, setBusinessProfile } from '@/lib/store';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check, Trash2, Target, TrendingUp, Percent, Building2,
  MapPin, Calendar, Users, Crosshair, ChevronDown, Save,
  User, Mail, Camera, KeyRound, LogOut, ShieldAlert
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { safeRemoveItem } from '@/lib/safe-storage';

const types: BusinessType[] = ['restaurante', 'salao', 'petshop', 'loja', 'academia', 'outro'];

const objectives = [
  { value: 'increase_profit', label: 'Aumentar lucro', icon: TrendingUp },
  { value: 'reduce_costs', label: 'Reduzir custos', icon: Percent },
  { value: 'organize', label: 'Organizar financeiro', icon: Calendar },
] as const;

export default function Configuracoes() {
  const state = useStore();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [profitGoal, setProfitGoal] = useState(state.goals?.monthlyProfit?.toString() || '');
  const [marginGoal, setMarginGoal] = useState(state.goals?.monthlyMargin?.toString() || '');
  const [goalsSaved, setGoalsSaved] = useState(false);

  const [businessName, setBusinessName] = useState(state.businessProfile?.name || '');
  const [city, setCity] = useState(state.businessProfile?.city || '');
  const [operatingDays, setOperatingDays] = useState(state.businessProfile?.operatingDays?.toString() || '6');
  const [operatingWeekdays, setOperatingWeekdays] = useState<number[]>(state.businessProfile?.operatingWeekdays || [1, 2, 3, 4, 5, 6]);
  const [employeeCount, setEmployeeCount] = useState(state.businessProfile?.employeeCount?.toString() || '0');
  const [objective, setObjective] = useState(state.businessProfile?.objective || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const [showType, setShowType] = useState(false);

  // User Profile State
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userName, setUserName] = useState('');
  const [userSaved, setUserSaved] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setUserName(user?.user_metadata?.full_name || '');
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  const handleUpdateUser = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: userName }
      });
      if (error) throw error;
      setUserSaved(true);
      setTimeout(() => setUserSaved(false), 2000);
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil', { description: error.message });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    safeRemoveItem('lucro-real-data');
    navigate('/');
    window.location.reload();
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('E-mail enviado!', { description: 'Verifique sua caixa de entrada para redefinir a senha.' });
    } catch (error: any) {
      toast.error('Erro', { description: error.message });
    }
  };

  const handleReset = async () => {
    if (confirmReset) {
      try {
        // 1. Delete all user data from database
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          // Delete entries and costs from DB
          await supabase.from('entries').delete().eq('user_id', currentUser.id);
          await supabase.from('costs').delete().eq('user_id', currentUser.id);
          // Reset profile to blank state
          await supabase.from('profiles').update({
            business_type: null,
            business_name: '',
            city: '',
            onboarding_complete: false,
            operating_days: 6,
            operating_weekdays: [1, 2, 3, 4, 5, 6],
            employee_count: 0,
            objective: '',
            goals: { monthlyProfit: null, monthlyMargin: null },
            cost_map: [],
            main_costs: [],
            average_sales: null,
          }).eq('user_id', currentUser.id);
        }

        // 2. Clear all local state
        resetAll();
        safeRemoveItem('lucro-real-data');

        // 3. Redirect to onboarding (keep user logged in)
        toast.success('Dados limpos!', { description: 'Configure seu novo negócio.' });
        navigate('/onboarding');
        window.location.reload();
      } catch (err) {
        console.error('Reset error:', err);
        toast.error('Erro ao limpar dados. Tente novamente.');
      }
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const syncToDB = async () => {
    const { saveProfileToDB } = await import('@/lib/profile-sync');
    const { getState: gs } = await import('@/lib/store');
    await saveProfileToDB(gs());
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
    syncToDB();
  };

  const handleSaveProfile = () => {
    setBusinessProfile({
      name: businessName,
      city,
      operatingDays: operatingWeekdays.length,
      employeeCount: parseInt(employeeCount) || 0,
      objective: objective as any,
      operatingWeekdays,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
    syncToDB();
  };

  const toggleWeekday = (day: number) => {
    setOperatingWeekdays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const config = state.businessType ? businessConfigs[state.businessType] : null;

  const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
    </div>
  );

  const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = 'text', inputMode, disabled = false }: any) => (
    <div>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      <div className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${disabled ? 'bg-secondary/20 border-border/50 opacity-70' : 'bg-secondary/50 border-border focus-within:border-primary/30'}`}>
        <input
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 text-sm font-medium bg-transparent outline-none text-foreground placeholder:text-muted disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );

  const isGoogleProvider = user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google');

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto safe-bottom">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie seu perfil e seu negócio.</p>
      </div>

      {loadingUser ? (
        <div className="rounded-2xl p-8 card-elevated mb-5 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : user ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 card-elevated mb-5 border border-primary/10">
          <SectionTitle icon={User} title="Minha Conta" />
          
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-secondary/30 border border-white/5">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold relative group">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                userName ? userName.charAt(0).toUpperCase() : <User className="w-8 h-8" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground truncate">{userName || 'Usuário'}</h3>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="mt-1 flex gap-2 items-center">
                <span className="text-[10px] uppercase font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                  {isGoogleProvider ? 'Google Auth' : 'E-mail'}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  Criada em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <InputField label="Nome completo" icon={User} value={userName} onChange={setUserName} placeholder="Seu nome" />
            <InputField label="E-mail (não editável)" icon={Mail} value={user.email} onChange={() => {}} disabled={true} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpdateUser}
              className={`flex-1 py-3 mt-2 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                userSaved ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {userSaved ? <><Check className="h-4 w-4" /> Atualizado!</> : <><Save className="h-4 w-4" /> Salvar alterações</>}
            </button>
            
            {!isGoogleProvider && (
              <button
                onClick={handlePasswordReset}
                className="flex-1 py-3 mt-2 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 bg-secondary/50 text-foreground hover:bg-secondary/80 border border-border"
              >
                <KeyRound className="h-4 w-4" /> Redefinir Senha
              </button>
            )}
          </div>
          
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 card-elevated mb-5 border border-dashed border-border flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-bold text-foreground">Você não está conectado</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Crie uma conta ou faça login para proteger seus dados e sincronizá-los em todos os seus dispositivos.
          </p>
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Fazer login ou Cadastro
          </button>
        </motion.div>
      )}

      {/* Business Profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 card-elevated mb-5">
        <SectionTitle icon={Building2} title="Perfil" />
        <div className="space-y-4">
          <InputField label="Nome do negócio" icon={Building2} value={businessName} onChange={setBusinessName} placeholder="Ex: Restaurante do João" />

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
                      onClick={() => { setBusinessType(type); setShowType(false); syncToDB(); }}
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
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              Dias de funcionamento
            </label>
            <div className="flex gap-1.5">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleWeekday(idx)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    operatingWeekdays.includes(idx)
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-secondary/30 text-muted-foreground border border-transparent hover:border-border'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">{operatingWeekdays.length} dias por semana</p>
          </div>
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
