import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: { host: true, allowedHosts: ["5173-i605pg3tztje4cg8uwa7z-9d6f94a5.manusvm.computer"] },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})


