import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { site } from '@/data/site'
import { posts, readMinutes } from '@/data/blog'
import { fmtDate } from './index'
import NotFound from '../not-found'

export default function Post() {
  const { slug } = useParams()
  const { t, lang, num } = useLang()
  const p = posts.find((x) => x.slug === slug)
  if (!p) return <NotFound />
  const more = posts.filter((x) => x.slug !== p.slug).slice(0, 2)
  return (
    <article className="container-x max-w-[760px] pt-10 md:pt-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[14px] text-muted-foreground">
        <Link to="/blog" className="-ml-2 inline-flex min-h-11 items-center px-2 hover:text-ink">{t({ bn: 'গাইড', en: 'Guides' })}</Link><ChevronRight className="size-4" aria-hidden="true" /><span>{t(p.tag)}</span>
      </nav>
      <h1 className="display mt-3 text-[36px] md:text-[54px] text-balance">{t(p.title)}</h1>
      <p className="mt-4 text-[14px] text-muted-foreground">{t({ bn: 'BinGi টিম', en: 'BinGi team' })} · {fmtDate(p.date, lang)} · {t({ bn: `${num(readMinutes(p, lang))} মিনিট`, en: `${readMinutes(p, lang)} min read` })}</p>
      <p className="lead mt-6">{t(p.summary)}</p>

      <div className="mt-8 space-y-5 text-[17px] leading-[1.75] text-ink/90">
        {p.body.map((b, i) =>
          'h' in b ? <h2 key={i} className="pt-4 text-[24px] font-semibold tracking-tight text-ink">{t(b.h)}</h2>
          : 'p' in b ? <p key={i}>{t(b.p)}</p>
          : <ul key={i} className="space-y-2.5">{b.list.map((x, j) => <li key={j} className="flex gap-3"><span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />{t(x)}</li>)}</ul>
        )}
      </div>

      <div className="mt-12 rounded-[20px] card-highlight p-6 md:flex md:items-center md:justify-between md:gap-6">
        <p className="text-[18px] font-semibold">{t({ bn: 'BinGi দিয়ে নিজে চেষ্টা করুন', en: 'Try it in BinGi' })}</p>
        <a href={site.hmsRegister} className="btn-primary mt-4 h-11 px-5 md:mt-0">{t({ bn: 'শুরু করুন', en: 'Get started' })}</a>
      </div>

      <nav className="mt-12 border-t border-line pt-8" aria-label="More guides">
        <p className="text-[13px] font-medium text-muted-foreground">{t({ bn: 'আরও গাইড', en: 'More guides' })}</p>
        <ul className="mt-3 space-y-2">{more.map((m) => <li key={m.slug}><Link to={`/blog/${m.slug}`} className="inline-flex min-h-11 items-center text-[16px] font-medium hover:text-brand">{t(m.title)}</Link></li>)}</ul>
      </nav>
    </article>
  )
}
