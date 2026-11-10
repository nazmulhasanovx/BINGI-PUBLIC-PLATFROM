import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCheck } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { PageHeader, PillTabs } from '@/components/ui/Ui'
import { Reveal } from '@/components/ui/Reveal'
import { ThemeCard } from '@/components/ui/ThemeCard'
import { storeThemes, themes, themesFor } from '@/data/themes'
import { asset } from '@/lib/utils'
import type { PlanId } from '@/data/pricing'

const perks = [
  { bn: 'প্রতিটা থিমে বুকিং ইঞ্জিন', en: 'Booking engine in every theme' },
  { bn: '১০টা রং, দুই ধরনের হেডিং ফন্ট', en: '10 colours, two heading styles' },
  { bn: 'লেখা, ছবি ও রুম HMS থেকে', en: 'Text, photos and rooms from your HMS' },
  { bn: 'ফোন থেকে ডেস্কটপ — সব স্ক্রিনে', en: 'Phone to desktop — every screen' },
]

export default function Themes() {
  const { t } = useLang()
  const [plan, setPlan] = useState<PlanId | 'all'>('all')
  const list = plan === 'all' ? themes : themesFor(plan)
  return (
    <div className="container-x">
      <PageHeader mark={t({ bn: 'ওয়েবসাইট', en: 'website' })} title={t({ bn: 'আপনার হোটেলের নিজের ওয়েবসাইট', en: 'Your hotel’s own website' })}
        lead={t({ bn: 'একটা থিম বাছুন, রং ঠিক করুন, প্রকাশ করুন। বুকিং সরাসরি আপনার HMS-এ আসে।', en: 'Pick a theme, set your colour, publish. Bookings land straight in your HMS.' })} />

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
        {perks.map((p, i) => <li key={i} className="flex items-center gap-2"><span className="check-dot size-5"><CheckCheck className="size-3" aria-hidden="true" /></span>{t(p)}</li>)}
      </ul>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs size="sm" label="Plan" value={plan} onChange={setPlan}
          options={[{ id: 'all', label: t({ bn: 'সব', en: 'All' }) }, { id: 'starter', label: 'Starter' }, { id: 'business', label: 'Business' }, { id: 'ultra', label: 'Ultra' }]} />
        <p className="text-[13px] text-muted-foreground">{t({ bn: `${list.length}টা থিম · ডেমো হোটেলের ছবি`, en: `${list.length} themes · demo hotels shown` })}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((th, i) => <Reveal key={th.id} delay={(i % 4) * 50}><ThemeCard theme={th} /></Reveal>)}
      </div>

      <p className="mt-4 text-[13px] text-muted-foreground">
        {t({ bn: 'নতুন থিম কালেকশন শেষ পর্যায়ের টেস্টিংয়ে আছে। ছবিগুলো কাল্পনিক ডেমো হোটেলের।', en: 'The new theme collection is in final testing. Screens show fictional demo hotels.' })}
      </p>

      {/* Theme Store — Coming soon */}
      <section className="mt-16 md:mt-24 rounded-[24px] bg-bay p-6 text-white md:p-10 grain relative overflow-hidden">
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[520px]">
            <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-medium">{t({ bn: 'শীঘ্রই আসছে', en: 'Coming soon' })}</span>
            <h2 className="mt-3 h2">{t({ bn: 'থিম স্টোর', en: 'Theme Store' })}</h2>
            <p className="mt-3 text-[16px] text-white/80">{t({ bn: 'বিশেষ প্রপার্টির জন্য প্রিমিয়াম থিম, মাসিক অ্যাড-অন হিসেবে।', en: 'Premium themes for special properties, as a monthly add-on.' })}</p>
          </div>
          <Link to="/contact" className="btn h-11 w-fit bg-white px-5 text-ink">{t({ bn: 'আগ্রহ জানান', en: 'Get notified' })}</Link>
        </div>
        <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {storeThemes.map((s) => (
            <figure key={s.id} className="overflow-hidden rounded-[14px] bg-white/5 ring-1 ring-white/10">
              <img src={asset(`/media/themes/${s.id}.webp`)} alt={`${s.name} theme — demo`} loading="lazy" width={960} height={600} className="aspect-[16/10] w-full object-cover object-top opacity-90" />
              <figcaption className="p-3"><span className="text-[14px] font-semibold tracking-[0.06em]">{s.name}</span><span className="block text-[13px] text-white/70">{t(s.for)}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <h2 className="text-[22px] font-semibold tracking-tight">{t({ bn: 'কোন প্ল্যানে কোন থিম?', en: 'Which plan gets which themes?' })}</h2>
        <p className="text-[15px] text-muted-foreground">{t({ bn: 'Starter ৩টা · Business ৭টা · Ultra সব ৮টা', en: 'Starter 3 · Business 7 · Ultra all 8' })}</p>
        <Link to="/pricing" className="btn-primary h-11 px-5">{t({ bn: 'প্রাইসিং দেখুন', en: 'See pricing' })}</Link>
      </div>
    </div>
  )
}
