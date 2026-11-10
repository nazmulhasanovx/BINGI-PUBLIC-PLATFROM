import { Link } from 'react-router-dom'
import { ArrowRight, Bot } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { docs } from '@/data/docs'
import { asset } from '@/lib/utils'
import { CopyButton, DocsShell, copyAll, useDocTitle } from './DocsShell'

export default function DocsHome() {
  const { t } = useLang()
  useDocTitle('BinGi documentation — modules, ecosystem and troubleshooting', 'Everything about BinGi in one place, written so you — or any AI assistant — can fix an issue fast.')
  const groups = [...new Set(docs.map((d) => d.group))]
  return (
    <DocsShell>
      <header className="relative isolate">
        <div aria-hidden="true" className="glow-radial pointer-events-none absolute -left-20 -top-24 -z-10 h-[360px] w-[680px]" />
        <h1 className="display text-[36px] md:text-[52px] text-balance">{t({ bn: 'BinGi-র সব কিছু, ', en: 'Everything about BinGi, ' })}<span className="mark px-1.5 py-0">{t({ bn: 'এক জায়গায়', en: 'in one place' })}</span></h1>
        <p className="lead mt-4 max-w-[640px]">{t({ bn: 'মডিউল, ইকোসিস্টেম, প্ল্যান আর সমস্যার সমাধান। এমনভাবে লেখা যাতে আপনি — বা যেকোনো AI — দ্রুত সমস্যা ঠিক করতে পারে।', en: 'Modules, ecosystem, plans and fixes — written so you, or any AI assistant, can solve an issue fast.' })}</p>
      </header>

      {/* AI card */}
      <section className="mt-8 card-highlight rounded-[22px] p-5 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-white text-brand ring-1 ring-brand/20"><Bot className="size-5" aria-hidden="true" /></span>
            <div>
              <h2 className="text-[19px] font-semibold tracking-tight">{t({ bn: 'AI দিয়ে সমস্যা ঠিক করুন', en: 'Fix an issue with AI' })}</h2>
              <p className="mt-1 max-w-[520px] text-[15px] text-muted-foreground">{t({ bn: 'সব ডক কপি করে ChatGPT, Claude বা Gemini-তে দিন, সাথে আপনার সমস্যা লিখুন।', en: 'Copy all docs into ChatGPT, Claude or Gemini, then describe your problem.' })}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={copyAll} label={t({ bn: 'সব ডক কপি', en: 'Copy all docs' })} variant="primary" />
            <Link to="/docs/fix-with-ai" className="btn-ghost h-10 px-4 text-[14px]">{t({ bn: 'কীভাবে', en: 'How it works' })}</Link>
          </div>
        </div>
        <p className="mt-4 text-[13px] text-muted-foreground">{t({ bn: 'AI টুলের জন্য:', en: 'For AI tools:' })} <a className="text-link underline-offset-4 hover:underline" href={asset('/llms.txt')}>/llms.txt</a> · <a className="text-link underline-offset-4 hover:underline" href={asset('/llms-full.txt')}>/llms-full.txt</a></p>
      </section>

      {groups.map((g) => (
        <section key={g} className="mt-10">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{g}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {docs.filter((d) => d.group === g).map((d) => (
              <Link key={d.slug} to={`/docs/${d.slug}`} className="group card glow-hover flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[16px] font-semibold">{d.title}</h3>
                  <ArrowRight className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
                <p className="mt-1.5 line-clamp-2 text-[14px] text-muted-foreground">{d.summary}</p>
                {d.plan && <span className="chip mt-3 w-fit">{d.plan}</span>}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </DocsShell>
  )
}
