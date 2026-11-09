import React from 'react';
import { C, Frame, Panel, Chip, useStep } from './kit';

// Staff & HRM: attendance check-ins arrive across the morning; shift bars fill; summary counts update.
const staff = [
  { n: 'Rafi Ahmed', r: 'Front desk', shift: 'Morning', s: 0, e: 4, in: '07:56', st: 'Present', at: 14 },
  { n: 'Nusrat Jahan', r: 'Front desk', shift: 'Evening', s: 4, e: 8, in: '', st: 'Scheduled', at: 999 },
  { n: 'Mitu Begum', r: 'Housekeeping', shift: 'Morning', s: 0, e: 4, in: '08:12', st: 'Late', at: 34 },
  { n: 'Arif Hasan', r: 'Restaurant', shift: 'Day', s: 2, e: 6, in: '11:52', st: 'Present', at: 54 },
  { n: 'Sumon Das', r: 'Security', shift: 'Day', s: 2, e: 6, in: '', st: 'On leave', at: 70 },
];
const hours = ['8 AM', '10', '12 PM', '2', '4', '6', '8', '10 PM'];

export const Staff: React.FC = () => {
  const s = useStep();
  const shown = staff.map((p) => (p.at > 900 ? 0 : s(p.at, p.at + 14)));
  const present = shown.reduce((a, v, i) => a + (staff[i].st === 'Present' || staff[i].st === 'Late' ? v : 0), 0);
  return (
    <Frame pad={30}>
      <Panel style={{ position: 'absolute', inset: 30, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 32, fontWeight: 600, flex: 1 }}>Attendance · Today</div>
          <Chip tone="green" size={20}>{`Present ${Math.round(present)}`}</Chip>
          <Chip tone="amber" size={20}>{`Late ${Math.round(shown[2])}`}</Chip>
          <Chip tone="gray" size={20}>{`Leave ${Math.round(shown[4])}`}</Chip>
        </div>
        <div style={{ display: 'flex', marginTop: 20, marginLeft: 470, marginRight: 16, fontSize: 18, color: C.muted }}>
          {hours.map((h) => <div key={h} style={{ flex: 1 }}>{h}</div>)}
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {staff.map((p, i) => {
            const v = shown[i];
            const tone = p.st === 'Present' ? 'green' : p.st === 'Late' ? 'amber' : p.st === 'On leave' ? 'gray' : 'blue';
            const col = tone === 'green' ? C.green : tone === 'amber' ? C.amber : tone === 'gray' ? '#9AA3AF' : C.blue;
            return (
              <div key={p.n} style={{ display: 'flex', alignItems: 'center', height: 92, borderRadius: 16, background: '#F7F8FA' }}>
                <div style={{ width: 470, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 99, background: C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600 }}>{p.n.split(' ').map((x) => x[0]).join('')}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{p.n}</div>
                    <div style={{ fontSize: 18, color: C.muted, whiteSpace: 'nowrap' }}>{p.r} · {p.shift}</div>
                  </div>
                  <div style={{ width: 150, display: 'flex', justifyContent: 'flex-end', paddingRight: 14 }}>
                    {p.at > 900 ? <Chip tone="blue" size={17}>Scheduled</Chip> : v > 0.5 ? <Chip tone={tone as 'green'} size={17}>{p.in ? `${p.st} ${p.in}` : p.st}</Chip> : <Chip tone="gray" size={17}>Not in</Chip>}
                  </div>
                </div>
                <div style={{ flex: 1, position: 'relative', height: 30, marginRight: 16 }}>
                  <div style={{ position: 'absolute', left: `${(p.s / 8) * 100}%`, width: `${((p.e - p.s) / 8) * 100}%`, height: 30, borderRadius: 10, border: `2px dashed ${col}`, opacity: 0.5 }} />
                  {p.st !== 'On leave' && p.at < 900 && (
                    <div style={{ position: 'absolute', left: `${(p.s / 8) * 100}%`, width: `${((p.e - p.s) / 8) * 100 * v}%`, height: 30, borderRadius: 10, background: col }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </Frame>
  );
};
