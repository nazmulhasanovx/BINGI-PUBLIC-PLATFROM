import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BedDouble, Check, ChevronDown, Gift, Minus, Plus } from 'lucide-react'
import { useLang, type L } from '../../i18n/lang'
import { site } from '../../data/site'
import { compare, cycles, MIN_BILLABLE, offers, plans, priceFor, type Cell, type Cycle } from '../../data/pricing'
import { Accordion, NumberRoll, SectionHead, Segmented } from '../../components/ui/Ui'
import { Reveal } from '../../components/ui/Reveal'

const faqs: { q: L; a: L }[] = [
  { q: { bn: 'দাম কীভাবে হিসাব হয়?', en: 'How is the price calculated?' }, a: { bn: 'রুম সংখ্যা × প্রতি রুমের মাসিক রেট × মাস। ৬ মাসে সাবস্ক্রিপশনে ১০% আর ১২ মাসে ২৫% ছাড়। প্রযোজ্য ট্যাক্স আলাদা লাইনে।', en: 'Rooms × monthly rate per room × months. 10% off the subscription for 6 months, 25% for 12 months. Applicable taxes are a separate line.' } },
  { q: { bn: '১০টার কম রুম থাকলে?', en: 'What if I have fewer than 10 rooms?' }, a: { bn: 'সর্বনিম্ন বিলিং ১০ রুমের। আপনি শুধু আপনার আসল রুমগুলোই যোগ করবেন।', en: 'Billing starts at 10 rooms. You only add the rooms you really have.' } },
  { q: { bn: 'বুকিং ফি কী?', en: 'What are booking fees?' }, a: { bn: 'BinGi মার্কেটপ্লেস বা আপনার ওয়েবসাইট থেকে আসা বুকিংয়ে ছোট একটা শতাংশ। রিসেপশনে নেওয়া ওয়াক-ইন বুকিংয়ে কোনো ফি নেই।', en: 'A small percentage on bookings from the BinGi Marketplace or your website. Walk-in bookings at reception have no fee.' } },
  { q: { bn: 'আর কোনো খরচ আছে?', en: 'Any other costs?' }, a: { bn: 'কেনা ডোমেইন রিনিউ, পেমেন্ট গেটওয়ে/প্রোভাইডার ফি আর কাস্টম কাজ থাকলে তা আলাদা করে দেখানো হয় — আপনি রাজি হলে তবেই।', en: 'Domain renewal, payment gateway/provider fees and any custom work are shown separately — only if you agree to them.' } },
]

function CellView({ c }: { c: Cell }) {
  const { t } = useLang()
  if (c === true) return <Check className="size-[18px] text-ok mx-auto" aria-label="Included" />
  if (c === false) return <span className="inline-flex items-center gap-1 text-muted-foreground"><Minus className="size-4" aria-hidden="true" /><span className="sr-only">Not included</span></span>
  if (c === 'tailored') return <span className="rounded-full bg-canvas px-2.5 py-1 text-[12px] text-muted-foreground">{t({ bn: 'প্রয়োজন মতো', en: 'Tailored' })}</span>
  return <span className="text-[13px] font-medium">{t(c)}</span>
}

export default function Pricing() {
  const { t, taka, num } = useLang()
  const [cycle, setCycle] = useState<Cycle>('monthly')
  const [rooms, setRooms] = useState(20)
  const [showCompare, setShowCompare] = useState(false)
  const c = cycles.find((x) => x.id === cycle)!
  const setR = (n: number) => setRooms(Math.max(1, Math.min(10000, Math.round(n) || 1)))

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] -z-10 overflow-hidden" aria-hidden="true"><div className="absolute inset-0 bg-grid" /><div className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[#F7C9CD] opacity-35 blur-[80px] md:animate-float will-change-transform" /></div>
      <div className="container-x pt-14">
        <SectionHead eyebrow={t({ bn: 'প্রাইসিং', en: 'Pricing' })} title={t({ bn: 'যত রুম, তত দাম', en: 'Pay per room. Nothing hidden.' })} lead={t({ bn: 'প্রতি রুমের মাসিক রেট। প্রতিটা খরচ আলাদা করে দেখানো।', en: 'A simple monthly rate per room. Every charge shown separately.' })} />

        {/* Calculator controls */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Segmented label="Billing period" value={cycle} onChange={setCycle}
            options={cycles.map((x) => ({ id: x.id, label: t(x.label), badge: x.discount ? `${t({ bn: 'সাশ্রয়', en: 'Save' })} ${num(x.discount * 100)}%` : undefined }))} />
          <div className="card glow-border flex flex-wrap items-center justify-center gap-3 px-4 py-3">
            <label htmlFor="rooms" className="flex items-center gap-2 text-[15px] font-medium"><BedDouble className="size-5 text-brand" aria-hidden="true" />{t({ bn: 'আপনার রুম সংখ্যা', en: 'Your rooms' })}</label>
            <div className="flex items-center gap-1">
              <button onClick={() => setR(rooms - 1)} className="grid size-11 place-items-center rounded-full border border-line-strong bg-white cursor-pointer hover:bg-canvas" aria-label="Fewer rooms"><Minus className="size-4" /></button>
              <input id="rooms" type="number" inputMode="numeric" min={1} value={rooms} onChange={(e) => setR(+e.target.value)}
                className="h-11 w-20 rounded-[10px] border border-line-strong text-center text-[17px] font-semibold focus:outline-2 focus:outline-link" />
              <button onClick={() => setR(rooms + 1)} className="grid size-11 place-items-center rounded-full border border-line-strong bg-white cursor-pointer hover:bg-canvas" aria-label="More rooms"><Plus className="size-4" /></button>
            </div>
            <input type="range" min={1} max={200} value={Math.min(rooms, 200)} onChange={(e) => setR(+e.target.value)} aria-label="Rooms slider" className="w-44 accent-[#B11C29] cursor-pointer" />
          </div>
          <p className="text-[13px] text-muted-foreground" aria-live="polite">
            {rooms < MIN_BILLABLE
              ? t({ bn: `সর্বনিম্ন বিলিং ${num(MIN_BILLABLE)} রুম — দাম ${num(MIN_BILLABLE)} রুম ধরে দেখানো হচ্ছে`, en: `Minimum billing is ${MIN_BILLABLE} rooms — prices shown for ${MIN_BILLABLE}` })
              : t({ bn: 'ট্যাক্স প্রযোজ্য হলে আলাদা', en: 'Taxes extra where applicable' })}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {plans.map((p, i) => {
            const pop = p.popular
            const pr = p.rate ? priceFor(p.rate, rooms, cycle) : null
            const added = compare.flatMap((g) => g.rows).filter((r) => r.highlight === p.id)
            return (
              <Reveal key={p.id} delay={i * 60} className={`relative flex flex-col rounded-[16px] p-6 border transition-[transform,box-shadow] duration-300 ${pop ? 'bg-gradient-to-b from-[#C42433] to-brand text-white border-brand shadow-[0_30px_60px_-16px_rgb(177_28_41/0.55)] lg:-translate-y-3' : 'bg-white border-line shadow-soft hover:-translate-y-1 hover:shadow-lift'}`}>
                {pop && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-[12px] font-semibold tracking-wide text-white whitespace-nowrap">{t({ bn: 'সবচেয়ে জনপ্রিয়', en: 'MOST POPULAR' })}</span>}
                <h2 className="text-[20px] font-semibold">BinGi {p.name}</h2>
                <p className={`mt-1 text-[14px] min-h-[42px] ${pop ? 'text-white/90' : 'text-muted-foreground'}`}>{t(p.tagline)}</p>

                <div className="mt-4 min-h-[104px]">
                  {pr ? (
                    <>
                      <p className="text-[34px] font-semibold tracking-tight leading-none"><NumberRoll value={taka(pr.perRoom)} /><span className={`text-[14px] font-normal ${pop ? 'text-white/90' : 'text-muted-foreground'}`}> /{t({ bn: 'রুম/মাস', en: 'room/month' })}</span></p>
                      {c.discount > 0 && <p className={`mt-1 text-[13px] line-through ${pop ? 'text-white/80' : 'text-muted-foreground'}`}>{taka(p.rate!)}</p>}
                      <p className={`mt-2 text-[13px] leading-snug ${pop ? 'text-white/90' : 'text-muted-foreground'}`}>
                        {c.months === 1
                          ? t({ bn: `${num(pr.q)} রুম · ${taka(pr.total)}/মাস`, en: `${pr.q} rooms · ${taka(pr.total)}/month` })
                          : t({ bn: `${num(pr.q)} রুম · ${num(c.months)} মাসে ${taka(pr.total)} · সাশ্রয় ${taka(pr.saved)}`, en: `${pr.q} rooms · ${taka(pr.total)} for ${c.months} months · save ${taka(pr.saved)}` })}
                      </p>
                    </>
                  ) : (
                    <><p className="text-[30px] font-semibold tracking-tight leading-none">{t({ bn: 'কথা বলুন', en: "Let's talk" })}</p><p className="mt-2 text-[13px] text-muted-foreground">{t({ bn: 'প্রয়োজন দেখে কোটেশন', en: 'Quotation after we review your needs' })}</p></>
                  )}
                </div>

                {p.rate ? (
                  <a href={site.hmsRegister} className={`btn w-full mt-4 ${pop ? 'bg-white text-brand hover:bg-white/90 shadow-lift' : 'btn-primary'}`}>{t({ bn: `${p.name} বেছে নিন`, en: `Choose ${p.name}` })}</a>
                ) : (
                  <Link to="/contact" className="btn-ghost w-full mt-4">{t({ bn: 'প্রয়োজন জানান', en: 'Discuss requirements' })}</Link>
                )}

                <ul className={`mt-6 space-y-2.5 text-[14px] flex-1 border-t pt-5 ${pop ? 'border-white/20' : 'border-line'}`}>
                  {p.plus && <li className={`text-[13px] font-semibold ${pop ? 'text-white/90' : 'text-ink'}`}>{t(p.plus)}</li>}
                  {added.map((r, j) => <li key={j} className="flex gap-2.5"><Check className={`size-[18px] shrink-0 ${pop ? 'text-white' : 'text-ok'}`} aria-hidden="true" />{t(r.name)}</li>)}
                  {p.id === 'starter' && <li className="flex gap-2.5"><Check className="size-[18px] shrink-0 text-ok" aria-hidden="true" />{t({ bn: 'সীমিত ওয়েবসাইট থিম', en: 'Limited website themes' })}</li>}
                  {p.id === 'custom' && [{ bn: 'একাধিক প্রপার্টি', en: 'Multiple properties' }, { bn: 'আপনার মডিউল ও ওয়ার্কফ্লো', en: 'Your modules and workflow' }, { bn: 'মাইগ্রেশন ও ইন্টিগ্রেশন প্ল্যান', en: 'Migration and integration planning' }, { bn: 'ডেডিকেটেড অনবোর্ডিং', en: 'Dedicated onboarding' }].map((x, j) => (
                    <li key={j} className="flex gap-2.5"><Check className="size-[18px] shrink-0 text-ok" aria-hidden="true" />{t(x)}</li>
                  ))}
                </ul>

                {p.fees && (
                  <div className={`mt-6 rounded-[10px] p-3.5 ${pop ? 'bg-white/12' : 'bg-canvas'}`}>
                    <p className={`text-[12px] font-semibold tracking-wide uppercase ${pop ? 'text-white/90' : 'text-muted-foreground'}`}>{t({ bn: 'বুকিং ফি', en: 'Booking fees' })}</p>
                    <div className="mt-1.5 grid grid-cols-3 gap-1 text-[13px]">
                      {([['marketplace', { bn: 'মার্কেটপ্লেস', en: 'Marketplace' }], ['website', { bn: 'ওয়েবসাইট', en: 'Website' }], ['walkin', { bn: 'ওয়াক-ইন', en: 'Walk-in' }]] as const).map(([k, l]) => (
                        <div key={k}><span className="font-semibold">{num(p.fees![k])}%</span><span className={`block text-[12px] ${pop ? 'text-white/90' : 'text-muted-foreground'}`}>{t(l)}</span></div>
                      ))}
                    </div>
                    <p className={`mt-2 border-t pt-2 text-[12px] ${pop ? 'border-white/20 text-white/90' : 'border-line text-muted-foreground'}`}>
                      {p.activation
                        ? <>{t({ bn: 'অ্যাক্টিভেশন', en: 'Activation' })} <span className="line-through">{taka(p.activation.standard)}</span> <span className="font-semibold">{t({ bn: 'এখন', en: 'now' })} {taka(p.activation.now)}</span></>
                        : t({ bn: 'কোনো অ্যাক্টিভেশন ফি নেই', en: 'No activation fee' })}
                    </p>
                  </div>
                )}
              </Reveal>
            )
          })}
        </div>

        {/* Offers */}
        <div className="mt-10 card glow-border p-5 md:p-6 flex flex-col md:flex-row gap-4 md:items-start">
          <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-ok-soft text-ok"><Gift className="size-5" aria-hidden="true" /></span>
          <div className="flex-1">
            <h2 className="text-[16px] font-semibold">{t({ bn: 'এখনকার অফার ও সার্ভিস', en: 'Current offers & services' })}</h2>
            <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-[14px] text-muted-foreground md:grid-cols-2">{offers.map((o, i) => <li key={i} className="flex gap-2"><Check className="size-4 text-ok shrink-0 mt-0.5" aria-hidden="true" />{t(o)}</li>)}</ul>
          </div>
        </div>

        {/* Compare */}
        <section className="mt-16">
          <div className="text-center">
            <button onClick={() => setShowCompare(!showCompare)} aria-expanded={showCompare} className="btn-ghost h-12 px-6 cursor-pointer">
              {t({ bn: 'সব ফিচার তুলনা করুন', en: 'Compare all features' })}<ChevronDown className={`size-4 transition-transform duration-200 ${showCompare ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          </div>
          {showCompare && (
            <div className="card mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-[14px]">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="text-left p-4 font-medium text-muted-foreground">{t({ bn: 'ফিচার', en: 'Feature' })}</th>
                    {plans.map((p) => <th key={p.id} scope="col" className={`p-4 font-semibold ${p.popular ? 'text-brand' : ''}`}>{p.name}<span className="block text-[12px] font-normal text-muted-foreground">{p.rate ? `${taka(p.rate)}/${t({ bn: 'রুম', en: 'room' })}` : t({ bn: 'কোটেশন', en: 'Quote' })}</span></th>)}
                  </tr>
                </thead>
                {compare.map((g) => (
                  <tbody key={g.name.en}>
                    <tr className="bg-canvas"><th colSpan={5} scope="colgroup" className="text-left px-4 py-2.5 text-[13px] font-semibold">{t(g.name)}</th></tr>
                    {g.rows.filter((r) => r.name.en !== 'Unlimited website themes').map((r) => (
                      <tr key={r.name.en} className="border-t border-line">
                        <th scope="row" className="text-left p-4 font-normal">{t(r.name)}</th>
                        {plans.map((p) => <td key={p.id} className="p-4 text-center"><CellView c={r.values[p.id]} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
          )}
        </section>

        <section className="mt-20 max-w-[820px] mx-auto">
          <SectionHead title={t({ bn: 'প্রাইসিং প্রশ্ন', en: 'Pricing questions' })} />
          <div className="mt-8"><Accordion items={faqs.map((f) => ({ q: t(f.q), a: t(f.a) }))} /></div>
        </section>
      </div>
    </div>
  )
}
