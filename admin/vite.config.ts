import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// The admin shares the site's design tokens (../website/src/styles/bingi-theme.css)
// and the content registry (../packages/content/types.json) — both read at build time.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5174, fs: { allow: ['..'] } },
  test: { environment: 'jsdom', globals: true },
})
