import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, Loader2, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { UserProfile } from '../types';

interface AuthFormProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'RECOVERY'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', nickname: '' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function fetchOrUpsertProfile(userId: string, email: string, metadata: any): Promise<UserProfile> {
    const fallbackUser: UserProfile = {
      id: userId,
      name: metadata?.name || form.name || '사용자',
      nickname: metadata?.nickname || form.nickname || '닉네임',
      email: email,
      credits: 0,
      isAdmin: email === 'pkmshopify@gmail.com'
    };

    try {
      // 1. 기존 프로필 조회
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (profile) {
        return {
          id: profile.id,
          name: profile.name,
          nickname: profile.nickname,
          email: profile.email,
          credits: profile.credits,
          isAdmin: profile.is_admin === true
        };
      }

      // 2. 프로필이 없으면 생성
      const { data: newProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          name: fallbackUser.name,
          nickname: fallbackUser.nickname,
          credits: 0,
          is_admin: fallbackUser.isAdmin
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      return {
        id: newProfile.id,
        name: newProfile.name,
        nickname: newProfile.nickname,
        email: newProfile.email,
        credits: newProfile.credits,
        isAdmin: newProfile.is_admin === true
      };
    } catch (err: any) {
      console.error("Profile Management Error:", err);
      // DB 에러 시에도 앱 이용은 가능하게 Fallback 반환
      return fallbackUser;
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();

    setErrorMsg(null);
    setLoading(true);

    try {
      if (authMode === 'RECOVERY') {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: window.location.origin, // Just redirect to home, they will be logged in
        });

        if (error) throw error;

        alert("비밀번호 재설정 이메일이 발송되었습니다.\n메일함을 확인해주세요.");
        setAuthMode('LOGIN');
        return;
      }

      if (authMode === 'SIGNUP') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              name: form.name,
              nickname: form.nickname
            }
          }
        });

        if (error) {
          if (error.status === 422) throw new Error("이미 가입된 이메일입니다.");
          throw error;
        }

        if (data.user) {
          const profile = await fetchOrUpsertProfile(data.user.id, data.user.email!, data.user.user_metadata);
          onLoginSuccess(profile);
        }

      } else {
        console.log("[AuthDebug] SignIn sending...");
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        console.log("[AuthDebug] SignIn response:", { user: data.user?.id, error });

        if (error) throw error;

        if (data.user) {
          const profile = await fetchOrUpsertProfile(data.user.id, data.user.email!, data.user.user_metadata);
          onLoginSuccess(profile);
        }
      }
    } catch (err: any) {
      console.error("[AuthDebug] Error:", err);
      let message = err.message || "오류가 발생했습니다.";

      // Translate common Supabase auth errors
      if (message.includes("Invalid login credentials")) {
        message = "아이디 또는 비밀번호가 일치하지 않습니다.";
      } else if (message.includes("Email not confirmed")) {
        message = "이메일 인증이 완료되지 않았습니다.";
      } else if (message.includes("User already registered")) {
        message = "이미 가입된 이메일입니다.";
      }

      setErrorMsg(message);
    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="flex border-b border-slate-100">
        <button
          type="button"
          onClick={() => { setAuthMode('LOGIN'); setErrorMsg(null); }}
          className={`flex-1 py-4 font-bold text-sm transition-colors ${authMode === 'LOGIN' ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('SIGNUP'); setErrorMsg(null); }}
          className={`flex-1 py-4 font-bold text-sm transition-colors ${authMode === 'SIGNUP' ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          회원가입
        </button>
      </div>

      {authMode === 'RECOVERY' && (
        <div className="px-8 pt-8 pb-0 text-center animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-lg font-bold text-slate-900 mb-2">비밀번호 찾기</h3>
          <p className="text-xs text-slate-500 break-keep">가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
        </div>
      )}

      <div className={authMode === 'RECOVERY' ? "p-8 pt-6" : "p-8"}>
        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'SIGNUP' && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="성함"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
                required
              />
              <input
                type="text"
                placeholder="닉네임"
                value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
                required
              />
            </div>
          )}
          <input
            type="email"
            placeholder="이메일"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
            required
          />
          {authMode !== 'RECOVERY' && (
            <input
              type="password"
              placeholder="비밀번호 (6자리 숫자)"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
              required
            />
          )}

          <Button fullWidth disabled={loading} type="submit" className="py-4 shadow-brand-500/20 mt-4">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (authMode === 'LOGIN' ? '로그인하기' : authMode === 'SIGNUP' ? '회원가입하기' : '비밀번호 재설정 메일 보내기')}
          </Button>
        </form>

        {authMode === 'LOGIN' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setAuthMode('RECOVERY'); setErrorMsg(null); }}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        )}

        {authMode === 'RECOVERY' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setAuthMode('LOGIN'); setErrorMsg(null); }}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              로그인으로 돌아가기
            </button>
          </div>
        )}

        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs flex items-start gap-3 border border-red-100"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold mb-1">문제가 발생했습니다</p>
                <p className="leading-relaxed">{errorMsg}</p>
                {errorMsg.includes("가입된") && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('LOGIN'); setErrorMsg(null); }}
                    className="mt-2 text-brand-600 font-bold underline"
                  >
                    로그인 화면으로 이동
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};