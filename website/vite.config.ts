import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build`          → normal production build (BrowserRouter, for technology.bingi.com.bd)
// `npm run build:preview`  → one self-contained HTML file (HashRouter) for quick review
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: mode === 'single' ? { outDir: 'dist-preview' } : {},
}))
