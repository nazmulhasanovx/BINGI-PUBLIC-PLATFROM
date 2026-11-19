import { useRef, useState } from 'react'
import { FileText, ImagePlus, Library, X } from 'lucide-react'
import { api, get, SITE_URL } from '@/lib/api'
import { useLang } from '@/lib/i18n'
import { useLoad } from '@/lib/useLoad'
import { Button, Drawer, Empty, ErrorBox, IconButton, Input, ListSkeleton, useToast } from './ui'

export type MediaItem = { id: number; path: string; original_name: string; mime: string; width: number | null; height: number | null; bytes: number; variants: Record<string, string> | null }
/** Paths in content are either full URLs (uploads) or site paths like /team/x.webp (files in website/public). */
export const mediaSrc = (p: string) => (/^https?:/.test(p) ? p : SITE_URL.replace(/\/$/, '') + (p.startsWith('/') ? p : `/${p}`))
const isImage = (p: string) => /\.(webp|png|jpe?g|gif|svg|avif)(\?|$)/i.test(p)

export async function upload(file: File): Promise<MediaItem> {
  const form = new FormData()
  form.append('file', file)
  return api<MediaItem>('/media', { form, method: 'POST' })
}

export function MediaPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useLang()
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [lib, setLib] = useState(false)
  const pick = async (f?: File | null) => {
    if (!f) return
    setBusy(true)
    try { onChange((await upload(f)).path); toast('ok', { bn: 'আপলোড হয়েছে', en: 'Uploaded' }) } catch (e) { toast('bad', (e as Error).message) } finally { setBusy(false) }
  }
  return (
    <div className="space-y-2">
      {value && (
        <div className="flex items-center gap-3 rounded-[14px] border border-line bg-white p-2">
          {isImage(value) ? <img src={mediaSrc(value)} alt="" className="size-16 rounded-[10px] bg-canvas object-cover" /> : <span className="grid size-16 place-items-center rounded-[10px] bg-canvas"><FileText className="size-6 text-soft" /></span>}
          <a href={mediaSrc(value)} target="_blank" rel="noopener" className="min-w-0 flex-1 truncate text-[13px] text-link hover:underline">{value}</a>
          <IconButton label={t({ bn: 'সরান', en: 'Remove' })} onClick={() => onChange('')}><X className="size-4" /></IconButton>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
        <Button size="sm" loading={busy} onClick={() => input.current?.click()}><ImagePlus className="size-4" />{t({ bn: 'আপলোড', en: 'Upload' })}</Button>
        <Button size="sm" onClick={() => setLib(true)}><Library className="size-4" />{t({ bn: 'লাইব্রেরি থেকে', en: 'From library' })}</Button>
      </div>
      <Input aria-label={t({ bn: 'অথবা পাথ/URL লিখুন', en: 'Or type a path / URL' })} placeholder={t({ bn: 'অথবা পাথ লিখুন, যেমন /team/photo.webp', en: 'Or type a path, e.g. /team/photo.webp' })} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 text-[13px]" />
      <LibraryDrawer open={lib} onClose={() => setLib(false)} onPick={(p) => { onChange(p); setLib(false) }} />
    </div>
  )
}

function LibraryDrawer({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (p: string) => void }) {
  const { t } = useLang()
  const q = useLoad(() => (open ? get<{ data: MediaItem[] }>('/media') : Promise.resolve({ data: [] })), [open])
  return (
    <Drawer open={open} onClose={onClose} title={t({ bn: 'মিডিয়া লাইব্রেরি', en: 'Media library' })} wide>
      {q.loading ? <ListSkeleton rows={3} /> : q.error ? <ErrorBox error={q.error} retry={q.reload} /> : !q.data?.data.length
        ? <Empty title={t({ bn: 'এখনো কিছু আপলোড হয়নি', en: 'Nothing uploaded yet' })} />
        : <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">{q.data.data.map((m) => (
          <li key={m.id}><button type="button" onClick={() => onPick(m.path)} className="w-full cursor-pointer overflow-hidden rounded-[14px] border border-line bg-white text-left hover:ring-2 hover:ring-link">
            {m.mime.startsWith('image') ? <img src={m.variants?.['480'] ?? m.path} alt="" className="aspect-[4/3] w-full bg-canvas object-cover" /> : <span className="grid aspect-[4/3] place-items-center bg-canvas"><FileText className="size-8 text-soft" /></span>}
            <span className="block truncate px-2.5 py-2 text-[12px] text-soft">{m.original_name}</span>
          </button></li>))}</ul>}
    </Drawer>
  )
}
