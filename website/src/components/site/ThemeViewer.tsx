import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Check, Maximize2, Minimize2, Monitor, Palette, Smartphone, X } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { asset } from '@/lib/utils'
import { demoUrl } from '@/data/themes'
import { ios } from '@/lib/motion'
import { track } from '@/lib/track'

// Theme demos open inside the page (an iframe of our own /theme-demo build), so they work in the
// sandboxed preview too, where new-tab links have nowhere to go.
type Open = { slug: string; name: string }
type State = { themes: { id: string; name: string; brand: string }[]; active: string; heading: 'sans' | 'serif'; layout?: string }
export const openTheme = (slug: string, name: string) => (e?: MouseEvent) => {
  e?.preventDefault()
  track('theme_demo')
  window.dispatchEvent(new CustomEvent<Open>('bingi:theme', { detail: { slug, name } }))
}

export function ThemeViewer() {
  const { t } = useLang()
  const [cur, setCur] = useState<Open | null>(null)
  const [device, setDevice] = useState<'desk' | 'phone'>('desk')
  const [loaded, setLoaded] = useState(false)
  const [st, setSt] = useState<State | null>(null)
  const [full, setFull] = useState(false)
  const [pal, setPal] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const send = (m: { colour?: string; heading?: string }) => frame.current?.contentWindow?.postMessage({ type: 'bingi:theme-set', ...m }, '*')
  const toggleFull = async () => {
    if (full) { setFull(false); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); return }
    setFull(true) // the bar hides either way; real browser fullscreen when the frame allows it
    try { await box.current?.requestFullscreen?.() } catch { /* sandbox may refuse — the viewer already fills the page */ }
  }
  useEffect(() => {
    const fs = () => { if (!document.fullscreenElement) setFull(false) }
    document.addEventListener('fullscreenchange', fs)
    return () => document.removeEventListener('fullscreenchange', fs)
  }, [])
  useEffect(() => {
    const on = (e: Event) => { setCur((e as CustomEvent<Open>).detail); setLoaded(false); setSt(null); setFull(false); setPal(false) }
    const msg = (e: MessageEvent) => {
      if (e.data === 'bingi:close-theme') setCur(null)
      else if (e.data?.type === 'bingi:theme-state') setSt(e.data as State)
    }
    window.addEventListener('bingi:theme', on); window.addEventListener('message', msg)
    return () => { window.removeEventListener('bingi:theme', on); window.removeEventListener('message', msg) }
  }, [])
  useEffect(() => {
    if (!cur) return
    const k = (e: KeyboardEvent) => { if (e.key !== 'Escape') return; if (pal) setPal(false); else if (full) setFull(false); else setCur(null) }
    document.addEventListener('keydown', k)
    const o = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.documentElement.style.overflow = o }
  }, [cur, full, pal])
  if (typeof document === 'undefined') return null
  const src = cur ? asset(demoUrl(cur.slug)) : ''
  const single = import.meta.env.MODE === 'single'
  return createPortal(
    <AnimatePresence>
      {cur && (
        <motion.div className="fixed inset-0 z-[90] flex flex-col bg-[#E9ECF1]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          role="dialog" aria-modal="true" aria-label={`${cur.name} — ${t({ bn: 'লাইভ ডেমো', en: 'live demo' })}`}>
          {!full && <div className="relative flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-3 sm:px-5">
            <span className="text-[16px] font-semibold">{st?.layout ?? cur.name}</span>
            <span className="hidden text-[13px] text-muted-foreground xl:inline">{t({ bn: 'ডেমো হোটেল — কিছু সত্যি বুক হয় না', en: 'Demo hotel — nothing is really booked' })}</span>
            {st && (
              <div className="ml-2 hidden items-center gap-1.5 lg:flex" role="radiogroup" aria-label={t({ bn: 'রং', en: 'Colour' })}>
                {st.themes.map((c) => (
                  <button key={c.id} type="button" role="radio" aria-checked={st.active === c.id} aria-label={c.name} title={c.name} onClick={() => send({ colour: c.id })}
                    className={`grid size-7 cursor-pointer place-items-center rounded-full transition-transform hover:scale-110 ${st.active === c.id ? 'ring-2 ring-ink ring-offset-2' : ''}`} style={{ background: c.brand }}>
                    {st.active === c.id && <Check className="size-3.5 text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              {st && <Fonts st={st} send={send} className="hidden lg:flex" />}
              {st && <button type="button" onClick={() => setPal(!pal)} aria-expanded={pal} aria-label={t({ bn: 'রং বদলান', en: 'Change colour' })} className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-canvas lg:hidden"><Palette className="size-5" /></button>}
              <div className="hidden rounded-full bg-canvas p-1 md:flex" role="group" aria-label={t({ bn: 'স্ক্রিন সাইজ', en: 'Screen size' })}>
                {([['desk', Monitor, { bn: 'ডেস্কটপ', en: 'Desktop' }], ['phone', Smartphone, { bn: 'মোবাইল', en: 'Mobile' }]] as const).map(([id, I, l]) => (
                  <button key={id} type="button" onClick={() => setDevice(id)} aria-pressed={device === id} aria-label={t(l)}
                    className={`grid h-9 w-11 cursor-pointer place-items-center rounded-full ${device === id ? 'bg-white text-ink shadow-sm' : 'text-muted-foreground'}`}><I className="size-[18px]" /></button>
                ))}
              </div>
              {!single && <a href={src} target="_blank" rel="noopener" className="hidden h-11 items-center gap-1 rounded-full px-3 text-[14px] font-medium text-link hover:bg-canvas sm:inline-flex">{t({ bn: 'নতুন ট্যাবে', en: 'New tab' })}<ArrowUpRight className="size-4" /></a>}
              <button type="button" onClick={toggleFull} aria-label={t({ bn: 'ফুল স্ক্রিন', en: 'Full screen' })} title={t({ bn: 'ফুল স্ক্রিন', en: 'Full screen' })} className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-canvas"><Maximize2 className="size-[18px]" /></button>
              <button type="button" onClick={() => setCur(null)} aria-label={t({ bn: 'বন্ধ করুন', en: 'Close' })} className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-canvas"><X className="size-5" /></button>
            </div>
            {pal && st && (
              <div className="absolute right-3 top-[60px] z-10 w-[300px] rounded-[20px] border border-line bg-white p-4 shadow-[0_20px_50px_-20px_rgb(16_24_40/0.4)] lg:hidden">
                <p className="text-[14px] font-semibold">{t({ bn: 'রং', en: 'Colour' })}</p>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {st.themes.map((c) => (
                    <button key={c.id} type="button" onClick={() => send({ colour: c.id })} aria-pressed={st.active === c.id} aria-label={c.name}
                      className={`grid size-11 cursor-pointer place-items-center rounded-full ${st.active === c.id ? 'ring-2 ring-ink ring-offset-2' : ''}`} style={{ background: c.brand }}>
                      {st.active === c.id && <Check className="size-4 text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between"><span className="text-[14px] font-semibold">{t({ bn: 'হেডিং ফন্ট', en: 'Heading font' })}</span><Fonts st={st} send={send} className="flex" /></div>
              </div>
            )}
          </div>}
          <div ref={box} className={`relative flex min-h-0 flex-1 justify-center overflow-hidden bg-[#E9ECF1] ${full ? '' : 'md:p-4'}`}>
            {!loaded && <div className="absolute inset-0 grid place-items-center text-[14px] text-muted-foreground">{t({ bn: 'ডেমো লোড হচ্ছে…', en: 'Loading demo…' })}</div>}
            <motion.div layout transition={ios} className={`relative h-full overflow-hidden bg-white ${device === 'phone' ? 'w-[400px] max-w-full md:rounded-[28px] md:shadow-[0_20px_60px_-25px_rgb(16_24_40/0.45)]' : 'w-full md:rounded-[14px] md:shadow-[0_20px_60px_-30px_rgb(16_24_40/0.4)]'}`}>
              <iframe ref={frame} key={cur.slug} src={src} title={`${cur.name} — demo`} onLoad={() => setLoaded(true)} className={`size-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
            </motion.div>
            {full && <button type="button" onClick={toggleFull} aria-label={t({ bn: 'ফুল স্ক্রিন বন্ধ', en: 'Exit full screen' })} className="absolute bottom-4 right-4 z-10 flex h-11 cursor-pointer items-center gap-2 rounded-full bg-ink/80 px-4 text-[14px] font-medium text-white shadow-lg backdrop-blur hover:bg-ink"><Minimize2 className="size-4" />{t({ bn: 'বের হন', en: 'Exit' })}</button>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function Fonts({ st, send, className }: { st: State; send: (m: { heading: string }) => void; className: string }) {
  return (
    <div className={`${className} rounded-full bg-canvas p-1`} role="group" aria-label="Heading font">
      {(['sans', 'serif'] as const).map((h) => (
        <button key={h} type="button" onClick={() => send({ heading: h })} aria-pressed={st.heading === h}
          className={`h-9 cursor-pointer rounded-full px-3 text-[13px] font-medium ${st.heading === h ? 'bg-white text-ink shadow-sm' : 'text-muted-foreground'} ${h === 'serif' ? 'font-serif' : ''}`}>{h === 'sans' ? 'Sans' : 'Serif'}</button>
      ))}
    </div>
  )
}
