import React from 'react';
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/fonts';
import {
  BedDouble, Bell, Boxes, Brush, CalendarDays, CalendarCheck, ChefHat, ClipboardCheck, Globe, HelpCircle, LayoutGrid,
  Lock, MessageSquare, Monitor, PackageOpen, QrCode, Receipt, Search, Settings, Tag, UserCog, Users, UtensilsCrossed,
  Wallet, BarChart3, Megaphone, CircleDollarSign, Check, Briefcase, ChevronDown, Building2,
} from 'lucide-react';

// HMS dashboard per plan — 1:1 from Nazmul's design (Group_1/2/3, 836×471, 10 Nov 2026).
// Sample data from the design. Logical canvas = 836×471, rendered sharp at any size.
export const ROBOTO = 'Roboto';
export const robotoReady = Promise.all(
  ['400', '500', '700'].map((w) => loadFont({ family: ROBOTO, url: staticFile(`fonts/roboto-latin-${w}-normal.woff2`), weight: w })),
);

export type Plan = 'starter' | 'business' | 'ultra';
const ORDER: Plan[] = ['starter', 'business', 'ultra'];
export const SEG = 150; // 5 s per plan

const K = {
  ink: '#1D1B24', muted: '#6B6878', line: '#DFDBF2', card: '#FCFBFF', head: '#F0ECF6', red: '#F32735', redSoft: '#FDE3E5',
  purple: '#7041FF', green: '#2F9A47', greenSoft: '#DEFAE7', peach: '#FFF0E6', lav: '#EEE9FF', yellow: '#FFF6D1', mint: '#E1F9ED',
};
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ── sidebar model (union of all plans)
type Item = { label: string; icon: React.ReactNode; on: Plan[]; locked?: Plan[]; badge?: { kind: 'count' | 'dot' | 'new'; text?: string; on?: Plan[] }; active?: boolean };
type Group = { title: Record<Plan, string>; on: Plan[]; items: Item[] };
const I = (C: typeof Bell) => <C size={11} strokeWidth={1.8} />;
const ALL: Plan[] = ['starter', 'business', 'ultra'];
const BU: Plan[] = ['business', 'ultra'];
const groups: Group[] = [
  { title: { starter: 'DAILY OPERATIONS', business: 'DAILY OPERATIONS', ultra: 'DAILY OPERATIONS' }, on: ALL, items: [
    { label: 'Dashboard', icon: I(LayoutGrid), on: ALL, active: true },
    { label: 'Bookings', icon: I(CalendarDays), on: ALL, badge: { kind: 'count', text: '4' } },
    { label: 'Rooms', icon: I(BedDouble), on: ALL },
    { label: 'Housekeeping', icon: I(Brush), on: BU, badge: { kind: 'dot' } },
    { label: 'Guests', icon: I(Users), on: ALL },
    { label: 'Chat', icon: I(MessageSquare), on: BU, badge: { kind: 'count', text: '12' } },
    { label: 'Meals', icon: I(UtensilsCrossed), on: BU },
  ] },
  { title: { starter: 'PROPERTY & TEAM', business: 'PROPERTY & TEAM', ultra: 'PROPERTY & TEAM' }, on: BU, items: [
    { label: 'Staff', icon: I(UserCog), on: BU, locked: ['business'] },
    { label: 'Inventory', icon: I(Boxes), on: BU, locked: ['business'] },
    { label: 'Other Services', icon: I(Briefcase), on: BU },
  ] },
  { title: { starter: 'MONEY & PRICING', business: 'MONEY & PRICING', ultra: 'MONEY & PRICING' }, on: ALL, items: [
    { label: 'Discounts & Rates', icon: I(Tag), on: ALL },
    { label: 'Payments', icon: I(CircleDollarSign), on: ALL },
    { label: 'Cashbox', icon: I(Wallet), on: BU, badge: { kind: 'new', text: 'New' } },
    { label: 'Finance', icon: I(Receipt), on: BU },
  ] },
  { title: { starter: 'ONLINE', business: 'REPORTS & ONLINE', ultra: 'REPORTS & ONLINE' }, on: ALL, items: [
    { label: 'Reports', icon: I(BarChart3), on: BU },
    { label: 'Communication Center', icon: I(Megaphone), on: BU, locked: ['business'] },
    { label: 'Website Management', icon: I(Globe), on: ALL, badge: { kind: 'dot', on: ['starter'] } },
  ] },
];

// presence 0..1 of something that exists on the given plans, between plan a → b at progress t
const pres = (on: Plan[], a: Plan, b: Plan, t: number) => lerp(on.includes(a) ? 1 : 0, on.includes(b) ? 1 : 0, t);

const Chip: React.FC<{ children: React.ReactNode; bg?: string; fg?: string }> = ({ children, bg = K.greenSoft, fg = K.green }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: bg, color: fg, fontSize: 7.5, fontWeight: 700, padding: '2.5px 6px', borderRadius: 5 }}>{children}</span>
);
const DarkBtn: React.FC<{ children: React.ReactNode; w?: number }> = ({ children, w = 99 }) => (
  <div style={{ width: w, height: 24, borderRadius: 6, background: '#0E0D12', color: '#fff', fontSize: 9, fontWeight: 500, display: 'grid', placeItems: 'center' }}>{children}</div>
);
const OutBtn: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ height: 21, borderRadius: 6, border: `1px solid #BDB8CC`, background: '#fff', fontSize: 8.5, fontWeight: 500, display: 'grid', placeItems: 'center', padding: '0 8px', ...style }}>{children}</div>
);
const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: 'absolute', background: K.card, border: `1px solid ${K.line}`, borderRadius: 8, ...style }}>{children}</div>
);

// ── panels that differ per plan
function Hero({ plan, fill }: { plan: Plan; fill: number }) {
  const iconBox = (icon: React.ReactNode) => (
    <div style={{ position: 'absolute', left: 9, top: 9, width: 80, height: 88, borderRadius: 8, background: K.peach, display: 'grid', placeItems: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: 9, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.06)' }}>{icon}</div>
    </div>
  );
  const bar = (p: number, label: string) => (
    <>
      <div style={{ marginTop: 9, width: 218, height: 5, borderRadius: 9, background: '#E6E2F3' }}><div style={{ width: `${p * 100 * fill}%`, height: 5, borderRadius: 9, background: K.purple }} /></div>
      <div style={{ marginTop: 4, fontSize: 7.5, color: K.muted }}>{label}</div>
    </>
  );
  return (
    <>
      {plan === 'starter' && iconBox(<CalendarDays size={18} color={K.red} strokeWidth={1.8} />)}
      {plan === 'business' && iconBox(<Brush size={18} color={K.green} strokeWidth={1.8} />)}
      {plan === 'ultra' && iconBox(<ClipboardCheck size={18} color={K.green} strokeWidth={1.8} />)}
      <div style={{ position: 'absolute', left: 98, top: 20, right: 0 }}>
        {plan === 'starter' && (<><div style={{ fontSize: 13, fontWeight: 700 }}>Today’s bookings</div><div style={{ fontSize: 8.5, marginTop: 3 }}>4 arrivals · 2 departures</div>{bar(4 / 6, '4 of 6 bookings today')}</>)}
        {plan === 'business' && (<><div style={{ fontSize: 13, fontWeight: 700 }}>Prepare arriving rooms</div><div style={{ fontSize: 8.5, marginTop: 3 }}>4 ready · 2 need cleaning</div>{bar(4 / 6, '4 of 6 available ready')}</>)}
        {plan === 'ultra' && (<>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: -6 }}>Today’s priorities</div>
          {[[BedDouble, '2 rooms need cleaning'], [QrCode, '2 QR orders waiting'], [Users, '3 attendance exceptions']].map(([C, t], i) => {
            const Ic = C as typeof Bell
            return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 9, width: 218, padding: '5.5px 0', borderTop: i ? `1px solid ${K.line}` : 'none', marginTop: i ? 0 : 3, opacity: fill > i / 3 ? 1 : 0.3 }}><Ic size={11} color="#6B6878" strokeWidth={1.6} />{t as string}</div>
          })}
        </>)}
      </div>
      <div style={{ position: 'absolute', left: 328, top: 41 }}>
        <DarkBtn>{plan === 'starter' ? 'View bookings' : plan === 'business' ? 'Open housekeeping' : 'Open tasks'}</DarkBtn>
      </div>
    </>
  );
}

function RightTop({ plan }: { plan: Plan }) {
  if (plan === 'starter') return (
    <div style={{ padding: '7px 11px' }}>
      <div style={{ fontSize: 11.5, fontWeight: 700 }}>Booking sources</div>
      <div style={{ marginTop: 4 }}><Chip><Check size={8} strokeWidth={3} />This month</Chip></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 6 }}>
        {[['Walk-in', 8], ['Website', 3], ['Marketplace', 1]].map(([l, v], i) => (
          <div key={l as string} style={{ borderLeft: i ? `1px solid ${K.line}` : 'none', paddingLeft: i ? 10 : 0, textAlign: i === 2 ? 'right' : 'left' }}>
            <div style={{ fontSize: 7.5, color: K.muted }}>{l as string}</div><div style={{ fontSize: 13, fontWeight: 700 }}>{v as number}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 7.5, fontWeight: 700, marginTop: 6 }}>Website commission</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, marginTop: 3 }}><span>Marketplace&nbsp; 12%</span><span>Web booking&nbsp; 1.5%</span><span>Walk-in&nbsp; 0%</span></div>
      <div style={{ borderTop: `1px solid ${K.line}`, marginTop: 7, paddingTop: 6, fontSize: 7.5, color: K.muted, display: 'flex', alignItems: 'center', gap: 5 }}><Monitor size={9} />Limited themes</div>
    </div>
  );
  const f = plan === 'business' ? ['8%', '1%', '0%'] : ['4%', '0.5%', '0%'];
  return (
    <div style={{ padding: '7px 11px' }}>
      <div style={{ fontSize: 11.5, fontWeight: 700 }}>Website & booking</div>
      <div style={{ display: 'flex', gap: 5, marginTop: 4 }}><Chip><Check size={8} strokeWidth={3} />Published</Chip><Chip><Check size={8} strokeWidth={3} />Domain connected</Chip></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 7 }}>
        {['Marketplace', 'Web booking', 'Walk-in'].map((l, i) => (
          <div key={l} style={{ borderLeft: i ? `1px solid ${K.line}` : 'none', paddingLeft: i ? 10 : 0, textAlign: i === 2 ? 'right' : 'left' }}>
            <div style={{ fontSize: 7.5, color: K.muted }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700 }}>{f[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <span style={{ fontSize: 7.5, color: K.muted, display: 'flex', alignItems: 'center', gap: 5 }}><Monitor size={9} />{plan === 'ultra' ? 'All themes' : 'Limited themes'}</span>
        <OutBtn style={{ width: 80 }}>Manage website</OutBtn>
      </div>
    </div>
  );
}

function RightBottom({ plan }: { plan: Plan }) {
  const rows: [typeof Bell, string, string][] = plan === 'business'
    ? [[UtensilsCrossed, 'QR orders waiting', '2'], [ChefHat, 'Orders in kitchen', '6'], [PackageOpen, 'Menu items', '20']]
    : [[Users, 'Staff on duty', '18'], [Boxes, 'Low stock', '3 items'], [UtensilsCrossed, 'Menu items', '500']];
  return (
    <div style={{ padding: '9px 10px' }}>
      <div style={{ fontSize: 12, fontWeight: 700 }}>{plan === 'business' ? 'Restaurant today' : 'Team & inventory'}</div>
      {rows.map(([C, l, v], i) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 0', borderTop: i ? `1px solid ${K.line}` : 'none', marginTop: i ? 0 : 7 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#FFF2E6', display: 'grid', placeItems: 'center' }}><C size={11} color="#C26A1E" strokeWidth={1.8} /></div>
          <span style={{ flex: 1, fontSize: 8.5 }}>{l}</span><span style={{ fontSize: 12, fontWeight: 700 }}>{v}</span>
        </div>
      ))}
      <OutBtn style={{ marginTop: 8, height: 22 }}>{plan === 'business' ? 'Open meals' : 'View operations'}</OutBtn>
    </div>
  );
}

// ── full dashboard; `plans` forces a single plan (no cycling) for per-plan clips
export const PlanDashboard: React.FC<{ only?: Plan }> = ({ only }) => {
  const f = useCurrentFrame();
  const seg = Math.floor(f / SEG) % 3, local = f % SEG;
  const cur: Plan = only ?? ORDER[seg];
  const prev: Plan = only ?? ORDER[(seg + 2) % 3];
  const t = only ? 1 : interpolate(local, [0, 26], [0, 1], { ...cl, easing: ease });
  const fill = interpolate(local, [16, 70], [0, 1], { ...cl, easing: ease });
  const swap = (a: React.ReactNode, b: React.ReactNode) => (
    <>
      {t < 1 && <div style={{ position: 'absolute', inset: 0, opacity: 1 - t, filter: `blur(${t * 4}px)` }}>{a}</div>}
      <div style={{ position: 'absolute', inset: 0, opacity: t, translate: `0 ${(1 - t) * 6}px`, filter: `blur(${(1 - t) * 4}px)` }}>{b}</div>
    </>
  );
  const rbP = pres(BU, prev, cur, t);
  const upsell = pres(['starter'], prev, cur, t);
  const rightTopH = lerp(prev === 'starter' ? 130 : 106, cur === 'starter' ? 130 : 106, t);

  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <div style={{ zoom: 1600 / 836, width: 836, height: 471, position: 'relative', fontFamily: ROBOTO, color: K.ink, background: '#fff', overflow: 'hidden' }}>
        {/* sidebar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 136, borderRight: `1px solid ${K.line}`, background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 0 0 15px' }}>
            <img src={staticFile('bingi-logo.png')} style={{ height: 17 }} />
          </div>
          <div style={{ position: 'absolute', top: 38, left: 9, right: 8 }}>
            {groups.map((g) => {
              const gp = pres(g.on, prev, cur, t);
              const title = t < 0.5 ? g.title[prev] : g.title[cur];
              return (
                <div key={g.title.ultra} style={{ height: undefined, overflow: 'hidden', opacity: gp, maxHeight: gp * 200 }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: '#45424F', padding: '3px 4px 3px', letterSpacing: 0.2 }}>{title}</div>
                  {g.items.map((it) => {
                    const p = pres(it.on, prev, cur, t);
                    const lock = it.locked ? pres(it.locked, prev, cur, t) : 0;
                    const badgeOn = it.badge && (it.badge.on ? pres(it.badge.on, prev, cur, t) : 1);
                    return (
                      <div key={it.label} style={{ height: 16.6 * p, opacity: p, overflow: 'hidden' }}>
                        <div style={{ height: 15.6, display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px', borderRadius: 4, background: it.active ? K.red : 'transparent', color: it.active ? '#fff' : lerp(1, 0.45, lock) < 1 ? `rgba(29,27,36,${lerp(1, 0.42, lock)})` : K.ink, fontSize: 8.6, fontWeight: it.active ? 500 : 400 }}>
                          {it.icon}<span style={{ flex: 1, whiteSpace: 'nowrap' }}>{it.label}</span>
                          {lock > 0.01 && <Lock size={8} style={{ opacity: lock }} color="#8F8BA0" />}
                          {it.badge?.kind === 'count' && <span style={{ minWidth: 13, height: 11, borderRadius: 99, background: K.red, color: '#fff', fontSize: 7, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{it.badge.text}</span>}
                          {it.badge?.kind === 'dot' && <span style={{ width: 4, height: 4, borderRadius: 99, background: K.red, opacity: badgeOn }} />}
                          {it.badge?.kind === 'new' && <span style={{ fontSize: 6.8, fontWeight: 700, color: '#fff', background: '#7B5CFA', borderRadius: 99, padding: '1.5px 5px' }}>New</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ height: 4 }} />
                </div>
              );
            })}
            {/* Starter upsell card */}
            <div style={{ overflow: 'hidden', maxHeight: upsell * 80, opacity: upsell, marginTop: 6 * upsell }}>
              <div style={{ borderRadius: 7, padding: '9px 9px', background: 'linear-gradient(140deg,#E8304D,#A3123A)', color: '#fff' }}>
                <div style={{ fontSize: 10, fontWeight: 700 }}>Need more tools?</div>
                <div style={{ fontSize: 7, opacity: 0.9, marginTop: 2 }}>Unlock full hotel operations.</div>
                <div style={{ marginTop: 7, height: 19, borderRadius: 5, background: '#fff', color: K.ink, fontSize: 8, fontWeight: 700, display: 'grid', placeItems: 'center' }}>View Business</div>
              </div>
            </div>
          </div>
          {/* bottom */}
          <div style={{ position: 'absolute', left: 9, right: 8, bottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: `1px solid ${K.line}`, paddingTop: 6, fontSize: 7.6 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: K.redSoft, borderRadius: 6, padding: '2px 5px' }}><span style={{ width: 8, height: 8, borderRadius: 99, border: `2.5px solid ${K.red}` }} />Flat</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, border: '1px solid #8F8BA0' }} />Expandable</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8.6, padding: '8px 2px', borderBottom: `1px solid ${K.line}` }}><Settings size={10} />Settings</div>
            <div style={{ position: 'relative', height: 16, marginTop: 4, overflow: 'hidden' }}>
              {(['starter', 'business', 'ultra'] as Plan[]).map((p) => {
                const o = p === cur ? t : p === prev ? 1 - t : 0;
                return o > 0 ? <div key={p} style={{ position: 'absolute', left: 2, top: (p === cur ? 1 - t : -t) * 12, opacity: o, fontSize: 10.5, fontWeight: 700 }}>{p[0].toUpperCase() + p.slice(1)}</div> : null;
              })}
            </div>
          </div>
        </div>

        {/* header */}
        <div style={{ position: 'absolute', left: 137, right: 0, top: 0, height: 34, borderBottom: `1px solid ${K.line}`, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: K.redSoft, display: 'grid', placeItems: 'center' }}><Building2 size={11} color={K.red} /></div>
          <div style={{ marginLeft: 8, lineHeight: 1.15 }}><div style={{ fontSize: 9.5, fontWeight: 700 }}>Azure Bay Resort</div><div style={{ fontSize: 7, color: K.muted }}>Cox's Bazar</div></div>
          <div style={{ marginLeft: 'auto', width: 194, height: 21, borderRadius: 6, background: '#F1EFF6', display: 'flex', alignItems: 'center', gap: 5, padding: '0 8px', fontSize: 7.8, color: K.muted }}><Search size={9} />Search for guest, booking, room...</div>
          <div style={{ marginLeft: 10, height: 21, width: 34, borderRadius: 6, border: `1px solid ${K.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 8, fontWeight: 700 }}>EN<ChevronDown size={7} /></div>
          <div style={{ marginLeft: 8, width: 21, height: 21, borderRadius: 6, border: `1px solid ${K.line}`, display: 'grid', placeItems: 'center' }}><Bell size={10} /></div>
          <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 3, fontSize: 8.5 }}><HelpCircle size={10} />Help</div>
          <div style={{ marginLeft: 12, width: 22, height: 22, borderRadius: 99, background: K.redSoft, color: K.red, fontSize: 8, fontWeight: 700, display: 'grid', placeItems: 'center' }}>RU</div>
        </div>

        {/* greeting */}
        <div style={{ position: 'absolute', left: 150, top: 46, fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>Good morning, Farzana</div>
        <div style={{ position: 'absolute', left: 150, top: 70, fontSize: 8.5, color: K.muted }}>Thursday, 05 Nov 2026</div>
        <div style={{ position: 'absolute', left: 731, top: 55, width: 94, height: 24, borderRadius: 6, background: K.red, color: '#fff', fontSize: 9, fontWeight: 500, display: 'grid', placeItems: 'center' }}>+&nbsp; New Booking</div>

        {/* KPI cards */}
        {([
          [150, K.peach, CalendarCheck, '#E4572E', '4', 'Arriving today', ''],
          [321, K.lav, BedDouble, '#7041FF', '80%', 'Occupancy', '24 of 30 rooms'],
          [488, K.yellow, BedDouble, '#C08A10', '6', 'Available rooms', ''],
          [656, K.mint, CircleDollarSign, K.green, 'BDT 48,000', 'Room revenue today', ''],
        ] as const).map(([x, bg, C, col, v, l, sub], i) => (
          <div key={l} style={{ position: 'absolute', left: x, top: 96, width: i === 3 ? 169 : 164, height: 57, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.75)', display: 'grid', placeItems: 'center' }}><C size={14} color={col} strokeWidth={1.8} /></div>
            <div><div style={{ fontSize: 15, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 8.8, marginTop: 1 }}>{l}</div>{sub && <div style={{ fontSize: 7.4, color: K.muted, marginTop: 1 }}>{sub}</div>}</div>
          </div>
        ))}

        {/* hero card */}
        <Card style={{ left: 150, top: 167, width: 440, height: 106, overflow: 'hidden' }}>
          {swap(<Hero plan={prev} fill={1} />, <Hero plan={cur} fill={only ? fill : t < 1 ? 0 : fill} />)}
        </Card>

        {/* right top card */}
        <Card style={{ left: 602, top: 167, width: 223, height: rightTopH, overflow: 'hidden' }}>
          {swap(<RightTop plan={prev} />, <RightTop plan={cur} />)}
        </Card>

        {/* right bottom card (Business / Ultra) */}
        <Card style={{ left: 610, top: 287, width: 215, height: 154, overflow: 'hidden', opacity: rbP, translate: `0 ${(1 - rbP) * 10}px`, borderRadius: 9 }}>
          {swap(prev === 'starter' ? null : <RightBottom plan={prev} />, cur === 'starter' ? null : <RightBottom plan={cur} />)}
        </Card>

        {/* arriving table */}
        <div style={{ position: 'absolute', left: 150, top: 291, fontSize: 12, fontWeight: 700 }}>Arriving today (4)</div>
        <div style={{ position: 'absolute', left: 559, top: 293, fontSize: 8.5, fontWeight: 700, color: K.red }}>View all</div>
        <div style={{ position: 'absolute', left: 150, top: 313, width: 448, height: 128, border: `1px solid ${K.line}`, borderRadius: 7, overflow: 'hidden', background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '112px 49px 85px 83px 69px 1fr', height: 20, alignItems: 'center', background: K.head, fontSize: 7.5, padding: '0 0 0 15px' }}>
            <span>Guest</span><span>Room</span><span>Stay</span><span>Status</span><span>Due</span><span>Action</span>
          </div>
          {[['MA', 'Mira Ahmed', '101', '05 – 07 Nov', 'BDT 12,000'], ['TI', 'Tanvir Islam', '102', '05 – 06 Nov', 'BDT 0'], ['SN', 'Saba Noor', '103', '05 – 08 Nov', 'BDT 18,000'], ['RK', 'Rafi Karim', '104', '05 – 06 Nov', 'BDT 0']].map(([ini, n, r, s, d], i) => {
            const rp = only ? 1 : f < SEG ? interpolate(f, [8 + i * 6, 26 + i * 6], [0, 1], cl) : 1;
            return (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '112px 49px 85px 83px 69px 1fr', height: 25, alignItems: 'center', fontSize: 8.6, padding: '0 0 0 12px', borderTop: i ? `1px solid ${K.line}` : 'none', opacity: rp }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700 }}><span style={{ width: 18, height: 18, borderRadius: 99, background: K.redSoft, color: K.red, fontSize: 7, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{ini}</span>{n}</span>
                <span>{r}</span><span>{s}</span>
                <span><Chip><Check size={8} strokeWidth={3} />Confirmed</Chip></span>
                <span>{d}</span>
                <span><OutBtn style={{ width: 34, height: 18, fontSize: 7.5 }}>Open</OutBtn></span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
