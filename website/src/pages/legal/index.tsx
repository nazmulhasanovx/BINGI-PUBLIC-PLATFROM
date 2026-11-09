import { NavLink, useParams } from 'react-router-dom'
import { useLang, type L } from '../../i18n/lang'

// Placeholder structure only — final legal text must come from NEONECY's lawyer.
const docs: Record<string, { title: L; body: L }> = {
  privacy: { title: { bn: 'প্রাইভেসি পলিসি', en: 'Privacy Policy' }, body: { bn: 'চূড়ান্ত লেখা আইনি পর্যালোচনার পর যোগ হবে।', en: 'Final text will be added after legal review.' } },
  terms: { title: { bn: 'শর্তাবলি', en: 'Terms of Service' }, body: { bn: 'চূড়ান্ত লেখা আইনি পর্যালোচনার পর যোগ হবে।', en: 'Final text will be added after legal review.' } },
  refund: { title: { bn: 'রিফান্ড পলিসি', en: 'Refund Policy' }, body: { bn: 'চূড়ান্ত লেখা আইনি পর্যালোচনার পর যোগ হবে।', en: 'Final text will be added after legal review.' } },
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
        <p className="mt-4 text-[16px] text-muted-foreground leading-relaxed">{t(d.body)}</p>
      </article>
    </div>
  )
}
