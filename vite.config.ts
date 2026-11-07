import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// `base: './'` keeps asset paths relative so the build works on GitHub Pages or any static host.
export default defineConfig({
  base: './',
  plugins: [vue()],
  // three.js alone is ~600 kB minified; one chunk is fine for a single-page deck.
  build: { chunkSizeWarningLimit: 900 },
})
