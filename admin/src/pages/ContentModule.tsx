import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { ApiError, del, get, patch, post } from '@/lib/api'
import { useLang } from '@/lib/i18n'
import type { Module } from '@/lib/modules'
import { emptyData, entryTitle, typeDef, type Entry, type TypeDef } from '@/lib/registry'
import { useLoad } from '@/lib/useLoad'
import { fmtDate } from '@/lib/format'
import { EntryForm } from '@/components/form/EntryForm'
import type { Errors } from '@/components/form/FieldInput'
import { Button, Card, Chip, Drawer, Empty, ErrorBox, IconButton, Input, ListSkeleton, PageHeader, StateChip, Tabs, useConfirm, useToast } from '@/components/ui'

/** Any content module: one tab per content type it edits (lib/modules.ts → types). */
export default function ContentModule({ mod }: { mod: Module }) {
  const { t } = useLang()
  const types = mod.types!.map(typeDef)
  const [tab, setTab] = useState(types[0].type)
  const counts = useLoad(() => get<{ types: TypeDef[] }>('/types'), [mod.id])
  useEffect(() => setTab(types[0].type), [mod.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const current = types.find((x) => x.type === tab) ?? types[0]
  const badge = (type: string) => counts.data?.types.find((x) => x.type === type)?.unpublished
  return (
    <>
      <PageHeader title={t(mod.label)} sub={mod.hint ? t(mod.hint) : t({ bn: 'বদল draft হিসেবে জমা হয়; Publish দিলে সাইটে যায়।', en: 'Changes are saved as drafts and reach the site when published.' })} />
      {types.length > 1 && <Tabs items={types.map((x) => ({ id: x.type, label: t(x.label), badge: badge(x.type) }))} value={current.type} onChange={setTab} />}
      {current.kind === 'single' ? <SingleEditor key={current.type} type={current} onSaved={counts.reload} /> : <CollectionEditor key={current.type} type={current} onSaved={counts.reload} />}
    </>
  )
}

function useSave(type: TypeDef, onSaved: () => void) {
  const { t } = useLang()
  const toast = useToast()
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const save = async (id: number | null, data: Record<string, unknown>, visible: boolean): Promise<Entry | null> => {
    setSaving(true); setErrors({})
    try {
      const r = id ? await patch<{ item: Entry }>(`/entries/${type.type}/${id}`, { data, visible }) : await post<{ item: Entry }>(`/entries/${type.type}`, { data, visible })
      toast('ok', { bn: 'সেভ হয়েছে · পাবলিশ বাকি', en: 'Saved · not published yet' })
      onSaved()
      return r.item
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.fields).length) { setErrors(e.fields); toast('bad', { bn: 'কিছু ঘর ঠিক করতে হবে', en: 'Some fields need attention' }) } else toast('bad', (e as Error).message)
      return null
    } finally { setSaving(false) }
  }
  return { save, errors, setErrors, saving, t }
}

function SingleEditor({ type, onSaved }: { type: TypeDef; onSaved: () => void }) {
  const q = useLoad(() => get<{ items: Entry[] }>(`/entries/${type.type}`), [type.type])
  const { save, errors, saving, t } = useSave(type, onSaved)
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const item = q.data?.items[0] ?? null
  useEffect(() => { if (q.data) setData(item?.data ?? emptyData(type)) }, [q.data]) // eslint-disable-line react-hooks/exhaustive-deps
  if (q.loading || !data) return q.error ? <ErrorBox error={q.error} retry={q.reload} /> : <ListSkeleton rows={4} />
  return (
    <Card className="p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold">{t(type.label)}</h2>
        {item && <StateChip state={item.state} />}
      </div>
      <EntryForm t={type} data={data} onChange={setData} errors={errors} />
      <div className="mt-6 flex justify-end"><Button variant="primary" loading={saving} onClick={async () => { const r = await save(item?.id ?? null, data, true); if (r) q.reload() }}>{t({ bn: 'সেভ করুন', en: 'Save' })}</Button></div>
    </Card>
  )
}

function CollectionEditor({ type, onSaved }: { type: TypeDef; onSaved: () => void }) {
  const { t } = useLang()
  const toast = useToast()
  const confirm = useConfirm()
  const q = useLoad(() => get<{ items: Entry[] }>(`/entries/${type.type}`), [type.type])
  const [edit, setEdit] = useState<{ id: number | null; data: Record<string, unknown>; visible: boolean } | null>(null)
  const [filter, setFilter] = useState('')
  const { save, errors, setErrors, saving } = useSave(type, onSaved)
  const items = q.data?.items ?? []
  const shown = useMemo(() => (filter ? items.filter((i) => JSON.stringify(i.data).toLowerCase().includes(filter.toLowerCase())) : items), [items, filter])

  const reorder = async (i: number, d: number) => {
    const ids = items.map((x) => x.id); const [x] = ids.splice(i, 1); ids.splice(i + d, 0, x)
    q.setData({ items: ids.map((id) => items.find((it) => it.id === id)!) })
    try { await post(`/entries/${type.type}/reorder`, { ids }); onSaved() } catch (e) { toast('bad', (e as Error).message); q.reload() }
  }
  const toggle = async (it: Entry) => {
    try { await patch(`/entries/${type.type}/${it.id}`, { visible: !it.visible }); q.reload(); onSaved() } catch (e) { toast('bad', (e as Error).message) }
  }
  const remove = async (it: Entry) => {
    if (!(await confirm({ title: t({ bn: 'মুছে ফেলবেন?', en: 'Delete this?' }), body: t({ bn: 'পরের Publish-এ সাইট থেকে সরে যাবে।', en: 'It leaves the site at the next publish.' }), ok: t({ bn: 'মুছুন', en: 'Delete' }), danger: true }))) return
    try { await del(`/entries/${type.type}/${it.id}`); toast('ok', { bn: 'মুছে ফেলা হয়েছে', en: 'Deleted' }); q.reload(); onSaved() } catch (e) { toast('bad', (e as Error).message) }
  }
  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-[320px]"><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-soft" /><Input aria-label={t({ bn: 'খুঁজুন', en: 'Search' })} placeholder={t({ bn: 'খুঁজুন…', en: 'Search…' })} className="pl-10" value={filter} onChange={(e) => setFilter(e.target.value)} /></div>
        <Button variant="primary" onClick={() => { setErrors({}); setEdit({ id: null, data: emptyData(type), visible: true }) }}><Plus className="size-4" />{t({ bn: 'নতুন যোগ করুন', en: 'Add new' })}</Button>
      </div>
      {q.loading ? <ListSkeleton /> : q.error ? <ErrorBox error={q.error} retry={q.reload} /> : !items.length
        ? <Empty title={t({ bn: 'এখনো কিছু নেই', en: 'Nothing here yet' })} sub={t({ bn: 'প্রথমটা যোগ করুন। খালি থাকলে সাইটে এই অংশ দেখাবে না বা কোডের লেখা থাকবে।', en: 'Add the first one. While empty, the site hides this part or keeps the text written in code.' })} />
        : !shown.length ? <Empty title={t({ bn: 'কিছু মেলেনি', en: 'No match' })} />
        : (
          <Card className="divide-y divide-line overflow-hidden">
            {shown.map((it) => {
              const i = items.indexOf(it)
              return (
                <div key={it.id} className={`flex items-center gap-3 px-4 py-3 ${it.visible ? '' : 'bg-canvas/60'}`}>
                  <button type="button" onClick={() => { setErrors({}); setEdit({ id: it.id, data: it.data, visible: it.visible }) }} className="min-w-0 flex-1 cursor-pointer text-left">
                    <span className={`block truncate text-[15px] font-medium ${it.visible ? '' : 'text-soft line-through'}`}>{entryTitle(type, it.data, t)}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-soft">{typeof it.data.status === 'string' && <SiteStatus s={it.data.status} />}<StateChip state={it.state} />{!it.visible && <span>{t({ bn: 'লুকানো', en: 'Hidden' })}</span>}<span>{fmtDate(it.updated_at)}</span></span>
                  </button>
                  <div className="flex shrink-0 items-center">
                    {!filter && <><IconButton label={t({ bn: 'উপরে', en: 'Move up' })} disabled={i === 0} onClick={() => reorder(i, -1)}><ArrowUp className="size-4" /></IconButton>
                      <IconButton label={t({ bn: 'নিচে', en: 'Move down' })} disabled={i === items.length - 1} onClick={() => reorder(i, 1)}><ArrowDown className="size-4" /></IconButton></>}
                    <IconButton label={it.visible ? t({ bn: 'লুকান', en: 'Hide' }) : t({ bn: 'দেখান', en: 'Show' })} onClick={() => toggle(it)}>{it.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</IconButton>
                    <IconButton label={t({ bn: 'এডিট', en: 'Edit' })} onClick={() => { setErrors({}); setEdit({ id: it.id, data: it.data, visible: it.visible }) }}><Pencil className="size-4" /></IconButton>
                    <IconButton label={t({ bn: 'মুছুন', en: 'Delete' })} onClick={() => remove(it)} className="text-bad"><Trash2 className="size-4" /></IconButton>
                  </div>
                </div>
              )
            })}
          </Card>
        )}
      <Drawer open={!!edit} onClose={() => setEdit(null)} wide={type.fields.some((f) => ['blocks', 'list', 'json'].includes(f.type))}
        title={edit?.id ? `${t({ bn: 'এডিট', en: 'Edit' })} · ${t(type.label)}` : `${t({ bn: 'নতুন', en: 'New' })} · ${t(type.label)}`}
        footer={<><Button onClick={() => setEdit(null)}>{t({ bn: 'বাতিল', en: 'Cancel' })}</Button><Button variant="primary" loading={saving} onClick={async () => { if (!edit) return; const r = await save(edit.id, edit.data, edit.visible); if (r) { setEdit(null); q.reload() } }}>{t({ bn: 'সেভ করুন', en: 'Save' })}</Button></>}>
        {edit && <EntryForm t={type} data={edit.data} onChange={(d) => setEdit({ ...edit, data: d })} errors={errors} />}
      </Drawer>
    </>
  )
}

/** The status shown ON THE SITE (Live / Beta / Coming Soon…) — separate from publish state. */
function SiteStatus({ s }: { s: string }) {
  const { t } = useLang()
  const m: Record<string, [string, 'ok' | 'info' | 'warn' | 'neutral']> = { live: ['Live', 'ok'], beta: ['Beta', 'info'], soon: ['Coming Soon', 'warn'], confirm: ['Status to confirm', 'neutral'], testing: ['Testing', 'info'] }
  const [label, tone] = m[s] ?? [s, 'neutral']
  return <Chip tone={tone}>{t({ bn: 'সাইটে', en: 'On site' })}: {label}</Chip>
}
