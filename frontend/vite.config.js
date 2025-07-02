import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: { host: true, allowedHosts: ["5173-idc5x65xsujbvc6mmkcws-4dea558c.manusvm.computer", "3000-idc5x65xsujbvc6mmkcws-4dea558c.manusvm.computer"] },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
