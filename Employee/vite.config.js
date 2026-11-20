import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const api = process.env.API_URL ?? 'https://scriptx-hrms.onrender.com';

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: api,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: { '*': '' },
        configure: (proxy) => {
          // Strip Secure flag from Set-Cookie so cookies work on http://localhost
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              proxyRes.headers['set-cookie'] = setCookie.map((c) =>
                c.replace(/;\s*Secure/gi, '').replace(/;\s*SameSite=None/gi, '; SameSite=Lax'),
              );
            }
          });
        },
      },
      '/uploads': {
        target: api,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: { '*': '' },
      },
    },
  },
}));
