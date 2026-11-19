import { track } from '@/lib/track'
import { Announcement, Consent } from '@/components/site/Consent'
import { ThemeViewer } from '@/components/site/ThemeViewer'
import { DemoModal, FloatingWhatsApp, openDemo } from '@/components/site/Demo'
import { FooterSkyline } from './FooterSkyline'
import { useRef, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { markHydrated } from '../ui/timeline-animation'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Lenis from 'lenis'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PillTabs } from '../ui/Ui'
import { ios } from '../../lib/motion'
import { Logo } from './Logo'
import { useLang } from '../../i18n/lang'
import { site } from '../../data/site'
import { nav, footer } from '../../data/nav'
import { prefetch } from '../../routes'
import { notFoundSeo, seo } from '../../data/seo'


export const ctaLabel = { bn: 'শুরু করুন', en: 'Get started' }

// The pill slides first (local state), then the page text cross-fades to the new language.
function LangToggle() {
  const { lang, setLang } = useLang()
  const [shown, setShown] = useState(lang)
  useEffect(() => setShown(lang), [lang])
  const change = (l: typeof lang) => {
    if (l === lang) return
    setShown(l)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    window.setTimeout(() => {
      if (!reduce && doc.startViewTransition) {
        document.documentElement.classList.add('lang-vt')
        const vt = doc.startViewTransition(() => flushSync(() => setLang(l))) as { finished?: Promise<void> }
        vt.finished?.finally(() => document.documentElement.classList.remove('lang-vt'))
      } else setLang(l)
    }, reduce ? 0 : 220)
  }
  return <PillTabs tone="ink" size="sm" label="Language" value={shown} onChange={change} options={[{ id: 'bn', label: 'বাংলা' }, { id: 'en', label: 'EN' }]} />
}

function Header() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 border-b ${scrolled || open ? 'bg-white/90 backdrop-blur-xl backdrop-saturate-150 border-line shadow-[0_6px_24px_-12px_rgb(16_24_40/0.18)]' : 'bg-transparent border-transparent'}`}>
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="BinGi home" className="flex h-11 shrink-0 items-center"><Logo className="h-9" /></Link>
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
          {nav.filter((n) => !n.phoneOnly).map((n) => (
            <NavLink key={n.to} to={n.to} onMouseEnter={() => prefetch(n.to)} onFocus={() => prefetch(n.to)} onTouchStart={() => prefetch(n.to)} className={({ isActive }) => `rounded-full px-2.5 xl:px-4 h-10 inline-flex items-center whitespace-nowrap text-[14px] xl:text-[15px] transition-colors duration-200 ${isActive ? 'text-ink font-medium' : 'text-muted-foreground hover:text-ink'}`}>
              {t(n.label)}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:flex shrink-0 items-center gap-2">
          <LangToggle />
          <a href={site.hmsLogin} className="btn-ghost h-10">{t({ bn: 'লগইন', en: 'Sign in' })}</a>
          <a href={site.hmsRegister} className="btn-primary h-10">{t(ctaLabel)}</a>
        </div>
        <button className="lg:hidden grid size-11 place-items-center rounded-full border border-line bg-white cursor-pointer" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div key="menu" initial={reduce ? false : { opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.16 } }}
            transition={ios} style={{ transformOrigin: 'top right' }} className="lg:hidden border-t border-line bg-white/95 backdrop-blur-xl">
            <nav className="container-x flex flex-col py-3" aria-label="Mobile">
              {nav.map((n, i) => (
                <motion.div key={n.to} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...ios, delay: 0.03 * i }}>
                  <NavLink to={n.to} className="h-12 flex items-center text-[17px] border-b border-line">{t(n.label)}</NavLink>
                </motion.div>
              ))}
              <div className="flex items-center gap-2 pt-4 pb-2">
                <LangToggle />
                <a href={site.hmsLogin} className="btn-ghost flex-1">{t({ bn: 'লগইন', en: 'Sign in' })}</a>
              </div>
              <a href={site.hmsRegister} className="btn-primary w-full mt-2">{t(ctaLabel)}</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function Footer() {
  const { t } = useLang()
  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-white mt-16 md:mt-20 pb-20 lg:pb-0">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[180px] bg-[radial-gradient(60%_80%_at_50%_100%,#FFE7E4_0%,rgb(255_241_239/.6)_45%,transparent_75%)]" />
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1 space-y-4">
          <Logo className="h-9" />
          <p className="text-[14px] text-muted-foreground max-w-[320px] leading-relaxed hidden md:block">{t({ bn: 'হোটেল টিম হোটেল চালায়; BinGi চালায় হোটেলের টেকনোলজি।', en: "The hotel team runs the hotel; BinGi runs the hotel's technology." })}</p>
          <FooterSkyline className="hidden h-auto w-full max-w-[360px] text-brand opacity-[0.24] md:block md:pt-6" />
        </div>
        {footer.map((col) => (
          <div key={col.title.en}>
            <h2 className="text-[13px] font-semibold text-ink mb-3">{t(col.title)}</h2>
            <ul className="space-y-2 text-[14px] text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.label.en + l.to}>
                  {l.kind === 'demo' ? <button type="button" onClick={openDemo} className="-my-3 inline-flex min-h-11 cursor-pointer items-center hover:text-ink">{t(l.label)}</button>
                    : l.kind === 'whatsapp' ? <a className="hover:text-ink" href={site.whatsapp}>{t(l.label)}</a>
                    : /^https?:/.test(l.to) ? <a className="hover:text-ink" href={l.to} target="_blank" rel="noopener">{t(l.label)}</a>
                    : <Link className="hover:text-ink" to={l.to}>{t(l.label)}{l.badge && <span className="ml-1 text-[12px] text-link">{t(l.badge)}</span>}</Link>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div>
        <div className="container-x flex flex-col md:flex-row gap-2 justify-between py-4 text-[13px] text-muted-foreground">
          <span>© 2026 {site.company} · {site.parent}</span>
          <span>{t(site.address)} · {site.phone}</span>
        </div>
      </div>
    </footer>
  )
}

function MobileCta() {
  const { t } = useLang()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 480)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <div className={`lg:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 bg-white/90 backdrop-blur-xl border-t border-line shadow-[0_-8px_24px_-12px_rgb(16_24_40/0.2)] transition-transform duration-500 ease-spring ${show ? 'translate-y-0' : 'translate-y-full'}`} aria-hidden={!show}>
      <div className="flex gap-2">
        <a href={site.hmsRegister} tabIndex={show ? 0 : -1} className="btn-primary flex-1 h-12">{t(ctaLabel)}</a>
        <a href={site.whatsapp} tabIndex={show ? 0 : -1} className="btn-ghost h-12 px-4">WhatsApp</a>
      </div>
    </div>
  )
}

// Smooth inertial scroll on desktop pointers only; off for touch and reduced motion.
function useSmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer: fine)').matches) return
    const lenis = new Lenis({ autoRaf: true, lerp: 0.11 })
    return () => lenis.destroy()
  }, [])
}

export function Layout() {
  const { pathname } = useLocation()
  useSmoothScroll()
  const firstPath = useRef(pathname)
  if (pathname !== firstPath.current) markHydrated() // during render, before the new page's effects: reveals play on client-side navigation only
  useEffect(() => {
    window.scrollTo(0, 0)
    const key = pathname.replace(/\/+$/, '') || '/'
    if (key.startsWith('/docs')) return // docs pages set their own title
    const m = seo[key] ?? notFoundSeo
    track('pageview', key)
    document.title = m.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', m.description)
  }, [pathname])
  return (
    <div className="min-h-dvh flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      <Announcement />
      <Header />
      <main id="main" className="flex-1"><div key={pathname.startsWith('/docs/') ? '/docs/*' : pathname} className="animate-page-in"><Outlet /></div></main>
      <Footer />
      <MobileCta />
      <FloatingWhatsApp />
      <DemoModal />
      <ThemeViewer />
      <Consent />
    </div>
  )
}
