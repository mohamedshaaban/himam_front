import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // GitHub Pages serves a project site from a subpath (/himam_front/), so asset
  // URLs have to be prefixed. Hosts that serve from the domain root — Cloudflare
  // Pages, Netlify, Vercel — leave VITE_BASE unset and get '/'.
  base: process.env.VITE_BASE || '/',

  server: {
    port: 5173,
    // Proxying keeps the browser on a single origin in development, so cookies
    // and CORS behave the same here as they will behind one domain in production.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
