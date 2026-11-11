import master from '../../assets/bingi-logo.svg'
import technology from '../../assets/bingi-technology.svg'
import dark from '../../assets/bingi-logo-dark.svg'

// Official BinGi logos from Brand Kit V1 (/Users/neonecy/BinGi/BinGi-Brand-Kit-V1/01-Logos, 11 Nov 2026).
// master = header on light surfaces · technology = "Hotel Management Technology" lockup · dark = dark surfaces.
const files = { master: [master, 397, 137], technology: [technology, 396, 160], dark: [dark, 397, 137] } as const
export function Logo({ className = 'h-8', variant = 'master' }: { className?: string; variant?: keyof typeof files }) {
  const [src, w, h] = files[variant]
  return <img src={src} alt="BinGi" width={w} height={h} className={`w-auto ${className}`} decoding="async" />
}
