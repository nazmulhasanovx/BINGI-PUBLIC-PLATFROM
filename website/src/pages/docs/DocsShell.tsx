import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Bot, Check, Copy, FileText, Search } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { docs, DOCS_VERSION, fullMarkdown, pageToMarkdown, type DocPage } from '@/data/docs'
import { asset } from '@/lib/utils'

const groups = [...new Set(docs.map((d) => d.group))]

export function useDocTitle(title: string, description: string) {
  useEffect(() => {
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}

// Copy text with a short "Copied" confirmation.
export function CopyButton({ text, label, variant = 'ghost' }: { text: () => string; label: string; variant?: 'ghost' | 'primary' }) {
  const { t } = useLang()
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text()); setDone(true); setTimeout(() => setDone(false), 1800) } catch { /* clipboard blocked */ }
  }
  return (
    <button onClick={copy} className={`${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} h-10 px-4 text-[14px]`} aria-live="polite">
      {done ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      {done ? t({ bn: 'কপি হয়েছে', en: 'Copied' }) : label}
    </button>
  )
}

export const copyAll = () => fullMarkdown()
export const copyPage = (d: DocPage) => () => pageToMarkdown(d)

function DocsNav({ q }: { q: string }) {
  const hit = (d: DocPage) => !q || (d.title + ' ' + d.summary + ' ' + pageToMarkdown(d)).toLowerCase().includes(q.toLowerCase())
  return (
    <nav aria-label="Documentation" className="space-y-6">
      {groups.map((g) => {
        const items = docs.filter((d) => d.group === g && hit(d))
        if (!items.length) return null
        return (
          <div key={g}>
            <p className="px-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{g}</p>
            <ul className="mt-1.5 space-y-0.5">
              {items.map((d) => (
                <li key={d.slug}>
                  <NavLink to={`/docs/${d.slug}`} className={({ isActive }) => `flex min-h-10 items-center rounded-[10px] px-3 text-[14px] transition-colors ${isActive ? 'bg-brand-soft font-semibold text-brand' : 'text-ink/80 hover:bg-white hover:text-ink'}`}>
                    {d.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

export function DocsShell({ children }: { children: ReactNode }) {
  const { t } = useLang()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const count = useMemo(() => docs.length, [])
  return (
    <div className="container-x pt-6 md:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <Link to="/docs" className="flex min-h-11 items-center gap-2 text-[15px] font-semibold"><FileText className="size-5 text-brand" aria-hidden="true" />{t({ bn: 'BinGi ডকুমেন্টেশন', en: 'BinGi docs' })}<span className="chip ml-1">{DOCS_VERSION.split(' · ')[0]}</span></Link>
        <div className="flex flex-wrap items-center gap-2">
          <a href={asset('/llms-full.txt')} className="btn-ghost h-10 px-4 text-[14px]"><Bot className="size-4" aria-hidden="true" />llms-full.txt</a>
          <CopyButton text={copyAll} label={t({ bn: 'সব ডক AI-এর জন্য কপি', en: 'Copy all docs for AI' })} variant="primary" />
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-2">
          <label className="relative block">
            <span className="sr-only">Search docs</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true) }} placeholder={t({ bn: `${count}টা পাতায় খুঁজুন`, en: `Search ${count} pages` })}
              className="h-11 w-full rounded-[12px] border border-line bg-white pl-9 pr-3 text-[14px] focus:outline-2 focus:outline-link" />
          </label>
          <button onClick={() => setOpen(!open)} aria-expanded={open} className="btn-ghost mt-3 h-10 w-full justify-between px-4 text-[14px] lg:hidden">
            {t({ bn: 'সব পাতা', en: 'All pages' })}<span aria-hidden="true">{open ? '−' : '+'}</span>
          </button>
          <div className={`mt-4 ${open ? 'block' : 'hidden'} lg:block`}><DocsNav q={q} /></div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
