import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for HabitTwin Frontend
// Proxies /api requests directly to the local Python FastAPI backend on port 8000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
