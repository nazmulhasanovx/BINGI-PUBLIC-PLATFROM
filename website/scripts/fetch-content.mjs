// Build step: download the published content from the site API into src/data/generated/content.json.
//   CONTENT_API=https://api.technology.bingi.com.bd npm run build
// No CONTENT_API → nothing is fetched and the site builds from the values written in src/data/*.ts.
// API unreachable → the build FAILS (so a broken API never silently ships old content), unless CONTENT_OPTIONAL=1.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data/generated/content.json')
const api = process.env.CONTENT_API?.replace(/\/$/, '')
if (!api) {
  if (fs.existsSync(out)) fs.rmSync(out)
  console.log('content: CONTENT_API not set — building from the code values')
  process.exit(0)
}
try {
  const res = await fetch(`${api}/api/v1/public/content`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(json))
  console.log(`content: v${json.meta?.version} (${json.meta?.publishedAt}) from ${api}`)
} catch (e) {
  console.error(`content: could not load ${api} — ${e.message}`)
  if (process.env.CONTENT_OPTIONAL === '1') { if (fs.existsSync(out)) fs.rmSync(out); process.exit(0) }
  process.exit(1)
}
