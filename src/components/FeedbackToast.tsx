import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackToastProps {
  message: string | null;
}

export default function FeedbackToast({ message }: FeedbackToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-foreground text-background font-semibold text-sm shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
