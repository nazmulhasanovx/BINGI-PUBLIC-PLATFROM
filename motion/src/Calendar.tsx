import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { C, Frame, Panel, Chip, Cursor, Ripple, useStep, mix } from './kit';

// Booking calendar: a booking is dragged from Room 102 to Room 201 and a toast confirms the move.
const days = ['Mon 10', 'Tue 11', 'Wed 12', 'Thu 13', 'Fri 14', 'Sat 15', 'Sun 16', 'Mon 17'];
const rooms = ['101', '102', '103', '201', '202', '203'];
const LEFT = 150, TOP = 92, COL = 172, ROW = 78;

const bars = [
  { r: 0, d: 0, n: 3, name: 'Karim · 3 nights', tone: C.blue, soft: C.blueSoft },
  { r: 2, d: 2, n: 2, name: 'Sultana · 2 nights', tone: C.green, soft: C.greenSoft },
  { r: 4, d: 4, n: 3, name: 'Hossain · 3 nights', tone: C.amber, soft: C.amberSoft },
  { r: 5, d: 0, n: 2, name: 'Akter · 2 nights', tone: C.blue, soft: C.blueSoft },
  { r: 3, d: 5, n: 2, name: 'Islam · 2 nights', tone: C.green, soft: C.greenSoft },
];

export const Calendar: React.FC = () => {
  const f = useCurrentFrame();
  const s = useStep();
  const approach = s(8, 40), grab = s(42, 50), drag = s(52, 96), drop = s(98, 106), toast = s(104, 120);
  // dragged booking: Room 102, Tue → Room 201, Thu
  const bx = LEFT + mix(drag, 1, 3) * COL + 6;
  const by = TOP + mix(drag, 1, 3) * ROW + 8;
  const lift = grab * (1 - drop);
  const startX = 1400, startY = 620;
  const cx = mix(approach, startX, LEFT + 1 * COL + 120) + (bx - (LEFT + COL + 6)) * (drag > 0 ? 1 : 0);
  const cy = mix(approach, startY, TOP + 1 * ROW + 30) + (by - (TOP + ROW + 8)) * (drag > 0 ? 1 : 0);
  return (
    <Frame pad={28}>
      <Panel style={{ position: 'absolute', inset: 28, overflow: 'hidden' }}>
        {/* header */}
        <div style={{ position: 'absolute', left: 30, top: 22, right: 30, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ fontSize: 30, fontWeight: 600 }}>Booking calendar</div>
          <Chip tone="gray" size={20}>Nov 10 – 17</Chip>
          <div style={{ flex: 1 }} />
          <Chip tone="green" size={20}>Confirmed</Chip>
          <Chip tone="amber" size={20}>Pending</Chip>
        </div>
        {/* grid */}
        {days.map((d, i) => (
          <div key={d} style={{ position: 'absolute', left: LEFT + i * COL, top: TOP - 30, width: COL, textAlign: 'center', fontSize: 20, fontWeight: 500, color: i === 3 ? C.brand : C.muted }}>{d}</div>
        ))}
        {rooms.map((r, i) => (
          <React.Fragment key={r}>
            <div style={{ position: 'absolute', left: 30, top: TOP + i * ROW, height: ROW, display: 'flex', alignItems: 'center', fontSize: 24, fontWeight: 600 }}>Room {r}</div>
            <div style={{ position: 'absolute', left: LEFT, right: 0, top: TOP + i * ROW, height: ROW, borderTop: `1.5px solid ${C.line}`, background: i % 2 ? '#FAFBFC' : '#fff' }} />
          </React.Fragment>
        ))}
        {days.map((d, i) => (
          <div key={'v' + d} style={{ position: 'absolute', left: LEFT + i * COL, top: TOP, bottom: 0, borderLeft: `1.5px solid ${C.line}` }} />
        ))}
        {/* drop target hint */}
        <div style={{ position: 'absolute', left: LEFT + 3 * COL + 4, top: TOP + 3 * ROW + 6, width: 2 * COL - 8, height: ROW - 12, borderRadius: 14, border: `2.5px dashed ${C.coral}`, opacity: grab * (1 - drop) }} />
        {bars.map((b) => (
          <div key={b.name} style={{ position: 'absolute', left: LEFT + b.d * COL + 6, top: TOP + b.r * ROW + 8, width: b.n * COL - 12, height: ROW - 16, borderRadius: 14, background: b.soft, borderLeft: `6px solid ${b.tone}`, display: 'flex', alignItems: 'center', paddingLeft: 16, fontSize: 21, fontWeight: 600, color: b.tone }}>{b.name}</div>
        ))}
        {/* dragged booking */}
        <div style={{ position: 'absolute', left: bx, top: by, width: 2 * COL - 12, height: ROW - 16, borderRadius: 14, background: C.coral, color: '#fff', display: 'flex', alignItems: 'center', paddingLeft: 18, fontSize: 21, fontWeight: 600, boxShadow: `0 ${8 + lift * 18}px ${16 + lift * 26}px rgba(253,65,63,${0.18 + lift * 0.22})`, scale: String(1 + lift * 0.04), zIndex: 10 }}>Rahman · 2 nights</div>
        <Cursor x={cx} y={cy} press={grab * (1 - drop)} />
        <Ripple x={LEFT + 3 * COL + 120} y={TOP + 3 * ROW + 40} p={interpolate(f, [98, 116], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
        {/* toast */}
        <div style={{ position: 'absolute', right: 30, bottom: 24, opacity: toast, translate: `0 ${(1 - toast) * 30}px`, background: C.ink, color: '#fff', borderRadius: 16, padding: '16px 22px', fontSize: 22, fontWeight: 500, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#7EE2A8' }}>✓</span> Moved to Room 201 · Thu 13 – Sat 15
        </div>
      </Panel>
    </Frame>
  );
};
