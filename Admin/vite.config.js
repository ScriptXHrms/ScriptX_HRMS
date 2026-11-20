import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const api = process.env.API_URL ?? 'http://localhost:5000';

export default defineConfig(({ command }) => ({
  // The backend serves the production build under /admin/.
  base: command === 'build' ? '/admin/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': api,
      '/uploads': api,
    },
  },
}));
