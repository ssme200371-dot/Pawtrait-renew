import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, User, ThumbsUp, Sparkles, Repeat, Plus, X, Trash2, Lock, PenTool, Image as ImageIcon, AlertCircle, Square, CheckSquare } from 'lucide-react';
import { useData } from '../DataContext';
import { maskUserId, getUserBadge } from '../utils/formatters';
import { Button } from './Button';
import { UserProfile } from '../types';

interface ReviewsPageProps {
  user?: UserProfile | null;
  onOpenLogin: () => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ user, onOpenLogin }) => {
  const { reviews: REVIEWS, addReview, deleteReview } = useData();

  const [helpfulCounts, setHelpfulCounts] = useState<{ [key: string]: number }>(
    REVIEWS.reduce((acc, review) => ({ ...acc, [review.id]: Math.floor(Math.random() * 50) + 10 }), {})
  );

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null);

  const [writeForm, setWriteForm] = useState({
    nickname: '',
    password: '',
    rating: 5,
    text: ''
  });
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [deletePassword, setDeletePassword] = useState('');

  // 닉네임 자동 입력 - user가 바뀌거나, 모달이 열릴 때 업데이트
  React.useEffect(() => {
    if (user) {
      setWriteForm(prev => ({
        ...prev,
        nickname: user.nickname || '',
        password: '' // 비밀번호 저장하지 않음
      }));
    }
  }, [user, isWriteModalOpen]);

  const handleHelpfulClick = (id: string | number) => {
    setHelpfulCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReviewImage(file);
      setReviewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reviewImage) {
      setErrorMsg("📸 리뷰 사진을 꼭 등록해주세요! (필수)");
      return;
    }

    if (!writeForm.nickname || (!user && !writeForm.password) || !writeForm.text) {
      setErrorMsg("✏️ 닉네임, 비밀번호(비회원), 내용을 모두 입력해주세요.");
      return;
    }

    if (!privacyAgreed) {
      setErrorMsg("📝 개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    const imageUrl = URL.createObjectURL(reviewImage);

    await addReview({
      user: writeForm.nickname,
      password: writeForm.password,
      userId: user?.id,
      rating: writeForm.rating,
      text: writeForm.text,
      beforeImage: imageUrl,
      afterImage: imageUrl,
      date: new Date().toLocaleDateString('ko-KR')
    });

    setWriteForm({ nickname: '', password: '', rating: 5, text: '' });
    setReviewImage(null);
    setReviewImagePreview(null);
    setPrivacyAgreed(false);
    setErrorMsg(null);
    setIsWriteModalOpen(false);
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteTargetId === null) return;

    const success = await deleteReview(String(deleteTargetId), deletePassword);
    if (success) {
      alert("리뷰가 삭제되었습니다.");
      setDeleteTargetId(null);
      setDeletePassword('');
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
      <div className="bg-secondary-900 py-12 sm:py-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-brand-300 text-xs sm:text-sm font-bold mb-4 border border-white/10">
            <Sparkles className="w-4 h-4" /> 12,000명의 집사님 선택
          </div>
          <h1 className="font-serif-heading text-3xl sm:text-5xl font-bold mb-4 break-keep">명예의 전당</h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto break-keep mb-8">
            PawTrait을 통해 탄생한 감동적인 순간들을 만나보세요.
          </p>
          <Button
            onClick={() => user ? setIsWriteModalOpen(true) : onOpenLogin()}
            className="flex items-center gap-2 mx-auto bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-brand-500/30 transition-transform hover:scale-105"
          >
            <PenTool className="w-4 h-4" /> 리뷰 작성하기
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {REVIEWS.map((review, idx) => {
            const badge = getUserBadge(review.id);
            const isGuestReview = !!review.password;
            const isMyReview = user && review.userId === user.id;

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="break-inside-avoid bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 relative group"
              >
                {(isGuestReview || isMyReview) && (
                  <button
                    onClick={() => {
                      if (isMyReview) {
                        if (window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
                          deleteReview(review.id, undefined, user.id);
                        }
                      } else {
                        setDeleteTargetId(review.id);
                      }
                    }}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    title="리뷰 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="w-full aspect-[4/5] sm:aspect-[9/16] rounded-xl overflow-hidden mb-4 sm:mb-5 bg-slate-100 shadow-inner group/image relative cursor-pointer">
                  <img
                    src={review.beforeImage}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <img
                    src={review.afterImage}
                    alt="Review Art"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover/image:opacity-0"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity pointer-events-none flex items-center gap-1">
                    <Repeat className="w-3 h-3" /> Original
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <User className="w-4 h-4 sm:w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {maskUserId(review.user)}
                          {!isGuestReview && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badge.className}`}>
                              {badge.text}
                            </span>
                          )}
                        </p>
                        <div className="flex text-yellow-400 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-200 fill-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative pl-4 border-l-2 border-brand-200">
                    <p className="text-slate-700 leading-relaxed text-sm break-keep">
                      {review.text}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-xs text-slate-400">{review.date || '2024.03.10 작성'}</span>
                    <button
                      onClick={() => handleHelpfulClick(review.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-full hover:bg-brand-50"
                    >
                      <ThumbsUp className="w-3 h-3" /> 도움이 돼요 {helpfulCounts[review.id] || 0}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isWriteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsWriteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif-heading font-bold text-slate-900">리뷰 작성하기</h2>
                <button onClick={() => setIsWriteModalOpen(false)} className="p-2 -mr-2 text-slate-400 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleWriteSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    사진 업로드 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="review-image-upload"
                    />
                    <label
                      htmlFor="review-image-upload"
                      className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${reviewImagePreview ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                        } ${errorMsg && !reviewImage ? 'border-red-500 bg-red-50' : ''}`}
                    >
                      {reviewImagePreview ? (
                        <div className="relative w-full h-full p-2">
                          <img src={reviewImagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white text-sm font-bold flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" /> 변경하기
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 text-slate-400">
                            <Plus className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold text-slate-500">사진을 선택해주세요</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-bold text-slate-700">닉네임 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={writeForm.nickname}
                      onChange={e => setWriteForm(prev => ({ ...prev, nickname: e.target.value }))}
                      placeholder="홍길동"
                      className={`w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all ${user ? 'text-slate-500 bg-slate-100 cursor-not-allowed' : ''}`}
                      maxLength={10}
                      readOnly={!!user}
                    />
                  </div>
                  {!user && (
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-bold text-slate-700">비밀번호 <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={writeForm.password}
                        onChange={e => setWriteForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="4자리 숫자"
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all"
                        maxLength={8}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">별점</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setWriteForm(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${star <= writeForm.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'} transition-colors`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">내용 <span className="text-red-500">*</span></label>
                  <textarea
                    value={writeForm.text}
                    onChange={e => setWriteForm(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="작품이 마음에 드셨나요? 후기를 남겨주세요."
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all h-24 resize-none"
                  />
                </div>

                <div
                  onClick={() => setPrivacyAgreed(!privacyAgreed)}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className={`transition-colors ${privacyAgreed ? 'text-brand-500' : 'text-slate-300'}`}>
                    {privacyAgreed ? <CheckSquare className="w-5 h-5 fill-brand-50" /> : <Square className="w-5 h-5" />}
                  </div>
                  <p className={`text-xs font-bold ${privacyAgreed ? 'text-slate-900' : 'text-slate-500'}`}>
                    개인정보 수집 및 이용에 동의합니다. (필수)
                  </p>
                </div>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </motion.div>
                )}

                <Button fullWidth type="submit" className="mt-2 shadow-brand-500/20">
                  리뷰 등록하기
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTargetId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteTargetId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-slate-900">리뷰 삭제</h3>
                <p className="text-slate-500 text-sm mt-1">작성 시 입력한 비밀번호를 입력해주세요.</p>
              </div>

              <form onSubmit={handleDeleteSubmit} className="space-y-4">
                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 outline-none transition-all text-center tracking-widest"
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" fullWidth onClick={() => setDeleteTargetId(null)} className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                    취소
                  </Button>
                  <Button type="submit" fullWidth className="bg-red-500 hover:bg-red-600 shadow-red-500/30">
                    삭제하기
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};