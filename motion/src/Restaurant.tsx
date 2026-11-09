import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { C, Frame, Panel, Chip, Cursor, Ripple, useStep, mix, taka } from './kit';

// Restaurant POS: items added, order posted to Room 305; the room bill gains a Restaurant line.
const items = [
  { n: 'Chicken biryani', p: 450, at: 14 },
  { n: 'Beef bhuna', p: 380, at: 30 },
  { n: 'Lime soda ×2', p: 240, at: 46 },
  { n: 'Firni', p: 150, at: 60 },
];

export const Restaurant: React.FC = () => {
  const f = useCurrentFrame();
  const s = useStep();
  const shown = items.map((it) => s(it.at, it.at + 14));
  const total = items.reduce((a, it, i) => a + it.p * shown[i], 0);
  const move = s(70, 94), press = s(96, 102) * (1 - s(102, 108)), posted = s(104, 114), line = s(114, 134), bal = s(122, 144);
  const btn = { x: 360, y: 610 };
  return (
    <Frame pad={30}>
      <div style={{ display: 'flex', gap: 26, height: '100%' }}>
        <Panel style={{ flex: 1, padding: 30, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 600 }}>Order · Table 4</div>
            <Chip tone="blue" size={20}>Dine-in</Chip>
          </div>
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {items.map((it, i) => (
              <div key={it.n} style={{ opacity: shown[i], translate: `${(1 - shown[i]) * -30}px 0`, display: 'flex', justifyContent: 'space-between', fontSize: 25, padding: '14px 18px', borderRadius: 14, background: '#F6F7F9' }}>
                <span>{it.n}</span><span style={{ fontWeight: 600 }}>{taka(it.p)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, fontWeight: 600, borderTop: `1.5px solid ${C.line}`, paddingTop: 18 }}>
            <span>Total</span><span>{taka(total)}</span>
          </div>
          <div style={{ marginTop: 18, height: 70, borderRadius: 999, background: posted > 0.5 ? C.green : C.coral, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 25, fontWeight: 600, scale: String(1 - press * 0.04) }}>
            {posted > 0.5 ? '✓ Posted to Room 305' : 'Post to room bill · 305'}
          </div>
        </Panel>
        <Panel style={{ width: 470, padding: 30 }}>
          <div style={{ fontSize: 22, color: C.muted }}>Room bill</div>
          <div style={{ fontSize: 32, fontWeight: 600, marginTop: 4 }}>Room 305 · Haque</div>
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 23 }}>
            {[['Room · 2 nights', 7000], ['Laundry', 300]].map(([n, p]) => (
              <div key={n as string} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: C.muted }}>{n}</span><span>{taka(p as number)}</span></div>
            ))}
            <div style={{ height: line * 54, opacity: line, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: C.coralSoft, color: C.brand, borderRadius: 12, padding: '12px 14px', fontWeight: 600 }}><span>Restaurant · Table 4</span><span>{taka(1220)}</span></div>
            </div>
          </div>
          <div style={{ marginTop: 22, borderTop: `1.5px solid ${C.line}`, paddingTop: 18, display: 'flex', justifyContent: 'space-between', fontSize: 28, fontWeight: 600 }}>
            <span>Balance due</span><span>{taka(7300 + 1220 * bal)}</span>
          </div>
          <div style={{ marginTop: 16 }}><Chip tone="amber" size={20}>Payment: due at check-out</Chip></div>
        </Panel>
      </div>
      <Cursor x={mix(move, 800, btn.x)} y={mix(move, 380, btn.y)} press={press} />
      <Ripple x={btn.x - 4} y={btn.y - 4} p={interpolate(f, [102, 118], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} color={C.green} />
    </Frame>
  );
};
