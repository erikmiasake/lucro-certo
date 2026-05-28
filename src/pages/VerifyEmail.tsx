import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [manualEmail, setManualEmail] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!email) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user?.email) setEmail(data.session.user.email);
      });
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') navigate('/welcome');
    });
    return () => subscription.unsubscribe();
  }, [navigate, email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const targetEmail = email || manualEmail;

  const handleVerify = async (otp: string) => {
    if (!targetEmail) {
      toast.error('E-mail não identificado', { description: 'Informe seu e-mail para confirmar.' });
      setShowManualInput(true);
      return;
    }
    if (otp.length !== 6) return;

    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: otp,
        type: 'signup',
      });
      if (error) throw error;
      toast.success('E-mail confirmado!');
      navigate('/welcome');
    } catch (err: any) {
      toast.error('Código inválido', {
        description: err.message?.includes('expired')
          ? 'Este código expirou. Solicite um novo.'
          : 'Verifique o código e tente novamente.',
      });
      setCode('');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!targetEmail) {
      setShowManualInput(true);
      return;
    }
    if (cooldown > 0) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: targetEmail });
      if (error) throw error;
      setResendCount((p) => p + 1);
      setCooldown(Math.min(30 + resendCount * 15, 120));
      toast.success('Novo código enviado!', { description: `Verifique sua caixa de entrada em ${targetEmail}` });
    } catch (err: any) {
      if (err.message?.includes('rate') || err.status === 429) {
        toast.error('Muitas tentativas', { description: 'Aguarde alguns minutos.' });
        setCooldown(60);
      } else {
        toast.error('Erro ao reenviar código', { description: 'Tente novamente em alguns minutos.' });
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8"
        >
          <Mail className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="text-3xl font-bold text-foreground mb-3">Confirme seu e-mail</h1>
        <p className="text-muted-foreground mb-2">Enviamos um código de 6 dígitos para</p>
        {targetEmail ? (
          <p className="text-foreground font-semibold text-lg mb-6">{targetEmail}</p>
        ) : (
          <p className="text-muted-foreground text-sm mb-6">(e-mail não identificado)</p>
        )}

        {showManualInput && !email && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
            <Input
              type="email"
              placeholder="Digite seu e-mail cadastrado"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="h-12 rounded-2xl bg-card/50 border-border/50"
            />
          </motion.div>
        )}

        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(v) => {
              setCode(v);
              if (v.length === 6) handleVerify(v);
            }}
            disabled={verifying}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {verifying && (
          <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Verificando...
          </p>
        )}

        {resendCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 justify-center mb-4 text-sm text-primary"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Código reenviado {resendCount}x — verifique spam/lixeira</span>
          </motion.div>
        )}

        {resendCount >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-foreground font-medium mb-1">Ainda não recebeu?</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Verifique a pasta de <strong className="text-foreground">spam</strong></li>
                  <li>• Confira se o e-mail está correto</li>
                  <li>• Aguarde até 2 minutos pela chegada</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            variant="outline"
            className="w-full h-12 rounded-2xl border-border/50 bg-card/50 hover:bg-card text-foreground"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
          </Button>
        </div>

        <button
          onClick={() => navigate('/register')}
          className="mt-6 text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
        >
          Tentar com outro e-mail
        </button>
      </motion.div>
    </div>
  );
}
