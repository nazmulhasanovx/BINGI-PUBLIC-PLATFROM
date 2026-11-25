import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/fonts';
import {
  ArrowRight, BedDouble, Boxes, CalendarCheck, CalendarDays, ChefHat, ChevronDown, ChevronRight, ChevronsLeft, ClipboardCheck, Clock,
  CircleDollarSign, CreditCard, FileBarChart, FileText, Globe, Landmark, LayoutGrid, Lock, MessageSquare, Minimize2, Monitor,
  Paintbrush, Plus, QrCode, Bell, Search, Send, Settings, Sparkles, Tag, UserPlus, Users, UsersRound, Wallet, Wallet2, X, Activity, Languages,
  MoreHorizontal, Check,
} from 'lucide-react';

/*
 * HMS dashboard, one per plan — exact views from Nazmul's screenshots (25 Nov 2026, 1920×1080, HMS prototype, demo data).
 * The animation only builds the screen up and ends on that exact view. Marketplace fee shows 7% (decision 25 Nov 2026);
 * everything else is as in the screenshots.
 */
export const JAKARTA = 'Plus Jakarta Sans';
export const planFontsReady = Promise.all([
  loadFont({ family: JAKARTA, url: staticFile('fonts/plus-jakarta-sans-latin-wght-normal.woff2'), weight: '200 800' }),
  loadFont({ family: 'Hind Siliguri', url: staticFile('fonts/hind-siliguri-bengali-400-normal.woff2'), weight: '400' }),
  loadFont({ family: 'Hind Siliguri', url: staticFile('fonts/hind-siliguri-bengali-600-normal.woff2'), weight: '600' }),
]);

export type PlanId = 'ultra' | 'business' | 'starter';
export const PLAN_LEN = 300; // 10 s @ 30 fps

const C = {
  canvas: '#f4f5f7', ink: '#15171c', text: '#2a2e36', muted: '#646b78', soft: '#7b8290', line: '#e6e8ec', red: '#c8232f', redText: '#cb2234',
  green: '#1f8a4c', chipGreen: '#e3f3e8', chipGreenText: '#1f7a45', avatar: '#fde9e6', avatarText: '#c5303c', peach: '#fdefe7', peachIcon: '#d9622b',
};
const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ─────────────────────────────── data (from the screenshots)
type Nav = { kind: 'label'; text: string } | { kind: 'item'; text: string; icon: typeof Bell; badge?: string; lock?: boolean; active?: boolean } | { kind: 'divider' };
const item = (text: string, icon: typeof Bell, extra: { badge?: string; lock?: boolean; active?: boolean } = {}): Nav => ({ kind: 'item', text, icon, ...extra });
const label = (text: string): Nav => ({ kind: 'label', text });

const navFull = (lock: boolean): Nav[] => [
  label('Daily operations'),
  item('Dashboard', LayoutGrid, { active: true }), item('Bookings', CalendarCheck), item('Room / Accommodation', BedDouble), item('Housekeeping', Paintbrush),
  item('Guests', UserPlus), item('Chat', MessageSquare, { badge: '6' }), item('Meals', ChefHat, { badge: '1' }),
  label('Property & team'),
  item('Staff', Users, { lock }), item('Inventory', Boxes, { lock }), item('Other Services', Sparkles),
  label('Money & pricing'),
  item('Discounts & Rates', Tag), item('Payments', CreditCard), item('Cashbox', Wallet), item('Finance', Landmark), item('Expenses', Activity), item('Billing & Subscription', FileText),
  label('Reports & online'),
  item('Reports', FileBarChart), item(lock ? 'Communication Ce...' : 'Communication Center', Send, { lock }), item('Website Management', Globe),
  { kind: 'divider' }, item('Settings', Settings),
];
const navStarter: Nav[] = [
  label('Daily operations'),
  item('Dashboard', LayoutGrid, { active: true }), item('Bookings', CalendarCheck), item('Room / Accommodation', BedDouble), item('Guests', UserPlus), item('Chat', MessageSquare, { badge: '6' }),
  label('Money & pricing'),
  item('Discounts & Rates', Tag), item('Payments', CreditCard), item('Finance', Landmark), item('Billing & Subscription', FileText),
  label('Reports & online'),
  item('Reports', FileBarChart), item('Website Management', Globe),
  { kind: 'divider' }, item('Settings', Settings),
];

type Row = { ini: string; name: string; room: string; type: string; stay: string; pay: string; due: boolean };
type PlanData = {
  plan: string; property: string; bell: string; banner: boolean; nav: Nav[];
  kpi: { arriving: number; occ: number; occSub: string; avail: number; revenue: number };
  priorities: [typeof Bell, string][]; more?: string;
  fees: [string, string, string]; arriving: Row[]; cols: [number, number, number, number, number];
  right: 'team' | 'restaurant' | 'sources';
};

const P: Record<PlanId, PlanData> = {
  ultra: {
    plan: 'Ultra', property: 'Azure Bay Grand...', bell: '13', banner: true, nav: navFull(false),
    kpi: { arriving: 4, occ: 58, occSub: '14 of 24 rooms', avail: 10, revenue: 282095 },
    priorities: [[Wallet2, '2 guests to collect from today'], [Paintbrush, '4 rooms to clean after check-out'], [QrCode, '1 QR order waiting for approval'], [MessageSquare, '6 unread guest messages'], [CircleDollarSign, '2 expenses waiting approval']],
    more: 'Show 2 more',
    fees: ['7%', '0.5%', '0%'],
    arriving: [
      { ini: 'IA', name: 'Imtiaz Ali', room: '101', type: 'Deluxe Garden ...', stay: '10–12 Nov', pay: 'BDT 30,360 due', due: true },
      { ini: 'TH', name: 'Tahmid Hasan', room: '102', type: 'Deluxe Garden ...', stay: '10–13 Nov', pay: 'Paid', due: false },
      { ini: 'JA', name: 'Jannat Ara', room: '103', type: 'Deluxe Garden ...', stay: '10–13 Nov', pay: 'BDT 22,770 due', due: true },
      { ini: 'RU', name: 'Rakib Uddin', room: '104', type: 'Deluxe Garden ...', stay: '10–13 Nov', pay: 'Paid', due: false },
    ],
    cols: [308, 525, 698, 827, 989], right: 'team',
  },
  business: {
    plan: 'Business', property: 'Sea Pearl Hotel', bell: '10', banner: true, nav: navFull(true),
    kpi: { arriving: 4, occ: 58, occSub: '14 of 24 rooms', avail: 10, revenue: 77167 },
    priorities: [[Wallet2, '2 guests to collect from today'], [Paintbrush, '4 rooms to clean after check-out'], [QrCode, '1 QR order waiting for approval'], [MessageSquare, '6 unread guest messages'], [CircleDollarSign, '2 expenses waiting approval']],
    fees: ['7%', '1%', '0%'],
    arriving: [
      { ini: 'SR', name: 'Shuvo Roy', room: '101', type: 'Standard Room', stay: '10–11 Nov', pay: 'BDT 4,428 due', due: true },
      { ini: 'AT', name: 'Anika Tabassum', room: '102', type: 'Standard Room', stay: '10–13 Nov', pay: 'Paid', due: false },
      { ini: 'FC', name: 'Fahim Chowdhury', room: '103', type: 'Standard Room', stay: '10–13 Nov', pay: 'BDT 6,641 due', due: true },
      { ini: 'RK', name: 'Rubaiya Khan', room: '104', type: 'Standard Room', stay: '10–11 Nov', pay: 'Paid', due: false },
    ],
    cols: [308, 563, 713, 842, 1003], right: 'restaurant',
  },
  starter: {
    plan: 'Starter', property: 'Tea Valley Guest...', bell: '5', banner: false, nav: navStarter,
    kpi: { arriving: 3, occ: 75, occSub: '3 of 4 rooms', avail: 1, revenue: 12903 },
    priorities: [[Wallet2, '2 guests to collect from today'], [MessageSquare, '6 unread guest messages']],
    fees: ['7%', '1.5%', '0%'],
    arriving: [
      { ini: 'IA', name: 'Imtiaz Ali', room: '101', type: 'Garden Double', stay: '10–12 Nov', pay: 'BDT 7,084 due', due: true },
      { ini: 'TH', name: 'Tahmid Hasan', room: '201', type: 'Heritage Room', stay: '10–11 Nov', pay: 'Paid', due: false },
      { ini: 'JA', name: 'Jannat Ara', room: '301', type: 'Family Room', stay: '10–13 Nov', pay: 'BDT 7,969 due', due: true },
    ],
    cols: [308, 533, 687, 822, 990], right: 'sources',
  },
};

// ─────────────────────────────── motion helpers
const prog = (f: number, start: number, dur = 18) => interpolate(f, [start, start + dur], [0, 1], { ...cl, easing: EASE });
/** rise-in: opacity + small lift + slight scale; reaches the exact final layout at p = 1 */
const rise = (p: number, dy = 18): React.CSSProperties => ({ opacity: p, translate: `0px ${(1 - p) * dy}px`, scale: String(0.985 + 0.015 * p) });
const slideX = (p: number, dx = -16): React.CSSProperties => ({ opacity: p, translate: `${(1 - p) * dx}px 0px` });
const countUp = (f: number, start: number, to: number, dur = 26) => Math.round(to * interpolate(f, [start, start + dur], [0, 1], { ...cl, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
const bdt = (n: number) => n.toLocaleString('en-IN');

// ─────────────────────────────── timeline (frames)
const T = {
  sidebar: 0, nav: 4, top: 6, banner: 12, greet: 16, kpi: 24, mid: 46, list: 56, low: 72, rows: 82, right: 86,
  cursorIn: 128, hover: 158, press: 166, cursorOut: 182, toast: 192, upsell: 186, fadeOut: PLAN_LEN - 10,
};

// ─────────────────────────────── building blocks
const Ico = ({ I, size = 20, color, sw = 1.75 }: { I: typeof Bell; size?: number; color?: string; sw?: number }) => <I size={size} color={color} strokeWidth={sw} />;

const Sidebar: React.FC<{ d: PlanData; f: number }> = ({ d, f }) => {
  let y = 66; // first label centre = 83
  let prev: Nav['kind'] | null = null;
  const placed = d.nav.map((n) => {
    if (prev === null) y = 83;
    else if (n.kind === 'label') y += 38;
    else if (n.kind === 'divider') y += 29;
    else if (prev === 'label') y += 28;
    else if (prev === 'divider') y += 28;
    else y += 33.65;
    prev = n.kind;
    return { n, y };
  });
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 250, height: 1080, background: '#fff', borderRight: `1px solid ${C.line}`, ...slideX(prog(f, T.sidebar, 16), -24) }}>
      {/* official BinGi HMS lockup, the same file the HMS sidebar uses */}
      <Img src={staticFile('bingi-hms.svg')} style={{ position: 'absolute', left: 19, top: 18, height: 37, width: 174 }} />
      {placed.map(({ n, y: cy }, i) => {
        const p = prog(f, T.nav + i * 1.4, 14);
        if (n.kind === 'label') return <div key={i} style={{ position: 'absolute', left: 20, top: cy - 9, fontSize: 13, color: C.soft, fontWeight: 500, ...slideX(p) }}>{n.text}</div>;
        if (n.kind === 'divider') return <div key={i} style={{ position: 'absolute', left: 9, right: 9, top: cy, height: 1, background: C.line, opacity: p }} />;
        return (
          <div key={i} style={{ position: 'absolute', left: 9, width: 232, top: cy - 17, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px',
            background: n.active ? 'linear-gradient(180deg,#d42c38,#b91f2c)' : 'transparent', boxShadow: n.active ? '0 6px 14px -8px rgba(185,31,44,.7)' : 'none',
            color: n.active ? '#fff' : n.lock ? '#3a3f48' : '#22262d', ...slideX(p) }}>
            <Ico I={n.icon} size={19} sw={1.7} color={n.active ? '#fff' : '#30353d'} />
            <span style={{ flex: 1, fontSize: 15.2, fontWeight: n.active ? 600 : 450, whiteSpace: 'nowrap', letterSpacing: -0.1 }}>{n.text}</span>
            {n.badge && <span style={{ minWidth: 22, height: 22, borderRadius: 11, background: '#fde3e4', color: '#c4222f', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{n.badge}</span>}
            {n.lock && <Ico I={Lock} size={16} color="#6b7280" sw={1.8} />}
          </div>
        );
      })}
      {d.plan === 'Starter' && <Upsell f={f} />}
      <div style={{ position: 'absolute', left: 9, right: 9, top: 897, height: 1, background: C.line, opacity: prog(f, T.nav + 20) }} />
      <div style={{ position: 'absolute', left: 14, top: 913, width: 222, height: 38, borderRadius: 19, background: '#eef0f3', display: 'flex', padding: 3, ...rise(prog(f, T.nav + 24)) }}>
        <div style={{ flex: 1, borderRadius: 16, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 600 }}>
          <span style={{ width: 13, height: 13, borderRadius: 7, border: '2px solid #c8232f', display: 'grid', placeItems: 'center' }}><span style={{ width: 5, height: 5, borderRadius: 3, background: '#c8232f' }} /></span>Flat
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, color: '#5b616d' }}><span style={{ width: 11, height: 11, borderRadius: 6, background: '#fff', border: '1px solid #d5d8de' }} />Expandable</div>
      </div>
      <div style={{ position: 'absolute', left: 20, top: 975, display: 'flex', alignItems: 'center', gap: 11, ...rise(prog(f, T.nav + 27)) }}>
        <div style={{ position: 'relative', width: 36, height: 36, borderRadius: 18, background: '#c3202d', color: '#fff', fontSize: 12.5, fontWeight: 700, display: 'grid', placeItems: 'center' }}>MY
          <span style={{ position: 'absolute', right: -1, bottom: -1, width: 10, height: 10, borderRadius: 5, background: '#22a55a', border: '2px solid #fff' }} /></div>
        <div style={{ width: 150 }}><div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap' }}>{d.property}</div><div style={{ fontSize: 13, color: C.soft }}>{d.plan} · active</div></div>
        <Ico I={MoreHorizontal} size={18} color="#6b7280" />
      </div>
      <div style={{ position: 'absolute', left: 24, top: 1037, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: '#4e5461', opacity: prog(f, T.nav + 30) }}><Ico I={ChevronsLeft} size={17} />Collapse</div>
    </div>
  );
};

const Upsell: React.FC<{ f: number }> = ({ f }) => {
  const p = prog(f, T.upsell, 22);
  const glow = interpolate(f, [T.upsell + 18, T.upsell + 34, T.upsell + 60], [0, 1, 0], cl);
  return (
    <div style={{ position: 'absolute', left: 9, top: 722, width: 232, height: 162, borderRadius: 12, padding: '18px 16px', color: '#fff', background: 'linear-gradient(135deg,#b11c29,#7f1420)',
      boxShadow: `0 ${10 + 10 * glow}px ${24 + 16 * glow}px -14px rgba(177,28,41,${0.5 + 0.3 * glow})`, ...rise(p, 22) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16.5, fontWeight: 700 }}><Ico I={Sparkles} size={18} color="#fff" />Need more tools?</div>
      <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.4, color: 'rgba(255,255,255,.86)' }}>Housekeeping, restaurant, cashbox and lower booking fees.</div>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, height: 35, borderRadius: 9, background: '#fff', color: '#9a1622', fontSize: 14.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>See Business <Ico I={ArrowRight} size={15} color="#9a1622" /></div>
    </div>
  );
};

const TopBar: React.FC<{ d: PlanData; f: number }> = ({ d, f }) => {
  const p = prog(f, T.top, 16);
  return (
    <div style={{ position: 'absolute', left: 250, right: 0, top: 0, height: 62, background: '#fff', borderBottom: `1px solid ${C.line}`, opacity: p, translate: `0px ${(1 - p) * -10}px` }}>
      <div style={{ position: 'absolute', left: 19, top: 18, fontSize: 17, fontWeight: 600, color: C.ink }}>Dashboard</div>
      <div style={{ position: 'absolute', left: 122, top: 19, height: 24, padding: '0 9px', borderRadius: 6, background: '#fdf1d4', color: '#9a6400', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center' }}>Prototype · demo data</div>
      <div style={{ position: 'absolute', left: 284, top: 13, height: 35, padding: '0 12px', borderRadius: 9, background: 'linear-gradient(180deg,#d42c38,#bd202d)', color: '#fff', fontSize: 14.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 6px 14px -8px rgba(185,31,44,.8)' }}><Ico I={Plus} size={16} color="#fff" sw={2} />New property</div>
      <div style={{ position: 'absolute', left: 1076, top: 11, width: 234, height: 40, borderRadius: 20, background: '#eef0f3', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 9, color: '#5f6673', fontSize: 14.5 }}>
        <Ico I={Search} size={18} color="#4b515c" /> <span style={{ flex: 1 }}>Search...</span><span style={{ fontSize: 12.5, fontWeight: 600, color: '#6b7280' }}>⌘K</span>
      </div>
      <div style={{ position: 'absolute', left: 1326, top: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 15.5, color: '#2b2f36' }}><Ico I={Languages} size={19} />EN</div>
      <div style={{ position: 'absolute', left: 1399, top: 21 }}><Ico I={Minimize2} size={19} color="#2b2f36" /></div>
      <div style={{ position: 'absolute', left: 1446, top: 20 }}><Ico I={Bell} size={20} color="#2b2f36" />
        <span style={{ position: 'absolute', left: 9, top: -8, minWidth: 18, height: 18, borderRadius: 9, background: '#c8232f', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'grid', placeItems: 'center', padding: '0 4px', border: '2px solid #fff' }}>{d.bell}</span></div>
      <div style={{ position: 'absolute', left: 1493, top: 13, width: 34, height: 34, borderRadius: 17, background: C.avatar, color: C.avatarText, fontSize: 13, fontWeight: 700, display: 'grid', placeItems: 'center' }}>MY</div>
      <div style={{ position: 'absolute', left: 1537, top: 19, fontSize: 16, fontWeight: 650, color: C.ink, display: 'flex', alignItems: 'center', gap: 10 }}>Md Yeapas <Ico I={ChevronDown} size={17} color="#4b515c" /></div>
    </div>
  );
};

const Banner: React.FC<{ f: number }> = ({ f }) => {
  const p = prog(f, T.banner, 18);
  return (
    <div style={{ position: 'absolute', left: 251, right: 0, top: 62, height: 42, background: '#fbf7ec', borderBottom: '1px solid #efe7cf', display: 'flex', alignItems: 'center', padding: '0 0 0 27px', gap: 10, fontSize: 15, color: '#6a5209', overflow: 'hidden', opacity: p }}>
      <Ico I={Clock} size={18} color="#6a5209" />
      <span><b style={{ fontWeight: 700 }}>Server update tonight 2AM–2:30AM</b> (30 min) · Bookings: saving may pause for up to 2 minutes <span style={{ fontFamily: 'Hind Siliguri' }}>· সার্ভার আপডেট: বুকিং ক্যালেন্ডার আরও দ্রুত</span></span>
      <span style={{ position: 'absolute', left: 1550, textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 600, color: '#4a3a07' }}>Details</span>
      <span style={{ position: 'absolute', left: 1619, top: 12 }}><Ico I={X} size={17} color="#4a3a07" /></span>
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, p, children, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: '0 1px 2px rgba(16,24,40,.04)', ...rise(p, 22), ...style }}>{children}</div>
);

const Kpis: React.FC<{ d: PlanData; f: number; top: number }> = ({ d, f, top }) => {
  const k = d.kpi;
  const cards: { bg: string; I: typeof Bell; ic: string; v: string; l: string; sub?: string }[] = [
    { bg: '#fbe9e3', I: CalendarDays, ic: '#de5a32', v: String(countUp(f, T.kpi + 4, k.arriving, 18)), l: 'Arriving today' },
    { bg: '#ecebf8', I: BedDouble, ic: '#6a5bd3', v: `${countUp(f, T.kpi + 8, k.occ)}%`, l: 'Occupancy', sub: k.occSub },
    { bg: '#fcf3de', I: BedDouble, ic: '#a77213', v: String(countUp(f, T.kpi + 12, k.avail, 20)), l: 'Available rooms' },
    { bg: '#e5f2eb', I: Wallet, ic: '#2c8a58', v: `BDT ${bdt(countUp(f, T.kpi + 16, k.revenue, 32))}`, l: 'Room revenue today' },
  ];
  return <>{cards.map((c, i) => {
    const x = [287, 689, 1092, 1495][i];
    const p = prog(f, T.kpi + i * 4, 20);
    return (
      <div key={i} style={{ position: 'absolute', left: x, top, width: 389, height: 109, borderRadius: 14, background: c.bg, display: 'flex', alignItems: 'center', gap: 19, padding: '0 18px', ...rise(p, 20) }}>
        <div style={{ width: 53, height: 53, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}><Ico I={c.I} size={22} color={c.ic} /></div>
        <div>
          <div style={{ fontSize: 25.5, fontWeight: 720, color: C.ink, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{c.v}</div>
          <div style={{ fontSize: 15.5, color: '#4f5562', marginTop: 1 }}>{c.l}</div>
          {c.sub && <div style={{ fontSize: 14, color: '#5b616d', marginTop: 1 }}>{c.sub}</div>}
        </div>
      </div>
    );
  })}</>;
};

const Priorities: React.FC<{ d: PlanData; f: number; top: number; h: number }> = ({ d, f, top, h }) => {
  const p = prog(f, T.mid, 22);
  const n = d.priorities.length;
  const listH = n * 33.5 + (d.more ? 33 : 0);
  const titleY = (h - (listH + 38)) / 2 + 6; // title + list block centred in the card
  const btn = interpolate(f, [T.hover, T.hover + 6], [0, 1], cl) - interpolate(f, [T.cursorOut, T.cursorOut + 8], [0, 1], cl);
  const press = interpolate(f, [T.press, T.press + 3, T.press + 9], [1, 0.965, 1], cl);
  return (
    <Card x={287} y={top} w={1004} h={h} p={p}>
      <div style={{ position: 'absolute', left: 23, top: h / 2 - 58, width: 117, height: 116, borderRadius: 18, background: '#fbe9e3', display: 'grid', placeItems: 'center', ...rise(prog(f, T.mid + 6, 22), 10) }}>
        <div style={{ width: 62, height: 62, borderRadius: 14, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.06)' }}><Ico I={ClipboardCheck} size={28} color="#1f8a4c" /></div>
      </div>
      <div style={{ position: 'absolute', left: 157, top: titleY - 2, fontSize: 20, fontWeight: 750, color: C.ink, ...slideX(prog(f, T.mid + 6), -10) }}>Today's priorities</div>
      {d.priorities.map(([I, text], i) => (
        <div key={i} style={{ position: 'absolute', left: 157, top: titleY + 38 + i * 33.5, display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#272b33', letterSpacing: -0.1, ...slideX(prog(f, T.list + i * 3.5, 16), -12) }}>
          <Ico I={I} size={19} color="#d22a35" />{text}
        </div>
      ))}
      {d.more && <div style={{ position: 'absolute', left: 157, top: titleY + 38 + n * 33.5 + 2, fontSize: 16, fontWeight: 600, color: '#c4222f', textDecoration: 'underline', textUnderlineOffset: 3, opacity: prog(f, T.list + n * 3.5 + 4) }}>{d.more}</div>}
      <div style={{ position: 'absolute', left: 795, top: h / 2 - 23, width: 186, height: 45, borderRadius: 11, background: btn > 0 ? `rgb(${21 + 22 * btn},${23 + 22 * btn},${28 + 22 * btn})` : '#15171c', color: '#fff', fontSize: 16, fontWeight: 650,
        display: 'grid', placeItems: 'center', scale: String(press), boxShadow: `0 ${6 + 8 * Math.max(btn, 0)}px ${14 + 10 * Math.max(btn, 0)}px -10px rgba(0,0,0,${0.35 + 0.2 * Math.max(btn, 0)})`, ...rise(prog(f, T.mid + 12), 10) }}>Start with the first</div>
    </Card>
  );
};

const WebsiteCard: React.FC<{ d: PlanData; f: number; top: number; h: number }> = ({ d, f, top, h }) => {
  const p = prog(f, T.mid + 5, 22);
  const cell = (i: number) => prog(f, T.list + 6 + i * 4, 16);
  return (
    <Card x={1311} y={top} w={573} h={h} p={p}>
      <div style={{ position: 'absolute', left: 22, top: 25, fontSize: 20, fontWeight: 750, color: C.ink }}>Website & booking</div>
      <div style={{ position: 'absolute', left: 22, top: 61, display: 'flex', gap: 8, ...rise(prog(f, T.list), 8) }}>
        <span style={{ height: 25, padding: '0 8px', borderRadius: 6, background: C.chipGreen, color: C.chipGreenText, fontSize: 14, fontWeight: 650, display: 'flex', alignItems: 'center', gap: 3 }}><Ico I={Check} size={14} color={C.chipGreenText} sw={2.4} />Published</span>
        <span style={{ height: 25, padding: '0 9px', borderRadius: 6, background: '#eef0f3', color: '#4a505b', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center' }}>Free BinGi address</span>
      </div>
      <div style={{ position: 'absolute', left: 22, top: 101, fontSize: 13, color: '#4f5562', opacity: prog(f, T.list + 4) }}>Booking fees · {d.plan}</div>
      {(['Marketplace', 'Web booking', 'Walk-in'] as const).map((k, i) => (
        <div key={k} style={{ position: 'absolute', left: [22, 206, 382][i], top: 124, width: 160, ...rise(cell(i), 10) }}>
          {i > 0 && <span style={{ position: 'absolute', left: -12, top: 2, width: 1, height: 48, background: C.line }} />}
          <div style={{ fontSize: 14.5, color: '#4f5562' }}>{k}</div>
          <div style={{ fontSize: 19, fontWeight: 750, color: C.ink, marginTop: 2 }}>{d.fees[i]}</div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 22, right: 22, top: h - 88, height: 1, background: C.line, opacity: prog(f, T.list + 14) }} />
      <div style={{ position: 'absolute', left: 22, top: h - 63, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#4d5664', opacity: prog(f, T.list + 16) }}><Ico I={Monitor} size={17} />All themes</div>
      <div style={{ position: 'absolute', right: 22, top: h - 73, height: 40, padding: '0 15px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 15, fontWeight: 650, color: C.ink, display: 'grid', placeItems: 'center', ...rise(prog(f, T.list + 16), 8) }}>Manage website</div>
    </Card>
  );
};

const Arriving: React.FC<{ d: PlanData; f: number; top: number; h: number }> = ({ d, f, top, h }) => {
  const p = prog(f, T.low, 22);
  const [g, r, s, b, pay] = d.cols.map((x) => x - 287);
  return (
    <Card x={287} y={top} w={1004} h={h} p={p}>
      <div style={{ position: 'absolute', left: 22, top: 22, fontSize: 20, fontWeight: 750, color: C.ink }}>Arriving today ({d.arriving.length})</div>
      <div style={{ position: 'absolute', right: 22, top: 25, fontSize: 15.5, fontWeight: 650, color: '#c4222f' }}>View all</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 66, height: 30, fontSize: 14, color: '#4f5562', opacity: prog(f, T.rows - 4) }}>
        {[['Guest', g], ['Room', r], ['Stay', s], ['Booking', b], ['Payment', pay]].map(([t, x]) => <span key={t as string} style={{ position: 'absolute', left: (x as number) - 1 }}>{t}</span>)}
      </div>
      <div style={{ position: 'absolute', left: 9, right: 9, top: 95, height: 1, background: C.line }} />
      {d.arriving.map((row, i) => {
        const rp = prog(f, T.rows + i * 5, 18);
        const y = 96 + i * 67;
        return (
          <div key={i} style={{ position: 'absolute', left: 9, right: 9, top: y, height: 67, borderBottom: i < d.arriving.length - 1 ? `1px solid ${C.line}` : 'none', ...slideX(rp, 14) }}>
            <div style={{ position: 'absolute', left: g - 9 - 1, top: 18, width: 31, height: 31, borderRadius: 16, background: C.avatar, color: C.avatarText, fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{row.ini}</div>
            <div style={{ position: 'absolute', left: g - 9 + 42, top: 22, fontSize: 16.5, fontWeight: 650, color: C.ink }}>{row.name}</div>
            <div style={{ position: 'absolute', left: r - 9, top: 13, fontSize: 16, color: '#22262d' }}>{row.room}<div style={{ fontSize: 13.5, color: '#5b616d', marginTop: 1 }}>{row.type}</div></div>
            <div style={{ position: 'absolute', left: s - 9, top: 23, fontSize: 16, color: '#22262d' }}>{row.stay}</div>
            <div style={{ position: 'absolute', left: b - 9, top: 18, height: 30, padding: '0 9px', borderRadius: 6, background: C.chipGreen, color: C.chipGreenText, fontSize: 14.5, fontWeight: 650, display: 'flex', alignItems: 'center', gap: 4 }}><Ico I={Check} size={14} color={C.chipGreenText} sw={2.4} />Confirmed</div>
            <div style={{ position: 'absolute', left: pay - 9, top: 22, fontSize: 16.5, fontWeight: row.due ? 700 : 500, color: row.due ? C.redText : C.green }}>{row.pay}</div>
            <div style={{ position: 'absolute', right: 11, top: 15, height: 36, width: 74, borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 15, fontWeight: 600, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>Open <Ico I={ChevronRight} size={15} /></div>
          </div>
        );
      })}
    </Card>
  );
};

const RightCard: React.FC<{ d: PlanData; f: number; top: number; h: number }> = ({ d, f, top, h }) => {
  const p = prog(f, T.low + 5, 22);
  if (d.right === 'sources') {
    const rows: [string, number][] = [['Walk-in & phone', 3], ['Website', 3], ['Marketplace', 2], ['Other', 4]];
    return (
      <Card x={1311} y={top} w={573} h={h} p={p}>
        <div style={{ position: 'absolute', left: 22, top: 25, fontSize: 20, fontWeight: 750, color: C.ink }}>Booking sources</div>
        <div style={{ position: 'absolute', left: 22, top: 54, fontSize: 14.5, color: '#5b616d' }}>This month · 12 bookings</div>
        {rows.map(([k, v], i) => {
          const rp = prog(f, T.right + i * 5, 18);
          const bar = interpolate(f, [T.right + 6 + i * 5, T.right + 30 + i * 5], [0, v / 12], { ...cl, easing: EASE });
          return (
            <div key={k} style={{ position: 'absolute', left: 22, right: 22, top: 84 + i * 53.7, height: 54, borderBottom: i < 3 ? `1px solid ${C.line}` : 'none', ...slideX(rp, 12) }}>
              <span style={{ position: 'absolute', left: 0, top: 15, fontSize: 16.5, color: '#22262d' }}>{k}</span>
              <span style={{ position: 'absolute', left: 389, top: 25, width: 90, height: 5, borderRadius: 3, background: '#eceef2' }}><span style={{ display: 'block', height: 5, borderRadius: 3, background: '#e1612f', width: `${bar * 100}%` }} /></span>
              <span style={{ position: 'absolute', right: 0, top: 13, fontSize: 18.5, fontWeight: 750, color: C.ink }}>{countUp(f, T.right + 6 + i * 5, v, 18)}</span>
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: 22, right: 22, bottom: 22, height: 44, borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 15.5, fontWeight: 650, color: C.ink, display: 'grid', placeItems: 'center', ...rise(prog(f, T.right + 24), 8) }}>Open reports</div>
      </Card>
    );
  }
  const team = d.right === 'team';
  const rows: [typeof Bell, string, string, number][] = team
    ? [[UsersRound, 'Staff on duty', '', 18], [Boxes, 'Low stock', ' items', 5], [ChefHat, 'Restaurant orders today', '', 10]]
    : [[QrCode, 'QR orders waiting', '', 1], [ChefHat, 'Orders today', '', 10], [Sparkles, 'Menu items on sale', '', 13]];
  return (
    <Card x={1311} y={top} w={573} h={h} p={p}>
      <div style={{ position: 'absolute', left: 22, top: 26, fontSize: 20, fontWeight: 750, color: C.ink }}>{team ? 'Team & inventory' : 'Restaurant today'}</div>
      {rows.map(([I, k, unit, v], i) => (
        <div key={k} style={{ position: 'absolute', left: 22, right: 22, top: 60 + i * 63.7, height: 64, borderBottom: i < 2 ? `1px solid ${C.line}` : 'none', ...slideX(prog(f, T.right + i * 5, 18), 12) }}>
          <span style={{ position: 'absolute', left: 0, top: 12, width: 40, height: 40, borderRadius: 9, background: C.peach, display: 'grid', placeItems: 'center' }}><Ico I={I} size={19} color={C.peachIcon} sw={1.8} /></span>
          <span style={{ position: 'absolute', left: 54, top: 21, fontSize: 16.5, color: '#22262d' }}>{k}</span>
          <span style={{ position: 'absolute', right: 0, top: 19, fontSize: 19.5, fontWeight: 750, color: C.ink }}>{countUp(f, T.right + 4 + i * 5, v, 18)}{unit}</span>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 23, height: 44, borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 15.5, fontWeight: 650, color: C.ink, display: 'grid', placeItems: 'center', ...rise(prog(f, T.right + 20), 8) }}>{team ? 'Open Staff' : 'Open meals'}</div>
    </Card>
  );
};

const Toast: React.FC<{ f: number }> = ({ f }) => {
  const p = interpolate(f, [T.toast, T.toast + 22], [0, 1], { ...cl, easing: Easing.bezier(0.2, 1.2, 0.35, 1) });
  return (
    <div style={{ position: 'absolute', left: 1495, top: 786, width: 401, height: 270, borderRadius: 14, background: '#fff', border: `1px solid ${C.line}`,
      boxShadow: '0 24px 48px -18px rgba(16,24,40,.28), 0 4px 10px rgba(16,24,40,.06)', opacity: Math.min(1, p * 1.4), translate: `${(1 - p) * 28}px ${(1 - p) * 34}px`, scale: String(0.96 + 0.04 * p) }}>
      <div style={{ position: 'absolute', left: 18, top: 18, width: 40, height: 40, borderRadius: 10, background: '#fdeceb', display: 'grid', placeItems: 'center' }}><Ico I={Sparkles} size={20} color="#c8232f" /></div>
      <div style={{ position: 'absolute', right: 22, top: 22 }}><Ico I={X} size={18} color="#2b2f36" /></div>
      <div style={{ position: 'absolute', left: 71, top: 20, width: 300 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#4f5562', letterSpacing: 0.2 }}>NEW IN BINGI</div>
        <div style={{ fontSize: 17.5, fontWeight: 750, color: C.ink, lineHeight: 1.33, marginTop: 4 }}>New: Payments, Expenses,<br />Finance and Reports</div>
        <div style={{ fontSize: 15, color: '#5b616d', lineHeight: 1.38, marginTop: 6, width: 262 }}>One place to see every payment, approve expenses, follow money paid online through BinGi, and print 12 ready reports.</div>
        <div style={{ fontSize: 14.5, color: '#4f5562', marginTop: 3, fontFamily: 'Hind Siliguri' }}>নতুন: পেমেন্ট, খরচ, ফাইন্যান্স ও রিপোর্ট</div>
      </div>
      <div style={{ position: 'absolute', left: 190, top: 222, fontSize: 15.5, fontWeight: 600, color: '#2b2f36' }}>Later</div>
      <div style={{ position: 'absolute', right: 18, top: 211, height: 41, width: 134, borderRadius: 10, background: 'linear-gradient(180deg,#d42c38,#bd202d)', color: '#fff', fontSize: 15, fontWeight: 650, display: 'grid', placeItems: 'center' }}>See what's new</div>
    </div>
  );
};

/** Soft pointer that glides to "Start with the first", hovers, presses, then leaves before the toast. */
const Cursor: React.FC<{ f: number; tx: number; ty: number }> = ({ f, tx, ty }) => {
  const move = interpolate(f, [T.cursorIn, T.hover], [0, 1], { ...cl, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  const out = interpolate(f, [T.cursorOut, T.cursorOut + 22], [0, 1], { ...cl, easing: Easing.bezier(0.5, 0, 0.75, 0) });
  const x = interpolate(move, [0, 1], [1500, tx]) + out * 260;
  const y = interpolate(move, [0, 1], [1010, ty]) + out * 170;
  const op = Math.min(interpolate(f, [T.cursorIn, T.cursorIn + 8], [0, 1], cl), 1 - out);
  const press = interpolate(f, [T.press, T.press + 3, T.press + 9], [1, 0.86, 1], cl);
  return (
    <svg width={30} height={34} viewBox="0 0 30 34" style={{ position: 'absolute', left: x, top: y, opacity: op, scale: String(press), filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.28))' }}>
      <path d="M3 2 L3 27 L9.5 21 L14 31 L18.5 29 L14 19.5 L23 19.5 Z" fill="#15171c" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
};

// ─────────────────────────────── composition
export const PlanFinal: React.FC<{ plan: PlanId }> = ({ plan }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const d = P[plan];
  const off = d.banner ? 0 : -41; // Starter has no update banner, so its content sits 41 px higher
  // card heights / tops, per the screenshots
  const L = plan === 'ultra'
    ? { pri: [347, 277], low: [643, 379] }
    : plan === 'business' ? { pri: [347, 268], low: [633, 379] } : { pri: [306, 268], low: [592, 379] };
  const fade = interpolate(f, [durationInFrames - 10, durationInFrames], [1, 0], cl);
  return (
    <AbsoluteFill style={{ background: C.canvas, fontFamily: `'${JAKARTA}', 'Hind Siliguri', system-ui, sans-serif`, color: C.ink, overflow: 'hidden', letterSpacing: -0.15 }}>
      {/* camera settles from 1.03 to 1 in the first 2.5 s, so the held view is the exact screen */}
      <AbsoluteFill style={{ opacity: fade, transformOrigin: '55% 40%', scale: String(interpolate(f, [0, 75], [1.03, 1], { ...cl, easing: Easing.bezier(0.22, 1, 0.36, 1) })) }}>
        <TopBar d={d} f={f} />
        {d.banner && <Banner f={f} />}
        <div style={{ position: 'absolute', left: 287, top: 139 + off, ...rise(prog(f, T.greet, 20), 14) }}>
          <div style={{ fontSize: 27.5, fontWeight: 720, color: C.ink, letterSpacing: -0.6 }}>Good afternoon, Md Yeapas</div>
          <div style={{ fontSize: 16, color: '#4f5562', marginTop: 4 }}>Tuesday 10 Nov 2026</div>
        </div>
        <div style={{ position: 'absolute', left: 1728, top: 155 + off, width: 156, height: 45, borderRadius: 10, background: 'linear-gradient(180deg,#d42c38,#bd202d)', color: '#fff', fontSize: 16, fontWeight: 650,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 8px 18px -10px rgba(185,31,44,.9)', ...rise(prog(f, T.greet + 6, 20), 10) }}><Ico I={Plus} size={17} color="#fff" sw={2} />New booking</div>
        <Kpis d={d} f={f} top={218 + off} />
        <Priorities d={d} f={f} top={L.pri[0]} h={L.pri[1]} />
        <WebsiteCard d={d} f={f} top={L.pri[0]} h={L.pri[1]} />
        <Arriving d={d} f={f} top={L.low[0]} h={L.low[1]} />
        <RightCard d={d} f={f} top={L.low[0]} h={L.low[1]} />
        {plan !== 'starter' && <Toast f={f} />}
        <Sidebar d={d} f={f} />
        <Cursor f={f} tx={1180} ty={L.pri[0] + L.pri[1] / 2 + 4} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
