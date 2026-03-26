import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('E-mail enviado!');
    } catch (err: any) {
      toast.error('Erro ao enviar e-mail', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <Send className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Verifique seu e-mail</h1>
          <p className="text-muted-foreground mb-2">
            Enviamos um link de recuperação para
          </p>
          <p className="text-foreground font-semibold mb-6">{email}</p>
          <p className="text-muted-foreground text-sm mb-8">
            Clique no link do e-mail para redefinir sua senha.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full h-12 rounded-xl font-semibold">
            Voltar para o login
          </Button>
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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6"
        >
          <Mail className="w-8 h-8 text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          Esqueceu sua senha?
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">E-mail</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-card/50 border-border"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full h-12 rounded-xl font-semibold text-base"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/login')}
            className="w-full h-10 rounded-xl text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o login
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
