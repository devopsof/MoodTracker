import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Ignore framer-motion globalThis config issue
        if (id.includes('globalThis-config.mjs')) {
          return false
        }
      },
      output: {
        manualChunks: undefined
      }
    }
  }
})
