import { Link, useParams } from 'react-router-dom'
import { CheckCheck, ChevronRight } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { site } from '@/data/site'
import { solutions } from '@/data/solutions'
import { plans, priceFor, propertyTypes } from '@/data/pricing'
import { modules } from '@/data/status'
import { themes } from '@/data/themes'
import { Icon } from '@/components/ui/Icon'
import { StatusChip } from '@/components/ui/StatusChip'
import { ThemeCard } from '@/components/ui/ThemeCard'
import { asset } from '@/lib/utils'
import NotFound from '../not-found'

export default function SolutionDetail() {
  const { slug } = useParams()
  const { t, taka } = useLang()
  const s = solutions.find((x) => x.slug === slug)
  if (!s) return <NotFound />
  const type = propertyTypes.find((x) => x.id === s.type)!
  const plan = plans.find((p) => p.id === type.plan)!
  const mods = s.modules.map((id) => modules.find((m) => m.id === id)!).filter(Boolean)
  const ths = s.themes.map((id) => themes.find((x) => x.id === id)!).filter(Boolean)
  const pr = plan.rate ? priceFor(plan.rate, 10, 'monthly') : null
  const others = solutions.filter((x) => x.slug !== s.slug)

  return (
    <div className="container-x">
      <header className="relative isolate pt-8 md:pt-14">
        <div aria-hidden="true" className="glow-radial pointer-events-none absolute left-1/2 -top-28 -z-10 h-[460px] w-[min(980px,140%)] -translate-x-1/2" />
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[14px] text-muted-foreground">
          <Link to="/solutions" className="-ml-2 inline-flex min-h-11 items-center px-2 hover:text-ink">{t({ bn: 'সলিউশন', en: 'Solutions' })}</Link><ChevronRight className="size-4" aria-hidden="true" /><span>{t(type.name)}</span>
        </nav>
        <h1 className="display mt-3 text-[40px] md:text-[64px] text-balance">{t(s.title)}</h1>
        <p className="lead mt-4 max-w-[600px]">{t(s.intro)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={site.hmsRegister} className="btn-primary h-12 px-6">{t({ bn: 'শুরু করুন', en: 'Get started' })}</a>
          <Link to="/contact" className="btn-ghost h-12 px-6">{t({ bn: 'ডেমো বুক করুন', en: 'Book a demo' })}</Link>
        </div>
      </header>

      <figure className="mt-10 overflow-hidden rounded-[24px] bg-canvas">
        <img src={asset(`/media/property/${s.slug}.webp`)} alt={t(type.name)} width={960} height={600} className="aspect-[16/9] w-full object-cover md:aspect-[21/8]" />
      </figure>

      <section className="mt-14 grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <div className="card-highlight rounded-[20px] p-6">
          <p className="text-[13px] text-muted-foreground">{t({ bn: 'প্রস্তাবিত প্ল্যান', en: 'Suggested plan' })}</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-[32px] font-semibold tracking-[-0.02em]">BinGi {plan.name}</p>
          <p className="mt-1 text-[15px] text-muted-foreground">{t(plan.tagline)}</p>
          {pr
            ? <p className="mt-4 text-[14px] text-muted-foreground">{t({ bn: 'প্রতি রুম', en: 'From' })} <span className="text-[22px] font-semibold text-ink">{taka(plan.rate!)}</span>{t({ bn: '/মাস থেকে', en: '/room/month' })}<br />{t({ bn: `১০ রুম · ${taka(pr.total)}/মাস`, en: `10 rooms · ${taka(pr.total)}/month` })}</p>
            : <p className="mt-4 text-[15px] font-medium">{t({ bn: 'প্রয়োজন দেখে কোটেশন', en: 'Quotation after we review your needs' })}</p>}
          <Link to="/pricing" className="btn-primary mt-5 h-11 px-5">{t({ bn: 'প্রাইসিং দেখুন', en: 'See pricing' })}</Link>
        </div>
        <div className="card p-6">
          <h2 className="text-[17px] font-semibold">{t({ bn: 'যা আপনি চালাবেন', en: 'What you run with it' })}</h2>
          <ul className="mt-4 space-y-3">
            {s.runs.map((r, i) => <li key={i} className="flex items-center gap-3 text-[16px]"><span className="check-dot"><CheckCheck className="size-3.5" aria-hidden="true" /></span>{t(r)}</li>)}
          </ul>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-[22px] font-semibold tracking-tight">{t({ bn: 'মডিউল', en: 'Modules' })}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mods.map((m) => (
            <div key={m.id} className="card flex items-center gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-brand-soft text-brand"><Icon name={m.icon} /></span>
              <span className="flex-1 text-[15px] font-medium">{t(m.name)}</span>
              <StatusChip status={m.status} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[22px] font-semibold tracking-tight">{t({ bn: 'মানানসই ওয়েবসাইট থিম', en: 'Website themes that fit' })}</h2>
          <Link to="/themes" className="inline-flex min-h-11 items-center text-[15px] text-link hover:underline underline-offset-4">{t({ bn: 'সব থিম', en: 'All themes' })}</Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ths.map((th) => <ThemeCard key={th.id} theme={th} />)}</div>
      </section>

      <nav className="mt-16 border-t border-line pt-8" aria-label="Other solutions">
        <p className="text-[13px] font-medium text-muted-foreground">{t({ bn: 'অন্য প্রপার্টি', en: 'Other properties' })}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((o) => <Link key={o.slug} to={`/solutions/${o.slug}`} className="btn-ghost h-10 px-4 text-[14px]">{t(propertyTypes.find((x) => x.id === o.type)!.name)}</Link>)}
        </div>
      </nav>
    </div>
  )
}
