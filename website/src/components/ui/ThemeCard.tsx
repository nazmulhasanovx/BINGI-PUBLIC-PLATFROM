import { useLang } from '@/i18n/lang'
import { asset } from '@/lib/utils'
import { plans } from '@/data/pricing'
import type { Theme } from '@/data/themes'

// Real preview image from the themes repo (fictional demo hotel, demo photos).
export function ThemeCard({ theme, compact = false }: { theme: Theme; compact?: boolean }) {
  const { t } = useLang()
  const plan = plans.find((p) => p.id === theme.plan)!
  return (
    <figure className="card glow-hover overflow-hidden">
      <div className="aspect-[16/10] overflow-hidden bg-canvas">
        <img src={asset(`/media/themes/${theme.id}.webp`)} alt={`${theme.name} theme — demo hotel`} loading="lazy" width={960} height={600}
          className="size-full object-cover object-top transition-transform duration-700 ease-spring hover:scale-[1.03]" />
      </div>
      <figcaption className={compact ? 'p-3.5' : 'p-4'}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-semibold tracking-[0.06em]">{theme.name}</span>
          <span className="chip">{t({ bn: `${plan.name} থেকে`, en: `${plan.name}+` })}</span>
        </div>
        {!compact && <p className="mt-1 text-[14px] text-muted-foreground">{t(theme.for)}</p>}
      </figcaption>
    </figure>
  )
}
