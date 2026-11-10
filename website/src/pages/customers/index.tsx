import { ShieldCheck } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { site } from '@/data/site'
import { PageHeader } from '@/components/ui/Ui'

// No customer stories yet. We publish only with the hotel's written permission and real numbers.
export default function Customers() {
  const { t } = useLang()
  return (
    <div className="container-x">
      <PageHeader mark={t({ bn: 'গল্প', en: 'stories' })} title={t({ bn: 'আমাদের হোটেলগুলোর গল্প', en: 'Customer stories' })}
        lead={t({ bn: 'BinGi ব্যবহার করা হোটেলগুলো নিজেদের কথা বলবে — শীঘ্রই।', en: 'Hotels that run on BinGi, in their own words — coming soon.' })} />
      <section className="mt-10 grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="card p-6 md:p-8">
          <span className="grid size-11 place-items-center rounded-[12px] bg-brand-soft text-brand"><ShieldCheck className="size-5" aria-hidden="true" /></span>
          <h2 className="mt-4 text-[22px] font-semibold tracking-tight">{t({ bn: 'আমরা যেভাবে গল্প প্রকাশ করি', en: 'How we publish a story' })}</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-muted-foreground">
            <li>{t({ bn: 'হোটেলের লিখিত অনুমতি নিয়ে।', en: 'Only with the hotel’s written permission.' })}</li>
            <li>{t({ bn: 'আসল সংখ্যা, হোটেলের নিজের রিপোর্ট থেকে।', en: 'Real numbers, from the hotel’s own reports.' })}</li>
            <li>{t({ bn: 'কোনো বানানো রিভিউ নয়।', en: 'No made-up reviews.' })}</li>
          </ul>
        </div>
        <div className="card-highlight rounded-[20px] p-6 md:p-8 flex flex-col justify-between gap-6">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight">{t({ bn: 'BinGi ব্যবহার করছেন?', en: 'Using BinGi?' })}</h2>
            <p className="mt-2 text-[15px] text-muted-foreground">{t({ bn: 'আপনার হোটেলের গল্প বলতে চাইলে আমাদের জানান।', en: 'Tell us if you’d like your hotel featured.' })}</p>
          </div>
          <a href={site.whatsapp} className="btn-primary h-11 w-fit px-5">{t({ bn: 'WhatsApp-এ জানান', en: 'Tell us on WhatsApp' })}</a>
        </div>
      </section>
    </div>
  )
}
