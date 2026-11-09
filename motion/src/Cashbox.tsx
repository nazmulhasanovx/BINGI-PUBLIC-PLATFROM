import React from 'react';
import { C, Stage, Card, Chip, useStep, taka } from './kit';

// Clean version: today's total rolls up, split by method; the day closes when cash matches.
const methods = [
  { m: 'Cash', a: 10500, c: C.green, at: 10 },
  { m: 'Card', a: 8370, c: C.blue, at: 26 },
  { m: 'Mobile banking', a: 4660, c: C.amber, at: 42 },
];
const MAX = 10500;

export const Cashbox: React.FC = () => {
  const s = useStep();
  const p = methods.map((x) => s(x.at, x.at + 30));
  const total = methods.reduce((a, x, i) => a + x.a * p[i], 0);
  const close = s(96, 110);
  return (
    <Stage w={1200} h={750} lw={300}>
      <Card style={{ position: 'absolute', inset: 10, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: C.muted }}>Collected today</div>
          <div style={{ opacity: close }}><Chip tone="green" size={10.5}>Day closed</Chip></div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums' }}>{taka(total)}</div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {methods.map((x, i) => (
            <div key={x.m}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}><span style={{ color: C.muted }}>{x.m}</span><span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{taka(x.a * p[i])}</span></div>
              <div style={{ marginTop: 4, height: 6, borderRadius: 9, background: '#EEF0F3' }}>
                <div style={{ height: 6, borderRadius: 9, width: `${(x.a / MAX) * 100 * p[i]}%`, background: x.c }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Stage>
  );
};
