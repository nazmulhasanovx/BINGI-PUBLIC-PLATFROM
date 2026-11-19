import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, MessageCircle, X } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { site } from '@/data/site'
import { ios } from '@/lib/motion'
import { sendLead, track } from '@/lib/track'

// One short "Book a demo" form, opened from anywhere with openDemo(). No backend yet: the request is handed to WhatsApp.
export const openDemo = () => window.dispatchEvent(new Event('bingi:demo'))

const input = 'h-12 w-full rounded-[12px] border border-line bg-white px-3.5 text-[16px] focus:outline-2 focus:outline-link'

export function DemoModal() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', property: '', phone: '' })
  const [err, setErr] = useState<Record<string, boolean>>({})
  const [sent, setSent] = useState<string | null>(null)
  const first = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const on = () => { setOpen(true); setSent(null); track('demo_open') }
    window.addEventListener('bingi:demo', on)
    return () => window.removeEventListener('bingi:demo', on)
  }, [])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', k)
    setTimeout(() => first.current?.focus(), 60)
    return () => document.removeEventListener('keydown', k)
  }, [open])
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const n = { name: !f.name.trim(), property: !f.property.trim(), phone: !/^\+?\d[\d\s-]{8,}$/.test(f.phone.trim()) }
    setErr(n)
    if (n.name || n.property || n.phone) return
    const msg = `Demo request\nName: ${f.name}\nProperty: ${f.property}\nPhone: ${f.phone}`
    setBusy(true)
    // Saved in the admin (Leads) when the API is set up; WhatsApp stays as the second way either way.
    const r = await sendLead({ name: f.name, property: f.property, phone: f.phone })
    setBusy(false)
    setSaved(r.ok)
    setSent(`${site.whatsapp}?text=${encodeURIComponent(msg)}`)
  }
  const field = (id: 'name' | 'property' | 'phone', label: string, extra: Record<string, string> = {}) => (
    <label className="block text-[14px] font-medium">
      {label}
      <input ref={id === 'name' ? first : undefined} {...extra} className={`${input} mt-1.5 ${err[id] ? 'border-[#B11C29]' : ''}`} value={f[id]} aria-invalid={err[id] || undefined}
        onChange={(e) => setF({ ...f, [id]: e.target.value })} />
      {err[id] && <span className="mt-1 block text-[13px] text-[#B11C29]">{t({ bn: 'এটা দরকার', en: 'This is needed' })}</span>}
    </label>
  )
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center bg-ink/30 backdrop-blur-[2px] p-0 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="demo-h" onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }} transition={ios}
            className="w-full max-w-[440px] rounded-t-[28px] sm:rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-30px_rgb(16_24_40/0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="demo-h" className="text-[22px] font-semibold tracking-tight">{t({ bn: 'ডেমো বুক করুন', en: 'Book a demo' })}</h2>
                <p className="mt-1 text-[14px] text-muted-foreground">{t({ bn: 'তিনটা তথ্য দিন — আমাদের টিম যোগাযোগ করবে।', en: 'Three details — our team will get in touch.' })}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={t({ bn: 'বন্ধ করুন', en: 'Close' })} className="-mr-2 -mt-2 grid size-11 cursor-pointer place-items-center rounded-full hover:bg-canvas"><X className="size-5" /></button>
            </div>
            {sent ? (
              <div className="py-6 text-center" role="status">
                <CheckCircle2 className="mx-auto size-12 text-ok" aria-hidden="true" />
                <p className="mt-3 text-[16px] font-semibold">{saved ? t({ bn: 'অনুরোধ পেয়েছি', en: 'Request received' }) : t({ bn: 'অনুরোধ তৈরি', en: 'Request ready' })}</p>
                <p className="mt-1 text-[14px] text-muted-foreground">{saved ? t({ bn: 'আমাদের টিম শিগগিরই কল করবে। চাইলে WhatsApp-এও লিখতে পারেন।', en: 'Our team will call you soon. You can also write on WhatsApp.' }) : t({ bn: 'WhatsApp-এ মেসেজটা পাঠালেই হবে।', en: 'Send the message on WhatsApp to finish.' })}</p>
                <a href={sent} target="_blank" rel="noopener" className={`${saved ? 'btn-ghost' : 'btn-primary'} mt-5 h-12 w-full`}>{t({ bn: 'WhatsApp-এ পাঠান', en: 'Send on WhatsApp' })}</a>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-5 space-y-4">
                {field('name', t({ bn: 'আপনার নাম', en: 'Your name' }), { autoComplete: 'name' })}
                {field('property', t({ bn: 'হোটেল / প্রপার্টির নাম', en: 'Hotel / property name' }))}
                {field('phone', t({ bn: 'ফোন নম্বর', en: 'Phone number' }), { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '01XXXXXXXXX' })}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <button type="submit" disabled={busy} className="btn-primary h-12 w-full cursor-pointer disabled:opacity-60">{busy ? t({ bn: 'পাঠানো হচ্ছে…', en: 'Sending…' }) : t({ bn: 'অনুরোধ পাঠান', en: 'Send request' })}</button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Light WhatsApp button, bottom-right, appears once the visitor scrolls.
export function FloatingWhatsApp() {
  const { t } = useLang()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 500)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.a href={site.whatsapp} target="_blank" rel="noopener" aria-label={t({ bn: 'WhatsApp-এ কথা বলুন', en: 'Chat on WhatsApp' })}
          initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.9 }} transition={ios}
          className="fixed bottom-5 right-5 z-[70] hidden lg:flex h-14 items-center gap-2 rounded-full bg-white pl-4 pr-5 text-[15px] font-medium text-ink shadow-[0_14px_36px_-14px_rgb(16_24_40/0.45)] ring-1 ring-line hover:-translate-y-0.5 transition-transform">
          <span className="grid size-8 place-items-center rounded-full bg-[#25D366] text-white"><MessageCircle className="size-[18px]" aria-hidden="true" /></span>
          <span className="hidden sm:inline">WhatsApp</span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
