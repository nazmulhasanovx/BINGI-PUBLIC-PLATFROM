/**
 * AI Text Loading — adapted from kokonutui (MIT, https://kokonutui.com).
 * Cycles short status lines with a moving shimmer. Brand-tinted, sizes via className.
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AITextLoadingProps {
  texts?: string[]
  className?: string
  interval?: number
}

export default function AITextLoading({
  texts = ['Thinking...', 'Processing...', 'Analyzing...', 'Computing...', 'Almost...'],
  className,
  interval = 1500,
}: AITextLoadingProps) {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const timer = setInterval(() => setI((p) => (p + 1) % texts.length), interval)
    return () => clearInterval(timer)
  }, [interval, texts.length, reduce])

  return (
    <span className="relative inline-flex" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, backgroundPosition: reduce ? '0% center' : ['200% center', '-200% center'] }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            opacity: { duration: 0.25 },
            y: { duration: 0.25 },
            backgroundPosition: { duration: 2.5, ease: 'linear', repeat: Number.POSITIVE_INFINITY },
          }}
          className={cn(
            'inline-flex whitespace-nowrap bg-[length:200%_100%] bg-linear-to-r from-neutral-950 via-neutral-400 to-neutral-950 bg-clip-text font-semibold text-transparent',
            className,
          )}
        >
          {texts[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
