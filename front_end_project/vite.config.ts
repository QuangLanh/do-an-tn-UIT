import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/domains': path.resolve(__dirname, './src/domains'),
      '@/ui': path.resolve(__dirname, './src/ui'),
      '@/infra': path.resolve(__dirname, './src/infra'),
      '@/store': path.resolve(__dirname, './src/store'),
    },
  },
})

