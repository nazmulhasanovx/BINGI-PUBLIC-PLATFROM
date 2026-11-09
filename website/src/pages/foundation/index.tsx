// BinGi design foundation — mirrors the 21st.dev Theme Editor pattern:
// left = preset + token groups, right = live components rendered with those tokens.
// Numbers in the preview are SAMPLE DATA for showing the theme, not product claims.
import { useEffect, useState } from 'react'
import { Check, Copy, Minus, Plus } from 'lucide-react'
import themeCss from '../../styles/bingi-theme.css?raw'

type Preset = 'pearl' | 'bay'
type Tab = 'colors' | 'type' | 'radius' | 'shadow'

const groups: { name: string; rows: [string, string?][] }[] = [
  { name: 'Primary', rows: [['primary', 'primary-foreground']] },
  { name: 'Secondary', rows: [['secondary', 'secondary-foreground']] },
  { name: 'Accent', rows: [['accent', 'accent-foreground']] },
  { name: 'Base', rows: [['background', 'foreground']] },
  { name: 'Card', rows: [['card', 'card-foreground']] },
  { name: 'Muted', rows: [['muted', 'muted-foreground']] },
  { name: 'Destructive', rows: [['destructive', 'destructive-foreground']] },
  { name: 'Border & input', rows: [['border'], ['input'], ['ring']] },
  { name: 'Chart', rows: [['chart-1'], ['chart-2'], ['chart-3'], ['chart-4'], ['chart-5']] },
]

function useVar(name: string, scope: HTMLElement | null, dep: unknown) {
  const [v, setV] = useState('')
  useEffect(() => { if (scope) setV(getComputedStyle(scope).getPropertyValue(`--${name}`).trim().toUpperCase()) }, [name, scope, dep])
  return v
}

function Swatch({ name, scope, dep }: { name: string; scope: HTMLElement | null; dep: unknown }) {
  const v = useVar(name, scope, dep)
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 h-10 border border-border">
      <span className="text-[13px] text-foreground">{name}</span>
      <span className="flex items-center gap-2 text-[12px] text-muted-foreground tabular-nums">{v}<span className="size-5 rounded-md border border-border" style={{ background: v || `var(--${name})` }} /></span>
    </div>
  )
}

function Spark({ color = 'var(--chart-1)', fill = false, points }: { color?: string; fill?: boolean; points: number[] }) {
  const w = 300, h = 80, max = Math.max(...points), min = Math.min(...points)
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - 8 - ((p - min) / (max - min || 1)) * (h - 16)])
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" aria-hidden="true">
      {fill && <path d={`${d} L${w},${h} L0,${h} Z`} fill={color} opacity="0.1" />}
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {!fill && xy.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill={color} />)}
    </svg>
  )
}

const sample = <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Sample data</span>

function Preview() {
  const [target, setTarget] = useState(80)
  const [plan, setPlan] = useState<'starter' | 'business'>('business')
  const [n1, setN1] = useState(true)
  const [n2, setN2] = useState(false)
  const bars = [62, 70, 55, 74, 68, 81, 77, 85, 79, 72, 88, 92]
  return (
    <div className="space-y-10 text-foreground">
      <section>
        <h2 className="text-[13px] font-medium text-muted-foreground mb-3">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-[0_var(--shadow-offset-y)_var(--shadow-blur)_var(--shadow-spread)_rgb(11_34_53/0.08)]">
            <div className="flex justify-between"><p className="text-[14px] text-muted-foreground">Room revenue this month</p>{sample}</div>
            <p className="mt-1 font-[family-name:var(--font-display)] text-[30px] font-semibold tracking-[-0.02em]">৳4,82,350</p>
            <p className="text-[13px] text-muted-foreground">+12.4% from last month</p>
            <Spark points={[30, 38, 34, 42, 40, 48, 52]} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex justify-between"><p className="text-[14px] text-muted-foreground">Bookings this week</p>{sample}</div>
            <p className="mt-1 font-[family-name:var(--font-display)] text-[30px] font-semibold tracking-[-0.02em]">+186</p>
            <p className="text-[13px] text-muted-foreground">Website 74 · Marketplace 61 · Walk-in 51</p>
            <Spark fill color="var(--chart-2)" points={[20, 24, 26, 30, 34, 38, 44]} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-[16px] font-semibold">Occupancy target</p>
            <p className="text-[14px] text-muted-foreground">Set the monthly goal for your property.</p>
            <div className="mt-4 flex items-center justify-center gap-6">
              <button onClick={() => setTarget(Math.max(10, target - 5))} aria-label="Lower target" className="grid size-9 place-items-center rounded-full border border-input cursor-pointer hover:bg-accent"><Minus className="size-4" /></button>
              <div className="text-center"><p className="font-[family-name:var(--font-display)] text-[44px] font-semibold leading-none tabular-nums">{target}%</p><p className="text-[12px] text-muted-foreground mt-1">Occupancy</p></div>
              <button onClick={() => setTarget(Math.min(100, target + 5))} aria-label="Raise target" className="grid size-9 place-items-center rounded-full border border-input cursor-pointer hover:bg-accent"><Plus className="size-4" /></button>
            </div>
            <div className="mt-4 flex h-20 items-end gap-1.5" aria-hidden="true">
              {bars.map((b, i) => <span key={i} className="flex-1 rounded-t-[4px] bg-chart-1 transition-[height] duration-500" style={{ height: `${Math.min(100, (b / target) * 80)}%`, opacity: b >= target ? 1 : 0.45 }} />)}
            </div>
            <button className="mt-4 w-full h-10 rounded-lg bg-primary text-primary-foreground text-[14px] font-medium cursor-pointer">Save target</button>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex justify-between"><p className="text-[16px] font-semibold">Check-ins by day</p>{sample}</div>
            <p className="text-[14px] text-muted-foreground">This week compared with last week.</p>
            <Spark points={[12, 15, 9, 22, 14, 17, 11]} />
            <Spark color="var(--chart-5)" points={[10, 12, 13, 12, 11, 13, 12]} />
            <div className="flex gap-4 text-[12px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-1" />This week</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-5" />Last week</span></div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[13px] font-medium text-muted-foreground mb-3">Forms</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <form className="rounded-xl border border-border bg-card p-5 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div><p className="text-[18px] font-semibold">Change your plan</p><p className="text-[14px] text-muted-foreground">You are on Starter. Business adds housekeeping and restaurant.</p></div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[13px] font-medium">Property name<input className="mt-1 w-full h-10 rounded-lg border border-input bg-card px-3 text-[14px] focus:outline-2 focus:outline-ring" defaultValue="Azure Bay Grand Resort" /></label>
              <label className="block text-[13px] font-medium">Rooms<input className="mt-1 w-full h-10 rounded-lg border border-input bg-card px-3 text-[14px] focus:outline-2 focus:outline-ring" defaultValue="24" inputMode="numeric" /></label>
            </div>
            <fieldset><legend className="text-[13px] font-medium">Plan</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {([['starter', 'Starter', '৳30 per room'], ['business', 'Business', '৳50 per room']] as const).map(([id, name, price]) => (
                  <label key={id} className={`flex gap-2 rounded-lg border p-3 cursor-pointer ${plan === id ? 'border-primary bg-accent' : 'border-input'}`}>
                    <input type="radio" name="plan" checked={plan === id} onChange={() => setPlan(id)} className="mt-1 accent-[var(--primary)]" />
                    <span><span className="block text-[14px] font-medium">{name}</span><span className="text-[12px] text-muted-foreground">{price} / month</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]" />Send me the invoice by email</label>
            <div className="flex justify-between"><button type="button" className="h-10 px-4 rounded-lg border border-input text-[14px] cursor-pointer">Cancel</button><button className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-[14px] font-medium cursor-pointer">Change plan</button></div>
          </form>
          <div className="space-y-4">
            <form className="rounded-xl border border-border bg-card p-5 space-y-3" onSubmit={(e) => e.preventDefault()}>
              <p className="text-[18px] font-semibold">Create your account</p>
              <button type="button" className="w-full h-10 rounded-lg border border-input text-[14px] cursor-pointer">Continue with Google</button>
              <p className="text-center text-[12px] text-muted-foreground">or use your phone number</p>
              <label className="block text-[13px] font-medium">Phone<input className="mt-1 w-full h-10 rounded-lg border border-input bg-card px-3 text-[14px] focus:outline-2 focus:outline-ring" placeholder="01XXXXXXXXX" inputMode="tel" /></label>
              <label className="block text-[13px] font-medium">Password<input type="password" className="mt-1 w-full h-10 rounded-lg border border-input bg-card px-3 text-[14px] focus:outline-2 focus:outline-ring" /></label>
              <button className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-[14px] font-medium cursor-pointer">Create account</button>
            </form>
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-[18px] font-semibold">Guest messages</p>
              {([['Booking confirmation', 'SMS when a booking is confirmed.', n1, setN1], ['Check-out reminder', 'SMS on the morning of check-out.', n2, setN2]] as const).map(([t, d, on, set]) => (
                <div key={t} className="flex items-start justify-between gap-4">
                  <div><p className="text-[14px] font-medium">{t}</p><p className="text-[13px] text-muted-foreground">{d}</p></div>
                  <button role="switch" aria-checked={on} aria-label={t} onClick={() => set(!on)} className={`relative h-6 w-11 shrink-0 rounded-full cursor-pointer transition-colors duration-300 ${on ? 'bg-secondary' : 'bg-muted border border-input'}`}>
                    <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] duration-300 [transition-timing-function:var(--ease-spring)] ${on ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[13px] font-medium text-muted-foreground mb-3">Team</h2>
        <div className="rounded-xl border border-border bg-card p-5 md:max-w-[50%]">
          <p className="text-[18px] font-semibold">Staff</p><p className="text-[14px] text-muted-foreground">Invite your team and set what they can see.</p>
          <ul className="mt-4 space-y-3">
            {[['Rafiq Ahmed', 'Front desk'], ['Nusrat Jahan', 'Housekeeping'], ['Tanvir Hasan', 'Owner']].map(([n, r]) => (
              <li key={n} className="flex items-center justify-between"><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-muted text-[13px] font-semibold">{n[0]}</span><span className="text-[14px] font-medium">{n}</span></span><span className="rounded-lg border border-input px-3 py-1 text-[13px]">{r}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-[13px] font-medium text-muted-foreground mb-3">Pricing</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {([['Starter', '৳30', 'Rooms, bookings, website', false], ['Business', '৳50', 'Adds housekeeping, restaurant, QR orders', true], ['Ultra', '৳116', 'Adds full HRM, inventory, advanced ops', false]] as const).map(([n, p, d, pop]) => (
            <div key={n} className={`rounded-xl p-5 ${pop ? 'bg-muted' : 'border border-border bg-card'}`}>
              <p className="text-[18px] font-semibold flex items-center gap-2">{n}{pop && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">Most popular</span>}</p>
              <p className="text-[14px] text-muted-foreground">{d}</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-[32px] font-semibold">{p}<span className="text-[14px] font-normal text-muted-foreground"> /room/month</span></p>
              <button className={`mt-3 w-full h-10 rounded-full text-[14px] font-medium cursor-pointer ${pop ? 'bg-primary text-primary-foreground' : 'border border-input'}`}>Choose {n}</button>
              <ul className="mt-4 space-y-2 text-[13px]">{['Room inventory', 'Online & offline bookings', 'Website management'].map((x) => <li key={x} className="flex gap-2"><Check className="size-4 text-primary" aria-hidden="true" />{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function Foundation() {
  const [preset, setPreset] = useState<Preset>('pearl')
  const [tab, setTab] = useState<Tab>('colors')
  const [scope, setScope] = useState<HTMLDivElement | null>(null)
  const [copied, setCopied] = useState(false)
  const copy = async () => { try { await navigator.clipboard.writeText(themeCss); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* clipboard blocked */ } }

  return (
    <div className="container-x pt-10">
      <div className="max-w-[640px]">
        <h1 className="h2">BinGi design foundation</h1>
        <p className="lead mt-2">The tokens behind every BinGi screen, in the shadcn / 21st.dev theme format. Switch the preset to see each component in light and dark.</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr] items-start">
        <aside className="lg:sticky lg:top-20 rounded-2xl border border-border bg-muted/50 p-4 space-y-4">
          <label className="block text-[13px] font-medium">Preset
            <select value={preset} onChange={(e) => setPreset(e.target.value as Preset)} className="mt-1 w-full h-10 rounded-lg border border-input bg-white px-3 text-[14px] cursor-pointer">
              <option value="pearl">BinGi Pearl (light)</option>
              <option value="bay">BinGi Bay (dark)</option>
            </select>
          </label>
          <div role="tablist" aria-label="Token groups" className="grid grid-cols-4 gap-1 rounded-lg bg-white p-1 border border-border">
            {(['colors', 'type', 'radius', 'shadow'] as Tab[]).map((x) => (
              <button key={x} role="tab" aria-selected={tab === x} onClick={() => setTab(x)} className={`h-8 rounded-md text-[12px] font-medium capitalize cursor-pointer ${tab === x ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>{x}</button>
            ))}
          </div>
          {tab === 'colors' && groups.map((g) => (
            <div key={g.name}>
              <p className="text-[13px] font-semibold mb-1.5">{g.name}</p>
              <div className="space-y-1.5">{g.rows.flatMap(([a, b]) => [a, b].filter(Boolean) as string[]).map((n) => <Swatch key={n} name={n} scope={scope} dep={preset} />)}</div>
            </div>
          ))}
          {tab === 'type' && (
            <div className="space-y-3 text-[14px]">
              <div className="rounded-lg bg-white border border-border p-3"><p className="text-[12px] text-muted-foreground">Display — Bricolage Grotesque</p><p className="font-[family-name:var(--font-display)] text-[28px] font-semibold tracking-[-0.03em]">Your team runs the hotel.</p></div>
              <div className="rounded-lg bg-white border border-border p-3"><p className="text-[12px] text-muted-foreground">Text — Instrument Sans</p><p>Website, bookings and accounts in one connected system.</p></div>
              <div className="rounded-lg bg-white border border-border p-3"><p className="text-[12px] text-muted-foreground">বাংলা — Hind Siliguri</p><p lang="bn">আপনার টিম হোটেল চালায়।</p></div>
              <p className="text-[12px] text-muted-foreground">Scale: 76 · 48 · 30 · 22 · 19 · 17 · 15 · 13 px</p>
            </div>
          )}
          {tab === 'radius' && (
            <div className="grid grid-cols-2 gap-2">{[['sm', 'var(--radius-sm)'], ['md', 'var(--radius-md)'], ['lg', 'var(--radius-lg)'], ['xl', 'var(--radius-xl)']].map(([n, v]) => <div key={n} className="h-16 bg-white border border-input grid place-items-center text-[12px]" style={{ borderRadius: v }}>{n}</div>)}<p className="col-span-2 text-[12px] text-muted-foreground">--radius: 0.75rem (12px). Cards 18px, buttons pill.</p></div>
          )}
          {tab === 'shadow' && (
            <div className="space-y-3">{[['soft', 'var(--shadow-soft)'], ['lift', 'var(--shadow-lift)'], ['glow', 'var(--shadow-glow)'], ['device', 'var(--shadow-device)']].map(([n, v]) => <div key={n} className="h-14 rounded-xl bg-white grid place-items-center text-[12px]" style={{ boxShadow: v }}>{n}</div>)}</div>
          )}
          <button onClick={copy} className="w-full h-10 rounded-lg bg-foreground text-background text-[14px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? 'Copied' : 'Copy theme CSS'}
          </button>
          <p className="text-[12px] text-muted-foreground">Paste into 21st.dev Theme Editor or any shadcn app.</p>
        </aside>
        <div ref={setScope} className={`${preset === 'bay' ? 'dark' : ''} rounded-2xl border border-border bg-background p-5 md:p-8 transition-colors duration-500`}>
          <Preview />
        </div>
      </div>
    </div>
  )
}
