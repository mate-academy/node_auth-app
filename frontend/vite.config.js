import { defineConfig } from 'vite';
import fs from 'fs';
import mkcert from 'vite-plugin-mkcert';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// });

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./certs/server.key'),
      cert: fs.readFileSync('./certs/server.cert'),
    },
    port: 5173,
  },
});

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     https: true,
//   },
// });

// export default defineConfig({
//   plugins: [react(), mkcert()],
//   server: {
//     https: true,
//     port: 5173,
//   },
// });
