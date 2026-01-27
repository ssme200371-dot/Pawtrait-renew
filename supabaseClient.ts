import { createClient } from '@supabase/supabase-js';

// Vercel/Vite에서 주입된 환경 변수 참조
// 초기화 시 에러 방지를 위해 값이 없을 경우 더미 URL/KEY 할당
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const ADMIN_EMAIL = 'pkmshopify@gmail.com';

// 실제 유효한 설정이 있는지 확인하는 플래그
const isValidKey = (key: string) => key && key.startsWith('ey');

if (!isValidKey(supabaseAnonKey) && supabaseAnonKey !== 'placeholder-key') {
  console.warn("⚠️ Warning: VITE_SUPABASE_ANON_KEY does not look like a valid JWT (should start with 'ey'). Check your .env setup.");
}

export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 이제 supabaseUrl이 빈 문자열이 아니므로 초기화 시 에러가 발생하지 않습니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});