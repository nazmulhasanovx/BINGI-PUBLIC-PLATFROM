import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { BedDouble, Building2, Home as HomeIcon, Hotel, TreePalm, CheckCheck, Headset, Minus, Percent, Plus, Sparkles, Workflow } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TimelineContent } from '@/components/ui/timeline-animation'
import { useLang, type L } from '@/i18n/lang'
import { site } from '@/data/site'
import { compare, cycles, MIN_BILLABLE, plans, priceFor, propertyTypes, type Cycle, type Plan, type PropertyType } from '@/data/pricing'
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
              className={`relative h-10 sm:h-12 shrink-0 cursor-pointer rounded-full px-2.5 sm:px-6 text-[14px] sm:text-[15px] font-medium transition-colors ${on ? 'text-white' : 'text-muted-foreground hover:text-ink'}`}>
              {on && (
                <motion.span layoutId="cycle-pill" transition={ios}
                  className="absolute inset-0 rounded-full border-4 border-brand bg-linear-to-t from-brand via-[#D42F3C] to-[#E8404A] shadow-[0_6px_18px_-6px_rgb(177_28_41/0.6)]" />
              )}
              <span className="relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <span className="hidden sm:inline">{t(c.label)}</span>
                <span className="sm:hidden">{c.months === 1 ? t(c.label) : t({ bn: `${num(c.months)} মাস`, en: `${c.months} mo` })}</span>
                {c.discount > 0 && (
                  <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[12px] font-semibold ${on ? 'bg-white/20 text-white' : 'bg-brand-soft text-brand'}`}>−{num(c.discount * 100)}%</span>
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

const typeIcon: Record<PropertyType, ReactNode> = {
  home: <HomeIcon className="size-5" />, guest: <BedDouble className="size-5" />, hotel: <Hotel className="size-5" />,
  resort: <TreePalm className="size-5" />, group: <Building2 className="size-5" />,
}

// "Which plan fits your property?" — pick a property type, get one plan with the reasons and the cost for your rooms.
function PlanFinder({ prop, setProp, rooms, cycle, reasons }: {
  prop: PropertyType | null; setProp: (p: PropertyType | null) => void; rooms: number; cycle: Cycle; reasons: (p: Plan) => L[]
}) {
  const { t, taka, num } = useLang()
  const type = prop ? propertyTypes.find((x) => x.id === prop)! : null
  const plan = type ? plans.find((p) => p.id === type.plan)! : null
  const pr = plan?.rate ? priceFor(plan.rate, rooms, cycle) : null
  const c = cycles.find((x) => x.id === cycle)!
  return (
    <section aria-labelledby="finder-h" className="mx-auto mt-8 max-w-5xl rounded-[24px] border border-line bg-white/85 p-4 shadow-soft backdrop-blur sm:p-6">
      <h2 id="finder-h" className="text-center text-[17px] font-semibold tracking-tight text-ink sm:text-[19px]">{t({ bn: 'আপনার প্রপার্টির জন্য কোন প্ল্যান?', en: 'Which plan fits your property?' })}</h2>
      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:grid sm:grid-cols-5">
        {propertyTypes.map((x) => {
          const on = prop === x.id
          return (
            <button key={x.id} onClick={() => setProp(on ? null : x.id)} aria-pressed={on}
              className={`flex w-[calc(33.333%-6px)] sm:w-auto cursor-pointer flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[13px] font-medium transition-[border-color,background-color,box-shadow,color] duration-300 ${on
                ? 'border-transparent bg-accent-tint text-brand ring-2 ring-brand'
                : 'border-line bg-white text-ink hover:border-brand/40'}`}>
              <span className={on ? 'text-brand' : 'text-muted-foreground'}>{typeIcon[x.id]}</span>
              {t(x.name)}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {type && plan ? (
          <motion.div key={type.id} initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 grid gap-4 rounded-2xl bg-canvas p-4 sm:grid-cols-[1.1fr_1fr_auto] sm:items-center sm:p-5" aria-live="polite">
            <div>
              <p className="text-[13px] text-muted-foreground">{t({ bn: `${t(type.name)}-এর জন্য`, en: `For a ${t(type.name).toLowerCase()}` })}</p>
              <p className="mt-0.5 font-[family-name:var(--font-display)] text-[26px] font-semibold tracking-[-0.02em] text-ink">BinGi {plan.name}</p>
              <p className="mt-1 text-[14px] text-muted-foreground">{t(type.need)}</p>
            </div>
            <ul className="space-y-1.5">
              {reasons(plan).map((r, j) => (
                <li key={j} className="flex items-center gap-2.5 text-[14px] text-ink"><span className="check-dot size-5"><CheckCheck className="size-3" aria-hidden="true" /></span>{t(r)}</li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 sm:items-end">
              {pr && <p className="text-[14px] text-muted-foreground tabular-nums sm:text-right"><span className="text-[20px] font-semibold text-ink">{taka(pr.total)}</span>{c.months === 1 ? t({ bn: '/মাস', en: '/month' }) : t({ bn: ` / ${num(c.months)} মাস`, en: ` / ${c.months} months` })}<br />{t({ bn: `${num(pr.q)} রুম`, en: `${pr.q} rooms` })}</p>}
              <a href={`#plan-${plan.id}`} className="btn-primary h-11 rounded-xl px-5">{t({ bn: `${plan.name} দেখুন`, en: `See ${plan.name}` })}</a>
            </div>
          </motion.div>
        ) : (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 text-center text-[13px] text-muted-foreground">
            {t({ bn: 'আপনার প্রপার্টির ধরন বাছুন — আমরা প্ল্যান, কারণ আর খরচ দেখাব।', en: 'Pick your property type — we’ll show the plan, why, and the cost for your rooms.' })}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  )
}

export default function PricingSection() {
  const { t, taka, num, lang } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState<Cycle>('monthly')
  const [rooms, setRooms] = useState(20)
  const [prop, setProp] = useState<PropertyType | null>(null)
  const rec = prop ? propertyTypes.find((x) => x.id === prop)!.plan : null
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
      { icon: <Sparkles size={18} />, text: !p.activation
        ? t({ bn: 'কোনো অ্যাক্টিভেশন ফি নেই', en: 'No activation fee' })
        : p.activation.standard
          ? t({ bn: `অ্যাক্টিভেশন ${taka(p.activation.standard)} — এখন ${taka(p.activation.now)}`, en: `Activation ${taka(p.activation.standard)} — now ${taka(p.activation.now)}` })
          : t({ bn: `অ্যাক্টিভেশন এখন ${taka(p.activation.now)}`, en: `Activation currently ${taka(p.activation.now)}` }) },
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
      <div aria-hidden="true" className="glow-radial pointer-events-none absolute left-[10%] right-[10%] top-0 -z-10 h-[620px]" />

      <div className="container-x">
        <div className="mx-auto mb-6 max-w-3xl text-center">
          <TimelineContent as="h1" animationNum={0} timelineRef={ref} customVariants={reveal}
            className="font-[family-name:var(--font-display)] text-[34px] sm:text-[46px] md:text-[60px] font-semibold leading-[1.02] tracking-[-0.035em] text-ink">
            {t({ bn: 'যত রুম, তত দাম। কিছুই ', en: 'Pay per room. Nothing ' })}
            <TimelineContent as="span" animationNum={1} timelineRef={ref} customVariants={reveal}
              className="mark">
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

        <TimelineContent animationNum={4} timelineRef={ref} customVariants={reveal}>
          <PlanFinder prop={prop} setProp={setProp} rooms={rooms} cycle={cycle} reasons={(p) => includesFor(p).slice(1, 4)} />
        </TimelineContent>

        <div className="mx-auto grid max-w-7xl gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => {
            const recd = rec === p.id
            const pop = rec ? recd : !!p.popular
            const fits = propertyTypes.filter((x) => x.plan === p.id)
            const pr = p.rate ? priceFor(p.rate, rooms, cycle) : null
            const inc = includesFor(p)
            return (
              <TimelineContent key={p.id} animationNum={5 + i} timelineRef={ref} customVariants={reveal} className="h-full">
                <Card id={`plan-${p.id}`} className={`relative flex h-full scroll-mt-28 flex-col transition-[opacity,box-shadow] duration-300 ${pop ? 'card-highlight' : 'bg-white glow-hover'} ${rec && !recd ? 'opacity-70' : ''}`}>
                  <CardHeader className="p-5 lg:p-6 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[22px] lg:text-[24px] font-semibold tracking-tight text-ink">{p.name}</h2>
                      {recd
                        ? <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-[12px] font-semibold text-white">{t({ bn: 'আপনার জন্য', en: 'Best fit' })}</span>
                        : !rec && p.popular && <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-[12px] font-semibold text-white">{t({ bn: 'জনপ্রিয়', en: 'Popular' })}</span>}
                    </div>
                    <p className="text-[14px] text-muted-foreground lg:min-h-[42px]">{t(p.tagline)}</p>
                    <p className="flex flex-wrap items-center gap-1.5 pt-1 text-[12px]" aria-label={t({ bn: 'যাদের জন্য', en: 'Best for' })}>
                      {fits.map((x) => <span key={x.id} className={`chip px-2 ${prop === x.id ? '!bg-brand !text-white' : ''}`}>{t(x.name)}</span>)}
                    </p>
                    <div className="pt-4">
                      {pr ? (
                        <>
                          <div className="flex items-baseline gap-1 text-ink">
                            <span className="text-[36px] font-semibold leading-none tracking-tight">৳<NumberFlow value={pr.perRoom} locales={locale} format={{ maximumFractionDigits: 1 }} /></span>
                            <span className="text-[14px] text-muted-foreground">/{t({ bn: 'রুম/মাস', en: 'room/month' })}</span>
                          </div>
                          {c.discount > 0 && <p className="mt-1.5 text-[13px] text-muted-foreground"><span className="line-through">{taka(p.rate!)}</span> · {t({ bn: `সাশ্রয় ${taka(pr.saved)}`, en: `save ${taka(pr.saved)}` })}</p>}
                        </>
                      ) : (
                        <><p className="text-[32px] font-semibold leading-none tracking-tight text-ink">{t({ bn: 'কথা বলুন', en: "Let's talk" })}</p><p className="mt-1.5 text-[13px] text-muted-foreground">{t({ bn: 'হোটেল গ্রুপ ও চেইন', en: 'For groups and chains' })}</p></>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col p-5 pt-0 lg:p-6 lg:pt-0">
                    {p.rate ? (
                      <a href={site.hmsRegister}
                        className={`${pop ? 'btn-primary' : 'btn-ghost'} mb-5 h-11 w-full text-[15px]`}>
                        {t({ bn: `${p.name} শুরু করুন`, en: `Get started with ${p.name}` })}
                      </a>
                    ) : (
                      <Link to="/contact" className="btn-ghost mb-5 h-11 w-full text-[15px]">
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
                            <span className={`check-dot ${pop ? '!border-brand !bg-white' : ''}`}>
                              <CheckCheck className="size-3.5" aria-hidden="true" />
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
