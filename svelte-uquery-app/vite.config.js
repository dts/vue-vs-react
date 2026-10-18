import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  // set to e.g. /vue-vs-react/svelte/ for GitHub Pages; '/' for local dev
  base: process.env.DEPLOY_BASE || '/',
  plugins: [svelte()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
