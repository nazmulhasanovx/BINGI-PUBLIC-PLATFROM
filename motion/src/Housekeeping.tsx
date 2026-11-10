import React from 'react';
import { C, Stage, Card, Chip, Cursor, useStep, mix } from './kit';

// Clean version: Check out → room "Needs cleaning" → one cleaning task appears and is assigned.
// Booking status and room readiness are separate chips on purpose.
export const Housekeeping: React.FC<{ w?: number; h?: number; lw?: number }> = ({ w = 800, h = 700, lw = 300 }) => {
  const s = useStep();
  const come = s(8, 38), press = s(40, 46) * (1 - s(46, 52)), done = s(48, 56), task = s(64, 88), assign = s(104, 118);
  return (
    <Stage w={w} h={h} lw={lw}>
      <div style={{ position: 'absolute', inset: 12 }}>
        <Card style={{ padding: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Room 204</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {done < 0.5 ? <Chip tone="blue" size={11}>In-house</Chip> : <Chip tone="gray" size={11}>Checked out</Chip>}
            {done < 0.5 ? <Chip tone="green" size={11}>Occupied</Chip> : <Chip tone="amber" size={11}>Needs cleaning</Chip>}
          </div>
          <div style={{ marginTop: 12, height: 32, borderRadius: 99, background: done > 0.5 ? '#EEF0F3' : C.coral, color: done > 0.5 ? C.muted : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 600, scale: String(1 - press * 0.04) }}>
            {done > 0.5 ? 'Checked out' : 'Check out'}
          </div>
        </Card>
        <div style={{ opacity: task, translate: `0 ${(1 - task) * 12}px`, marginTop: 10 }}>
          <Card style={{ padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10, outline: `1.5px solid ${assign > 0.5 ? C.line : C.coral}` }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: C.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🧹</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Clean Room 204</div>
              <div style={{ fontSize: 11, color: C.muted }}>{assign > 0.5 ? 'Mitu' : 'From check-out'}</div>
            </div>
            {assign > 0.5 ? <Chip tone="blue" size={10.5}>Assigned</Chip> : <Chip tone="coral" size={10.5}>New</Chip>}
          </Card>
        </div>
        <Card style={{ marginTop: 8, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🧹</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Clean Room 108</div>
            <div style={{ fontSize: 11, color: C.muted }}>Rafi</div>
          </div>
          <Chip tone="amber" size={10.5}>In progress</Chip>
        </Card>
      </div>
      <Cursor x={mix(come, 250, 160)} y={mix(come, 245, 108)} press={press} size={20} />
    </Stage>
  );
};
