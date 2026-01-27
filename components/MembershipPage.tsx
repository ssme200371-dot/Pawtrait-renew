import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Diamond, ChevronDown, ChevronUp, Shield, Zap } from 'lucide-react';
import { Button } from './Button';
import { CREDIT_PACKAGES } from '../constants';
import { PaymentSheet } from './PaymentSheet';
import { UserProfile } from '../types';
import { AuthForm } from './AuthForm';

interface MembershipPageProps {
  user: UserProfile | null;
  credits: number;
  onLogin: (user: UserProfile) => void;
  onPurchase: (amount: number) => void;
}

export const MembershipPage: React.FC<MembershipPageProps> = ({ user, credits, onLogin, onPurchase }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<{ id: string, name: string, price: number, credits: number } | null>(null);

  const faqs = [
    {
      q: "크레딧은 유효기간이 있나요?",
      a: "아니요, 구매하신 크레딧은 유효기간 없이 영구적으로 소장되며 언제든지 사용하실 수 있습니다."
    },
    {
      q: "생성된 이미지는 상업적으로 이용 가능한가요?",
      a: "본 서비스가 제공하는 이미지는 인공지능(AI)을 통해 생성되었습니다. 회원은 생성된 이미지를 상업적으로 자유롭게 이용할 수 있습니다. 단, AI 생성물의 특성상 저작권법의 보호를 받지 못할 수 있으며, 회사는 이에 대한 독점적 권리를 보장하지 않습니다."
    },
    {
      q: "환불 규정 및 서비스 이용약관은 어떻게 되나요?",
      a: "크레딧은 구매 후 7일 이내 미사용 시 전액 환불이 가능합니다. 단, 이미 크레딧을 사용하여 이미지를 생성했거나 주문 제작 상품(액자)의 제작이 시작된 경우, 전자상거래법에 의거하여 단순 변심에 의한 청약 철회 및 환불이 불가능합니다."
    },
    {
      q: "액자 주문 시 배송기간은 얼마나 걸리나요?",
      a: "주문 제작 상품(Canvas)은 영업일 기준 평균 2~3일이 소요됩니다. 꼼꼼하게 포장하여 안전하게 배송해 드립니다."
    }
  ];

  const handlePkgClick = (pkg: { id: string, name: string, price: number, credits: number }) => {
    setSelectedPkg(pkg);
  };

  const handlePaymentComplete = () => {
    // NOTE: Do not add credits immediately. 
    // Credits will be added only after Admin approval via the Admin Panel.
    if (selectedPkg) {
      setSelectedPkg(null);
    }
  };

  // --- View 1: Login / Signup (If not logged in) ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <AuthForm onLoginSuccess={onLogin} />
        </motion.div>
      </div>
    );
  }

  // --- View 2: Credit Shop (Logged In) ---
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">

      {/* Welcome Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <p className="text-sm font-medium text-slate-600">
            안녕하세요, <span className="text-brand-600 font-bold">{user.nickname}</span>님!
            {user.isAdmin && <span className="ml-2 px-2 py-0.5 bg-secondary-900 text-white text-[10px] rounded font-bold uppercase">Admin</span>}
          </p>
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Diamond className="w-4 h-4 text-amber-600 fill-amber-200" />
              <span className="font-bold text-amber-800 text-sm">{credits} Credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-brand-600 font-bold tracking-wider text-xs sm:text-sm uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">Credit Shop</span>
          <h1 className="font-serif-heading text-2xl sm:text-4xl font-bold text-secondary-900 mt-4 mb-4 break-keep">합리적인 가격으로 만나는 명작</h1>
          <p className="text-slate-500 text-base sm:text-lg break-keep">필요한 만큼만 충전하고 평생 소장하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {CREDIT_PACKAGES.map((pkg, idx) => {
            const isBest = pkg.tag === 'Best';
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col ${isBest ? 'bg-white border-2 border-brand-500 shadow-2xl scale-100 sm:scale-105 z-10' : 'bg-white border border-slate-200 shadow-sm hover:shadow-lg'}`}
              >
                {pkg.tag && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-sm ${isBest ? 'bg-brand-500' : 'bg-secondary-900'}`}>
                    {pkg.tag}
                  </div>
                )}

                <div className="mb-6 text-center">
                  <h3 className="font-bold text-slate-500 uppercase tracking-wide text-sm mb-2">{pkg.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Diamond className={`w-6 h-6 sm:w-8 sm:h-8 ${isBest ? 'text-brand-500 fill-brand-100' : 'text-slate-400'}`} />
                    <span className="text-3xl sm:text-4xl font-bold text-slate-900">{pkg.credits}</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {pkg.price.toLocaleString()}<span className="text-lg font-normal text-slate-500">원</span>
                  </p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="break-keep">모든 화풍 자유롭게 이용</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="break-keep">고해상도 원본 다운로드</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="break-keep">영구 소장 및 상업적 이용</span>
                  </li>
                  {isBest && (
                    <li className="flex items-start gap-3 text-sm text-brand-700 font-bold bg-brand-50 p-2 rounded-lg">
                      <Zap className="w-5 h-5 fill-current shrink-0" />
                      <span className="break-keep">우선 처리 (Fast-Track)</span>
                    </li>
                  )}
                </ul>

                <Button
                  onClick={() => handlePkgClick(pkg)}
                  variant={isBest ? 'primary' : 'outline'}
                  fullWidth
                  className={!isBest ? "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300" : ""}
                >
                  충전하기
                </Button>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-secondary-900">자주 묻는 질문</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base break-keep pr-4">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 sm:p-5 bg-white text-slate-600 leading-relaxed text-sm break-keep border-t border-slate-50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <div className="bg-slate-50 py-8 text-center text-slate-400 text-xs sm:text-sm flex items-center justify-center gap-2">
        <Shield className="w-4 h-4" /> 안전한 결제 시스템을 사용하고 있습니다.
      </div>

      <PaymentSheet
        isOpen={!!selectedPkg}
        onClose={() => setSelectedPkg(null)}
        title={selectedPkg ? `크레딧 충전 (${selectedPkg.name})` : "크레딧 충전"}
        amount={selectedPkg?.price || 0}
        credits={selectedPkg?.credits || 0}
        onComplete={handlePaymentComplete}
        userId={user.id}
        buyerName={user.name}
        buyerNickname={user.nickname}
        userEmail={user.email} // Pass email for admin usage
      />
    </div>
  );
};