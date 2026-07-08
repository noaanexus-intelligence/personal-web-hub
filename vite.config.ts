import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA plugin (vite-plugin-pwa) จะเพิ่มใน Phase 2
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
})
