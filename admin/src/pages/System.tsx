import { useState } from 'react'
import { FileText, Plus, Trash2, UploadCloud } from 'lucide-react'
import { ApiError, del, get, patch, post } from '@/lib/api'
import { useAuth, type Role } from '@/lib/auth'
import { useLang, type L } from '@/lib/i18n'
import { useLoad } from '@/lib/useLoad'
import { fmtDate } from '@/lib/format'
import { Button, Card, Chip, Drawer, Empty, ErrorBox, Field, IconButton, Input, ListSkeleton, PageHeader, Select, Switch, useConfirm, useToast } from '@/components/ui'
import { upload, type MediaItem } from '@/components/MediaPicker'

const roles: Record<Role, { l: L; d: L }> = {
  owner: { l: { bn: 'ওনার', en: 'Owner' }, d: { bn: 'সব কিছু, পাবলিশ ও ইউজার', en: 'Everything, publish and users' } },
  editor: { l: { bn: 'এডিটর', en: 'Editor' }, d: { bn: 'কনটেন্ট ও SEO লেখা, পাবলিশ নয়', en: 'Content and SEO, no publish' } },
  sales: { l: { bn: 'সেলস', en: 'Sales' }, d: { bn: 'লিড ও ভিজিটর', en: 'Leads and visitors' } },
}

export function Users() {
  const { t } = useLang()
  const toast = useToast()
  const { user: me } = useAuth()
  const q = useLoad(() => get<{ items: { id: number; name: string; email: string; role: Role; active: boolean; last_login_at: string | null }[] }>('/users'))
  const [inv, setInv] = useState<{ name: string; email: string; role: Role } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const change = async (id: number, body: Record<string, unknown>) => { try { await patch(`/users/${id}`, body); q.reload(); toast('ok', { bn: 'বদলানো হয়েছে', en: 'Updated' }) } catch (e) { toast('bad', (e as Error).message) } }
  return (
    <>
      <PageHeader title={t({ bn: 'ইউজার ও রোল', en: 'Users & roles' })} sub={Object.values(roles).map((r) => `${t(r.l)}: ${t(r.d)}`).join(' · ')} actions={<Button variant="primary" onClick={() => { setErrors({}); setInv({ name: '', email: '', role: 'editor' }) }}><Plus className="size-4" />{t({ bn: 'ইনভাইট', en: 'Invite' })}</Button>} />
      {q.loading ? <ListSkeleton /> : q.error ? <ErrorBox error={q.error} retry={q.reload} /> : (
        <Card className="divide-y divide-line">{q.data!.items.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1"><span className="block font-medium">{u.name}{u.id === me?.id && <span className="text-soft"> · {t({ bn: 'আপনি', en: 'you' })}</span>}</span><span className="text-[13px] text-soft">{u.email} · {t({ bn: 'শেষ লগইন', en: 'last sign-in' })} {fmtDate(u.last_login_at)}</span></span>
            <Select aria-label={t({ bn: 'রোল', en: 'Role' })} className="h-10 w-[140px]" value={u.role} onChange={(e) => change(u.id, { role: e.target.value })}>{(Object.keys(roles) as Role[]).map((r) => <option key={r} value={r}>{t(roles[r].l)}</option>)}</Select>
            <Switch checked={u.active} onChange={(v) => change(u.id, { active: v })} label={t({ bn: 'সক্রিয়', en: 'Active' })} />
          </div>
        ))}</Card>
      )}
      <Drawer open={!!inv} onClose={() => setInv(null)} title={t({ bn: 'নতুন ইউজার', en: 'Invite a user' })}
        footer={<><Button onClick={() => setInv(null)}>{t({ bn: 'বাতিল', en: 'Cancel' })}</Button><Button variant="primary" onClick={async () => { try { await post('/users', inv); setInv(null); q.reload(); toast('ok', { bn: 'ইমেইলে পাসওয়ার্ড সেট করার লিংক গেছে', en: 'A set-password link was emailed' }) } catch (e) { if (e instanceof ApiError) setErrors(e.fields); toast('bad', (e as Error).message) } }}>{t({ bn: 'ইনভাইট পাঠান', en: 'Send invite' })}</Button></>}>
        {inv && <div className="space-y-4">
          <Field label={t({ bn: 'নাম', en: 'Name' })} error={errors.name} required htmlFor="u-name"><Input id="u-name" value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} /></Field>
          <Field label={t({ bn: 'ইমেইল', en: 'Email' })} error={errors.email} required htmlFor="u-email"><Input id="u-email" type="email" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} /></Field>
          <Field label={t({ bn: 'রোল', en: 'Role' })} htmlFor="u-role" help={t(roles[inv.role].d)}><Select id="u-role" value={inv.role} onChange={(e) => setInv({ ...inv, role: e.target.value as Role })}>{(Object.keys(roles) as Role[]).map((r) => <option key={r} value={r}>{t(roles[r].l)}</option>)}</Select></Field>
        </div>}
      </Drawer>
    </>
  )
}

export function Audit() {
  const { t } = useLang()
  const [page, setPage] = useState(1)
  const q = useLoad(() => get<{ data: { id: number; action: string; entity: string; at: string; user?: { name: string } }[]; last_page: number }>(`/audit?page=${page}`), [page])
  return (
    <>
      <PageHeader title={t({ bn: 'অডিট লগ', en: 'Audit log' })} sub={t({ bn: 'কে, কী, কখন বদলেছে।', en: 'Who changed what, and when.' })} />
      {q.loading ? <ListSkeleton /> : q.error ? <ErrorBox error={q.error} retry={q.reload} /> : !q.data?.data.length ? <Empty title={t({ bn: 'এখনো কিছু নেই', en: 'Nothing yet' })} /> : (
        <>
          <Card className="divide-y divide-line">{q.data.data.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-[14px]"><Chip>{a.action}</Chip><code className="min-w-0 flex-1 truncate text-[13px]">{a.entity}</code><span className="text-[13px] text-soft">{a.user?.name ?? 'system'} · {fmtDate(a.at)}</span></div>
          ))}</Card>
          <div className="mt-4 flex justify-center gap-2"><Button size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t({ bn: 'আগে', en: 'Previous' })}</Button><Button size="sm" disabled={page >= q.data.last_page} onClick={() => setPage(page + 1)}>{t({ bn: 'পরে', en: 'Next' })}</Button></div>
        </>
      )}
    </>
  )
}

export function MediaLibrary() {
  const { t } = useLang()
  const toast = useToast()
  const confirm = useConfirm()
  const q = useLoad(() => get<{ data: MediaItem[] }>('/media'))
  const [busy, setBusy] = useState(false)
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    for (const f of Array.from(files)) { try { await upload(f) } catch (e) { toast('bad', `${f.name}: ${(e as Error).message}`) } }
    setBusy(false); q.reload()
  }
  return (
    <>
      <PageHeader title={t({ bn: 'মিডিয়া লাইব্রেরি', en: 'Media library' })} sub={t({ bn: 'ছবি নিজে থেকে WebP-তে 480/960/1600 px সাইজে তৈরি হয়। PDF (অনুমতিপত্র) যেমন আছে তেমন থাকে।', en: 'Photos become WebP at 480/960/1600 px automatically. PDFs (permission letters) are kept as they are.' })}
        actions={<label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-brand-edge bg-linear-to-t from-brand to-brand-2 px-5 text-[15px] font-medium text-white"><UploadCloud className="size-4" />{busy ? t({ bn: 'আপলোড হচ্ছে…', en: 'Uploading…' }) : t({ bn: 'আপলোড', en: 'Upload' })}<input type="file" multiple accept="image/*,application/pdf" className="sr-only" onChange={(e) => { onFiles(e.target.files); e.target.value = '' }} /></label>} />
      {q.loading ? <ListSkeleton /> : q.error ? <ErrorBox error={q.error} retry={q.reload} /> : !q.data?.data.length ? <Empty title={t({ bn: 'এখনো কিছু আপলোড হয়নি', en: 'Nothing uploaded yet' })} /> : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{q.data.data.map((m) => (
          <li key={m.id} className="overflow-hidden rounded-[16px] border border-line bg-white shadow-soft">
            {m.mime.startsWith('image') ? <img src={m.variants?.['480'] ?? m.path} alt="" loading="lazy" className="aspect-[4/3] w-full bg-canvas object-cover" /> : <span className="grid aspect-[4/3] place-items-center bg-canvas"><FileText className="size-8 text-soft" /></span>}
            <div className="flex items-center gap-1 p-2.5"><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium">{m.original_name}</span><span className="text-[12px] text-soft">{m.width ? `${m.width}×${m.height} · ` : ''}{Math.round(m.bytes / 1024)} KB</span></span>
              <IconButton label={t({ bn: 'লিংক কপি', en: 'Copy link' })} onClick={() => navigator.clipboard?.writeText(m.path).then(() => toast('ok', { bn: 'কপি হয়েছে', en: 'Copied' }), () => {})} className="size-8 text-[11px]">URL</IconButton>
              <IconButton label={t({ bn: 'মুছুন', en: 'Delete' })} className="size-8 text-bad" onClick={async () => { if (await confirm({ title: t({ bn: 'ফাইল মুছবেন?', en: 'Delete this file?' }), body: t({ bn: 'কোনো কনটেন্টে ব্যবহার হলে সেখানে ছবি ভেঙে যাবে।', en: 'Any content using it will show a broken image.' }), ok: t({ bn: 'মুছুন', en: 'Delete' }), danger: true })) { await del(`/media/${m.id}`); q.reload() } }}><Trash2 className="size-4" /></IconButton>
            </div>
          </li>))}</ul>
      )}
    </>
  )
}

export function Account() {
  const { t } = useLang()
  const toast = useToast()
  const [f, setF] = useState({ current: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  return (
    <>
      <PageHeader title={t({ bn: 'পাসওয়ার্ড বদলান', en: 'Change password' })} />
      <Card className="max-w-[460px] space-y-4 p-5">
        <Field label={t({ bn: 'এখনকার পাসওয়ার্ড', en: 'Current password' })} error={errors.current} htmlFor="a-cur"><Input id="a-cur" type="password" autoComplete="current-password" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} /></Field>
        <Field label={t({ bn: 'নতুন পাসওয়ার্ড (কমপক্ষে 10)', en: 'New password (min 10)' })} error={errors.password} htmlFor="a-new"><Input id="a-new" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <Button variant="primary" onClick={async () => { setErrors({}); try { await post('/auth/password', f); setF({ current: '', password: '' }); toast('ok', { bn: 'পাসওয়ার্ড বদলানো হয়েছে', en: 'Password changed' }) } catch (e) { if (e instanceof ApiError) setErrors(e.fields); toast('bad', (e as Error).message) } }}>{t({ bn: 'সেভ করুন', en: 'Save' })}</Button>
      </Card>
    </>
  )
}
