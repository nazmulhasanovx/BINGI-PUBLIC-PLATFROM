import { Link } from 'react-router-dom'
import { CreditCard, Network, Store } from 'lucide-react'
import { useLang } from '@/i18n/lang'
import { site } from '@/data/site'
import { PageHeader } from '@/components/ui/Ui'
import { StatusChip } from '@/components/ui/StatusChip'
import { modules } from '@/data/status'

const statusOf = (id: string) => modules.find((m) => m.id === id)!.status

export default function Partners() {
  const { t } = useLang()
  return (
    <div className="container-x">
      <PageHeader mark={t({ bn: 'মার্কেটপ্লেস', en: 'Marketplace' })} title={t({ bn: 'মার্কেটপ্লেস ও পার্টনার', en: 'Marketplace & partners' })}
        lead={t({ bn: 'গেস্টরা যেখানে আপনাকে খোঁজে, আর যে সেবাগুলো BinGi-র সাথে যুক্ত হবে।', en: 'Where guests find you, and the services that connect to BinGi.' })} />

      <section className="mt-10 card-highlight rounded-[24px] p-6 md:p-10 md:flex md:items-center md:justify-between md:gap-10">
        <div className="max-w-[560px]">
          <span className="grid size-11 place-items-center rounded-[12px] bg-white text-brand ring-1 ring-brand/20"><Store className="size-5" aria-hidden="true" /></span>
          <h2 className="mt-4 h2">{t({ bn: 'BinGi মার্কেটপ্লেস', en: 'BinGi Marketplace' })}</h2>
          <p className="mt-3 text-[16px] text-muted-foreground">{t({ bn: 'bingi.app-এ গেস্টরা হোটেল খুঁজে সরাসরি বুক করে। আপনার রুম অনুমোদনের পর সেখানে দেখায়, বুকিং আসে আপনার HMS-এ।', en: 'On bingi.app guests find hotels and book directly. Your rooms appear there after approval, and bookings land in your HMS.' })}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 md:mt-0 md:flex-col">
          <a href={site.marketplace} className="btn-primary h-12 px-6">{t({ bn: 'মার্কেটপ্লেস দেখুন', en: 'Visit the marketplace' })}</a>
          <a href={site.hmsRegister} className="btn-ghost h-12 px-6">{t({ bn: 'প্রপার্টি লিস্ট করুন', en: 'List your property' })}</a>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-[22px] font-semibold tracking-tight">{t({ bn: 'ইন্টিগ্রেশন', en: 'Integrations' })}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            { id: 'ota', icon: <Network className="size-5" />, title: { bn: 'OTA ও চ্যানেল পার্টনার', en: 'OTA & channel partners' }, text: { bn: 'অনলাইন ট্রাভেল এজেন্সির সাথে রুম ও দাম সিঙ্ক।', en: 'Rooms and rates kept in sync with online travel agencies.' } },
            { id: 'payments', icon: <CreditCard className="size-5" />, title: { bn: 'পেমেন্ট পার্টনার', en: 'Payment partners' }, text: { bn: 'অনলাইন পেমেন্ট সরাসরি BinGi দিয়ে।', en: 'Online payments straight through BinGi.' } },
          ].map((x) => (
            <div key={x.id} className="card p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-[12px] bg-brand-soft text-brand">{x.icon}</span>
                <StatusChip status={statusOf(x.id)} />
              </div>
              <h3 className="mt-4 text-[18px] font-semibold">{t(x.title)}</h3>
              <p className="mt-1 text-[15px] text-muted-foreground">{t(x.text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 flex flex-col items-start gap-4 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">{t({ bn: 'পার্টনার হতে চান?', en: 'Want to partner with us?' })}</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">{t({ bn: 'পেমেন্ট, OTA বা ট্রাভেল ব্যবসা — কথা বলুন।', en: 'Payments, OTA or a travel business — let’s talk.' })}</p>
        </div>
        <Link to="/contact" className="btn-dark h-11 px-5">{t({ bn: 'যোগাযোগ করুন', en: 'Contact us' })}</Link>
      </section>
    </div>
  )
}
