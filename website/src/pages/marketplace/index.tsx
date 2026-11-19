import { faqsFor } from '@/data/faqs'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, BedDouble, CalendarCheck2, Camera, Clock3, MessagesSquare, Search, ShieldCheck, Store, ToggleRight } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { site } from '@/data/site'
import { plans } from '@/data/pricing'
import { modules, platformStatus } from '@/data/status'
import { Accordion } from '@/components/ui/Ui'
import { Reveal } from '@/components/ui/Reveal'
import { StatusChip } from '@/components/ui/StatusChip'
import { IPhone16PM } from '@/components/media/Devices'
import type { MediaId } from '@/data/media'
import type { L } from '@/i18n/lang'

// Facts only: how listing works (request → BinGi review → rooms with photos go live), commission from pricing.ts,
// and the real Guest App screens. Online payment and OTA stay "Coming Soon" via the status registry.

const statusOf = (id: string) => modules.find((m) => m.id === id)!.status

const journey: { media: MediaId; title: L; text: L }[] = [
  { media: 'guestHome', title: { bn: 'খোঁজে', en: 'Search' }, text: { bn: 'শহর, তারিখ আর গেস্ট সংখ্যা দিয়ে।', en: 'By city, dates and guests.' } },
  { media: 'guestSearch', title: { bn: 'বেছে নেয়', en: 'Choose' }, text: { bn: 'হোটেল বা এলাকা নাম লিখে।', en: 'Type a hotel or area name.' } },
  { media: 'guestHotel', title: { bn: 'দেখে', en: 'Look' }, text: { bn: 'ছবি, সুবিধা, চেক-ইন সময় আর খালি রুম।', en: 'Photos, amenities, check-in time and free rooms.' } },
  { media: 'guestRoom', title: { bn: 'বুক করে', en: 'Book' }, text: { bn: 'রুমের দাম, খাবার আর “Book Now”।', en: 'Room price, meals and “Book Now”.' } },
]

const forHotels: { icon: typeof Store; title: L; text: L }[] = [
  { icon: Store, title: { bn: 'নিজের হোটেল পেজ', en: 'Your own hotel page' }, text: { bn: 'ছবি, লোকেশন, চেক-ইন/আউট সময়, সুবিধা আর সব রুম এক পেজে।', en: 'Photos, location, check-in/out times, amenities and every room on one page.' } },
  { icon: MessagesSquare, title: { bn: 'বুকিংয়ের আগে চ্যাট', en: 'Chat before booking' }, text: { bn: 'গেস্ট প্রশ্ন করলে আপনার HMS-এর Chat-এ আসে — টিম সেখান থেকেই উত্তর দেয়।', en: 'Guest questions arrive in your HMS Chat — your team replies from there.' } },
  { icon: CalendarCheck2, title: { bn: 'বুকিং সরাসরি HMS-এ', en: 'Bookings straight into HMS' }, text: { bn: 'প্রতিটা বুকিং নিজের বুকিং আইডিসহ একই তালিকা আর ক্যালেন্ডারে।', en: 'Every booking lands in the same list and calendar, with its own booking ID.' } },
  { icon: ToggleRight, title: { bn: 'কোন রুম দেখাবে, আপনি ঠিক করেন', en: 'You choose what shows' }, text: { bn: 'কোন রুম মার্কেটপ্লেসে থাকবে, HMS থেকে চালু বা বন্ধ করুন।', en: 'Turn rooms on or off for the marketplace from your HMS.' } },
]

const steps: { title: L; text: L }[] = [
  { title: { bn: 'অ্যাকাউন্ট খুলুন', en: 'Create your account' }, text: { bn: 'প্রপার্টি সেটআপ করুন — রুম, দাম আর ছবি।', en: 'Set up your property — rooms, prices and photos.' } },
  { title: { bn: 'মার্কেটপ্লেসে যোগ দিতে অনুরোধ', en: 'Request marketplace access' }, text: { bn: 'HMS-এ বুকিং চ্যানেল থেকে “BinGi Marketplace” চালু করার অনুরোধ পাঠান।', en: 'In HMS, request “BinGi Marketplace” from your booking channels.' } },
  { title: { bn: 'BinGi যাচাই করে', en: 'BinGi reviews it' }, text: { bn: 'প্রপার্টি ও রুম দেখে অনুমোদন দেওয়া হয়।', en: 'We check the property and rooms, then approve.' } },
  { title: { bn: 'bingi.app-এ লাইভ', en: 'Live on bingi.app' }, text: { bn: 'অনুমোদিত, আসল ছবিসহ রুমগুলো গেস্টরা দেখতে পায়।', en: 'Approved rooms with real photos become visible to guests.' } },
]

const tips: { icon: typeof Camera; text: L }[] = [
  { icon: Camera, text: { bn: 'আসল ছবি দিন — রুম, বাথরুম আর বাইরের দৃশ্য। প্রথম ছবিটাই সবচেয়ে গুরুত্বপূর্ণ।', en: 'Use real photos — room, bathroom and the view. The first photo matters most.' } },
  { icon: BedDouble, text: { bn: 'রুমের তথ্য ঠিক রাখুন: বেড, সাইজ, কতজন থাকতে পারবে।', en: 'Keep room facts right: beds, size, how many guests.' } },
  { icon: BadgeCheck, text: { bn: 'দাম পরিষ্কার রাখুন — কী কী যোগ হবে, আগে থেকেই লিখুন।', en: 'Keep prices clear — say up front what is added.' } },
  { icon: Clock3, text: { bn: 'চ্যাটে দ্রুত উত্তর দিন। দেরি হলে গেস্ট অন্য জায়গায় চলে যায়।', en: 'Reply to chats quickly. Slow replies send guests elsewhere.' } },
]

export default function Marketplace() {
  const { t } = useLang()
  const paid = plans.filter((p) => p.fees && p.rate)
  return (
    <div className="relative overflow-x-clip">
      {/* Hero */}
      <section className="relative isolate pt-10 md:pt-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[680px] bg-[radial-gradient(45%_45%_at_70%_35%,rgb(253_65_63/0.13),transparent_70%)]" />
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="chip">{t({ bn: 'BinGi মার্কেটপ্লেস', en: 'BinGi Marketplace' })}</span>
              <StatusChip status="live" />
            </div>
            <h1 className="display mt-5 text-[42px] md:text-[64px] text-balance">
              {t({ bn: 'গেস্টরা আপনাকে খুঁজে পায়।', en: 'Guests find you.' })}{' '}
              <mark>{t({ bn: 'বুকিং আসে আপনার HMS-এ।', en: 'Bookings land in your HMS.' })}</mark>
            </h1>
            <p className="lead mt-5 max-w-[540px]">
              {t({ bn: 'bingi.app আর BinGi Guest App-এ গেস্টরা হোটেল খোঁজে, প্রশ্ন করে আর বুক করে। সবকিছু আসে আপনার একই ক্যালেন্ডারে।', en: 'On bingi.app and the BinGi Guest App, guests search, ask questions and book. Everything lands in the same calendar you already use.' })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={site.hmsRegister} className="btn-primary h-12 px-6">{t({ bn: 'প্রপার্টি লিস্ট করুন', en: 'List your property' })}</a>
              <a href={site.marketplace} target="_blank" rel="noreferrer" className="btn-ghost h-12 px-6">{t({ bn: 'bingi.app দেখুন', en: 'Visit bingi.app' })}</a>
            </div>
          </div>
          <div className="relative mx-auto w-[min(300px,72vw)]">
            <IPhone16PM media="platformGuest" />
            <p className="mt-4 text-center text-[13px] text-muted-foreground">{t({ bn: 'আসল BinGi Guest App স্ক্রিন', en: 'Real BinGi Guest App screens' })}</p>
          </div>
        </div>
      </section>

      <div className="container-x">
        {/* Guest journey */}
        <section className="mt-24 md:mt-32">
          <div className="max-w-[640px]">
            <p className="eyebrow">{t({ bn: 'গেস্টের দিক থেকে', en: 'For guests' })}</p>
            <h2 className="h2 mt-3">{t({ bn: 'চার ট্যাপে বুকিং', en: 'Booked in four taps' })}</h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {journey.map((j, i) => (
              <Reveal key={j.media} delay={i * 70}>
                <div className="mx-auto w-full max-w-[220px]">
                  <IPhone16PM media={j.media} />
                  <p className="mt-5 text-[13px] font-semibold tabular-nums text-brand">0{i + 1}</p>
                  <h3 className="mt-1 text-[18px] font-semibold">{t(j.title)}</h3>
                  <p className="mt-1 text-[14px] text-muted-foreground">{t(j.text)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* For hotels */}
        <section className="mt-24 md:mt-32">
          <div className="max-w-[640px]">
            <p className="eyebrow">{t({ bn: 'হোটেলের জন্য', en: 'For hotels' })}</p>
            <h2 className="h2 mt-3">{t({ bn: 'নতুন গেস্ট, একই কাজের ধারা', en: 'New guests, same way of working' })}</h2>
          </div>
          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {forHotels.map((f, i) => (
              <Reveal key={i} delay={(i % 2) * 70}>
                <div className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-brand-soft text-brand"><f.icon className="size-5" aria-hidden="true" /></span>
                  <div>
                    <h3 className="text-[18px] font-semibold">{t(f.title)}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{t(f.text)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Get listed */}
        <section className="mt-24 md:mt-32">
          <div className="max-w-[640px]">
            <p className="eyebrow">{t({ bn: 'কীভাবে লিস্ট হবেন', en: 'How to get listed' })}</p>
            <h2 className="h2 mt-3">{t({ bn: '4 ধাপে মার্কেটপ্লেসে', en: 'On the marketplace in 4 steps' })}</h2>
          </div>
          <ol className="relative mt-10 grid gap-6 md:grid-cols-4">
            <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-[22px] hidden h-px bg-line md:block" />
            {steps.map((s, i) => (
              <li key={i} className="relative">
                <span className={`relative grid size-11 place-items-center rounded-full text-[15px] font-semibold ${i === 3 ? 'btn-primary p-0' : 'bg-white text-ink ring-1 ring-line shadow-soft'}`}>{i + 1}</span>
                <h3 className="mt-4 text-[17px] font-semibold">{t(s.title)}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{t(s.text)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Fees */}
        <section className="mt-24 md:mt-32 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow">{t({ bn: 'খরচ', en: 'Cost' })}</p>
            <h2 className="h2 mt-3">{t({ bn: 'শুধু বুকিং এলে কমিশন', en: 'Commission only when a booking comes' })}</h2>
            <p className="lead mt-4">{t({ bn: 'মার্কেটপ্লেস থেকে আসা বুকিংয়ে প্ল্যান অনুযায়ী কমিশন। রিসেপশনে নেওয়া ওয়াক-ইনে কোনো ফি নেই।', en: 'Marketplace bookings carry a commission by plan. Walk-ins taken at reception have no fee.' })}</p>
            <Link to="/pricing" className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-link hover:underline underline-offset-4">{t({ bn: 'সব দাম দেখুন', en: 'See all pricing' })}<ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-[15px]">
              <thead>
                <tr className="border-b border-line text-left text-[13px] text-muted-foreground">
                  <th scope="col" className="p-4 font-medium">{t({ bn: 'প্ল্যান', en: 'Plan' })}</th>
                  <th scope="col" className="p-4 font-medium">{t({ bn: 'মার্কেটপ্লেস', en: 'Marketplace' })}</th>
                  <th scope="col" className="p-4 font-medium">{t({ bn: 'নিজের ওয়েবসাইট', en: 'Own website' })}</th>
                  <th scope="col" className="p-4 font-medium">{t({ bn: 'ওয়াক-ইন', en: 'Walk-in' })}</th>
                </tr>
              </thead>
              <tbody>
                {paid.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <th scope="row" className={`p-4 text-left font-semibold ${p.popular ? 'text-brand' : ''}`}>{p.name}</th>
                    <td className="p-4 font-semibold tabular-nums">{p.fees!.marketplace}%</td>
                    <td className="p-4 tabular-nums">{p.fees!.website}%</td>
                    <td className="p-4 tabular-nums">{p.fees!.walkin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tips */}
        <section className="mt-24 md:mt-32">
          <div className="max-w-[640px]">
            <p className="eyebrow">{t({ bn: 'ভালো লিস্টিং', en: 'A good listing' })}</p>
            <h2 className="h2 mt-3">{t({ bn: 'যে লিস্টিং-এ গেস্ট ভরসা পায়', en: 'Listings guests trust' })}</h2>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {tips.map((x, i) => (
              <li key={i} className="card flex gap-4 p-5">
                <x.icon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                <p className="text-[15px] leading-relaxed">{t(x.text)}</p>
              </li>
            ))}
          </ul>
          <Link to="/blog/write-a-listing-guests-trust" className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-link hover:underline underline-offset-4">{t({ bn: 'পুরো গাইড পড়ুন', en: 'Read the full guide' })}<ArrowRight className="size-4" aria-hidden="true" /></Link>
        </section>

        {/* Honest status */}
        <section className="mt-24 md:mt-32 rounded-[28px] border border-line bg-white p-6 md:p-10">
          <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-brand" aria-hidden="true" /><h2 className="text-[20px] font-semibold tracking-tight">{t({ bn: 'এখন কী আছে, কী আসছে', en: 'What is ready, what is coming' })}</h2></div>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {([
              ['live', { bn: 'bingi.app ওয়েব মার্কেটপ্লেস', en: 'bingi.app web marketplace' }],
              [platformStatus.guest, { bn: 'BinGi Guest App (iOS / Android)', en: 'BinGi Guest App (iOS / Android)' }],
              [statusOf('payments'), { bn: 'BinGi দিয়ে অনলাইন পেমেন্ট', en: 'Online payment through BinGi' }],
              [statusOf('ota'), { bn: 'Booking.com, Agoda-র মতো OTA সংযোগ', en: 'OTA connections like Booking.com and Agoda' }],
            ] as const).map(([st, l], i) => (
              <li key={i} className="flex items-center justify-between gap-4 rounded-[16px] bg-canvas px-4 py-3">
                <span className="text-[15px]">{t(l)}</span>
                <StatusChip status={st} />
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-24 max-w-[760px] md:mt-32">
          <h2 className="h2 text-center">{t({ bn: 'প্রশ্ন', en: 'Questions' })}</h2>
          <div className="mt-8">
            <Accordion items={faqsFor('marketplace').map((f) => ({ q: t(f.q), a: t(f.a) }))} />
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 md:mt-32 rounded-[28px] bg-bay px-6 py-14 text-center text-white md:py-20">
          <Search className="mx-auto size-7 text-[#FF8A85]" aria-hidden="true" />
          <h2 className="mx-auto mt-4 max-w-[620px] text-balance text-[30px] font-semibold tracking-[-0.03em] md:text-[42px]" style={{ fontFamily: 'var(--font-display)' }}>{t({ bn: 'যেখানে গেস্ট খোঁজে, সেখানে থাকুন', en: 'Be where guests are looking' })}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={site.hmsRegister} className="btn-primary h-12 px-6">{t({ bn: 'প্রপার্টি লিস্ট করুন', en: 'List your property' })}</a>
            <Link to="/contact" className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-medium text-white ring-1 ring-white/30 hover:bg-white/10">{t({ bn: 'কথা বলুন', en: 'Talk to us' })}</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
