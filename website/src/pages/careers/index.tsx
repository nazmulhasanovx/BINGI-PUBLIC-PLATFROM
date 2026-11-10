import { MapPin } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { site } from '@/data/site'
import { PageHeader } from '@/components/ui/Ui'
import { roles } from '@/data/careers'

export default function Careers() {
  const { t } = useLang()
  return (
    <div className="container-x">
      <PageHeader mark={t({ bn: 'টিমে', en: 'team' })} title={t({ bn: 'আমাদের টিমে আসুন', en: 'Join the team' })}
        lead={t({ bn: 'আমরা NEONECY — ঢাকা থেকে হোটেলের জন্য সফটওয়্যার বানাই।', en: 'We’re NEONECY — building hotel software from Dhaka.' })} />

      <p className="mt-6 flex items-center gap-2 text-[15px] text-muted-foreground"><MapPin className="size-4 text-brand" aria-hidden="true" />{t(site.address)}</p>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {roles.map((r) => (
          <div key={r.team.en} className="card p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand">{t(r.team)}</h2>
            <ul className="mt-4 space-y-3">
              {r.titles.map((x) => <li key={x.en} className="text-[17px] font-medium">{t(x)}</li>)}
            </ul>
          </div>
        ))}
      </section>
      <p className="mt-4 text-[14px] text-muted-foreground">{t({ bn: 'এই ভূমিকাগুলোতে আমরা লোক নিই। এখন কোন পদ খোলা, CV পাঠালে জানাব।', en: 'These are the roles we hire for. Send your CV and we’ll tell you what’s open now.' })}</p>

      <section className="mt-12 card-highlight rounded-[24px] p-6 md:p-10 md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <h2 className="text-[24px] font-semibold tracking-tight">{t({ bn: 'আপনার CV পাঠান', en: 'Send your CV' })}</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">{t({ bn: 'কোন ভূমিকায় আগ্রহী, সেটা লিখে দিন।', en: 'Tell us which role you’re interested in.' })}</p>
        </div>
        <a href={site.whatsapp} className="btn-primary mt-5 h-12 px-6 md:mt-0">{t({ bn: 'WhatsApp-এ পাঠান', en: 'Send on WhatsApp' })}</a>
      </section>
    </div>
  )
}
