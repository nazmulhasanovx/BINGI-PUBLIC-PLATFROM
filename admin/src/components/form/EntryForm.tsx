import type { TypeDef } from '@/lib/registry'
import { useLang } from '@/lib/i18n'
import { FieldInput, type Errors } from './FieldInput'

/** A whole content item. Internal fields (verified_by, permission_file…) are grouped under "Checks". */
export function EntryForm({ t: type, data, onChange, errors }: { t: TypeDef; data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; errors: Errors }) {
  const { t } = useLang()
  const main = type.fields.filter((f) => !f.internal)
  const checks = type.fields.filter((f) => f.internal)
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  return (
    <div className="space-y-5">
      {main.map((f) => <FieldInput key={f.name} f={f} value={data[f.name]} onChange={(v) => set(f.name, v)} path={f.name} errors={errors} />)}
      {checks.length > 0 && (
        <section className="space-y-4 rounded-[16px] border border-[#F5D9B0] bg-warn-soft/60 p-4">
          <h3 className="text-[14px] font-semibold text-warn">{t({ bn: 'যাচাই (সাইটে দেখায় না)', en: 'Checks (never shown on the site)' })}</h3>
          {checks.map((f) => <FieldInput key={f.name} f={f} value={data[f.name]} onChange={(v) => set(f.name, v)} path={f.name} errors={errors} />)}
        </section>
      )}
    </div>
  )
}
