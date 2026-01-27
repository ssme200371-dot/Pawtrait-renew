import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // 개별 속성 정의를 통해 브라우저 호환성 및 안정성 확보
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ''),
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.KAKAO_API_KEY': JSON.stringify(env.KAKAO_API_KEY || ''),
      // 하위 호환성을 위해 객체 전체도 유지
      'process.env': env
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
            genai: ['@google/genai']
          }
        }
      }
    }
  };
});