import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // 모든 네트워크 인터페이스에서 수신
    hmr: {
      port: 5173, // WebSocket 포트 명시
      overlay: true, // 오류 오버레이 활성화
    },
  },
});
