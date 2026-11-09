import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

export function SectionHead({ eyebrow, title, lead, center = true }: { eyebrow?: string; title: string; lead?: string; center?: boolean }) {
  return (
    <div className={`max-w-[720px] space-y-3 ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h2 text-balance">{title}</h2>
      {lead && <p className="lead text-pretty">{lead}</p>}
    </div>
  )
}

export function Accordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="card divide-y divide-line overflow-hidden">
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={i}>
            <h3>
              <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}
                className="w-full min-h-14 flex items-center justify-between gap-4 px-5 py-4 text-left text-[16px] font-medium cursor-pointer hover:bg-canvas/60 transition-colors duration-150">
                {it.q}
                <ChevronDown className={`size-5 shrink-0 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </h3>
            <div className={`grid transition-[grid-template-rows] duration-200 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden"><p className="px-5 pb-5 text-[15px] text-muted leading-relaxed">{it.a}</p></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { id: T; label: string; badge?: string }[]; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex flex-wrap justify-center gap-1 rounded-[24px] border border-line bg-white p-1 shadow-soft">
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id} onClick={() => onChange(o.id)}
          className={`h-10 rounded-full px-4 text-[14px] font-medium inline-flex items-center gap-2 cursor-pointer transition-colors duration-150 ${value === o.id ? 'bg-brand text-white' : 'text-muted hover:text-ink'}`}>
          {o.label}
          {o.badge && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${value === o.id ? 'bg-white/20 text-white' : 'bg-brand-soft text-brand'}`}>{o.badge}</span>}
        </button>
      ))}
    </div>
  )
}
