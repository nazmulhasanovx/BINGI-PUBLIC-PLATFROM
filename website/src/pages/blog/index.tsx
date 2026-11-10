import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { PageHeader } from '@/components/ui/Ui'
import { Reveal } from '@/components/ui/Reveal'
import { posts, readMinutes } from '@/data/blog'

export const fmtDate = (iso: string, lang: 'bn' | 'en') =>
  new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))

export default function Blog() {
  const { t, lang, num } = useLang()
  const [first, ...rest] = posts
  return (
    <div className="container-x">
      <PageHeader mark={t({ bn: 'গাইড', en: 'guides' })} title={t({ bn: 'হোটেল চালানোর গাইড', en: 'Practical guides for hotels' })}
        lead={t({ bn: 'ছোট, কাজের লেখা — বুকিং, হাউসকিপিং আর সরাসরি বুকিং নিয়ে।', en: 'Short, useful reads on bookings, housekeeping and direct sales.' })} />

      <Reveal className="mt-10">
        <Link to={`/blog/${first.slug}`} className="group card glow-hover grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:items-end md:p-10">
          <div>
            <span className="chip">{t(first.tag)}</span>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-[28px] md:text-[40px] font-semibold leading-[1.08] tracking-[-0.025em] text-balance">{t(first.title)}</h2>
          </div>
          <div>
            <p className="text-[16px] text-muted-foreground">{t(first.summary)}</p>
            <p className="mt-4 flex items-center gap-2 text-[14px] text-brand font-medium">{t({ bn: 'পড়ুন', en: 'Read' })} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></p>
          </div>
        </Link>
      </Reveal>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={i * 60}>
            <Link to={`/blog/${p.slug}`} className="group card glow-hover flex h-full flex-col p-6">
              <span className="chip w-fit">{t(p.tag)}</span>
              <h2 className="mt-4 text-[22px] font-semibold leading-snug tracking-tight">{t(p.title)}</h2>
              <p className="mt-2 flex-1 text-[15px] text-muted-foreground">{t(p.summary)}</p>
              <p className="mt-5 text-[13px] text-muted-foreground">{fmtDate(p.date, lang)} · {t({ bn: `${num(readMinutes(p, lang))} মিনিট`, en: `${readMinutes(p, lang)} min read` })}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
