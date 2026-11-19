import { useEffect, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Monitor, Smartphone, X } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { asset } from '@/lib/utils'
import { demoUrl } from '@/data/themes'
import { ios } from '@/lib/motion'

// Theme demos open inside the page (an iframe of our own /theme-demo build), so they work in the
// sandboxed preview too, where new-tab links have nowhere to go.
type Open = { slug: string; name: string }
export const openTheme = (slug: string, name: string) => (e?: MouseEvent) => {
  e?.preventDefault()
  window.dispatchEvent(new CustomEvent<Open>('bingi:theme', { detail: { slug, name } }))
}

export function ThemeViewer() {
  const { t } = useLang()
  const [cur, setCur] = useState<Open | null>(null)
  const [device, setDevice] = useState<'desk' | 'phone'>('desk')
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const on = (e: Event) => { setCur((e as CustomEvent<Open>).detail); setLoaded(false) }
    const msg = (e: MessageEvent) => e.data === 'bingi:close-theme' && setCur(null)
    window.addEventListener('bingi:theme', on); window.addEventListener('message', msg)
    return () => { window.removeEventListener('bingi:theme', on); window.removeEventListener('message', msg) }
  }, [])
  useEffect(() => {
    if (!cur) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setCur(null)
    document.addEventListener('keydown', k)
    const o = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.documentElement.style.overflow = o }
  }, [cur])
  if (typeof document === 'undefined') return null
  const src = cur ? asset(demoUrl(cur.slug)) : ''
  const single = import.meta.env.MODE === 'single'
  return createPortal(
    <AnimatePresence>
      {cur && (
        <motion.div className="fixed inset-0 z-[90] flex flex-col bg-[#E9ECF1]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          role="dialog" aria-modal="true" aria-label={`${cur.name} — ${t({ bn: 'লাইভ ডেমো', en: 'live demo' })}`}>
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-3 sm:px-5">
            <span className="text-[16px] font-semibold">{cur.name}</span>
            <span className="hidden text-[13px] text-muted-foreground sm:inline">{t({ bn: 'ডেমো হোটেল — কিছু সত্যি বুক হয় না', en: 'Demo hotel — nothing is really booked' })}</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden rounded-full bg-canvas p-1 md:flex" role="group" aria-label={t({ bn: 'স্ক্রিন সাইজ', en: 'Screen size' })}>
                {([['desk', Monitor, { bn: 'ডেস্কটপ', en: 'Desktop' }], ['phone', Smartphone, { bn: 'মোবাইল', en: 'Mobile' }]] as const).map(([id, I, l]) => (
                  <button key={id} type="button" onClick={() => setDevice(id)} aria-pressed={device === id} aria-label={t(l)}
                    className={`grid h-9 w-11 cursor-pointer place-items-center rounded-full ${device === id ? 'bg-white text-ink shadow-sm' : 'text-muted-foreground'}`}><I className="size-[18px]" /></button>
                ))}
              </div>
              {!single && <a href={src} target="_blank" rel="noopener" className="hidden h-11 items-center gap-1 rounded-full px-3 text-[14px] font-medium text-link hover:bg-canvas sm:inline-flex">{t({ bn: 'নতুন ট্যাবে', en: 'New tab' })}<ArrowUpRight className="size-4" /></a>}
              <button type="button" onClick={() => setCur(null)} aria-label={t({ bn: 'বন্ধ করুন', en: 'Close' })} className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-canvas"><X className="size-5" /></button>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 justify-center overflow-hidden md:p-4">
            {!loaded && <div className="absolute inset-0 grid place-items-center text-[14px] text-muted-foreground">{t({ bn: 'ডেমো লোড হচ্ছে…', en: 'Loading demo…' })}</div>}
            <motion.div layout transition={ios} className={`relative h-full overflow-hidden bg-white ${device === 'phone' ? 'w-[400px] max-w-full md:rounded-[28px] md:shadow-[0_20px_60px_-25px_rgb(16_24_40/0.45)]' : 'w-full md:rounded-[14px] md:shadow-[0_20px_60px_-30px_rgb(16_24_40/0.4)]'}`}>
              <iframe key={cur.slug} src={src} title={`${cur.name} — demo`} onLoad={() => setLoaded(true)} className={`size-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
