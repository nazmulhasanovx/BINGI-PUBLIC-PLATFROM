import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Check, ChevronRight, Link2, MessageCircle } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { site } from '@/data/site'
import { posts, readMinutes } from '@/data/blog'
import { fmtDate, Cover } from './index'
import NotFound from '../not-found'

export default function Post() {
  const { slug } = useParams()
  const { t, lang, num } = useLang()
  const p = posts.find((x) => x.slug === slug)
  if (!p) return <NotFound />
  const [copied, setCopied] = useState(false)
  const more = [...posts.filter((x) => x.slug !== p.slug && x.tag.en === p.tag.en), ...posts.filter((x) => x.slug !== p.slug && x.tag.en !== p.tag.en)].slice(0, 2)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* blocked */ } }
  return (
    <article className="container-x max-w-[760px] pt-10 md:pt-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[14px] text-muted-foreground">
        <Link to="/blog" className="-ml-2 inline-flex min-h-11 items-center px-2 hover:text-ink">{t({ bn: 'গাইড', en: 'Guides' })}</Link><ChevronRight className="size-4" aria-hidden="true" /><span>{t(p.tag)}</span>
      </nav>
      <h1 className="display mt-3 text-[36px] md:text-[54px] text-balance">{t(p.title)}</h1>
      <p className="mt-4 text-[14px] text-muted-foreground">{t({ bn: 'BinGi টিম', en: 'BinGi team' })} · {fmtDate(p.date, lang)} · {t({ bn: `${num(readMinutes(p, lang))} মিনিট`, en: `${readMinutes(p, lang)} min read` })}</p>
      <p className="lead mt-6">{t(p.summary)}</p>
      <figure className="mt-8">
        <Cover p={p} className="aspect-[16/9] rounded-[22px] ring-1 ring-line" />
        <figcaption className="mt-2 text-[13px] text-muted-foreground">{t(p.cover.alt)} · {t({ bn: 'নমুনা ডেটা', en: 'sample data' })}</figcaption>
      </figure>

      <div className="mt-8 space-y-5 text-[17px] leading-[1.75] text-ink/90">
        {p.body.map((b, i) =>
          'h' in b ? <h2 key={i} className="pt-4 text-[24px] font-semibold tracking-tight text-ink">{t(b.h)}</h2>
          : 'p' in b ? <p key={i}>{t(b.p)}</p>
          : <ul key={i} className="space-y-2.5">{b.list.map((x, j) => <li key={j} className="flex gap-3"><span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />{t(x)}</li>)}</ul>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[13px] text-muted-foreground">{t({ bn: 'শেয়ার করুন', en: 'Share' })}</span>
        <button type="button" onClick={copy} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 text-[14px] font-medium hover:bg-canvas">
          {copied ? <Check className="size-4 text-[#15803D]" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}{copied ? t({ bn: 'কপি হয়েছে', en: 'Copied' }) : t({ bn: 'লিংক কপি', en: 'Copy link' })}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(t(p.title) + ' ' + url)}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-[14px] font-medium hover:bg-canvas"><MessageCircle className="size-4" aria-hidden="true" />WhatsApp</a>
      </div>

      <div className="mt-10 rounded-[20px] card-highlight p-6 md:flex md:items-center md:justify-between md:gap-6">
        <p className="text-[18px] font-semibold">{t({ bn: 'BinGi দিয়ে নিজে চেষ্টা করুন', en: 'Try it in BinGi' })}</p>
        <a href={site.hmsRegister} className="btn-primary mt-4 h-11 px-5 md:mt-0">{t({ bn: 'শুরু করুন', en: 'Get started' })}</a>
      </div>

      <nav className="mt-12 border-t border-line pt-8" aria-label="More guides">
        <p className="text-[13px] font-medium text-muted-foreground">{t({ bn: 'আরও গাইড', en: 'More guides' })}</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">{more.map((m) => (
          <li key={m.slug}><Link to={`/blog/${m.slug}`} className="group card glow-hover block overflow-hidden">
            <Cover p={m} className="aspect-[16/9]" />
            <span className="block p-4"><span className="chip">{t(m.tag)}</span><span className="mt-2 block text-[16px] font-semibold leading-snug group-hover:text-brand">{t(m.title)}</span></span>
          </Link></li>
        ))}</ul>
      </nav>
    </article>
  )
}
