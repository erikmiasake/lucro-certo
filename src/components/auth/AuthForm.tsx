import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';

interface AuthFormProps {
  onSuccess: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error('Erro ao conectar com Google', {
        description: err.message
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });
        if (error) throw error;
        // Assume success leads to intermediate screen
        onSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('Invalid login credentials')) {
        setErrorMsg('E-mail ou senha incorretos.');
      } else if (err.message.includes('User already registered')) {
        setErrorMsg('Este e-mail já está cadastrado.');
      } else {
        setErrorMsg(err.message || 'Ocorreu um erro ao processar sua solicitação.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  return (
    <div className="w-full max-w-lg mx-auto p-10 md:p-14 rounded-[40px] bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-foreground tracking-tight">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
            {mode === 'login'
              ? 'Seu negócio organizado desde o primeiro acesso'
              : 'Comece em menos de 1 minuto. Sem complicação.'}
          </p>
        </div>

        {/* Social Auth */}
        <div className="mb-8 w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground transition-all duration-300 shadow-sm text-base font-semibold"
            onClick={handleGoogleLogin}
          >
            <GoogleIcon />
            {mode === 'login' ? 'Entrar com Google' : 'Cadastrar com Google'}
          </Button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm uppercase tracking-widest font-medium">
            <span className="bg-[#121214] px-4 text-muted-foreground/60">ou continue com e-mail</span>
          </div>
        </div>

        {!showEmailForm && (
          <Button
            type="button"
            variant="ghost"
            className="w-full h-14 mb-6 rounded-2xl border border-white/10 bg-black/20 text-foreground hover:bg-black/40 transition-all font-semibold text-base"
            onClick={() => setShowEmailForm(true)}
          >
            Continuar com e-mail
          </Button>
        )}

        {/* Standard Auth Form */}
        <AnimatePresence>
          {showEmailForm && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 w-full"
              onSubmit={handleSubmit}
            >
              {errorMsg && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <AnimatePresence mode="popLayout" initial={false}>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="space-y-2.5"
                  >
                    <Label htmlFor="name" className="text-sm font-medium text-muted-foreground ml-1">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="João Silva"
                        required={mode === 'register'}
                        className="h-14 w-full pl-12 rounded-2xl bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all text-base"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground ml-1">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="h-14 w-full pl-12 rounded-2xl bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all text-base"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-muted-foreground ml-1">Senha</Label>
                  {mode === 'login' && (
                    <button type="button" className="text-xs text-primary/80 hover:text-primary transition-colors">
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-14 w-full pl-12 rounded-2xl bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all text-base"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 mt-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(20,184,105,0.4)] transition-all duration-300 font-bold text-base group"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                    Autenticando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3 w-full">
                    {mode === 'login' ? 'Entrar na plataforma' : 'Criar minha conta'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </span>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-base text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            {mode === 'login' ? (
              <>Não possui conta? <span className="text-primary font-medium">Cadastre-se para começar</span></>
            ) : (
              <>Já possui uma conta? <span className="text-primary font-medium">Faça login</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
