import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Усі запити, що починаються з /api, будуть перенаправлені на бекенд
      '/api': {
        target: 'http://localhost:5700',
        changeOrigin: true,
      },
    },
  },
})
