import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, CreditCard, Truck, ShieldCheck, Diamond } from 'lucide-react';
import { Button } from './Button';
import { ProductType } from '../types';



interface CheckoutPageProps {
  productType: ProductType;
  selectedImageUrl?: string;
  productName?: string;
  amount?: number;
  credits?: number; // For credit packages
  onBack: () => void;
  onSuccess: () => void;
}

// 랜덤 주문 ID 생성
function generateRandomString() {
  return new Date().getTime().toString();
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  productType,
  selectedImageUrl,
  productName,
  amount,
  credits,
  onBack,
  onSuccess,
  showToast
}) => {
  const [loading, setLoading] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  // Price Calculation Logic (Fallback if amount not provided)
  let calculatedPrice = 0;
  let shippingCost = 0;

  if (amount) {
    calculatedPrice = amount;
  } else {
    // Legacy fallback for ResultPage flow
    const basePrice = productType === 'CANVAS' ? 24900 : 1500;
    shippingCost = productType === 'CANVAS' ? 3000 : 0;
    calculatedPrice = basePrice;
  }

  const total = calculatedPrice + shippingCost;
  const displayProductName = productName || (productType === 'CANVAS' ? '최고급 캔버스 액자 (20x20)' : '고해상도 디지털 원본');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerEmail) {
      alert('고객 정보를 입력해주세요.');
      return;
    }

    if (!agreementChecked) {
      alert('약관에 동의해주세요.');
      return;
    }

    setLoading(true);

    // Simulate API call for Manual Transfer Order
    setTimeout(() => {
      setLoading(false);
      // In a real app, you would send this order to your backend here
      onSuccess();
    }, 1500);
  };

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
          <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-inner border border-slate-100 flex items-center justify-center">
            {productType === 'CREDIT' ? (
              <div className="flex flex-col items-center justify-center text-amber-500">
                <Diamond className="w-10 h-10 fill-amber-200" />
                <span className="text-xs font-bold mt-1 text-amber-700">{credits} Credits</span>
              </div>
            ) : (
              selectedImageUrl && <img src={selectedImageUrl} alt="Item" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex flex-col justify-center gap-1">
            <span className="inline-block px-2 py-0.5 rounded bg-brand-50 text-brand-600 text-[10px] font-bold w-fit">
              {productType === 'CANVAS' ? '실물 배송' : productType === 'CREDIT' ? '즉시 충전' : '즉시 다운로드'}
            </span>
            <h3 className="font-serif-heading font-bold text-slate-900 text-lg leading-tight">
              {displayProductName}
            </h3>
            <p className="text-sm text-slate-500 font-medium">PawTrait Art Studio</p>
            <p className="font-bold text-brand-600 text-lg mt-1">{total.toLocaleString()}원</p>
          </div>
        </section>

        {/* Customer Information */}
        <section>
          <h3 className="font-serif-heading font-bold text-slate-900 mb-4 text-lg">주문자 정보</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="주문자 이름"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
              required
            />
            <input
              type="email"
              placeholder="이메일 주소"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
              required
            />
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
            <span>{calculatedPrice.toLocaleString()}원</span>
          </div>
          {shippingCost > 0 && (
            <div className="flex justify-between text-slate-600 pb-3 border-b border-slate-100">
              <span>배송비</span>
              <span>{shippingCost.toLocaleString()}원</span>
            </div>
          )}
          <div className="flex justify-between pt-1 items-end">
            <span className="font-serif-heading font-bold text-lg text-slate-900">총 결제 금액</span>
            <span className="font-bold text-2xl text-brand-600">{total.toLocaleString()}원</span>
          </div>
        </section>

        {/* Payment Method Info */}
        <section>
          <h3 className="font-serif-heading font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5" /> 결제 방법
          </h3>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="font-bold text-slate-800 mb-2">무통장 입금</p>
            <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-1 text-slate-600">
              <div className="flex items-center gap-2">
                <p>신한은행 <span className="font-bold text-brand-600">110-123-456789</span></p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("110-123-456789");
                    showToast("계좌번호가 복사되었습니다.");
                  }}
                  className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors flex items-center gap-1 leading-none"
                >
                  <Copy className="w-3 h-3" /> 복사
                </button>
              </div>
              <p>예금주: 주식회사 포트레이트</p>
            </div>
            <p className="text-xs text-slate-400 mt-2">* 주문 완료 후 입금해주시면 확인 후 배송이 시작됩니다.</p>
          </div>
        </section>

        {/* Agreement */}
        <section>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
              className="w-5 h-5 accent-brand-600"
            />
            <label htmlFor="terms" className="text-sm text-slate-600 font-medium cursor-pointer select-none">
              구매 조건 및 결제 진행에 동의합니다.
            </label>
          </div>
        </section>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            onClick={handlePayment}
            disabled={loading || !agreementChecked}
            className="py-4 text-lg shadow-brand-500/30"
          >
            {loading ? '결제 처리 중...' : `${total.toLocaleString()}원 결제하기`}
          </Button>
        </div>
      </div>
    </div>
  );
};