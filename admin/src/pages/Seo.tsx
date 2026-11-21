import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ApiError, del, get, patch, post, SITE_URL } from '@/lib/api'
import { useLang } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { useLoad } from '@/lib/useLoad'
import { Button, Card, Chip, Drawer, Empty, ErrorBox, Field, IconButton, Input, ListSkeleton, PageHeader, Select, Switch, Tabs, Textarea, useConfirm, useToast } from '@/components/ui'
import { MediaPicker } from '@/components/MediaPicker'

type Check = { level: 'warn' | 'info'; msg: string }
type Page = { id?: number; path: string; title: string; description: string; og_image?: string | null; noindex?: boolean; checks?: Check[] }
type Redirect = { id?: number; from_path: string; to_path: string; code: number; hits?: number }

export default function Seo() {
  const { t } = useLang()
  const [tab, setTab] = useState<'pages' | 'redirects'>('pages')
  return (
    <>
      <PageHeader title="SEO" sub={t({ bn: 'Google ও শেয়ারে প্রতিটা পেজ কীভাবে দেখাবে, আর পুরনো লিংক কোথায় যাবে। Publish দিলে সাইটে যায়।', en: 'How each page appears in Google and when shared, and where old links go. Goes live on publish.' })} />
      <Tabs value={tab} onChange={setTab} items={[{ id: 'pages', label: t({ bn: 'পেজ', en: 'Pages' }) }, { id: 'redirects', label: t({ bn: 'রিডাইরেক্ট', en: 'Redirects' }) }]} />
      {tab === 'pages' ? <Pages /> : <Redirects />}
      <p className="mt-6 text-[13px] text-soft">{t({ bn: 'sitemap.xml ও robots.txt সাইট build-এর সময় এই পেজগুলো থেকে তৈরি হয় (noindex পেজ বাদে)।', en: 'sitemap.xml and robots.txt are built from these pages at site build time (noindex pages left out).' })}</p>
    </>
  )
}

function Pages() {
  const { t } = useLang()
  const canEdit = useAuth().can('M05', 'edit')
  const toast = useToast()
  const confirm = useConfirm()
  const q = useLoad(() => get<{ items: Page[] }>('/seo/pages'))
  const [edit, setEdit] = useState<Page | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!edit) return
    setSaving(true); setErrors({})
    try { edit.id ? await patch(`/seo/pages/${edit.id}`, edit) : await post('/seo/pages', edit); toast('ok', { bn: 'সেভ হয়েছে · পাবলিশ বাকি', en: 'Saved · not published yet' }); setEdit(null); q.reload() }
    catch (e) { if (e instanceof ApiError) setErrors(e.fields); toast('bad', (e as Error).message) } finally { setSaving(false) }
  }
  const remove = async (p: Page) => {
    if (!(await confirm({ title: t({ bn: 'এই পেজের SEO মুছবেন?', en: 'Delete this page\'s SEO?' }), ok: t({ bn: 'মুছুন', en: 'Delete' }), danger: true }))) return
    await del(`/seo/pages/${p.id}`); q.reload()
  }
  return (
    <>
      {canEdit && <div className="mb-4 flex justify-end"><Button variant="primary" onClick={() => { setErrors({}); setEdit({ path: '/', title: '', description: '' }) }}><Plus className="size-4" />{t({ bn: 'পেজ যোগ করুন', en: 'Add page' })}</Button></div>}
      {q.loading ? <ListSkeleton /> : q.error ? <ErrorBox error={q.error} retry={q.reload} /> : !q.data?.items.length ? <Empty title={t({ bn: 'কোনো পেজ নেই', en: 'No pages' })} /> : (
        <Card className="divide-y divide-line overflow-hidden">
          {q.data.items.map((p) => (
            <div key={p.id} className="flex items-start gap-3 px-4 py-3">
              <button type="button" onClick={() => { setErrors({}); setEdit(p) }} className="min-w-0 flex-1 cursor-pointer text-left">
                <span className="block text-[13px] text-soft">{p.path}</span>
                <span className="block truncate font-medium">{p.title}</span>
                <span className="mt-1 flex flex-wrap gap-1">{p.checks?.filter((c) => c.level === 'warn').map((c) => <Chip key={c.msg} tone="warn">{c.msg}</Chip>)}{p.noindex && <Chip>noindex</Chip>}</span>
              </button>
              {canEdit && <IconButton label={t({ bn: 'মুছুন', en: 'Delete' })} onClick={() => remove(p)} className="text-bad"><Trash2 className="size-4" /></IconButton>}
            </div>
          ))}
        </Card>
      )}
      <Drawer open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? edit.path : t({ bn: 'নতুন পেজ', en: 'New page' })}
        footer={!canEdit ? <Button onClick={() => setEdit(null)}>{t({ bn: 'বন্ধ করুন', en: 'Close' })}</Button> : <><Button onClick={() => setEdit(null)}>{t({ bn: 'বাতিল', en: 'Cancel' })}</Button><Button variant="primary" loading={saving} onClick={save}>{t({ bn: 'সেভ করুন', en: 'Save' })}</Button></>}>
        {edit && (
          <fieldset disabled={!canEdit} className="min-w-0 space-y-4">
            <div className="rounded-[16px] border border-line bg-white p-4" aria-label={t({ bn: 'Google-এ যেমন দেখাবে', en: 'How Google may show it' })}>
              <p className="text-[12px] text-soft">{t({ bn: 'Google-এ মোটামুটি এমন দেখাবে', en: 'Roughly how Google shows it' })}</p>
              <p className="mt-2 truncate text-[13px] text-[#4D5156]">{SITE_URL.replace(/^https?:\/\//, '')}{edit.path === '/' ? '' : edit.path}</p>
              <p className="truncate text-[19px] leading-snug text-[#1A0DAB]">{edit.title || '—'}</p>
              <p className="line-clamp-2 text-[14px] text-[#4D5156]">{edit.description || '—'}</p>
            </div>
            <Field label={t({ bn: 'পাথ', en: 'Path' })} help="/pricing" error={errors.path} required htmlFor="seo-path"><Input id="seo-path" value={edit.path} onChange={(e) => setEdit({ ...edit, path: e.target.value })} /></Field>
            <Field label={`${t({ bn: 'টাইটেল', en: 'Title' })} · ${edit.title.length}/60`} error={errors.title} required htmlFor="seo-title"><Input id="seo-title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
            <Field label={`${t({ bn: 'বর্ণনা', en: 'Description' })} · ${edit.description.length}/160`} error={errors.description} required htmlFor="seo-desc"><Textarea id="seo-desc" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <Field label={t({ bn: 'শেয়ার ছবি (1200×630)', en: 'Share image (1200×630)' })}><MediaPicker value={edit.og_image ?? ''} onChange={(v) => setEdit({ ...edit, og_image: v || null })} /></Field>
            <div className="flex items-center justify-between rounded-[14px] border border-line bg-white px-4 py-3"><span className="text-[14px] font-medium">{t({ bn: 'Google থেকে লুকান (noindex)', en: 'Hide from Google (noindex)' })}</span><Switch checked={!!edit.noindex} onChange={(v) => setEdit({ ...edit, noindex: v })} label="noindex" /></div>
          </fieldset>
        )}
      </Drawer>
    </>
  )
}

function Redirects() {
  const { t } = useLang()
  const canEdit = useAuth().can('M05', 'edit')
  const toast = useToast()
  const q = useLoad(() => get<{ items: Redirect[] }>('/seo/redirects'))
  const [form, setForm] = useState<Redirect>({ from_path: '', to_path: '', code: 301 })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const add = async () => {
    setErrors({})
    try { await post('/seo/redirects', form); setForm({ from_path: '', to_path: '', code: 301 }); q.reload(); toast('ok', { bn: 'যোগ হয়েছে · পাবলিশ বাকি', en: 'Added · not published yet' }) }
    catch (e) { if (e instanceof ApiError) setErrors(e.fields); toast('bad', (e as Error).message) }
  }
  return (
    <>
      {canEdit && <Card className="mb-4 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-end">
        <Field label={t({ bn: 'পুরনো পাথ', en: 'Old path' })} error={errors.from_path} htmlFor="r-from"><Input id="r-from" placeholder="/old-page" value={form.from_path} onChange={(e) => setForm({ ...form, from_path: e.target.value })} /></Field>
        <Field label={t({ bn: 'নতুন পাথ বা URL', en: 'New path or URL' })} error={errors.to_path} htmlFor="r-to"><Input id="r-to" placeholder="/pricing" value={form.to_path} onChange={(e) => setForm({ ...form, to_path: e.target.value })} /></Field>
        <Field label={t({ bn: 'ধরন', en: 'Type' })} htmlFor="r-code"><Select id="r-code" value={form.code} onChange={(e) => setForm({ ...form, code: Number(e.target.value) })}><option value={301}>301 · {t({ bn: 'স্থায়ী', en: 'permanent' })}</option><option value={302}>302 · {t({ bn: 'সাময়িক', en: 'temporary' })}</option></Select></Field>
        <Button variant="primary" onClick={add}><Plus className="size-4" />{t({ bn: 'যোগ', en: 'Add' })}</Button>
      </Card>}
      {q.loading ? <ListSkeleton rows={3} /> : q.error ? <ErrorBox error={q.error} retry={q.reload} /> : !q.data?.items.length ? <Empty title={t({ bn: 'কোনো রিডাইরেক্ট নেই', en: 'No redirects' })} /> : (
        <Card className="divide-y divide-line">{q.data.items.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3 text-[14px]"><code className="min-w-0 flex-1 truncate">{r.from_path} → {r.to_path}</code><Chip>{r.code}</Chip>{canEdit && <IconButton label={t({ bn: 'মুছুন', en: 'Delete' })} className="text-bad" onClick={async () => { await del(`/seo/redirects/${r.id}`); q.reload() }}><Trash2 className="size-4" /></IconButton>}</div>
        ))}</Card>
      )}
    </>
  )
}
