import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useLang } from '../../i18n/lang'
import { site } from '../../data/site'
import { StudioDisplay, IPhone16PM } from '../media/Devices'

const ease = [0.22, 1, 0.36, 1] as const

// The one orchestrated moment of the page: headline lines rise in sequence, the bay-sunrise
// horizon brightens, then the product rises over the horizon and flattens as you scroll.
export function Hero() {
  const { t } = useLang()
  const reduce = useReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'center center'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [24, 0])
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.86, 1])
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, 0])
  const phoneY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [140, 0])

  const lines = [
    t({ bn: 'আপনার টিম হোটেল চালায়।', en: 'Your team runs the hotel.' }),
    t({ bn: 'BinGi চালায় টেকনোলজি।', en: 'BinGi runs the technology.' }),
  ]
  // Headline rise is pure CSS so it starts with the prerendered HTML (no wait for JavaScript → fast LCP).
  const rise = (i: number) => ({ className: 'rise', style: { animationDelay: `${80 + i * 120}ms` } })

  return (
    <section className="relative overflow-hidden grain">
      {/* bay sunrise: soft sky + horizon line */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#F4F6F8_0%,#FBF3EF_55%,#FFE6DA_78%,#F4F6F8_100%)]" />
        <motion.div className="absolute left-1/2 top-[58%] h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#FFB38A_0%,#FD413F55_45%,transparent_75%)] blur-[40px]"
          initial={reduce ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 0.55, scale: 1 }} transition={{ duration: 1.6, delay: 0.2, ease }} />
        <motion.div className="absolute left-0 right-0 top-[71%] h-px bg-[linear-gradient(90deg,transparent,#FD413F_30%,#FFB38A_50%,#FD413F_70%,transparent)]"
          initial={reduce ? false : { scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 0.8 }} transition={{ duration: 1.4, delay: 0.35, ease }} />
      </div>

      <div className="container-x pt-16 md:pt-24">
        <div className="grid gap-8 md:grid-cols-[1.35fr_1fr] md:items-end">
          <h1 className="display text-[44px] sm:text-[60px] lg:text-[76px] text-ink">
            {lines.map((l, i) => <span key={i} className="block rise" style={rise(i).style}>{l}</span>)}
          </h1>
          <div className="md:pb-3 rise" style={rise(2).style}>
            <p className="lead max-w-[420px]">
              {t({ bn: 'ওয়েবসাইট, বুকিং, ফ্রন্ট ডেস্ক, হাউসকিপিং, রেস্টুরেন্ট, স্টাফ আর হিসাব — হোটেল ও রিসোর্টের জন্য একটা যুক্ত সিস্টেম।', en: 'Website, bookings, front desk, housekeeping, restaurant, staff and accounts — one connected system for hotels and resorts.' })}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={site.hmsRegister} className="btn-primary h-12 px-6">{t({ bn: 'শুরু করুন', en: 'Get started' })}</a>
              <Link to="/contact" className="btn-ghost h-12 px-6">{t({ bn: 'ডেমো বুক করুন', en: 'Book a demo' })}</Link>
            </div>
          </div>
        </div>

        <div ref={stage} className="relative mx-auto mt-12 md:mt-14 max-w-[1040px] pb-10 [perspective:1600px]">
          <motion.div style={{ rotateX, scale, y, transformOrigin: 'center bottom' }} className="will-change-transform"
            initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5, ease }}>
            <StudioDisplay media="heroWeb" className="relative w-[90%] md:w-[88%]" />
          </motion.div>
          <motion.div style={{ y: phoneY }} className="absolute right-0 bottom-6 w-[25%] md:w-[19%] will-change-transform"
            initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7, ease }}>
            <IPhone16PM media="heroPhone" className="relative w-full" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
