import { Media } from './Media'
import type { MediaId } from '../../data/media'

// Apple Studio Display 27" — 16:9 panel, thin black bezel, aluminium frame and stand.
export function StudioDisplay({ media, className = '' }: { media: MediaId; className?: string }) {
  return (
    <figure className={className || "relative"} aria-label="Apple Studio Display">
      <div className="rounded-[14px] bg-gradient-to-b from-[#D9DBDF] to-[#BFC2C7] p-[6px] shadow-[0_30px_60px_-20px_rgb(16_24_40/0.35)]">
        <div className="rounded-[9px] bg-[#0B0B0C] p-[3%] pb-[3%]">
          <div className="aspect-video overflow-hidden rounded-[3px] bg-white">
            <Media id={media} />
          </div>
        </div>
      </div>
      <div className="mx-auto aspect-[5/2] w-[22%] bg-gradient-to-b from-[#C7CACE] to-[#E2E4E7]" style={{ clipPath: 'polygon(12% 0, 88% 0, 100% 100%, 0 100%)' }} />
      <div className="mx-auto h-[10px] w-[30%] rounded-b-[6px] bg-gradient-to-b from-[#E4E6E9] to-[#C5C8CC]" />
    </figure>
  )
}

// iPhone 16 Pro Max — 440×956 pt, titanium edge, Dynamic Island.
export function IPhone16PM({ media, className = '' }: { media: MediaId; className?: string }) {
  return (
    <figure className={className || "relative"} aria-label="iPhone 16 Pro Max">
      <div className="rounded-[16%/7.5%] bg-gradient-to-br from-[#C9C6C1] via-[#8F8C88] to-[#BDBAB5] p-[2.2%] shadow-[0_30px_60px_-20px_rgb(16_24_40/0.4)]">
        <div className="relative overflow-hidden rounded-[14%/6.5%] bg-black p-[2.6%]">
          <div className="relative overflow-hidden rounded-[12%/5.6%] bg-white" style={{ aspectRatio: '440 / 956' }}>
            <Media id={media} className="absolute inset-0" />
            <div className="absolute left-1/2 top-[1.6%] h-[3.6%] w-[29%] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </div>
    </figure>
  )
}
