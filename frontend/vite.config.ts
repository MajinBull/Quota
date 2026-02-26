import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,              // Remove source maps (reduce bundle size ~30%)
    chunkSizeWarningLimit: 1000,   // Increase warning limit for large files (JSON data)
    rollupOptions: {
      output: {
        manualChunks: {
          // Code splitting: separate vendor libraries for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'utils': ['date-fns', 'zustand']
        }
      }
    }
  }
})
