/**
 * Toss Payments V2 SDK를 사용한 결제위젯 구현 예제
 * 
 * 이 파일은 CheckoutPage.tsx에서 사용된 핵심 로직을 설명하는 예제입니다.
 */

// ============================================
// 1. SDK 초기화 및 결제위젯 설정
// ============================================

import { useEffect, useRef } from 'react';

// 전역 Window 인터페이스 확장
declare global {
  interface Window {
    TossPayments: any;
  }
}

// 결제위젯 초기화 함수
async function initializePaymentWidget() {
  const { TossPayments } = window;
  
  if (!TossPayments) {
    throw new Error('Toss Payments SDK가 로드되지 않았습니다.');
  }

  // 클라이언트 키로 Toss Payments 인스턴스 생성
  const tossPayments = TossPayments(import.meta.env.VITE_TOSS_CLIENT_KEY);

  // 결제위젯 초기화 (비회원 결제)
  const widgets = tossPayments.widgets({
    customerKey: TossPayments.ANONYMOUS,
  });

  return { tossPayments, widgets };
}

// ============================================
// 2. 금액 설정
// ============================================

async function setPaymentAmount(widgets: any, totalAmount: number) {
  await widgets.setAmount({
    currency: 'KRW',
    value: totalAmount,
  });
}

// ============================================
// 3. 결제 수단 UI 렌더링
// ============================================

async function renderPaymentMethods(
  widgets: any,
  containerSelector: string,
  amount: number,
  variantKey: string = 'DEFAULT'
) {
  const paymentMethodWidget = await widgets.renderPaymentMethods(
    containerSelector,
    { value: amount },
    { variantKey }
  );

  // 결제 수단 선택 이벤트 리스너
  paymentMethodWidget.on('paymentMethodSelect', (selectedMethod: any) => {
    console.log('선택된 결제수단:', selectedMethod.code);
    
    // 예: 특정 결제수단에 따른 처리
    switch (selectedMethod.code) {
      case '카드':
        console.log('신용카드가 선택되었습니다');
        break;
      case '계좌이체':
        console.log('계좌이체가 선택되었습니다');
        break;
      case '카카오페이':
        console.log('카카오페이가 선택되었습니다');
        break;
      default:
        console.log(`${selectedMethod.code} 선택됨`);
    }
  });

  return paymentMethodWidget;
}

// ============================================
// 4. 약관 UI 렌더링
// ============================================

async function renderAgreement(
  widgets: any,
  containerSelector: string,
  variantKey: string = 'DEFAULT'
) {
  const agreementWidget = await widgets.renderAgreement(
    containerSelector,
    { variantKey }
  );

  // 약관 동의 상태 변경 이벤트 리스너
  agreementWidget.on('agreementStatusChange', (status: any) => {
    console.log('필수약관 동의 여부:', status.agreedRequiredTerms);
    
    // 결제 버튼 활성화/비활성화 로직
    if (status.agreedRequiredTerms) {
      // 결제 버튼 활성화
      console.log('결제 버튼을 활성화할 수 있습니다');
    } else {
      // 결제 버튼 비활성화
      console.log('결제 버튼을 비활성화해야 합니다');
    }
  });

  return agreementWidget;
}

// ============================================
// 5. 결제 요청 (Redirect 방식)
// ============================================

async function requestPaymentRedirect(
  widgets: any,
  orderId: string,
  orderName: string,
  amount: number,
  customerEmail: string,
  customerName: string
) {
  await widgets.requestPayment({
    orderId, // 반드시 고유해야 함
    orderName,
    successUrl: `${window.location.origin}/success`, // 성공 후 이동할 URL
    failUrl: `${window.location.origin}/fail`, // 실패 후 이동할 URL
    customerEmail,
    customerName,
  });
}

// ============================================
// 6. 결제 요청 (Promise 방식 - 모바일 미지원)
// ============================================

async function requestPaymentPromise(
  widgets: any,
  orderId: string,
  orderName: string,
  customerEmail: string,
  customerName: string
) {
  try {
    const response = await widgets.requestPayment({
      orderId,
      orderName,
      customerEmail,
      customerName,
      // Redirect URL을 설정하지 않으면 Promise 방식
    });

    // response 형태:
    // {
    //   paymentKey: '5zJ324ygbVwXZRDmVW6q6',
    //   orderId: '1234567890',
    //   amount: 26900,
    //   ...
    // }

    console.log('결제 성공:', response);
    return response;
  } catch (error) {
    console.error('결제 실패:', error);
    throw error;
  }
}

// ============================================
// 7. 전체 통합 예제 (React Hook)
// ============================================

export function usePaymentWidget(
  totalAmount: number,
  productName: string,
  onPaymentComplete?: (response: any) => void
) {
  const paymentWidgetRef = useRef<any>(null);
  const agreementWidgetRef = useRef<any>(null);

  // SDK 로드 및 초기화
  useEffect(() => {
    const loadScript = async () => {
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v2/TossPayments';
      script.async = true;

      script.onload = async () => {
        try {
          const { widgets } = await initializePaymentWidget();
          await setPaymentAmount(widgets, totalAmount);

          // 결제 수단 UI 렌더링
          const paymentMethodWidget = await renderPaymentMethods(
            widgets,
            '#payment-widget',
            totalAmount
          );

          // 약관 UI 렌더링
          const agreementWidget = await renderAgreement(
            widgets,
            '#agreement-widget'
          );

          paymentWidgetRef.current = {
            widgets,
            paymentMethodWidget,
          };
          agreementWidgetRef.current = agreementWidget;
        } catch (error) {
          console.error('결제위젯 초기화 실패:', error);
        }
      };

      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      // 클린업
      if (paymentWidgetRef.current?.paymentMethodWidget) {
        paymentWidgetRef.current.paymentMethodWidget.destroy();
      }
      if (agreementWidgetRef.current) {
        agreementWidgetRef.current.destroy();
      }
    };
  }, [totalAmount]);

  // 결제 실행 함수
  const executePayment = async (
    customerEmail: string,
    customerName: string
  ) => {
    if (!paymentWidgetRef.current) {
      alert('결제 시스템 초기화 중입니다.');
      return;
    }

    try {
      const orderId = new Date().getTime().toString();
      const { widgets } = paymentWidgetRef.current;

      await requestPaymentRedirect(
        widgets,
        orderId,
        productName,
        totalAmount,
        customerEmail,
        customerName
      );
    } catch (error) {
      console.error('결제 요청 실패:', error);
    }
  };

  return { executePayment, paymentWidgetRef, agreementWidgetRef };
}

// ============================================
// 8. 백엔드 결제 승인 API 호출 예제
// ============================================

interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

/**
 * 서버에서 호출할 결제 승인 API 예제
 * 클라이언트에서는 success URL로 리다이렉트 후,
 * 서버에서 다음 API를 호출하여 결제를 완료해야 합니다.
 */
async function confirmPayment(request: PaymentConfirmRequest) {
  const response = await fetch('/api/payment/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('결제 승인 실패');
  }

  return response.json();
}

// ============================================
// 9. Success/Fail URL 핸들러 예제
// ============================================

export function usePaymentResult() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = params.get('amount');
    const code = params.get('code');
    const message = params.get('message');

    if (paymentKey && orderId && amount) {
      // 성공 - 백엔드에 결제 승인 요청
      confirmPayment({
        paymentKey,
        orderId,
        amount: parseInt(amount),
      })
        .then((result) => {
          console.log('결제 완료:', result);
          // 주문 완료 페이지로 이동
        })
        .catch((error) => {
          console.error('결제 승인 실패:', error);
          // 에러 처리
        });
    } else if (code && message) {
      // 실패
      console.error('결제 실패:', { code, message, orderId });
      // 실패 페이지로 이동 또는 에러 표시
    }
  }, []);
}

// ============================================
// 10. 환경변수 설정 (.env)
// ============================================

/*
VITE_TOSS_CLIENT_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

주의:
- CLIENT_KEY는 공개 키이므로 프론트엔드에 노출되어도 괜찮습니다
- SECRET_KEY는 절대 프론트엔드에 노출하면 안 됩니다 (백엔드에만)
*/
