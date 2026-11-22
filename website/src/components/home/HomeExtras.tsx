import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Bot, Check, CreditCard, FileText, MessageSquareReply, Printer, KeyRound, X, Maximize2 } from 'lucide-react'
import { useLang, type L } from '@/i18n/lang'
import { asset } from '@/lib/utils'
import { ios } from '@/lib/motion'
import { plans, priceFor, includesFor, MIN_BILLABLE } from '@/data/pricing'
import { integrations, modules } from '@/data/status'
import { themes, demoUrl } from '@/data/themes'
import { testimonials, clientLogos } from '@/data/testimonials'
import { trustFacts } from '@/data/trust'
import { copy, shown } from '@/data/copy'
import { stories, type Story } from '@/data/stories'
import type { MediaId } from '@/data/media'
import { Media } from '@/components/media/Media'
import { StatusChip } from '@/components/ui/StatusChip'
import { openDemo } from '@/components/site/Demo'
import { openTheme } from '@/components/site/ThemeViewer'
import { track } from '@/lib/track'

/* ── Trust strip: only facts we can stand behind. Logos/quotes appear once real ones are added. ── */
export function TrustStrip() {
  const { t } = useLang()
  if (!shown('home.trust')) return null
  const live = modules.filter((m) => m.status === 'live').length
  const facts = trustFacts.map((f) => ({ v: t(f.value).replace('{liveModules}', String(live)), l: f.label }))
  return (
    <section className="container-x pt-10 md:pt-14" aria-label={t({ bn: 'কেন BinGi', en: 'Why BinGi' })}>
      {clientLogos.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-80">
          {clientLogos.map((c) => <img key={c.name} src={asset(c.src)} alt={c.name} className="h-8 w-auto grayscale" loading="lazy" />)}
        </div>
      )}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-line bg-line md:grid-cols-4">
        {facts.map((f) => (
          <div key={f.l.en} className="bg-white px-4 py-4 sm:px-5 sm:py-5 md:px-6">
            <dt className="sr-only">{t(f.l)}</dt>
            <dd className="font-[family-name:var(--font-display)] text-[24px] font-semibold tracking-[-0.03em] sm:text-[28px] md:text-[32px]">{f.v}</dd>
            <dd className="mt-0.5 text-[13px] leading-snug text-muted-foreground sm:text-[14px]">{t(f.l)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ── Testimonials: hidden until real, permitted quotes exist ── */
export function Testimonials() {
  const { t } = useLang()
  if (!shown('home.testimonials')) return null
  if (!testimonials.length) return null
  return (
    <section className="container-x pt-16 md:pt-24">
      <h2 className="h2 max-w-[560px]">{t({ bn: 'হোটেল ম্যানেজাররা যা বলেন', en: 'What hotel managers say' })}</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {testimonials.slice(0, 2).map((q) => (
          <figure key={q.name} className="card p-6 md:p-8">
            <blockquote className="text-[18px] leading-relaxed md:text-[20px]">“{t(q.quote)}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              {q.photo && <img src={asset(q.photo)} alt="" className="size-11 rounded-full object-cover" />}
              <span><span className="block font-semibold">{q.name}</span><span className="text-[14px] text-muted-foreground">{t(q.role)} · {q.property}</span></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ── Room slider: monthly bill per plan, from the one pricing catalog ── */
export function PriceSlider() {
  const { t, taka } = useLang()
  if (!shown('home.pricing')) return null
  const [rooms, setRooms] = useState(20)
  const moved = useRef(false)
  const paid = plans.filter((p) => p.rate)
  const pct = ((rooms - MIN_BILLABLE) / (200 - MIN_BILLABLE)) * 100
  return (
    <section className="container-x pt-16 md:pt-24" aria-labelledby="price-h">
      <div className="relative isolate glow-border rounded-[24px] border border-line bg-white px-5 py-8 shadow-soft md:px-10 md:py-12">
        <div className="ambient left-1/2 -bottom-10 h-[200px] w-[70%] -translate-x-1/2 opacity-50" aria-hidden="true" />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[520px]">
            <h2 id="price-h" className="h2">{t({ bn: 'আপনার হোটেলে মাসে কত?', en: 'What will it cost your hotel?' })}</h2>
            <p className="lead mt-3 hidden sm:block">{t({ bn: 'রুম সংখ্যা বদলান, মাসিক বিল দেখুন।', en: 'Set your rooms, see the monthly bill.' })}</p>
          </div>
          <div className="md:w-[380px]">
            <div className="flex items-baseline justify-between">
              <label htmlFor="rooms-slider" className="text-[15px] font-medium">{t({ bn: 'রুম', en: 'Rooms' })}</label>
              <output htmlFor="rooms-slider" className="font-[family-name:var(--font-display)] text-[28px] font-semibold tabular-nums">{rooms}</output>
            </div>
            <input id="rooms-slider" type="range" min={MIN_BILLABLE} max={200} step={1} value={rooms} onChange={(e) => { if (!moved.current) { moved.current = true; track('price_slider') } setRooms(+e.target.value) }}
              className="range-brand mt-2 w-full" style={{ ['--p' as string]: `${pct}%` }} />
            <div className="mt-1 flex justify-between text-[13px] text-soft"><span>{MIN_BILLABLE}</span><span>200</span></div>
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {paid.map((p) => {
            const pr = priceFor(p.rate!, rooms, 'monthly')
            return (
              <Link key={p.id} to={`/pricing#plan-${p.id}`} className={`group flex flex-col rounded-[18px] border p-5 transition-colors hover:border-brand/40 ${p.popular ? 'border-brand/30 bg-[#FFF6F5]' : 'border-line bg-white'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-[16px] font-semibold">{p.name}</p>
                  {p.popular && <span className="rounded-full bg-brand px-2.5 py-0.5 text-[12px] font-medium text-white">{t({ bn: 'জনপ্রিয়', en: 'Popular' })}</span>}
                </div>
                <p className="mt-2 font-[family-name:var(--font-display)] text-[28px] sm:mt-3 sm:text-[34px] font-semibold tracking-[-0.03em] tabular-nums">{taka(pr.perMonth)}<span className="ml-1 text-[15px] font-normal text-muted-foreground">/{t({ bn: 'মাস', en: 'mo' })}</span></p>
                <p className="text-[13px] text-soft">{taka(p.rate!)} × {pr.q} {t({ bn: 'রুম', en: pr.q === 1 ? 'room' : 'rooms' })}</p>
                <ul className="mt-4 hidden space-y-2 border-t border-line pt-4 text-[14px] sm:block">
                  {includesFor(p).slice(1, 4).map((x) => (
                    <li key={x.en} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden="true" /><span>{t(x)}</span></li>
                  ))}
                </ul>
                <span className="mt-auto pt-4 text-[14px] font-medium text-link group-hover:underline underline-offset-4">{t({ bn: 'বিস্তারিত দেখুন', en: 'See details' })}</span>
              </Link>
            )
          })}
        </div>
        <p className="mt-4 text-[13px] text-soft">{t({ bn: 'মাসিক দাম। 6 ও 12 মাসে কম; অ্যাক্টিভেশন ও বুকিং ফি প্রাইসিং পেজে।', en: 'Monthly price. 6 and 12 months cost less; activation and booking fees on the pricing page.' })}</p>
      </div>
    </section>
  )
}

/* ── Themes switcher + BinGi AI highlight ── */
const pick = ['nest', 'escape', 'grand']
export function ThemeAiPreview() {
  const { t } = useLang()
  if (!shown('home.themes-ai')) return null
  const list = themes.filter((x) => pick.includes(x.id))
  const [id, setId] = useState('grand')
  const th = list.find((x) => x.id === id)!
  const ai: { icon: typeof Bot; l: L }[] = [
    { icon: FileText, l: { bn: 'সকালের রিপোর্ট নিজে থেকে', en: 'A morning report, written for you' } },
    { icon: MessageSquareReply, l: { bn: 'গেস্টের মেসেজের উত্তর খসড়া', en: 'Draft replies to guest messages' } },
    { icon: Bot, l: { bn: 'প্রশ্ন করুন, উত্তর আপনার ডেটা থেকে', en: 'Ask a question, answered from your data' } },
  ]
  return (
    <section className="container-x pt-16 md:pt-24">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card overflow-hidden p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[22px] font-semibold tracking-tight">{t({ bn: 'আপনার হোটেলের ওয়েবসাইট, একটা ক্লিকে', en: 'Your hotel website, one click away' })}</h2>
            <div role="tablist" aria-label={t({ bn: 'থিম', en: 'Themes' })} className="flex rounded-full bg-canvas p-1">
              {list.map((x) => (
                <button key={x.id} role="tab" aria-selected={x.id === id} onClick={() => setId(x.id)}
                  className={`relative h-10 cursor-pointer rounded-full px-4 text-[14px] font-medium ${x.id === id ? 'text-ink' : 'text-muted-foreground'}`}>
                  {x.id === id && <motion.span layoutId="th-pill" transition={ios} className="absolute inset-0 rounded-full bg-white shadow-sm" />}
                  <span className="relative">{x.name}</span>
                </button>
              ))}
            </div>
          </div>
          <a href={asset(demoUrl(th.demo))} onClick={openTheme(th.demo, th.name)} className="group relative mt-5 block overflow-hidden rounded-[14px] border border-line bg-canvas">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img key={th.id} src={asset(`/media/themes/${th.id}.webp`)} alt={`${th.name} — ${t({ bn: 'ডেমো হোটেল', en: 'demo hotel' })}`} width={960} height={600}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="aspect-[16/10] w-full object-cover object-top" />
            </AnimatePresence>
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-medium shadow-sm">{t({ bn: 'লাইভ ডেমো', en: 'Live demo' })}<ArrowUpRight className="size-3.5" aria-hidden="true" /></span>
          </a>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[14px]">
            <p className="hidden text-muted-foreground sm:block">{t(th.for)}</p>
            <Link to="/themes" className="inline-flex min-h-11 items-center font-medium text-link hover:underline underline-offset-4">{t({ bn: 'সব থিম দেখুন', en: 'See all themes' })}</Link>
          </div>
        </div>
        <Link to="/ai" className="card group flex flex-col bg-[linear-gradient(160deg,#16405F,#0B2235)] p-6 text-white md:p-7">
          <div className="flex items-center justify-between">
            <span className="text-[20px] font-semibold">BinGi AI</span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[12px] font-medium">{t({ bn: 'বেটা', en: 'Beta' })}</span>
          </div>
          <p className="mt-2 text-[15px] text-white/75">{t({ bn: 'হোটেল মালিকের জন্য সহকারী — আপনার কম্পিউটারে চলে।', en: 'An assistant for hotel owners — runs on your own computer.' })}</p>
          <ul className="mt-6 hidden space-y-3 sm:block">
            {ai.map(({ icon: I, l }) => (
              <li key={l.en} className="flex items-center gap-3 rounded-[14px] bg-white/8 px-4 py-3 text-[15px]"><I className="size-5 shrink-0 text-[#FFB38A]" aria-hidden="true" />{t(l)}</li>
            ))}
          </ul>
          <span className="mt-auto inline-flex items-center gap-1 pt-6 text-[15px] font-medium">{t({ bn: 'BinGi AI দেখুন', en: 'Explore BinGi AI' })}<ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></span>
        </Link>
      </div>
    </section>
  )
}

/* ── Local payments & hardware — honest status per item ── */
export function Integrations() {
  const { t } = useLang()
  // 'confirm' = not checked in production yet → not shown. Mark an item live/beta/soon in Admin → Status and it appears.
  const items = integrations.filter((x) => x.status !== 'confirm')
  if (!shown('home.integrations') || !items.length) return null
  return (
    <section className="container-x pt-16 md:pt-24" aria-labelledby="int-h">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 id="int-h" className="h2 max-w-[560px]">{t({ bn: 'বাংলাদেশের পেমেন্ট ও হার্ডওয়্যার', en: 'Local payments and hardware' })}</h2>
        <button type="button" onClick={openDemo} className="inline-flex min-h-11 cursor-pointer items-center text-[16px] font-medium text-link hover:underline underline-offset-4">{t({ bn: 'আপনার সেটআপ নিয়ে জিজ্ঞেস করুন', en: 'Ask about your setup' })}</button>
      </div>
      <ul className="mt-6 flex flex-wrap gap-3">
        {items.map((x) => {
          const I = x.kind === 'pay' ? CreditCard : x.id === 'printer' ? Printer : KeyRound
          return (
            <li key={x.id} className="flex items-center gap-3 rounded-full border border-line bg-white py-2 pl-3 pr-2">
              <I className="size-[18px] text-ink/70" aria-hidden="true" />
              <span className="text-[15px] font-medium">{t(x.name)}</span>
              <StatusChip status={x.status} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ── Click-to-zoom for module cards ── */
export function useZoom() {
  const [id, setId] = useState<{ media: MediaId; title: string } | null>(null)
  return { open: (media: MediaId, title: string) => setId({ media, title }), node: <Zoom item={id} close={() => setId(null)} /> }
}
function Zoom({ item, close }: { item: { media: MediaId; title: string } | null; close: () => void }) {
  const { t } = useLang()
  useEffect(() => {
    if (!item) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [item, close])
  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-ink/55 p-4 backdrop-blur-sm md:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.figure role="dialog" aria-modal="true" aria-label={item.title} onClick={(e) => e.stopPropagation()} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }} transition={ios}
            className="w-full max-w-[1200px] overflow-hidden rounded-[20px] bg-white shadow-2xl">
            <figcaption className="flex items-center justify-between px-5 py-3">
              <span className="text-[16px] font-semibold">{item.title}</span>
              <button type="button" onClick={close} aria-label={t({ bn: 'বন্ধ করুন', en: 'Close' })} className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-canvas"><X className="size-5" /></button>
            </figcaption>
            <Media id={item.media} />
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
export const ZoomHint = () => <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100" aria-hidden="true"><Maximize2 className="size-4" /></span>

/* ── Customer stories: the 3 newest published ones (none published → section hidden; samples only in the preview build) ── */
export function StoriesStrip() {
  const { t, num } = useLang()
  if (!stories.length || !shown('home.stories')) return null
  const list = stories.slice(0, 3)
  return (
    <section className="container-x pt-16 md:pt-24" aria-labelledby="stories-h">
      <div className="flex items-end justify-between gap-4">
        <h2 id="stories-h" className="h2 max-w-[560px]">{t(copy('home.stories.title', { bn: 'যারা BinGi দিয়ে চালান', en: 'Properties that run on BinGi' }))}</h2>
        <Link to="/customers" className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-[16px] font-medium text-link hover:underline underline-offset-4">
          <span className="hidden sm:inline">{t({ bn: 'সব গল্প দেখুন', en: 'All stories' })}</span><span className="sm:hidden">{t({ bn: 'সব দেখুন', en: 'See all' })}</span>
        </Link>
      </div>
      <ul className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:mt-8 md:grid md:grid-cols-3 md:overflow-visible md:px-0 [scrollbar-width:none]">
        {list.map((s) => (
          <li key={s.slug} className="w-[82%] shrink-0 snap-start sm:w-[60%] md:w-auto">
            <Link to={`/customers/${s.slug}`} className="card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[0_20px_50px_-24px_rgb(16_24_40/0.35)]">
              {s.cover && <img src={asset(s.cover.src)} alt={t(s.cover.alt)} loading="lazy" className="aspect-[16/10] w-full object-cover" />}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                  {s.sample && <span className="rounded-full bg-[#FEF2E2] px-2 py-0.5 text-[12px] font-semibold text-[#92400E]">{t({ bn: 'নমুনা', en: 'Sample' })}</span>}
                  <span>{t(storyTypeL[s.propertyType])}{s.rooms ? ` · ${num(s.rooms)} ${t({ bn: 'রুম', en: s.rooms === 1 ? 'room' : 'rooms' })}` : ''}</span>
                </div>
                <h3 className="mt-2 text-[18px] font-semibold leading-snug tracking-tight">{t(s.headline)}</h3>
                <span className="mt-auto pt-4 text-[14px] text-muted-foreground">{s.property.replace(/ \(sample\)$/, '')} · {t(s.location)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
const storyTypeL: Record<Story['propertyType'], L> = { home: { bn: 'হোম স্টে', en: 'Home stay' }, guest: { bn: 'গেস্ট হাউস', en: 'Guest house' }, hotel: { bn: 'হোটেল', en: 'Hotel' }, resort: { bn: 'রিসোর্ট', en: 'Resort' }, group: { bn: 'হোটেল গ্রুপ', en: 'Hotel group' } }
