import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// @preact/preset-vite aliases react / react-dom / react-dom/client / react/jsx-runtime
// to preact/compat, so the React-router + React-query app runs on the Preact runtime.
export default defineConfig({
  // set to e.g. /vue-vs-react/preact/ for GitHub Pages; '/' for local dev
  base: process.env.DEPLOY_BASE || '/',
  plugins: [preact()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
