import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { C, Frame, Panel, Chip, Cursor, Ripple, useStep, mix } from './kit';

// Check-out → room readiness becomes "Needs cleaning" and a cleaning task appears.
// Booking status and room readiness are shown as separate chips on purpose.
export const Housekeeping: React.FC = () => {
  const f = useCurrentFrame();
  const s = useStep();
  const move = s(10, 42), press = s(44, 52) * (1 - s(52, 58)), done = s(52, 62), task = s(70, 96), assign = s(110, 126);
  const btn = { x: 470, y: 222 };
  return (
    <Frame pad={26}>
      <Panel style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 34, fontWeight: 600 }}>Room 204</div>
          <div style={{ fontSize: 22, color: C.muted }}>Deluxe · 2 guests</div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          {done < 0.5 ? <Chip tone="blue">In-house</Chip> : <Chip tone="gray">Checked out</Chip>}
          {done < 0.5 ? <Chip tone="green">Occupied</Chip> : <Chip tone="amber">Needs cleaning</Chip>}
        </div>
        <div style={{ marginTop: 22, height: 64, borderRadius: 999, background: done > 0.5 ? '#EEF0F3' : C.coral, color: done > 0.5 ? C.muted : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, scale: String(1 - press * 0.04) }}>
          {done > 0.5 ? 'Checked out 11:02' : 'Check out'}
        </div>
      </Panel>
      <div style={{ marginTop: 26, fontSize: 24, fontWeight: 600, color: C.muted, paddingLeft: 6 }}>Housekeeping · Today</div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ height: task * 120, opacity: task, overflow: 'hidden' }}>
          <Panel style={{ padding: '20px 24px', border: `2px solid ${C.coral}`, display: 'flex', alignItems: 'center', gap: 16, translate: `0 ${(1 - task) * -20}px` }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.coralSoft, color: C.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🧹</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 600 }}>Clean Room 204</div>
              <div style={{ fontSize: 19, color: C.muted }}>{assign > 0.5 ? 'Assigned to Mitu' : 'New · from check-out'}</div>
            </div>
            {assign > 0.5 ? <Chip tone="blue" size={19}>Assigned</Chip> : <Chip tone="coral" size={19}>New</Chip>}
          </Panel>
        </div>
        {[['Room 108', 'Mitu', 'In progress', 'amber'], ['Room 312', 'Rafi', 'Ready', 'green']].map(([r, who, st, tone]) => (
          <Panel key={r} style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🧹</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 600 }}>Clean {r}</div>
              <div style={{ fontSize: 19, color: C.muted }}>{who}</div>
            </div>
            <Chip tone={tone as 'amber' | 'green'} size={19}>{st}</Chip>
          </Panel>
        ))}
      </div>
      <Cursor x={mix(move, 700, btn.x)} y={mix(move, 640, btn.y)} press={press} />
      <Ripple x={btn.x - 6} y={btn.y - 4} p={interpolate(f, [50, 66], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
    </Frame>
  );
};
