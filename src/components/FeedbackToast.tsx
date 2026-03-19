import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface FeedbackToastProps {
  message: string | null;
}

export default function FeedbackToast({ message }: FeedbackToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-card border border-border shadow-2xl shadow-black/30 flex items-center gap-3"
        >
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
