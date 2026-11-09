import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Gift, Minus } from 'lucide-react'
import { useLang } from '../../i18n/lang'
import { site } from '../../data/site'
import { compare, cycles, offers, plans, priceFor, type Cycle } from '../../data/pricing'
import { Accordion, SectionHead, Segmented } from '../../components/ui/Ui'
import { Reveal } from '../../components/ui/Reveal'

const faqs = [
  { q: { bn: 'রুম সংখ্যা প্ল্যানের সীমা ছাড়ালে?', en: 'What if I have more rooms than the plan limit?' }, a: { bn: 'পরের প্ল্যানে যান, অথবা ২০০-র বেশি রুম হলে Custom প্ল্যানের জন্য আমাদের সাথে কথা বলুন।', en: 'Move to the next plan, or talk to us about Custom if you have more than 200 rooms.' } },
  { q: { bn: 'বুকিং ফি কী?', en: 'What are booking fees?' }, a: { bn: 'মার্কেটপ্লেস বা আপনার ওয়েবসাইট থেকে আসা বুকিংয়ে ছোট একটা শতাংশ। রিসেপশনে নেওয়া (অফলাইন) বুকিংয়ে কোনো ফি নেই।', en: 'A small percentage on bookings from the marketplace or your website. Offline bookings taken at reception have no fee.' } },
  { q: { bn: 'পরে প্ল্যান বদলানো যাবে?', en: 'Can I change plans later?' }, a: { bn: 'হ্যাঁ, HMS-এর Billing & Subscription থেকে যেকোনো সময়।', en: 'Yes, any time from Billing & Subscription inside the HMS.' } },
  { q: { bn: 'দামে কি ট্যাক্স ধরা আছে?', en: 'Do prices include tax?' }, a: { bn: 'প্রযোজ্য ট্যাক্স ইনভয়েসে আলাদা লাইনে দেখানো হয়।', en: 'Applicable taxes are shown as a separate line on the invoice.' } },
]

export default function Pricing() {
  const { t, taka, num } = useLang()
  const [cycle, setCycle] = useState<Cycle>('monthly')
  const [showCompare, setShowCompare] = useState(false)
  const c = cycles.find((x) => x.id === cycle)!

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] -z-10 overflow-hidden" aria-hidden="true"><div className="absolute inset-0 bg-grid" /><div className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[#F7C9CD] opacity-50 blur-[120px] animate-float" /></div>
      <div className="container-x pt-14">
        <SectionHead eyebrow={t({ bn: 'প্রাইসিং', en: 'Pricing' })} title={t({ bn: 'আপনার প্রপার্টির মাপে প্ল্যান', en: 'A plan that fits your property' })} lead={t({ bn: 'কোনো লুকানো খরচ নেই। প্রতিটা খরচ আলাদা করে দেখানো।', en: 'No hidden costs. Every charge shown separately.' })} />

        <div className="mt-8 flex justify-center">
          <Segmented label="Billing cycle" value={cycle} onChange={setCycle}
            options={cycles.map((x) => ({ id: x.id, label: t(x.label), badge: x.discount ? `${t({ bn: 'সাশ্রয়', en: 'Save' })} ${num(x.discount * 100)}%` : undefined }))} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {plans.map((p, i) => {
            const pop = p.popular
            const pr = p.monthly ? priceFor(p.monthly, cycle) : null
            return (
              <Reveal key={p.id} delay={i * 60} className={`relative flex flex-col rounded-[16px] p-6 border transition-transform duration-200 ${pop ? 'bg-gradient-to-b from-[#C42433] to-brand text-white border-brand shadow-[0_30px_60px_-16px_rgb(177_28_41/0.55)] lg:-translate-y-3' : 'bg-white border-line shadow-soft hover:-translate-y-1 hover:shadow-lift'}`}>
                {pop && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold tracking-wide text-white">{t({ bn: 'সবচেয়ে জনপ্রিয়', en: 'MOST POPULAR' })}</span>}
                <h2 className="text-[20px] font-semibold">BinGi {p.name}</h2>
                <p className={`mt-1 text-[14px] ${pop ? 'text-white/75' : 'text-muted'}`}>{t(p.tagline)}</p>

                <div className="mt-5 min-h-[88px]">
                  {pr ? (
                    <>
                      <p className="text-[34px] font-semibold tracking-tight">{taka(pr.perMonth)}<span className={`text-[14px] font-normal ${pop ? 'text-white/75' : 'text-muted'}`}> /{t({ bn: 'মাস', en: 'month' })}</span></p>
                      <p className={`text-[13px] ${pop ? 'text-white/80' : 'text-muted'}`}>
                        {c.months > 1
                          ? t({ bn: `${num(c.months)} মাসে মোট ${taka(pr.total)} · সাশ্রয় ${taka(pr.saved)}`, en: `${taka(pr.total)} for ${c.months} months · save ${taka(pr.saved)}` })
                          : t({ bn: 'প্রতি মাসে বিল', en: 'Billed monthly' })}
                      </p>
                    </>
                  ) : (
                    <><p className="text-[30px] font-semibold tracking-tight">{t({ bn: 'কথা বলুন', en: "Let's talk" })}</p><p className="text-[13px] text-muted">{t({ bn: 'প্রয়োজন দেখে কোটেশন', en: 'Quotation after review' })}</p></>
                  )}
                </div>

                {p.monthly ? (
                  <a href={site.hmsRegister} className={`btn w-full mt-4 ${pop ? 'bg-white text-brand hover:bg-white/90' : 'bg-brand text-white hover:bg-brand-hover'}`}>{t({ bn: `${p.name} বেছে নিন`, en: `Choose ${p.name}` })}<ArrowRight className="size-4" aria-hidden="true" /></a>
                ) : (
                  <Link to="/contact" className="btn-ghost w-full mt-4">{t({ bn: 'প্রয়োজন জানান', en: 'Discuss requirements' })}</Link>
                )}

                <ul className={`mt-6 space-y-2.5 text-[14px] flex-1 border-t pt-5 ${pop ? 'border-white/20' : 'border-line'}`}>
                  <li className="flex gap-2.5"><Check className={`size-[18px] shrink-0 ${pop ? 'text-white' : 'text-ok'}`} aria-hidden="true" />{p.maxRooms ? t({ bn: `১টি প্রপার্টি · ${num(p.maxRooms)} রুম পর্যন্ত`, en: `1 property · up to ${p.maxRooms} rooms` }) : t({ bn: 'একাধিক প্রপার্টি · প্রয়োজন মতো রুম', en: 'Multiple properties · tailored rooms' })}</li>
                  {p.id === 'starter' && compare[0].rows.map((r, j) => (
                    <li key={j} className="flex gap-2.5"><Check className="size-[18px] shrink-0 text-ok" aria-hidden="true" />{t(r.name)}</li>
                  ))}
                  {(p.id === 'business' || p.id === 'ultra') && (
                    <li className={`text-[13px] font-semibold ${pop ? 'text-white/85' : 'text-ink'}`}>{p.id === 'business' ? t({ bn: 'Starter-এর সব কিছু, সাথে:', en: 'Everything in Starter, plus:' }) : t({ bn: 'Business-এর সব কিছু, সাথে:', en: 'Everything in Business, plus:' })}</li>
                  )}
                  {p.id === 'business' && compare.slice(1).flatMap((g) => g.rows).filter((r) => r.values.business === true && r.values.starter !== true).map((r, j) => (
                    <li key={j} className="flex gap-2.5"><Check className="size-[18px] shrink-0 text-white" aria-hidden="true" />{t(r.name)}</li>
                  ))}
                  {p.id === 'ultra' && (
                    <li className="flex gap-2.5"><Check className="size-[18px] shrink-0 text-ok" aria-hidden="true" />{t({ bn: 'দ্বিগুণ রুম সীমা — ২০০ রুম', en: 'Double the room limit — 200 rooms' })}</li>
                  )}
                  {p.id === 'custom' && [{ bn: 'আপনার মডিউল ও ওয়ার্কফ্লো', en: 'Your modules and workflow' }, { bn: 'মাইগ্রেশন ও ইন্টিগ্রেশন প্ল্যান', en: 'Migration and integration planning' }, { bn: 'ডেডিকেটেড অনবোর্ডিং', en: 'Dedicated onboarding' }].map((x, j) => (
                    <li key={j} className="flex gap-2.5"><Check className="size-[18px] shrink-0 text-ok" aria-hidden="true" />{t(x)}</li>
                  ))}
                </ul>

                {p.fees && (
                  <div className={`mt-6 rounded-[10px] p-3.5 ${pop ? 'bg-white/12' : 'bg-canvas'}`}>
                    <p className={`text-[11px] font-semibold tracking-wide uppercase ${pop ? 'text-white/75' : 'text-muted'}`}>{t({ bn: 'বুকিং ফি', en: 'Booking fees' })}</p>
                    <div className="mt-1.5 grid grid-cols-3 gap-1 text-[13px]">
                      {([['marketplace', { bn: 'মার্কেটপ্লেস', en: 'Marketplace' }], ['website', { bn: 'ওয়েবসাইট', en: 'Website' }], ['offline', { bn: 'অফলাইন', en: 'Offline' }]] as const).map(([k, l]) => (
                        <div key={k}><span className="font-semibold">{num(p.fees![k])}%</span><span className={`block text-[11px] ${pop ? 'text-white/75' : 'text-muted'}`}>{t(l)}</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </Reveal>
            )
          })}
        </div>

        {/* Offers */}
        <div className="mt-10 card glow-border p-5 md:p-6 flex flex-col md:flex-row gap-4 md:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-ok-soft text-ok"><Gift className="size-5" aria-hidden="true" /></span>
          <div className="flex-1">
            <h2 className="text-[16px] font-semibold">{t({ bn: 'এখনকার অফার ও সার্ভিস', en: 'Current offers & services' })}</h2>
            <ul className="mt-1.5 grid gap-1 text-[14px] text-muted md:grid-cols-3">{offers.map((o, i) => <li key={i}>{t(o)}</li>)}</ul>
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
                    <th scope="col" className="text-left p-4 font-medium text-muted">{t({ bn: 'ফিচার', en: 'Feature' })}</th>
                    {plans.map((p) => <th key={p.id} scope="col" className={`p-4 font-semibold ${p.popular ? 'text-brand' : ''}`}>{p.name}</th>)}
                  </tr>
                </thead>
                {compare.map((g) => (
                  <tbody key={g.name.en}>
                    <tr className="bg-canvas"><th colSpan={5} scope="colgroup" className="text-left px-4 py-2.5 text-[13px] font-semibold">{t(g.name)}</th></tr>
                    {g.rows.map((r) => (
                      <tr key={r.name.en} className="border-t border-line">
                        <th scope="row" className="text-left p-4 font-normal">{t(r.name)}</th>
                        {plans.map((p) => {
                          const v = r.values[p.id]
                          return <td key={p.id} className="p-4 text-center">
                            {v === true ? <Check className="size-[18px] text-ok mx-auto" aria-label="Included" /> : v === false ? <Minus className="size-[18px] text-line mx-auto" aria-label="Not included" /> : <span className="rounded-full bg-canvas px-2.5 py-1 text-[12px] text-muted">{t({ bn: 'প্রয়োজন মতো', en: 'Tailored' })}</span>}
                          </td>
                        })}
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
