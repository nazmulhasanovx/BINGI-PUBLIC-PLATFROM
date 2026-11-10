import React from 'react';
import { C, Stage, Card, Cursor, useStep, mix } from './kit';

// Clean version: 4 rooms × 5 nights. One booking is dragged to Room 201; a small toast confirms.
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const rooms = ['101', '102', '201', '202'];
const L = 70, T = 38, COL = 100, ROW = 46;

const bars = [
  { r: 0, d: 0, n: 2, name: 'Karim', c: C.blue, s: C.blueSoft },
  { r: 2, d: 3, n: 2, name: 'Islam', c: C.green, s: C.greenSoft },
  { r: 3, d: 1, n: 2, name: 'Hossain', c: C.amber, s: C.amberSoft },
];

export const Calendar: React.FC<{ w?: number; h?: number; lw?: number }> = ({ w = 1600, h = 700, lw = 600 }) => {
  const s = useStep();
  const come = s(6, 36), grab = s(38, 46), drag = s(48, 92), drop = s(94, 102), toast = s(100, 116);
  const bx = L + mix(drag, 0, 1) * COL + 3;
  const by = T + mix(drag, 1, 2) * ROW + 5;
  const lift = grab * (1 - drop);
  const hx = L + 40, hy = T + ROW + 18; // grab point on the bar at rest
  const cx = drag > 0 ? bx + 37 : mix(come, 560, hx);
  const cy = drag > 0 ? by + 13 : mix(come, 270, hy);
  return (
    <Stage w={w} h={h} lw={lw}>
      <Card style={{ position: 'absolute', inset: 14 }}>
        {days.map((d, i) => (
          <div key={d} style={{ position: 'absolute', left: L - 14 + i * COL, top: 12, width: COL, textAlign: 'center', fontSize: 12, fontWeight: 500, color: C.muted }}>{d}</div>
        ))}
        {rooms.map((r, i) => (
          <React.Fragment key={r}>
            <div style={{ position: 'absolute', left: 14, top: T + i * ROW, height: ROW, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>{r}</div>
            {i > 0 && <div style={{ position: 'absolute', left: 14, right: 14, top: T + i * ROW, borderTop: `1px solid ${C.line}` }} />}
          </React.Fragment>
        ))}
        <div style={{ position: 'absolute', left: L - 14 + COL, top: T + 2 * ROW + 5, width: 2 * COL - 6, height: ROW - 10, borderRadius: 9, border: `1.5px dashed ${C.coral}`, opacity: lift }} />
        {bars.map((b) => (
          <div key={b.name} style={{ position: 'absolute', left: L - 14 + b.d * COL + 3, top: T + b.r * ROW + 5, width: b.n * COL - 6, height: ROW - 10, borderRadius: 9, background: b.s, color: b.c, display: 'flex', alignItems: 'center', paddingLeft: 10, fontSize: 12.5, fontWeight: 600 }}>{b.name}</div>
        ))}
        <div style={{ position: 'absolute', left: bx - 14, top: by, width: 2 * COL - 6, height: ROW - 10, borderRadius: 9, background: C.coral, color: '#fff', display: 'flex', alignItems: 'center', paddingLeft: 10, fontSize: 12.5, fontWeight: 600, boxShadow: `0 ${4 + lift * 10}px ${10 + lift * 16}px rgba(253,65,63,${0.2 + lift * 0.2})`, scale: String(1 + lift * 0.03) }}>Rahman · 2 nights</div>
        <div style={{ position: 'absolute', right: 14, bottom: 12, opacity: toast, translate: `0 ${(1 - toast) * 10}px`, background: C.ink, color: '#fff', borderRadius: 10, padding: '7px 12px', fontSize: 12, fontWeight: 500 }}>✓ Moved to Room 201</div>
      </Card>
      <Cursor x={cx} y={cy} press={lift} size={20} />
    </Stage>
  );
};
