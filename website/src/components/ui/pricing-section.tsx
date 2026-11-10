import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import NumberFlow from '@number-flow/react'
import { motion, type Variants } from 'motion/react'
import { BedDouble, Building2, CheckCheck, Headset, Minus, Percent, Plus, Sparkles, Workflow } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TimelineContent } from '@/components/ui/timeline-animation'
import { useLang, type L } from '@/i18n/lang'
import { site } from '@/data/site'
import { compare, cycles, MIN_BILLABLE, plans, priceFor, type Cycle, type Plan } from '@/data/pricing'
import { ios } from '@/lib/motion'

// Pricing section — structure and motion from the 21st.dev "pricing-section" component
// (blur timeline reveal, NumberFlow prices, gradient switch, icon features + includes list),
// re-coloured to BinGi (coral / brand red on Pearl) and fed with BinGi's real per-room catalogue.

const reveal: Variants = {
  visible: (i: number) => ({ y: 0, opacity: 1, filter: 'blur(0px)', transition: { delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }),
  hidden: { filter: 'blur(10px)', y: -20, opacity: 0 },
}

function PricingSwitch({ value, onChange }: { value: Cycle; onChange: (c: Cycle) => void }) {
  const { t, num } = useLang()
  return (
    <div className="flex justify-center">
      <div role="radiogroup" aria-label="Billing period" className="relative z-10 mx-auto flex w-fit max-w-full rounded-full border border-line bg-white/80 p-1 shadow-soft backdrop-blur">
        {cycles.map((c) => {
          const on = value === c.id
          return (
            <button key={c.id} role="radio" aria-checked={on} onClick={() => onChange(c.id)}
              className={`relative h-10 sm:h-12 shrink-0 cursor-pointer rounded-full px-3 sm:px-6 text-[14px] sm:text-[15px] font-medium transition-colors ${on ? 'text-white' : 'text-muted-foreground hover:text-ink'}`}>
              {on && (
                <motion.span layoutId="cycle-pill" transition={ios}
                  className="absolute inset-0 rounded-full border-4 border-brand bg-gradient-to-t from-brand via-[#D42F3C] to-[#E8404A] shadow-[0_6px_18px_-6px_rgb(177_28_41/0.6)]" />
              )}
              <span className="relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                {t(c.label)}
                {c.discount > 0 && (
                  <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[12px] font-semibold ${on ? 'bg-white/20 text-white' : 'bg-[#FFE7E4] text-brand'}`}>−{num(c.discount * 100)}%</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function RoomStepper({ rooms, setRooms }: { rooms: number; setRooms: (n: number) => void }) {
  const { t } = useLang()
  const set = (n: number) => setRooms(Math.max(1, Math.min(10000, Math.round(n) || 1)))
  return (
    <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-[22px] sm:rounded-full border border-line bg-white/80 py-1.5 pl-4 pr-1.5 shadow-soft backdrop-blur">
      <label htmlFor="rooms" className="flex items-center gap-2 text-[14px] font-medium"><BedDouble className="size-[18px] text-brand" aria-hidden="true" />{t({ bn: 'আপনার রুম', en: 'Your rooms' })}</label>
      <div className="flex items-center gap-1">
        <button onClick={() => set(rooms - 1)} className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-canvas" aria-label="Fewer rooms"><Minus className="size-4" /></button>
        <input id="rooms" type="number" inputMode="numeric" min={1} value={rooms} onChange={(e) => set(+e.target.value)}
          className="h-10 w-16 rounded-full bg-canvas text-center text-[16px] font-semibold tabular-nums focus:outline-2 focus:outline-link" />
        <button onClick={() => set(rooms + 1)} className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-canvas" aria-label="More rooms"><Plus className="size-4" /></button>
      </div>
      <input type="range" min={1} max={200} value={Math.min(rooms, 200)} onChange={(e) => set(+e.target.value)} aria-label="Rooms slider" className="h-10 w-36 cursor-pointer accent-[#B11C29] mr-2" />
    </div>
  )
}

type Feature = { icon: ReactNode; text: string }

export default function PricingSection() {
  const { t, taka, num, lang } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState<Cycle>('monthly')
  const [rooms, setRooms] = useState(20)
  const c = cycles.find((x) => x.id === cycle)!
  const locale = lang === 'bn' ? 'bn-BD' : 'en-US'

  const featuresFor = (p: Plan): Feature[] => {
    if (!p.rate) return [
      { icon: <Building2 size={18} />, text: t({ bn: 'একাধিক প্রপার্টি এক অ্যাকাউন্টে', en: 'Multiple properties, one account' }) },
      { icon: <Workflow size={18} />, text: t({ bn: 'আপনার মডিউল ও ওয়ার্কফ্লো', en: 'Your modules and workflow' }) },
      { icon: <Headset size={18} />, text: t({ bn: 'ডেডিকেটেড অনবোর্ডিং', en: 'Dedicated onboarding' }) },
    ]
    const pr = priceFor(p.rate, rooms, cycle)
    const f = p.fees!
    return [
      { icon: <BedDouble size={18} />, text: c.months === 1
        ? t({ bn: `${num(pr.q)} রুম · ${taka(pr.total)}/মাস`, en: `${pr.q} rooms · ${taka(pr.total)}/month` })
        : t({ bn: `${num(pr.q)} রুম · ${num(c.months)} মাসে ${taka(pr.total)}`, en: `${pr.q} rooms · ${taka(pr.total)} for ${c.months} months` }) },
      { icon: <Percent size={18} />, text: t({ bn: `বুকিং ফি: মার্কেটপ্লেস ${num(f.marketplace)}% · ওয়েব ${num(f.website)}% · ওয়াক-ইন ${num(f.walkin)}%`, en: `Booking fees: Marketplace ${f.marketplace}% · Web ${f.website}% · Walk-in ${f.walkin}%` }) },
      { icon: <Sparkles size={18} />, text: p.activation
        ? t({ bn: `অ্যাক্টিভেশন ${taka(p.activation.standard)} — এখন ${taka(p.activation.now)}`, en: `Activation ${taka(p.activation.standard)} — now ${taka(p.activation.now)}` })
        : t({ bn: 'কোনো অ্যাক্টিভেশন ফি নেই', en: 'No activation fee' }) },
    ]
  }

  const includesFor = (p: Plan): L[] => {
    if (p.id === 'custom') return [
      { bn: 'যা দরকার, শুধু সেটাই', en: 'Only what you need:' },
      { bn: 'মাইগ্রেশন ও ইন্টিগ্রেশন প্ল্যান', en: 'Migration and integration planning' },
      { bn: 'প্রপার্টি অনুযায়ী মডিউল', en: 'Modules per property' },
      { bn: 'প্রয়োজন দেখে কোটেশন', en: 'Quotation after review' },
    ]
    const rows = compare.flatMap((g) => g.rows).filter((r) => r.highlight === p.id).map((r) => r.name)
    if (p.id === 'starter') return [{ bn: 'Starter-এ আছে:', en: 'Starter includes:' }, ...rows, { bn: 'সীমিত ওয়েবসাইট থিম', en: 'Limited website themes' }]
    return [p.plus!, ...rows]
  }

  return (
    <div ref={ref} className="relative isolate overflow-hidden pb-4 pt-12 md:pt-20">
      {/* soft coral light (component's radial glow, BinGi colours) */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[10%] right-[10%] top-0 -z-10 h-[620px]"
        style={{ backgroundImage: 'radial-gradient(closest-side at 50% 40%, rgb(253 65 63 / .20) 0%, rgb(255 179 138 / .12) 45%, transparent 100%)' }} />

      <div className="container-x">
        <div className="mx-auto mb-6 max-w-3xl text-center">
          <TimelineContent as="h1" animationNum={0} timelineRef={ref} customVariants={reveal}
            className="font-[family-name:var(--font-display)] text-[34px] sm:text-[46px] md:text-[60px] font-semibold leading-[1.02] tracking-[-0.035em] text-ink">
            {t({ bn: 'যত রুম, তত দাম। কিছুই ', en: 'Pay per room. Nothing ' })}
            <TimelineContent as="span" animationNum={1} timelineRef={ref} customVariants={reveal}
              className="inline-block rounded-xl border border-dashed border-brand/50 bg-[#FFE7E4] px-2 py-0.5 text-brand">
              {t({ bn: 'লুকানো নয়', en: 'hidden' })}
            </TimelineContent>
          </TimelineContent>
          <TimelineContent as="p" animationNum={2} timelineRef={ref} customVariants={reveal}
            className="mx-auto mt-4 w-[90%] sm:w-[70%] text-[15px] sm:text-[17px] text-muted-foreground">
            {t({ bn: 'প্রতি রুমের মাসিক রেট। প্রতিটা খরচ আলাদা করে দেখানো।', en: 'A simple monthly rate per room. Every charge shown separately.' })}
          </TimelineContent>
        </div>

        <TimelineContent animationNum={3} timelineRef={ref} customVariants={reveal} className="space-y-3">
          <PricingSwitch value={cycle} onChange={setCycle} />
          <RoomStepper rooms={rooms} setRooms={setRooms} />
          <p className="text-center text-[13px] text-muted-foreground" aria-live="polite">
            {rooms < MIN_BILLABLE
              ? t({ bn: `সর্বনিম্ন বিলিং ${num(MIN_BILLABLE)} রুম — দাম ${num(MIN_BILLABLE)} রুম ধরে`, en: `Minimum billing is ${MIN_BILLABLE} rooms — prices shown for ${MIN_BILLABLE}` })
              : t({ bn: 'ট্যাক্স প্রযোজ্য হলে আলাদা', en: 'Taxes extra where applicable' })}
          </p>
        </TimelineContent>

        <div className="mx-auto grid max-w-7xl gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => {
            const pop = !!p.popular
            const pr = p.rate ? priceFor(p.rate, rooms, cycle) : null
            const inc = includesFor(p)
            return (
              <TimelineContent key={p.id} animationNum={4 + i} timelineRef={ref} customVariants={reveal} className="h-full">
                <Card className={`relative flex h-full flex-col ${pop ? 'border-transparent bg-[#FFF6F5] ring-2 ring-brand shadow-[0_24px_60px_-28px_rgb(177_28_41/0.45)]' : 'bg-white glow-hover'}`}>
                  <CardHeader className="p-5 lg:p-6 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[22px] lg:text-[24px] font-semibold tracking-tight text-ink">{p.name}</h2>
                      {pop && <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-[12px] font-semibold text-white">{t({ bn: 'জনপ্রিয়', en: 'Popular' })}</span>}
                    </div>
                    <p className="text-[14px] text-muted-foreground lg:min-h-[42px]">{t(p.tagline)}</p>
                    <div className="pt-2 lg:min-h-[64px]">
                      {pr ? (
                        <>
                          <div className="flex items-baseline gap-1 text-ink">
                            <span className="text-[36px] font-semibold leading-none tracking-tight">৳<NumberFlow value={pr.perRoom} locales={locale} format={{ maximumFractionDigits: 1 }} /></span>
                            <span className="text-[14px] text-muted-foreground">/{t({ bn: 'রুম/মাস', en: 'room/month' })}</span>
                          </div>
                          <p className="mt-1 lg:h-5 text-[13px] text-muted-foreground">
                            {c.discount > 0 && <><span className="line-through">{taka(p.rate!)}</span> · {t({ bn: `সাশ্রয় ${taka(pr.saved)}`, en: `save ${taka(pr.saved)}` })}</>}
                          </p>
                        </>
                      ) : (
                        <><p className="text-[32px] font-semibold leading-none tracking-tight text-ink">{t({ bn: 'কথা বলুন', en: "Let's talk" })}</p><p className="mt-1 lg:h-5 text-[13px] text-muted-foreground">{t({ bn: 'হোটেল গ্রুপ ও চেইন', en: 'For groups and chains' })}</p></>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col p-5 pt-0 lg:p-6 lg:pt-0">
                    {p.rate ? (
                      <a href={site.hmsRegister}
                        className={`mb-5 flex h-12 w-full items-center justify-center rounded-xl text-[16px] font-medium text-white transition-[transform,filter] duration-300 hover:brightness-110 active:scale-[.98] ${pop
                          ? 'border border-[#E0485A] bg-gradient-to-t from-brand to-[#D9343F] shadow-[0_10px_24px_-10px_rgb(177_28_41/0.75)]'
                          : 'border border-[#3B4652] bg-gradient-to-t from-ink to-[#4A5562] shadow-[0_10px_24px_-12px_rgb(15_23_32/0.6)]'}`}>
                        {t({ bn: `${p.name} শুরু করুন`, en: `Get started with ${p.name}` })}
                      </a>
                    ) : (
                      <Link to="/contact" className="mb-5 flex h-12 w-full items-center justify-center rounded-xl border border-line-strong bg-white text-[16px] font-medium text-ink transition-colors hover:bg-canvas">
                        {t({ bn: 'প্রয়োজন জানান', en: 'Discuss requirements' })}
                      </Link>
                    )}

                    <ul className="space-y-2.5 py-1">
                      {featuresFor(p).map((f, j) => (
                        <li key={j} className="flex items-start gap-3 text-[14px] text-ink/80">
                          <span className="mt-0.5 grid shrink-0 place-content-center text-brand">{f.icon}</span>
                          <span className="tabular-nums">{f.text}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 space-y-2.5 border-t border-line pt-4">
                      <h3 className="text-[14px] font-semibold text-ink">{t(inc[0])}</h3>
                      <ul className="space-y-2">
                        {inc.slice(1).map((x, j) => (
                          <li key={j} className="flex items-center gap-3 text-[14px] text-muted-foreground">
                            <span className={`grid size-6 shrink-0 place-content-center rounded-full border ${pop ? 'border-brand bg-white' : 'border-brand/40 bg-[#FFF1EF]'}`}>
                              <CheckCheck className="size-3.5 text-brand" aria-hidden="true" />
                            </span>
                            {t(x)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TimelineContent>
            )
          })}
        </div>
      </div>
    </div>
  )
}
