import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: { host: true, allowedHosts: ["5173-i4lc2ph8itkg6z8t6x70z-b55a47ae.manusvm.computer"] },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
