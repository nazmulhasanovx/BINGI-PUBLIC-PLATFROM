import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { C, Frame, Panel, LOOP } from './kit';

// Hotel website themes: the same hotel content re-dressed as NEST → CITY → ESCAPE → GRAND.
// Theme names are BinGi's theme set; the hotel is placeholder sample content (no real brand).
const themes = [
  { id: 'NEST', bg: '#FBF7F2', ink: '#2C2219', acc: '#C0623A', hero: 'linear-gradient(135deg,#E9C9A8,#B9805A)', font: 'Georgia, serif', align: 'left' as const },
  { id: 'CITY', bg: '#0F1720', ink: '#FFFFFF', acc: '#FD413F', hero: 'linear-gradient(135deg,#2A3B52,#0B1422)', font: 'Instrument Sans', align: 'left' as const },
  { id: 'ESCAPE', bg: '#F1F8F6', ink: '#0F3B36', acc: '#0E8F7E', hero: 'linear-gradient(135deg,#8ED3C6,#2F8FA3)', font: 'Instrument Sans', align: 'center' as const },
  { id: 'GRAND', bg: '#14110D', ink: '#F4E9D3', acc: '#C9A45C', hero: 'linear-gradient(135deg,#4A3A22,#1B150D)', font: 'Georgia, serif', align: 'center' as const },
];
const SEG = LOOP / 4;

export const Website: React.FC = () => {
  const f = useCurrentFrame();
  const idx = Math.floor(f / SEG) % 4;
  const local = f - idx * SEG;
  const fade = interpolate(local, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const t = themes[idx];
  const prev = themes[(idx + 3) % 4];
  const page = (th: typeof t, o: number) => (
    <div style={{ position: 'absolute', inset: 0, background: th.bg, color: th.ink, fontFamily: th.font, opacity: o, display: 'flex', gap: 40, padding: 40 }}>
      <div style={{ flex: 1.3, borderRadius: 26, background: th.hero, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: th.align === 'center' ? 'center' : 'flex-start', padding: 44, textAlign: th.align }}>
        <div style={{ fontSize: 28, letterSpacing: 4, color: '#fff', opacity: 0.85 }}>SAMPLE HOTEL</div>
        <div style={{ fontSize: 84, fontWeight: 600, color: '#fff', lineHeight: 1.02, marginTop: 8 }}>Your Hotel</div>
        <div style={{ marginTop: 22, background: th.acc, color: '#fff', borderRadius: 999, padding: '18px 36px', fontSize: 28, fontWeight: 600, fontFamily: FONTFIX }}>Book direct</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 34, fontWeight: 600 }}>Rooms</div>
        {[['Deluxe King', '৳6,500'], ['Twin Sea View', '৳7,800'], ['Family Suite', '৳11,000']].map(([n, p]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 20, borderRadius: 18, border: `2px solid ${th.ink}22`, padding: 16 }}>
            <div style={{ width: 120, height: 84, borderRadius: 12, background: th.hero }} />
            <div style={{ flex: 1, fontSize: 28, fontWeight: 600 }}>{n}</div>
            <div style={{ fontSize: 26, color: th.acc, fontWeight: 600, fontFamily: FONTFIX }}>{p}<span style={{ fontSize: 20, opacity: 0.7 }}> /night</span></div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Frame pad={30}>
      <Panel style={{ position: 'absolute', inset: 30, overflow: 'hidden' }}>
        {/* browser bar + theme switcher */}
        <div style={{ height: 84, display: 'flex', alignItems: 'center', gap: 14, padding: '0 30px', borderBottom: `1.5px solid ${C.line}` }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{ width: 18, height: 18, borderRadius: 99, background: c }} />)}
          <div style={{ marginLeft: 20, background: '#F2F4F7', borderRadius: 12, padding: '10px 22px', fontSize: 22, color: C.muted }}>yourhotel.com</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 22, color: C.muted, marginRight: 8 }}>Theme</div>
          <div style={{ display: 'flex', background: '#F2F4F7', borderRadius: 999, padding: 6, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 6, left: 6 + interpolate(local, [0, 12], [((idx + 3) % 4) * 150, idx * 150], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }), width: 150, height: 50, borderRadius: 999, background: C.ink }} />
            {themes.map((th, i) => (
              <div key={th.id} style={{ width: 150, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, fontWeight: 600, letterSpacing: 1.5, color: i === idx ? '#fff' : C.muted, position: 'relative' }}>{th.id}</div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', top: 84, left: 0, right: 0, bottom: 0 }}>
          {page(prev, 1 - fade)}
          {page(t, fade)}
        </div>
      </Panel>
    </Frame>
  );
};
const FONTFIX = 'Instrument Sans';
