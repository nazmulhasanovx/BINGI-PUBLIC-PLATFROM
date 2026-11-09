import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { bouncy, ios, snappy } from '../../lib/motion'

export function SectionHead({ eyebrow, title, lead, center = true }: { eyebrow?: string; title: string; lead?: string; center?: boolean }) {
  return (
    <div className={`max-w-[720px] space-y-3 ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h2 text-balance">{title}</h2>
      {lead && <p className="lead text-pretty">{lead}</p>}
    </div>
  )
}

// Page header used by every inner page: left-aligned display title, one-line lead, optional action.
export function PageHeader({ title, lead, children, center = false }: { title: string; lead?: string; children?: ReactNode; center?: boolean }) {
  return (
    <header className={`pt-8 md:pt-14 pb-2 ${center ? 'text-center mx-auto max-w-[760px]' : 'grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end'}`}>
      <div>
        <h1 className="display text-[40px] md:text-[60px] text-ink text-balance">{title}</h1>
        {lead && <p className={`lead mt-4 max-w-[560px] text-pretty ${center ? 'mx-auto' : ''}`}>{lead}</p>}
      </div>
      {children && <div className={center ? 'mt-8 flex justify-center' : 'md:justify-self-end'}>{children}</div>}
    </header>
  )
}

// Accordion — height springs open (iOS disclosure), chevron rotates with the same spring.
export function Accordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const reduce = useReducedMotion()
  return (
    <div className="card divide-y divide-line overflow-hidden">
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={i}>
            <h3>
              <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}
                className="w-full min-h-14 flex items-center justify-between gap-4 px-5 py-4 text-left text-[16px] font-medium cursor-pointer hover:bg-pearl/70 transition-colors duration-200">
                {it.q}
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={reduce ? { duration: 0 } : snappy} className="shrink-0 text-muted-foreground"><ChevronDown className="size-5" aria-hidden="true" /></motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                  transition={reduce ? { duration: 0 } : ios} className="overflow-hidden">
                  <p className="px-5 pb-5 text-[15px] text-muted-foreground leading-relaxed">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// iOS segmented control / Telegram folder tabs — the selection pill slides between options.
export function PillTabs<T extends string>({ value, onChange, options, label, tone = 'brand', size = 'md', wrap = false }: {
  value: T; onChange: (v: T) => void; options: { id: T; label: string; badge?: string }[]; label: string
  tone?: 'brand' | 'ink'; size?: 'sm' | 'md'; wrap?: boolean
}) {
  const id = useId()
  const reduce = useReducedMotion()
  const h = size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-[14px]'
  const pill = tone === 'brand' ? 'bg-brand' : 'bg-ink'
  return (
    <MotionConfig transition={reduce ? { duration: 0 } : snappy}>
      <div role="tablist" aria-label={label} className={`inline-flex ${wrap ? 'flex-wrap justify-center' : ''} gap-1 rounded-[24px] border border-line bg-white p-1 shadow-soft`}>
        {options.map((o) => {
          const on = value === o.id
          return (
            <button key={o.id} role="tab" aria-selected={on} onClick={() => onChange(o.id)}
              className={`relative ${h} rounded-full font-medium inline-flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors duration-200 ${on ? 'text-white' : 'text-muted-foreground hover:text-ink'}`}>
              {on && <motion.span layoutId={`pill-${id}`} className={`absolute inset-0 rounded-full ${pill}`} />}
              <span className="relative">{o.label}</span>
              {o.badge && <span className={`relative rounded-full px-2 py-0.5 text-[12px] font-semibold ${on ? 'bg-white/20 text-white' : 'bg-brand-soft text-accent-foreground'}`}>{o.badge}</span>}
            </button>
          )
        })}
      </div>
    </MotionConfig>
  )
}

// Back-compat name used by the pricing page.
export const Segmented = PillTabs

// Telegram-style rolling digits: each digit column slides to its new value when a number changes.
export function NumberRoll({ value, className = '' }: { value: string; className?: string }) {
  const reduce = useReducedMotion()
  const chars = value.split('')
  return (
    <span className={`inline-flex overflow-hidden tabular-nums ${className}`} aria-label={value} role="text">
      {chars.map((c, i) => {
        const d = '0123456789০১২৩৪৫৬৭৮৯'.indexOf(c)
        if (d < 0) return <span key={`s${i}-${c}`} aria-hidden="true">{c}</span>
        const digit = d % 10
        const set = d >= 10 ? '০১২৩৪৫৬৭৮৯' : '0123456789'
        return (
          <span key={`d${chars.length - i}`} className="relative inline-block h-[1.1em] leading-[1.1em] overflow-hidden" aria-hidden="true">
            <span className="invisible">0</span>
            <motion.span className="absolute left-0 top-0 flex flex-col" initial={false} animate={{ y: `${-digit * 1.1}em` }} transition={reduce ? { duration: 0 } : bouncy}>
              {set.split('').map((n) => <span key={n} className="h-[1.1em] leading-[1.1em]">{n}</span>)}
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

// Telegram message-bubble pop: scales up from its corner with a soft overshoot.
export function Bubble({ children, className = '', origin = 'bottom left' }: { children: ReactNode; className?: string; origin?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div initial={reduce ? false : { opacity: 0, scale: 0.6, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={bouncy}
      style={{ transformOrigin: origin }} className={className}>
      {children}
    </motion.div>
  )
}
