// Adapted from 21st.dev "Scroll 01" (felipemenezes098) — sticky media that swaps as the steps scroll by.
// Changes: real BinGi media slots inside a Studio Display, numbered steps (it is a real sequence),
// active-step indicator, reduced-motion + mobile stacked fallback.
import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { MediaId } from '../../data/media'
import { Media } from '../media/Media'
import { StudioDisplay } from '../media/Devices'

export type Step = { title: string; text: string; media: MediaId }

function Item({ step, index, active, setActive }: { step: Step; index: number; active: boolean; setActive: Dispatch<SetStateAction<number>> }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 20%'] })
  // no opacity dimming (it broke text contrast); the active step is marked by its number and a small lift
  const y = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], reduce ? [0, 0, 0, 0] : [18, 0, 0, -18])
  const isActive = useTransform(scrollYProgress, (v) => v > 0.3 && v < 0.7)
  useMotionValueEvent(isActive, 'change', (v) => { if (v) setActive(index) })
  return (
    <motion.article ref={ref} style={{ y }} className="flex gap-5">
      <span className={`mt-1 grid size-9 shrink-0 place-items-center rounded-full text-[15px] font-semibold transition-colors duration-300 ${active ? 'bg-brand text-white' : 'bg-white text-muted-foreground border border-line'}`}>{index + 1}</span>
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-[26px] md:text-[30px] font-semibold tracking-[-0.02em] leading-tight">{step.title}</h3>
        <p className="mt-2 text-[17px] text-muted-foreground leading-relaxed max-w-[420px]">{step.text}</p>
      </div>
    </motion.article>
  )
}

export function StoryScroll({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0)
  return (
    <>
      {/* mobile: plain stacked list */}
      <div className="space-y-9 lg:hidden">
        {steps.map((s, i) => (
          <article key={s.media} className="space-y-4">
            <div className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-white text-[14px] font-semibold">{i + 1}</span>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-[24px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-1 text-[16px] text-muted-foreground">{s.text}</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-[14px] border border-line shadow-soft"><Media id={s.media} /></div>
          </article>
        ))}
      </div>
      {/* desktop: text scrolls, display stays */}
      <div className="hidden lg:grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
        <div className="py-[12vh] space-y-[24vh]">
          {steps.map((s, i) => <Item key={s.media} step={s} index={i} active={active === i} setActive={setActive} />)}
        </div>
        <div className="sticky top-[14vh] self-start">
          <div className="relative">
            {steps.map((s, i) => (
              <motion.div key={s.media} className={i === 0 ? 'relative' : 'absolute inset-0'} initial={false}
                animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 0.985 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} aria-hidden={active !== i}>
                <StudioDisplay media={s.media} className="relative w-full" />
              </motion.div>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-1.5" aria-hidden="true">
            {steps.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${active === i ? 'w-8 bg-brand' : 'w-1.5 bg-line-strong/50'}`} />)}
          </div>
        </div>
      </div>
    </>
  )
}
