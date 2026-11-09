import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Lenis from 'lenis'
import { Logo } from './Logo'
import { useLang } from '../../i18n/lang'
import { site } from '../../data/site'
import { prefetch } from '../../routes'

const nav = [
  { to: '/products', label: { bn: 'প্রোডাক্ট', en: 'Products' } },
  { to: '/pricing', label: { bn: 'প্রাইসিং', en: 'Pricing' } },
  { to: '/help', label: { bn: 'হেল্প', en: 'Help' } },
  { to: '/contact', label: { bn: 'যোগাযোগ', en: 'Contact' } },
]

export const ctaLabel = { bn: 'শুরু করুন', en: 'Get started' }

function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="inline-flex rounded-full border border-line bg-white p-0.5 text-[13px]" role="group" aria-label="Language">
      {(['bn', 'en'] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`h-8 min-w-11 rounded-full px-3 font-medium cursor-pointer transition-colors duration-150 ${lang === l ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}>
          {l === 'bn' ? 'বাংলা' : 'EN'}
        </button>
      ))}
    </div>
  )
}

function Header() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
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
        <Link to="/" aria-label="BinGi home"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} onMouseEnter={() => prefetch(n.to)} onFocus={() => prefetch(n.to)} onTouchStart={() => prefetch(n.to)} className={({ isActive }) => `rounded-full px-4 h-10 inline-flex items-center text-[15px] transition-colors duration-200 ${isActive ? 'text-ink font-medium' : 'text-muted hover:text-ink'}`}>
              {t(n.label)}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <LangToggle />
          <a href={site.hmsLogin} className="btn-ghost h-10">{t({ bn: 'লগইন', en: 'Sign in' })}</a>
          <a href={site.hmsRegister} className="btn-primary h-10">{t(ctaLabel)}</a>
        </div>
        <button className="md:hidden grid size-11 place-items-center rounded-full border border-line bg-white cursor-pointer" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-line bg-white">
          <nav className="container-x flex flex-col py-3" aria-label="Mobile">
            {nav.map((n) => <NavLink key={n.to} to={n.to} className="h-12 flex items-center text-[16px] border-b border-line last:border-0">{t(n.label)}</NavLink>)}
            <div className="flex items-center gap-2 pt-4 pb-2">
              <LangToggle />
              <a href={site.hmsLogin} className="btn-ghost flex-1">{t({ bn: 'লগইন', en: 'Sign in' })}</a>
            </div>
            <a href={site.hmsRegister} className="btn-primary w-full mt-2">{t(ctaLabel)}</a>
          </nav>
        </div>
      )}
    </header>
  )
}

function Footer() {
  const { t } = useLang()
  return (
    <footer className="border-t border-line bg-white mt-24 pb-20 md:pb-0">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo className="h-7" />
          <p className="text-[14px] text-muted max-w-[320px] leading-relaxed">{t({ bn: 'হোটেল টিম হোটেল চালায়; BinGi চালায় হোটেলের টেকনোলজি।', en: "The hotel team runs the hotel; BinGi runs the hotel's technology." })}</p>
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-ink mb-3">{t({ bn: 'প্রোডাক্ট', en: 'Product' })}</h3>
          <ul className="space-y-2 text-[14px] text-muted">
            <li><Link className="hover:text-ink" to="/products">{t({ bn: 'প্ল্যাটফর্ম ও মডিউল', en: 'Platforms & modules' })}</Link></li>
            <li><Link className="hover:text-ink" to="/pricing">{t({ bn: 'প্রাইসিং', en: 'Pricing' })}</Link></li>
            <li><a className="hover:text-ink" href={site.marketplace}>{t({ bn: 'BinGi মার্কেটপ্লেস', en: 'BinGi Marketplace' })}</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-ink mb-3">{t({ bn: 'সাপোর্ট', en: 'Support' })}</h3>
          <ul className="space-y-2 text-[14px] text-muted">
            <li><Link className="hover:text-ink" to="/help">{t({ bn: 'হেল্প সেন্টার', en: 'Help center' })}</Link></li>
            <li><a className="hover:text-ink" href={site.whatsapp}>WhatsApp</a></li>
            <li><Link className="hover:text-ink" to="/contact">{t({ bn: 'ডেমো বুক করুন', en: 'Book a demo' })}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-ink mb-3">{t({ bn: 'কোম্পানি', en: 'Company' })}</h3>
          <ul className="space-y-2 text-[14px] text-muted">
            <li><Link className="hover:text-ink" to="/contact">{t({ bn: 'আমাদের সম্পর্কে', en: 'About us' })}</Link></li>
            <li><Link className="hover:text-ink" to="/legal/privacy">{t({ bn: 'প্রাইভেসি', en: 'Privacy' })}</Link></li>
            <li><Link className="hover:text-ink" to="/legal/terms">{t({ bn: 'শর্তাবলি', en: 'Terms' })}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col md:flex-row gap-2 justify-between py-5 text-[13px] text-muted">
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
    <div className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 bg-white/90 backdrop-blur-xl border-t border-line shadow-[0_-8px_24px_-12px_rgb(16_24_40/0.2)] transition-transform duration-500 ease-spring ${show ? 'translate-y-0' : 'translate-y-full'}`} aria-hidden={!show}>
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
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="min-h-dvh flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      <Header />
      <main id="main" className="flex-1"><div key={pathname} className="animate-page-in"><Outlet /></div></main>
      <Footer />
      <MobileCta />
    </div>
  )
}
