import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useLang } from '../../i18n/lang'
import { articles, categories } from '../../data/help'
import NotFound from '../not-found'

export default function Article() {
  const { slug } = useParams()
  const { t, num } = useLang()
  const [vote, setVote] = useState<null | boolean>(null)
  const a = articles.find((x) => x.slug === slug)
  if (!a) return <NotFound />
  const cat = categories.find((c) => c.id === a.category)
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 3)

  return (
    <article className="container-x pt-12 md:pt-16 max-w-[780px]">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[14px] text-muted-foreground">
        <Link to="/help" className="-ml-2 inline-flex min-h-11 min-w-11 items-center px-2 hover:text-ink">{t({ bn: 'হেল্প', en: 'Help' })}</Link><ChevronRight className="size-4" aria-hidden="true" /><span>{cat && t(cat.name)}</span>
      </nav>
      <h1 className="mt-4 display text-[36px] md:text-[52px]">{t(a.title)}</h1>
      <p className="lead mt-2">{t(a.summary)}</p>
      {a.draft && <p className="mt-4 rounded-[10px] bg-soon-soft text-soon text-[13px] px-3 py-2">{t({ bn: 'খসড়া — সাপোর্ট টিম যাচাই করে প্রকাশ করবে।', en: 'Draft — support team will verify before publishing.' })}</p>}
      <ol className="mt-8 space-y-4">
        {a.steps.map((s, i) => (
          <li key={i} className="card p-5 flex gap-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white text-[14px] font-semibold">{num(i + 1)}</span>
            <p className="text-[16px] leading-relaxed pt-0.5">{t(s)}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 card p-5 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
        {vote === null ? (
          <>
            <span className="text-[15px] font-medium">{t({ bn: 'এটা কি কাজে লেগেছে?', en: 'Was this helpful?' })}</span>
            <div className="flex gap-2">
              <button onClick={() => setVote(true)} className="btn-ghost h-10 cursor-pointer"><ThumbsUp className="size-4" aria-hidden="true" />{t({ bn: 'হ্যাঁ', en: 'Yes' })}</button>
              <button onClick={() => setVote(false)} className="btn-ghost h-10 cursor-pointer"><ThumbsDown className="size-4" aria-hidden="true" />{t({ bn: 'না', en: 'No' })}</button>
            </div>
          </>
        ) : <span className="text-[15px]">{vote ? t({ bn: 'ধন্যবাদ!', en: 'Thanks!' }) : <>{t({ bn: 'দুঃখিত। ', en: 'Sorry. ' })}<Link to="/contact" className="text-link underline">{t({ bn: 'আমাদের জানান', en: 'Tell us' })}</Link></>}</span>}
      </div>
      <section className="mt-12">
        <h2 className="text-[18px] font-semibold">{t({ bn: 'আরও পড়ুন', en: 'Related' })}</h2>
        <ul className="mt-3 space-y-2">{related.map((r) => <li key={r.slug}><Link to={`/help/${r.slug}`} className="inline-flex min-h-11 items-center text-link hover:underline text-[15px]">{t(r.title)}</Link></li>)}</ul>
      </section>
    </article>
  )
}
