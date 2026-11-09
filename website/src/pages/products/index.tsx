import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { useLang, type L } from '../../i18n/lang'
import { modules, platformStatus } from '../../data/status'
import type { MediaId } from '../../data/media'
import { StudioDisplay, IPhone16PM } from '../../components/media/Devices'
import { Media } from '../../components/media/Media'
import { StatusChip } from '../../components/ui/StatusChip'
import { Icon } from '../../components/ui/Icon'
import { Reveal } from '../../components/ui/Reveal'
import { SectionHead } from '../../components/ui/Ui'

type Platform = { id: 'web' | 'mobile' | 'guest'; tab: L; title: L; lead: L; device: 'display' | 'phone'; media: MediaId; features: L[] }

const platforms: Platform[] = [
  { id: 'web', device: 'display', media: 'platformWeb', tab: { bn: 'ওয়েব', en: 'Web' },
    title: { bn: 'BinGi HMS ওয়েব', en: 'BinGi HMS Web' },
    lead: { bn: 'রিসেপশন, ম্যানেজার আর মালিকের জন্য পুরো হোটেল এক স্ক্রিনে।', en: 'The whole hotel on one screen for reception, managers and owners.' },
    features: [
      { bn: 'ড্যাশবোর্ডে আজকের আগমন, অকুপেন্সি ও আয়', en: "Today's arrivals, occupancy and revenue on the dashboard" },
      { bn: 'বুকিং ক্যালেন্ডার ও রুম বোর্ড', en: 'Booking calendar and room board' },
      { bn: 'প্ল্যান অনুযায়ী রেস্টুরেন্ট, স্টাফ, ইনভেন্টরি ও হিসাব', en: 'Restaurant, staff, inventory and accounts by plan' },
      { bn: 'বাংলা/ইংরেজি, Flat বা Expandable সাইডবার', en: 'Bangla/English, Flat or Expandable sidebar' },
    ] },
  { id: 'mobile', device: 'phone', media: 'platformMobile', tab: { bn: 'মোবাইল', en: 'Mobile' },
    title: { bn: 'BinGi HMS মোবাইল', en: 'BinGi HMS Mobile' },
    lead: { bn: 'স্টাফ হাতের ফোনেই নিজের কাজ দেখে ও শেষ করে।', en: 'Staff see and finish their work on their own phone.' },
    features: [
      { bn: 'রোল অনুযায়ী আজকের কাজ', en: "Today's tasks by role" },
      { bn: 'হাউসকিপিং টাস্ক আপডেট', en: 'Housekeeping task updates' },
      { bn: 'বুকিং ও গেস্ট দেখা', en: 'View bookings and guests' },
      { bn: 'নোটিফিকেশন', en: 'Notifications' },
    ] },
  { id: 'guest', device: 'phone', media: 'platformGuest', tab: { bn: 'গেস্ট অ্যাপ', en: 'Guest App' },
    title: { bn: 'গেস্ট অ্যাপ ও মার্কেটপ্লেস', en: 'Guest App & Marketplace' },
    lead: { bn: 'গেস্ট bingi.app-এ হোটেল খুঁজে সরাসরি বুক করে।', en: 'Guests find hotels on bingi.app and book directly.' },
    features: [
      { bn: 'হোটেল ও রুম খোঁজা', en: 'Discover hotels and rooms' },
      { bn: 'পুরো বা আংশিক পেমেন্টে বুকিং', en: 'Book with full or partial payment' },
      { bn: 'আমার বুকিং', en: 'My bookings' },
      { bn: 'হোটেলের সাথে চ্যাট', en: 'Chat with the hotel' },
    ] },
]

const bento: { media: MediaId; title: L; text: L }[] = [
  { media: 'bentoCalendar', title: { bn: 'ক্যালেন্ডারে টেনে বুকিং', en: 'Drag bookings on the calendar' }, text: { bn: 'রুম বা তারিখ বদলান এক টানে।', en: 'Change room or dates in one move.' } },
  { media: 'bentoHousekeep', title: { bn: 'চেকআউট → ক্লিনিং', en: 'Checkout → cleaning' }, text: { bn: 'হাউসকিপিং টাস্ক নিজে থেকেই তৈরি।', en: 'Housekeeping task created automatically.' } },
  { media: 'bentoRestaurant', title: { bn: 'রেস্টুরেন্ট বিল রুমে', en: 'Restaurant bill to the room' }, text: { bn: 'POS অর্ডার গেস্টের ফোলিওতে যায়।', en: 'POS orders post to the guest folio.' } },
  { media: 'bentoWebsite', title: { bn: 'নিজের হোটেল ওয়েবসাইট', en: 'Your own hotel website' }, text: { bn: 'থিম বেছে পাবলিশ করুন।', en: 'Pick a theme and publish.' } },
]

export default function Products() {
  const { t } = useLang()
  const [tab, setTab] = useState<Platform['id'] | 'modules'>('web')
  useEffect(() => { if (location.hash === '#modules') setTab('modules') }, [])
  const p = platforms.find((x) => x.id === tab)

  return (
    <div className="container-x pt-14">
      <SectionHead eyebrow={t({ bn: 'প্রোডাক্ট', en: 'Products' })} title={t({ bn: 'একটা ইকোসিস্টেম, তিনটা প্ল্যাটফর্ম', en: 'One ecosystem, three platforms' })} lead={t({ bn: 'সব প্ল্যাটফর্ম একই ডেটা আর একই বুকিং নম্বরে চলে।', en: 'Every platform works on the same data and booking ID.' })} />

      <div className="sticky top-16 z-30 mt-8 -mx-5 px-5 py-3 bg-canvas/90 backdrop-blur-md">
        <div role="tablist" aria-label="Products" className="flex gap-2 overflow-x-auto justify-start md:justify-center">
          {[...platforms.map((x) => ({ id: x.id, label: t(x.tab) })), { id: 'modules' as const, label: t({ bn: 'সব মডিউল', en: 'All modules' }) }].map((x) => (
            <button key={x.id} role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)}
              className={`h-11 shrink-0 rounded-full px-5 text-[15px] font-medium cursor-pointer border transition-colors duration-150 ${tab === x.id ? 'bg-ink text-white border-ink' : 'bg-white text-muted-foreground border-line hover:text-ink'}`}>{x.label}</button>
          ))}
        </div>
      </div>

      {p && (
        <section key={p.id} className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_1fr] items-center" role="tabpanel">
          <Reveal className="relative grid place-items-center rounded-[16px] bg-white border border-line p-6 md:p-10 shadow-lift overflow-hidden"><div className="pointer-events-none absolute inset-x-[15%] top-[20%] bottom-[10%] rounded-full bg-gradient-to-r from-brand/20 to-[#6E8EF5]/20 blur-[60px]" aria-hidden="true" />
            {p.device === 'display' ? <StudioDisplay media={p.media} className="relative w-full" /> : <IPhone16PM media={p.media} className="relative w-[48%] max-w-[300px]" />}
          </Reveal>
          <Reveal delay={80}>
            <StatusChip status={platformStatus[p.id]} />
            <h2 className="h2 mt-3">{t(p.title)}</h2>
            <p className="lead mt-3">{t(p.lead)}</p>
            <ul className="mt-6 space-y-3">
              {p.features.map((f, i) => <li key={i} className="flex gap-3 text-[16px]"><Check className="size-5 text-ok shrink-0 mt-0.5" aria-hidden="true" />{t(f)}</li>)}
            </ul>
          </Reveal>
        </section>
      )}

      {tab === 'web' && (
        <section className="mt-16 grid gap-4 md:grid-cols-2">
          {bento.map((b, i) => (
            <Reveal key={b.media} delay={i * 60} className="card card-hover overflow-hidden">
              <div className="border-b border-line"><Media id={b.media} /></div>
              <div className="p-5"><h3 className="text-[17px] font-semibold">{t(b.title)}</h3><p className="mt-1 text-[15px] text-muted-foreground">{t(b.text)}</p></div>
            </Reveal>
          ))}
        </section>
      )}

      {tab === 'modules' && (
        <section id="modules" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="tabpanel">
          {modules.map((m, i) => (
            <Reveal key={m.id} delay={(i % 6) * 40} className="card card-hover p-5 flex gap-4">
              <span className={`grid size-11 shrink-0 place-items-center rounded-[10px] ${m.status === 'live' ? 'bg-brand-soft text-brand' : 'bg-canvas text-muted-foreground'}`}><Icon name={m.icon} /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="text-[16px] font-semibold">{t(m.name)}</h3><StatusChip status={m.status} /></div>
                <p className="mt-1 text-[14px] text-muted-foreground leading-relaxed">{t(m.desc)}</p>
              </div>
            </Reveal>
          ))}
        </section>
      )}
    </div>
  )
}
