// Prerender every public route to static HTML (dist/<route>/index.html) with its own <title>/meta.
// Run after `vite build` and `vite build --ssr`. Pages then paint before JavaScript loads (fast LCP, SEO).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)
const { seo, notFoundSeo } = await import(pathToFileURL(path.join(root, 'dist-ssr/seo.js')).href)
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const SITE = 'https://technology.bingi.com.bd'

// Preload the two fonts every page paints first (headline + body), so text doesn't repaint late.
const fonts = fs.readdirSync(path.join(dist, 'assets'))
  .filter((f) => /^(bricolage-grotesque-latin-opsz-normal|instrument-sans-latin-400-normal).*\.woff2$/.test(f))
const preload = fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join('\n    ')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
function page(url, html, meta) {
  const head = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${SITE}${url === '/' ? '/' : url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="BinGi" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${SITE}${url}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    preload,
  ].join('\n    ')
  return template
    .replace(/<title>[\s\S]*?<\/title>/, head)
    .replace(/<meta name="description"[^>]*>\n?/, '')
    .replace('<div id="root"></div>', `<div id="root" data-ssr="${url === '/404' ? '*' : url}">${html}</div>`)
}

const routes = Object.keys(seo)
for (const url of routes) {
  const html = await render(url)
  const file = url === '/' ? path.join(dist, 'index.html') : path.join(dist, url, 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, page(url, html, seo[url]))
  console.log('prerendered', url, `${(html.length / 1024).toFixed(1)} KB`)
}
fs.writeFileSync(path.join(dist, '404.html'), page('/404', await render('/404'), notFoundSeo))
console.log('prerendered 404.html')
