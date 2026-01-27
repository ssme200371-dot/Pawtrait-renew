
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added missing Loader2 import
import { Check, X, Loader2 } from 'lucide-react';
import { BANK_INFO } from '../constants';
import { supabase } from '../supabaseClient';
import { Button } from './Button';

interface PaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  credits: number;
  onComplete: () => void;
  userId?: string;
  buyerName?: string;
  buyerNickname?: string;
  userEmail?: string; // Added prop
  buyerTel?: string;
  buyerAddr?: string;
}

export const PaymentSheet: React.FC<PaymentSheetProps> = ({
  isOpen,
  onClose,
  title,
  amount,
  credits,
  onComplete,
  userId,
  buyerName,
  buyerNickname,
  userEmail,
  buyerTel,
  buyerAddr
}) => {
  const [view, setView] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [loading, setLoading] = useState(false);

  const handlePaymentRequest = async () => {


    if (!userId) {
      console.warn("[PaymentDebug] No userId found");
      alert("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        user_nickname: buyerNickname,
        user_name: buyerName,
        user_email: userEmail,
        amount: amount,
        credits: credits,
        package_name: title,
        status: 'PENDING'
      };



      // SQL 스크립트의 컬럼명과 정확히 일치시킴
      const { data, error } = await supabase.from('payment_requests').insert([payload]).select();

      console.log("[PaymentDebug] Response:", { data, error });

      if (error) throw error;
      setView('SUCCESS');
    } catch (err: any) {
      console.error("[PaymentDebug] Request Error:", err);
      alert("요청 중 오류가 발생했습니다: " + err.message);
    } finally {
      setLoading(false);

    }
  };

  const handleClose = () => {
    setView('FORM');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            <button onClick={handleClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>

            {view === 'FORM' ? (
              <>
                <h3 className="text-xl font-bold mb-6 pr-8">입금 안내</h3>
                <div className="bg-slate-50 p-6 rounded-2xl mb-6">
                  <p className="text-xs text-slate-400 mb-1 text-center font-bold">입금하실 금액</p>
                  <p className="text-3xl font-bold text-center text-brand-600">{amount.toLocaleString()}원</p>
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-1">
                    <p className="text-center text-slate-700 font-bold">{BANK_INFO.name} <span className="text-brand-600">{BANK_INFO.accountNumber}</span></p>
                    <p className="text-center text-slate-500 text-sm">예금주: {BANK_INFO.holder}</p>
                  </div>
                </div>
                <div className="mb-8 p-4 bg-brand-50 rounded-xl space-y-2">
                  <p className="text-sm font-bold text-slate-700">입금자명: <span className="text-brand-600 underline decoration-2 underline-offset-4">{buyerName || '본인 성함'}</span></p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">* 입금자명이 다를 경우 확인이 늦어질 수 있습니다.</p>
                </div>
                <Button fullWidth onClick={handlePaymentRequest} disabled={loading} className="py-4">
                  {/* Fixed the missing Loader2 component */}
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "입금 확인 요청하기"}
                </Button>
              </>
            ) : (
              <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900">요청 완료!</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  관리자가 입금 내역을 확인하고 있습니다.<br />
                  승인이 완료되면 크레딧이 즉시 지급됩니다.
                </p>
                <Button fullWidth onClick={() => { onComplete(); handleClose(); }} className="py-4">확인</Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
