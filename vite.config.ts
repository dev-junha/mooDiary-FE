// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',     // ← 기본값
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})