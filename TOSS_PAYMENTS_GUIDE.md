# Toss Payments V2 결제위젯 연동 가이드

## 개요
이 프로젝트에 Toss Payments V2 SDK를 사용한 결제위젯이 통합되었습니다. 결제위젯은 주문서 내에 직접 통합되어 최적화된 결제 UI를 제공합니다.

## 설치 및 설정

### 1. 의존성 설치
```bash
npm install
# 또는
yarn install
```

`package.json`에 다음 패키지가 추가되었습니다:
- `@tosspayments/tosspayments-sdk`: ^0.16.0

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음을 추가하세요:

```env
VITE_TOSS_CLIENT_KEY=your_client_key_here
```

`your_client_key_here`를 Toss Payments 개발자센터에서 발급받은 Client Key로 교체하세요.

> **Client Key 발급 방법:**
> 1. [Toss Payments 개발자센터](https://developers.tosspayments.com) 방문
> 2. 상점 관리자 > 개발자 탭 > Client Key 확인

## 구현 상세

### CheckoutPage 컴포넌트 변경사항

#### 주요 기능:
1. **결제위젯 초기화** (`initializePaymentWidget`)
   - Toss Payments SDK 스크립트 로드
   - 결제위젯 및 약관 위젯 렌더링
   - 금액 설정 및 이벤트 리스너 등록

2. **고객 정보 입력**
   - 주문자 이름
   - 이메일 주소
   - 배송 정보 (캔버스 상품만)

3. **결제 요청** (`handlePayment`)
   - 고객 정보 검증
   - 약관 동의 여부 확인
   - 결제 요청 실행 (Redirect 방식)

### 컴포넌트 구조

```
CheckoutPage
├── 주문 요약 (상품 정보, 가격)
├── 배송지 정보 (캔버스 상품만)
├── 주문자 정보 (이름, 이메일)
├── 결제 금액 요약
├── 결제 수단 위젯 (id="payment-widget")
├── 약관 위젯 (id="agreement-widget")
└── 결제하기 버튼
```

## API 메서드

### 1. `tossPayments.widgets()`
결제위젯 초기화
```javascript
const widgets = tossPayments.widgets({
  customerKey: TossPayments.ANONYMOUS, // 비회원 결제
});
```

### 2. `widgets.setAmount()`
결제 금액 설정
```javascript
await widgets.setAmount({
  currency: 'KRW',
  value: 26900, // 가격 + 배송비
});
```

### 3. `widgets.renderPaymentMethods()`
결제 수단 UI 렌더링
```javascript
const paymentMethodWidget = await widgets.renderPaymentMethods(
  '#payment-widget',
  { value: total },
  { variantKey: 'DEFAULT' }
);
```

### 4. `widgets.renderAgreement()`
약관 UI 렌더링
```javascript
const agreementWidget = await widgets.renderAgreement(
  '#agreement-widget',
  { variantKey: 'DEFAULT' }
);
```

### 5. `widgets.requestPayment()`
결제 요청 (Redirect 방식)
```javascript
await widgets.requestPayment({
  orderId: generateRandomString(),
  orderName: '상품명',
  successUrl: `${window.location.origin}/success`,
  failUrl: `${window.location.origin}/fail`,
  customerEmail: 'customer@example.com',
  customerName: '고객명',
});
```

## 이벤트 처리

### 결제 수단 선택 이벤트
```javascript
paymentMethodWidget.on('paymentMethodSelect', (selectedPaymentMethod) => {
  console.log('선택된 결제수단:', selectedPaymentMethod.code);
  // 예: '카드', '계좌이체', '가상계좌' 등
});
```

### 약관 동의 상태 변경 이벤트
```javascript
agreementWidget.on('agreementStatusChange', (agreementStatus) => {
  if (agreementStatus.agreedRequiredTerms) {
    // 결제 버튼 활성화
  } else {
    // 결제 버튼 비활성화
  }
});
```

## 결제 결과 처리

### 성공 경우
사용자가 결제 완료 후 다음 URL로 리다이렉트됩니다:
```
{successUrl}?paymentType={PAYMENT_TYPE}&amount={AMOUNT}&orderId={ORDER_ID}&paymentKey={PAYMENT_KEY}
```

**반드시 다음을 확인하세요:**
1. 쿼리 파라미터의 `amount`가 설정한 금액과 동일한지 확인
2. 결제 승인 API 호출 (백엔드에서)

### 실패 경우
다음 URL로 리다이렉트됩니다:
```
{failUrl}?code={ERROR_CODE}&message={ERROR_MESSAGE}&orderId={ORDER_ID}
```

## 테스트 결제 정보

### 테스트 카드
| 카드사 | 카드번호 | 유효기간 | CVC |
|--------|---------|---------|-----|
| 삼성카드 | 6310 0000 0000 0000 | 01/25 | 000 |
| KB카드 | 6323 0000 0000 0000 | 01/25 | 000 |

### 테스트 간편결제
- **카카오페이:** 테스트 계정으로 로그인
- **네이버페이:** 테스트 계정으로 로그인

## 주의사항

1. **Client Key**: 클라이언트 키는 노출되어도 괜찮습니다 (공개 키)
2. **Secret Key**: Secret Key는 절대 프론트엔드에 노출하면 안 됩니다 (백엔드에만)
3. **금액 검증**: 서버에서 반드시 결제 금액을 다시 검증해야 합니다
4. **결제 승인**: 성공 응답 후 반드시 백엔드에서 결제 승인 API를 호출해야 합니다

## 참고 문서

- [Toss Payments V2 공식 문서](https://docs.tosspayments.com)
- [JavaScript SDK 레퍼런스](https://docs.tosspayments.com/sdk/js-sdk)
- [결제 승인 API](https://docs.tosspayments.com/api/payment#결제-승인)

## 트러블슈팅

### 1. "결제 시스템 초기화 중입니다" 메시지
- Client Key가 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 2. 결제위젯이 렌더링되지 않음
- `#payment-widget` DOM 요소가 존재하는지 확인
- SDK 스크립트가 성공적으로 로드되었는지 확인 (개발자도구 Network 탭)

### 3. CORS 에러 발생
- 개발자센터에서 도메인 등록 확인
- 로컬 테스트는 `localhost`로 진행

## 다음 단계

1. **백엔드 연동**: 결제 승인 API 구현
2. **Success/Fail 페이지**: 결과 처리 페이지 구현
3. **매출 기록**: 데이터베이스에 주문 정보 저장
4. **메일 발송**: 결제 완료 메일 발송 구현
