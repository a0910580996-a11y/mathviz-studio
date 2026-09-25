import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          plotly: ['react-plotly.js', 'plotly.js-dist-min'],
        },
      },
    },
  },
})
