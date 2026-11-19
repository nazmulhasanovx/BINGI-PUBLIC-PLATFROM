// Published content from the admin (api → GET /public/content → scripts/fetch-content.mjs → generated/content.json).
// No file (local dev, API down, first deploy) → every data file falls back to the values written in it.
const files = import.meta.glob('./generated/content.json', { eager: true, import: 'default' }) as Record<string, Record<string, unknown>>
export const published: Record<string, unknown> = Object.values(files)[0] ?? {}

/** The published value for a key, or the fallback written in code. Arrays/objects replace the fallback whole. */
export function pick<T>(key: string, fallback: T): T {
  const v = published[key]
  return (v === undefined || v === null ? fallback : v) as T
}

/** Snapshot meta: version + when, shown nowhere public but handy for debugging (window.__BINGI_CONTENT__). */
export const contentVersion = (published.meta as { version?: number; publishedAt?: string } | undefined) ?? null
