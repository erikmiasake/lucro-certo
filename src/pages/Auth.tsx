import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { AuthFormSplitScreen, FormValues } from '@/components/ui/login';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getState } from '@/lib/store';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
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
        navigate('/verify-email');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
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

  return (
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
      forgotPasswordHref="#"
      createAccountHref="/register"
      toggleModeHref={mode === 'login' ? "/register" : "/login"}
    />
  );
}
