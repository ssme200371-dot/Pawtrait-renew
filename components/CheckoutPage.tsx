import React, { useState } from 'react';
import { ChevronLeft, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { ProductType } from '../types';

interface CheckoutPageProps {
  productType: ProductType;
  selectedImageUrl: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ productType, selectedImageUrl, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  const price = productType === 'CANVAS' ? 24900 : 1500;
  const shipping = productType === 'CANVAS' ? 3000 : 0;
  const total = price + shipping;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-serif-heading font-bold text-xl text-slate-900 ml-2">주문 결제</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-8">
        
        {/* Order Summary */}
        <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-5 items-center">
          <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-inner border border-slate-100">
            <img src={selectedImageUrl} alt="Item" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <span className="inline-block px-2 py-0.5 rounded bg-brand-50 text-brand-600 text-[10px] font-bold w-fit">
              {productType === 'CANVAS' ? '실물 배송' : '즉시 다운로드'}
            </span>
            <h3 className="font-serif-heading font-bold text-slate-900 text-lg leading-tight">
              {productType === 'CANVAS' ? '최고급 캔버스 액자 (20x20)' : '고해상도 디지털 원본'}
            </h3>
            <p className="text-sm text-slate-500 font-medium">PawTrait Art Studio</p>
            <p className="font-bold text-brand-600 text-lg mt-1">{price.toLocaleString()}원</p>
          </div>
        </section>

        {/* Shipping Form (Only for Canvas) */}
        {productType === 'CANVAS' && (
          <section>
            <h3 className="font-serif-heading font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
              <Truck className="w-5 h-5" /> 배송지 정보
            </h3>
            <div className="space-y-3">
              <input type="text" placeholder="받는 분 성함" className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm" required />
              <input type="tel" placeholder="연락처 (010-0000-0000)" className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm" required />
              <div className="relative">
                <input type="text" placeholder="주소 검색" className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm" readOnly value="서울시 강남구 테헤란로 123" />
              </div>
              <input type="text" placeholder="상세 주소 입력" className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm" />
            </div>
          </section>
        )}

        {/* Payment Summary */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
           <div className="flex justify-between text-slate-600">
             <span>상품 금액</span>
             <span>{price.toLocaleString()}원</span>
           </div>
           {productType === 'CANVAS' && (
             <div className="flex justify-between text-slate-600 pb-3 border-b border-slate-100">
               <span>배송비</span>
               <span>{shipping.toLocaleString()}원</span>
             </div>
           )}
           <div className="flex justify-between pt-1 items-end">
             <span className="font-serif-heading font-bold text-lg text-slate-900">총 결제 금액</span>
             <span className="font-bold text-2xl text-brand-600">{total.toLocaleString()}원</span>
           </div>
        </section>

        {/* Payment Method Dummy */}
        <section>
          <h3 className="font-serif-heading font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5" /> 결제 수단
          </h3>
          <div className="grid grid-cols-2 gap-3">
             <button type="button" className="p-4 border-2 border-brand-500 bg-brand-50 text-brand-700 font-bold rounded-xl text-center shadow-sm relative overflow-hidden">
               카카오페이
               <div className="absolute top-0 right-0 p-1">
                 <ShieldCheck className="w-4 h-4 text-brand-500" />
               </div>
             </button>
             <button type="button" className="p-4 border border-slate-200 bg-white text-slate-500 font-medium rounded-xl text-center hover:bg-slate-50 transition-colors">신용카드</button>
          </div>
        </section>
      </div>

       {/* Pay Button */}
       <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto">
          <Button fullWidth onClick={handlePayment} disabled={loading} className="py-4 text-lg shadow-brand-500/30">
            {loading ? '결제 처리 중...' : `${total.toLocaleString()}원 결제하기`}
          </Button>
        </div>
      </div>
    </div>
  );
};