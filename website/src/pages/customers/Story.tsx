import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Quote } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { storyBySlug, stories } from '@/data/stories'
import { modules } from '@/data/status'
import { plans } from '@/data/pricing'
import { FadeImg } from '@/components/ui/FadeImg'
import { asset } from '@/lib/utils'
import { openDemo } from '@/components/site/Demo'
import NotFound from '../not-found'
import { SampleBadge, typeL } from './index'

export default function StoryPage() {
  const { slug } = useParams()
  const { t, num } = useLang()
  const s = slug ? storyBySlug(slug) : undefined
  if (!s) return <NotFound />
  const plan = plans.find((p) => p.id === s.plan)
  const used = (s.modules ?? []).map((id) => modules.find((m) => m.id === id)).filter(Boolean)
  const more = stories.filter((x) => x.slug !== s.slug).slice(0, 2)
  return (
    <article className="container-x max-w-[860px] pt-10 md:pt-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[14px] text-muted-foreground">
        <Link to="/customers" className="-ml-2 inline-flex min-h-11 items-center px-2 hover:text-ink">{t({ bn: 'গ্রাহকের গল্প', en: 'Customer stories' })}</Link><ChevronRight className="size-4" aria-hidden="true" /><span>{s.property}</span>
      </nav>
      {s.sample && <div className="mt-3"><SampleBadge /></div>}
      <h1 className="display mt-3 text-[34px] text-balance md:text-[50px]">{t(s.headline)}</h1>
      <p className="lead mt-5">{t(s.summary)}</p>
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-4">
        {[[{ bn: 'প্রপার্টি', en: 'Property' }, s.property], [{ bn: 'ধরন', en: 'Type' }, `${t(typeL[s.propertyType])}${s.rooms ? ` · ${num(s.rooms)} ${t({ bn: 'রুম', en: s.rooms === 1 ? 'room' : 'rooms' })}` : ''}`], [{ bn: 'জায়গা', en: 'Location' }, t(s.location)], [{ bn: 'প্ল্যান', en: 'Plan' }, plan?.name ?? '—']].map(([k, v]) => (
          <div key={(k as { en: string }).en} className="bg-white px-4 py-3"><dt className="text-[13px] text-muted-foreground">{t(k as { bn: string; en: string })}</dt><dd className="mt-0.5 text-[15px] font-medium">{v as string}</dd></div>
        ))}
      </dl>
      {s.cover && <FadeImg src={asset(s.cover.src)} alt={t(s.cover.alt)} className="mt-8 aspect-[16/9] w-full rounded-[22px] object-cover ring-1 ring-line" />}
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section><h2 className="text-[20px] font-semibold tracking-tight">{t({ bn: 'আগে যা কঠিন ছিল', en: 'What was hard before' })}</h2><p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-muted-foreground">{t(s.challenge)}</p></section>
        <section><h2 className="text-[20px] font-semibold tracking-tight">{t({ bn: 'BinGi দিয়ে যা বদলাল', en: 'What changed with BinGi' })}</h2><p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-muted-foreground">{t(s.solution)}</p></section>
      </div>
      {!!s.results?.length && (
        <section className="mt-10" aria-label={t({ bn: 'ফলাফল', en: 'Results' })}>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {s.results.map((r) => (
              <li key={r.label.en} className="card p-5">
                <p className="font-[family-name:var(--font-display)] text-[34px] font-semibold tracking-[-0.03em]">{r.value}</p>
                <p className="text-[15px]">{t(r.label)}</p>
                <p className="mt-2 text-[12px] text-soft">{t({ bn: 'সূত্র', en: 'Source' })}: {r.source}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {s.quote?.text && (
        <figure className="card mt-10 p-6 md:p-8">
          <Quote className="size-7 text-brand" aria-hidden="true" />
          <blockquote className="mt-3 text-[20px] leading-relaxed md:text-[22px]">{t(s.quote.text)}</blockquote>
          {s.quote.name && <figcaption className="mt-4 text-[15px]"><span className="font-semibold">{s.quote.name}</span>{s.quote.role && <span className="text-muted-foreground"> · {t(s.quote.role)}, {s.property}</span>}</figcaption>}
        </figure>
      )}
      {!!s.body?.length && (
        <div className="prose-bingi mt-10 space-y-4 text-[16px] leading-relaxed">
          {s.body.map((b, i) => 'h' in b ? <h2 key={i} className="pt-2 text-[22px] font-semibold tracking-tight">{t(b.h)}</h2> : 'p' in b ? <p key={i} className="text-muted-foreground">{t(b.p)}</p> : <ul key={i} className="list-disc space-y-1 pl-5 text-muted-foreground">{b.list.map((x, j) => <li key={j}>{t(x)}</li>)}</ul>)}
        </div>
      )}
      {used.length > 0 && (
        <section className="mt-10"><h2 className="text-[17px] font-semibold">{t({ bn: 'যে মডিউল ব্যবহার করে', en: 'Modules they use' })}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{used.map((m) => <li key={m!.id} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px]">{t(m!.name)}</li>)}</ul></section>
      )}
      <section className="card-highlight mt-12 flex flex-col items-start gap-4 rounded-[22px] p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div><h2 className="text-[22px] font-semibold tracking-tight">{t({ bn: 'আপনার হোটেলেও এভাবে চালাতে চান?', en: 'Want to run your property like this?' })}</h2><p className="mt-1 text-[15px] text-muted-foreground">{t({ bn: 'ডেমোতে আপনার রুম আর কাজ দিয়ে দেখিয়ে দেব।', en: 'We will show it with your own rooms and work.' })}</p></div>
        <button type="button" onClick={openDemo} className="btn-primary h-12 shrink-0 cursor-pointer px-6">{t({ bn: 'ডেমো বুক করুন', en: 'Book a demo' })}</button>
      </section>
      {more.length > 0 && (
        <nav className="mt-12" aria-label={t({ bn: 'আরও গল্প', en: 'More stories' })}><h2 className="text-[17px] font-semibold">{t({ bn: 'আরও গল্প', en: 'More stories' })}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">{more.map((x) => <li key={x.slug}><Link to={`/customers/${x.slug}`} className="card block p-4 hover:shadow-md"><span className="text-[13px] text-muted-foreground">{x.property}</span><span className="mt-1 block font-medium">{t(x.headline)}</span></Link></li>)}</ul></nav>
      )}
    </article>
  )
}
