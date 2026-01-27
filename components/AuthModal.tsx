import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthForm } from './AuthForm';
import { UserProfile } from '../types';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md z-10"
          >
            <button 
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <AuthForm 
              onLoginSuccess={(user) => {
                onLoginSuccess(user);
                onClose();
              }} 
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};