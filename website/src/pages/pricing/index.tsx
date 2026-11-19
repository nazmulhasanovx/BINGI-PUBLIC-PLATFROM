import { faqsFor } from '@/data/faqs'
import { useState } from 'react'
import { CheckCheck, Gift, Minus } from 'lucide-react'
import { useLang } from '../../i18n/lang'
import { compare, offers, plans, type Cell } from '../../data/pricing'
import { Accordion, PillTabs, SectionHead } from '../../components/ui/Ui'
import { StudioDisplay } from '../../components/media/Devices'
import PricingSection, { ActivationLine } from '@/components/ui/pricing-section'


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
  const showCompare = true // the comparison table is always open

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
            <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-[14px] text-muted-foreground md:grid-cols-2"><li className="flex gap-2"><span className="check-dot size-5 mt-px"><CheckCheck className="size-3" aria-hidden="true" /></span><span>{t({ bn: 'লঞ্চ অফার (11 ফেব্রুয়ারি 2027 পর্যন্ত; এর মধ্যে যোগ দিলে এই দামই থাকবে): Business ৳175 → ৳70 · Ultra ৳290 → ৳116', en: 'Launch offer until 11 Feb 2027 — join by then and keep the price: Business ৳175 → ৳70 · Ultra ৳290 → ৳116' })}</span></li>
              {plans.filter((p) => p.activation).map((p) => <li key={p.id} className="flex gap-2"><span className="check-dot size-5 mt-px"><CheckCheck className="size-3" aria-hidden="true" /></span><span>{p.name} <ActivationLine plan={p} /></span></li>)}
              {offers.slice(2).map((o, i) => <li key={i} className="flex gap-2"><span className="check-dot size-5 mt-px"><CheckCheck className="size-3" aria-hidden="true" /></span>{t(o)}</li>)}</ul>
          </div>
        </div>

        {/* Compare */}
        <section className="mt-12">
          <div className="text-center">
            <h2 className="h2">{t({ bn: 'সব ফিচার তুলনা', en: 'Compare all features' })}</h2>
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
          <div className="mt-8"><Accordion items={faqsFor('pricing').map((f) => ({ q: t(f.q), a: t(f.a) }))} /></div>
        </section>
      </div>
    </div>
  )
}
