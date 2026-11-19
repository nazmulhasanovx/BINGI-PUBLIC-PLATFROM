import { useState } from 'react'
import { Download, RotateCcw, Rocket } from 'lucide-react'
import { get, post } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useLang, type L } from '@/lib/i18n'
import { useLoad } from '@/lib/useLoad'
import { fmtDate } from '@/lib/format'
import { Button, Card, Chip, Empty, ErrorBox, Input, ListSkeleton, PageHeader, useConfirm, useToast } from '@/components/ui'

type Pending = { id: number; type: string; type_label: L | null; title: string; change: 'new' | 'edited' | 'hidden' | 'shown' | 'deleted'; before: Record<string, unknown> | null; after: Record<string, unknown> | null; updated_at: string }
type Snap = { id: number; version: number; note: string | null; rolled_back_from: number | null; published_at: string; published_by: string | null; build_status: string }
const changeL: Record<Pending['change'], [L, 'info' | 'warn' | 'bad' | 'neutral' | 'ok']> = {
  new: [{ bn: 'নতুন', en: 'New' }, 'info'], edited: [{ bn: 'বদলানো', en: 'Edited' }, 'warn'], hidden: [{ bn: 'লুকানো হবে', en: 'Will be hidden' }, 'neutral'],
  shown: [{ bn: 'দেখানো হবে', en: 'Will be shown' }, 'ok'], deleted: [{ bn: 'মুছবে', en: 'Will be removed' }, 'bad'],
}
/** Field names whose value changed (top level). */
const changedKeys = (a: Record<string, unknown> | null, b: Record<string, unknown> | null) => Object.keys({ ...a, ...b }).filter((k) => JSON.stringify(a?.[k]) !== JSON.stringify(b?.[k]))
const show = (v: unknown) => (v == null ? '—' : typeof v === 'object' ? ('en' in (v as object) ? `${(v as L).bn} / ${(v as L).en}` : JSON.stringify(v)) : String(v))

export default function Publish() {
  const { t } = useLang()
  const { can } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()
  const pending = useLoad(() => get<{ items: Pending[]; live: { version: number; published_at: string } | null }>('/publish/pending'))
  const history = useLoad(() => get<{ items: Snap[] }>('/snapshots'))
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const items = pending.data?.items ?? []
  const publish = async () => {
    if (!(await confirm({ title: t({ bn: `${items.length}টা বদল সাইটে পাঠাবেন?`, en: `Publish ${items.length} changes to the site?` }), body: t({ bn: 'সাইট নতুন করে build হবে (কয়েক মিনিট)। পরে চাইলে আগের ভার্সনে ফেরা যাবে।', en: 'The site rebuilds (a few minutes). You can roll back later.' }), ok: t({ bn: 'পাবলিশ', en: 'Publish' }) }))) return
    setBusy(true)
    try { const r = await post<{ item: Snap }>('/publish', { note: note || null }); toast('ok', `v${r.item.version} ${t({ bn: 'পাবলিশ হয়েছে', en: 'published' })}${r.item.build_status === 'failed' ? t({ bn: ' — কিন্তু build শুরু হয়নি', en: ' — but the build did not start' }) : ''}`); setNote(''); pending.reload(); history.reload() }
    catch (e) { toast('bad', (e as Error).message) } finally { setBusy(false) }
  }
  const rollback = async (s: Snap) => {
    if (!(await confirm({ title: t({ bn: `v${s.version}-এ ফিরবেন?`, en: `Roll back to v${s.version}?` }), body: t({ bn: 'এটা নতুন ভার্সন হিসেবে পাবলিশ হবে। অ্যাডমিনের draft বদলাবে না।', en: 'It is published as a new version. Drafts in the admin are not changed.' }), ok: t({ bn: 'ফিরুন', en: 'Roll back' }), danger: true }))) return
    try { await post(`/snapshots/${s.id}/rollback`); toast('ok', { bn: 'আগের ভার্সন লাইভ', en: 'Older version is live' }); history.reload() } catch (e) { toast('bad', (e as Error).message) }
  }
  const downloadPreview = async () => {
    const data = await get('/publish/preview')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'content-preview.json'; a.click()
  }
  return (
    <>
      <PageHeader title={t({ bn: 'পাবলিশ ও হিস্টরি', en: 'Publish & history' })}
        sub={pending.data?.live ? `${t({ bn: 'লাইভ', en: 'Live' })}: v${pending.data.live.version} · ${fmtDate(pending.data.live.published_at)}` : t({ bn: 'এখনো কিছু পাবলিশ হয়নি', en: 'Nothing published yet' })}
        actions={<Button onClick={downloadPreview}><Download className="size-4" />{t({ bn: 'Draft JSON', en: 'Draft JSON' })}</Button>} />
      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[17px] font-semibold">{t({ bn: 'পাবলিশ বাকি', en: 'Waiting to publish' })} · {items.length}</h2>
          {can('owner') ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input aria-label={t({ bn: 'নোট (ঐচ্ছিক)', en: 'Note (optional)' })} placeholder={t({ bn: 'কী বদলালেন (ঐচ্ছিক)', en: 'What changed (optional)' })} value={note} onChange={(e) => setNote(e.target.value)} className="sm:w-[260px]" />
              <Button variant="primary" loading={busy} disabled={!items.length} onClick={publish}><Rocket className="size-4" />{t({ bn: 'পাবলিশ', en: 'Publish' })}</Button>
            </div>
          ) : <Chip tone="info">{t({ bn: 'শুধু ওনার পাবলিশ করতে পারেন', en: 'Only an owner can publish' })}</Chip>}
        </div>
        {pending.loading ? <ListSkeleton rows={3} /> : pending.error ? <ErrorBox error={pending.error} retry={pending.reload} /> : !items.length
          ? <p className="py-6 text-center text-[14px] text-soft">{t({ bn: 'সব কিছু লাইভের সাথে মিলে আছে।', en: 'Everything matches the live site.' })}</p>
          : <ul className="divide-y divide-line">{items.map((p) => {
            const keys = p.change === 'edited' ? changedKeys(p.before, p.after) : []
            const [l, tone] = changeL[p.change]
            return (
              <li key={`${p.type}-${p.id}-${p.title}`} className="py-3">
                <div className="flex flex-wrap items-center gap-2"><Chip tone={tone}>{t(l)}</Chip><span className="text-[13px] text-soft">{t(p.type_label)}</span><span className="font-medium">{p.title}</span><span className="ml-auto text-[12px] text-soft">{fmtDate(p.updated_at)}</span></div>
                {keys.length > 0 && <dl className="mt-2 space-y-1 rounded-[12px] bg-canvas px-3 py-2 text-[13px]">{keys.slice(0, 6).map((k) => <div key={k} className="grid grid-cols-[110px_1fr] gap-2"><dt className="text-soft">{k}</dt><dd className="min-w-0 break-words"><del className="text-bad/80">{show(p.before?.[k]).slice(0, 140)}</del> → <ins className="no-underline text-ok">{show(p.after?.[k]).slice(0, 140)}</ins></dd></div>)}</dl>}
              </li>
            )
          })}</ul>}
      </Card>
      <h2 className="mb-3 mt-8 text-[17px] font-semibold">{t({ bn: 'হিস্টরি', en: 'History' })}</h2>
      {history.loading ? <ListSkeleton rows={3} /> : history.error ? <ErrorBox error={history.error} retry={history.reload} /> : !history.data?.items.length ? <Empty title={t({ bn: 'হিস্টরি নেই', en: 'No history' })} /> : (
        <Card className="divide-y divide-line">{history.data.items.map((s, i) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-[14px]">
            <span className="font-semibold tabular-nums">v{s.version}</span>{i === 0 && <Chip tone="ok">{t({ bn: 'লাইভ', en: 'Live' })}</Chip>}
            <span className="min-w-0 flex-1 truncate">{s.note ?? '—'}<span className="text-soft"> · {s.published_by ?? '—'} · {fmtDate(s.published_at)}</span></span>
            {s.build_status === 'failed' && <Chip tone="bad">{t({ bn: 'build শুরু হয়নি', en: 'build did not start' })}</Chip>}
            {can('owner') && i > 0 && <Button size="sm" onClick={() => rollback(s)}><RotateCcw className="size-4" />{t({ bn: 'এটায় ফিরুন', en: 'Roll back' })}</Button>}
          </div>
        ))}</Card>
      )}
    </>
  )
}
