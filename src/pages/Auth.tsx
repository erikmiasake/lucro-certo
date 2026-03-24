import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthFormSplitScreen, FormValues } from '@/components/ui/login';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as 'login' | 'register') || 'login';

  const handleAuth = async (data: FormValues) => {
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.name,
            },
          },
        });
        if (error) throw error;
        toast.success('Conta criada com sucesso! Verifique seu e-mail.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      }
      navigate('/dashboard');
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
      createAccountHref="/auth?mode=register"
      toggleModeHref={mode === 'login' ? "/auth?mode=register" : "/auth?mode=login"}
    />
  );
}
