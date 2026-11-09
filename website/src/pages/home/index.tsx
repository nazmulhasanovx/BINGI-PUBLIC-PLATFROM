import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarX2, Check, Coins, Layers, MessageCircleWarning } from 'lucide-react'
import { useLang, type L } from '../../i18n/lang'
import { site } from '../../data/site'
import { plans } from '../../data/pricing'
import { platformStatus } from '../../data/status'
import { StudioDisplay, IPhone16PM } from '../../components/media/Devices'
import { Media } from '../../components/media/Media'
import { StatusChip } from '../../components/ui/StatusChip'
import { Reveal } from '../../components/ui/Reveal'
import { Accordion, SectionHead } from '../../components/ui/Ui'
import { ctaLabel } from '../../components/layout/Layout'

const pains: { icon: typeof Layers; title: L; text: L }[] = [
  { icon: Layers, title: { bn: 'বুকিং ছড়িয়ে আছে', en: 'Bookings everywhere' }, text: { bn: 'ফোন, WhatsApp, OTA আর খাতায় আলাদা আলাদা হিসাব।', en: 'Phone, WhatsApp, OTAs and notebooks all kept separately.' } },
  { icon: CalendarX2, title: { bn: 'ডাবল বুকিং', en: 'Double bookings' }, text: { bn: 'একই রুম দুইজনকে দেওয়া — গেস্ট আর রিভিউ দুটোই হারায়।', en: 'One room sold twice — you lose the guest and the review.' } },
  { icon: Coins, title: { bn: 'ক্যাশ মেলে না', en: "Cash doesn't add up" }, text: { bn: 'দিনশেষে কত এল, কত বাকি — কেউ নিশ্চিত না।', en: 'At day end nobody is sure what came in and what is due.' } },
  { icon: MessageCircleWarning, title: { bn: 'টিমে সমন্বয় নেই', en: 'Team out of sync' }, text: { bn: 'চেকআউট হলো, কিন্তু হাউসকিপিং জানল না।', en: 'A guest checked out, housekeeping never heard.' } },
]

const chain: L[] = [
  { bn: 'ওয়েবসাইট / মার্কেটপ্লেস / ওয়াক-ইন', en: 'Website / Marketplace / Walk-in' },
  { bn: 'রিজার্ভেশন', en: 'Reservation' },
  { bn: 'চেক-ইন', en: 'Check-in' },
  { bn: 'সার্ভিস ও খাবার', en: 'Services & F&B' },
  { bn: 'পেমেন্ট', en: 'Payment' },
  { bn: 'চেক-আউট', en: 'Check-out' },
  { bn: 'হাউসকিপিং', en: 'Housekeeping' },
  { bn: 'রিপোর্ট', en: 'Reports' },
]

const types: { id: string; name: L; points: L[]; plan: string }[] = [
  { id: 'home', name: { bn: 'হোম / ফ্ল্যাট', en: 'Home / Flat' }, plan: 'Starter', points: [
    { bn: 'কয়েকটা রুম অনলাইনে লিস্ট করুন', en: 'List a few rooms online' }, { bn: 'মার্কেটপ্লেস ও ওয়াক-ইন বুকিং এক জায়গায়', en: 'Marketplace and walk-in bookings together' }, { bn: 'নিজের ছোট ওয়েবসাইট', en: 'Your own simple website' }] },
  { id: 'guest', name: { bn: 'গেস্ট হাউস', en: 'Guest house' }, plan: 'Starter', points: [
    { bn: 'রুম ক্যালেন্ডার ও বুকিং', en: 'Room calendar and bookings' }, { bn: 'গেস্ট তথ্য ও চ্যাট', en: 'Guest records and chat' }, { bn: 'অনলাইন + অফলাইন বুকিং', en: 'Online + offline bookings' }] },
  { id: 'hotel', name: { bn: 'হোটেল', en: 'Hotel' }, plan: 'Business', points: [
    { bn: 'ফ্রন্ট ডেস্ক থেকে হাউসকিপিং', en: 'Front desk to housekeeping' }, { bn: 'রেস্টুরেন্ট, QR অর্ডার ও খরচ', en: 'Restaurant, QR orders and expenses' }, { bn: 'অন্যান্য সার্ভিস ও রিপোর্ট', en: 'Other services and reports' }] },
  { id: 'resort', name: { bn: 'রিসোর্ট', en: 'Resort' }, plan: 'Ultra', points: [
    { bn: 'রুম, কটেজ ও ভিলা এক সিস্টেমে', en: 'Rooms, cottages and villas in one system' }, { bn: 'রেস্টুরেন্ট, সার্ভিস ও ইনভেন্টরি', en: 'Restaurant, services and inventory' }, { bn: 'স্টাফ, HRM ও ইনভেন্টরি', en: 'Staff, HRM and inventory' }] },
  { id: 'group', name: { bn: 'হোটেল গ্রুপ', en: 'Hotel group' }, plan: 'Custom', points: [
    { bn: 'একাধিক প্রপার্টি', en: 'Multiple properties' }, { bn: 'নিজের মতো মডিউল ও লিমিট', en: 'Your modules and limits' }, { bn: 'মাইগ্রেশন ও অনসাইট সাপোর্ট', en: 'Migration and onsite support' }] },
]

const faqs: { q: L; a: L }[] = [
  { q: { bn: 'কিছু ইনস্টল করতে হবে?', en: 'Do I need to install anything?' }, a: { bn: 'না। BinGi HMS ব্রাউজারে চলে। স্টাফদের জন্য মোবাইল অ্যাপও আছে।', en: 'No. BinGi HMS runs in the browser, and staff also have a mobile app.' } },
  { q: { bn: 'বাংলায় ব্যবহার করা যাবে?', en: 'Can my team use it in Bangla?' }, a: { bn: 'হ্যাঁ, বাংলা আর ইংরেজি দুটোই আছে।', en: 'Yes, it works in both Bangla and English.' } },
  { q: { bn: 'গেস্ট কীভাবে বুক করবে?', en: 'How do guests book?' }, a: { bn: 'আপনার নিজের ওয়েবসাইট, BinGi মার্কেটপ্লেস (bingi.app) অথবা সরাসরি রিসেপশনে।', en: 'Through your own website, the BinGi Marketplace (bingi.app), or at reception.' } },
  { q: { bn: 'আমার ডেটা কি আলাদা থাকবে?', en: 'Is my data kept separate?' }, a: { bn: 'হ্যাঁ। প্রতিটা প্রপার্টির ডেটা, স্টাফ আর বিল আলাদা থাকে, শুধু অনুমতি পাওয়া মানুষ দেখতে পারে।', en: 'Yes. Each property has its own data, staff and invoices, visible only to authorised people.' } },
  { q: { bn: 'সেটআপে সাহায্য পাবো?', en: 'Will you help me set up?' }, a: { bn: 'হ্যাঁ। রিমোট ট্রেনিং এখন ফ্রি; চাইলে অনসাইট ট্রেনিংও নেওয়া যায়।', en: 'Yes. Remote training is free right now, and onsite training is available.' } },
]

export default function Home() {
  const { t, taka } = useLang()
  const [type, setType] = useState('hotel')
  const active = types.find((x) => x.id === type)!

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute -top-40 left-1/2 h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-[#F7C9CD] opacity-50 blur-[120px] animate-float" />
          <div className="absolute top-40 -right-40 h-[420px] w-[520px] rounded-full bg-[#C9D6F7] opacity-50 blur-[120px] animate-float-slow" />
          <div className="absolute top-[520px] -left-40 h-[360px] w-[460px] rounded-full bg-[#F9DCC9] opacity-40 blur-[120px] animate-float-slow" />
        </div>
        <div className="container-x pt-14 md:pt-20 text-center">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-brand/30 bg-white px-3 py-1 text-[13px] font-medium text-brand">{t({ bn: 'হোটেল ম্যানেজমেন্ট টেকনোলজি', en: 'Hotel Management Technology' })}</span>
            <h1 className="mt-5 text-[36px] md:text-[56px] font-semibold tracking-tight leading-[1.08] text-balance max-w-[900px] mx-auto">
              {t({ bn: 'আপনার হোটেলের সব কাজ, এক সিস্টেমে', en: "Your whole hotel, in one system" })}
            </h1>
            <p className="lead mt-5 max-w-[640px] mx-auto text-pretty">
              {t({ bn: 'ওয়েবসাইট, বুকিং, ফ্রন্ট ডেস্ক, হাউসকিপিং, রেস্টুরেন্ট, স্টাফ আর হিসাব — সব যুক্ত। হোটেল টিম হোটেল চালায়; BinGi চালায় টেকনোলজি।', en: 'Website, bookings, front desk, housekeeping, restaurant, staff and accounts — all connected. Your team runs the hotel; BinGi runs the technology.' })}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a href={site.hmsRegister} className="btn-primary h-12 px-6"><span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shine" aria-hidden="true" />{t(ctaLabel)}<ArrowRight className="size-4" aria-hidden="true" /></a>
              <Link to="/contact" className="btn-ghost h-12 px-6">{t({ bn: 'ডেমো বুক করুন', en: 'Book a demo' })}</Link>
            </div>
          </Reveal>
          <Reveal delay={120} className="relative mx-auto mt-14 max-w-[1000px] pb-6">
            <div className="pointer-events-none absolute inset-x-[10%] top-[18%] bottom-[8%] -z-10 rounded-[40px] bg-gradient-to-r from-brand/30 via-[#6E8EF5]/25 to-brand/25 blur-[70px]" aria-hidden="true" />
            <StudioDisplay media="heroWeb" className="relative w-[88%] md:w-[86%]" />
            <IPhone16PM media="heroPhone" className="absolute right-0 bottom-0 w-[24%] md:w-[19%]" />
          </Reveal>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="container-x mt-24">
        <SectionHead eyebrow={t({ bn: 'সমস্যা', en: 'The problem' })} title={t({ bn: 'আলাদা আলাদা টুলে হোটেল চালানো কঠিন', en: 'Running a hotel on scattered tools is hard' })} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pains.map((p, i) => (
            <Reveal key={i} delay={i * 60} className="card card-hover p-6">
              <span className="grid size-11 place-items-center rounded-[10px] bg-brand-soft text-brand"><p.icon className="size-5" aria-hidden="true" /></span>
              <h3 className="mt-4 text-[17px] font-semibold">{t(p.title)}</h3>
              <p className="mt-1.5 text-[15px] text-muted leading-relaxed">{t(p.text)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ONE BOOKING CHAIN */}
      <section className="container-x mt-24">
        <SectionHead eyebrow={t({ bn: 'সমাধান', en: 'The solution' })} title={t({ bn: 'একটা বুকিং, শুরু থেকে শেষ পর্যন্ত যুক্ত', en: 'One booking, connected from start to finish' })} lead={t({ bn: 'একই বুকিং নম্বর ধরে প্রতিটা ধাপ নিজে থেকেই পরের ধাপে যায়।', en: 'Every step carries the same booking ID into the next one automatically.' })} />
        <Reveal className="mt-10">
          <ol className="flex flex-wrap justify-center gap-2">
            {chain.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-line px-4 h-10 text-[14px] font-medium shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift">
                  <span className="grid size-6 place-items-center rounded-full bg-ink text-white text-[12px]">{i + 1}</span>{t(c)}
                </span>
                {i < chain.length - 1 && <ArrowRight className="size-4 text-muted hidden sm:block" aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <div className="card glow-border mt-8 overflow-hidden max-w-[900px] mx-auto shadow-lift"><Media id="chain" /></div>
        </Reveal>
      </section>

      {/* PLATFORMS */}
      <section className="container-x mt-24">
        <SectionHead eyebrow={t({ bn: 'প্ল্যাটফর্ম', en: 'Platforms' })} title={t({ bn: 'ডেস্কে, হাতে, আর গেস্টের ফোনে', en: 'At the desk, in hand, and on the guest’s phone' })} />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {([
            { key: 'web', frame: <StudioDisplay media="platformWeb" />, title: { bn: 'BinGi HMS ওয়েব', en: 'BinGi HMS Web' }, text: { bn: 'রিসেপশন ও ম্যানেজমেন্টের পুরো কাজ।', en: 'Everything for reception and management.' } },
            { key: 'mobile', frame: <IPhone16PM media="platformMobile" className="w-[42%] mx-auto" />, title: { bn: 'BinGi HMS মোবাইল', en: 'BinGi HMS Mobile' }, text: { bn: 'স্টাফদের আজকের কাজ, যেকোনো জায়গা থেকে।', en: "Staff see today's work from anywhere." } },
            { key: 'guest', frame: <IPhone16PM media="platformGuest" className="w-[42%] mx-auto" />, title: { bn: 'গেস্ট অ্যাপ ও মার্কেটপ্লেস', en: 'Guest App & Marketplace' }, text: { bn: 'গেস্ট খুঁজে, বুক করে, চ্যাট করে।', en: 'Guests discover, book and chat.' } },
          ] as const).map((p, i) => (
            <Reveal key={p.key} delay={i * 80} className="card card-hover p-6 flex flex-col">
              <div className="flex-1 grid place-items-center rounded-[10px] bg-canvas p-6 min-h-[260px]">{p.frame}</div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <div><h3 className="text-[17px] font-semibold">{t(p.title)}</h3><p className="mt-1 text-[15px] text-muted">{t(p.text)}</p></div>
                <StatusChip status={platformStatus[p.key]} />
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 text-center"><Link to="/products" className="inline-flex items-center gap-1.5 text-link font-medium text-[15px] hover:underline">{t({ bn: 'সব মডিউল দেখুন', en: 'See all modules' })}<ArrowRight className="size-4" aria-hidden="true" /></Link></div>
      </section>

      {/* PROPERTY TYPES */}
      <section className="container-x mt-24">
        <SectionHead eyebrow={t({ bn: 'কার জন্য', en: 'Who it’s for' })} title={t({ bn: 'ছোট বাসা থেকে বড় রিসোর্ট', en: 'From a small home to a large resort' })} />
        <div className="mt-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Property type">
          {types.map((x) => (
            <button key={x.id} role="tab" aria-selected={type === x.id} onClick={() => setType(x.id)}
              className={`h-11 rounded-full px-5 text-[15px] font-medium cursor-pointer border transition-colors duration-150 ${type === x.id ? 'bg-ink text-white border-ink' : 'bg-white text-muted border-line hover:text-ink'}`}>{t(x.name)}</button>
          ))}
        </div>
        <div className="card glow-border mt-6 max-w-[760px] mx-auto p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center" role="tabpanel">
          <ul className="space-y-3">
            {active.points.map((p, i) => <li key={i} className="flex gap-3 text-[16px]"><Check className="size-5 text-ok shrink-0 mt-0.5" aria-hidden="true" />{t(p)}</li>)}
          </ul>
          <div className="rounded-[10px] bg-canvas p-5 text-center min-w-[180px]">
            <p className="text-[13px] text-muted">{t({ bn: 'প্রস্তাবিত প্ল্যান', en: 'Suggested plan' })}</p>
            <p className="mt-1 text-[22px] font-semibold">{active.plan}</p>
            <Link to="/pricing" className="mt-2 inline-block text-link text-[14px] font-medium hover:underline">{t({ bn: 'দাম দেখুন', en: 'See price' })}</Link>
          </div>
        </div>
      </section>

      {/* PLAN TEASER */}
      <section className="container-x mt-24">
        <SectionHead eyebrow={t({ bn: 'প্রাইসিং', en: 'Pricing' })} title={t({ bn: 'প্রতি রুমে সহজ মাসিক দাম', en: 'Simple pricing per room' })} lead={t({ bn: 'সর্বনিম্ন ১০ রুম। ৬ মাসে ১০% আর ১২ মাসে ২৫% ছাড়।', en: 'From 10 rooms. 10% off for 6 months, 25% off for 12 months.' })} />
        <div className="mt-10 grid gap-4 sm:grid-cols-3 max-w-[900px] mx-auto">
          {plans.filter((p) => p.rate).map((p) => (
            <Link key={p.id} to="/pricing" className={`card card-hover p-6 text-center ${p.popular ? 'glow-border shadow-glow' : ''}`}>
              <p className="text-[15px] font-medium text-muted">{p.name}</p>
              <p className="mt-2 text-[30px] font-semibold">{taka(p.rate!)}<span className="text-[14px] font-normal text-muted"> /{t({ bn: 'রুম/মাস', en: 'room/mo' })}</span></p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x mt-24 max-w-[820px]">
        <SectionHead title={t({ bn: 'সাধারণ প্রশ্ন', en: 'Common questions' })} />
        <div className="mt-8"><Accordion items={faqs.map((f) => ({ q: t(f.q), a: t(f.a) }))} /></div>
      </section>

      {/* CTA */}
      <section className="container-x mt-24">
        <Reveal className="relative overflow-hidden rounded-[20px] bg-ink text-white px-6 py-14 md:p-16 text-center shadow-lift">
          <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-brand/50 blur-[90px] animate-float" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-[#3B5BDB]/40 blur-[90px] animate-float-slow" aria-hidden="true" />
          <div className="relative">
          <h2 className="text-[28px] md:text-[40px] font-semibold tracking-tight text-balance">{t({ bn: 'আজই আপনার প্রপার্টি সেটআপ করুন', en: 'Set up your property today' })}</h2>
          <p className="mt-3 text-white/70 text-[17px]">{t({ bn: 'অ্যাকাউন্ট খুলুন, প্রপার্টি সাজান, বুকিং নেওয়া শুরু করুন।', en: 'Create your account, set up your property and start taking bookings.' })}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a href={site.hmsRegister} className="btn bg-white text-ink hover:bg-white/90 h-12 px-6">{t(ctaLabel)}<ArrowRight className="size-4" aria-hidden="true" /></a>
            <a href={site.whatsapp} className="btn border border-white/25 text-white hover:bg-white/10 h-12 px-6">WhatsApp</a>
          </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
