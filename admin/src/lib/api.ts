// One fetch wrapper for the site API. Errors always arrive as { code, message, fields }.
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000/api/v1'
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) || 'https://technology.bingi.com.bd'

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number, public fields: Record<string, string> = {}) { super(message) }
}

const KEY = 'bingi-admin-token'
export const token = {
  get: () => { if (import.meta.env.MODE === 'demo') return 'demo'; try { return localStorage.getItem(KEY) } catch { return null } },
  set: (t: string | null) => { try { if (t) localStorage.setItem(KEY, t); else localStorage.removeItem(KEY) } catch { /* private mode */ } },
}

let onUnauthorized: () => void = () => {}
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn }

export const DEMO = import.meta.env.MODE === 'demo'

export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown; form?: FormData; raw?: boolean } = {}): Promise<T> {
  if (DEMO) { const { mockApi } = await import('./mock'); return (await mockApi(path, opts.method ?? (opts.body || opts.form ? 'POST' : 'GET'), opts.body, opts.form)) as T }
  const headers: Record<string, string> = { Accept: 'application/json' }
  const t = token.get()
  if (t) headers.Authorization = `Bearer ${t}`
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  let res: Response
  try {
    res = await fetch(API_URL + path, { method: opts.method ?? (opts.body || opts.form ? 'POST' : 'GET'), headers, body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined) })
  } catch {
    throw new ApiError('network', 'Cannot reach the server. Check the internet and try again.', 0)
  }
  if (res.status === 401 && t) { token.set(null); onUnauthorized() }
  if (res.status === 204) return undefined as T
  if (opts.raw && res.ok) return (await res.blob()) as T
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(json?.code ?? `http_${res.status}`, json?.message ?? 'Something went wrong.', res.status, json?.fields ?? {})
  return json as T
}

export const get = <T,>(p: string) => api<T>(p)
export const post = <T,>(p: string, body?: unknown) => api<T>(p, { method: 'POST', body: body ?? {} })
export const patch = <T,>(p: string, body: unknown) => api<T>(p, { method: 'PATCH', body })
export const del = <T,>(p: string) => api<T>(p, { method: 'DELETE' })
