import { openTheme } from '@/components/site/ThemeViewer'
import { ArrowUpRight } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { asset } from '@/lib/utils'
import { plans } from '@/data/pricing'
import { demoUrl, type Theme } from '@/data/themes'

// Real preview image from the themes repo (fictional demo hotel, demo photos). Click opens the live theme demo.
export function ThemeCard({ theme, compact = false }: { theme: Theme; compact?: boolean }) {
  const { t } = useLang()
  const plan = plans.find((p) => p.id === theme.plan)!
  return (
    <a href={asset(demoUrl(theme.demo))} onClick={openTheme(theme.demo, theme.name)} aria-label={`${theme.name} — ${t({ bn: 'লাইভ ডেমো খুলুন', en: 'open live demo' })}`} className="group card glow-hover block overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
        <span className="absolute bottom-3 left-3 z-10 rounded-full bg-white/90 shadow-soft px-2 py-0.5 text-[12px] font-medium text-muted-foreground backdrop-blur">Demo</span>
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[12px] font-medium text-white opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">{t({ bn: 'লাইভ ডেমো', en: 'Live demo' })}<ArrowUpRight className="size-3.5" aria-hidden="true" /></span>
        <img src={asset(`/media/themes/${theme.id}.webp`)} alt={`${theme.name} theme — demo hotel`} loading="lazy" width={960} height={600}
          className="size-full object-cover object-top transition-transform duration-700 ease-spring group-hover:scale-[1.03]" />
      </div>
      <div className={compact ? 'p-3.5' : 'p-4'}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-semibold tracking-[0.06em]">{theme.name}</span>
          <span className="chip">{t({ bn: `${plan.name} থেকে`, en: `${plan.name}+` })}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-link">{t({ bn: 'ক্লিক করে লাইভ দেখুন', en: 'Click to see it live' })}<ArrowUpRight className="size-3.5" aria-hidden="true" /></p>
      </div>
    </a>
  )
}
