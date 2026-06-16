import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: 'esbuild',
    // single chunk so the comparison is apples-to-apples
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
