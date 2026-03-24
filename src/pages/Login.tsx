import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthFormSplitScreen, FormValues } from '@/components/ui/login';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async (data: FormValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (err: any) {
      toast.error('Erro ao entrar', {
        description: err.message
      });
    }
  };

  return (
    <AuthFormSplitScreen
      logo={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Lucro Real</span>
        </div>
      }
      title="Bem-vindo de volta"
      description="Acesse sua conta para gerenciar seu lucro real"
      imageSrc="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200"
      imageAlt="Escritório moderno com dashboard financeiro"
      onSubmit={handleLogin}
      forgotPasswordHref="#"
      createAccountHref="/auth?mode=register"
    />
  );
}
