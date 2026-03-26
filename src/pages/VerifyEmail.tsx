import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Try to get the email from the current session or recent signup
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        setEmail(data.session.user.email);
      }
    });

    // Listen for auth changes - if user verifies, redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/welcome');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Nenhum e-mail encontrado. Tente se cadastrar novamente.');
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      toast.success('E-mail de verificação reenviado!');
    } catch (err: any) {
      toast.error('Erro ao reenviar e-mail', { description: err.message });
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
        {email && (
          <p className="text-foreground font-semibold text-lg mb-6">
            {email}
          </p>
        )}
        <p className="text-muted-foreground mb-8">
          Clique no link enviado ao seu e-mail para ativar sua conta e começar a usar o Lucro Real.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={resending}
            variant="outline"
            className="w-full h-12 rounded-2xl border-border/50 bg-card/50 hover:bg-card text-foreground"
          >
            {resending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Reenviar e-mail de verificação
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
      </motion.div>
    </div>
  );
}
