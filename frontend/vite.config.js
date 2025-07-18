import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: true,
    allowedHosts: ["5173-i58bzscngc4bdgvffipvo-abba0bc2.manusvm.computer", "5174-ichdb6suyrul82zykjofz-abba0bc2.manusvm.computer"],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        headers: {
          Host: 'localhost:3000',
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})








