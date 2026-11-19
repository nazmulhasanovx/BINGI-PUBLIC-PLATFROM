// Dates in Dhaka time, Latin digits everywhere (site rule).
export const fmtDate = (iso?: string | null, withTime = true) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}), timeZone: 'Asia/Dhaka' }).format(d)
}
export const fmtNum = (n?: number | null) => (n == null ? '—' : new Intl.NumberFormat('en-US').format(n))
export const ago = (iso?: string | null) => {
  if (!iso) return '—'
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return fmtDate(iso, false)
}
