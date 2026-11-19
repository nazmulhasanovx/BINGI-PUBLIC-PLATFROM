import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useLang } from '@/i18n/lang'
import { PageHeader } from '@/components/ui/Ui'
import { Reveal } from '@/components/ui/Reveal'
import { FadeImg } from '@/components/ui/FadeImg'
import { posts, readMinutes, type Post } from '@/data/blog'
import { asset } from '@/lib/utils'
import { ios } from '@/lib/motion'

export const fmtDate = (iso: string, lang: 'bn' | 'en') =>
  new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))

// Real BinGi screen as the cover; portrait phone screens sit centred on a soft canvas.
export function Cover({ p, className = '' }: { p: Post; className?: string }) {
  const { t } = useLang()
  const portrait = p.cover.src.includes('/guest/')
  return (
    <div className={`relative overflow-hidden bg-[radial-gradient(120%_90%_at_50%_120%,#FFD9CF,transparent_60%),linear-gradient(180deg,#F4F6F8,#ECEFF3)] ${className}`}>
      {portrait
        ? <FadeImg src={asset(p.cover.src)} alt={t(p.cover.alt)} loading="lazy" className="absolute left-1/2 top-[12%] w-[34%] -translate-x-1/2 rounded-[18px] shadow-[0_20px_40px_-20px_rgb(16_24_40/0.5)] ring-1 ring-black/5" />
        : <FadeImg src={asset(p.cover.src)} alt={t(p.cover.alt)} loading="lazy" className="absolute left-[8%] top-[12%] w-[110%] max-w-none rounded-tl-[14px] shadow-[0_20px_40px_-20px_rgb(16_24_40/0.45)] ring-1 ring-black/5 transition-transform duration-500 group-hover:-translate-y-1" />}
    </div>
  )
}

export default function Blog() {
  const { t, lang, num } = useLang()
  const tags = Array.from(new Map(posts.map((p) => [p.tag.en, p.tag])).values())
  const [tag, setTag] = useState<string>('all')
  const list = tag === 'all' ? posts : posts.filter((p) => p.tag.en === tag)
  const [first, ...rest] = list
  const meta = (p: Post) => `${fmtDate(p.date, lang)} · ${t({ bn: `${num(readMinutes(p, lang))} মিনিট`, en: `${readMinutes(p, lang)} min read` })}`
  return (
    <div className="container-x">
      <PageHeader mark={t({ bn: 'গাইড', en: 'guides' })} title={t({ bn: 'হোটেল চালানোর গাইড', en: 'Practical guides for hotels' })}
        lead={t({ bn: 'ছোট, কাজের লেখা — বুকিং, ফ্রন্ট ডেস্ক, হাউসকিপিং, টাকা আর অনলাইন বিক্রি নিয়ে।', en: 'Short, useful reads on bookings, the front desk, housekeeping, money and selling online.' })} />

      <div role="tablist" aria-label={t({ bn: 'বিষয়', en: 'Topics' })} className="mt-8 flex flex-wrap gap-2">
        {[{ id: 'all', label: t({ bn: 'সব', en: 'All' }) }, ...tags.map((x) => ({ id: x.en, label: t(x) }))].map((x) => {
          const on = tag === x.id
          return (
            <button key={x.id} role="tab" aria-selected={on} onClick={() => setTag(x.id)}
              className={`relative h-11 cursor-pointer rounded-full px-4 text-[14px] font-medium transition-colors ${on ? 'text-white' : 'border border-line bg-white text-muted-foreground hover:text-ink'}`}>
              {on && <motion.span layoutId="blog-tag" transition={ios} className="absolute inset-0 rounded-full bg-ink" />}
              <span className="relative">{x.label}</span>
            </button>
          )
        })}
      </div>

      {first && (
        <Reveal key={first.slug} className="mt-6">
          <Link to={`/blog/${first.slug}`} className="group card glow-hover grid overflow-hidden md:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col justify-end p-6 md:p-10">
              <span className="chip w-fit">{t(first.tag)}</span>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-[28px] md:text-[38px] font-semibold leading-[1.08] tracking-[-0.025em] text-balance">{t(first.title)}</h2>
              <p className="mt-3 text-[16px] text-muted-foreground">{t(first.summary)}</p>
              <p className="mt-5 flex items-center gap-2 text-[14px] font-medium text-brand">{t({ bn: 'পড়ুন', en: 'Read' })} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></p>
              <p className="mt-3 text-[13px] text-muted-foreground">{meta(first)}</p>
            </div>
            <Cover p={first} className="aspect-[16/10] md:aspect-auto md:min-h-[340px]" />
          </Link>
        </Reveal>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={i * 50}>
            <Link to={`/blog/${p.slug}`} className="group card glow-hover flex h-full flex-col overflow-hidden">
              <Cover p={p} className="aspect-[16/10]" />
              <div className="flex flex-1 flex-col p-6">
                <span className="chip w-fit">{t(p.tag)}</span>
                <h2 className="mt-3 text-[20px] font-semibold leading-snug tracking-tight">{t(p.title)}</h2>
                <p className="mt-2 flex-1 text-[15px] text-muted-foreground">{t(p.summary)}</p>
                <p className="mt-5 text-[13px] text-muted-foreground">{meta(p)}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
