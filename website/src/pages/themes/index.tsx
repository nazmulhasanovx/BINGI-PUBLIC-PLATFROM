import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '@/i18n/lang'
import { PageHeader, PillTabs } from '@/components/ui/Ui'
import { Reveal } from '@/components/ui/Reveal'
import { ThemeCard } from '@/components/ui/ThemeCard'
import { storeThemes, themes, themesFor } from '@/data/themes'
import { asset } from '@/lib/utils'
import type { PlanId } from '@/data/pricing'


export default function Themes() {
  const { t } = useLang()
  const [plan, setPlan] = useState<PlanId | 'all'>('all')
  const list = plan === 'all' ? themes : themesFor(plan)
  return (
    <div className="container-x">
      <PageHeader mark={t({ bn: 'ওয়েবসাইট', en: 'website' })} title={t({ bn: 'আপনার হোটেলের নিজের ওয়েবসাইট', en: 'Your hotel’s own website' })}
        lead={t({ bn: 'থিম বাছুন, রং দিন, প্রকাশ করুন।', en: 'Pick a theme, set your colour, publish.' })} />

      <div className="mt-10">
        <PillTabs size="sm" label="Plan" value={plan} onChange={setPlan}
          options={[{ id: 'all', label: t({ bn: 'সব', en: 'All' }) }, { id: 'starter', label: 'Starter' }, { id: 'business', label: 'Business' }, { id: 'ultra', label: 'Ultra' }]} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {list.map((th, i) => <Reveal key={th.id} delay={(i % 3) * 50}><ThemeCard theme={th} /></Reveal>)}
      </div>


      {/* Theme Store — Coming soon */}
      <section className="mt-16 md:mt-24 rounded-[24px] bg-bay p-6 text-white md:p-10 grain relative overflow-hidden">
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[520px]">
            <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-medium">{t({ bn: 'শীঘ্রই আসছে', en: 'Coming soon' })}</span>
            <h2 className="mt-3 h2">{t({ bn: 'থিম স্টোর', en: 'Theme Store' })}</h2>
            <p className="mt-3 text-[16px] text-white/80">{t({ bn: '২১টা প্রিমিয়াম থিম, যেকোনো প্ল্যানে মাসিক অ্যাড-অন হিসেবে।', en: '21 premium themes, a monthly add-on on any plan.' })}</p>
          </div>
          <Link to="/contact" className="btn h-11 w-fit bg-white px-5 text-ink">{t({ bn: 'আগ্রহ জানান', en: 'Get notified' })}</Link>
        </div>
        {([['luxury', { bn: 'লাক্সারি কালেকশন · ৫★–৭★', en: 'Luxury Collection · 5★–7★' }], ['signature', { bn: 'সিগনেচার কালেকশন · প্রপার্টির ধরন অনুযায়ী', en: 'Signature Collection · by property type' }], ['more', { bn: 'আরও', en: 'More' }]] as const).map(([col, label]) => (
          <div key={col} className="relative mt-8">
            <h3 className="text-[15px] font-semibold text-white/90">{t(label)}</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {storeThemes.filter((x) => x.collection === col).map((s) => (
                <figure key={s.id} className="overflow-hidden rounded-[14px] bg-white/5 ring-1 ring-white/10">
                  <img src={asset(`/media/themes/${s.id}.webp`)} alt={`${s.name} theme — demo`} loading="lazy" width={720} height={450} className="aspect-[16/10] w-full object-cover object-top opacity-90" />
                  <figcaption className="p-3"><span className="text-[14px] font-semibold tracking-[0.06em]">{s.name}</span><span className="block text-[13px] text-white/70">{t(s.for)}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
        <p className="relative mt-6 text-[13px] text-white/60">{t({ bn: 'ডেমো হোটেলগুলো কাল্পনিক। থিমগুলো টেস্টিংয়ে, দাম এখনো ঠিক হয়নি।', en: 'Demo hotels are fictional. Themes are in testing; prices not set yet.' })}</p>
      </section>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <h2 className="text-[22px] font-semibold tracking-tight">{t({ bn: 'কোন প্ল্যানে কোন থিম?', en: 'Which plan gets which themes?' })}</h2>
        <p className="text-[15px] text-muted-foreground">{t({ bn: 'Starter ৩টা · Business ৭টা · Ultra সব ৮টা', en: 'Starter 3 · Business 7 · Ultra all 8' })}</p>
        <Link to="/pricing" className="btn-primary h-11 px-5">{t({ bn: 'প্রাইসিং দেখুন', en: 'See pricing' })}</Link>
      </div>
    </div>
  )
}
