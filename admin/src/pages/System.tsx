import { useState } from 'react'
import { FileText, Plus, Trash2, UploadCloud } from 'lucide-react'
import { ApiError, del, get, patch, post } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useLang, type L } from '@/lib/i18n'
import { useLoad } from '@/lib/useLoad'
import { fmtDate } from '@/lib/format'
import { Button, Card, Chip, Drawer, Empty, ErrorBox, Field, IconButton, Input, ListSkeleton, PageHeader, Select, Switch, Tabs, useConfirm, useToast } from '@/components/ui'
import { upload, type MediaItem } from '@/components/MediaPicker'

type RoleItem = { id: number; key: string; name: L; permissions: Record<string, 'view' | 'edit'>; system: boolean; users: number }
type ModuleDef = { id: string; label: L; levels: ('view' | 'edit')[]; hint?: L }
type Lvl = 'none' | 'view' | 'edit'
const lvlL: Record<Lvl, L> = { none: { bn: 'নেই', en: 'None' }, view: { bn: 'দেখা', en: 'View' }, edit: { bn: 'এডিট', en: 'Edit' } }

/** Users & roles: who can sign in (Users) and what each role may open or change (Roles). */
export function Users() {
  const { t } = useLang()
  const [tab, setTab] = useState('users')
  const roles = useLoad(() => get<{ items: RoleItem[] }>('/roles'))
  return (
    <>
      <PageHeader title={t({ bn: 'ইউজার ও রোল', en: 'Users & roles' })} sub={t({ bn: 'রোল ঠিক করে কে কোন মডিউল দেখবে বা বদলাবে। সাইডবার রোল অনুযায়ী দেখায়।', en: 'A role decides which modules someone can view or change. The sidebar follows the role.' })} />
      <Tabs value={tab} onChange={setTab} items={[{ id: 'users', label: t({ bn: 'ইউজার', en: 'Users' }) }, { id: 'roles', label: t({ bn: 'রোল ও অনুমতি', en: 'Roles & permissions' }) }]} />
      <div className="mt-5">{tab === 'users' ? <UserList roles={roles.data?.items ?? []} /> : roles.loading ? <ListSkeleton /> : roles.error ? <ErrorBox error={roles.error} retry={roles.reload} /> : <RoleList items={roles.data!.items} reload={roles.reload} />}</div>
    </>
  )
}

function UserList({ roles }: { roles: RoleItem[] }) {
  const { t } = useLang()
  const toast = useToast()
  const { user: me, can } = useAuth()
  const edit = can('M21', 'edit')
  const q = useLoad(() => get<{ items: { id: number; name: string; email: string; role: string; active: boolean; last_login_at: string | null }[] }>('/users'))
  const [inv, setInv] = useState<{ name: string; email: string; role: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const change = async (id: number, body: Record<string, unknown>) => { try { await patch(`/users/${id}`, body); q.reload(); toast('ok', { bn: 'বদলানো হয়েছে', en: 'Updated' }) } catch (e) { toast('bad', (e as Error).message) } }
  const roleOpts = roles.map((r) => <option key={r.key} value={r.key}>{t(r.name)}</option>)
  return (
    <>
      {edit && <div className="mb-4 flex justify-end"><Button variant="primary" onClick={() => { setErrors({}); setInv({ name: '', email: '', role: roles.find((r) => !r.system)?.key ?? 'editor' }) }}><Plus className="size-4" />{t({ bn: 'ইনভাইট', en: 'Invite' })}</Button></div>}
      {q.loading ? <ListSkeleton /> : q.error ? <ErrorBox error={q.error} retry={q.reload} /> : (
        <Card className="divide-y divide-line">{q.data!.items.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1"><span className="block font-medium">{u.name}{u.id === me?.id && <span className="text-soft"> · {t({ bn: 'আপনি', en: 'you' })}</span>}</span><span className="text-[13px] text-soft">{u.email} · {t({ bn: 'শেষ লগইন', en: 'last sign-in' })} {fmtDate(u.last_login_at)}</span></span>
            <Select aria-label={t({ bn: 'রোল', en: 'Role' })} disabled={!edit} className="h-10 w-[170px]" value={u.role} onChange={(e) => change(u.id, { role: e.target.value })}>{roleOpts}</Select>
            <Switch checked={u.active} onChange={(v) => edit && change(u.id, { active: v })} label={t({ bn: 'সক্রিয়', en: 'Active' })} />
          </div>
        ))}</Card>
      )}
      <Drawer open={!!inv} onClose={() => setInv(null)} title={t({ bn: 'নতুন ইউজার', en: 'Invite a user' })}
        footer={<><Button onClick={() => setInv(null)}>{t({ bn: 'বাতিল', en: 'Cancel' })}</Button><Button variant="primary" onClick={async () => { try { await post('/users', inv); setInv(null); q.reload(); toast('ok', { bn: 'ইমেইলে পাসওয়ার্ড সেট করার লিংক গেছে', en: 'A set-password link was emailed' }) } catch (e) { if (e instanceof ApiError && e.fields) setErrors(e.fields); else toast('bad', (e as Error).message) } }}>{t({ bn: 'ইনভাইট পাঠান', en: 'Send invite' })}</Button></>}>
        {inv && <div className="space-y-4">
          <Field label={t({ bn: 'নাম', en: 'Name' })} error={errors.name} required htmlFor="u-name"><Input id="u-name" value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} /></Field>
          <Field label={t({ bn: 'ইমেইল', en: 'Email' })} error={errors.email} required htmlFor="u-email"><Input id="u-email" type="email" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} /></Field>
          <Field label={t({ bn: 'রোল', en: 'Role' })} error={errors.role} htmlFor="u-role" help={t({ bn: 'নতুন রোল বানাতে "রোল ও অনুমতি" ট্যাবে যান।', en: 'To make a new role, open the "Roles & permissions" tab.' })}><Select id="u-role" value={inv.role} onChange={(e) => setInv({ ...inv, role: e.target.value })}>{roleOpts}</Select></Field>
        </div>}
      </Drawer>
    </>
  )
}

function RoleList({ items, reload }: { items: RoleItem[]; reload: () => void }) {
  const { t } = useLang()
  const toast = useToast()
  const confirm = useConfirm()
  const edit = useAuth().can('M21', 'edit')
  const mods = useLoad(() => get<{ modules: ModuleDef[] }>('/modules'))
  const [open, setOpen] = useState<{ id: number | null; name: L; permissions: Record<string, Lvl>; system: boolean } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const count = (r: RoleItem) => r.system ? t({ bn: 'সব মডিউল', en: 'All modules' }) : `${Object.keys(r.permissions).length} ${t({ bn: 'মডিউল', en: 'modules' })}`
  const save = async () => {
    if (!open) return
    setSaving(true); setErrors({})
    try {
      const body = { name: open.name, permissions: open.permissions }
      if (open.id) await patch(`/roles/${open.id}`, body); else await post('/roles', body)
      setOpen(null); reload(); toast('ok', { bn: 'রোল সেভ হয়েছে — এই রোলের সবার সাইডবার এখনই বদলাবে', en: 'Role saved — sidebars of its users change right away' })
    } catch (e) { if (e instanceof ApiError && e.fields) setErrors(e.fields); else toast('bad', (e as Error).message) }
    setSaving(false)
  }
  const remove = async (r: RoleItem) => {
    if (!(await confirm({ title: t({ bn: 'রোল মুছবেন?', en: 'Delete this role?' }), body: t(r.name), ok: t({ bn: 'মুছুন', en: 'Delete' }), danger: true }))) return
    try { await del(`/roles/${r.id}`); reload(); toast('ok', { bn: 'মুছে ফেলা হয়েছে', en: 'Deleted' }) } catch (e) { toast('bad', (e as Error).message) }
  }
  const setAll = (lvl: Lvl) => open && mods.data && setOpen({ ...open, permissions: Object.fromEntries(mods.data.modules.map((m) => [m.id, lvl === 'edit' && !m.levels.includes('edit') ? 'view' : lvl])) })
  return (
    <>
      {edit && <div className="mb-4 flex justify-end"><Button variant="primary" onClick={() => { setErrors({}); setOpen({ id: null, name: { bn: '', en: '' }, permissions: { M02: 'view' }, system: false }) }}><Plus className="size-4" />{t({ bn: 'নতুন রোল', en: 'New role' })}</Button></div>}
      <Card className="divide-y divide-line">{items.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="min-w-0 flex-1"><span className="block font-medium">{t(r.name)} {r.system && <Chip tone="info">{t({ bn: 'স্থায়ী', en: 'Built-in' })}</Chip>}</span><span className="text-[13px] text-soft">{count(r)} · {r.users} {t({ bn: 'জন ইউজার', en: r.users === 1 ? 'user' : 'users' })}</span></span>
          <Button size="sm" onClick={() => { setErrors({}); setOpen({ id: r.id, name: r.name, permissions: { ...r.permissions }, system: r.system }) }}>{r.system || !edit ? t({ bn: 'দেখুন', en: 'View' }) : t({ bn: 'অনুমতি বদলান', en: 'Edit access' })}</Button>
          {edit && !r.system && <IconButton label={t({ bn: 'মুছুন', en: 'Delete' })} disabled={r.users > 0} onClick={() => remove(r)} className="text-bad"><Trash2 className="size-4" /></IconButton>}
        </div>
      ))}</Card>
      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.id ? t(open.name) : t({ bn: 'নতুন রোল', en: 'New role' })}
        footer={!edit || open?.system ? <Button onClick={() => setOpen(null)}>{t({ bn: 'বন্ধ করুন', en: 'Close' })}</Button> : <><Button onClick={() => setOpen(null)}>{t({ bn: 'বাতিল', en: 'Cancel' })}</Button><Button variant="primary" loading={saving} onClick={save}>{t({ bn: 'সেভ করুন', en: 'Save' })}</Button></>}>
        {open && <fieldset disabled={!edit || open.system} className="min-w-0 space-y-4">
          {open.system && <p className="rounded-[14px] bg-info/10 px-4 py-3 text-[14px]">{t({ bn: 'ওনার রোল সব সময় সব মডিউলে পূর্ণ অনুমতি পায় — বদলানো যায় না, যাতে কেউ নিজেকে লক আউট না করে।', en: 'The owner role always has full access to every module — it cannot be changed, so nobody locks everyone out.' })}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t({ bn: 'নাম (বাংলা)', en: 'Name (Bangla)' })} error={errors['name.bn']} required htmlFor="r-bn"><Input id="r-bn" value={open.name.bn} onChange={(e) => setOpen({ ...open, name: { ...open.name, bn: e.target.value } })} placeholder="ব্লগ লেখক" /></Field>
            <Field label={t({ bn: 'নাম (ইংরেজি)', en: 'Name (English)' })} error={errors['name.en']} required htmlFor="r-en"><Input id="r-en" value={open.name.en} onChange={(e) => setOpen({ ...open, name: { ...open.name, en: e.target.value } })} placeholder="Blog writer" /></Field>
          </div>
          {!open.system && <div className="flex flex-wrap gap-2 text-[13px]"><span className="text-soft">{t({ bn: 'সবগুলো:', en: 'Set all:' })}</span>{(['none', 'view', 'edit'] as Lvl[]).map((l) => <Button key={l} size="sm" onClick={() => setAll(l)}>{t(lvlL[l])}</Button>)}</div>}
          {mods.loading ? <ListSkeleton /> : mods.error ? <ErrorBox error={mods.error} retry={mods.reload} /> : (
            <div className="divide-y divide-line rounded-[14px] border border-line bg-white" role="table" aria-label={t({ bn: 'মডিউল অনুমতি', en: 'Module access' })}>
              {mods.data!.modules.map((m) => {
                const cur: Lvl = open.system ? m.levels.at(-1)! : m.id === 'M02' ? 'view' : open.permissions[m.id] ?? 'none'
                const opts: Lvl[] = m.id === 'M02' ? ['view'] : ['none', ...m.levels]
                return (
                  <div key={m.id} role="row" className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                    <span role="cell" className="min-w-0 flex-1"><span className="block text-[14px] font-medium">{t(m.label)}</span>{m.hint && <span className="text-[12px] text-soft">{t(m.hint)}</span>}{errors[`permissions.${m.id}`] && <span className="block text-[12px] text-bad">{errors[`permissions.${m.id}`]}</span>}</span>
                    <span role="cell" className="flex rounded-full bg-canvas p-0.5" data-module={m.id}>{opts.map((l) => (
                      <button key={l} type="button" aria-pressed={cur === l} onClick={() => setOpen({ ...open, permissions: { ...open.permissions, [m.id]: l } })}
                        className={`h-8 rounded-full px-3 text-[13px] transition ${cur === l ? (l === 'none' ? 'bg-white text-ink shadow-sm' : 'bg-brand text-white shadow-sm') : 'text-soft hover:text-ink'} disabled:cursor-not-allowed`}>{t(lvlL[l])}</button>
                    ))}</span>
                  </div>
                )
              })}
            </div>
          )}
          {!open.system && <p className="text-[13px] text-soft">{t({ bn: 'দেখা = খুলে পড়তে পারবে। এডিট = যোগ, বদল, মুছা। ছবি আপলোড সেই রোল পারবে যার অন্তত একটা মডিউলে এডিট আছে।', en: 'View = can open and read. Edit = add, change, delete. Uploading images is allowed to any role with Edit on at least one module.' })}</p>}
        </fieldset>}
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
        actions={<label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-brand-edge bg-linear-to-t from-brand to-brand-2 px-5 text-[15px] font-medium text-white"><UploadCloud className="size-4" />{busy ? t({ bn: 'আপলোড হচ্ছে…', en: 'Uploading…' }) : t({ bn: 'আপলোড', en: 'Upload' })}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="sr-only" onChange={(e) => { onFiles(e.target.files); e.target.value = '' }} /></label>} />
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
