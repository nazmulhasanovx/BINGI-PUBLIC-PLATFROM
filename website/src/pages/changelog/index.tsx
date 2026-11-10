import { CheckCheck } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { PageHeader } from '@/components/ui/Ui'
import { Reveal } from '@/components/ui/Reveal'
import { changes } from '@/data/changelog'

const badge = {
  live: { cls: 'bg-ok-soft text-ok', label: { bn: 'চালু', en: 'Live' } },
  testing: { cls: 'bg-brand-soft text-brand', label: { bn: 'টেস্টিংয়ে', en: 'In testing' } },
  soon: { cls: 'bg-soon-soft text-soon', label: { bn: 'শীঘ্রই', en: 'Coming soon' } },
}

export default function Changelog() {
  const { t } = useLang()
  return (
    <div className="container-x">
      <PageHeader mark={t({ bn: 'নতুন', en: 'new' })} title={t({ bn: 'BinGi-তে নতুন কী', en: 'What’s new in BinGi' })}
        lead={t({ bn: 'প্রতি মাসে কী এলো, কী টেস্টিংয়ে আছে, কী আসছে।', en: 'What shipped, what’s in testing and what’s next.' })} />
      <ol className="relative mt-12 max-w-[760px] space-y-6 border-l border-line pl-6 md:pl-8">
        {changes.map((c, i) => (
          <Reveal key={i}>
            <li className="relative">
              <span className="absolute -left-[31px] md:-left-[39px] top-2 size-3 rounded-full bg-linear-to-t from-brand to-brand-2 ring-4 ring-background" aria-hidden="true" />
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <span className="text-muted-foreground">{t(c.month)}</span>
                <span className={`rounded-full px-2.5 py-0.5 font-semibold ${badge[c.status].cls}`}>{t(badge[c.status].label)}</span>
              </div>
              <div className="card mt-2 p-5">
                <h2 className="text-[19px] font-semibold tracking-tight">{t(c.title)}</h2>
                <ul className="mt-3 space-y-2">
                  {c.items.map((x, j) => <li key={j} className="flex items-center gap-3 text-[15px] text-muted-foreground"><span className="check-dot size-5"><CheckCheck className="size-3" aria-hidden="true" /></span>{t(x)}</li>)}
                </ul>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  )
}
