import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ShoppingBag, Eye, Home, Star, Check, Truck, ShieldCheck, AlertTriangle, Link as LinkIcon, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from './Button';
import { ProductType } from '../types';
import { WALL_MOCKUP_BG } from '../constants';
import { PaymentSheet } from './PaymentSheet';

interface ResultPageProps {
  initialImages?: string[];
  onPaymentComplete: (image: string, type: ProductType) => void;
  onHome: () => void;
  showToast: (msg: string) => void;
}

// Kakao JavaScript Key: Load from env or use test default
const KAKAO_API_KEY = process.env.KAKAO_API_KEY || 'c089c8172def97eb00c07217cae27404';

export const ResultPage: React.FC<ResultPageProps> = ({ initialImages = [], onPaymentComplete, onHome, showToast }) => {
  const [selectedImage, setSelectedImage] = useState<string>(initialImages[0] || "");
  const [activeTab, setActiveTab] = useState<'ORIGINAL' | 'WALL'>('ORIGINAL');
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('CANVAS');
  
  // Payment Sheet State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Confetti Effect on Mount
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d97706', '#b45309', '#fbbf24', '#ffffff'],
      disableForReducedMotion: true
    });
  }, []);

  // Initialize Kakao SDK
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      try {
        window.Kakao.init(KAKAO_API_KEY);
      } catch (e) {
        console.warn("Kakao Init Failed:", e);
      }
    }
  }, []);

  // Form State
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    addressDetail: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    const price = selectedProduct === 'CANVAS' ? 24900 : 1500;
    const shipping = selectedProduct === 'CANVAS' ? 3000 : 0;
    return price + shipping;
  };

  const handleOrderClick = () => {
    // Basic validation for Canvas
    if (selectedProduct === 'CANVAS') {
      if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
        alert('배송지 정보를 모두 입력해주세요.');
        return;
      }
    }
    // Open Payment Sheet
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    onPaymentComplete(selectedImage, selectedProduct);
  };

  // (C) Image Download Logic (CORS safe)
  const handleDownload = async () => {
    if (!selectedImage) return;
    try {
      showToast("💾 이미지 저장을 시작합니다...");
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `StyleAI_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
      showToast("✅ 갤러리에 저장되었습니다.");
    } catch (e) {
      console.error(e);
      showToast("❌ 저장 중 오류가 발생했습니다.");
    }
  };

  // (A) Kakao Share Logic
  const handleKakaoShare = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      showToast("⚠️ 카카오톡 공유를 사용할 수 없습니다.");
      return;
    }

    // Since selectedImage is likely base64 in this demo, Kakao might block it.
    // In production, you must upload the image to a server first and use a public URL.
    // For this demo, we use a placeholder image or assume the URL is public if not base64.
    const isBase64 = selectedImage.startsWith('data:');
    const imageUrlToShare = isBase64 
      ? 'https://i.imgur.com/h2khhcs.png' // Fallback image for demo (Kakao doesn't support Base64 directly)
      : selectedImage;

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '나만의 AI 스타일 이미지 생성 완료!',
        description: '#AI프로필 #스타일변환 #PawTrait',
        imageUrl: imageUrlToShare,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: '나도 해보기',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  };

  // (D) Copy Link Logic
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast("🔗 링크가 복사되었습니다.");
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-slate-50 pb-40"
    >
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md p-4 shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="font-serif-heading text-xl font-bold text-secondary-900">완성된 작품</h1>
          <button onClick={onHome} className="text-slate-500 text-sm font-medium hover:text-brand-600 transition-colors py-2">처음으로</button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
           <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
             <AlertTriangle className="w-5 h-5" />
           </div>
           <div>
             <p className="text-sm font-bold text-amber-900">⚠️ 이 이미지는 브라우저에만 저장됩니다.</p>
             <p className="text-xs text-amber-700 mt-1 leading-relaxed">
               캐시 삭제 시 이미지가 영구적으로 사라질 수 있습니다.<br/>
               <span className="font-bold underline">꼭 [저장] 버튼을 눌러 파일을 보관하세요!</span>
             </p>
           </div>
        </div>

        {/* Main Preview Area */}
        <div className="bg-slate-900 aspect-square w-full relative overflow-hidden shadow-2xl z-10 transition-colors duration-500">
          <motion.div
             key={activeTab + selectedImage}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5 }}
             className="w-full h-full"
          >
            {activeTab === 'ORIGINAL' ? (
              <img 
                src={selectedImage} 
                alt="Generated Art" 
                className="w-full h-full object-contain p-4 bg-slate-900"
              />
            ) : (
              <div className="w-full h-full relative group">
                <img src={WALL_MOCKUP_BG} alt="Living Room" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none"></div>
                <div 
                  className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[45%] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
                  style={{ perspective: '1000px' }}
                >
                  <div className="bg-[#1a1a1a] p-[3%] rounded-[1px] relative shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] ring-1 ring-black/20">
                    <div className="bg-[#fdfdfd] p-[8%] shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                      <div className="relative aspect-square shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
                        <img 
                          src={selectedImage} 
                          className="w-full h-full object-cover block" 
                          alt="Framed Art" 
                        />
                        <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-multiply" 
                             style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h4v4H0V0zm2 2h2v2H2V2z' fill='%23000000' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`}}>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Tab Switcher */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-black/70 backdrop-blur-xl rounded-full p-1.5 border border-white/10 shadow-lg z-20">
            <button 
              onClick={() => setActiveTab('ORIGINAL')}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'ORIGINAL' ? 'bg-white text-black shadow-md' : 'text-slate-300 hover:text-white'}`}
            >
              <Eye className="w-3 h-3" /> 원본 보기
            </button>
            <button 
              onClick={() => setActiveTab('WALL')}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'WALL' ? 'bg-white text-black shadow-md' : 'text-slate-300 hover:text-white'}`}
            >
              <Home className="w-3 h-3" /> 우리집 걸어보기
            </button>
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div className="p-4 overflow-x-auto whitespace-nowrap scrollbar-hide bg-white border-b border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-20 relative rounded-b-2xl">
          <div className="flex gap-3 justify-center min-w-min">
            {initialImages.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${selectedImage === img ? 'border-brand-500 scale-105 shadow-md ring-2 ring-brand-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt={`Result ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Share & Save Actions (2 Buttons) */}
        <div className="bg-white px-6 py-8 border-b border-slate-100">
           <h3 className="text-center text-slate-900 font-bold mb-6 font-serif-heading">작품 공유 및 소장</h3>
           <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
             {/* 1. Kakao Share */}
             <button 
                onClick={handleKakaoShare}
                className="flex flex-col items-center gap-2 group"
             >
                <div className="w-14 h-14 rounded-full bg-[#FAE100] flex items-center justify-center shadow-sm group-active:scale-95 transition-transform text-[#371D1E]">
                  <MessageCircle className="w-7 h-7 fill-current" />
                </div>
                <span className="text-xs font-medium text-slate-600">카카오톡</span>
             </button>

             {/* 2. Copy Link */}
             <button 
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 group"
             >
                <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform text-slate-700">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-600">링크복사</span>
             </button>
           </div>
        </div>

        {/* Prominent Save Button Section (Required Backup) */}
        <div className="px-6 py-6 bg-slate-50 border-b border-slate-100">
           <Button 
             fullWidth 
             onClick={handleDownload} 
             className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 py-4 text-lg flex items-center justify-center gap-2"
           >
             <Download className="w-5 h-5" />
             기기에 저장 (필수)
           </Button>
           <p className="text-center text-xs text-slate-400 mt-2">
             * 생성된 이미지를 잃어버리지 않도록 지금 바로 저장하세요.
           </p>
        </div>

        {/* Checkout & Options Section */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="font-serif-heading font-bold text-secondary-900 text-xl px-1">소장 방법 선택</h3>
          </div>
          
          <div className="space-y-4">
            {/* Option B: Premium Frame (Now the only option) */}
            <div 
              onClick={() => setSelectedProduct('CANVAS')}
              className={`relative p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 group ${selectedProduct === 'CANVAS' ? 'border-4 border-brand-500 bg-brand-50 shadow-lg transform scale-[1.01]' : 'border-2 border-slate-100 bg-white hover:border-brand-200 shadow-sm'}`}
            >
               {/* Best Badge */}
              <div className="absolute -top-3 left-4 bg-secondary-900 text-white text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wide font-bold shadow-lg flex items-center gap-1 z-10">
                <Star className="w-3 h-3 fill-current text-yellow-400" /> Best Choice
              </div>

              {selectedProduct === 'CANVAS' && (
                <div className="absolute -top-3 -right-3 bg-brand-500 text-white p-1.5 rounded-full shadow-md animate-in zoom-in duration-200 z-10">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-inner ${selectedProduct === 'CANVAS' ? 'bg-white text-brand-600' : 'bg-brand-100 text-brand-600'}`}>
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">Premium Canvas</p>
                  <p className="text-sm text-slate-500 font-medium">20x20cm 최고급 액자</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 line-through font-medium">45,000원</p>
                <p className="font-bold text-brand-600 text-lg">24,900원</p>
              </div>
            </div>
          </div>

          {/* Conditional Shipping Form */}
          <AnimatePresence>
            {selectedProduct === 'CANVAS' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4 border-t border-slate-200 mt-4">
                  <h4 className="font-serif-heading font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand-600" /> 배송지 입력
                  </h4>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      name="name"
                      placeholder="받는 분 성함" 
                      value={shippingInfo.name}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-xl border-2 border-slate-100 bg-white focus:border-brand-500 focus:ring-0 outline-none transition-colors" 
                    />
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="연락처 (010-0000-0000)" 
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-xl border-2 border-slate-100 bg-white focus:border-brand-500 focus:ring-0 outline-none transition-colors" 
                    />
                    <input 
                      type="text" 
                      name="address"
                      placeholder="주소 (자동 입력)" 
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-brand-500 focus:ring-0 outline-none transition-colors" 
                    />
                    <input 
                      type="text" 
                      name="addressDetail"
                      placeholder="상세 주소 입력" 
                      value={shippingInfo.addressDetail}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-xl border-2 border-slate-100 bg-white focus:border-brand-500 focus:ring-0 outline-none transition-colors" 
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 flex gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    안전한 배송을 위해 꼼꼼하게 포장하여 보내드립니다.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Payment Sticky Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto space-y-3">
           {/* Price Summary (Small) */}
           <div className="flex justify-between items-center px-2 text-sm">
             <span className="text-slate-500">
               {selectedProduct === 'CANVAS' ? `상품 24,900원 + 배송비 3,000원` : '상품 1,500원 (즉시 다운로드)'}
             </span>
             <span className="font-bold text-slate-900">
               총 <span className="text-brand-600 text-lg">{calculateTotal().toLocaleString()}원</span>
             </span>
           </div>

          <Button 
            fullWidth 
            onClick={handleOrderClick} 
            className="shadow-brand-500/30 text-lg py-4 flex items-center justify-center gap-2"
          >
            {calculateTotal().toLocaleString()}원 결제하기
          </Button>
        </div>
      </div>

      <PaymentSheet 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title={selectedProduct === 'CANVAS' ? '프리미엄 캔버스 액자 (20x20cm)' : '디지털 고해상도 원본'}
        amount={calculateTotal()}
        credits={0}
        onComplete={handlePaymentSuccess}
        buyerName={selectedProduct === 'CANVAS' ? shippingInfo.name : undefined}
        buyerTel={selectedProduct === 'CANVAS' ? shippingInfo.phone : undefined}
        buyerAddr={selectedProduct === 'CANVAS' ? `${shippingInfo.address} ${shippingInfo.addressDetail}` : undefined}
      />
    </motion.div>
  );
};