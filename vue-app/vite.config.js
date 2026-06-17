import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // set to e.g. /vue-vs-react/vue/ for GitHub Pages; '/' for local dev
  base: process.env.DEPLOY_BASE || '/',
  plugins: [vue()],
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
