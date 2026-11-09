import { useEffect, useRef } from 'react'
import { ImageIcon } from 'lucide-react'
import { media, type MediaId } from '../../data/media'

// Renders the media for a slot: video (mp4/webm), image/GIF, or a labelled placeholder.
// Video plays only while on screen (saves CPU/battery, keeps scrolling smooth).
function AutoVideo({ src, className, style, label }: { src: string; className: string; style: React.CSSProperties; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v || !('IntersectionObserver' in window)) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.pause(); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.2 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return <video ref={ref} src={src} muted loop playsInline preload="metadata" className={className} style={style} aria-label={label} />
}

export function Media({ id, className = '' }: { id: MediaId; className?: string }) {
  const m = media[id] as { src?: string; w: number; h: number; note: string }
  const style = { aspectRatio: `${m.w} / ${m.h}` }
  if (m.src && /\.(mp4|webm)$/i.test(m.src))
    return <AutoVideo src={m.src} className={`w-full h-full object-cover ${className}`} style={style} label={m.note} />
  if (m.src) return <img src={m.src} alt={m.note} loading="lazy" className={`w-full h-full object-cover ${className}`} style={style} />
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 text-center p-4 bg-[repeating-linear-gradient(135deg,#F3F4F6_0_10px,#ECEEF1_10px_20px)] text-muted ${className}`} style={style}>
      <ImageIcon className="size-6 opacity-60" aria-hidden="true" />
      <span className="text-[12px] font-medium leading-snug max-w-[240px] line-clamp-3">{m.note}</span>
      <span className="text-[12px] opacity-80 hidden sm:block">slot: {id} · {m.w}×{m.h}</span>
    </div>
  )
}
