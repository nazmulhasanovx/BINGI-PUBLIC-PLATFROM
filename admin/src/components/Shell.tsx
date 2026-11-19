import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { ExternalLink, KeyRound, LogOut, Menu as MenuIcon, X } from 'lucide-react'
import { groups } from '@/lib/modules'
import { useAuth } from '@/lib/auth'
import { useLang } from '@/lib/i18n'
import { SITE_URL, get } from '@/lib/api'
import { Icon } from './Icon'

/** Sidebar (desktop) / sheet (phone) + top bar. Modules come from lib/modules.ts, filtered by role. */
export function Shell({ children }: { children: ReactNode }) {
  const { user, logout, can } = useAuth()
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(0)
  const loc = useLocation()
  useEffect(() => { setOpen(false) }, [loc.pathname])
  useEffect(() => {
    if (!can('owner', 'editor')) return
    get<{ items: unknown[] }>('/publish/pending').then((r) => setPending(r.items.length)).catch(() => {})
  }, [loc.pathname, can])

  const nav = (
    <nav aria-label={t({ bn: 'মূল মেনু', en: 'Main menu' })} className="space-y-6 px-3 py-4">
      {groups.map((g) => {
        const mods = g.modules.filter((m) => user && m.roles.includes(user.role))
        if (!mods.length) return null
        return (
          <div key={g.id}>
            <p className="px-3 pb-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-soft">{t(g.label)}</p>
            <ul className="space-y-0.5">
              {mods.map((m) => (
                <li key={m.id}>
                  <NavLink to={m.path} end={m.path === '/'} className={({ isActive }) => clsx('flex h-10 items-center gap-3 rounded-[12px] px-3 text-[15px] transition-colors', isActive ? 'bg-white font-semibold text-ink shadow-soft' : 'text-ink/75 hover:bg-white/70 hover:text-ink')}>
                    <Icon name={m.icon} className="size-[18px] shrink-0" />
                    <span className="truncate">{t(m.label)}</span>
                    {m.id === 'M20' && pending > 0 && <span className="ml-auto rounded-full bg-warn-soft px-2 text-[12px] font-semibold text-warn">{pending}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
  return (
    <div className="min-h-dvh lg:pl-[264px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-line bg-[#EEF1F4] lg:flex">
        <Brand />
        <div className="min-h-0 flex-1 overflow-y-auto">{nav}</div>
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="animate-fade absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
          <aside className="animate-sheet relative flex h-full w-[86%] max-w-[320px] flex-col bg-[#EEF1F4]">
            <div className="flex items-center justify-between pr-2"><Brand /><button type="button" onClick={() => setOpen(false)} aria-label={t({ bn: 'বন্ধ', en: 'Close' })} className="grid size-11 place-items-center rounded-full hover:bg-black/5"><X className="size-5" /></button></div>
            <div className="min-h-0 flex-1 overflow-y-auto">{nav}</div>
          </aside>
        </div>
      )}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-pearl/85 px-4 backdrop-blur-xl md:px-8">
        <button type="button" className="grid size-11 place-items-center rounded-full hover:bg-black/5 lg:hidden" onClick={() => setOpen(true)} aria-label={t({ bn: 'মেনু', en: 'Menu' })}><MenuIcon className="size-5" /></button>
        <a href={SITE_URL} target="_blank" rel="noopener" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[14px] text-soft hover:bg-black/5 hover:text-ink sm:inline-flex">{t({ bn: 'সাইট দেখুন', en: 'View site' })}<ExternalLink className="size-3.5" /></a>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-full border border-line bg-white p-1 text-[13px] font-medium" role="group" aria-label="Language">
            {(['bn', 'en'] as const).map((l) => <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} className={clsx('h-8 cursor-pointer rounded-full px-3', lang === l ? 'bg-ink text-white' : 'text-soft')}>{l === 'bn' ? 'বাংলা' : 'EN'}</button>)}
          </div>
          <UserMenu name={user?.name ?? ''} role={user?.role ?? ''} onLogout={logout} />
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  )
}

function Brand() {
  return (
    <div className="flex h-16 items-center gap-2.5 px-6">
      <img src="/bingi-logo.png" alt="BinGi" className="h-7 w-auto" />
      <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white">ADMIN</span>
    </div>
  )
}

function UserMenu({ name, role, onLogout }: { name: string; role: string; onLogout: () => void }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const roleL: Record<string, { bn: string; en: string }> = { owner: { bn: 'ওনার', en: 'Owner' }, editor: { bn: 'এডিটর', en: 'Editor' }, sales: { bn: 'সেলস', en: 'Sales' } }
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white pl-1.5 pr-3">
        <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand">{name.slice(0, 1).toUpperCase()}</span>
        <span className="hidden text-left text-[13px] leading-tight sm:block"><span className="block font-medium">{name}</span><span className="text-soft">{t(roleL[role])}</span></span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="animate-pop absolute right-0 z-20 mt-2 w-[220px] rounded-[16px] border border-line bg-white p-1.5 shadow-lift">
            <NavLink to="/account" onClick={() => setOpen(false)} className="flex h-10 items-center gap-2 rounded-[10px] px-3 text-[14px] hover:bg-canvas"><KeyRound className="size-4" />{t({ bn: 'পাসওয়ার্ড বদলান', en: 'Change password' })}</NavLink>
            <button type="button" onClick={onLogout} className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-[10px] px-3 text-[14px] text-bad hover:bg-bad-soft"><LogOut className="size-4" />{t({ bn: 'লগ আউট', en: 'Sign out' })}</button>
          </div>
        </>
      )}
    </div>
  )
}
