import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
