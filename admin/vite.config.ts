import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { viteSingleFile } from 'vite-plugin-singlefile'

// The admin shares the site's design tokens (../website/src/styles/bingi-theme.css)
// and the content registry (../packages/content/types.json) — both read at build time.
// `npm run build:demo` → one HTML file with an in-browser mock API (src/lib/mock.ts) for review without a server
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'demo' ? [viteSingleFile()] : [])],
  base: mode === 'demo' ? './' : '/',
  build: mode === 'demo' ? { outDir: 'dist-demo' } : {},
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5174, fs: { allow: ['..'] } },
  test: { environment: 'jsdom', globals: true },
}))
