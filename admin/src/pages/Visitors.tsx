import { useState } from 'react'
import { get } from '@/lib/api'
import { useLang, type L } from '@/lib/i18n'
import { useLoad } from '@/lib/useLoad'
import { fmtNum } from '@/lib/format'
import { Card, Empty, ErrorBox, PageHeader, Skeleton, Tabs } from '@/components/ui'

type Row = { key: string | null; views?: number; visitors?: number; leads?: number }
type O = { from: string; to: string; has_data: boolean; totals: { visitors: number; views: number; leads: number; demo_opens: number; whatsapp: number; conversion: number | null }; series: { date: string; visitors: number; views: number; leads: number }[]; pages: Row[]; sources: Row[]; countries: Row[]; devices: Row[]; lead_pages: Row[] }
const iso = (d: Date) => d.toISOString().slice(0, 10)

export default function Visitors() {
  const { t } = useLang()
  const [days, setDays] = useState<'7' | '30' | '90'>('30')
  const q = useLoad(() => { const to = new Date(); const from = new Date(Date.now() - (Number(days) - 1) * 864e5); return get<O>(`/analytics/overview?from=${iso(from)}&to=${iso(to)}`) }, [days])
  const d = q.data
  return (
    <>
      <PageHeader title={t({ bn: 'ভিজিটর', en: 'Visitors' })} sub={t({ bn: 'কুকি ছাড়া গোনা — কোনো নাম, ফোন বা IP রাখা হয় না। "ভিজিটর" মানে দিনে আলাদা ভিজিটর, যোগ করে।', en: 'Counted without cookies — no names, phones or IPs are kept. "Visitors" = unique visitors per day, added up.' })} />
      <Tabs value={days} onChange={setDays} items={[{ id: '7', label: t({ bn: '7 দিন', en: '7 days' }) }, { id: '30', label: t({ bn: '30 দিন', en: '30 days' }) }, { id: '90', label: t({ bn: '90 দিন', en: '90 days' }) }]} />
      {q.error ? <ErrorBox error={q.error} retry={q.reload} /> : q.loading || !d ? <div className="grid gap-3 sm:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        : !d.has_data ? <Empty title={t({ bn: 'এখনো কোনো ভিজিটর ডেটা নেই', en: 'No visitor data yet' })} sub={t({ bn: 'সাইট নতুন build হলে ভিজিটর গোনা শুরু হবে। আমরা কোনো আন্দাজের সংখ্যা দেখাই না।', en: 'Counting starts once the site is built with tracking. We never show estimated numbers.' })} />
        : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {([[{ bn: 'ভিজিটর', en: 'Visitors' }, d.totals.visitors], [{ bn: 'পেজ ভিউ', en: 'Page views' }, d.totals.views], [{ bn: 'লিড', en: 'Leads' }, d.totals.leads], [{ bn: 'ডেমো ফর্ম খোলা', en: 'Demo form opened' }, d.totals.demo_opens], [{ bn: 'লিড রেট', en: 'Lead rate' }, d.totals.conversion]] as [L, number | null][]).map(([l, v], i) => (
                <Card key={l.en} className="p-4"><p className="text-[13px] text-soft">{t(l)}</p><p className="mt-1 text-[26px] font-semibold tabular-nums tracking-[-0.02em]">{v == null ? '—' : i === 4 ? `${v}%` : fmtNum(v)}</p></Card>
              ))}
            </div>
            <Card className="p-5"><h2 className="mb-3 text-[16px] font-semibold">{t({ bn: 'প্রতিদিন', en: 'Per day' })}</h2><DayChart series={d.series} /></Card>
            <div className="grid gap-5 lg:grid-cols-2">
              <Table title={t({ bn: 'সবচেয়ে বেশি দেখা পেজ', en: 'Top pages' })} rows={d.pages} col={t({ bn: 'ভিউ', en: 'Views' })} v="views" />
              <Table title={t({ bn: 'কোথা থেকে এসেছে', en: 'Where they came from' })} rows={d.sources.map((s) => ({ ...s, key: s.key === 'direct' ? t({ bn: 'সরাসরি / অজানা', en: 'Direct / unknown' }) : s.key }))} col={t({ bn: 'ভিজিটর', en: 'Visitors' })} v="visitors" />
              <Table title={t({ bn: 'দেশ', en: 'Country' })} rows={d.countries.map((c) => ({ ...c, key: c.key ?? t({ bn: 'অজানা', en: 'Unknown' }) }))} col={t({ bn: 'ভিউ', en: 'Views' })} v="views" />
              <Table title={t({ bn: 'ডিভাইস', en: 'Device' })} rows={d.devices} col={t({ bn: 'ভিউ', en: 'Views' })} v="views" />
              <Table title={t({ bn: 'কোন পেজ থেকে লিড', en: 'Pages that bring leads' })} rows={d.lead_pages} col={t({ bn: 'লিড', en: 'Leads' })} v="leads" />
            </div>
          </div>
        )}
    </>
  )
}

function Table({ title, rows, col, v }: { title: string; rows: Row[]; col: string; v: 'views' | 'visitors' | 'leads' }) {
  const { t } = useLang()
  const max = Math.max(1, ...rows.map((r) => r[v] ?? 0))
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-[16px] font-semibold">{title}</h2>
      {!rows.length ? <p className="text-[14px] text-soft">{t({ bn: 'এখনো নেই', en: 'None yet' })}</p> : (
        <table className="w-full text-[14px]"><thead className="sr-only"><tr><th>{title}</th><th>{col}</th></tr></thead><tbody>
          {rows.map((r) => (
            <tr key={String(r.key)}><td className="relative py-1.5 pr-3"><span className="absolute inset-y-1 left-0 rounded-[6px] bg-brand-soft" style={{ width: `${((r[v] ?? 0) / max) * 100}%` }} aria-hidden="true" /><span className="relative block truncate px-2">{r.key ?? '—'}</span></td><td className="w-16 text-right tabular-nums font-medium">{fmtNum(r[v] ?? 0)}</td></tr>
          ))}
        </tbody></table>
      )}
    </Card>
  )
}

/** Visitors per day as bars, leads as dots. Numbers straight from the API series. */
function DayChart({ series }: { series: O['series'] }) {
  const { t } = useLang()
  const W = 760, H = 180, pad = 28
  const max = Math.max(1, ...series.map((s) => s.visitors))
  const bw = (W - pad * 2) / series.length
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label={t({ bn: 'প্রতিদিনের ভিজিটর', en: 'Visitors per day' })} className="w-full">
      <line x1={pad} x2={W - pad} y1={H} y2={H} stroke="#E4E7EC" />
      <text x={pad} y={14} fontSize="11" fill="#616A77">{fmtNum(max)}</text>
      {series.map((s, i) => {
        const h = (s.visitors / max) * (H - 24)
        return (
          <g key={s.date}>
            <rect x={pad + i * bw + bw * 0.15} y={H - h} width={bw * 0.7} height={h} rx={Math.min(4, bw / 4)} fill="#B11C29" opacity={0.85}><title>{`${s.date}: ${s.visitors} visitors, ${s.views} views, ${s.leads} leads`}</title></rect>
            {s.leads > 0 && <circle cx={pad + i * bw + bw / 2} cy={H - h - 8} r={3.5} fill="#1D4ED8"><title>{`${s.leads} leads`}</title></circle>}
            {(i === 0 || i === series.length - 1 || (series.length > 10 && i % Math.ceil(series.length / 6) === 0)) && <text x={pad + i * bw + bw / 2} y={H + 16} fontSize="11" textAnchor="middle" fill="#616A77">{s.date.slice(5)}</text>}
          </g>
        )
      })}
    </svg>
  )
}
