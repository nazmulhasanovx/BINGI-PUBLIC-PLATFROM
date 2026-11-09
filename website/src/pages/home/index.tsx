import { useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { ios } from '../../lib/motion'
import { useLang, type L } from '../../i18n/lang'
import { site } from '../../data/site'
import { plans } from '../../data/pricing'
import { modules, platformStatus } from '../../data/status'
import type { MediaId } from '../../data/media'
import { Hero } from '../../components/home/Hero'
import { StoryScroll } from '../../components/home/StoryScroll'
import { StudioDisplay, IPhone16PM } from '../../components/media/Devices'
import { Media } from '../../components/media/Media'
import { StatusChip } from '../../components/ui/StatusChip'
import { Accordion, PillTabs } from '../../components/ui/Ui'

const story: { title: L; text: L; media: MediaId }[] = [
  { media: 'story1', title: { bn: 'বুকিং আসে', en: 'A booking comes in' }, text: { bn: 'আপনার ওয়েবসাইট, BinGi মার্কেটপ্লেস বা রিসেপশন — সব বুকিং একই তালিকায়, একই নম্বরে।', en: 'From your website, the BinGi Marketplace or the front desk — every booking lands in one list with one ID.' } },
  { media: 'story2', title: { bn: 'রুম ঠিক হয়', en: 'A room is assigned' }, text: { bn: 'ক্যালেন্ডারে টেনে রুম বসান। একই রুম দুবার বিক্রি হয় না।', en: 'Drag it onto the calendar. The same room can never be sold twice.' } },
  { media: 'story3', title: { bn: 'গেস্ট চেক-ইন করে', en: 'The guest checks in' }, text: { bn: 'গেস্টের তথ্য, আইডি আর অগ্রিম পেমেন্ট এক স্ক্রিনে।', en: 'Guest details, ID and advance payment on one screen.' } },
  { media: 'story4', title: { bn: 'থাকার সময়ের খরচ', en: 'The stay adds up' }, text: { bn: 'রেস্টুরেন্ট অর্ডার আর সার্ভিস সরাসরি রুমের বিলে যোগ হয়।', en: 'Restaurant orders and services post straight to the room bill.' } },
  { media: 'story5', title: { bn: 'চেক-আউট, তারপর সব নিজে থেকে', en: 'Check-out does the rest' }, text: { bn: 'বিল মেলে, হাউসকিপিং টাস্ক তৈরি হয়, রিপোর্ট আপডেট হয়।', en: 'The bill settles, a cleaning task appears and the reports update.' } },
]

const bento: { media: MediaId; title: L; text: L; span: string }[] = [
  { media: 'bentoCalendar', span: 'md:col-span-4', title: { bn: 'বুকিং ক্যালেন্ডার', en: 'Booking calendar' }, text: { bn: 'প্রতিটা রুম, প্রতিটা রাত — টেনে বদলান।', en: 'Every room, every night — drag to change.' } },
  { media: 'bentoHousekeep', span: 'md:col-span-2', title: { bn: 'হাউসকিপিং', en: 'Housekeeping' }, text: { bn: 'চেক-আউটে ক্লিনিং টাস্ক নিজেই তৈরি।', en: 'Cleaning tasks created on check-out.' } },
  { media: 'bentoRestaurant', span: 'md:col-span-2', title: { bn: 'রেস্টুরেন্ট ও বার', en: 'Restaurant & bar' }, text: { bn: 'POS অর্ডার রুমের বিলে।', en: 'POS orders on the room bill.' } },
  { media: 'bentoCash', span: 'md:col-span-2', title: { bn: 'ক্যাশবক্স ও হিসাব', en: 'Cashbox & accounts' }, text: { bn: 'দিনশেষে টাকা মেলে।', en: 'Cash that adds up at day end.' } },
  { media: 'bentoStaff', span: 'md:col-span-2', title: { bn: 'স্টাফ ও HRM', en: 'Staff & HRM' }, text: { bn: 'হাজিরা, শিফট, ছুটি, বেতন।', en: 'Attendance, shifts, leave, payroll.' } },
  { media: 'bentoWebsite', span: 'md:col-span-6', title: { bn: 'আপনার নিজের হোটেল ওয়েবসাইট', en: 'Your own hotel website' }, text: { bn: 'থিম বেছে পাবলিশ করুন, সরাসরি বুকিং নিন।', en: 'Pick a theme, publish, take direct bookings.' } },
]

const types: { id: string; name: L; points: L[]; plan: string }[] = [
  { id: 'home', name: { bn: 'হোম / ফ্ল্যাট', en: 'Home / flat' }, plan: 'Starter', points: [{ bn: 'কয়েকটা রুম অনলাইনে লিস্ট করুন', en: 'List a few rooms online' }, { bn: 'মার্কেটপ্লেস ও ওয়াক-ইন বুকিং একসাথে', en: 'Marketplace and walk-in bookings together' }, { bn: 'নিজের ছোট ওয়েবসাইট', en: 'Your own simple website' }] },
  { id: 'guest', name: { bn: 'গেস্ট হাউস', en: 'Guest house' }, plan: 'Starter', points: [{ bn: 'রুম ক্যালেন্ডার ও বুকিং', en: 'Room calendar and bookings' }, { bn: 'গেস্ট তথ্য ও চ্যাট', en: 'Guest records and chat' }, { bn: 'অনলাইন ও অফলাইন বুকিং', en: 'Online and offline bookings' }] },
  { id: 'hotel', name: { bn: 'হোটেল', en: 'Hotel' }, plan: 'Business', points: [{ bn: 'ফ্রন্ট ডেস্ক থেকে হাউসকিপিং', en: 'Front desk to housekeeping' }, { bn: 'রেস্টুরেন্ট, QR অর্ডার ও খরচ', en: 'Restaurant, QR orders and expenses' }, { bn: 'অন্যান্য সার্ভিস ও রিপোর্ট', en: 'Other services and reports' }] },
  { id: 'resort', name: { bn: 'রিসোর্ট', en: 'Resort' }, plan: 'Ultra', points: [{ bn: 'রুম, কটেজ ও ভিলা এক সিস্টেমে', en: 'Rooms, cottages and villas in one system' }, { bn: 'রেস্টুরেন্ট, সার্ভিস ও ইনভেন্টরি', en: 'Restaurant, services and inventory' }, { bn: 'স্টাফ, HRM ও অ্যাডভান্সড অপারেশন', en: 'Staff, HRM and advanced operations' }] },
  { id: 'group', name: { bn: 'হোটেল গ্রুপ', en: 'Hotel group' }, plan: 'Custom', points: [{ bn: 'একাধিক প্রপার্টি', en: 'Multiple properties' }, { bn: 'নিজের মতো মডিউল ও লিমিট', en: 'Your modules and limits' }, { bn: 'মাইগ্রেশন ও অনসাইট সাপোর্ট', en: 'Migration and onsite support' }] },
]

const faqs: { q: L; a: L }[] = [
  { q: { bn: 'কিছু ইনস্টল করতে হবে?', en: 'Do I need to install anything?' }, a: { bn: 'না। BinGi HMS ব্রাউজারে চলে। স্টাফদের জন্য মোবাইল অ্যাপও আছে।', en: 'No. BinGi HMS runs in the browser, and staff also have a mobile app.' } },
  { q: { bn: 'বাংলায় ব্যবহার করা যাবে?', en: 'Can my team use it in Bangla?' }, a: { bn: 'হ্যাঁ, বাংলা আর ইংরেজি দুটোই আছে।', en: 'Yes, it works in Bangla and English.' } },
  { q: { bn: 'গেস্ট কীভাবে বুক করবে?', en: 'How do guests book?' }, a: { bn: 'আপনার নিজের ওয়েবসাইট, BinGi মার্কেটপ্লেস (bingi.app) অথবা সরাসরি রিসেপশনে।', en: 'On your own website, the BinGi Marketplace (bingi.app), or at reception.' } },
  { q: { bn: 'আমার ডেটা কি আলাদা থাকবে?', en: 'Is my data kept separate?' }, a: { bn: 'হ্যাঁ। প্রতিটা প্রপার্টির ডেটা, স্টাফ আর বিল আলাদা, শুধু অনুমতি পাওয়া মানুষ দেখে।', en: 'Yes. Each property has its own data, staff and invoices, visible only to people you allow.' } },
  { q: { bn: 'সেটআপে সাহায্য পাবো?', en: 'Will you help me set up?' }, a: { bn: 'হ্যাঁ। রিমোট ট্রেনিং এখন ফ্রি; চাইলে অনসাইট ট্রেনিংও আছে।', en: 'Yes. Remote training is free right now, and onsite training is available.' } },
]

function spot(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export default function Home() {
  const { t, taka } = useLang()
  const [type, setType] = useState('hotel')
  const active = types.find((x) => x.id === type)!
  const live = modules.filter((m) => m.status === 'live')

  return (
    <>
      <Hero />

      {/* modules marquee — quiet, continuous */}
      <section className="border-y border-line bg-white/60 py-5 overflow-hidden" aria-label={t({ bn: 'চালু মডিউল', en: 'Live modules' })}>
        <div className="relative [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <ul className="flex w-max gap-12 animate-marquee hover:[animation-play-state:paused]">
            {[...live, ...live].map((m, i) => (
              <li key={i} className="whitespace-nowrap text-[17px] font-medium text-muted-foreground" aria-hidden={i >= live.length}>{t(m.name)}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* story — one booking, five steps */}
      <section className="container-x pt-16 md:pt-24">
        <div className="max-w-[640px]">
          <h2 className="h2">{t({ bn: 'একটা বুকিং, শুরু থেকে শেষ পর্যন্ত', en: 'One booking, from first click to final report' })}</h2>
          <p className="lead mt-4">{t({ bn: 'আলাদা খাতা, আলাদা অ্যাপ নয়। একই বুকিং নম্বর প্রতিটা ধাপে নিজে থেকে এগোয়।', en: 'No separate notebooks or apps. The same booking ID moves through every step on its own.' })}</p>
        </div>
        <div className="mt-12 lg:mt-0"><StoryScroll steps={story.map((s) => ({ media: s.media, title: t(s.title), text: t(s.text) }))} /></div>
      </section>

      {/* bento — what you run every day */}
      <section className="container-x pt-16 md:pt-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="h2 max-w-[560px]">{t({ bn: 'প্রতিদিনের কাজ, এক জায়গায়', en: 'Everything you run each day, in one place' })}</h2>
          <Link to="/products" className="inline-flex min-h-11 items-center text-link font-medium text-[16px] hover:underline underline-offset-4">{t({ bn: 'সব মডিউল দেখুন', en: 'See all modules' })}</Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-6">
          {bento.map((b) => (
            <article key={b.media} onPointerMove={spot} className={`spotlight card overflow-hidden ${b.span}`}>
              <div className="p-6 pb-4">
                <h3 className="font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.02em]">{t(b.title)}</h3>
                <p className="mt-1 text-[16px] text-muted-foreground">{t(b.text)}</p>
              </div>
              <div className={`mx-4 mb-4 overflow-hidden rounded-[12px] border border-line ${b.media === 'bentoWebsite' ? 'md:h-[340px]' : 'md:h-[260px]'}`}><Media id={b.media} className="md:!aspect-auto" /></div>
            </article>
          ))}
        </div>
      </section>

      {/* dark bay — three platforms */}
      <section className="relative mt-16 md:mt-24 overflow-hidden bg-bay text-white grain">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#FD413F33,transparent)] blur-[30px]" aria-hidden="true" />
        <div className="container-x relative py-14 md:py-20">
          <div className="max-w-[620px]">
            <h2 className="h2">{t({ bn: 'ডেস্কে, স্টাফের হাতে, গেস্টের ফোনে', en: 'At the desk, in your staff’s hands, on your guest’s phone' })}</h2>
            <p className="mt-4 text-[18px] text-white/80 leading-relaxed">{t({ bn: 'তিনটা অ্যাপ, একই ডেটা। এক জায়গায় বদলালে সব জায়গায় বদলায়।', en: 'Three apps, one set of data. Change it once and it changes everywhere.' })}</p>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr] items-end">
            {([
              { key: 'web', frame: <StudioDisplay media="platformWeb" className="relative w-full" />, title: { bn: 'BinGi HMS ওয়েব', en: 'BinGi HMS Web' }, text: { bn: 'রিসেপশন ও ম্যানেজমেন্ট', en: 'Reception and management' } },
              { key: 'mobile', frame: <IPhone16PM media="platformMobile" className="relative w-[62%] mx-auto" />, title: { bn: 'HMS মোবাইল', en: 'HMS Mobile' }, text: { bn: 'স্টাফের আজকের কাজ', en: "Staff's work for today" } },
              { key: 'guest', frame: <IPhone16PM media="platformGuest" className="relative w-[62%] mx-auto" />, title: { bn: 'গেস্ট অ্যাপ', en: 'Guest App' }, text: { bn: 'খোঁজা, বুকিং, চ্যাট', en: 'Discover, book, chat' } },
            ] as const).map((p) => (
              <div key={p.key}>
                {p.frame}
                <div className="mt-6 flex items-start justify-between gap-3 border-t border-white/15 pt-4">
                  <div><h3 className="text-[18px] font-semibold">{t(p.title)}</h3><p className="text-[15px] text-white/75">{t(p.text)}</p></div>
                  <StatusChip status={platformStatus[p.key]} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* property types */}
      <section className="container-x pt-16 md:pt-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
          <div>
            <h2 className="h2">{t({ bn: 'ছোট বাসা থেকে বড় রিসোর্ট', en: 'From a small home to a large resort' })}</h2>
            <div className="mt-8"><PillTabs tone="ink" wrap label={t({ bn: 'প্রপার্টির ধরন', en: 'Property type' })} value={type} onChange={setType} options={types.map((x) => ({ id: x.id, label: t(x.name) }))} /></div>
          </div>
          <motion.div key={type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ios} className="card glow-border p-7 md:p-9" role="tabpanel">
            <ul className="space-y-4">
              {active.points.map((p, i) => <li key={i} className="flex gap-3 text-[18px]"><Check className="size-5 text-ok shrink-0 mt-1" aria-hidden="true" />{t(p)}</li>)}
            </ul>
            <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
              <span className="text-[15px] text-muted-foreground">{t({ bn: 'প্রস্তাবিত প্ল্যান', en: 'Suggested plan' })} <strong className="text-ink font-semibold">{active.plan}</strong></span>
              <Link to="/pricing" className="inline-flex min-h-11 items-center text-link text-[15px] font-medium hover:underline underline-offset-4">{t({ bn: 'দাম দেখুন', en: 'See pricing' })}</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* pricing — one quiet line, not another card grid */}
      <section className="container-x pt-16 md:pt-24">
        <div className="rounded-[24px] bg-white border border-line px-6 py-10 md:px-12 md:py-14 grid gap-8 md:grid-cols-[1.2fr_2fr] md:items-center">
          <div>
            <h2 className="h2">{t({ bn: 'প্রতি রুমে দাম', en: 'Priced per room' })}</h2>
            <p className="lead mt-3">{t({ bn: 'সর্বনিম্ন ১০ রুম। ৬ মাসে ১০%, ১২ মাসে ২৫% ছাড়।', en: 'From 10 rooms. Save 10% on 6 months, 25% on 12.' })}</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line">
            {plans.filter((p) => p.rate).map((p) => (
              <Link key={p.id} to="/pricing" className="px-3 md:px-6 text-center group">
                <p className="text-[15px] text-muted-foreground">{p.name}</p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-[34px] md:text-[44px] font-semibold tracking-[-0.03em] group-hover:text-brand transition-colors">{taka(p.rate!)}</p>
                <p className="text-[14px] text-soft">{t({ bn: 'প্রতি রুম/মাস', en: 'per room / month' })}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pt-16 md:pt-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="h2">{t({ bn: 'সাধারণ প্রশ্ন', en: 'Common questions' })}</h2>
            <p className="lead mt-3">{t({ bn: 'আরও জানতে চান? ', en: 'More questions? ' })}<Link to="/help" className="text-link hover:underline underline-offset-4">{t({ bn: 'হেল্প সেন্টার', en: 'Visit the help center' })}</Link></p>
          </div>
          <Accordion items={faqs.map((f) => ({ q: t(f.q), a: t(f.a) }))} />
        </div>
      </section>

      {/* closing — the sunrise again */}
      <section className="container-x pt-16 md:pt-24">
        <div className="relative overflow-hidden rounded-[28px] bg-bay text-white px-6 py-12 md:px-14 md:py-16 grain">
          <div className="pointer-events-none absolute left-1/2 bottom-[-180px] h-[360px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#FFB38A,#FD413F88_45%,transparent_75%)] blur-[30px] opacity-70" aria-hidden="true" />
          <div className="pointer-events-none absolute left-0 right-0 bottom-[22%] h-px bg-[linear-gradient(90deg,transparent,#FD413F_30%,#FFB38A_50%,#FD413F_70%,transparent)] opacity-70" aria-hidden="true" />
          <div className="relative max-w-[640px]">
            <h2 className="display text-[40px] md:text-[64px]">{t({ bn: 'আজই আপনার প্রপার্টি সেটআপ করুন', en: 'Set up your property today' })}</h2>
            <p className="mt-4 text-[18px] text-white/85">{t({ bn: 'অ্যাকাউন্ট খুলুন, রুম যোগ করুন, বুকিং নেওয়া শুরু করুন।', en: 'Create your account, add your rooms and start taking bookings.' })}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={site.hmsRegister} className="btn h-12 px-6 bg-white text-ink hover:-translate-y-px shadow-lift">{t({ bn: 'শুরু করুন', en: 'Get started' })}</a>
              <a href={site.whatsapp} className="btn h-12 px-6 border border-white/30 text-white hover:bg-white/10">{t({ bn: 'WhatsApp-এ কথা বলুন', en: 'Talk on WhatsApp' })}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
