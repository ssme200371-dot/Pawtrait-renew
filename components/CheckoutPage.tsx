import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, CreditCard, Truck, ShieldCheck, Diamond } from 'lucide-react';
import { Button } from './Button';
import { ProductType } from '../types';

// Toss Payments SDK 선언
declare global {
  interface Window {
    TossPayments: any;
  }
}

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
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const paymentWidgetRef = useRef<any>(null);
  const agreementWidgetRef = useRef<any>(null);

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

  // Toss Payments SDK 초기화
  useEffect(() => {
    // SDK 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v2/TossPayments';
    script.async = true;
    script.onload = initializePaymentWidget;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // 컴포넌트 언마운트 시 결제위젯 정리
      if (paymentWidgetRef.current) {
        paymentWidgetRef.current.destroy().catch(() => { });
      }
      if (agreementWidgetRef.current) {
        agreementWidgetRef.current.destroy().catch(() => { });
      }
    };
  }, []);

  // 결제위젯 초기화
  const initializePaymentWidget = async () => {
    try {
      const { TossPayments } = window;
      if (!TossPayments) return;

      // clientKey 설정
      const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
      if (!clientKey) {
        console.error('Toss Payments Client Key가 설정되지 않았습니다.');
        alert('결제 시스템 설정 오류입니다. 관리자에게 문의해주세요.');
        return;
      }

      const tossPayments = TossPayments(clientKey);

      // 고객 키 생성 (비회원 결제)
      const widgets = tossPayments.widgets({
        customerKey: TossPayments.ANONYMOUS,
      });

      // 금액 설정
      await widgets.setAmount({
        currency: 'KRW',
        value: total,
      });

      // 결제 수단 UI 렌더링
      const paymentMethodWidget = await widgets.renderPaymentMethods(
        '#payment-widget',
        { value: total },
        { variantKey: 'DEFAULT' }
      );

      paymentWidgetRef.current = {
        widgets,
        paymentMethodWidget,
      };

      // 약관 UI 렌더링
      const agreementWidget = await widgets.renderAgreement('#agreement-widget', {
        variantKey: 'DEFAULT',
      });

      agreementWidgetRef.current = agreementWidget;

      // 약관 동의 상태 감시
      agreementWidget.on('agreementStatusChange', (agreementStatus: any) => {
        setAgreementChecked(agreementStatus.agreedRequiredTerms);
      });

      // 결제 수단 선택 이벤트
      paymentMethodWidget.on('paymentMethodSelect', (selectedPaymentMethod: any) => {
        console.log('선택된 결제수단:', selectedPaymentMethod);
      });
    } catch (error) {
      console.error('결제위젯 초기화 실패:', error);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentWidgetRef.current) {
      alert('결제 시스템 초기화 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!customerName || !customerEmail) {
      alert('고객 정보를 입력해주세요.');
      return;
    }

    if (!agreementChecked) {
      alert('약관에 동의해주세요.');
      return;
    }

    setLoading(true);

    try {
      const { widgets } = paymentWidgetRef.current;

      // 결제 요청 (Promise 방식)
      await widgets.requestPayment({
        orderId: generateRandomString(),
        orderName: displayProductName,
        successUrl: window.location.origin,
        failUrl: window.location.origin,
        customerEmail: customerEmail,
        customerName: customerName,
      });
    } catch (error) {
      console.error('결제 요청 실패:', error);
      alert('결제 요청 중 오류가 발생했습니다.');
      setLoading(false);
    }
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

        {/* Payment Method Widget */}
        <section>
          <h3 className="font-serif-heading font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5" /> 결제 수단
          </h3>
          <div id="payment-widget" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 min-h-64">
            {/* 결제 UI가 여기에 렌더링됩니다 */}
          </div>
        </section>

        {/* Agreement Widget */}
        <section>
          <h3 className="font-serif-heading font-bold text-slate-900 mb-4 text-base">약관 동의</h3>
          <div id="agreement-widget" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            {/* 약관 UI가 여기에 렌더링됩니다 */}
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