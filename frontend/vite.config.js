import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://chat-app-1-ci2r.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
