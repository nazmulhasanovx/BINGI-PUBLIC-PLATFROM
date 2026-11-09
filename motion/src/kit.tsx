// Shared look for the BinGi product loops: Pearl Light canvas, white surfaces, coral accent.
// All data is sample data (fictional names / rooms) — no real hotel or guest.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';

export const FONT = 'Instrument Sans';
export const fontsReady = Promise.all(
  ['400', '500', '600'].map((w) =>
    loadFont({ family: FONT, url: staticFile(`fonts/instrument-sans-latin-${w}-normal.woff2`), weight: w }),
  ),
);

export const C = {
  canvas: '#F5F6F8',
  surface: '#FFFFFF',
  line: '#E3E6EC',
  ink: '#0F1720',
  muted: '#5B6573',
  coral: '#FD413F',
  coralSoft: '#FFE7E4',
  brand: '#B11C29',
  green: '#16804A',
  greenSoft: '#D6F0E0',
  amber: '#A35A00',
  amberSoft: '#FFE8C4',
  blue: '#2457D6',
  blueSoft: '#DAE4FF',
  navy: '#12324B',
};

export const LOOP = 180; // 6 s at 30 fps
const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** 0→1 between frames a and b (iOS-like ease), then back to 0 over the last frames so the loop is seamless. */
export const useStep = () => {
  const f = useCurrentFrame();
  const reset = interpolate(f, [LOOP - 22, LOOP - 4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (a: number, b: number) =>
    interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease }) * reset;
};

export const mix = (p: number, a: number, b: number) => a + (b - a) * p;

export const Frame: React.FC<{ children: React.ReactNode; pad?: number }> = ({ children, pad = 36 }) => (
  <AbsoluteFill style={{ background: C.canvas, fontFamily: FONT, color: C.ink, padding: pad }}>{children}</AbsoluteFill>
);

export const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.surface, borderRadius: 22, border: `1.5px solid ${C.line}`, boxShadow: '0 10px 30px rgba(16,24,40,.07)', ...style }}>{children}</div>
);

export const Chip: React.FC<{ tone: 'green' | 'amber' | 'coral' | 'blue' | 'gray'; children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ tone, children, size = 22, style }) => {
  const map = {
    green: [C.greenSoft, C.green],
    amber: [C.amberSoft, C.amber],
    coral: [C.coralSoft, C.brand],
    blue: [C.blueSoft, C.blue],
    gray: ['#EEF0F3', C.muted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.35, background: bg, color: fg, fontSize: size, fontWeight: 600, padding: `${size * 0.3}px ${size * 0.65}px`, borderRadius: 999, whiteSpace: 'nowrap', ...style }}>
      <span style={{ width: size * 0.36, height: size * 0.36, borderRadius: 99, background: fg }} />
      {children}
    </span>
  );
};

/** macOS-style pointer. `press` 0..1 shrinks it for a click. */
export const Cursor: React.FC<{ x: number; y: number; press?: number; size?: number }> = ({ x, y, press = 0, size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', left: x, top: y, scale: String(1 - press * 0.15), filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.25))', zIndex: 50 }}>
    <path d="M4 2l15 11.5-6.6.9 3.9 7.3-3 1.5-3.8-7.4L4 20z" fill="#0F1720" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

/** Click ripple at a point; p 0..1 */
export const Ripple: React.FC<{ x: number; y: number; p: number; color?: string }> = ({ x, y, p, color = C.coral }) =>
  p > 0 && p < 1 ? (
    <div style={{ position: 'absolute', left: x - 40 * p, top: y - 40 * p, width: 80 * p, height: 80 * p, borderRadius: 99, border: `3px solid ${color}`, opacity: 1 - p, zIndex: 49 }} />
  ) : null;

export const taka = (n: number) => '৳' + Math.round(n).toLocaleString('en-US');

/** Clean stage: designs in "logical" px (≈ the size the card shows on desktop) and scales up for a sharp render. */
export const Stage: React.FC<{ w: number; h: number; lw: number; children: React.ReactNode }> = ({ w, h, lw, children }) => {
  const z = w / lw;
  return (
    <AbsoluteFill style={{ background: '#F5F6F8', fontFamily: FONT, color: C.ink }}>
      <div style={{ zoom: z, width: lw, height: h / z, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </AbsoluteFill>
  );
};

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 2px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.06)', ...style }}>{children}</div>
);
