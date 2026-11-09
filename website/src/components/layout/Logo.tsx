// TEMP wordmark — replace with the official BinGi SVG logo (public/brand/bingi-logo.svg).
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight text-ink ${className}`}>
      <span className="grid size-8 place-items-center rounded-[9px] bg-brand text-white text-[15px] font-bold" aria-hidden="true">B</span>
      <span className="text-[19px]">BinGi</span>
    </span>
  )
}
