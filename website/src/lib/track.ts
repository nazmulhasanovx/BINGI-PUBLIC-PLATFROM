// Cookie-less visitor events → site API (/api/v1/public/events). No names, phones or IDs are sent.
// VITE_API_URL not set (local dev, preview artifact) → nothing is sent.
type EventType = 'pageview' | 'demo_open' | 'whatsapp' | 'theme_demo' | 'price_slider'
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const queue: { type: EventType; path: string; referrer?: string; utm?: Record<string, string>; lang?: string }[] = []
let timer: ReturnType<typeof setTimeout> | null = null
let utm: Record<string, string> | undefined

function flush() {
  timer = null
  if (!API_URL || !queue.length || typeof navigator === 'undefined') return
  const body = JSON.stringify({ events: queue.splice(0, 20) })
  const url = `${API_URL}/api/v1/public/events`
  // sendBeacon survives page close; fall back to fetch keepalive
  if (!(navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' })))) {
    fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
  }
}

export function track(type: EventType, path = typeof location !== 'undefined' ? location.pathname : '/') {
  if (!API_URL || typeof window === 'undefined') return
  if (utm === undefined) {
    const q = new URLSearchParams(location.search)
    const u = Object.fromEntries(['source', 'medium', 'campaign'].map((k) => [k, q.get(`utm_${k}`) ?? '']).filter(([, v]) => v))
    utm = Object.keys(u).length ? u : undefined
  }
  queue.push({ type, path, referrer: type === 'pageview' ? document.referrer || undefined : undefined, utm: type === 'pageview' ? utm : undefined, lang: document.documentElement.lang === 'en' ? 'en' : 'bn' })
  if (!timer) timer = setTimeout(flush, 1500)
}

if (typeof window !== 'undefined') {
  addEventListener('pagehide', flush)
  // Count WhatsApp clicks anywhere on the site
  addEventListener('click', (e) => {
    const a = (e.target as HTMLElement | null)?.closest?.('a[href*="wa.me"]')
    if (a) track('whatsapp')
  }, { capture: true })
}

/** POST a demo request. Returns false when the API is not configured or unreachable (caller falls back to WhatsApp). */
export async function sendLead(lead: Record<string, unknown>): Promise<{ ok: true } | { ok: false; message?: string; fields?: Record<string, string> }> {
  if (!API_URL) return { ok: false }
  try {
    const res = await fetch(`${API_URL}/api/v1/public/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...lead, source_page: location.pathname, utm, lang: document.documentElement.lang === 'en' ? 'en' : 'bn' }) })
    if (res.ok) return { ok: true }
    const j = await res.json().catch(() => ({}))
    if (res.status === 409) return { ok: true } // already received
    return { ok: false, message: j.message, fields: j.fields }
  } catch { return { ok: false } }
}
