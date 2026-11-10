import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronRight, MapPin } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { docs } from '@/data/docs'
import NotFound from '../not-found'
import { CopyButton, DocsShell, copyPage, useDocTitle } from './DocsShell'

const statusCls = { 'Live': 'bg-ok-soft text-ok', 'Coming soon': 'bg-soon-soft text-soon', 'Rolling out': 'bg-brand-soft text-brand' } as const

export default function DocPage() {
  const { slug } = useParams()
  const { t } = useLang()
  const i = docs.findIndex((d) => d.slug === slug)
  const d = docs[i]
  useDocTitle(d ? `${d.title} — BinGi docs` : 'Page not found — BinGi', d?.summary ?? '')
  if (!d) return <NotFound />
  const prev = docs[i - 1], next = docs[i + 1]

  return (
    <DocsShell>
      <article className="max-w-[780px]">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-muted-foreground">
          <Link to="/docs" className="-ml-2 inline-flex min-h-10 items-center px-2 hover:text-ink">Docs</Link><ChevronRight className="size-3.5" aria-hidden="true" /><span>{d.group}</span>
        </nav>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="font-[family-name:var(--font-display)] text-[32px] md:text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">{d.title}</h1>
          <CopyButton text={copyPage(d)} label={t({ bn: 'AI-এর জন্য কপি', en: 'Copy for AI' })} />
        </div>
        <p className="lead mt-3">{d.summary}</p>

        {(d.where || d.plan || d.status) && (
          <dl className="mt-5 grid gap-2 rounded-[16px] border border-line bg-white p-4 text-[14px] sm:grid-cols-[auto_1fr] sm:gap-x-4">
            {d.where && <><dt className="flex items-center gap-1.5 font-medium text-muted-foreground"><MapPin className="size-4" aria-hidden="true" />Where</dt><dd>{d.where}</dd></>}
            {d.plan && <><dt className="font-medium text-muted-foreground">Plan</dt><dd><span className="chip">{d.plan}</span></dd></>}
            {d.status && <><dt className="font-medium text-muted-foreground">Status</dt><dd><span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${statusCls[d.status]}`}>{d.status}</span></dd></>}
          </dl>
        )}

        <div className="mt-8 space-y-9">
          {d.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-[22px] font-semibold tracking-tight">{s.heading}</h2>
              {s.text && <p className="mt-2 text-[16px] leading-relaxed text-ink/85">{s.text}</p>}
              {s.list && <ul className="mt-3 space-y-2">{s.list.map((x) => <li key={x} className="flex gap-3 text-[16px] leading-relaxed"><span className="mt-[10px] size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />{x}</li>)}</ul>}
              {s.steps && (
                <ol className="mt-3 space-y-2.5">
                  {s.steps.map((x, k) => (
                    <li key={x} className="flex gap-3 text-[16px] leading-relaxed">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-linear-to-t from-brand to-brand-2 text-[12px] font-semibold text-white">{k + 1}</span>{x}
                    </li>
                  ))}
                </ol>
              )}
              {s.table && (
                <div className="mt-3 overflow-x-auto rounded-[14px] border border-line bg-white">
                  <table className="w-full min-w-[520px] text-left text-[14px]">
                    <thead className="bg-canvas"><tr>{s.table.head.map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                    <tbody>{s.table.rows.map((r) => <tr key={r.join()} className="border-t border-line">{r.map((c, k) => <td key={k} className={`px-4 py-2.5 align-top ${k === 0 ? 'font-medium' : 'text-ink/80'}`}>{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {d.fixes && d.fixes.length > 0 && (
            <section>
              <h2 className="text-[22px] font-semibold tracking-tight">{t({ bn: 'সাধারণ সমস্যা', en: 'Common issues' })}</h2>
              <div className="mt-3 space-y-3">
                {d.fixes.map((f) => (
                  <details key={f.symptom} className="group card p-0 open:shadow-lift">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-[16px] font-semibold">
                      {f.symptom}<span className="text-brand transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                    </summary>
                    <div className="border-t border-line px-5 py-4 text-[15px]">
                      <p className="text-muted-foreground"><span className="font-medium text-ink">{t({ bn: 'সম্ভাব্য কারণ:', en: 'Likely causes:' })}</span> {f.causes.join(' · ')}</p>
                      <ol className="mt-3 space-y-2">{f.steps.map((x, k) => <li key={x} className="flex gap-3"><span className="font-semibold text-brand">{k + 1}.</span>{x}</li>)}</ol>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        <nav className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2" aria-label="Previous and next">
          {prev ? <Link to={`/docs/${prev.slug}`} className="card glow-hover flex items-center gap-3 p-4 text-[15px]"><ArrowLeft className="size-4 text-brand" aria-hidden="true" /><span><span className="block text-[12px] text-muted-foreground">Previous</span>{prev.title}</span></Link> : <span />}
          {next && <Link to={`/docs/${next.slug}`} className="card glow-hover flex items-center justify-end gap-3 p-4 text-right text-[15px]"><span><span className="block text-[12px] text-muted-foreground">Next</span>{next.title}</span><ArrowRight className="size-4 text-brand" aria-hidden="true" /></Link>}
        </nav>
      </article>
    </DocsShell>
  )
}
