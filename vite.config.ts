import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensuring process.env.API_KEY is available in the browser environment
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})