import React from 'react';
import { C, Stage, Card, useStep, taka } from './kit';

// Clean version: a table order is posted to Room 305 and the room bill grows.
export const Restaurant: React.FC<{ w?: number; h?: number; lw?: number }> = ({ w = 1200, h = 750, lw = 300 }) => {
  const s = useStep();
  const items = [['Biryani', 450, 8], ['Bhuna', 380, 20], ['Soda ×2', 240, 32]] as const;
  const shown = items.map(([, , at]) => s(at, at + 12));
  const total = items.reduce((a, [, p], i) => a + p * shown[i], 0);
  const fly = s(60, 86), line = s(84, 100), bal = s(90, 110);
  return (
    <Stage w={w} h={h} lw={lw}>
      <div style={{ position: 'absolute', inset: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Card style={{ width: 128, padding: 10, translate: `${fly * 20}px 0`, opacity: 1 - fly * 0.35, scale: String(1 - fly * 0.08) }}>
          <div style={{ fontSize: 12, color: C.muted }}>Table 4</div>
          {items.map(([n, p], i) => (
            <div key={n} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 6, opacity: shown[i] }}><span>{n}</span><span>{taka(p)}</span></div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginTop: 8, paddingTop: 7, borderTop: `1px solid ${C.line}` }}><span>Total</span><span>{taka(total)}</span></div>
        </Card>
        <div style={{ fontSize: 14, color: C.coral, opacity: 0.4 + fly * 0.6 }}>→</div>
        <Card style={{ flex: 1, padding: 12 }}>
          <div style={{ fontSize: 12, color: C.muted }}>Room 305 bill</div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{taka(7300 + 1070 * bal)}</div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>Room · 2 nights</div>
          <div style={{ marginTop: 6, opacity: line, translate: `0 ${(1 - line) * 8}px`, background: C.coralSoft, color: C.brand, borderRadius: 8, padding: '5px 8px', fontSize: 11.5, fontWeight: 600, display: 'flex', justifyContent: 'space-between', whiteSpace: 'nowrap', gap: 6 }}><span>+ Restaurant</span><span>{taka(1070)}</span></div>
        </Card>
      </div>
    </Stage>
  );
};
