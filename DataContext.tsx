import React, { createContext, useState, useContext, useEffect } from 'react';
import { ART_STYLES, REVIEWS as DEFAULT_REVIEWS } from './constants';
import { StyleOption, Review } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface DataContextType {
  styles: StyleOption[];
  reviews: Review[];
  isLoading: boolean;
  updateStyles: (styles: StyleOption[]) => void;
  updateReviews: (reviews: Review[]) => void;
  addReview: (review: Omit<Review, 'id'>) => Promise<void>;
  deleteReview: (id: string | number, password?: string, currentUserId?: string) => Promise<boolean>;
  refreshReviews: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  styles: ART_STYLES,
  reviews: [],
  isLoading: true,
  updateStyles: () => { },
  updateReviews: () => { },
  addReview: async () => { },
  deleteReview: async () => false,
  refreshReviews: async () => { },
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [styles, setStyles] = useState<StyleOption[]>(ART_STYLES);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    // 로딩 시작
    setIsLoading(true);

    // 기본 더미 데이터
    let combinedReviews: Review[] = [...DEFAULT_REVIEWS];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const dbReviews: Review[] = data.map((d: any) => ({
            id: d.id, // UUID string
            user: d.user_nickname,
            rating: d.rating,
            text: d.text,
            beforeImage: d.before_image_url,
            afterImage: d.after_image_url,
            password: d.password,
            date: new Date(d.created_at).toLocaleDateString('ko-KR'),
            userId: d.user_id
          }));
          // DB 데이터를 앞에 배치 (최신순)
          combinedReviews = [...dbReviews, ...DEFAULT_REVIEWS];
        }
      } catch (err) {
        console.warn("DB 데이터 로드 실패: 기본 데이터만 사용합니다.");
      }
    }

    setReviews(combinedReviews);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const addReview = async (newReviewData: any) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_nickname: newReviewData.user,
          rating: newReviewData.rating,
          text: newReviewData.text,
          before_image_url: newReviewData.beforeImage,
          after_image_url: newReviewData.afterImage,
          password: newReviewData.password,
          user_id: newReviewData.userId
        }]);

      if (!error) await fetchReviews();
    } catch (err) {
      console.error("Review Insert Error:", err);
    }
  };

  const deleteReview = async (id: string | number, password?: string, currentUserId?: string): Promise<boolean> => {
    // 더미 데이터 삭제 시도 (ID가 number인 경우)
    if (typeof id === 'number') {
      alert("기본 전시 리뷰는 삭제할 수 없습니다.");
      return false;
    }

    try {
      const { data: target } = await supabase.from('reviews').select('password, user_id').eq('id', id).single();

      if (!target) return false;

      // 1. Check User Ownership
      if (currentUserId && target.user_id === currentUserId) {
        // Owner can delete, proceed below
      }
      // 2. Check Password (for guest or legacy)
      else if (!target.password || target.password !== password) {
        return false;
      }

      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (!error) {
        await fetchReviews();
        return true;
      }
    } catch (err) {
      console.error("Review Delete Error:", err);
    }
    return false;
  };

  return (
    <DataContext.Provider value={{
      styles,
      reviews,
      isLoading,
      updateStyles: setStyles,
      updateReviews: setReviews,
      addReview,
      deleteReview,
      refreshReviews: fetchReviews
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);