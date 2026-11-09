import type { Status } from '../../data/status'
import { useLang } from '../../i18n/lang'

const label = {
  live: { bn: 'চালু', en: 'Live' },
  soon: { bn: 'শীঘ্রই আসছে', en: 'Coming Soon' },
  confirm: { bn: 'স্ট্যাটাস যাচাই বাকি', en: 'Status to confirm' },
}
const cls = {
  live: 'bg-ok-soft text-ok',
  soon: 'bg-soon-soft text-soon',
  confirm: 'bg-canvas text-muted border border-line',
}

export function StatusChip({ status }: { status: Status }) {
  const { t } = useLang()
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium whitespace-nowrap ${cls[status]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {t(label[status])}
    </span>
  )
}
