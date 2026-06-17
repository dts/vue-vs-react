import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // set to e.g. /vue-vs-react/react/ for GitHub Pages; '/' for local dev
  base: process.env.DEPLOY_BASE || '/',
  plugins: [react()],
  build: {
    sourcemap: true,
    // Vite 8 (Rolldown) default minifier is Oxc; applied equally to all apps.
    // single chunk so the comparison is apples-to-apples
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
