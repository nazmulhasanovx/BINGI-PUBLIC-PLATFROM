import logo from '../../assets/bingi-logo.png'

// Official BinGi logo (supplied by Nazmul, 9 Nov 2026). Logo red #FD413F is for the logo only;
// UI actions use brand #B11C29. Replace with an SVG version when available for sharper scaling.
export function Logo({ className = 'h-8' }: { className?: string }) {
  return <img src={logo} alt="BinGi" width={387} height={129} className={`w-auto ${className}`} decoding="async" />
}
