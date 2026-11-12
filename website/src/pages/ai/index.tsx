import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Copy, BookOpenCheck, CalendarCheck2, ClipboardCheck, Cpu, FileImage, KeyRound, Laptop, Languages, Lock, MessageSquareText, ScrollText, ShieldCheck, Sparkles, UserCheck } from 'lucide-react'
import { useLang, type L } from '@/i18n/lang'
import { PillTabs, Accordion } from '@/components/ui/Ui'
import { Reveal } from '@/components/ui/Reveal'
import AITextLoading from '@/components/ui/ai-text-loading'
import { SendIcon, DownloadDoneIcon, CopiedIcon, PlayPauseIcon, SuccessIcon } from '@/components/ui/animated-state-icons'
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
]

const safety: { icon: typeof Lock; title: L; text: L }[] = [
  { icon: UserCheck, title: { bn: 'আপনার চেয়ে বেশি ক্ষমতা নেই', en: 'Never more access than you' }, text: { bn: 'প্রতিটা কাজে role, property, permission আর plan চেক হয়।', en: 'Role, property, permission and plan are checked for every action.' } },
  { icon: ClipboardCheck, title: { bn: 'Approve ছাড়া কিছু হয় না', en: 'Nothing happens without approval' }, text: { bn: 'AI শুধু draft বানায়। টাকা নড়ায় না, কিছু delete করে না।', en: 'AI only drafts. It does not move money or delete anything.' } },
  { icon: ShieldCheck, title: { bn: 'Guest-এর লেখা = শুধু তথ্য', en: 'Guest text is data, not orders' }, text: { bn: 'Guest message-এর ভেতরের নির্দেশ AI মানে না।', en: 'Instructions hidden in guest messages are ignored.' } },
  { icon: ScrollText, title: { bn: 'সব কাজের log', en: 'Everything is logged' }, text: { bn: 'কে কী জিজ্ঞেস করল, কী approve হলো — audit log-এ থাকে। Owner চাইলে বন্ধ করতে পারেন।', en: 'Questions and approvals are kept in an audit log. The owner can switch AI off.' } },
]

const stepIcons = [SendIcon, DownloadDoneIcon, CopiedIcon, PlayPauseIcon, SuccessIcon]

const steps: { title: L; text: L; code?: string }[] = [
  { title: { bn: 'Beta access নিন', en: 'Get beta access' }, text: { bn: 'BinGi টিমকে WhatsApp করুন। আপনার GitHub account-কে BinGi AI repo-তে যোগ করা হবে, সাথে আপনার hotel-এর BinGi API access।', en: 'Message the BinGi team on WhatsApp. We add your GitHub account to the BinGi AI repo and give your hotel its BinGi API access.' } },
  { title: { bn: 'দরকারি জিনিস বসান', en: 'Install the basics' }, text: { bn: 'Node.js (LTS), Git আর Ollama (local model চালাতে)। তারপর model নামান:', en: 'Node.js (LTS), Git and Ollama (to run the local model). Then download the model:' }, code: 'ollama pull qwen3:4b' },
  { title: { bn: 'Repo নামান', en: 'Get the code' }, text: { bn: 'পাশের terminal থেকে command কপি করে Terminal বা PowerShell-এ চালান।', en: 'Copy the command from the terminal and run it in Terminal or PowerShell.' }, code: 'git clone -b develop https://github.com/nazmulhasanovx/BINGI-AI-.git bingi-ai' },
  { title: { bn: 'চালু করুন', en: 'Start it' }, text: { bn: 'Mac-এ “Start BinGi AI.command”, Windows-এ “Start BinGi AI (Windows).bat” double-click। Browser-এ নিজে খুলবে:', en: 'Double-click “Start BinGi AI.command” on Mac or “Start BinGi AI (Windows).bat” on Windows. It opens in your browser:' }, code: 'http://localhost:8787' },
  { title: { bn: 'BinGi API connect করুন', en: 'Connect BinGi API' }, text: { bn: 'User menu › Connectivity › BinGi HMS API — address আর access token দিন, Test চাপুন। চাইলে cloud model-এর জন্য OpenRouter key-ও এখানে।', en: 'User menu › Connectivity › BinGi HMS API — enter the address and access token, press Test. An OpenRouter key for a cloud model also goes here (optional).' } },
]

const commands = 'ollama pull qwen3:4b\ngit clone -b develop https://github.com/nazmulhasanovx/BINGI-AI-.git bingi-ai\ncd bingi-ai && pnpm start'
function CopyAll() {
  const { t } = useLang()
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(commands); setDone(true); window.setTimeout(() => setDone(false), 1600) } catch { /* clipboard blocked */ }
  }
  return (
    <button type="button" onClick={copy} className="-my-1.5 ml-auto inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
      {done ? <Check className="size-3.5 text-[#7EE2A8]" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      {done ? t({ bn: 'কপি হয়েছে', en: 'Copied' }) : t({ bn: 'সব কপি', en: 'Copy all' })}
    </button>
  )
}

export default function Ai() {
  const { t } = useLang()
  const [screen, setScreen] = useState<Screen>('aiHome')
  const wa = `${site.whatsapp}?text=${encodeURIComponent('BinGi AI beta access chai')}`
  const Head = ({ eyebrow, title, lead }: { eyebrow: L; title: L; lead?: L }) => (
    <div className="mx-auto max-w-[760px] text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">{t(eyebrow)}</p>
      <h2 className="mt-3 text-balance text-[30px] font-semibold tracking-[-0.03em] text-ink md:text-[42px] md:leading-[1.08]" style={{ fontFamily: 'var(--font-display)' }}>{t(title)}</h2>
      {lead && <p className="mx-auto mt-3 max-w-[520px] text-pretty text-[16px] text-muted-foreground md:text-[17px]">{t(lead)}</p>}
    </div>
  )
  return (
    <div className="relative overflow-x-clip">
      {/* Hero — one message, one action, the product */}
      <section className="relative isolate pt-12 text-center md:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[760px] bg-[radial-gradient(50%_45%_at_50%_30%,rgb(253_65_63/0.13),transparent_70%),radial-gradient(35%_35%_at_72%_42%,rgb(140_120_255/0.10),transparent_70%)]" />
        <div className="container-x">
          <div className="inline-flex items-center gap-3 rounded-full border border-line bg-white/80 py-1.5 pl-2 pr-4 shadow-soft backdrop-blur">
            <img src={aiLogo} alt="BinGi AI" width={300} height={110} className="h-7 w-auto" />
            <span className="h-4 w-px bg-line" aria-hidden="true" />
            <span className="text-[13px] font-medium text-link">{t({ bn: 'বেটা', en: 'Beta' })}</span>
          </div>
          <h1 className="mx-auto mt-7 max-w-[880px] text-balance text-[44px] font-semibold leading-[1.02] tracking-[-0.04em] text-ink md:text-[76px]" style={{ fontFamily: 'var(--font-display)' }}>
            {t({ bn: 'হোটেলকে প্রশ্ন করুন।', en: 'Ask your hotel.' })}<br />
            <span className="bg-linear-to-r from-brand via-[#E0414A] to-[#8C6CFF] bg-clip-text text-transparent">{t({ bn: 'উত্তর পান।', en: 'Get the answer.' })}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-pretty text-[17px] leading-relaxed text-muted-foreground md:text-[19px]">
            {t({ bn: 'আপনার BinGi data থেকে উত্তর, সকালের brief আর কাজের draft — আপনি দেখে approve করেন।', en: 'Answers from your BinGi data, a morning brief and work drafts — you review and approve.' })}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href={wa} target="_blank" rel="noreferrer" className="btn-primary h-12 px-7 text-[15px]">{t({ bn: 'Beta access চান', en: 'Request beta access' })}</a>
            <a href="#install" className="group inline-flex h-12 items-center gap-1.5 px-4 text-[15px] font-medium text-ink">
              {t({ bn: 'কীভাবে চালাবেন', en: 'How to set it up' })}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>

          <div className="relative mx-auto mt-14 max-w-[1080px]">
            <StudioDisplay key={screen} media={screen} className="relative w-full" />
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <PillTabs label={t({ bn: 'স্ক্রিন', en: 'Screen' })} value={screen} onChange={setScreen} tone="ink" size="sm"
              options={[{ id: 'aiHome', label: 'Ask BinGi' }, { id: 'aiAnswer', label: t({ bn: 'উত্তর', en: 'Answer' }) }, { id: 'aiBrief', label: 'Daily Brief' }]} />
            <p className="text-[13px] text-muted-foreground">{t({ bn: 'আসল BinGi AI স্ক্রিন · নমুনা হোটেল', en: 'Real BinGi AI screens · sample hotel' })}</p>
          </div>
        </div>
      </section>

      <div className="container-x">
        {/* What it does — quiet grid, no boxes */}
        <section className="mt-28 md:mt-36">
          <Head eyebrow={{ bn: 'কী করে', en: 'What it does' }} title={{ bn: 'রোজকার কাজের এক সহকারী', en: 'One assistant for the daily work' }} />
          <div className="mx-auto mt-14 grid max-w-[1040px] gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {abilities.map((a, i) => (
              <Reveal key={i} delay={(i % 3) * 60}>
                <div>
                  <a.icon className="size-6 text-brand" strokeWidth={1.6} aria-hidden="true" />
                  <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em]">{t(a.title)}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t(a.text)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Flow — one line stepper */}
        <section className="mt-28 md:mt-36">
          <Head eyebrow={{ bn: 'কীভাবে', en: 'How it works' }} title={{ bn: 'প্রশ্ন থেকে কাজ — আপনার হাতে', en: 'From a question to done — on your say' }} />
          <ol className="relative mx-auto mt-14 grid max-w-[1000px] gap-8 md:grid-cols-4 md:gap-6">
            <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-[22px] hidden h-px bg-[linear-gradient(90deg,transparent,var(--color-line)_15%,var(--color-line)_85%,transparent)] md:block" />
            {([
              [{ bn: 'জিজ্ঞেস করুন', en: 'Ask' }, { bn: '“104-এ deep cleaning task বানাও”', en: '“Create a deep cleaning task for 104”' }],
              [{ bn: 'যাচাই', en: 'Check' }, { bn: 'Role, property, plan আর রুম দেখে', en: 'Role, property, plan and the room' }],
              [{ bn: 'Draft', en: 'Draft' }, { bn: 'কী হবে তার কার্ড', en: 'A card of what will happen' }],
              [{ bn: 'Approve', en: 'Approve' }, { bn: 'তখনই BinGi-তে হয়, log-এ থাকে', en: 'Only then it happens, and it’s logged' }],
            ] as [L, L][]).map(([h, d], i) => (
              <li key={i} className="relative text-center">
                <span className={`relative mx-auto grid size-11 place-items-center rounded-full text-[15px] font-semibold ${i === 3 ? 'btn-primary p-0' : 'bg-white text-ink ring-1 ring-line shadow-soft'}`}>{i + 1}</span>
                <p className="mt-4 text-[17px] font-semibold">{t(h)}</p>
                <p className="mx-auto mt-1 max-w-[200px] text-[14px] text-muted-foreground">{t(d)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-line bg-white py-2 pl-2 pr-5 shadow-soft">
              <img src={asset('/media/ai/fennec.webp')} alt="" aria-hidden="true" className="size-8 rounded-full bg-brand-soft" />
              <AITextLoading interval={1800} className="from-ink via-[#E0414A] to-ink text-[15px]"
                texts={t({ bn: 'প্রশ্ন বুঝছে…|Role আর property যাচাই করছে…|কাজের card বানাচ্ছে…|আপনার Approve-এর অপেক্ষায়…', en: 'Understanding the question…|Checking role and property…|Preparing the task card…|Waiting for your Approve…' }).split('|')} />
            </div>
          </div>
        </section>

        {/* Safety + where it runs — one dark panel */}
        <section className="relative mt-28 overflow-hidden rounded-[32px] bg-bay px-6 py-14 text-white md:mt-36 md:px-14 md:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(140_120_255/0.22),transparent)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(253_65_63/0.22),transparent)]" />
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#FF8A85]">{t({ bn: 'নিরাপত্তা', en: 'Safe by design' })}</p>
              <h2 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[40px]" style={{ fontFamily: 'var(--font-display)' }}>{t({ bn: 'আপনার hotel, আপনার নিয়ন্ত্রণ।', en: 'Your hotel. Your control.' })}</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] bg-white/[0.06] p-5 ring-1 ring-white/10">
                  <Laptop className="size-5 text-[#FF8A85]" aria-hidden="true" />
                  <p className="mt-3 font-semibold">{t({ bn: 'Local', en: 'Local' })}</p>
                  <p className="mt-1 text-[14px] text-white/70">{t({ bn: 'আপনার কম্পিউটারে Ollama-তে। প্রশ্ন-উত্তর কম্পিউটারেই থাকে।', en: 'On your computer with Ollama. Questions stay on your machine.' })}</p>
                </div>
                <div className="rounded-[18px] bg-white/[0.06] p-5 ring-1 ring-white/10">
                  <Cpu className="size-5 text-[#B9A8FF]" aria-hidden="true" />
                  <p className="mt-3 font-semibold">{t({ bn: 'Cloud — ঐচ্ছিক', en: 'Cloud — optional' })}</p>
                  <p className="mt-1 text-[14px] text-white/70">{t({ bn: 'নিজের OpenRouter key দিলে। Guest message free model-এ যায় না।', en: 'With your own OpenRouter key. Guest messages never go to free models.' })}</p>
                </div>
              </div>
            </div>
            <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:pt-12">
              {safety.map((x, i) => (
                <li key={i}>
                  <x.icon className="size-5 text-white/80" strokeWidth={1.7} aria-hidden="true" />
                  <p className="mt-3 text-[16px] font-semibold">{t(x.title)}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-white/65">{t(x.text)}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Install — steps left, one terminal right */}
        <section id="install" className="mt-28 scroll-mt-28 md:mt-36">
          <Head eyebrow={{ bn: 'বেটা setup', en: 'Beta setup' }} title={{ bn: '৫ ধাপে চালু', en: 'Running in 5 steps' }} lead={{ bn: 'একবার setup, তারপর এক double-click।', en: 'Set it up once — then one double-click.' }} />
          <div className="mx-auto mt-14 grid max-w-[1080px] items-start gap-8 lg:grid-cols-[1fr_1.05fr]">
            <ol className="space-y-6">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-white text-brand shadow-soft ring-1 ring-line">
                    {(() => { const I = stepIcons[i]; return <I size={28} /> })()}
                  </span>
                  <div className="pt-0.5">
                    <p className="text-[16px] font-semibold"><span className="mr-2 text-[13px] font-medium tabular-nums text-muted-foreground">0{i + 1}</span>{t(s.title)}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{t(s.text).replace(/:$/, '.')}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="overflow-hidden rounded-[20px] bg-[#0B1220] shadow-[0_30px_60px_-30px_rgb(11_34_53/0.6)] ring-1 ring-black/5 lg:sticky lg:top-28">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                <span aria-hidden="true" className="size-3 rounded-full bg-[#FF5F57]" /><span aria-hidden="true" className="size-3 rounded-full bg-[#FEBC2E]" /><span aria-hidden="true" className="size-3 rounded-full bg-[#28C840]" />
                <span className="ml-3 text-[12px] text-white/45">Terminal</span>
                <CopyAll />
              </div>
              <pre className="overflow-x-auto p-5 text-[13px] leading-[1.9] text-white/90"><code>
<span className="text-white/40"># 2 · {t({ bn: 'model নামান', en: 'download the model' })}</span>{'\n'}<span className="text-[#FF8A85]">$</span> ollama pull qwen3:4b{'\n\n'}
<span className="text-white/40"># 3 · {t({ bn: 'repo নামান', en: 'get the code' })}</span>{'\n'}<span className="text-[#FF8A85]">$</span> git clone -b develop \{'\n'}    https://github.com/nazmulhasanovx/BINGI-AI-.git bingi-ai{'\n\n'}
<span className="text-white/40"># 4 · {t({ bn: 'চালু — অথবা Start file double-click', en: 'start — or double-click the Start file' })}</span>{'\n'}<span className="text-[#FF8A85]">$</span> cd bingi-ai && pnpm start{'\n'}<span className="text-[#7EE2A8]">→ http://localhost:8787</span>
              </code></pre>
              <div className="flex items-center gap-2.5 border-t border-white/10 px-5 py-3.5 text-[13px]">
                <img src={asset('/media/ai/fennec.webp')} alt="" aria-hidden="true" className="size-6 rounded-full bg-white/10" />
                <span className="text-white/45">BinGi AI ›</span>
                <AITextLoading interval={1700} className="from-white/35 via-white to-white/35 font-medium"
                  texts={t({ bn: 'আজকের booking পড়ছে…|রুমের অবস্থা দেখছে…|সকালের brief বানাচ্ছে…|আপনার Approve-এর অপেক্ষায়…', en: 'Reading today’s bookings…|Checking room status…|Writing the morning brief…|Waiting for your Approve…' }).split('|')} />
              </div>
            </div>
          </div>
          <p className="mx-auto mt-10 flex max-w-[760px] items-start justify-center gap-2 text-center text-[14px] text-muted-foreground">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-soon" aria-hidden="true" />
            {t({ bn: 'বেটা: hotel connect না হওয়া পর্যন্ত নমুনা hotel দেখায়। Repo private — access লাগবে। Key ও token শুধু আপনার কম্পিউটারে রাখুন।', en: 'Beta: until your hotel is connected it shows a sample hotel. The repo is private — access needed. Keep keys and tokens on your computer only.' })}
          </p>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-28 max-w-[760px] md:mt-36">
          <Head eyebrow={{ bn: 'প্রশ্ন', en: 'FAQ' }} title={{ bn: 'যা জানতে চান', en: 'Good to know' }} />
          <div className="mt-10">
            <Accordion items={[
              { q: t({ bn: 'BinGi AI কি সবার জন্য চালু?', en: 'Is BinGi AI available to everyone?' }), a: t({ bn: 'না। এখন বেটা — আমন্ত্রণে, নিজের কম্পিউটারে চালানোর জন্য। BinGi HMS-এর ভেতরে “Ask BinGi” পরে আসবে।', en: 'No. It is a beta, by invitation, to run on your own computer. “Ask BinGi” inside the BinGi HMS comes later.' }) },
              { q: t({ bn: 'দাম কত?', en: 'What does it cost?' }), a: t({ bn: 'বেটার দাম এখনো ঠিক হয়নি। BinGi টিমকে জিজ্ঞেস করুন। Cloud model ব্যবহার করলে সেই provider-এর চার্জ আলাদা।', en: 'Beta pricing is not set yet — ask the BinGi team. If you use a cloud model, that provider charges separately.' }) },
              { q: t({ bn: 'AI ভুল করলে?', en: 'What if the AI is wrong?' }), a: t({ bn: 'সংখ্যা আসে BinGi data থেকে, আর কাজ হয় শুধু আপনার Approve-এর পর। ভুল draft হলে Reject করলেই হলো।', en: 'Numbers come from BinGi data, and work happens only after you approve. If a draft is wrong, reject it.' }) },
              { q: t({ bn: 'কম্পিউটার কেমন লাগবে?', en: 'What computer do I need?' }), a: t({ bn: 'Mac M1 (8 GB) বা 16 GB RAM-এর Windows PC। Model নামাতে একবার internet লাগে।', en: 'A Mac M1 (8 GB) or a Windows PC with 16 GB RAM. You need internet once to download the model.' }) },
              { q: t({ bn: 'কোন ভাষায় কথা বলে?', en: 'Which languages?' }), a: t({ bn: 'বাংলা, Banglish আর English — আপনি যে ভাষায় লেখেন।', en: 'Bangla, Banglish and English — whichever you write in.' }) },
            ]} />
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-28 text-center md:mt-36">
          <img src={asset('/media/ai/fennec.webp')} alt="" aria-hidden="true" width={96} height={96} className="mx-auto size-20 drop-shadow-[0_16px_28px_rgb(177_28_41/0.25)]" />
          <h2 className="mx-auto mt-5 max-w-[620px] text-balance text-[32px] font-semibold tracking-[-0.03em] md:text-[44px]" style={{ fontFamily: 'var(--font-display)' }}>{t({ bn: 'আপনার hotel-এ BinGi AI চেষ্টা করুন', en: 'Try BinGi AI with your hotel' })}</h2>
          <p className="mx-auto mt-3 max-w-[460px] text-[16px] text-muted-foreground">{t({ bn: 'WhatsApp করুন — setup-এ আমরা সাহায্য করব।', en: 'Message us on WhatsApp — we help you set it up.' })}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={wa} target="_blank" rel="noreferrer" className="btn-primary h-12 px-7 text-[15px]">{t({ bn: 'Beta access চান', en: 'Request beta access' })}</a>
            <Link to="/docs/bingi-ai" className="btn-ghost h-12 px-6 text-[15px]">{t({ bn: 'ডকস পড়ুন', en: 'Read the docs' })}</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
