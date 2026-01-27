import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sparkles, Plus, Menu, X, LogOut, User, LogIn, Bell, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export type NavTab = 'STUDIO' | 'GALLERY' | 'REVIEWS' | 'MEMBERSHIP' | 'ADMIN';

interface NavbarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  credits: number;
  onOpenShop: () => void;
  onStart: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onOpenLogin: () => void; 
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate, credits, onOpenShop, onStart, user, onLogout, onOpenLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const userRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 관리자 카운트 폴링
  useEffect(() => {
    if (!user?.isAdmin || !isSupabaseConfigured) return;

    const fetchPendingCount = async () => {
      try {
        const { count, error } = await supabase
          .from('payment_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'PENDING');
        
        if (!error && count !== null) {
          setPendingCount(count);
        }
      } catch (e) {}
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const navItems = useMemo(() => {
    const items = [
      { id: 'STUDIO' as NavTab, label: '스튜디오' },
      { id: 'GALLERY' as NavTab, label: '갤러리' },
      { id: 'REVIEWS' as NavTab, label: '이용후기' },
      { id: 'MEMBERSHIP' as NavTab, label: '멤버십' },
    ];
    if (user?.isAdmin) {
      items.push({ id: 'ADMIN' as NavTab, label: 'ADMIN' });
    }
    return items;
  }, [user]);

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('STUDIO')}>
              <div className="bg-gradient-to-br from-brand-500 to-amber-600 p-2 rounded-xl text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-serif-heading font-bold text-xl sm:text-2xl text-secondary-900 tracking-tight">PawTrait</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`text-[15px] font-bold transition-all relative py-1 flex items-center gap-1.5 ${
                    activeTab === item.id ? 'text-brand-600' : 'text-slate-500 hover:text-brand-600'
                  }`}
                >
                  {item.label}
                  {item.id === 'ADMIN' && pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center -mt-3 -mr-2 shadow-sm animate-bounce">
                      {pendingCount}
                    </span>
                  )}
                  {activeTab === item.id && (
                    <motion.span layoutId="underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Right Action */}
            <div className="flex items-center gap-3 sm:gap-5">
              {user ? (
                <div className="flex items-center gap-2 sm:gap-4 relative" ref={userRef}>
                  <div 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer transition-all group shadow-sm active:scale-95"
                  >
                     <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px] font-bold">
                       {user.nickname[0]}
                     </div>
                     <div className="hidden sm:block text-left pr-1">
                       <p className="text-[10px] text-slate-400 font-bold leading-none mb-0.5">{credits} Cr</p>
                       <p className="text-xs font-bold text-slate-700 leading-none">{user.nickname}</p>
                     </div>
                     <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[110]"
                      >
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">My Account</p>
                          <p className="text-sm font-bold text-slate-900 mb-1">{user.nickname}님</p>
                          <div className="flex items-center gap-1.5 text-brand-600 font-bold">
                            <Sparkles className="w-3.5 h-3.5 fill-brand-200" />
                            <span>{credits} Credits</span>
                          </div>
                        </div>
                        <div className="p-2">
                          <button 
                            onClick={() => { onOpenShop(); setIsUserMenuOpen(false); }}
                            className="w-full text-left p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-xl transition-colors flex items-center gap-2.5"
                          >
                            <Plus className="w-4 h-4" /> 크레딧 충전하기
                          </button>
                          <button 
                            onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                            className="w-full text-left p-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2.5"
                          >
                            <LogOut className="w-4 h-4" /> 로그아웃
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button onClick={onOpenLogin} className="py-2.5 px-6 text-sm font-bold rounded-full shadow-brand-500/20 active:scale-95 transition-transform">
                  로그인
                </Button>
              )}
              
              <button className="md:hidden p-2 text-slate-600 active:bg-slate-100 rounded-full" onClick={() => setIsMenuOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="flex justify-between items-center h-16 sm:h-20 px-4 border-b border-slate-100">
               <span className="font-serif-heading font-bold text-xl text-slate-900">메뉴</span>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-slate-500"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex flex-col flex-1 p-6 space-y-6 overflow-y-auto">
              {user && (
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-2">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {user.nickname[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{user.nickname}님</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100">
                      <span className="text-xs font-bold text-slate-500">보유 크레딧</span>
                      <div className="flex items-center gap-1.5 text-brand-600 font-bold">
                        <Sparkles className="w-4 h-4 fill-brand-200" />
                        <span>{credits}</span>
                      </div>
                   </div>
                </div>
              )}

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setIsMenuOpen(false); }}
                  className={`text-2xl font-bold flex items-center justify-between py-3 ${activeTab === item.id ? 'text-brand-600' : 'text-slate-900'}`}
                >
                  {item.label}
                  {item.id === 'ADMIN' && pendingCount > 0 && <span className="bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full">{pendingCount}</span>}
                </button>
              ))}
            </div>

            <div className="p-6 pb-12 border-t border-slate-100 bg-slate-50">
              {user ? (
                 <button 
                  onClick={() => { onLogout(); setIsMenuOpen(false); }}
                  className="w-full py-4.5 bg-white text-red-500 font-bold rounded-2xl shadow-sm border border-red-50 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                 >
                   <LogOut className="w-5 h-5" /> 로그아웃
                 </button>
              ) : (
                <Button fullWidth className="py-4.5" onClick={() => { onOpenLogin(); setIsMenuOpen(false); }}>로그인 / 시작하기</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};