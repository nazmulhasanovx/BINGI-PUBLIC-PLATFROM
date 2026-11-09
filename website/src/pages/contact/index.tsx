import { useState, type FormEvent } from 'react'
import { CheckCircle2, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useLang, type L } from '../../i18n/lang'
import { site } from '../../data/site'
import { SectionHead } from '../../components/ui/Ui'

type Form = { name: string; property: string; type: string; rooms: string; phone: string; time: string }
const empty: Form = { name: '', property: '', type: 'hotel', rooms: '', phone: '', time: '' }
const typeOptions: { id: string; l: L }[] = [
  { id: 'home', l: { bn: 'হোম / ফ্ল্যাট', en: 'Home / Flat' } }, { id: 'guest', l: { bn: 'গেস্ট হাউস', en: 'Guest house' } },
  { id: 'hotel', l: { bn: 'হোটেল', en: 'Hotel' } }, { id: 'resort', l: { bn: 'রিসোর্ট', en: 'Resort' } }, { id: 'group', l: { bn: 'হোটেল গ্রুপ', en: 'Hotel group' } },
]

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[14px] font-medium mb-1.5">{label}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1.5 text-[13px] text-brand">{error}</p>}
    </div>
  )
}
const input = 'w-full h-12 rounded-[10px] border border-line-strong bg-white px-4 text-[16px] focus:outline-2 focus:outline-link aria-[invalid=true]:border-brand'

export default function Contact() {
  const { t } = useLang()
  const [f, setF] = useState<Form>(empty)
  const [err, setErr] = useState<Partial<Record<keyof Form, string>>>({})
  const [sent, setSent] = useState<string | null>(null)
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const required = t({ bn: 'এটা দরকার', en: 'Required' })
    const n: typeof err = {}
    if (!f.name.trim()) n.name = required
    if (!f.property.trim()) n.property = required
    if (!/^\+?[0-9\s-]{10,15}$/.test(f.phone.trim())) n.phone = t({ bn: 'সঠিক ফোন নম্বর দিন', en: 'Enter a valid phone number' })
    if (f.rooms && !(+f.rooms > 0)) n.rooms = t({ bn: 'সংখ্যা দিন', en: 'Enter a number' })
    setErr(n)
    if (Object.keys(n).length) { document.getElementById(Object.keys(n)[0])?.focus(); return }
    // No backend yet: hand the request to WhatsApp. Production: POST to the lead API (NEC TEAM).
    const msg = `Demo request\nName: ${f.name}\nProperty: ${f.property} (${f.type})\nRooms: ${f.rooms || '-'}\nPhone: ${f.phone}\nPreferred time: ${f.time || '-'}`
    setSent(`${site.whatsapp}?text=${encodeURIComponent(msg)}`)
  }

  return (
    <div className="container-x pt-14">
      <SectionHead eyebrow={t({ bn: 'যোগাযোগ', en: 'Contact' })} title={t({ bn: 'আমাদের সম্পর্কে ও যোগাযোগ', en: 'About us & contact' })} />
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-[18px] font-semibold">{t({ bn: 'আমরা কারা', en: 'Who we are' })}</h2>
            <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed">{t({ bn: 'BinGi ঢাকার NEONECY-এর তৈরি হোটেল ম্যানেজমেন্ট টেকনোলজি। আমাদের লক্ষ্য — ছোট গেস্ট হাউস থেকে বড় রিসোর্ট, সবার হাতে একই মানের যুক্ত সিস্টেম।', en: 'BinGi is hotel management technology built by NEONECY in Dhaka. Our goal: the same connected system for everyone, from a small guest house to a large resort.' })}</p>
          </div>
          <div className="card divide-y divide-line">
            <a href={site.whatsapp} className="flex items-center gap-4 p-5 hover:bg-canvas/50"><MessageCircle className="size-5 text-brand" aria-hidden="true" /><span><span className="block font-medium">WhatsApp</span><span className="text-[14px] text-muted-foreground">{t({ bn: 'দ্রুত উত্তর', en: 'Fastest reply' })}</span></span></a>
            <a href={`tel:${site.phoneIntl}`} className="flex items-center gap-4 p-5 hover:bg-canvas/50"><Phone className="size-5 text-brand" aria-hidden="true" /><span><span className="block font-medium">{site.phone}</span><span className="text-[14px] text-muted-foreground">{t({ bn: 'ফোন', en: 'Phone' })}</span></span></a>
            <div className="flex items-center gap-4 p-5"><MapPin className="size-5 text-brand" aria-hidden="true" /><span className="text-[15px]">{t(site.address)}</span></div>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          {sent ? (
            <div className="text-center py-10" role="status">
              <CheckCircle2 className="size-12 text-ok mx-auto" aria-hidden="true" />
              <h2 className="mt-4 text-[22px] font-semibold">{t({ bn: 'অনুরোধ তৈরি হয়েছে', en: 'Request ready' })}</h2>
              <p className="mt-2 text-muted-foreground text-[15px]">{t({ bn: 'নিচের বাটনে WhatsApp-এ মেসেজটা পাঠালেই আমাদের টিম যোগাযোগ করবে। ফোন: ', en: 'Send the message on WhatsApp below and our team will contact you. Phone: ' })}{site.phone}</p>
              <a href={sent} target="_blank" rel="noopener" className="btn-primary mt-6">{t({ bn: 'WhatsApp-এ পাঠান', en: 'Send on WhatsApp' })}</a>
              <button onClick={() => { setSent(null); setF(empty) }} className="btn-ghost mt-3 ml-2 cursor-pointer">{t({ bn: 'আরেকটা অনুরোধ', en: 'New request' })}</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <h2 className="text-[20px] font-semibold">{t({ bn: 'ডেমো বুক করুন', en: 'Book a demo' })}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label={t({ bn: 'আপনার নাম', en: 'Your name' })} error={err.name}><input id="name" className={input} value={f.name} onChange={set('name')} aria-invalid={!!err.name} aria-describedby={err.name ? 'name-err' : undefined} autoComplete="name" /></Field>
                <Field id="phone" label={t({ bn: 'ফোন নম্বর', en: 'Phone number' })} error={err.phone}><input id="phone" type="tel" inputMode="tel" className={input} value={f.phone} onChange={set('phone')} aria-invalid={!!err.phone} aria-describedby={err.phone ? 'phone-err' : undefined} autoComplete="tel" placeholder="01XXXXXXXXX" /></Field>
              </div>
              <Field id="property" label={t({ bn: 'প্রপার্টির নাম', en: 'Property name' })} error={err.property}><input id="property" className={input} value={f.property} onChange={set('property')} aria-invalid={!!err.property} aria-describedby={err.property ? 'property-err' : undefined} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="type" label={t({ bn: 'প্রপার্টির ধরন', en: 'Property type' })}>
                  <select id="type" className={input} value={f.type} onChange={set('type')}>{typeOptions.map((o) => <option key={o.id} value={o.id}>{t(o.l)}</option>)}</select>
                </Field>
                <Field id="rooms" label={t({ bn: 'রুম সংখ্যা', en: 'Number of rooms' })} error={err.rooms}><input id="rooms" inputMode="numeric" className={input} value={f.rooms} onChange={set('rooms')} aria-invalid={!!err.rooms} aria-describedby={err.rooms ? 'rooms-err' : undefined} /></Field>
              </div>
              <Field id="time" label={t({ bn: 'কখন কথা বলতে সুবিধা (ঐচ্ছিক)', en: 'Best time to talk (optional)' })}><input id="time" className={input} value={f.time} onChange={set('time')} placeholder={t({ bn: 'যেমন: বিকেল ৩টা–৫টা', en: 'e.g. 3–5 pm' })} /></Field>
              <button type="submit" className="btn-primary w-full h-12 cursor-pointer">{t({ bn: 'অনুরোধ পাঠান', en: 'Send request' })}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
