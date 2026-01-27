import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-[100] pointer-events-none px-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium"
          >
            {message}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};