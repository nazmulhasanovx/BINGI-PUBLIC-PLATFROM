import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { get } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useLang } from '@/lib/i18n'
import { useLoad } from '@/lib/useLoad'
import { ago, fmtDate, fmtNum } from '@/lib/format'
import { Card, Chip, ErrorBox, PageHeader, Skeleton } from '@/components/ui'
import { leadStatus } from './Leads'

type D = { visitors_today: number; views_today: number; leads_new: number; leads_7d: number; unpublished: number; live: { version: number; published_at: string; by?: string; build_status: string } | null; recent_leads: { id: number; name: string; property: string; status: string; created_at: string }[] }

export default function Dashboard() {
  const { t } = useLang()
  const { user, can } = useAuth()
  const q = useLoad(() => get<D>('/dashboard'))
  const d = q.data
  const tiles = [
    { l: { bn: 'আজকের ভিজিটর', en: 'Visitors today' }, v: d?.visitors_today, sub: d ? `${fmtNum(d.views_today)} ${t({ bn: 'পেজ ভিউ', en: 'page views' })}` : '', to: '/visitors', show: can('owner', 'sales') },
    { l: { bn: 'নতুন লিড', en: 'New leads' }, v: d?.leads_new, sub: d ? `${fmtNum(d.leads_7d)} ${t({ bn: 'গত 7 দিনে', en: 'in 7 days' })}` : '', to: '/leads', show: can('owner', 'sales') },
    { l: { bn: 'পাবলিশ বাকি', en: 'Waiting to publish' }, v: d?.unpublished, sub: t({ bn: 'বদল', en: 'changes' }), to: '/publish', show: can('owner', 'editor') },
    { l: { bn: 'লাইভ ভার্সন', en: 'Live version' }, v: d?.live?.version, sub: d?.live ? ago(d.live.published_at) : t({ bn: 'এখনো পাবলিশ হয়নি', en: 'Not published yet' }), to: '/publish', show: can('owner', 'editor') },
  ].filter((x) => x.show)
  return (
    <>
      <PageHeader title={`${t({ bn: 'স্বাগতম', en: 'Welcome' })}, ${user?.name}`} sub={t({ bn: 'সাইটের আজকের অবস্থা এক নজরে।', en: 'Today on the site, at a glance.' })} />
      {q.error && <ErrorBox error={q.error} retry={q.reload} />}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((x) => (
          <Link key={x.l.en} to={x.to} className="group rounded-[20px] border border-line bg-white p-5 shadow-soft transition-shadow hover:shadow-lift">
            <p className="text-[14px] text-soft">{t(x.l)}</p>
            {q.loading ? <Skeleton className="mt-2 h-9 w-20" /> : <p className="mt-1 text-[32px] font-semibold tracking-[-0.03em] tabular-nums">{x.v == null ? '—' : fmtNum(x.v)}</p>}
            <p className="mt-1 text-[13px] text-soft">{x.sub}</p>
          </Link>
        ))}
      </div>
      {can('owner', 'sales') && (
        <Card className="mt-6 p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-[17px] font-semibold">{t({ bn: 'সাম্প্রতিক লিড', en: 'Recent leads' })}</h2><Link to="/leads" className="inline-flex min-h-11 items-center gap-1 text-[14px] font-medium text-link">{t({ bn: 'সব দেখুন', en: 'See all' })}<ArrowRight className="size-4" /></Link></div>
          {q.loading ? <Skeleton className="h-24" /> : !d?.recent_leads.length ? <p className="py-6 text-center text-[14px] text-soft">{t({ bn: 'এখনো কোনো লিড নেই। সাইটের "ডেমো বুক করুন" ফর্ম থেকে এখানে আসবে।', en: 'No leads yet. They arrive here from the site\'s "Book a demo" form.' })}</p> : (
            <ul className="divide-y divide-line">{d.recent_leads.map((l) => (
              <li key={l.id}><Link to={`/leads?open=${l.id}`} className="flex items-center justify-between gap-3 py-3"><span className="min-w-0"><span className="block truncate font-medium">{l.name}</span><span className="text-[13px] text-soft">{l.property} · {fmtDate(l.created_at)}</span></span><Chip tone={leadStatus[l.status]?.tone ?? 'neutral'}>{t(leadStatus[l.status]?.l ?? { bn: l.status, en: l.status })}</Chip></Link></li>
            ))}</ul>
          )}
        </Card>
      )}
    </>
  )
}
