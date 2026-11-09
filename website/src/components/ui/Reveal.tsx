import { useEffect, useRef, useState, type ReactNode } from 'react'

// Soft fade-in for content BELOW the fold only. Prerendered HTML is always visible (no wait for JS);
// after hydration, anything not yet on screen fades in when scrolled into view.
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    if (el.getBoundingClientRect().top < window.innerHeight) return // already visible: leave it alone
    setShown(false)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { rootMargin: '0px 0px -8% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`transition-opacity duration-[600ms] ease-out-quint ${shown ? 'opacity-100' : 'opacity-0'} ${className}`} style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}>
      {children}
    </div>
  )
}
