// DEMO MODE ONLY (`npm run build:demo`): an in-browser stand-in for the site API, so the admin can be
// clicked through without a server. Starts from the real seed (packages/content/seed). Nothing leaves the browser.
import { registry } from './registry'
import { ApiError } from './api'

const seeds = import.meta.glob('../../../packages/content/seed/*.json', { eager: true, import: 'default' }) as Record<string, unknown>
type E = { id: number; type: string; data: Record<string, unknown>; published: Record<string, unknown> | null; visible: boolean; pubVisible: boolean | null; sort: number; deleted?: boolean; updated_at: string }
const now = () => new Date().toISOString()
let id = 1
const entries: E[] = []
for (const t of registry.types) {
  const list = (seeds[`../../../packages/content/seed/${t.type}.json`] as Record<string, unknown>[] | undefined) ?? []
  list.forEach((d, i) => entries.push({ id: id++, type: t.type, data: d, published: d, visible: true, pubVisible: true, sort: i, updated_at: now() }))
}
type Seo = { id: number; path: string; title: string; description: string; og_image?: string | null; noindex?: boolean }
const seo: Seo[] = ((seeds['../../../packages/content/seed/_seo.json'] as Seo[]) ?? []).map((p, i) => ({ ...p, id: i + 1 }))
let seoLive = JSON.stringify(seo)
const redirects: { id: number; from_path: string; to_path: string; code: number }[] = []
let redirLive = '[]'
const snaps = [{ id: 1, version: 1, note: 'Initial content from the website code', rolled_back_from: null as number | null, published_at: now(), published_by: 'Demo owner', build_status: 'none' }]
const users = [{ id: 1, name: 'Demo owner', email: 'demo@bingi.local', role: 'owner', active: true, last_login_at: now() }]
const audit: { id: number; action: string; entity: string; at: string; user: { name: string } }[] = []
const leads = [
  { id: 1, name: 'Sample lead (demo)', property: 'Sample Guest House', phone: '01700000000', property_type: 'guest', rooms: 12, preferred_time: '3–5 pm', source_page: '/pricing', status: 'new', created_at: now(), notes: [] as { id: number; body: string; created_at: string; user: { name: string } }[] },
]
const media: { id: number; path: string; original_name: string; mime: string; width: number | null; height: number | null; bytes: number; variants: Record<string, string> | null }[] = []
const log = (action: string, entity: string) => audit.unshift({ id: audit.length + 1, action, entity, at: now(), user: { name: 'Demo owner' } })
const state = (e: E) => (e.published === null ? 'draft' : JSON.stringify(e.published) === JSON.stringify(e.data) && e.pubVisible === e.visible ? 'published' : 'changed')
const out = (e: E) => ({ id: e.id, type: e.type, data: e.data, visible: e.visible, sort: e.sort, state: state(e), updated_at: e.updated_at })
const typeOf = (t: string) => registry.types.find((x) => x.type === t) ?? (() => { throw new ApiError('unknown_type', 'Unknown type', 404) })()

/** The same truth guards as the API (api/app/Content/Validator.php), so the demo behaves honestly. */
function guard(type: string, d: Record<string, unknown>, visible: boolean) {
  const t = typeOf(type); const g = t.guards ?? []; const f: Record<string, string> = {}
  for (const fd of t.fields) if (fd.required && (d[fd.name] == null || d[fd.name] === '' || (typeof d[fd.name] === 'object' && 'bn' in (d[fd.name] as object) && (!(d[fd.name] as { bn: string }).bn || !(d[fd.name] as { en: string }).en)))) f[fd.name] = fd.type === 'l' || fd.type === 'lt' ? 'Write both Bangla and English.' : 'Required.'
  const verified = d.verified_by && d.verified_at
  if (g.includes('verified_live') && d.status === 'live' && !verified) f.verified_by = 'Live needs who verified it and when.'
  if (g.includes('ai_not_live') && d.id === 'ai' && d.status === 'live') f.status = 'BinGi AI can only be Beta or Coming Soon.'
  if (g.includes('permission') && visible && !d.permission_file) f.permission_file = 'Upload the written permission before showing this.'
  if (g.includes('source') && !d.source) f.source = 'Say where this fact comes from.'
  if (Object.keys(f).length) throw new ApiError('validation_failed', 'Some fields need attention.', 422, f)
}

function pending() {
  const items = entries.filter((e) => e.deleted || state(e) !== 'published').map((e) => {
    const t = typeOf(e.type); const v = t.titleField ? (e.data[t.titleField] ?? e.published?.[t.titleField]) : null
    return { id: e.id, type: e.type, type_label: t.label, title: typeof v === 'object' && v ? (v as { en: string }).en : String(v ?? t.label.en),
      change: e.deleted ? 'deleted' : e.published === null ? 'new' : 'edited', before: e.published, after: e.deleted ? null : e.data, updated_at: e.updated_at }
  })
  if (JSON.stringify(seo) !== seoLive) items.push({ id: 0, type: 'seo', type_label: { bn: 'SEO', en: 'SEO' }, title: 'SEO pages', change: 'edited', before: null, after: null, updated_at: now() })
  if (JSON.stringify(redirects) !== redirLive) items.push({ id: 0, type: 'redirects', type_label: { bn: 'রিডাইরেক্ট', en: 'Redirects' }, title: `${redirects.length} redirects`, change: 'edited', before: null, after: null, updated_at: now() })
  return items
}

export async function mockApi(path: string, method: string, body: unknown, form?: FormData): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 120)) // feel like a network
  const b = (body ?? {}) as Record<string, unknown>
  const [p, qs] = path.split('?'); const q = new URLSearchParams(qs ?? '')
  const m = (re: RegExp) => p.match(re)
  if (p === '/auth/login') return { token: 'demo', user: users[0] }
  if (p === '/auth/me') return { user: users[0] }
  if (p === '/auth/logout' || p === '/auth/password' || p === '/auth/forgot') return { ok: true }
  if (p === '/dashboard') return { visitors_today: 0, views_today: 0, leads_new: leads.filter((l) => l.status === 'new').length, leads_7d: leads.length, unpublished: pending().length, live: { version: snaps[0].version, published_at: snaps[0].published_at, build_status: 'none' }, recent_leads: leads }
  if (p === '/types') return { ...registry, types: registry.types.map((t) => ({ ...t, count: entries.filter((e) => e.type === t.type && !e.deleted).length, unpublished: entries.filter((e) => e.type === t.type && (e.deleted || state(e) !== 'published')).length })) }
  let r
  if ((r = m(/^\/entries\/([a-z_]+)\/reorder$/))) { (b.ids as number[]).forEach((x, i) => { const e = entries.find((y) => y.id === x); if (e) e.sort = i }); log('reordered', `entry:${r[1]}`); return { ok: true } }
  if ((r = m(/^\/entries\/([a-z_]+)\/(\d+)$/))) {
    const e = entries.find((x) => x.id === Number(r![2]))!
    if (method === 'DELETE') { e.deleted = true; log('deleted', `entry:${e.type}:${e.id}`); return { ok: true } }
    const visible = 'visible' in b ? !!b.visible : e.visible; const data = (b.data as Record<string, unknown>) ?? e.data
    guard(e.type, data, visible); e.data = data; e.visible = visible; e.updated_at = now(); log('updated', `entry:${e.type}:${e.id}`); return { item: out(e) }
  }
  if ((r = m(/^\/entries\/([a-z_]+)$/))) {
    const type = r[1]; typeOf(type)
    if (method === 'GET') return { items: entries.filter((e) => e.type === type && !e.deleted).sort((a, c) => a.sort - c.sort).map(out) }
    const visible = b.visible !== false; guard(type, b.data as Record<string, unknown>, visible)
    const e: E = { id: id++, type, data: b.data as Record<string, unknown>, published: null, visible, pubVisible: null, sort: 999, updated_at: now() }
    entries.push(e); log('created', `entry:${type}:${e.id}`); return { item: out(e) }
  }
  if (p === '/media' && method === 'GET') return { data: media }
  if (p === '/media' && form) { const f = form.get('file') as File; const url = URL.createObjectURL(f); const it = { id: media.length + 1, path: url, original_name: f.name, mime: f.type, width: null, height: null, bytes: f.size, variants: f.type.startsWith('image') ? { 480: url } : null }; media.unshift(it); return it }
  if ((r = m(/^\/media\/(\d+)$/))) { media.splice(media.findIndex((x) => x.id === Number(r![1])), 1); return { ok: true } }
  if (p === '/seo/pages' && method === 'GET') return { items: seo.map((s) => ({ ...s, checks: [] })) }
  if ((r = m(/^\/seo\/pages(?:\/(\d+))?$/))) {
    if (method === 'DELETE') { seo.splice(seo.findIndex((x) => x.id === Number(r![1])), 1); return { ok: true } }
    const it = r[1] ? seo.find((x) => x.id === Number(r![1]))! : (seo.push({ id: seo.length + 100, path: '', title: '', description: '' }), seo[seo.length - 1])
    Object.assign(it, b); return { item: it }
  }
  if (p === '/seo/redirects' && method === 'GET') return { items: redirects }
  if (p === '/seo/redirects') { redirects.push({ id: redirects.length + 1, ...(b as { from_path: string; to_path: string; code: number }) }); return { item: redirects.at(-1) } }
  if ((r = m(/^\/seo\/redirects\/(\d+)$/))) { redirects.splice(redirects.findIndex((x) => x.id === Number(r![1])), 1); return { ok: true } }
  if (p === '/publish/pending') return { items: pending(), live: { version: snaps[0].version, published_at: snaps[0].published_at } }
  if (p === '/publish/preview') return { note: 'Demo preview — the real API builds the full snapshot.' }
  if (p === '/publish') {
    for (const e of entries) { e.published = e.data; e.pubVisible = e.visible }
    for (let i = entries.length - 1; i >= 0; i--) if (entries[i].deleted) entries.splice(i, 1)
    seoLive = JSON.stringify(seo); redirLive = JSON.stringify(redirects)
    snaps.unshift({ id: snaps.length + 1, version: snaps[0].version + 1, note: (b.note as string) ?? null, rolled_back_from: null, published_at: now(), published_by: 'Demo owner', build_status: 'none' })
    log('published', `snapshot:${snaps[0].version}`); return { item: snaps[0] }
  }
  if (p === '/snapshots') return { items: snaps }
  if ((r = m(/^\/snapshots\/(\d+)\/rollback$/))) { const o = snaps.find((s) => s.id === Number(r![1]))!; snaps.unshift({ ...o, id: snaps.length + 1, version: snaps[0].version + 1, note: `Rollback to v${o.version}`, rolled_back_from: o.version, published_at: now() }); return { item: snaps[0] } }
  if (p === '/leads') { const s = q.get('status'); const t = q.get('q')?.toLowerCase(); const data = leads.filter((l) => (!s || l.status === s) && (!t || `${l.name} ${l.property} ${l.phone}`.toLowerCase().includes(t))); return { data, total: data.length, current_page: 1, last_page: 1, counts: leads.reduce((a, l) => ({ ...a, [l.status]: (a[l.status] ?? 0) + 1 }), {} as Record<string, number>) } }
  if ((r = m(/^\/leads\/(\d+)\/notes$/))) { const l = leads.find((x) => x.id === Number(r![1]))!; l.notes.unshift({ id: Date.now(), body: b.body as string, created_at: now(), user: { name: 'Demo owner' } }); return { item: l.notes[0] } }
  if ((r = m(/^\/leads\/(\d+)$/))) { const l = leads.find((x) => x.id === Number(r![1]))!; if (method === 'PATCH') Object.assign(l, b); return { item: l } }
  if (p.startsWith('/leads/export')) return new Blob(['﻿Date,Name,Property,Phone,Status\n' + leads.map((l) => `${l.created_at},${l.name},${l.property},${l.phone},${l.status}`).join('\n')], { type: 'text/csv' })
  if (p === '/analytics/overview') return { from: '', to: '', has_data: false, totals: { visitors: 0, views: 0, leads: 0, demo_opens: 0, whatsapp: 0, conversion: null }, series: [], pages: [], sources: [], countries: [], devices: [], lead_pages: [] }
  if (p === '/users' && method === 'GET') return { items: users }
  if (p === '/users') { users.push({ id: users.length + 1, ...(b as { name: string; email: string; role: string }), active: true, last_login_at: '' }); return { item: users.at(-1) } }
  if ((r = m(/^\/users\/(\d+)$/))) { Object.assign(users.find((u) => u.id === Number(r![1]))!, b); return { item: users[0] } }
  if (p === '/audit') return { data: audit, last_page: 1 }
  throw new ApiError('not_found', `Demo: ${method} ${p} is not simulated`, 404)
}
