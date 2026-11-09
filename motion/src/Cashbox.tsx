import React from 'react';
import { C, Frame, Panel, Chip, useStep, taka } from './kit';

// Cashbox: today's payments arrive, totals by method add up, day closes with counted = expected.
const pays = [
  { t: '09:12', who: 'Room 102 · Karim', m: 'Cash', a: 4500, at: 10 },
  { t: '10:40', who: 'Room 305 · Haque', m: 'Card', a: 8370, at: 26 },
  { t: '12:05', who: 'Restaurant · Table 2', m: 'Mobile banking', a: 1260, at: 42 },
  { t: '13:30', who: 'Room 201 · Rahman', m: 'Cash', a: 6000, at: 58 },
  { t: '15:20', who: 'Room 103 · Sultana', m: 'Mobile banking', a: 3400, at: 74 },
];

export const Cashbox: React.FC = () => {
  const s = useStep();
  const shown = pays.map((p) => s(p.at, p.at + 16));
  const sum = (m?: string) => pays.reduce((a, p, i) => a + (m && p.m !== m ? 0 : p.a * shown[i]), 0);
  const close = s(100, 118);
  return (
    <Frame pad={30}>
      <div style={{ display: 'flex', gap: 26, height: '100%' }}>
        <Panel style={{ flex: 1, padding: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 600 }}>Payments · Today</div>
            <Chip tone="gray" size={20}>Front desk</Chip>
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pays.map((p, i) => (
              <div key={p.t} style={{ opacity: shown[i], translate: `0 ${(1 - shown[i]) * 24}px`, display: 'flex', alignItems: 'center', gap: 16, padding: '19px 18px', borderRadius: 14, background: '#F6F7F9', fontSize: 23 }}>
                <span style={{ color: C.muted, width: 72 }}>{p.t}</span>
                <span style={{ flex: 1, fontWeight: 500 }}>{p.who}</span>
                <Chip tone={p.m === 'Cash' ? 'green' : p.m === 'Card' ? 'blue' : 'amber'} size={18}>{p.m}</Chip>
                <span style={{ fontWeight: 600, width: 120, textAlign: 'right' }}>{taka(p.a)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel style={{ width: 400, padding: 30, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 22, color: C.muted }}>Collected today</div>
          <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: -1.5, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{taka(sum())}</div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14, fontSize: 23 }}>
            {['Cash', 'Card', 'Mobile banking'].map((m) => (
              <div key={m} style={{ display: 'flex', justifyContent: 'space-between', fontVariantNumeric: 'tabular-nums' }}><span style={{ color: C.muted }}>{m}</span><span style={{ fontWeight: 600 }}>{taka(sum(m))}</span></div>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: `1.5px solid ${C.line}`, paddingTop: 16, fontSize: 21, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: C.muted }}>Cash counted</span><span style={{ fontWeight: 600 }}>{taka(10500 * close)}</span>
          </div>
          <div style={{ marginTop: 16, height: 66, borderRadius: 999, background: close > 0.5 ? C.greenSoft : C.ink, color: close > 0.5 ? C.green : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, fontWeight: 600 }}>
            {close > 0.5 ? '✓ Day closed · matches' : 'Close day'}
          </div>
        </Panel>
      </div>
    </Frame>
  );
};
