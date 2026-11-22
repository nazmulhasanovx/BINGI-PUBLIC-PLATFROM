import { NavLink, useParams } from 'react-router-dom'
import { useLang, type L } from '../../i18n/lang'
import { site } from '@/data/site'

// Plain-language policies that describe only what this website and BinGi actually do today
// (checked against the code: Consent.tsx, track.ts, api/app/Support/Visitor.php, lead form).
// NEONECY's lawyer must approve before launch; change the text here and the date below.
const UPDATED: L = { bn: '22 নভেম্বর 2026', en: '22 November 2026' }
type Sec = { h: L; p?: L; list?: L[] }
const docs: Record<string, { title: L; intro: L; secs: Sec[] }> = {
  privacy: {
    title: { bn: 'প্রাইভেসি পলিসি', en: 'Privacy Policy' },
    intro: { bn: 'এই পলিসি BinGi-র এই ওয়েবসাইট নিয়ে। BinGi HMS-এর ভেতরে আপনার হোটেলের ডেটা আপনার সার্ভিস চুক্তি অনুযায়ী চলে।', en: 'This policy covers this BinGi website. Your hotel’s data inside BinGi HMS is covered by your service agreement.' },
    secs: [
      { h: { bn: 'আমরা যা সংগ্রহ করি', en: 'What we collect' }, list: [
        { bn: 'ডেমো বা যোগাযোগ ফর্মে আপনি যা লেখেন: নাম, প্রপার্টির নাম, ফোন, ইমেইল (দিলে) আর মেসেজ — সাথে কোন পেজ থেকে পাঠালেন।', en: 'What you type in the demo or contact form: name, property name, phone, email (if given) and message — plus the page you sent it from.' },
        { bn: 'ভিজিটের হিসাব: কোন পেজ দেখা হলো, কোন সাইট থেকে এলেন, ডিভাইসের ধরন আর দেশ। আপনার IP ঠিকানা বা ব্রাউজারের তথ্য জমা হয় না — শুধু একটা কোড, যা প্রতিদিন বদলায়।', en: 'Visit counts: pages viewed, the site you came from, device type and country. Your IP address and browser details are not stored — only a code that changes every day.' },
      ] },
      { h: { bn: 'কুকি', en: 'Cookies' }, p: { bn: 'আমাদের নিজের ভিজিট গণনায় কোনো কুকি লাগে না। Google বা Meta-র কুকি শুধু তখনই চালু হয় যখন আপনি ব্যানারে "রাজি" চাপেন। আপনার পছন্দ আর ভাষা ব্রাউজারেই থাকে।', en: 'Our own visit counting uses no cookies. Google or Meta cookies load only after you press “OK” on the banner. Your choice and your language stay in your browser.' } },
      { h: { bn: 'যেভাবে ব্যবহার করি', en: 'How we use it' }, p: { bn: 'আপনার অনুরোধের উত্তর দিতে, ডেমো সাজাতে আর সাইট ভালো করতে। আমরা আপনার তথ্য বিক্রি করি না।', en: 'To answer your request, arrange a demo and improve the site. We do not sell your information.' } },
      { h: { bn: 'কতদিন রাখি', en: 'How long we keep it' }, p: { bn: 'ভিজিটের বিস্তারিত 90 দিন পর মুছে যায়; শুধু দিনের মোট সংখ্যা থাকে। ফর্মের তথ্য থাকে যতদিন আপনার সাথে কথা চলছে, বা আপনি মুছতে বলা পর্যন্ত।', en: 'Visit details are deleted after 90 days; only daily totals remain. Form details are kept while we are in touch with you, or until you ask us to delete them.' } },
      { h: { bn: 'আপনার অধিকার', en: 'Your choices' }, p: { bn: 'আপনার তথ্য দেখতে, ঠিক করতে বা মুছতে চাইলে নিচের ফোন বা WhatsApp-এ জানান।', en: 'To see, correct or delete your information, contact us on the phone or WhatsApp below.' } },
    ],
  },
  terms: {
    title: { bn: 'শর্তাবলি', en: 'Terms of Service' },
    intro: { bn: 'এই ওয়েবসাইট ব্যবহার করলে নিচের শর্তগুলো প্রযোজ্য। BinGi HMS ব্যবহারের পূর্ণ শর্ত আপনার সার্ভিস চুক্তিতে থাকে।', en: 'These terms apply when you use this website. The full terms for using BinGi HMS are in your service agreement.' },
    secs: [
      { h: { bn: 'দাম', en: 'Prices' }, p: { bn: 'প্রাইসিং পেজের দাম প্রতি রুম প্রতি মাসের। অ্যাক্টিভেশন আর বুকিং ফি আলাদা দেখানো থাকে।', en: 'Prices on the pricing page are per room per month. Activation and booking fees are shown separately.' } },
      { h: { bn: 'ফ্রি ট্রায়াল', en: 'Free trial' }, p: { bn: 'নতুন প্রপার্টি 7 দিন বিনা খরচে চালিয়ে দেখতে পারে। ট্রায়ালে কোনো বিল হয় না।', en: 'A new property can try BinGi free for 7 days. Nothing is billed during the trial.' } },
      { h: { bn: 'স্ট্যাটাস লেবেল', en: 'Status labels' }, p: { bn: 'সাইটে "Live", "Beta" বা "Coming soon" দেখে বুঝবেন কোন ফিচার এখন চালু। "Coming soon" ফিচারের তারিখের প্রতিশ্রুতি আমরা দিই না।', en: '“Live”, “Beta” and “Coming soon” on the site show what works today. We do not promise dates for “Coming soon” features.' } },
      { h: { bn: 'কনটেন্ট', en: 'Content' }, p: { bn: 'BinGi নাম, লোগো আর সাইটের লেখা NEONECY-র। অনুমতি ছাড়া কপি করবেন না।', en: 'The BinGi name, logo and site text belong to NEONECY. Please don’t copy them without permission.' } },
    ],
  },
  refund: {
    title: { bn: 'রিফান্ড পলিসি', en: 'Refund Policy' },
    intro: { bn: 'বিল ও রিফান্ড আপনার সার্ভিস চুক্তি অনুযায়ী হয়। মূল বিষয়গুলো:', en: 'Bills and refunds follow your service agreement. The main points:' },
    secs: [
      { h: { bn: 'ট্রায়াল', en: 'Trial' }, p: { bn: '7 দিনের ট্রায়ালে কোনো টাকা লাগে না, তাই ফেরতেরও কিছু নেই।', en: 'The 7-day trial costs nothing, so there is nothing to refund.' } },
      { h: { bn: 'ভুল বিল', en: 'Wrong bill' }, p: { bn: 'বিলে ভুল মনে হলে আমাদের জানান। আমরা দেখে ঠিক করব, আর বেশি নেওয়া হলে ফেরত দেব।', en: 'If a bill looks wrong, tell us. We will check it, correct it and refund any overcharge.' } },
      { h: { bn: 'অন্য অনুরোধ', en: 'Other requests' }, p: { bn: 'প্ল্যান বদল বা আগাম পেমেন্টের ফেরত নিয়ে প্রশ্ন থাকলে নিচের নম্বরে কথা বলুন।', en: 'For plan changes or refunds of advance payments, talk to us on the number below.' } },
    ],
  },
}

export default function Legal() {
  const { doc = 'privacy' } = useParams()
  const { t } = useLang()
  const d = docs[doc] ?? docs.privacy
  return (
    <div className="container-x pt-8 md:pt-14 grid gap-8 md:grid-cols-[220px_1fr]">
      <nav aria-label="Legal" className="flex flex-wrap md:flex-col gap-2">
        {Object.entries(docs).map(([k, v]) => (
          <NavLink key={k} to={`/legal/${k}`} className={({ isActive }) => `h-11 shrink-0 inline-flex items-center rounded-full px-4 text-[15px] transition-colors duration-200 ${isActive ? 'bg-ink text-white font-medium' : 'text-muted-foreground hover:text-ink'}`}>{t(v.title)}</NavLink>
        ))}
      </nav>
      <article className="card p-6 md:p-10">
        <h1 className="display text-[36px] md:text-[48px]">{t(d.title)}</h1>
        <p className="mt-2 text-[14px] text-soft">{t({ bn: 'সর্বশেষ আপডেট', en: 'Last updated' })}: {t(UPDATED)}</p>
        <p className="mt-5 text-[16px] leading-relaxed">{t(d.intro)}</p>
        <div className="mt-6 space-y-6">
          {d.secs.map((s) => (
            <section key={s.h.en}>
              <h2 className="text-[19px] font-semibold tracking-tight">{t(s.h)}</h2>
              {s.p && <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">{t(s.p)}</p>}
              {s.list && <ul className="mt-2 list-disc space-y-2 pl-5 text-[16px] leading-relaxed text-muted-foreground">{s.list.map((x) => <li key={x.en}>{t(x)}</li>)}</ul>}
            </section>
          ))}
          <section>
            <h2 className="text-[19px] font-semibold tracking-tight">{t({ bn: 'যোগাযোগ', en: 'Contact' })}</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">NEONECY · {t(site.address)} · <a className="text-link" href={`tel:${site.phoneIntl}`}>{site.phone}</a> · <a className="text-link" href={site.whatsapp}>WhatsApp</a></p>
          </section>
        </div>
      </article>
    </div>
  )
}
