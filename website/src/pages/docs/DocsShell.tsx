import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { Bot, Check, ChevronDown, Copy, Search } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { docs, fullMarkdown, pageToMarkdown, type DocPage } from '@/data/docs'
import { asset } from '@/lib/utils'

const groups = [...new Set(docs.map((d) => d.group))]

export function useDocTitle(title: string, description: string) {
  useEffect(() => {
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}

// Copy text with a short "Copied" confirmation.
export function CopyButton({ text, label, variant = 'ghost', className = '' }: { text: () => string; label: string; variant?: 'ghost' | 'primary' | 'link'; className?: string }) {
  const { t } = useLang()
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text()); setDone(true); setTimeout(() => setDone(false), 1800) } catch { /* clipboard blocked */ }
  }
  const cls = variant === 'primary' ? 'btn-primary h-10 px-4 text-[14px]'
    : variant === 'link' ? 'inline-flex min-h-10 items-center gap-1.5 text-[13px] font-medium text-brand hover:underline underline-offset-4 cursor-pointer'
    : 'btn-ghost h-10 px-3.5 text-[13px]'
  return (
    <button onClick={copy} className={`${cls} ${className}`} aria-live="polite">
      {done ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      {done ? t({ bn: 'কপি হয়েছে', en: 'Copied' }) : label}
    </button>
  )
}

export const copyAll = () => fullMarkdown()
export const copyPage = (d: DocPage) => () => pageToMarkdown(d)
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function DocsNav({ q, onPick }: { q: string; onPick: () => void }) {
  const pathname = useLocation().pathname.replace(/\/+$/, '')
  const reduce = useReducedMotion()
  const activeGroup = docs.find((d) => pathname === `/docs/${d.slug}`)?.group
  const [openG, setOpenG] = useState<Set<string>>(() => new Set(activeGroup ? [activeGroup] : groups.slice(0, 1)))
  useEffect(() => { if (activeGroup) setOpenG((s) => (s.has(activeGroup) ? s : new Set([...s, activeGroup]))) }, [activeGroup])
  const hit = (d: DocPage) => !q || (d.title + ' ' + pageToMarkdown(d)).toLowerCase().includes(q.toLowerCase())
  const toggle = (g: string) => setOpenG((s) => { const n = new Set(s); if (n.has(g)) n.delete(g); else n.add(g); return n })
  return (
    <nav aria-label="Documentation" className="space-y-1">
      <LayoutGroup id="docs-nav">
        {groups.map((g) => {
          const items = docs.filter((d) => d.group === g && hit(d))
          if (!items.length) return null
          const isOpen = !!q || openG.has(g)
          return (
            <div key={g}>
              <button type="button" onClick={() => toggle(g)} aria-expanded={isOpen}
                className={`flex min-h-10 w-full items-center justify-between rounded-[8px] px-3 text-[13px] font-medium transition-colors ${g === activeGroup ? 'text-ink' : 'text-muted-foreground hover:text-ink'}`}>
                {g}<ChevronDown className={`size-3.5 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul key="list" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }} className="overflow-hidden pb-1">
                    {items.map((d) => {
                      const active = pathname === `/docs/${d.slug}`
                      return (
                        <li key={d.slug} className="relative">
                          {active && <motion.span layoutId="docs-pill" transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                            className="absolute inset-0 rounded-[10px] bg-[#FFE7E4] ring-1 ring-brand/15" aria-hidden="true" />}
                          <NavLink to={`/docs/${d.slug}`} onClick={onPick} aria-current={active ? 'page' : undefined}
                            className={`relative flex min-h-10 items-center rounded-[10px] px-3 text-[14px] transition-colors duration-200 ${active ? 'font-medium text-brand' : 'text-muted-foreground hover:bg-ink/[0.035] hover:text-ink'}`}>
                            {d.title}
                          </NavLink>
                        </li>
                      )
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </LayoutGroup>
    </nav>
  )
}

// Thin red bar on every docs navigation.
function RouteBar() {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <motion.div key={pathname} aria-hidden="true" initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: [0, 0.75, 1], opacity: [1, 1, 0] }}
      transition={{ duration: 0.7, times: [0, 0.6, 1], ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-linear-to-r from-brand to-brand-2" />
  )
}

function useActiveToc(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  const key = ids.join('|')
  useEffect(() => {
    setActive(ids[0])
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!els.length || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((es) => {
      const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (vis[0]) setActive(vis[0].target.id)
    }, { rootMargin: '-96px 0px -60% 0px' })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return active
}

export function DocsShell({ children, toc }: { children: ReactNode; toc?: { id: string; label: string }[] }) {
  const { t } = useLang()
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const activeToc = useActiveToc(toc?.map((x) => x.id) ?? [])
  return (
    <div className="container-x pt-8 md:pt-12">
      <RouteBar />
      <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_190px] lg:gap-12">
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link to="/docs" className="flex min-h-10 items-center px-3 text-[15px] font-semibold">{t({ bn: 'ডকুমেন্টেশন', en: 'Documentation' })}</Link>
          <label className="relative mt-2 block">
            <span className="sr-only">Search docs</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true) }} placeholder={t({ bn: 'খুঁজুন', en: 'Search' })}
              className="h-10 w-full rounded-[10px] border border-line bg-white pl-9 pr-3 text-[14px] focus:outline-2 focus:outline-link" />
          </label>
          <button onClick={() => setOpen(!open)} aria-expanded={open} className="btn-ghost mt-3 h-10 w-full justify-between px-4 text-[14px] lg:hidden">
            {t({ bn: 'সব পাতা', en: 'All pages' })}<span aria-hidden="true">{open ? '−' : '+'}</span>
          </button>
          <div className={`mt-4 ${open ? 'block' : 'hidden'} lg:block`}><DocsNav q={q} onPick={() => setOpen(false)} /></div>
          <div className="mt-6 hidden rounded-[14px] bg-white p-3.5 ring-1 ring-line lg:block">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold"><Bot className="size-4 text-brand" aria-hidden="true" />{t({ bn: 'AI দিয়ে ব্যবহার', en: 'Use with AI' })}</p>
            <CopyButton text={copyAll} label={t({ bn: 'সব ডক কপি', en: 'Copy all docs' })} variant="link" />
            <a href={asset('/llms-full.txt')} className="flex min-h-10 items-center text-[13px] text-muted-foreground hover:text-ink">llms-full.txt</a>
          </div>
        </aside>

        <motion.div key={pathname} className="min-w-0" initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}>{children}</motion.div>

        {toc && toc.length > 1 && (
          <nav aria-label="On this page" className="hidden xl:block">
            <div className="sticky top-24">
              <p className="text-[12px] font-medium text-muted-foreground">{t({ bn: 'এই পাতায়', en: 'On this page' })}</p>
              <ul className="mt-2 border-l border-line">
                {toc.map((x) => {
                  const on = activeToc === x.id
                  return <li key={x.id}><a href={`#${x.id}`} aria-current={on ? 'location' : undefined}
                    className={`-ml-px block border-l py-1.5 pl-3 text-[13px] transition-colors duration-200 ${on ? 'border-brand font-medium text-brand' : 'border-transparent text-muted-foreground hover:border-line hover:text-ink'}`}>{x.label}</a></li>
                })}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
