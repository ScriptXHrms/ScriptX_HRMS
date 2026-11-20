import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const api = process.env.API_URL ?? 'https://scriptx-hrms.onrender.com';

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: api,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: api,
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
