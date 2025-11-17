import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/linh-vuc': path.resolve(__dirname, './src/linh-vuc'),
      '@/giao-dien': path.resolve(__dirname, './src/giao-dien'),
      '@/ha-tang': path.resolve(__dirname, './src/ha-tang'),
      '@/kho-trang-thai': path.resolve(__dirname, './src/kho-trang-thai'),
      '@/dinh-tuyen': path.resolve(__dirname, './src/dinh-tuyen'),
    },
  },
})

