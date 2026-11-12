import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BellRing, BookOpenCheck, CalendarCheck2, Check, ClipboardCheck, Cpu, FileImage, KeyRound, Laptop, Languages, Lock, MessageSquareText, ScrollText, ShieldCheck, Sparkles, Star, UserCheck } from 'lucide-react'
import { useLang, type L } from '@/i18n/lang'
import { PillTabs, SectionHead, Accordion } from '@/components/ui/Ui'
import { Reveal } from '@/components/ui/Reveal'
import { StudioDisplay } from '@/components/media/Devices'
import { site } from '@/data/site'
import { asset } from '@/lib/utils'
import aiLogo from '@/assets/bingi-ai-logo.svg'

// BinGi AI (Beta) page. Facts from the BinGi AI repo (develop, v5.8.1, 11 Nov 2026) and Nazmul (12 Nov 2026):
// beta, runs locally from the git repo, connects to BinGi with the hotel's API access.
// Truth: until a hotel is connected, BinGi AI shows the sample hotel (Azure Bay). Screens below are real UI captures with sample data.

type Screen = 'aiHome' | 'aiAnswer' | 'aiBrief'

const abilities: { icon: typeof Sparkles; title: L; text: L }[] = [
  { icon: Languages, title: { bn: 'বাংলা, Banglish বা English-এ প্রশ্ন', en: 'Ask in Bangla, Banglish or English' }, text: { bn: '“আজ কয়টা check-out?”, “Sadia Islam er due koto?” — যেভাবে কথা বলেন, সেভাবেই।', en: '“How many check-outs today?”, “Sadia Islam er due koto?” — the way your team already talks.' } },
  { icon: CalendarCheck2, title: { bn: 'Daily Brief', en: 'Daily Brief' }, text: { bn: 'আজ কে আসছেন, কে যাচ্ছেন, কোন রুম dirty, কম stock, উপস্থিতি, আজকের হিসাব — এক পাতায়। সংখ্যা সরাসরি BinGi data থেকে।', en: 'Arrivals, departures, dirty rooms, low stock, attendance and today’s money on one page. Numbers come straight from BinGi data.' } },
  { icon: MessageSquareText, title: { bn: 'Guest chat-এর reply draft', en: 'Guest reply drafts' }, text: { bn: 'Guest-এর প্রশ্নে hotel-এর নিজের নিয়ম দেখে reply লিখে দেয়। Staff দেখে পাঠান।', en: 'Drafts a reply from your own hotel rules. Staff check it and send.' } },
  { icon: ClipboardCheck, title: { bn: 'কাজের draft — আপনি approve করেন', en: 'Work drafts you approve' }, text: { bn: 'Housekeeping task, maintenance ticket, room service order, expense — AI draft বানায়, Approve না চাপলে কিছুই বদলায় না।', en: 'Housekeeping tasks, maintenance tickets, room service orders, expenses — AI drafts, nothing changes until you press Approve.' } },
  { icon: FileImage, title: { bn: 'Memo বা রসিদের ছবি থেকে', en: 'From a memo or receipt photo' }, text: { bn: 'বাজারের memo-র ছবি দিলে stock-in-এর draft তৈরি হয়।', en: 'Attach a photo of a purchase memo and get a stock-in draft.' } },
  { icon: BookOpenCheck, title: { bn: 'BinGi চালানোর সাহায্য', en: 'Help with BinGi itself' }, text: { bn: '“SMS যাচ্ছে না কেন?” — BinGi docs থেকে ধাপে ধাপে সমাধান।', en: '“Why is SMS not sending?” — step-by-step fixes from the BinGi docs.' } },
  { icon: Star, title: { bn: 'Review ও hotel knowledge', en: 'Reviews and hotel knowledge' }, text: { bn: 'নতুন review দেখায়, reply-র draft দেয়। Check-in time, policy — hotel-এর নিজের তথ্য থেকে উত্তর।', en: 'Shows new reviews and drafts replies. Answers check-in time and policy questions from your own hotel notes.' } },
  { icon: BellRing, title: { bn: 'Alert', en: 'Alerts' }, text: { bn: 'কম stock, বাকি পেমেন্টের মতো বিষয় সময়মতো জানায়।', en: 'Flags things like low stock and unpaid balances.' } },
]

const safety: { icon: typeof Lock; title: L; text: L }[] = [
  { icon: UserCheck, title: { bn: 'আপনার চেয়ে বেশি ক্ষমতা নেই', en: 'Never more access than you' }, text: { bn: 'প্রতিটা কাজে role, property, permission আর plan চেক হয়।', en: 'Role, property, permission and plan are checked for every action.' } },
  { icon: ClipboardCheck, title: { bn: 'Approve ছাড়া কিছু হয় না', en: 'Nothing happens without approval' }, text: { bn: 'AI শুধু draft বানায়। টাকা নড়ায় না, কিছু delete করে না।', en: 'AI only drafts. It does not move money or delete anything.' } },
  { icon: ShieldCheck, title: { bn: 'Guest-এর লেখা = শুধু তথ্য', en: 'Guest text is data, not orders' }, text: { bn: 'Guest message-এর ভেতরের নির্দেশ AI মানে না।', en: 'Instructions hidden in guest messages are ignored.' } },
  { icon: ScrollText, title: { bn: 'সব কাজের log', en: 'Everything is logged' }, text: { bn: 'কে কী জিজ্ঞেস করল, কী approve হলো — audit log-এ থাকে। Owner চাইলে বন্ধ করতে পারেন।', en: 'Questions and approvals are kept in an audit log. The owner can switch AI off.' } },
]

const steps: { title: L; text: L; code?: string }[] = [
  { title: { bn: 'Beta access নিন', en: 'Get beta access' }, text: { bn: 'BinGi টিমকে WhatsApp করুন। আপনার GitHub account-কে BinGi AI repo-তে যোগ করা হবে, সাথে আপনার hotel-এর BinGi API access।', en: 'Message the BinGi team on WhatsApp. We add your GitHub account to the BinGi AI repo and give your hotel its BinGi API access.' } },
  { title: { bn: 'দরকারি জিনিস বসান', en: 'Install the basics' }, text: { bn: 'Node.js (LTS), Git আর Ollama (local model চালাতে)। তারপর model নামান:', en: 'Node.js (LTS), Git and Ollama (to run the local model). Then download the model:' }, code: 'ollama pull qwen3:4b' },
  { title: { bn: 'Repo নামান', en: 'Get the code' }, text: { bn: 'Terminal বা PowerShell-এ:', en: 'In Terminal or PowerShell:' }, code: 'git clone -b develop https://github.com/nazmulhasanovx/BINGI-AI-.git bingi-ai' },
  { title: { bn: 'চালু করুন', en: 'Start it' }, text: { bn: 'Mac-এ “Start BinGi AI.command”, Windows-এ “Start BinGi AI (Windows).bat” double-click। Browser-এ নিজে খুলবে:', en: 'Double-click “Start BinGi AI.command” on Mac or “Start BinGi AI (Windows).bat” on Windows. It opens in your browser:' }, code: 'http://localhost:8787' },
  { title: { bn: 'BinGi API connect করুন', en: 'Connect BinGi API' }, text: { bn: 'User menu › Connectivity › BinGi HMS API — address আর access token দিন, Test চাপুন। চাইলে cloud model-এর জন্য OpenRouter key-ও এখানে।', en: 'User menu › Connectivity › BinGi HMS API — enter the address and access token, press Test. An OpenRouter key for a cloud model also goes here (optional).' } },
]

export default function Ai() {
  const { t } = useLang()
  const [screen, setScreen] = useState<Screen>('aiHome')
  const wa = `${site.whatsapp}?text=${encodeURIComponent('BinGi AI beta access chai')}`
  return (
    <div className="relative">
      {/* Hero */}
      <section className="container-x relative isolate pt-10 text-center md:pt-16">
        <div aria-hidden="true" className="glow-radial pointer-events-none absolute left-1/2 -top-24 -z-10 h-[520px] w-[min(1100px,150%)] -translate-x-1/2" />
        <img src={aiLogo} alt="BinGi AI" width={300} height={110} className="mx-auto h-12 w-auto md:h-14" />
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#EAF0FF] px-3 py-1 text-[13px] font-medium text-link">
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{t({ bn: 'বেটা · আপনার নিজের কম্পিউটারে চলে', en: 'Beta · runs on your own computer' })}
        </p>
        <h1 className="display mx-auto mt-5 max-w-[860px] text-balance text-[40px] text-ink md:text-[64px]">
          {t({ bn: 'হোটেলকে প্রশ্ন করুন। ', en: 'Ask your hotel. ' })}<span className="mark px-1.5">{t({ bn: 'উত্তর পান।', en: 'Get the answer.' })}</span>
        </h1>
        <p className="lead mx-auto mt-5 max-w-[640px] text-pretty">
          {t({ bn: 'BinGi AI আপনার BinGi data পড়ে উত্তর দেয়, সকালের brief বানায় আর রোজকার কাজের draft করে দেয় — যা আপনি দেখে approve করেন।', en: 'BinGi AI reads your BinGi data to answer questions, writes the morning brief and drafts routine work for you to approve.' })}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={wa} target="_blank" rel="noreferrer" className="btn-primary h-12 px-6 text-[15px]">{t({ bn: 'Beta access চান', en: 'Request beta access' })}</a>
          <a href="#install" className="btn-ghost h-12 px-6 text-[15px]">{t({ bn: 'কীভাবে চালাবেন', en: 'How to set it up' })}</a>
        </div>

        <div className="mt-12 flex justify-center">
          <PillTabs label={t({ bn: 'স্ক্রিন', en: 'Screen' })} value={screen} onChange={setScreen}
            options={[{ id: 'aiHome', label: 'Ask BinGi' }, { id: 'aiAnswer', label: t({ bn: 'উত্তর', en: 'Answer' }) }, { id: 'aiBrief', label: 'Daily Brief' }]} />
        </div>
        <div className="relative mx-auto mt-8 max-w-[1040px]">
          <img src={asset('/media/ai/fennec.webp')} alt="" aria-hidden="true" width={160} height={160}
            className="pointer-events-none absolute -right-2 -top-10 z-10 hidden w-24 drop-shadow-[0_12px_24px_rgb(177_28_41/0.25)] md:block xl:-right-10 lg:w-28 xl:w-32" />
          <StudioDisplay key={screen} media={screen} className="relative w-full" />
        </div>
        <p className="mt-4 text-[13px] text-muted-foreground">{t({ bn: 'আসল BinGi AI স্ক্রিন, নমুনা হোটেলের data দিয়ে।', en: 'Real BinGi AI screens, shown with a sample hotel.' })}</p>
      </section>

      <div className="container-x">
        {/* What it does */}
        <section className="mt-20 md:mt-28">
          <SectionHead title={t({ bn: 'BinGi AI কী করে', en: 'What BinGi AI does' })} lead={t({ bn: 'প্রশ্নের উত্তর, সারাংশ আর কাজের draft — সব আপনার hotel-এর data থেকে।', en: 'Answers, summaries and work drafts — all from your own hotel data.' })} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {abilities.map((a, i) => (
              <Reveal key={i} delay={(i % 4) * 50}>
                <div className="card glow-hover h-full p-5">
                  <span className="grid size-10 place-items-center rounded-[10px] bg-brand-soft text-brand"><a.icon className="size-5" aria-hidden="true" /></span>
                  <h3 className="mt-4 text-[16px] font-semibold leading-snug">{t(a.title)}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{t(a.text)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How an answer works */}
        <section className="mt-20 md:mt-28">
          <SectionHead title={t({ bn: 'একটা প্রশ্ন থেকে কাজ পর্যন্ত', en: 'From a question to done' })} />
          <ol className="mx-auto mt-10 grid max-w-[1000px] gap-3 md:grid-cols-4">
            {([
              [{ bn: 'আপনি জিজ্ঞেস করেন', en: 'You ask' }, { bn: '“104-এ deep cleaning task বানাও”', en: '“Create a deep cleaning task for 104”' }],
              [{ bn: 'BinGi AI দেখে', en: 'BinGi AI checks' }, { bn: 'আপনার role, property, plan আর রুমের অবস্থা', en: 'Your role, property, plan and the room' }],
              [{ bn: 'Draft দেখায়', en: 'Shows a draft' }, { bn: 'কী হবে, তার কার্ড — Approve / Edit / Reject', en: 'A card of what will happen — Approve / Edit / Reject' }],
              [{ bn: 'আপনি Approve করেন', en: 'You approve' }, { bn: 'তখনই BinGi-তে কাজটা তৈরি হয়, log-এ থাকে', en: 'Only then is it created in BinGi, and logged' }],
            ] as [L, L][]).map(([h, d], i) => (
              <li key={i} className="card relative p-5">
                <span className="text-[13px] font-semibold text-brand">0{i + 1}</span>
                <p className="mt-1 text-[16px] font-semibold">{t(h)}</p>
                <p className="mt-1.5 text-[14px] text-muted-foreground">{t(d)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Safety */}
        <section className="mt-20 md:mt-28">
          <SectionHead title={t({ bn: 'নিরাপদ, শুরু থেকেই', en: 'Safe by design' })} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {safety.map((s, i) => (
              <div key={i} className="rounded-[18px] bg-white p-5 ring-1 ring-line">
                <s.icon className="size-5 text-brand" aria-hidden="true" />
                <h3 className="mt-3 text-[16px] font-semibold">{t(s.title)}</h3>
                <p className="mt-1.5 text-[14px] text-muted-foreground">{t(s.text)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Where it runs */}
        <section className="mt-20 md:mt-28">
          <SectionHead title={t({ bn: 'যেখানে চলে', en: 'Where it runs' })} lead={t({ bn: 'একই BinGi AI — model বাছাই আপনার।', en: 'The same BinGi AI — you choose the model.' })} />
          <div className="mx-auto mt-10 grid max-w-[1000px] gap-4 md:grid-cols-2">
            <div className="card-highlight rounded-[22px] p-6">
              <Laptop className="size-6 text-brand" aria-hidden="true" />
              <h3 className="mt-3 text-[19px] font-semibold">{t({ bn: 'Local — আপনার কম্পিউটারে', en: 'Local — on your computer' })}</h3>
              <ul className="mt-3 space-y-2 text-[14px]">
                {([
                  { bn: 'Model চলে Ollama-তে (qwen3:4b)', en: 'Model runs in Ollama (qwen3:4b)' },
                  { bn: 'প্রশ্ন আর উত্তর আপনার কম্পিউটারেই থাকে', en: 'Questions and answers stay on your computer' },
                  { bn: 'Mac M1, 8 GB-তে পরীক্ষিত', en: 'Tested on a Mac M1 with 8 GB' },
                  { bn: 'Windows: start script আছে (16 GB RAM প্রস্তাবিত)', en: 'Windows: start script included (16 GB RAM suggested)' },
                ] as L[]).map((x, i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />{t(x)}</li>)}
              </ul>
            </div>
            <div className="card p-6">
              <Cpu className="size-6 text-brand" aria-hidden="true" />
              <h3 className="mt-3 text-[19px] font-semibold">{t({ bn: 'Cloud model — ঐচ্ছিক', en: 'Cloud model — optional' })}</h3>
              <ul className="mt-3 space-y-2 text-[14px]">
                {([
                  { bn: 'নিজের OpenRouter key দিলে cloud model', en: 'Add your own OpenRouter key for a cloud model' },
                  { bn: 'Default: শুধু free model; paid model বন্ধ', en: 'Default: free models only; paid models off' },
                  { bn: 'Guest message free model-এ যায় না', en: 'Guest messages are not sent to free models' },
                  { bn: 'Local আর cloud — দুটো একসাথে fallback হিসেবে', en: 'Local with cloud as a fallback' },
                ] as L[]).map((x, i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />{t(x)}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* Install */}
        <section id="install" className="mt-20 scroll-mt-28 md:mt-28">
          <SectionHead title={t({ bn: 'Beta চালু করুন — ৫ ধাপে', en: 'Set up the beta in 5 steps' })} lead={t({ bn: 'একবার setup, তারপর double-click করলেই চালু।', en: 'Set it up once; after that, one double-click.' })} />
          <ol className="mx-auto mt-10 max-w-[820px] space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="card flex gap-4 p-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[14px] font-semibold text-white">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-semibold">{t(s.title)}</h3>
                  <p className="mt-1 text-[14px] text-muted-foreground">{t(s.text)}</p>
                  {s.code && <pre className="mt-3 overflow-x-auto rounded-[10px] bg-ink px-4 py-3 text-[13px] text-white"><code>{s.code}</code></pre>}
                </div>
              </li>
            ))}
          </ol>
          <div className="mx-auto mt-6 flex max-w-[820px] gap-3 rounded-[16px] bg-soon-soft p-4 text-[14px] text-ink">
            <KeyRound className="mt-0.5 size-5 shrink-0 text-soon" aria-hidden="true" />
            <p>{t({ bn: 'এটা বেটা। আপনার hotel connect না হওয়া পর্যন্ত BinGi AI একটা নমুনা hotel-এর data দেখায়। Repo private, তাই access ছাড়া clone হবে না। Key ও token আপনার কম্পিউটারেই থাকে — কখনো chat-এ পাঠাবেন না।', en: 'This is a beta. Until your hotel is connected, BinGi AI shows a sample hotel. The repo is private, so cloning needs access. Keys and tokens stay on your computer — never send them in a chat.' })}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-20 max-w-[820px] md:mt-28">
          <SectionHead title={t({ bn: 'প্রশ্ন', en: 'Questions' })} />
          <div className="mt-8">
            <Accordion items={[
              { q: t({ bn: 'BinGi AI কি সবার জন্য চালু?', en: 'Is BinGi AI available to everyone?' }), a: t({ bn: 'না। এখন বেটা — আমন্ত্রণে, নিজের কম্পিউটারে চালানোর জন্য। BinGi HMS-এর ভেতরে “Ask BinGi” পরে আসবে।', en: 'No. It is a beta, by invitation, to run on your own computer. “Ask BinGi” inside the BinGi HMS comes later.' }) },
              { q: t({ bn: 'দাম কত?', en: 'What does it cost?' }), a: t({ bn: 'বেটার দাম এখনো ঠিক হয়নি। BinGi টিমকে জিজ্ঞেস করুন। Cloud model ব্যবহার করলে সেই provider-এর চার্জ আলাদা।', en: 'Beta pricing is not set yet — ask the BinGi team. If you use a cloud model, that provider charges separately.' }) },
              { q: t({ bn: 'AI ভুল করলে?', en: 'What if the AI is wrong?' }), a: t({ bn: 'সংখ্যা আসে BinGi data থেকে, আর কাজ হয় শুধু আপনার Approve-এর পর। তাই ভুল draft হলে Reject করলেই হলো।', en: 'Numbers come from BinGi data, and work happens only after you approve. If a draft is wrong, reject it.' }) },
              { q: t({ bn: 'কম্পিউটার কেমন লাগবে?', en: 'What computer do I need?' }), a: t({ bn: 'Mac M1 (8 GB) বা 16 GB RAM-এর Windows PC। Model নামাতে একবার internet লাগে।', en: 'A Mac M1 (8 GB) or a Windows PC with 16 GB RAM. You need internet once to download the model.' }) },
              { q: t({ bn: 'কোন ভাষায় কথা বলে?', en: 'Which languages?' }), a: t({ bn: 'বাংলা, Banglish আর English। আপনি যে ভাষায় লেখেন, সেই ভাষায় উত্তর।', en: 'Bangla, Banglish and English. It answers in the language you write in.' }) },
            ]} />
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-20 overflow-hidden rounded-[28px] bg-bay px-6 py-12 text-center text-white md:mt-28 md:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-full h-[360px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(253_65_63/0.35),transparent)]" />
          <img src={asset('/media/ai/fennec.webp')} alt="" aria-hidden="true" width={96} height={96} className="relative mx-auto size-20" />
          <h2 className="relative mt-4 text-[28px] font-semibold tracking-tight md:text-[36px]">{t({ bn: 'আপনার hotel-এ BinGi AI চেষ্টা করুন', en: 'Try BinGi AI with your hotel' })}</h2>
          <p className="relative mx-auto mt-3 max-w-[520px] text-[15px] text-white/75">{t({ bn: 'বেটা access-এর জন্য WhatsApp করুন। setup-এ আমরা সাহায্য করব।', en: 'Message us on WhatsApp for beta access. We help you set it up.' })}</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <a href={wa} target="_blank" rel="noreferrer" className="btn-primary h-12 px-6 text-[15px]">{t({ bn: 'Beta access চান', en: 'Request beta access' })}</a>
            <Link to="/docs/bingi-ai" className="h-12 rounded-full px-6 text-[15px] leading-[48px] text-white ring-1 ring-white/25 hover:bg-white/10">{t({ bn: 'ডকস পড়ুন', en: 'Read the docs' })}</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
