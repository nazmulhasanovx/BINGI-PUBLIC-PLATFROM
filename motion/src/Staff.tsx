import React from 'react';
import { C, Stage, Card, Chip, useStep } from './kit';

// Clean version: four staff check in through the morning; counters update.
const staff = [
  { n: 'Rafi', r: 'Front desk', st: 'Present', t: '07:56', tone: 'green', at: 12 },
  { n: 'Mitu', r: 'Housekeeping', st: 'Late', t: '08:12', tone: 'amber', at: 32 },
  { n: 'Arif', r: 'Restaurant', st: 'Present', t: '11:52', tone: 'green', at: 52 },
  { n: 'Sumon', r: 'Security', st: 'On leave', t: '', tone: 'gray', at: 72 },
] as const;

export const Staff: React.FC = () => {
  const s = useStep();
  const p = staff.map((x) => s(x.at, x.at + 12));
  const count = (tone: string) => Math.round(staff.reduce((a, x, i) => a + (x.tone === tone ? p[i] : 0), 0));
  return (
    <Stage w={1200} h={750} lw={300}>
      <Card style={{ position: 'absolute', inset: 10, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Today</div>
          <Chip tone="green" size={10.5}>{`${count('green')} in`}</Chip>
          <Chip tone="amber" size={10.5}>{`${count('amber')} late`}</Chip>
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {staff.map((x, i) => (
            <div key={x.n} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 24, height: 24, borderRadius: 99, background: C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>{x.n[0]}</div>
              <div style={{ flex: 1, lineHeight: 1.15 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{x.n}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>{x.r}</div>
              </div>
              <div style={{ opacity: 0.35 + p[i] * 0.65 }}>
                {p[i] > 0.5 ? <Chip tone={x.tone} size={10}>{x.t ? `${x.st} ${x.t}` : x.st}</Chip> : <Chip tone="gray" size={10}>Not in</Chip>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Stage>
  );
};
