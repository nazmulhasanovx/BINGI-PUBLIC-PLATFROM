// Prerender every public route to static HTML (dist/<route>/index.html) with its own <title>/meta.
// Run after `vite build` and `vite build --ssr`. Pages then paint before JavaScript loads (fast LCP, SEO).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)
const { seo, notFoundSeo } = await import(pathToFileURL(path.join(root, 'dist-ssr/seo.js')).href)
const { docs, pageToMarkdown, fullMarkdown, llmsIndex } = await import(pathToFileURL(path.join(root, 'dist-ssr/docs.js')).href)
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
    ...(meta.ogImage ? [`<meta property="og:image" content="${esc(meta.ogImage.startsWith('http') ? meta.ogImage : SITE + meta.ogImage)}" />`] : []),
    ...(meta.noindex ? ['<meta name="robots" content="noindex" />'] : []),
    preload,
  ].join('\n    ')
  return template
    .replace(/<title>[\s\S]*?<\/title>/, head)
    .replace(/<meta name="description"[^>]*>\n?/, '')
    .replace('<div id="root"></div>', `<div id="root" data-ssr="${url === '/404' ? '*' : url}">${html}</div>`)
}

// Docs: one page per doc + LLM-ready files (/llms.txt, /llms-full.txt, /docs/<slug>.md)
seo['/docs'] = { title: 'BinGi documentation — modules, ecosystem and troubleshooting', description: 'Everything about BinGi in one place, written so you — or any AI assistant — can fix an issue fast.' }
for (const d of docs) seo[`/docs/${d.slug}`] = { title: `${d.title} — BinGi docs`, description: d.summary }
fs.mkdirSync(path.join(dist, 'docs'), { recursive: true })
for (const d of docs) fs.writeFileSync(path.join(dist, 'docs', `${d.slug}.md`), pageToMarkdown(d))
fs.writeFileSync(path.join(dist, 'llms.txt'), llmsIndex(SITE))
fs.writeFileSync(path.join(dist, 'llms-full.txt'), fullMarkdown(SITE))
console.log('wrote llms.txt, llms-full.txt and', docs.length, 'docs/*.md')

const routes = []
for (const url of Object.keys(seo)) {
  const html = await render(url)
  // An SEO entry for a path the site has no page for (typo in the admin) is skipped, never published as a 404 page.
  if (url !== '/404' && html.includes('data-not-found')) { console.warn('skipped (no such page):', url); continue }
  routes.push(url)
  const file = url === '/' ? path.join(dist, 'index.html') : path.join(dist, url, 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, page(url, html, seo[url]))
  console.log('prerendered', url, `${(html.length / 1024).toFixed(1)} KB`)
}
fs.writeFileSync(path.join(dist, '404.html'), page('/404', await render('/404'), notFoundSeo))
console.log('prerendered 404.html')

// sitemap.xml + robots.txt from the same SEO map (admin → SEO). noindex pages are left out.
const indexable = routes.filter((u) => !seo[u].noindex)
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`)
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n${routes.filter((u) => seo[u].noindex).map((u) => `Disallow: ${u}`).join('\n')}\n\nSitemap: ${SITE}/sitemap.xml\n`.replace(/\n\n\n/, '\n\n'))
console.log('wrote sitemap.xml (', indexable.length, 'urls ) and robots.txt')

// Redirects (admin → SEO → Redirects): Netlify/Cloudflare `_redirects` + an Nginx include.
const { redirects } = await import(pathToFileURL(path.join(root, 'dist-ssr/seo.js')).href)
fs.writeFileSync(path.join(dist, '_redirects'), redirects.map((r) => `${r.from} ${r.to} ${r.code}`).join('\n') + '\n')
fs.writeFileSync(path.join(dist, 'redirects.nginx.conf'), '# include inside the server {} block\n' + redirects.map((r) => `location = ${r.from} { return ${r.code} ${r.to}; }`).join('\n') + '\n')
console.log('wrote', redirects.length, 'redirects')
