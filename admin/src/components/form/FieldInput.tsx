import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import type { FieldDef } from '@/lib/registry'
import { emptyValue } from '@/lib/registry'
import { useLang, type L } from '@/lib/i18n'
import { Button, Field, IconButton, Input, Select, Switch, Textarea } from '../ui'
import { MediaPicker } from '../MediaPicker'

// Renders one field of a content type (types.json). Every field type is handled here — nowhere else.
export type Errors = Record<string, string>
type Props = { f: FieldDef; value: unknown; onChange: (v: unknown) => void; path: string; errors: Errors }

const fallback = (name: string) => name.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
// Field names → bilingual labels. A name not listed shows as written in types.json.
export const fieldLabels: Record<string, L> = {
  name: { bn: 'নাম', en: 'Name' }, role: { bn: 'পদবি', en: 'Role' }, group: { bn: 'দল', en: 'Group' }, photo: { bn: 'ছবি', en: 'Photo' }, linkedin: { bn: 'LinkedIn লিংক', en: 'LinkedIn link' },
  status: { bn: 'স্ট্যাটাস', en: 'Status' }, icon: { bn: 'আইকন', en: 'Icon' }, desc: { bn: 'বর্ণনা', en: 'Description' }, title: { bn: 'শিরোনাম', en: 'Title' }, summary: { bn: 'সারাংশ', en: 'Summary' },
  quote: { bn: 'উক্তি', en: 'Quote' }, property: { bn: 'প্রপার্টি', en: 'Property' }, date: { bn: 'তারিখ', en: 'Date' }, slug: { bn: 'URL slug', en: 'URL slug' }, tag: { bn: 'ট্যাগ', en: 'Tag' },
  cover: { bn: 'কভার', en: 'Cover' }, src: { bn: 'ছবি', en: 'Image' }, alt: { bn: 'ছবির বর্ণনা (alt)', en: 'Image description (alt)' }, body: { bn: 'লেখা', en: 'Body' },
  q: { bn: 'প্রশ্ন', en: 'Question' }, a: { bn: 'উত্তর', en: 'Answer' }, page: { bn: 'পেজ', en: 'Page' }, value: { bn: 'মান', en: 'Value' }, label: { bn: 'লেবেল', en: 'Label' },
  source: { bn: 'সূত্র', en: 'Source' }, to: { bn: 'লিংক', en: 'Link' }, links: { bn: 'লিংকগুলো', en: 'Links' }, kind: { bn: 'ধরন', en: 'Kind' }, badge: { bn: 'ব্যাজ', en: 'Badge' },
  phoneOnly: { bn: 'শুধু মোবাইলে', en: 'Phone menu only' }, key: { bn: 'কোন জায়গা', en: 'Where' }, id: { bn: 'ID', en: 'ID' }, plan: { bn: 'প্ল্যান', en: 'Plan' }, for: { bn: 'কাদের জন্য', en: 'Made for' },
  demo: { bn: 'ডেমো হোটেল', en: 'Demo hotel' }, collection: { bn: 'কালেকশন', en: 'Collection' }, rate: { bn: 'রেট (৳/রুম/মাস)', en: 'Rate (৳/room/month)' }, regular: { bn: 'আগের দাম', en: 'Regular price' },
  activation: { bn: 'অ্যাক্টিভেশন', en: 'Activation' }, fees: { bn: 'বুকিং ফি', en: 'Booking fees' }, popular: { bn: 'জনপ্রিয়', en: 'Popular' }, tagline: { bn: 'ট্যাগলাইন', en: 'Tagline' },
  plus: { bn: '"সাথে" লাইন', en: '"Plus" line' }, need: { bn: 'কী দরকার', en: 'What they need' }, rows: { bn: 'সারি', en: 'Rows' }, month: { bn: 'মাস', en: 'Month' }, items: { bn: 'আইটেম', en: 'Items' },
  team: { bn: 'টিম', en: 'Team' }, titles: { bn: 'পদ', en: 'Roles' }, intro: { bn: 'ভূমিকা', en: 'Intro' }, runs: { bn: 'যা চালায়', en: 'What it runs' }, modules: { bn: 'মডিউল', en: 'Modules' },
  themes: { bn: 'থিম', en: 'Themes' }, type: { bn: 'ধরন', en: 'Type' }, category: { bn: 'ক্যাটাগরি', en: 'Category' }, steps: { bn: 'ধাপ', en: 'Steps' }, draft: { bn: 'খসড়া', en: 'Draft' },
  sections: { bn: 'অংশ', en: 'Sections' }, fixes: { bn: 'সমস্যা ও সমাধান', en: 'Fixes' }, where: { bn: 'কোথায়', en: 'Where' }, address: { bn: 'ঠিকানা', en: 'Address' }, phone: { bn: 'ফোন', en: 'Phone' },
  phoneIntl: { bn: 'ফোন (আন্তর্জাতিক)', en: 'Phone (international)' }, company: { bn: 'কোম্পানি', en: 'Company' }, parent: { bn: 'মূল প্রতিষ্ঠান', en: 'Parent company' },
  announcement: { bn: 'ঘোষণা বার', en: 'Announcement bar' }, verified_by: { bn: 'কে যাচাই করেছে', en: 'Verified by' }, verified_at: { bn: 'কবে যাচাই', en: 'Verified on' },
  permission_file: { bn: 'লিখিত অনুমতি', en: 'Written permission' }, web: { bn: 'HMS ওয়েব', en: 'HMS Web' }, mobile: { bn: 'HMS মোবাইল', en: 'HMS Mobile' }, guest: { bn: 'গেস্ট অ্যাপ', en: 'Guest App' },
  minBillable: { bn: 'সর্বনিম্ন বিলিং রুম', en: 'Minimum billed rooms' }, launchOff: { bn: 'লঞ্চ ছাড় (%)', en: 'Launch discount (%)' }, launchUntil: { bn: 'লঞ্চ অফার শেষ', en: 'Launch offer ends' },
  themePrice: { bn: 'থিম স্টোর দাম (৳/মাস)', en: 'Theme Store price (৳/month)' }, cycles: { bn: 'বিলিং সাইকেল', en: 'Billing cycles' }, months: { bn: 'মাস', en: 'Months' }, discount: { bn: 'ছাড় (0–1)', en: 'Discount (0–1)' },
  cycleRates: { bn: 'সাইকেল রেট', en: 'Rates per cycle' }, offers: { bn: 'অফার', en: 'Offers' },
}
const optionLabels: Record<string, L> = {
  live: { bn: 'লাইভ', en: 'Live' }, beta: { bn: 'বেটা', en: 'Beta' }, soon: { bn: 'শীঘ্রই আসছে', en: 'Coming Soon' }, confirm: { bn: 'যাচাই বাকি', en: 'Status to confirm' },
  testing: { bn: 'টেস্টিং', en: 'Testing' },
}

export function FieldInput({ f, value, onChange, path, errors }: Props) {
  const { t } = useLang()
  const err = errors[path]
  const help = f.help ? t(f.help) : undefined
  const title = fieldLabels[f.name] ? t(fieldLabels[f.name]) : fallback(f.name)
  switch (f.type) {
    case 'string': case 'url': case 'date': case 'number':
      return (
        <Field label={title} help={help} error={err} required={f.required} htmlFor={path}>
          <Input id={path} aria-invalid={!!err} type={f.type === 'url' ? 'url' : f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
            inputMode={f.type === 'number' ? 'decimal' : undefined} step={f.type === 'number' ? 'any' : undefined}
            value={value == null ? '' : String(value)} onChange={(e) => onChange(f.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)} />
        </Field>
      )
    case 'text':
      return <Field label={title} help={help} error={err} required={f.required} htmlFor={path}><Textarea id={path} aria-invalid={!!err} rows={4} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} /></Field>
    case 'bool':
      return <div className="flex items-center justify-between gap-4 rounded-[14px] border border-line bg-white px-4 py-3"><span className="text-[14px] font-medium">{title}{help && <span className="block text-[13px] font-normal text-soft">{help}</span>}</span><Switch checked={!!value} onChange={onChange} label={title} /></div>
    case 'enum':
      return (
        <Field label={title} help={help} error={err} required={f.required} htmlFor={path}>
          <Select id={path} aria-invalid={!!err} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)}>
            {!f.required && <option value="">—</option>}
            {f.options!.map((o) => <option key={o} value={o}>{optionLabels[o] ? `${t(optionLabels[o])} (${o})` : o}</option>)}
          </Select>
        </Field>
      )
    case 'l': case 'lt':
      return <Bilingual f={f} value={value as L} onChange={onChange} path={path} err={err} title={title} help={help} />
    case 'image':
      return <Field label={title} help={help} error={err} required={f.required}><MediaPicker value={(value as string) ?? ''} onChange={onChange} /></Field>
    case 'llist':
      return <ListOf title={title} help={help} err={err} items={(value as L[]) ?? []} onChange={onChange} make={() => ({ bn: '', en: '' })}
        render={(it, set, i) => <Bilingual f={{ name: '', type: 'l', required: true }} value={it} onChange={set} path={`${path}.${i}`} err={errors[`${path}.${i}`]} title={`${i + 1}`} compact />} />
    case 'strlist':
      return (
        <Field label={title} help={help ?? t({ bn: 'প্রতি লাইনে একটা', en: 'One per line' })} error={err} required={f.required} htmlFor={path}>
          <Textarea id={path} rows={4} value={((value as string[]) ?? []).join('\n')} onChange={(e) => onChange(e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))} />
        </Field>
      )
    case 'list':
      return <ListOf title={title} help={help} err={err} items={(value as Record<string, unknown>[]) ?? []} onChange={onChange} make={() => emptyValue({ ...f, type: 'object' }) as Record<string, unknown>}
        render={(it, set, i) => <div className="grid gap-3 sm:grid-cols-2">{f.fields!.map((sf) => <div key={sf.name} className={sf.type === 'l' || sf.type === 'lt' || sf.type === 'list' ? 'sm:col-span-2' : ''}><FieldInput f={sf} value={it[sf.name]} onChange={(v) => set({ ...it, [sf.name]: v })} path={`${path}.${i}.${sf.name}`} errors={errors} /></div>)}</div>} />
    case 'object': {
      const obj = (value as Record<string, unknown>) ?? {}
      return (
        <fieldset className="space-y-3 rounded-[16px] border border-line bg-white/60 p-4">
          <legend className="px-1 text-[14px] font-semibold">{title}</legend>
          {f.fields!.map((sf) => <FieldInput key={sf.name} f={sf} value={obj[sf.name]} onChange={(v) => onChange({ ...obj, [sf.name]: v })} path={`${path}.${sf.name}`} errors={errors} />)}
        </fieldset>
      )
    }
    case 'blocks':
      return <Blocks title={title} value={(value as Block[]) ?? []} onChange={onChange} path={path} errors={errors} />
    case 'json':
      return <JsonField title={title} help={help} value={value} onChange={onChange} err={err} path={path} required={f.required} />
  }
}

function Bilingual({ f, value, onChange, path, err, title, help, compact }: { f: FieldDef; value: L | undefined; onChange: (v: L) => void; path: string; err?: string; title: string; help?: string; compact?: boolean }) {
  const v = value ?? { bn: '', en: '' }
  const C = f.type === 'lt' ? Textarea : Input
  const box = (lang: 'bn' | 'en') => (
    <div className="relative">
      <span className="pointer-events-none absolute right-3 top-2.5 rounded bg-canvas px-1.5 text-[11px] font-semibold text-soft">{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
      <C id={`${path}.${lang}`} aria-label={`${title} — ${lang === 'bn' ? 'Bangla' : 'English'}`} aria-invalid={!!err} lang={lang} className="pr-14" value={v[lang] ?? ''} onChange={(e: { target: { value: string } }) => onChange({ ...v, [lang]: e.target.value })} />
    </div>
  )
  if (compact) return <div className="grid gap-2 sm:grid-cols-2">{box('bn')}{box('en')}</div>
  return <Field label={title} help={help} error={err} required={f.required}><div className="grid gap-2 sm:grid-cols-2">{box('bn')}{box('en')}</div></Field>
}

function ListOf<T>({ title, help, err, items, onChange, make, render }: { title: string; help?: string; err?: string; items: T[]; onChange: (v: T[]) => void; make: () => T; render: (it: T, set: (v: T) => void, i: number) => React.ReactNode }) {
  const { t } = useLang()
  const move = (i: number, d: number) => { const n = [...items]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); onChange(n) }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between"><p className="text-[14px] font-medium">{title} <span className="text-soft">· {items.length}</span></p></div>
      {help && <p className="text-[13px] text-soft">{help}</p>}
      {err && <p role="alert" className="text-[13px] text-bad">{err}</p>}
      <ol className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 rounded-[14px] border border-line bg-white p-3">
            <div className="min-w-0 flex-1">{render(it, (v) => onChange(items.map((x, j) => (j === i ? v : x))), i)}</div>
            <div className="flex shrink-0 flex-col">
              <IconButton label={t({ bn: 'উপরে', en: 'Move up' })} disabled={i === 0} onClick={() => move(i, -1)} className="size-8"><ArrowUp className="size-4" /></IconButton>
              <IconButton label={t({ bn: 'নিচে', en: 'Move down' })} disabled={i === items.length - 1} onClick={() => move(i, 1)} className="size-8"><ArrowDown className="size-4" /></IconButton>
              <IconButton label={t({ bn: 'মুছুন', en: 'Remove' })} onClick={() => onChange(items.filter((_, j) => j !== i))} className="size-8 text-bad"><Trash2 className="size-4" /></IconButton>
            </div>
          </li>
        ))}
      </ol>
      <Button size="sm" onClick={() => onChange([...items, make()])}><Plus className="size-4" />{t({ bn: 'যোগ করুন', en: 'Add' })}</Button>
    </div>
  )
}

type Block = { h?: L } | { p?: L } | { list?: L[] }
function Blocks({ title, value, onChange, path, errors }: { title: string; value: Block[]; onChange: (v: Block[]) => void; path: string; errors: Errors }) {
  const { t } = useLang()
  const kind = (b: Block) => ('h' in b ? 'h' : 'list' in b ? 'list' : 'p') as 'h' | 'p' | 'list'
  const names = { h: { bn: 'হেডিং', en: 'Heading' }, p: { bn: 'প্যারাগ্রাফ', en: 'Paragraph' }, list: { bn: 'তালিকা', en: 'List' } }
  return (
    <ListOf title={title} items={value} onChange={onChange} make={() => ({ p: { bn: '', en: '' } })} err={errors[path]}
      render={(b, set, i) => {
        const k = kind(b)
        return (
          <div className="space-y-2">
            <div className="flex gap-1">{(['h', 'p', 'list'] as const).map((x) => <button key={x} type="button" onClick={() => x !== k && set(x === 'list' ? { list: [] } : ({ [x]: { bn: '', en: '' } } as Block))} className={clsx('h-8 cursor-pointer rounded-full px-3 text-[13px]', x === k ? 'bg-ink text-white' : 'bg-canvas text-soft')}>{t(names[x])}</button>)}</div>
            {k === 'list'
              ? <FieldInput f={{ name: 'items', type: 'llist' }} value={(b as { list: L[] }).list} onChange={(v) => set({ list: v as L[] })} path={`${path}.${i}.list`} errors={errors} />
              : <FieldInput f={{ name: k === 'h' ? 'heading' : 'text', type: k === 'h' ? 'l' : 'lt', required: true }} value={(b as Record<string, L>)[k]} onChange={(v) => set({ [k]: v } as Block)} path={`${path}.${i}.${k}`} errors={errors} />}
          </div>
        )
      }} />
  )
}

function JsonField({ title, help, value, onChange, err, path, required }: { title: string; help?: string; value: unknown; onChange: (v: unknown) => void; err?: string; path: string; required?: boolean }) {
  const { t } = useLang()
  const [text, setText] = useState(() => (value == null ? '' : JSON.stringify(value, null, 2)))
  const [bad, setBad] = useState<string | null>(null)
  return (
    <Field label={title} required={required} error={bad ?? err} help={help ?? t({ bn: 'উন্নত: JSON ফরম্যাটে। ভুল হলে সেভ হবে না।', en: 'Advanced: JSON. It will not save while invalid.' })} htmlFor={path}>
      <Textarea id={path} rows={8} spellCheck={false} className="font-mono text-[13px]" value={text}
        onChange={(e) => { setText(e.target.value); if (e.target.value.trim() === '') { setBad(null); onChange(null); return } try { onChange(JSON.parse(e.target.value)); setBad(null) } catch { setBad(t({ bn: 'JSON ঠিক নেই', en: 'This is not valid JSON' })) } }} />
    </Field>
  )
}
