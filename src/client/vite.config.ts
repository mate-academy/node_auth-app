import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const DEFAULT_CLIENT_PORT = 3000;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const clientPort = Number(env.VITE_CLIENT_PORT) || DEFAULT_CLIENT_PORT;

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.ts',
    },
    server: {
      port: clientPort,
    },
    preview: {
      port: clientPort,
    },
  };
});
