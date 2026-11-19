import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, MessageCircle, Phone, Search } from 'lucide-react'
import { api, get, patch, post } from '@/lib/api'
import { useLang, type L } from '@/lib/i18n'
import { useLoad } from '@/lib/useLoad'
import { fmtDate } from '@/lib/format'
import { Button, Card, Chip, Drawer, Empty, ErrorBox, Input, ListSkeleton, PageHeader, Select, Tabs, Textarea, useToast } from '@/components/ui'

type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info' | 'brand'
export const leadStatus: Record<string, { l: L; tone: Tone }> = {
  new: { l: { bn: 'নতুন', en: 'New' }, tone: 'brand' },
  contacted: { l: { bn: 'যোগাযোগ হয়েছে', en: 'Contacted' }, tone: 'info' },
  demo_done: { l: { bn: 'ডেমো হয়েছে', en: 'Demo done' }, tone: 'warn' },
  won: { l: { bn: 'গ্রাহক হয়েছে', en: 'Won' }, tone: 'ok' },
  lost: { l: { bn: 'হয়নি', en: 'Lost' }, tone: 'neutral' },
}
type Lead = { id: number; name: string; property: string; phone: string; property_type?: string; rooms?: number; preferred_time?: string; source_page?: string; status: string; created_at: string; notes_count?: number; notes?: { id: number; body: string; created_at: string; user?: { name: string } }[]; assignee?: { name: string } }
type Page = { data: Lead[]; total: number; current_page: number; last_page: number; counts: Record<string, number> }
const wa = (phone: string) => `https://wa.me/${phone.replace(/\D/g, '').replace(/^0/, '880')}`

export default function Leads() {
  const { t } = useLang()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState<string>('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState<number | null>(Number(params.get('open')) || null)
  const list = useLoad(() => get<Page>(`/leads?page=${page}${status !== 'all' ? `&status=${status}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`), [status, q, page])
  const counts = list.data?.counts ?? {}
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const exportCsv = async () => {
    const blob = await api<Blob>(`/leads/export${status !== 'all' ? `?status=${status}` : ''}`, { raw: true })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bingi-leads.csv'; a.click(); URL.revokeObjectURL(a.href)
  }
  return (
    <>
      <PageHeader title={t({ bn: 'লিড', en: 'Leads' })} sub={t({ bn: 'সাইটের "ডেমো বুক করুন" ফর্ম থেকে আসা অনুরোধ।', en: 'Requests from the site\'s "Book a demo" form.' })}
        actions={<Button onClick={exportCsv}><Download className="size-4" />{t({ bn: 'CSV এক্সপোর্ট', en: 'Export CSV' })}</Button>} />
      <Tabs value={status} onChange={(v) => { setStatus(v); setPage(1) }} items={[{ id: 'all', label: `${t({ bn: 'সব', en: 'All' })} · ${total}` }, ...Object.entries(leadStatus).map(([id, s]) => ({ id, label: `${t(s.l)} · ${counts[id] ?? 0}` }))]} />
      <div className="relative mb-4 sm:w-[340px]"><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-soft" /><Input aria-label={t({ bn: 'নাম, প্রপার্টি বা ফোন', en: 'Name, property or phone' })} placeholder={t({ bn: 'নাম, প্রপার্টি বা ফোন…', en: 'Name, property or phone…' })} className="pl-10" defaultValue={q} onKeyDown={(e) => { if (e.key === 'Enter') { setQ((e.target as HTMLInputElement).value); setPage(1) } }} onBlur={(e) => { setQ(e.target.value); setPage(1) }} /></div>
      {list.loading ? <ListSkeleton /> : list.error ? <ErrorBox error={list.error} retry={list.reload} /> : !list.data?.data.length
        ? <Empty title={t({ bn: 'কোনো লিড নেই', en: 'No leads' })} sub={t({ bn: 'নতুন অনুরোধ এলে এখানে দেখাবে।', en: 'New requests show up here.' })} />
        : (
          <>
            <Card className="divide-y divide-line overflow-hidden">
              {list.data.data.map((l) => (
                <button key={l.id} type="button" onClick={() => setOpen(l.id)} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-canvas/60">
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium">{l.name} <span className="font-normal text-soft">· {l.property}</span></span><span className="text-[13px] text-soft">{l.phone} · {fmtDate(l.created_at)}{l.rooms ? ` · ${l.rooms} ${t({ bn: 'রুম', en: 'rooms' })}` : ''}</span></span>
                  {!!l.notes_count && <span className="text-[12px] text-soft">{l.notes_count} {t({ bn: 'নোট', en: 'notes' })}</span>}
                  <Chip tone={leadStatus[l.status]?.tone}>{t(leadStatus[l.status]?.l ?? { bn: l.status, en: l.status })}</Chip>
                </button>
              ))}
            </Card>
            {list.data.last_page > 1 && <div className="mt-4 flex items-center justify-center gap-2"><Button size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t({ bn: 'আগে', en: 'Previous' })}</Button><span className="text-[14px] text-soft">{page} / {list.data.last_page}</span><Button size="sm" disabled={page >= list.data.last_page} onClick={() => setPage(page + 1)}>{t({ bn: 'পরে', en: 'Next' })}</Button></div>}
          </>
        )}
      <LeadDrawer id={open} onClose={() => { setOpen(null); if (params.get('open')) setParams({}) }} onChanged={list.reload} />
    </>
  )
}

function LeadDrawer({ id, onClose, onChanged }: { id: number | null; onClose: () => void; onChanged: () => void }) {
  const { t } = useLang()
  const toast = useToast()
  const q = useLoad(() => (id ? get<{ item: Lead }>(`/leads/${id}`) : Promise.resolve(null)), [id])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => setNote(''), [id])
  const l = q.data?.item
  const setStatus = async (s: string) => { try { await patch(`/leads/${id}`, { status: s }); toast('ok', { bn: 'স্ট্যাটাস বদলানো হয়েছে', en: 'Status updated' }); q.reload(); onChanged() } catch (e) { toast('bad', (e as Error).message) } }
  const addNote = async () => { if (!note.trim()) return; setBusy(true); try { await post(`/leads/${id}/notes`, { body: note }); setNote(''); q.reload(); onChanged() } catch (e) { toast('bad', (e as Error).message) } finally { setBusy(false) } }
  return (
    <Drawer open={!!id} onClose={onClose} title={l ? l.name : t({ bn: 'লিড', en: 'Lead' })}>
      {q.loading ? <ListSkeleton rows={3} /> : q.error ? <ErrorBox error={q.error} retry={q.reload} /> : l && (
        <div className="space-y-5">
          <Card className="p-4">
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-[14px]">
              {([[{ bn: 'প্রপার্টি', en: 'Property' }, l.property], [{ bn: 'ফোন', en: 'Phone' }, l.phone], [{ bn: 'ধরন', en: 'Type' }, l.property_type], [{ bn: 'রুম', en: 'Rooms' }, l.rooms], [{ bn: 'সুবিধার সময়', en: 'Best time' }, l.preferred_time], [{ bn: 'কোন পেজ থেকে', en: 'From page' }, l.source_page], [{ bn: 'কবে', en: 'Received' }, fmtDate(l.created_at)]] as [L, unknown][])
                .filter(([, v]) => v != null && v !== '').map(([k, v]) => <div key={k.en} className="contents"><dt className="text-soft">{t(k)}</dt><dd className="font-medium">{String(v)}</dd></div>)}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${l.phone}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-[14px] font-medium"><Phone className="size-4" />{t({ bn: 'কল', en: 'Call' })}</a>
              <a href={wa(l.phone)} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-4 text-[14px] font-medium text-white"><MessageCircle className="size-4" />WhatsApp</a>
            </div>
          </Card>
          <div><label htmlFor="lead-status" className="mb-1.5 block text-[14px] font-medium">{t({ bn: 'স্ট্যাটাস', en: 'Status' })}</label>
            <Select id="lead-status" value={l.status} onChange={(e) => setStatus(e.target.value)}>{Object.entries(leadStatus).map(([k, s]) => <option key={k} value={k}>{t(s.l)}</option>)}</Select></div>
          <div>
            <p className="mb-2 text-[14px] font-medium">{t({ bn: 'নোট', en: 'Notes' })}</p>
            <Textarea aria-label={t({ bn: 'নতুন নোট', en: 'New note' })} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t({ bn: 'যেমন: রবিবার ডেমো চায়', en: 'e.g. wants a demo on Sunday' })} />
            <div className="mt-2 flex justify-end"><Button size="sm" variant="primary" loading={busy} disabled={!note.trim()} onClick={addNote}>{t({ bn: 'নোট যোগ করুন', en: 'Add note' })}</Button></div>
            <ul className="mt-3 space-y-2">{l.notes?.map((n) => <li key={n.id} className="rounded-[14px] bg-white p-3 text-[14px] shadow-soft"><p className="whitespace-pre-wrap">{n.body}</p><p className="mt-1 text-[12px] text-soft">{n.user?.name} · {fmtDate(n.created_at)}</p></li>)}</ul>
          </div>
        </div>
      )}
    </Drawer>
  )
}
