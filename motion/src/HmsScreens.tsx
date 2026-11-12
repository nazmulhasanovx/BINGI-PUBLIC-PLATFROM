// Real BinGi HMS screens (prototype, sample hotel "Azure Bay Grand Resort", demo data) brought to life.
// Every pixel on screen comes from the real screenshot in public/hms/*.webp. The animation only:
// hides parts and lets them rise back in, grows progress bars to their real length, types the
// value that is already in the field, moves a booking bar that is already on the calendar, and adds a pointer.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Cursor, Ripple } from './kit';

export const HMS_LOOP = 240; // 8 s at 30 fps
const S = 1600 / 1456; // screenshots were measured in a 1456×819 frame
const BG = '#F4F6F8';
const ease = Easing.bezier(0.16, 1, 0.3, 1);

type R = [number, number, number, number]; // x, y, w, h in the 1456 frame
type Part = { r: R; at: number; bg?: string; dy?: number; dx?: number; d?: number };
type Bar = { r: R; at: number; fill: number; track?: string };
type Cfg = {
  src: string;
  parts?: Part[];
  bars?: Bar[];
  glows?: { r: R; at: number; to: number; radius?: number }[];
  path?: [number, number, number][]; // [time, x, y]
  clicks?: [number, number, number][]; // [time, x, y]
  type?: { r: R; at: number; to: number; text: string; size: number };
  drag?: { r: R; dy: number; at: number; to: number; bg: string; hide?: R };
};

const sc = (r: R) => ({ left: r[0] * S, top: r[1] * S, width: r[2] * S, height: r[3] * S });

const useT = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames: d } = useVideoConfig();
  const reset = interpolate(f, [d - 0.8 * fps, d - 0.1 * fps], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const raw = (a: number, b: number) => interpolate(f, [a * fps, b * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return { f, fps, reset, t: (a: number, b: number) => raw(a, b) * reset, raw };
};

const Slice: React.FC<{ src: string; r: R; style?: React.CSSProperties }> = ({ src, r, style }) => (
  <div style={{ position: 'absolute', ...sc(r), backgroundImage: `url(${staticFile(src)})`, backgroundSize: '1600px 900px', backgroundPosition: `-${r[0] * S}px -${r[1] * S}px`, ...style }} />
);

const Screen: React.FC<{ cfg: Cfg }> = ({ cfg }) => {
  const { f, fps, t, raw } = useT();
  const { src } = cfg;
  // pointer position from keyframes
  let cx = 0, cy = 0, show = 0;
  if (cfg.path?.length) {
    const p = cfg.path;
    const ts = p.map((k) => k[0] * fps);
    const opt = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: ease };
    cx = p.length > 1 ? interpolate(f, ts, p.map((k) => k[1] * S), opt) : p[0][1] * S;
    cy = p.length > 1 ? interpolate(f, ts, p.map((k) => k[2] * S), opt) : p[0][2] * S;
    show = t(p[0][0], p[0][0] + 0.3);
  }
  const press = Math.max(0, ...(cfg.clicks ?? []).map(([tc]) => 1 - Math.abs(f - tc * fps) / 4));
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Img src={staticFile(src)} style={{ position: 'absolute', inset: 0, width: 1600, height: 900 }} />

      {cfg.parts?.map((p, i) => {
        const v = t(p.at, p.at + (p.d ?? 0.55));
        return (
          <React.Fragment key={i}>
            {v < 0.999 && <div style={{ position: 'absolute', ...sc(p.r), background: p.bg ?? BG }} />}
            <Slice src={src} r={p.r} style={{ opacity: v, translate: `${(1 - v) * (p.dx ?? 0)}px ${(1 - v) * (p.dy ?? 16)}px`, scale: String(0.985 + 0.015 * v) }} />
          </React.Fragment>
        );
      })}

      {cfg.bars?.map((b, i) => {
        const v = t(b.at, b.at + 0.9);
        const w = b.r[2] * b.fill;
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', ...sc(b.r), background: b.track ?? '#EEF0F3', borderRadius: 99 }} />
            <Slice src={src} r={[b.r[0], b.r[1], w * v, b.r[3]]} style={{ borderRadius: 99 }} />
          </React.Fragment>
        );
      })}

      {cfg.type && (() => {
        const { r, at, to, text, size } = cfg.type;
        const chars = Array.from(text);
        const n = Math.round(interpolate(f, [at * fps, to * fps], [0, chars.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
        const on = t(at - 0.3, at - 0.25) > 0.5;
        return on ? (
          <div style={{ position: 'absolute', ...sc(r), background: '#fff', display: 'flex', alignItems: 'center', paddingLeft: 3, fontFamily: 'AiInter, sans-serif', fontSize: size * S, color: '#111827' }}>
            {chars.slice(0, n).join('')}
            <span style={{ width: 1.5, height: size * S * 1.3, marginLeft: 1, background: Math.floor(f / 15) % 2 === 0 ? '#B11C29' : 'transparent' }} />
          </div>
        ) : null;
      })()}

      {cfg.drag && (() => {
        const { r, dy, at, to, bg, hide } = cfg.drag;
        const v = t(at, to);
        const lift = Math.sin(Math.PI * Math.min(1, raw(at - 0.15, to + 0.15))) * (t(at - 0.2, at) > 0 ? 1 : 0);
        return (
          <>
            {/* drop target */}
            <div style={{ position: 'absolute', ...sc([r[0], r[1] + dy, r[2], r[3]]), border: '2px dashed #B11C29', borderRadius: 8, opacity: t(at, at + 0.2) * (1 - t(to, to + 0.3)) }} />
            <div style={{ position: 'absolute', ...sc(r), background: bg }} />
            {hide && <div style={{ position: 'absolute', ...sc(hide), background: bg, opacity: t(to, to + 0.3) }} />}
            <Slice src={src} r={r} style={{ translate: `0 ${dy * S * v}px`, scale: String(1 + 0.04 * lift), boxShadow: `0 ${10 * lift}px ${24 * lift}px rgba(16,24,40,${0.22 * lift})`, borderRadius: 8, zIndex: 5 }} />
          </>
        );
      })()}

      {cfg.glows?.map((g, i) => {
        const v = t(g.at, g.at + 0.35) * (1 - t(g.to, g.to + 0.4));
        return <div key={i} style={{ position: 'absolute', ...sc(g.r), borderRadius: g.radius ?? 12, boxShadow: `0 0 0 ${3 * v}px rgba(177,28,41,${0.55 * v}), 0 0 0 ${10 * v}px rgba(177,28,41,${0.12 * v})` }} />;
      })}

      {cfg.clicks?.map(([tc, x, y], i) => (
        <Ripple key={i} x={x * S} y={y * S} p={interpolate(f, [tc * fps, (tc + 0.45) * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} color="#B11C29" />
      ))}
      {cfg.path && <div style={{ opacity: show }}><Cursor x={cx} y={cy} press={press} size={30} /></div>}
    </AbsoluteFill>
  );
};

/** Shows a crop of the 1600×900 screen, scaled to fill the composition (for the bento cards). */
const View: React.FC<{ v: [number, number, number, number]; children: React.ReactNode }> = ({ v, children }) => {
  const { width } = useVideoConfig();
  const z = width / v[2];
  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1600, height: 900, transformOrigin: '0 0', transform: `scale(${z}) translate(${-v[0]}px, ${-v[1]}px)` }}>{children}</div>
    </AbsoluteFill>
  );
};

const W = '#FFFFFF';
const stag = (rs: R[], at: number, step: number, extra: Partial<Part> = {}): Part[] => rs.map((r, i) => ({ r, at: at + i * step, ...extra }));

/* ── Dashboard: today's numbers, priorities and arrivals come in; the pointer opens the first arrival ── */
const dash: Cfg = {
  src: 'hms/dash.webp',
  parts: [
    ...stag([[233, 143, 287, 90], [531, 143, 287, 90], [829, 143, 287, 90], [1127, 143, 287, 90]], 0.2, 0.1),
    { r: [233, 248, 742, 225], at: 0.7 },
    { r: [989, 248, 425, 225], at: 0.8 },
    { r: [233, 488, 742, 310], at: 1.0 },
    ...stag([[241, 567, 726, 55], [241, 622, 726, 55], [241, 677, 726, 55], [241, 732, 726, 55]], 1.3, 0.12, { bg: W, dy: 10 }),
    { r: [989, 488, 425, 310], at: 1.15 },
  ],
  path: [[2.0, 1250, 860], [2.9, 925, 598], [4.6, 925, 598], [5.5, 885, 362]],
  clicks: [[3.1, 921, 594]],
  glows: [{ r: [242, 568, 724, 54], at: 3.1, to: 4.4, radius: 8 }],
};

/* ── Calendar: the booking without a room is dragged into Room 105 ── */
const calendar: Cfg = {
  src: 'hms/calendar.webp',
  drag: { r: [749, 316, 152, 30], dy: 276, at: 1.7, to: 2.9, bg: '#FFFAF0', hide: [244, 334, 60, 13] },
  path: [[0.6, 1150, 790], [1.4, 820, 334], [1.7, 820, 334], [2.9, 820, 610], [4.0, 1180, 720]],
  clicks: [[1.55, 820, 331], [2.95, 820, 607]],
};

/* ── Bookings list: today's bookings arrive; the first one is highlighted ── */
const bookings: Cfg = {
  src: 'hms/bookings.webp',
  parts: [
    ...stag([[233, 143, 287, 90], [531, 143, 287, 90], [829, 143, 287, 90], [1127, 143, 287, 90]], 0.2, 0.1),
    { r: [233, 248, 1181, 50], at: 0.6 },
    { r: [233, 311, 1181, 43], at: 0.7 },
    { r: [233, 369, 1181, 40], at: 0.8 },
    ...stag([[234, 461, 1178, 80], [234, 542, 1178, 80], [234, 623, 1178, 80], [234, 704, 1178, 80]], 1.0, 0.12, { bg: W, dy: -12 }),
  ],
  glows: [{ r: [234, 461, 1178, 80], at: 1.9, to: 4.0, radius: 6 }],
  path: [[2.4, 1300, 860], [3.3, 1350, 503], [5.0, 1350, 503]],
  clicks: [[3.5, 1346, 500]],
};

/* ── Check-in: the panel opens, the guest's ID on file is entered, then Check in ── */
const checkin: Cfg = {
  src: 'hms/checkin.webp',
  parts: [
    { r: [233, 127, 1181, 201], at: 0.2 },
    { r: [233, 343, 1181, 476], at: 0.6, dy: 40 },
  ],
  type: { r: [383, 533, 1006, 32], at: 1.6, to: 2.6, text: '5534108972', size: 14 },
  path: [[1.0, 900, 760], [1.4, 640, 550], [2.8, 640, 550], [3.6, 1170, 168], [5.2, 1170, 168]],
  clicks: [[1.45, 640, 548], [3.8, 1166, 165]],
  glows: [{ r: [1110, 147, 112, 39], at: 3.8, to: 5.3, radius: 10 }],
};

/* ── Restaurant & Bar POS: tables fill in, Room service is chosen, the open room order is shown ── */
const pos: Cfg = {
  src: 'hms/pos.webp',
  parts: [
    ...stag([[233, 251, 150, 112], [394, 251, 150, 112], [555, 251, 150, 112], [716, 251, 150, 112], [877, 251, 150, 112], [233, 375, 150, 112], [394, 375, 150, 112], [555, 375, 150, 112]], 0.25, 0.08),
    { r: [1045, 196, 383, 516], at: 0.5, dx: 30, dy: 0 },
    { r: [233, 560, 310, 62], at: 1.0 },
  ],
  path: [[1.7, 1380, 820], [2.5, 1245, 296], [3.7, 1245, 296], [4.5, 470, 606], [6.0, 470, 606]],
  clicks: [[2.7, 1244, 293]],
  glows: [{ r: [1179, 276, 113, 36], at: 2.7, to: 4.0, radius: 10 }, { r: [389, 587, 149, 34], at: 4.5, to: 6.6, radius: 10 }],
};

/* ── Housekeeping: team and cleaning tasks appear, Room 401's checklist fills, a cleaning starts ── */
const housekeeping: Cfg = {
  src: 'hms/housekeeping.webp',
  parts: [
    { r: [233, 192, 1181, 52], at: 0.2 },
    { r: [233, 255, 1181, 43], at: 0.35 },
    ...stag([[233, 337, 211, 55], [451, 337, 211, 55], [669, 337, 211, 55], [887, 337, 211, 55], [1105, 337, 211, 55], [1323, 337, 91, 55]], 0.5, 0.07),
    ...stag([[233, 465, 387, 220], [630, 465, 387, 220], [1027, 465, 387, 220], [233, 695, 387, 124], [630, 695, 387, 124], [1027, 695, 387, 124]], 0.9, 0.09),
  ],
  bars: [{ r: [1043, 600, 355, 7], at: 1.9, fill: 224 / 355, track: '#EEF0F3' }],
  path: [[2.6, 1000, 820], [3.4, 948, 652], [5.5, 948, 652]],
  clicks: [[3.6, 946, 650]],
  glows: [{ r: [893, 632, 108, 37], at: 3.6, to: 5.0, radius: 10 }],
};

/* ── Cashbox: today's drawer, where cash came from and went ── */
const cashbox: Cfg = {
  src: 'hms/cashbox.webp',
  parts: [
    { r: [233, 196, 1181, 61], at: 0.2 },
    { r: [233, 271, 1181, 183], at: 0.35 },
    { r: [233, 468, 582, 141], at: 0.55 },
    { r: [831, 468, 582, 141], at: 0.65 },
    { r: [233, 625, 1181, 150], at: 0.8 },
  ],
  bars: [
    { r: [252, 543, 545, 6], at: 1.2, fill: 1 },
    { r: [252, 584, 545, 6], at: 1.3, fill: 74 / 545 },
    { r: [849, 543, 545, 6], at: 1.4, fill: 1 },
    { r: [849, 584, 545, 6], at: 1.5, fill: 321 / 545 },
  ],
  path: [[2.4, 1300, 820], [3.2, 1126, 228], [5.0, 1126, 228]],
  clicks: [[3.4, 1124, 225]],
  glows: [{ r: [1077, 208, 95, 37], at: 3.4, to: 4.8, radius: 10 }],
};

/* ── Team & HR attendance: today's list fills in, one person is marked ── */
const staff: Cfg = {
  src: 'hms/staff.webp',
  parts: [
    { r: [252, 367, 1142, 54], at: 0.3 },
    ...stag([[252, 521, 1142, 57], [252, 579, 1142, 57], [252, 637, 1142, 57], [252, 695, 1142, 57], [252, 753, 1142, 57]], 0.5, 0.1, { bg: W, dy: 10 }),
  ],
  path: [[1.8, 1100, 860], [2.6, 1206, 724], [4.6, 1206, 724]],
  clicks: [[2.8, 1204, 722]],
  glows: [{ r: [555, 710, 104, 25], at: 2.9, to: 4.6, radius: 6 }],
};

/* ── Website Management overview ── */
const website: Cfg = {
  src: 'hms/website.webp',
  parts: [
    { r: [426, 180, 1001, 204], at: 0.2 },
    ...stag([[426, 402, 242, 70], [679, 402, 242, 70], [932, 402, 242, 70], [1185, 402, 242, 70], [426, 482, 242, 70], [679, 482, 242, 70], [932, 482, 242, 70], [1185, 482, 242, 70]], 0.55, 0.07),
  ],
  path: [[1.6, 1300, 600], [2.4, 938, 348], [4.4, 938, 348]],
  clicks: [[2.6, 935, 345]],
  glows: [{ r: [887, 328, 97, 33], at: 2.6, to: 4.2, radius: 16 }],
};

export const HmsDash: React.FC = () => <Screen cfg={dash} />;
export const HmsCalendar: React.FC = () => <Screen cfg={calendar} />;
export const HmsBookings: React.FC = () => <Screen cfg={bookings} />;
export const HmsCheckin: React.FC = () => <Screen cfg={checkin} />;
export const HmsPos: React.FC = () => <Screen cfg={pos} />;
export const HmsHousekeeping: React.FC = () => <Screen cfg={housekeeping} />;

// bento crops (composition size = the slot size on the site)
export const BentoCalendarReal: React.FC = () => <View v={[256, 286, 953, 416.2]}><Screen cfg={calendar} /></View>;
export const BentoHousekeepReal: React.FC = () => <View v={[681, 363, 451, 394.6]}><Screen cfg={housekeeping} /></View>;
export const BentoRestaurantReal: React.FC = () => <View v={[250, 209, 887, 554.4]}><Screen cfg={pos} /></View>;
export const BentoCashReal: React.FC = () => <View v={[250, 286, 651, 406.9]}><Screen cfg={cashbox} /></View>;
export const BentoStaffReal: React.FC = () => <View v={[269, 396, 709, 443.1]}><Screen cfg={staff} /></View>;
export const BentoWebsiteReal: React.FC = () => <View v={[450, 190, 1140, 380]}><Screen cfg={website} /></View>;
