import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    // Vite 8 (Rolldown) default minifier is Oxc; applied equally to all apps.
    // single chunk so the comparison is apples-to-apples
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
