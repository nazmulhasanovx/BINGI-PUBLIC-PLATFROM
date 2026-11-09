import { Media } from './Media'
import type { MediaId } from '../../data/media'

// Glass glare shared by both devices: a soft diagonal sheen + a 1px top highlight, like light on a display.
function Glare() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(115deg,rgb(255_255_255/0.14)_0%,rgb(255_255_255/0.04)_32%,transparent_46%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]" />
  )
}

// Apple Studio Display 27" — cinematic: hairline aluminium rim, ultra-thin black bezel, glass glare,
// slim aluminium neck and foot with a soft floor shadow. Panel is 16:9 (5K 5120×2880).
export function StudioDisplay({ media, className = '' }: { media: MediaId; className?: string }) {
  return (
    <figure className={className || 'relative'} aria-label="Apple Studio Display">
      <div className="relative rounded-[12px] bg-[linear-gradient(180deg,#F1F2F4_0%,#C9CCD1_55%,#AEB2B8_100%)] p-[3px] shadow-device">
        <div className="relative rounded-[10px] bg-[#050506] p-[1.6%] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
          <div className="relative aspect-video overflow-hidden rounded-[3px] bg-black">
            <Media id={media} className="absolute inset-0" />
            <Glare />
          </div>
        </div>
      </div>
      {/* neck — seen from the front it tapers slightly toward the foot */}
      <div aria-hidden="true" className="relative mx-auto -mt-px w-[23%] aspect-[23/9] bg-[linear-gradient(90deg,#9EA2A8_0%,#DADDE1_14%,#EEF0F2_50%,#DADDE1_86%,#9EA2A8_100%)]"
        style={{ clipPath: 'polygon(3% 0, 97% 0, 100% 100%, 0 100%)' }}>
        <span className="absolute inset-x-0 top-0 h-[22%] bg-[linear-gradient(180deg,rgb(0_0_0/0.18),transparent)]" />
      </div>
      {/* foot */}
      <div aria-hidden="true" className="relative mx-auto w-[31%] aspect-[31/1.3] rounded-b-[6px] bg-[linear-gradient(180deg,#F3F4F6,#B8BCC2)] shadow-[0_1px_0_rgb(255_255_255/0.6)_inset]" />
      {/* floor shadow */}
      <div aria-hidden="true" className="mx-auto -mt-[0.6%] w-[42%] aspect-[42/2.2] rounded-[50%] bg-[radial-gradient(closest-side,rgb(11_34_53/0.35),transparent)] blur-[2px]" />
    </figure>
  )
}

// iPhone 16 Pro Max — 440×956 pt. Thin titanium band, 1.5% black border, Dynamic Island,
// side buttons (Action, volume, side, Camera Control) and the same glass glare.
export function IPhone16PM({ media, className = '' }: { media: MediaId; className?: string }) {
  const btn = 'absolute w-[1.4%] rounded-[2px] bg-[linear-gradient(90deg,#8C8984,#C9C6C1)]'
  return (
    <figure className={className || 'relative'} aria-label="iPhone 16 Pro Max">
      <div className="relative">
        <span aria-hidden="true" className={`${btn} -left-[1.1%] top-[17%] h-[3.6%]`} />
        <span aria-hidden="true" className={`${btn} -left-[1.1%] top-[23.5%] h-[6.4%]`} />
        <span aria-hidden="true" className={`${btn} -left-[1.1%] top-[31.5%] h-[6.4%]`} />
        <span aria-hidden="true" className={`${btn} -right-[1.1%] top-[25%] h-[9.5%]`} />
        <span aria-hidden="true" className={`${btn} -right-[1.1%] top-[56%] h-[5.2%]`} />
        <div className="relative rounded-[14.5%/6.7%] bg-[linear-gradient(135deg,#E2DFDA_0%,#9E9B96_35%,#D6D3CE_60%,#8C8984_100%)] p-[1.1%] shadow-device">
          <div className="relative overflow-hidden rounded-[13.8%/6.35%] bg-[#050506] p-[1.6%]">
            <div className="relative overflow-hidden rounded-[12.4%/5.7%] bg-black" style={{ aspectRatio: '440 / 956' }}>
              <Media id={media} className="absolute inset-0" />
              <div className="absolute left-1/2 top-[1.25%] z-20 h-[3.4%] w-[28%] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
              <Glare />
            </div>
          </div>
        </div>
      </div>
    </figure>
  )
}
