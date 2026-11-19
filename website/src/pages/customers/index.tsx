import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { site } from '@/data/site'
import { stories, type Story } from '@/data/stories'
import { PageHeader } from '@/components/ui/Ui'
import { FadeImg } from '@/components/ui/FadeImg'
import { asset } from '@/lib/utils'

export const typeL: Record<Story['propertyType'], { bn: string; en: string }> = {
  home: { bn: 'হোম স্টে', en: 'Home stay' }, guest: { bn: 'গেস্ট হাউস', en: 'Guest house' }, hotel: { bn: 'হোটেল', en: 'Hotel' }, resort: { bn: 'রিসোর্ট', en: 'Resort' }, group: { bn: 'গ্রুপ', en: 'Group' },
}

/** Shown on every sample story — the design preview only; the live site never receives samples. */
export function SampleBadge() {
  const { t } = useLang()
  return <span className="inline-flex items-center rounded-full bg-[#FEF2E2] px-2.5 py-1 text-[12px] font-semibold text-[#92400E]">{t({ bn: 'নমুনা — আসল গ্রাহক নয়', en: 'Sample — not a real customer' })}</span>
}

// Stories come from the admin (Content → Customer stories). Each one is published only with the hotel's written permission.
export default function Customers() {
  const { t, num } = useLang()
  return (
    <div className="container-x">
      <PageHeader mark={t({ bn: 'গল্প', en: 'stories' })} title={t({ bn: 'আমাদের হোটেলগুলোর গল্প', en: 'Customer stories' })}
        lead={stories.length ? t({ bn: 'BinGi ব্যবহার করা হোটেলগুলো, তাদের নিজের কথায়।', en: 'Hotels that run on BinGi, in their own words.' }) : t({ bn: 'BinGi ব্যবহার করা হোটেলগুলো নিজেদের কথা বলবে — শীঘ্রই।', en: 'Hotels that run on BinGi, in their own words — coming soon.' })} />
      {stories.length > 0 && (
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <li key={s.slug}>
              <Link to={`/customers/${s.slug}`} className="card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[0_20px_50px_-24px_rgb(16_24_40/0.35)]">
                {s.cover && <FadeImg src={asset(s.cover.src)} alt={t(s.cover.alt)} loading="lazy" className="aspect-[16/10] w-full object-cover" />}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                    {s.sample && <SampleBadge />}
                    <span>{t(typeL[s.propertyType])}{s.rooms ? ` · ${num(s.rooms)} ${t({ bn: 'রুম', en: 'rooms' })}` : ''} · {t(s.location)}</span>
                  </div>
                  <h2 className="mt-3 text-[19px] font-semibold leading-snug tracking-tight">{t(s.headline)}</h2>
                  <p className="mt-2 line-clamp-3 text-[15px] text-muted-foreground">{t(s.summary)}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[15px] font-medium text-link">{s.property}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <section className="mt-10 grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="card p-6 md:p-8">
          <span className="grid size-11 place-items-center rounded-[12px] bg-brand-soft text-brand"><ShieldCheck className="size-5" aria-hidden="true" /></span>
          <h2 className="mt-4 text-[22px] font-semibold tracking-tight">{t({ bn: 'আমরা যেভাবে গল্প প্রকাশ করি', en: 'How we publish a story' })}</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-muted-foreground">
            <li>{t({ bn: 'হোটেলের লিখিত অনুমতি নিয়ে।', en: 'Only with the hotel’s written permission.' })}</li>
            <li>{t({ bn: 'আসল সংখ্যা, হোটেলের নিজের রিপোর্ট থেকে — প্রতিটা সংখ্যার সূত্রসহ।', en: 'Real numbers from the hotel’s own reports — each with its source.' })}</li>
            <li>{t({ bn: 'কোনো বানানো রিভিউ নয়।', en: 'No made-up reviews.' })}</li>
          </ul>
        </div>
        <div className="card-highlight rounded-[20px] p-6 md:p-8 flex flex-col justify-between gap-6">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight">{t({ bn: 'BinGi ব্যবহার করছেন?', en: 'Using BinGi?' })}</h2>
            <p className="mt-2 text-[15px] text-muted-foreground">{t({ bn: 'আপনার হোটেলের গল্প বলতে চাইলে আমাদের জানান।', en: 'Tell us if you’d like your hotel featured.' })}</p>
          </div>
          <a href={site.whatsapp} className="btn-primary h-11 w-fit px-5">{t({ bn: 'WhatsApp-এ জানান', en: 'Tell us on WhatsApp' })}</a>
        </div>
      </section>
    </div>
  )
}
