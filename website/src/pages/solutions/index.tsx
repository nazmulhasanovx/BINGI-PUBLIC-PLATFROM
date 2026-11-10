import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { PageHeader } from '@/components/ui/Ui'
import { Reveal } from '@/components/ui/Reveal'
import { solutions } from '@/data/solutions'
import { plans, propertyTypes } from '@/data/pricing'
import { asset } from '@/lib/utils'

export default function Solutions() {
  const { t } = useLang()
  return (
    <div className="container-x">
      <PageHeader mark={t({ bn: 'প্রপার্টি', en: 'property' })} title={t({ bn: 'প্রতিটা প্রপার্টির জন্য', en: 'Built for every property' })}
        lead={t({ bn: 'ছোট ফ্ল্যাট থেকে হোটেল গ্রুপ — আপনার ধরন বাছুন।', en: 'From a small flat to a hotel group — pick your kind.' })} />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((s, i) => {
          const type = propertyTypes.find((x) => x.id === s.type)!
          const plan = plans.find((p) => p.id === type.plan)!
          return (
            <Reveal key={s.slug} delay={(i % 3) * 60} className="h-full">
              <Link to={`/solutions/${s.slug}`} className="group card glow-hover flex h-full flex-col overflow-hidden">
                <div className="aspect-[16/9] overflow-hidden bg-canvas">
                  <img src={asset(`/media/property/${s.slug}.webp`)} alt={t(type.name)} loading="lazy" width={960} height={600} className="size-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-1 items-end justify-between gap-3 p-5">
                  <div>
                    <h2 className="text-[20px] font-semibold tracking-tight">{t(type.name)}</h2>
                    <p className="mt-1 text-[14px] text-muted-foreground">{t(type.need)}</p>
                    <span className="chip mt-3">{t({ bn: `প্রস্তাবিত: ${plan.name}`, en: `Suggested: ${plan.name}` })}</span>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-brand transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
