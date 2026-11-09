import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle, PhoneCall, Search, SearchX } from 'lucide-react'
import { useLang } from '../../i18n/lang'
import { site } from '../../data/site'
import { articles, categories, whatsNew } from '../../data/help'
import { Icon } from '../../components/ui/Icon'
import { Media } from '../../components/media/Media'
import { SectionHead } from '../../components/ui/Ui'

export default function Help() {
  const { t } = useLang()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string | null>(null)
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return articles.filter((a) => (!cat || a.category === cat) && (!s || [a.title.bn, a.title.en, a.summary.bn, a.summary.en].some((x) => x.toLowerCase().includes(s))))
  }, [q, cat])

  return (
    <div className="container-x pt-14">
      <SectionHead eyebrow={t({ bn: 'হেল্প সেন্টার', en: 'Help center' })} title={t({ bn: 'কীভাবে সাহায্য করতে পারি?', en: 'How can we help?' })} />
      <label className="relative mt-8 block max-w-[640px] mx-auto">
        <span className="sr-only">{t({ bn: 'খুঁজুন', en: 'Search' })}</span>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted" aria-hidden="true" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t({ bn: 'যেমন: বুকিং, রুম যোগ, প্ল্যান', en: 'e.g. booking, add room, plan' })}
          className="w-full h-14 rounded-full border border-line-strong bg-white pl-12 pr-5 text-[16px] shadow-soft focus:outline-2 focus:outline-link" />
      </label>

      <div className="mt-10 grid gap-3 grid-cols-2 md:grid-cols-4">
        {categories.map((c) => (
          <button key={c.id} onClick={() => setCat(cat === c.id ? null : c.id)} aria-pressed={cat === c.id}
            className={`card card-hover p-4 flex items-center gap-3 text-left cursor-pointer min-h-16 ${cat === c.id ? 'glow-border shadow-glow' : ''}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-brand-soft text-brand"><Icon name={c.icon} /></span>
            <span className="text-[15px] font-medium">{t(c.name)}</span>
          </button>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold">{t({ bn: 'আর্টিকেল', en: 'Articles' })}</h2>
        {list.length ? (
          <ul className="mt-4 card divide-y divide-line">
            {list.map((a) => (
              <li key={a.slug}>
                <Link to={`/help/${a.slug}`} className="flex items-center justify-between gap-4 p-5 hover:bg-canvas/50 transition-colors duration-150">
                  <span><span className="block text-[16px] font-medium">{t(a.title)}</span><span className="text-[14px] text-muted">{t(a.summary)}</span></span>
                  <ArrowRight className="size-5 text-muted shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 card p-10 text-center text-muted">
            <SearchX className="size-8 mx-auto" aria-hidden="true" />
            <p className="mt-3 text-[15px]">{t({ bn: 'কিছু পাওয়া যায়নি। অন্য শব্দে খুঁজুন বা আমাদের জিজ্ঞেস করুন।', en: 'Nothing found. Try other words or ask us.' })}</p>
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="text-[20px] font-semibold">{t({ bn: '১ মিনিটের ভিডিও', en: '1-minute videos' })}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(['helpVideo1', 'helpVideo2', 'helpVideo3'] as const).map((id) => <div key={id} className="card card-hover overflow-hidden"><Media id={id} /></div>)}
        </div>
      </section>

      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-[18px] font-semibold">{t({ bn: 'নতুন কী এসেছে', en: "What's new" })}</h2>
          <ul className="mt-4 space-y-4">
            {whatsNew.map((w, i) => (
              <li key={i} className="flex gap-4"><span className="text-[13px] text-muted w-20 shrink-0 pt-0.5">{t(w.date)}</span><span className="text-[15px]">{t(w.title)}</span></li>
            ))}
          </ul>
        </section>
        <section className="card p-6">
          <h2 className="text-[18px] font-semibold">{t({ bn: 'এখনো সাহায্য লাগবে?', en: 'Still need help?' })}</h2>
          <p className="mt-1 text-[14px] text-muted">{t({ bn: 'আমাদের টিম আপনার সাথে কথা বলবে।', en: 'Our team will talk to you.' })}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <a href={site.whatsapp} className="btn-primary"><MessageCircle className="size-4" aria-hidden="true" />WhatsApp</a>
            <a href={`tel:${site.phoneIntl}`} className="btn-ghost"><PhoneCall className="size-4" aria-hidden="true" />{t({ bn: 'কল করুন', en: 'Call' })}</a>
            <Link to="/contact" className="btn-ghost">{t({ bn: 'মেসেজ', en: 'Message' })}</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
