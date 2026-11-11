import { useState } from 'react'
import { CheckCheck, ChevronDown, Gift, Minus } from 'lucide-react'
import { useLang, type L } from '../../i18n/lang'
import { compare, offers, plans, type Cell } from '../../data/pricing'
import { Accordion, PillTabs, SectionHead } from '../../components/ui/Ui'
import { StudioDisplay } from '../../components/media/Devices'
import PricingSection, { ActivationLine } from '@/components/ui/pricing-section'

const faqs: { q: L; a: L }[] = [
  { q: { bn: 'দাম কীভাবে হিসাব হয়?', en: 'How is the price calculated?' }, a: { bn: 'রুম সংখ্যা × প্রতি রুমের মাসিক রেট × মাস। ৬ মাসে প্রায় ১০% আর ১২ মাসে প্রায় ২৫% ছাড়, রুমের রেট পূর্ণ টাকায়। প্রযোজ্য ট্যাক্স আলাদা লাইনে।', en: 'Rooms × monthly rate per room × months. 10% off the subscription for 6 months, 25% for 12 months. Applicable taxes are a separate line.' } },
  { q: { bn: '১০টার কম রুম থাকলে?', en: 'What if I have fewer than 10 rooms?' }, a: { bn: 'সর্বনিম্ন বিলিং ১০ রুমের। আপনি শুধু আপনার আসল রুমগুলোই যোগ করবেন।', en: 'Billing starts at 10 rooms. You only add the rooms you really have.' } },
  { q: { bn: 'বুকিং ফি কী?', en: 'What are booking fees?' }, a: { bn: 'BinGi মার্কেটপ্লেস বা আপনার ওয়েবসাইট থেকে আসা বুকিংয়ে ছোট একটা শতাংশ। রিসেপশনে নেওয়া ওয়াক-ইন বুকিংয়ে কোনো ফি নেই।', en: 'A small percentage on bookings from the BinGi Marketplace or your website. Walk-in bookings at reception have no fee.' } },
  { q: { bn: 'আর কোনো খরচ আছে?', en: 'Any other costs?' }, a: { bn: 'VAT আলাদা। SMS ও ইমেইল যায় আপনার নিজের প্রোভাইডার দিয়ে — তাদের চার্জ সরাসরি তাদের দেবেন; কানেক্ট না করলে OTP/SMS যাবে না। কেনা ডোমেইন রিনিউ, পেমেন্ট গেটওয়ে ফি আর কাস্টম কাজ আলাদা দেখানো হয় — আপনি রাজি হলে তবেই।', en: 'VAT is extra. SMS and email go through your own provider — you pay them directly; without one connected, OTP and SMS are not sent. Domain renewal, payment gateway fees and custom work are shown separately — only if you agree.' } },
]

function CellView({ c }: { c: Cell }) {
  const { t } = useLang()
  if (c === true) return <span className="check-dot mx-auto"><CheckCheck className="size-3.5" aria-label="Included" /></span>
  if (c === false) return <span className="inline-flex items-center gap-1 text-muted-foreground"><Minus className="size-4" aria-hidden="true" /><span className="sr-only">Not included</span></span>
  if (c === 'tailored') return <span className="rounded-full bg-canvas px-2.5 py-1 text-[12px] text-muted-foreground">{t({ bn: 'প্রয়োজন মতো', en: 'Tailored' })}</span>
  return <span className="text-[13px] font-medium">{t(c)}</span>
}

// Same HMS, three plans: the dashboard each plan opens on (design 1:1, sample data).
function PlanDashboards() {
  const { t } = useLang()
  const [plan, setPlan] = useState<'dashStarter' | 'dashBusiness' | 'dashUltra'>('dashBusiness')
  return (
    <section className="mt-16 md:mt-24">
      <SectionHead title={t({ bn: 'প্রতিটা প্ল্যানে আপনার ড্যাশবোর্ড', en: 'Your dashboard on each plan' })} />
      <div className="mt-6 flex justify-center">
        <PillTabs label="Plan" value={plan} onChange={setPlan}
          options={[{ id: 'dashStarter', label: 'Starter' }, { id: 'dashBusiness', label: 'Business' }, { id: 'dashUltra', label: 'Ultra' }]} />
      </div>
      <div className="mx-auto mt-8 max-w-[960px]">
        <StudioDisplay key={plan} media={plan} className="relative w-full" />
      </div>
    </section>
  )
}

export default function Pricing() {
  const { t, taka } = useLang()
  const [showCompare, setShowCompare] = useState(false)

  return (
    <div className="relative">
      <PricingSection />
      <div className="container-x">
        <PlanDashboards />

        {/* Offers */}
        <div className="mt-8 card glow-border p-5 md:p-6 flex flex-col md:flex-row gap-4 md:items-start">
          <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-brand-soft text-brand"><Gift className="size-5" aria-hidden="true" /></span>
          <div className="flex-1">
            <h2 className="text-[16px] font-semibold">{t({ bn: 'এখনকার অফার ও সার্ভিস', en: 'Current offers & services' })}</h2>
            <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-[14px] text-muted-foreground md:grid-cols-2">{plans.filter((p) => p.activation).map((p) => <li key={p.id} className="flex gap-2"><span className="check-dot size-5 mt-px"><CheckCheck className="size-3" aria-hidden="true" /></span><span>{p.name} <ActivationLine plan={p} /></span></li>)}
              {offers.slice(2).map((o, i) => <li key={i} className="flex gap-2"><span className="check-dot size-5 mt-px"><CheckCheck className="size-3" aria-hidden="true" /></span>{t(o)}</li>)}</ul>
          </div>
        </div>

        {/* Compare */}
        <section className="mt-12">
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

        <section className="mt-14 max-w-[820px] mx-auto">
          <SectionHead title={t({ bn: 'প্রাইসিং প্রশ্ন', en: 'Pricing questions' })} />
          <div className="mt-8"><Accordion items={faqs.map((f) => ({ q: t(f.q), a: t(f.a) }))} /></div>
        </section>
      </div>
    </div>
  )
}
