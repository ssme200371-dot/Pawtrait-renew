import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, ArrowRight, Star, Truck, User, Sparkles, Upload, Image as ImageIcon, Repeat } from 'lucide-react';
import { Button } from './Button';
import { LANDING_BEFORE_IMAGE, LANDING_AFTER_IMAGE, REVIEWS } from '../constants';
import { useData } from '../DataContext';
import { maskUserId, getUserBadge } from '../utils/formatters';
import { Review, UserProfile } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onNavigateToGallery: () => void;
  onNavigateToReviews: () => void;
  onNavigateToAdmin?: () => void;
  onOpenLogin: () => void;
  user: UserProfile | null;
}

const FeaturedReviewCard: React.FC<{ review: Review, idx: number }> = ({ review, idx }) => {
  const [isShowingOriginal, setIsShowingOriginal] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group"
      onClick={() => setIsShowingOriginal(!isShowingOriginal)}
    >
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6 bg-slate-100 cursor-pointer">
        <img
          src={review.beforeImage}
          alt="Original"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isShowingOriginal ? 'opacity-100' : 'opacity-0'}`}
        />
        <img
          src={review.afterImage}
          alt="Transformed"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isShowingOriginal ? 'opacity-0' : 'opacity-100'}`}
        />
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-brand-600 flex items-center gap-1 shadow-sm">
          <Repeat className="w-3 h-3" /> {isShowingOriginal ? '변환본 확인' : '원본보기'}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
        </div>
        <div className="relative">
          <p className="text-slate-700 font-medium leading-relaxed relative z-10 line-clamp-3">
            {review.text}
          </p>
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
            {review.user[0]}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{maskUserId(review.user)}님</p>
            <p className="text-xs text-slate-400">{getUserBadge(review.id).text}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  onNavigateToGallery,
  onNavigateToReviews,
  onNavigateToAdmin,
  onOpenLogin,
  user
}) => {
  const [showAfter, setShowAfter] = useState(false);
  const [beforeImage, setBeforeImage] = useState(LANDING_BEFORE_IMAGE);
  const [afterImage, setAfterImage] = useState(LANDING_AFTER_IMAGE);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'BEFORE' | 'AFTER') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      if (type === 'BEFORE') {
        setBeforeImage(url);
        setShowAfter(false);
      } else {
        setAfterImage(url);
        setShowAfter(true);
      }
    }
  };

  const featuredReviews = REVIEWS.filter(r => [7, 2, 5].includes(Number(r.id)));

  return (
    <div className="bg-slate-50 min-h-screen font-sans overflow-x-hidden flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden flex-shrink-0">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand-200/30 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-amber-100/40 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 md:grid md:grid-cols-2 md:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="z-10 text-center md:text-left"
            >
              <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                <span className="font-serif-heading font-bold text-4xl sm:text-5xl text-secondary-900 tracking-tight">PawTrait</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-brand-100 text-brand-600 px-4 py-1.5 rounded-full font-bold text-xs md:text-sm mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 fill-brand-200" />
                <span>AI Pet Portrait Studio</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif-heading font-bold text-secondary-900 leading-tight mb-6">
                우리집 댕냥이를<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-amber-600 relative inline-block pb-2">
                  명화 속 주인공
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-200/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
                으로
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
                단 한 장의 사진으로 시작하는 마법 같은 변화.<br className="hidden md:block" />
                PawTrait AI가 당신의 반려동물을 위한 특별한 초상화를 그려드립니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button onClick={onStart} className="text-lg px-8 py-4 shadow-lg shadow-brand-500/30 hover:scale-105 transition-transform">
                  지금 바로 시작하기
                </Button>
                <Button
                  onClick={onNavigateToGallery}
                  className="text-lg px-8 py-4 !bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 hover:!text-brand-600 transition-colors shadow-sm"
                >
                  갤러리 구경하기
                </Button>
              </div>

              {/* 로그인하지 않은 상태에서만 표시 */}
              {!user && (
                <div className="mt-6 flex justify-center md:justify-start">
                  <button onClick={onOpenLogin} className="text-sm font-bold text-slate-500 hover:text-brand-600 underline decoration-slate-300 hover:decoration-brand-300 underline-offset-4 transition-all">
                    이미 계정이 있으신가요? 로그인
                  </button>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative perspective-1000 flex justify-center"
            >
              <div
                className="relative aspect-[9/16] w-full max-w-[400px] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white cursor-pointer group transform transition-transform duration-500 hover:rotate-1 bg-slate-100"
                onMouseEnter={() => setShowAfter(true)}
                onMouseLeave={() => setShowAfter(false)}
                onClick={() => setShowAfter(!showAfter)}
              >
                <img
                  src={beforeImage}
                  alt="Original"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${showAfter ? 'opacity-0' : 'opacity-100'}`}
                />
                <img
                  src={afterImage}
                  alt="Art"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${showAfter ? 'opacity-100' : 'opacity-0'}`}
                />

                <div
                  className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full cursor-pointer backdrop-blur-md shadow-lg transition-transform hover:scale-110 flex items-center gap-2 group/btn">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'BEFORE')} />
                  </label>
                  <label className="bg-brand-500/90 hover:bg-brand-600 text-white p-2.5 rounded-full cursor-pointer backdrop-blur-md shadow-lg transition-transform hover:scale-110 flex items-center gap-2 group/btn">
                    <Upload className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'AFTER')} />
                  </label>
                </div>

                <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md text-white px-5 py-2 rounded-full font-serif-heading font-medium tracking-wide text-sm pointer-events-none transition-all duration-500">
                  {showAfter ? 'After: Artistic Style' : 'Before: Original Photo'}
                </div>

                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur text-brand-600 px-5 py-2.5 rounded-full font-bold text-sm shadow-xl pointer-events-none flex items-center gap-2 transition-transform group-hover:scale-105">
                  <ArrowRight className="w-4 h-4" />
                  {showAfter ? '원본보기' : '탭해서 변신하기'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white flex-shrink-0 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-serif-heading text-3xl md:text-4xl font-bold text-secondary-900 mb-4">왜 PawTrait 인가요?</h2>
            <p className="text-slate-500 text-lg">단순한 필터가 아닙니다. AI가 붓터치 하나하나 정성스럽게 그려내는<br className="hidden md:block" /> 세상에 단 하나뿐인 예술 작품입니다.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Palette, title: "12가지 아트 스타일", desc: "르네상스 유화, 팝아트, 3D 캐릭터 등 반려동물의 개성에 맞는 스타일을 찾아보세요." },
              { icon: Star, title: "8K 초고해상도", desc: "털 한 올의 질감까지 생생하게 살아있는 압도적인 퀄리티의 이미지를 제공합니다." },
              { icon: Truck, title: "프리미엄 액자 배송", desc: "생성된 작품은 최고급 캔버스 액자로 제작하여 집 앞까지 안전하게 배송해 드립니다." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 group"
              >
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-brand-500" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Reviews Section */}
      <section className="py-24 bg-slate-50 flex-shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/30 rounded-full blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="font-serif-heading text-3xl md:text-4xl font-bold text-secondary-900 mb-4">집사님들의 생생한 후기</h2>
              <p className="text-slate-500 text-lg">이미 1만 명 이상의 집사님들이 PawTrait으로 특별한 추억을 만들었습니다.</p>
            </div>
            <button
              onClick={onNavigateToReviews}
              className="group flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors whitespace-nowrap"
            >
              전체 리뷰 보기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredReviews.map((review, idx) => (
              <FeaturedReviewCard key={review.id} review={review} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 bg-slate-100 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto break-keep">
            본 서비스는 AI 기술을 활용하여 이미지를 생성하며, 언급된 스타일은 묘사를 위한 표현일 뿐 특정 브랜드나 저작권자와 공식적인 관련이 없습니다.
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-4 font-medium">
            © 2024 PawTrait Art. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};