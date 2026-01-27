import React from 'react';
import { motion } from 'framer-motion';
import { Download, ShoppingBag, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { GeneratedImage } from '../types';

interface GalleryPageProps {
  items: GeneratedImage[];
  onNavigateToStudio: () => void;
  showToast: (msg: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ items, onNavigateToStudio, showToast }) => {

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast("🖼️ 앨범에 저장되었습니다.");
  };

  const handleOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would route to a detail/order page
    showToast("🚧 액자 제작 페이지로 이동합니다 (준비중)");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif-heading text-3xl font-bold text-secondary-900 mb-2">나만의 갤러리</h1>
          <p className="text-slate-500">내가 만든 작품들을 감상하고 소장해보세요.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
              >
                <div className="aspect-[9/16] overflow-hidden relative">
                  <img src={item.url} alt="My Art" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                    <button onClick={handleDownload} className="p-2 bg-white rounded-full hover:bg-brand-50 text-slate-900 transition-colors" title="Download">
                      <Download className="w-5 h-5" />
                    </button>
                    <button onClick={handleOrder} className="p-2 bg-brand-500 rounded-full hover:bg-brand-600 text-white transition-colors" title="Order Frame">
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md line-clamp-1">{item.styleName}</span>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" onClick={handleDownload} className="flex-1 py-2 text-xs flex items-center justify-center gap-1">
                      <Download className="w-3 h-3" /> 저장
                    </Button>
                    <Button onClick={handleOrder} className="flex-1 py-2 text-xs flex items-center justify-center gap-1">
                      <ShoppingBag className="w-3 h-3" /> 액자 제작
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add New Card */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: items.length * 0.1 }}
               onClick={onNavigateToStudio}
               className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center aspect-[9/16] cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 transition-all group min-h-[300px]"
            >
               <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors mb-4">
                 <Plus className="w-8 h-8" />
               </div>
               <span className="font-bold text-slate-600 group-hover:text-brand-600">새로운 작품 만들기</span>
            </motion.div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <ImageIcon className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="font-serif-heading text-2xl font-bold text-slate-900 mb-2">아직 작품이 없어요</h3>
             <p className="text-slate-500 max-w-sm mb-8">
               우리 집 반려동물의 사진으로 첫 번째 명작을 만들어보세요.
             </p>
             <Button onClick={onNavigateToStudio} className="shadow-brand-500/20">
               첫 작품 만들러 가기
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};