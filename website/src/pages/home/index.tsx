import { asset } from '@/lib/utils'
import { useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { useLang, type L } from '../../i18n/lang'
import { site } from '../../data/site'
import { modules } from '../../data/status'
import type { MediaId } from '../../data/media'
import { Hero } from '../../components/home/Hero'
import { StoryScroll } from '../../components/home/StoryScroll'
import { StudioDisplay, IPhone16PM } from '../../components/media/Devices'
import { Media } from '../../components/media/Media'
import { Accordion, PillTabs } from '../../components/ui/Ui'
import { team } from '../../data/team'
import { faqsFor } from '../../data/faqs'
import { copy, shown } from '../../data/copy'
import { Integrations, PriceSlider, Testimonials, ThemeAiPreview, TrustStrip, useZoom, ZoomHint } from '../../components/home/HomeExtras'

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


function spot(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export default function Home() {
  const { t } = useLang()
  const [type, setType] = useState('hotel')
  const active = types.find((x) => x.id === type)!
  const live = modules.filter((m) => m.status === 'live')
  const zoom = useZoom()

  return (
    <>
      <Hero />
      <TrustStrip />

      {/* modules marquee — quiet, continuous */}
      <section className="hidden md:block border-y border-line bg-white/60 py-5 overflow-hidden" aria-label={t({ bn: 'চালু মডিউল', en: 'Live modules' })}>
        <div className="relative [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <ul className="flex w-max gap-12 animate-marquee hover:[animation-play-state:paused]">
            {[...live, ...live].map((m, i) => (
              <li key={i} className="whitespace-nowrap text-[17px] font-medium text-muted-foreground" aria-hidden={i >= live.length}>{t(m.name)}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* story — one booking, five steps */}
      {shown('home.story') && (
      <section className="container-x pt-16 md:pt-24">
        <div className="max-w-[640px]">
          <h2 className="h2">{t(copy('home.story.title', { bn: 'একটা বুকিং, শুরু থেকে শেষ পর্যন্ত', en: 'One booking, from first click to final report' }))}</h2>
          <p className="lead mt-4 hidden sm:block">{t({ bn: 'আলাদা খাতা, আলাদা অ্যাপ নয়। একই বুকিং নম্বর প্রতিটা ধাপে নিজে থেকে এগোয়।', en: 'No separate notebooks or apps. The same booking ID moves through every step on its own.' })}</p>
        </div>
        <div className="mt-12 lg:mt-0"><StoryScroll steps={story.map((s) => ({ media: s.media, title: t(s.title), text: t(s.text) }))} /></div>
      </section>
      )}

      {/* bento — what you run every day */}
      {shown('home.bento') && (
      <section className="container-x pt-16 md:pt-24">
        <div className="flex items-end justify-between gap-4">
          <h2 className="h2 max-w-[560px]">{t(copy('home.bento.title', { bn: 'প্রতিদিনের কাজ, এক জায়গায়', en: 'Everything you run each day, in one place' }))}</h2>
          <Link to="/products" className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-link font-medium text-[16px] hover:underline underline-offset-4"><span className="hidden sm:inline">{t({ bn: 'সব মডিউল দেখুন', en: 'See all modules' })}</span><span className="sm:hidden">{t({ bn: 'সব দেখুন', en: 'See all' })}</span></Link>
        </div>
        <div className="relative isolate mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-6">
          <div className="ambient -left-24 -top-16 h-[360px] w-[520px]" aria-hidden="true" />
          <div className="ambient -right-24 bottom-0 h-[320px] w-[460px] opacity-40" aria-hidden="true" />
          {bento.map((b, i) => (
            <article key={b.media} onPointerMove={spot} className={`spotlight card glow-hover overflow-hidden flex flex-col ${i === 0 || i === bento.length - 1 ? 'col-span-2' : 'col-span-1 sm:col-span-2'} ${b.span}`}>
              <div className="p-6 pb-4">
                <h3 className="font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.02em]">{t(b.title)}</h3>
              </div>
              <button type="button" onClick={() => zoom.open(b.media, t(b.title))} aria-label={t({ bn: `${b.title.bn} — বড় করে দেখুন`, en: `${b.title.en} — view larger` })}
                className={`group relative mx-3 mb-3 mt-auto cursor-zoom-in overflow-hidden rounded-[12px] text-left ring-1 ring-ink/5 ${i === 0 ? 'block' : 'hidden sm:block'}`}><Media id={b.media} /><ZoomHint /></button>
            </article>
          ))}
        </div>
      </section>
      )}

      {/* dark bay — three platforms */}
      {shown('home.platforms') && (
      <section className="relative mt-16 md:mt-24 overflow-hidden bg-bay text-white grain">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#FD413F33,transparent)] blur-[30px]" aria-hidden="true" />
        <div className="container-x relative py-14 md:py-20">
          <div className="max-w-[620px]">
            <h2 className="h2">{t(copy('home.platforms.title', { bn: 'ডেস্কে, স্টাফের হাতে, গেস্টের ফোনে', en: 'At the desk, in your staff’s hands, on your guest’s phone' }))}</h2>
          </div>
          {/* one composed scene: display in the centre, the two phones resting in front of it */}
          <div className="relative mx-auto mt-12 max-w-[1080px] pb-[3%]">
            <StudioDisplay media="platformWeb" className="relative mx-auto w-[78%] sm:w-[70%]" />
            <IPhone16PM media="platformMobile" className="absolute bottom-0 left-0 w-[24%] sm:w-[18%]" />
            <IPhone16PM media="platformGuest" className="absolute bottom-0 right-0 w-[24%] sm:w-[18%]" />
          </div>
          <div className="mx-auto mt-8 grid max-w-[1080px] grid-cols-3 text-center text-[14px] font-medium text-white/85 sm:text-[17px]">
            <h3>{t({ bn: 'HMS মোবাইল', en: 'HMS Mobile' })}</h3>
            <h3>{t({ bn: 'BinGi HMS ওয়েব', en: 'BinGi HMS Web' })}</h3>
            <h3>{t({ bn: 'গেস্ট অ্যাপ', en: 'Guest App' })}</h3>
          </div>
        </div>
      </section>
      )}

      <ThemeAiPreview />

      {/* property types */}
      {shown('home.types') && (
      <section className="container-x pt-16 md:pt-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
          <div className="min-w-0">
            <h2 className="h2">{t(copy('home.types.title', { bn: 'ছোট বাসা থেকে বড় রিসোর্ট', en: 'From a small home to a large resort' }))}</h2>
            <div className="mt-5 sm:mt-8"><PillTabs size="sm" wrap label={t({ bn: 'প্রপার্টির ধরন', en: 'Property type' })} value={type} onChange={setType} options={types.map((x) => ({ id: x.id, label: t(x.name) }))} /></div>
          </div>
          <div className="card glow-border p-5 sm:p-7 md:p-9" role="tabpanel">
            {/* the card stays put; only its content swaps, so it never goes blank */}
            <motion.div key={type} initial={{ opacity: 0.35, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}>
            <ul className="space-y-4">
              {active.points.map((p, i) => <li key={i} className="flex gap-3 text-[16px] sm:text-[18px]"><span className="check-dot mt-0.5"><CheckCheck className="size-3.5" aria-hidden="true" /></span>{t(p)}</li>)}
            </ul>
            <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
              <span className="text-[15px] text-muted-foreground">{t({ bn: 'প্রস্তাবিত প্ল্যান', en: 'Suggested plan' })} <strong className="text-ink font-semibold">{active.plan}</strong></span>
              <Link to="/pricing" className="inline-flex min-h-11 items-center text-link text-[15px] font-medium hover:underline underline-offset-4">{t({ bn: 'দাম দেখুন', en: 'See pricing' })}</Link>
            </div>
            </motion.div>
          </div>
        </div>
      </section>
      )}

      <Integrations />

      <PriceSlider />

      <Testimonials />

      {/* FAQ */}
      {shown('home.faq') && (
      <section className="container-x pt-16 md:pt-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="h2">{t(copy('home.faq.title', { bn: 'সাধারণ প্রশ্ন', en: 'Common questions' }))}</h2>
            <p className="lead mt-3 hidden md:block">{t({ bn: 'আরও জানতে চান? ', en: 'More questions? ' })}<Link to="/help" className="text-link hover:underline underline-offset-4">{t({ bn: 'হেল্প সেন্টার', en: 'Visit the help center' })}</Link></p>
          </div>
          <div><Accordion items={faqsFor('home').map((f) => ({ q: t(f.q), a: t(f.a) }))} />
            <Link to="/help" className="mt-4 inline-flex min-h-11 items-center text-[15px] font-medium text-link md:hidden">{t({ bn: 'আরও প্রশ্ন — হেল্প সেন্টার', en: 'More answers in the help center' })}</Link></div>
        </div>
      </section>
      )}

      {/* team — after FAQ, like zatiqeasy */}
      {shown('home.team') && (
      <section className="hidden md:block container-x pt-24" aria-labelledby="team-h">
        <div className="max-w-[620px]">
          <h2 id="team-h" className="h2">{t(copy('home.team.title', { bn: 'BinGi-র পেছনের টিম', en: 'The team behind BinGi' }))}</h2>
          <p className="lead mt-4">{t({ bn: 'ঢাকায় NEONECY-র তৈরি — 2023 থেকে হোটেলের জন্য সফটওয়্যার বানাচ্ছি।', en: 'Built in Dhaka by NEONECY — making software for hotels since 2023.' })}</p>
        </div>
        <ul className="relative isolate mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <li className="ambient left-1/2 -translate-x-1/2 top-1/3 h-[300px] w-[70%] opacity-45" aria-hidden="true" />
          {team.map((m) => (
            <li key={m.name} onPointerMove={spot} className="spotlight card glow-hover overflow-hidden">
              <div className="relative aspect-[5/4] overflow-hidden bg-[radial-gradient(120%_80%_at_50%_115%,#FFB38A40,transparent_60%),linear-gradient(160deg,#16405F,#0B2235)]">
                {m.photo
                  ? <img src={asset(m.photo)} alt={m.name} loading="lazy" className="size-full object-cover object-[50%_25%]" />
                  : <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-display)] text-[44px] sm:text-[56px] font-semibold tracking-[-0.03em] text-white/85">{m.name.replace(/^(Md\.|Most\.)\s*/, '').split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-medium text-ink backdrop-blur">{t(m.group)}</span>
              </div>
              <div className="p-4">
                <h3 className="flex items-center gap-1.5 text-[16px] font-semibold leading-snug">{m.name}
                  {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener" aria-label={`${m.name} — LinkedIn`} className="-my-2 grid size-9 place-items-center rounded-full text-[#0A66C2] hover:bg-canvas"><svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg></a>}
                </h3>
                <p className="mt-0.5 text-[14px] text-muted-foreground leading-snug">{t(m.role)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      )}

      {/* closing — the sunrise again */}
      <section className="container-x pt-16 md:pt-24">
        <div className="relative overflow-hidden rounded-[28px] bg-bay text-white px-6 py-12 md:px-14 md:py-24 grain">
          <div className="pointer-events-none absolute left-1/2 bottom-[-180px] h-[360px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#FFB38A,#FD413F88_45%,transparent_75%)] blur-[30px] opacity-70" aria-hidden="true" />
          <div className="pointer-events-none absolute left-0 right-0 bottom-[7%] h-px bg-[linear-gradient(90deg,transparent,#FD413F_30%,#FFB38A_50%,#FD413F_70%,transparent)] opacity-70" aria-hidden="true" />
          <div className="relative mx-auto max-w-[760px] text-center">
            <h2 className="display text-[34px] md:text-[72px] text-balance">{t({ bn: 'আজই আপনার প্রপার্টি সেটআপ করুন', en: 'Set up your property today' })}</h2>
            <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-3">
              <a href={site.hmsRegister} className="btn h-12 px-6 bg-white text-ink hover:-translate-y-px shadow-lift">{t({ bn: 'শুরু করুন', en: 'Get started' })}</a>
              <a href={site.whatsapp} className="btn h-12 px-6 border border-white/25 bg-white/[0.06] backdrop-blur-sm text-white hover:bg-white/12">{t({ bn: 'WhatsApp-এ কথা বলুন', en: 'Talk on WhatsApp' })}</a>
            </div>
          </div>
        </div>
      </section>
      {zoom.node}
    </>
  )
}
