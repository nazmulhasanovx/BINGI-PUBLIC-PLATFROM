import { motion, useInView, useReducedMotion, type Variants } from 'motion/react'
import { useEffect, useRef, useState, type ElementType, type ReactNode, type RefObject } from 'react'

// TimelineContent (21st.dev pattern): children reveal one after another (blur → sharp) when the
// timeline container scrolls into view. BinGi rule: prerendered HTML must stay visible, so on a
// direct page load anything already on screen is NOT hidden; the reveal plays on client-side
// navigation and for blocks below the fold.
let hydrated = false
export const markHydrated = () => { hydrated = true }

type Props = {
  as?: ElementType
  animationNum: number
  timelineRef: RefObject<HTMLElement | null>
  customVariants?: Variants
  className?: string
  children?: ReactNode
}

const defaults: Variants = {
  visible: (i: number) => ({ y: 0, opacity: 1, filter: 'blur(0px)', transition: { delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }),
  hidden: { filter: 'blur(10px)', y: -16, opacity: 0 },
}

export function TimelineContent({ as = 'div', animationNum, timelineRef, customVariants, className, children }: Props) {
  const reduce = useReducedMotion()
  const self = useRef<HTMLElement | null>(null)
  const inView = useInView(timelineRef, { once: true, margin: '0px 0px -10% 0px' })
  const [animate, setAnimate] = useState(false) // false = render statically (SSR-safe)
  useEffect(() => {
    if (reduce) return
    const el = self.current
    const onScreen = el ? el.getBoundingClientRect().top < window.innerHeight : true
    if (hydrated || !onScreen) setAnimate(true)
  }, [reduce])
  const M = (motion as unknown as Record<string, ElementType>)[typeof as === 'string' ? as : 'div']
  if (!animate) {
    const Tag = as
    return <Tag ref={self} className={className}>{children}</Tag>
  }
  return (
    <M ref={self} className={className} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={animationNum} variants={customVariants ?? defaults}>
      {children}
    </M>
  )
}
