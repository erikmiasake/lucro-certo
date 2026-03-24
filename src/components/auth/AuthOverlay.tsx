import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import AuthForm from './AuthForm';

interface AuthOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthOverlay({ isOpen, onClose, onSuccess }: AuthOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
          {/* Backdrop Blur Layer */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-background/80"
            onClick={onClose}
          />

          {/* Main Auth Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-6xl h-full md:h-[85vh] md:max-h-[800px] bg-[#0A0A0B] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/5"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Emotional & Visual */}
            <div className="relative hidden md:flex w-1/2 h-full flex-col justify-between p-12 overflow-hidden bg-black/40">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent" />
                {/* A subtle grid or premium dark background aesthetic */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `radial-gradient(circle at center, white 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                  }}
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-16">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white">Lucro Real</span>
                </div>

                <div className="max-w-md">
                  <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-8">
                    Descubra quanto <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
                      realmente sobra
                    </span>{' '}
                    no seu bolso.
                  </h1>
                  <p className="text-xl text-zinc-400 leading-relaxed max-w-sm">
                    Nossa IA analisa seu negócio e mostra exatamente onde você ganha e perde dinheiro. Em segundos.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Side: Functional Form */}
            <div className="relative w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
              <AuthForm onSuccess={onSuccess} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
