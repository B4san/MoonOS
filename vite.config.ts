import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
  define: {
    'import.meta.env.VITE_BUGSNAG_API_KEY': JSON.stringify(process.env.BUGSNAG_API_KEY || ''),
  },
})
