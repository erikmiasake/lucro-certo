import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    // New flow: token_hash in query string -> verify on the client
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const type = params.get('type');
    if (tokenHash && type) {
      setVerifying(true);
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any })
        .then(({ error }) => {
          if (error) {
            setVerifyError(error.message);
            toast.error('Link inválido ou expirado', { description: 'Solicite um novo link de redefinição.' });
          } else {
            setIsRecovery(true);
            // clean URL
            window.history.replaceState({}, '', '/reset-password');
          }
        })
        .finally(() => setVerifying(false));
    } else {
      // Legacy implicit flow: hash contains type=recovery
      const hash = window.location.hash;
      if (hash.includes('type=recovery')) {
        setIsRecovery(true);
      }
    }

    return () => subscription.unsubscribe();
  }, []);


  const handleReset = async () => {
    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      toast.error('Erro ao redefinir senha', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Senha redefinida!</h1>
          <p className="text-muted-foreground">Redirecionando para o login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6"
        >
          <Lock className="w-8 h-8 text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          Redefinir senha
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Digite sua nova senha abaixo.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nova senha</label>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-card/50 border-border"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Confirmar nova senha</label>
            <Input
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 rounded-xl bg-card/50 border-border"
            />
          </div>

          <Button
            onClick={handleReset}
            disabled={loading || !password || !confirmPassword}
            className="w-full h-12 rounded-xl font-semibold text-base mt-2"
          >
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="w-full h-10 rounded-xl text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o login
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
