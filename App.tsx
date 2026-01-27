import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudioPage } from './components/StudioPage';
import { ResultPage } from './components/ResultPage';
import { GalleryPage } from './components/GalleryPage';
import { ReviewsPage } from './components/ReviewsPage';
import { MembershipPage } from './components/MembershipPage';
import { CheckoutPage } from './components/CheckoutPage';
import { DataGenerator } from './components/DataGenerator';
import { ViewState, ProductType, GeneratedImage, UserProfile } from './types';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './components/Button';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { supabase, isSupabaseConfigured, ADMIN_EMAIL } from './supabaseClient';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('STUDIO');
  const [studioView, setStudioView] = useState<ViewState>('LANDING');
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<ProductType>('CANVAS');
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<{ credits: number, price: number, name: string } | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [credits, setCredits] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [gallery, setGallery] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem('my_gallery_images');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const showToast = useCallback((message: string) => setToastMessage(message), []);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          nickname: data.nickname,
          email: data.email,
          password: data.password,
          credits: data.credits,
          isAdmin: data.is_admin === true || email === ADMIN_EMAIL
        });
        setCredits(data.credits);
      } else {
        setUser({
          id: userId,
          name: '사용자',
          nickname: '회원',
          email: email || '',
          credits: 0,
          isAdmin: email === ADMIN_EMAIL
        });
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    }
  }, []);

  useEffect(() => {
    // Check for Toss Payments success callback
    const params = new URLSearchParams(window.location.search);
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = params.get('amount');

    if (paymentKey && orderId && amount) {
      // Payment Successful
      setOrderComplete(true);
      setActiveTab('STUDIO');
      setStudioView('STUDIO'); // Or stay in Result view if preferred, but rendering Success state in main is handled below

      // Clear URL params to prevent re-triggering on refresh
      window.history.replaceState({}, '', window.location.pathname);

      console.log('Payment Success:', { paymentKey, orderId, amount });
      // TODO: Here you would normally verify payment with your backend
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          // 5초 타임아웃: 세션 확인이 오래 걸리면 그냥 로그아웃 상태로 앱 진입
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth timeout')), 5000)
          );

          const authPromise = supabase.auth.getSession();

          // 타임아웃 발생 시 catch로 이동
          const { data } = await Promise.race([authPromise, timeoutPromise]) as any;

          if (data?.session?.user && mounted) {
            await fetchProfile(data.session.user.id, data.session.user.email);
          }
        }
      } catch (err: any) {
        // 타임아웃이나 에러가 발생해도 사용자가 앱을 쓸 수 있게 로그만 남기고 넘어감
        console.warn("[App] Auth initialization skipped/timed-out:", err.message);

        // 치명적인 타임아웃 발생 시 -> 로컬 스토리지 비우고 '1회' 새로고침하여 클린 상태 확보
        if (err.message === 'Auth timeout' || err.name === 'AuthSessionMissingError') {
          console.warn("[App] Critical Auth Issue. Clearing storage and reloading...");
          localStorage.clear();

          // 무한 새로고침 방지: 세션 스토리지 플래그 확인
          const isRetried = sessionStorage.getItem('auth_timeout_retry');
          if (!isRetried) {
            sessionStorage.setItem('auth_timeout_retry', 'true');
            window.location.reload();
            return; // 리로드 중 다른 로직 실행 방지
          } else {
            // 이미 리로드 했는데도 문제면, 그냥 리로드 하지 않고 플래그 삭제 (다음 방문 위해)
            sessionStorage.removeItem('auth_timeout_retry');
          }
        }
      } finally {
        // 성공하든 실패하든 로딩 상태를 해제하여 화면을 보여줌
        if (mounted) setIsInitialLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCredits(0);
        setStudioView('LANDING');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      setUser(null);
      setCredits(0);
      setStudioView('LANDING');
      setActiveTab('STUDIO');
      showToast("로그아웃 되었습니다.");
    }
  };

  const resetFlow = () => {
    setStudioView('LANDING');
    setSelectedImageUrls([]);
    setOrderComplete(false);
  };

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'STUDIO') resetFlow();
  };

  const handleDeductCredits = async (amount: number) => {
    // 1. Optimistic UI update
    setCredits(prev => Math.max(0, prev - amount));
    if (user) {
      setUser(prev => prev ? { ...prev, credits: Math.max(0, prev.credits - amount) } : null);
    }

    // 2. DB Update
    if (user?.id) {
      try {
        const { error } = await supabase.rpc('deduct_credits', {
          user_id: user.id,
          amount: amount
        });

        if (error) {
          // Fallback if RPC fails, try direct update (though RPC is safer for concurrency)
          console.warn("RPC failed, trying direct update", error);
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: Math.max(0, credits - amount) })
            .eq('id', user.id);

          if (updateError) throw updateError;
        }
      } catch (err) {
        console.error("Failed to deduct credits in DB:", err);
        // Revert UI on failure
        setCredits(prev => prev + amount);
        if (user) {
          setUser(prev => prev ? { ...prev, credits: prev.credits + amount } : null);
        }
        showToast("크레딧 차감 중 오류가 발생했습니다.");
      }
    }
  };

  // 탭이나 뷰가 변경될 때마다 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, studioView]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
          <p className="text-slate-400 font-medium animate-pulse">PawTrait 스튜디오 준비 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        credits={credits}
        onOpenShop={() => setActiveTab('MEMBERSHIP')}
        onStart={() => { setActiveTab('STUDIO'); setStudioView('STUDIO'); }}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />
      <main className="flex-grow">
        {activeTab === 'STUDIO' && (
          orderComplete ? (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
              <CheckCircle className="w-20 h-20 text-green-500" />
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">주문 요청 완료!</h2>
                <p className="text-slate-500">결제가 성공적으로 처리되었습니다.</p>
              </div>
              <Button onClick={resetFlow} size="lg" className="px-10">홈으로 돌아가기</Button>
            </div>
          ) : (
            studioView === 'LANDING' ? <LandingPage onStart={() => setStudioView('STUDIO')} onNavigateToGallery={() => setActiveTab('GALLERY')} onNavigateToReviews={() => setActiveTab('REVIEWS')} onOpenLogin={() => setIsLoginModalOpen(true)} user={user} /> :
              studioView === 'STUDIO' ? <StudioPage onBack={() => setStudioView('LANDING')} onGenerate={(urls, style) => { setSelectedImageUrls(urls); setStudioView('RESULT'); }} credits={credits} onPurchaseCredits={() => { }} onDeductCredit={handleDeductCredits} user={user} /> :
                studioView === 'RESULT' ? <ResultPage initialImages={selectedImageUrls} onHome={resetFlow} onCheckout={(image, type) => { setSelectedImageUrls([image]); setSelectedProductType(type); setStudioView('CHECKOUT'); }} showToast={showToast} /> :
                  studioView === 'CHECKOUT' ? <CheckoutPage productType={selectedProductType} selectedImageUrl={selectedImageUrls[0]} onBack={() => setStudioView('RESULT')} onSuccess={() => setOrderComplete(true)} /> :
                    null
          )
        )}
        {activeTab === 'GALLERY' && <GalleryPage items={gallery} onNavigateToStudio={() => { setActiveTab('STUDIO'); setStudioView('STUDIO'); }} showToast={showToast} />}
        {activeTab === 'REVIEWS' && <ReviewsPage user={user} onOpenLogin={() => setIsLoginModalOpen(true)} />}
        {activeTab === 'MEMBERSHIP' && <MembershipPage user={user} credits={credits} onLogin={(u) => { setUser(u); setCredits(u.credits || 0); }} onPurchase={() => { }} />}
        {activeTab === 'ADMIN' && user?.isAdmin && <DataGenerator />}
      </main>
      <AuthModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={(u) => { setUser(u); setCredits(u.credits || 0); setIsLoginModalOpen(false); }} />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};

export default App;