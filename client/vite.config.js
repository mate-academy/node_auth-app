/**
 * Configuração do Vite.
 *
 * Proxy reverso para o backend Express:
 * - /api/auth/*       → localhost:3000/auth/*
 * - /api/profile/*    → localhost:3000/profile/*
 * - /api/accounting/* → localhost:3000/accounting/*
 *
 * Isso permite que o frontend chame /api/auth/login
 * e o Vite redirecione para o backend automaticamente,
 * evitando problemas de CORS em desenvolvimento.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/auth'),
      },
      '/api/profile': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/profile/, '/profile'),
      },
      '/api/accounting': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/accounting/, '/accounting'),
      },
    },
  },
});
