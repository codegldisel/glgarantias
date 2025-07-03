import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: { host: true, allowedHosts: ["5173-ijjug1mr1iuqzxnx7p1tp-0a99c777.manusvm.computer"] },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})


