import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resending, setResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [manualEmail, setManualEmail] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    // Try to get the email from the current session or recent signup
    if (!email) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user?.email) {
          setEmail(data.session.user.email);
        }
      });
    }

    // Listen for auth changes - if user verifies, redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/welcome');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, email]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    const targetEmail = email || manualEmail;
    if (!targetEmail) {
      setShowManualInput(true);
      return;
    }

    if (cooldown > 0) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
      });
      if (error) throw error;
      
      setResendCount((prev) => prev + 1);
      // Increase cooldown with each resend to prevent abuse
      const newCooldown = Math.min(30 + resendCount * 15, 120);
      setCooldown(newCooldown);
      
      toast.success('E-mail de verificação reenviado!', {
        description: `Verifique sua caixa de entrada em ${targetEmail}`,
      });
    } catch (err: any) {
      if (err.message?.includes('rate') || err.status === 429) {
        toast.error('Muitas tentativas', {
          description: 'Aguarde alguns minutos antes de tentar novamente.',
        });
        setCooldown(60);
      } else {
        toast.error('Erro ao reenviar e-mail', {
          description: 'Estamos com instabilidade no envio. Tente novamente em alguns minutos.',
        });
      }
    } finally {
      setResending(false);
    }
  };

  const displayEmail = email || manualEmail;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8"
        >
          <Mail className="w-10 h-10 text-primary" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Verifique seu e-mail
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg mb-2">
          Enviamos um link de verificação para
        </p>
        {displayEmail ? (
          <p className="text-foreground font-semibold text-lg mb-6">
            {displayEmail}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm mb-6">
            (e-mail não identificado)
          </p>
        )}
        <p className="text-muted-foreground mb-8">
          Clique no link enviado ao seu e-mail para ativar sua conta e começar a usar o Lucro Real.
        </p>

        {/* Resend count feedback */}
        {resendCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 justify-center mb-4 text-sm text-primary"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>E-mail reenviado {resendCount}x — verifique spam/lixeira</span>
          </motion.div>
        )}

        {/* Warning after multiple resends */}
        {resendCount >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 text-left"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-foreground font-medium mb-1">Ainda não recebeu?</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Verifique a pasta de <strong className="text-foreground">spam</strong> ou <strong className="text-foreground">lixo eletrônico</strong></li>
                  <li>• Verifique se o e-mail está correto</li>
                  <li>• Aguarde até 5 minutos para o e-mail chegar</li>
                  <li>• Tente um endereço de e-mail diferente (Gmail costuma funcionar melhor)</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Manual email input when email not detected */}
        {showManualInput && !email && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <Input
              type="email"
              placeholder="Digite seu e-mail cadastrado"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="h-12 rounded-2xl bg-card/50 border-border/50"
            />
          </motion.div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            variant="outline"
            className="w-full h-12 rounded-2xl border-border/50 bg-card/50 hover:bg-card text-foreground"
          >
            {resending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {cooldown > 0
              ? `Reenviar em ${cooldown}s`
              : 'Reenviar e-mail de verificação'}
          </Button>

          <Button
            onClick={() => navigate('/login')}
            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Já validei meu e-mail
          </Button>
        </div>

        {/* Help text */}
        <p className="text-sm text-muted-foreground mt-8">
          Não encontrou o e-mail? Verifique a pasta de spam ou lixo eletrônico.
        </p>
        
        {/* Back to register with different email */}
        <button
          onClick={() => navigate('/register')}
          className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
        >
          Tentar com outro e-mail
        </button>
      </motion.div>
    </div>
  );
}
