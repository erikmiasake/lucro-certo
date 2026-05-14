import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthFormSplitScreen, FormValues } from '@/components/ui/login';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';
import { getState, hydrateFromDB, clearLocalState, disableDBSync, enableDBSync } from '@/lib/store';
import { loadProfileFromDB } from '@/lib/profile-sync';
import { loadEntriesFromDB, loadCostsFromDB } from '@/lib/financial-sync';
import { safeRemoveItem, safeSetItem } from '@/lib/safe-storage';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  // Redirect authenticated users to dashboard
  if (isAuthenticated === true) {
    return <Navigate to="/dashboard" replace />;
  }

  // Determine mode from path or query param
  const isRegisterPath = location.pathname === '/register';
  const mode = isRegisterPath ? 'register' : (searchParams.get('mode') as 'login' | 'register') || 'login';

  const handleAuth = async (data: FormValues) => {
    try {
      if (mode === 'register') {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/welcome`,
            data: {
              full_name: data.name,
            },
          },
        });
        if (error) throw error;
        
        // Detect existing account (Supabase returns empty identities)
        if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
          toast.info('Esta conta já existe!', {
            description: 'Faça login para acessar sua conta.',
            duration: 5000,
          });
          navigate('/login');
          return;
        }
        
        toast.success('Conta criada! Verifique seu e-mail para ativar.');
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        // If "remember me" is unchecked, use a shorter session approach
        if (!data.rememberMe) {
          safeSetItem('lucro-real-session-only', 'true');
          safeSetItem('lucro-real-session-only', 'true', 'sessionStorage');
        } else {
          safeRemoveItem('lucro-real-session-only');
          safeRemoveItem('lucro-real-session-only', 'sessionStorage');
        }

        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;

        // Block access if email is not yet verified
        if (signInData.user && !signInData.user.email_confirmed_at) {
          await supabase.auth.signOut();
          toast.warning('Verifique seu e-mail antes de entrar', {
            description: 'Enviamos um link de confirmação para sua caixa de entrada.',
          });
          navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
          return;
        }

        toast.success('Login realizado com sucesso!');

        // Wipe any cached state from a previous user/session, then load this
        // user's authoritative data from the backend before re-enabling sync.
        clearLocalState();
        disableDBSync();
        try {
          const [dbProfile, dbEntries, dbCosts] = await Promise.all([
            loadProfileFromDB(),
            loadEntriesFromDB(),
            loadCostsFromDB(),
          ]);
          const merge: any = { entries: dbEntries, costs: dbCosts };
          if (dbProfile) Object.assign(merge, dbProfile);
          hydrateFromDB(merge);
        } finally {
          enableDBSync();
        }

        const appState = getState();
        if (appState.onboardingComplete) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/welcome', { replace: true });
        }
      }
    } catch (err: any) {
      toast.error('Erro na autenticação', {
        description: err.message
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error('Erro ao entrar com Google', {
          description: (result.error as Error).message,
        });
        return;
      }
      // If redirected, browser navigates away. Otherwise session was set.
    } catch (err: any) {
      toast.error('Erro ao entrar com Google', { description: err.message });
    }
  };

  const isRegister = mode === 'register';
  const pageTitle = isRegister ? 'Criar conta — LucroReal' : 'Entrar — LucroReal';
  const pageDesc = isRegister
    ? 'Crie sua conta no LucroReal e comece a organizar receitas, custos e lucro real do seu negócio em minutos.'
    : 'Acesse sua conta LucroReal para acompanhar lucro real, custos e insights de IA do seu negócio.';
  const canonical = `https://lucroreal.live${isRegister ? '/register' : '/login'}`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <AuthFormSplitScreen
        mode={mode}
        logo={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Lucro Real</span>
          </div>
        }
        title={mode === 'login' ? "Bem-vindo de volta" : "Crie sua conta"}
        description={mode === 'login' ? "Acesse sua conta para gerenciar seu lucro real" : "Comece a organizar seu negócio em segundos"}
        imageSrc="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200"
        imageAlt="Escritório moderno com dashboard financeiro"
        onSubmit={handleAuth}
        onGoogleSignIn={handleGoogleSignIn}
        forgotPasswordHref="/forgot-password"
        createAccountHref="/register"
        toggleModeHref={mode === 'login' ? "/register" : "/login"}
      />
    </>
  );
}
