import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { C, Stage, Card, Chip, Cursor, useStep, mix, taka } from './kit';

// Product loops for the hero, platform and story slots. Designed illustrations in BinGi style with
// SAMPLE data (fictional guests, rooms and amounts) — not screen recordings. Replace with real recordings later.

const roll = (p: number, to: number) => Math.round(to * p);

// ── Hero: HMS Web dashboard (16:9)
export const Dashboard: React.FC = () => {
  const s = useStep();
  const k = [s(6, 40), s(12, 46), s(18, 52), s(24, 58)];
  const rows = [s(40, 56), s(52, 68), s(64, 80)];
  const ready = s(100, 116);
  const nav = ['Dashboard', 'Bookings', 'Rooms', 'Housekeeping', 'Guests', 'Meals', 'Staff', 'Finance', 'Reports'];
  return (
    <Stage w={1600} h={900} lw={880}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <div style={{ width: 170, background: '#fff', borderRight: `1px solid ${C.line}`, padding: '16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px 14px' }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: C.coral }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>BinGi</span>
          </div>
          {nav.map((n, i) => (
            <div key={n} style={{ fontSize: 12, padding: '7px 10px', borderRadius: 8, marginBottom: 2, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? C.brand : C.muted, background: i === 0 ? C.coralSoft : 'transparent' }}>{n}</div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 22 }}>
          <div style={{ fontSize: 12, color: C.muted }}>Monday, 10 November</div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4 }}>Good morning, Rahim</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 14 }}>
            {[['Occupancy', `${roll(k[0], 72)}%`], ['Arriving today', `${roll(k[1], 8)}`], ['Departing today', `${roll(k[2], 5)}`], ['Revenue today', taka(roll(k[3], 48600))]].map(([l, v]) => (
              <Card key={l} style={{ padding: 14 }}>
                <div style={{ fontSize: 11.5, color: C.muted }}>{l}</div>
                <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              </Card>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, marginTop: 12 }}>
            <Card style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Arriving today</div>
              {[['Karim', '101', 'Paid'], ['Sultana', '204', 'Partly paid'], ['Rahman', '305', 'Unpaid']].map(([g, r, pay], i) => (
                <div key={g} style={{ opacity: rows[i], translate: `0 ${(1 - rows[i]) * 8}px`, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: i ? `1px solid ${C.line}` : 'none', marginTop: i ? 0 : 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 99, background: C.navy, color: '#fff', fontSize: 11, fontWeight: 600, display: 'grid', placeItems: 'center' }}>{g[0]}</div>
                  <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{g}<span style={{ fontWeight: 400, color: C.muted }}> · Room {r}</span></div>
                  <Chip tone={pay === 'Paid' ? 'green' : pay === 'Unpaid' ? 'gray' : 'amber'} size={10.5}>{pay}</Chip>
                </div>
              ))}
            </Card>
            <Card style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Rooms to prepare</div>
              {[['204', ready > 0.5], ['305', false]].map(([r, ok]) => (
                <div key={r as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: `1px solid ${C.line}`, marginTop: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>Room {r as string}</span>
                  {ok ? <Chip tone="green" size={10.5}>Ready</Chip> : <Chip tone="amber" size={10.5}>Needs cleaning</Chip>}
                </div>
              ))}
            </Card>
          </div>
          <Card style={{ padding: 14, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}><span>Revenue · last 7 days</span><span style={{ color: C.muted, fontWeight: 500, fontSize: 11.5 }}>Sample data</span></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 46, marginTop: 8 }}>
              {[48, 62, 55, 70, 66, 82, 74].map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v * s(30 + i * 6, 60 + i * 6)}%`, borderRadius: 6, background: i === 6 ? C.coral : '#E7EAF0' }} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Stage>
  );
};

// ── Story 1: bookings from every source land in one list (16:9)
export const BookingsList: React.FC = () => {
  const s = useStep();
  const rows = [
    { id: 'BK-2041', g: 'Karim', src: 'Website', tone: 'blue', at: 10 },
    { id: 'BK-2042', g: 'Sultana', src: 'Marketplace', tone: 'coral', at: 34 },
    { id: 'BK-2043', g: 'Rahman', src: 'Walk-in', tone: 'gray', at: 58 },
    { id: 'BK-2044', g: 'Akter', src: 'Website', tone: 'blue', at: 82 },
  ] as const;
  return (
    <Stage w={1280} h={720} lw={760}>
      <Card style={{ position: 'absolute', inset: 22, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Bookings</div>
          <div style={{ display: 'flex', gap: 6 }}><Chip tone="blue" size={11}>Website</Chip><Chip tone="coral" size={11}>Marketplace</Chip><Chip tone="gray" size={11}>Walk-in</Chip></div>
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '90px 1fr 120px 110px', fontSize: 11.5, color: C.muted, padding: '0 10px 6px' }}><span>Booking ID</span><span>Guest</span><span>Source</span><span>Status</span></div>
        {rows.map((r) => {
          const p = s(r.at, r.at + 16);
          return (
            <div key={r.id} style={{ opacity: p, translate: `0 ${(1 - p) * -14}px`, display: 'grid', gridTemplateColumns: '90px 1fr 120px 110px', alignItems: 'center', fontSize: 13, padding: '11px 10px', borderRadius: 10, background: p < 0.99 ? C.coralSoft : '#F7F8FA', marginTop: 6 }}>
              <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.id}</span>
              <span>{r.g}</span>
              <span><Chip tone={r.tone} size={10.5}>{r.src}</Chip></span>
              <span><Chip tone="green" size={10.5}>Confirmed</Chip></span>
            </div>
          );
        })}
      </Card>
    </Stage>
  );
};

// ── Story 3: check-in on one screen — guest, ID, advance payment (16:9)
export const CheckIn: React.FC = () => {
  const f = useCurrentFrame();
  const s = useStep();
  const typed = (txt: string, a: number, b: number) => txt.slice(0, Math.round(interpolate(f, [a, b], [0, txt.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * (s(a, a + 1) > 0 ? 1 : 0)));
  const pay = s(70, 86), btn = s(96, 102) * (1 - s(102, 108)), done = s(104, 114), come = s(84, 100);
  const field = (label: string, value: string) => (
    <div>
      <div style={{ fontSize: 11.5, color: C.muted }}>{label}</div>
      <div style={{ marginTop: 4, height: 34, borderRadius: 9, border: `1px solid ${C.line}`, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 13 }}>{value}<span style={{ width: 1, height: 16, background: value ? 'transparent' : C.ink }} /></div>
    </div>
  );
  return (
    <Stage w={1280} h={720} lw={760}>
      <div style={{ position: 'absolute', inset: 22, display: 'flex', gap: 14 }}>
        <Card style={{ flex: 1.4, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Check-in · Room 204</div>
            {done > 0.5 ? <Chip tone="blue" size={11}>Checked in</Chip> : <Chip tone="green" size={11}>Confirmed</Chip>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
            {field('Guest name', typed('Sultana Akter', 8, 30))}
            {field('Phone', typed('017XX-XXXXXX', 26, 44))}
            {field('ID type', typed('NID', 44, 50))}
            {field('ID number', typed('•••• •••• 4821', 50, 66))}
          </div>
          <div style={{ marginTop: 16, height: 40, borderRadius: 99, background: done > 0.5 ? C.greenSoft : C.coral, color: done > 0.5 ? C.green : '#fff', display: 'grid', placeItems: 'center', fontSize: 13.5, fontWeight: 600, scale: String(1 - btn * 0.04) }}>{done > 0.5 ? '✓ Checked in' : 'Check in'}</div>
        </Card>
        <Card style={{ flex: 1, padding: 20 }}>
          <div style={{ fontSize: 12, color: C.muted }}>Room bill</div>
          <div style={{ fontSize: 24, fontWeight: 600, marginTop: 2 }}>{taka(7000)}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Deluxe · 2 nights</div>
          <div style={{ marginTop: 14, opacity: pay, translate: `0 ${(1 - pay) * 8}px`, display: 'flex', justifyContent: 'space-between', background: C.greenSoft, color: C.green, borderRadius: 9, padding: '8px 10px', fontSize: 12.5, fontWeight: 600 }}><span>Advance · Cash</span><span>− {taka(2000)}</span></div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Balance</span>
            <span style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{taka(7000 - 2000 * pay)}</span>
          </div>
          <div style={{ marginTop: 10 }}>{pay > 0.5 ? <Chip tone="amber" size={10.5}>Partly paid</Chip> : <Chip tone="gray" size={10.5}>Unpaid</Chip>}</div>
        </Card>
      </div>
      <Cursor x={mix(come, 600, 230)} y={mix(come, 330, 175)} press={btn} size={18} />
    </Stage>
  );
};

// ── Phone shell (portrait). lw 390 ≈ an iPhone screen width.
const Phone: React.FC<{ children: React.ReactNode; tabs?: string[]; active?: number }> = ({ children, tabs, active = 0 }) => (
  <Stage w={660} h={1434} lw={300}>
    <div style={{ position: 'absolute', inset: 0, background: '#F5F6F8' }}>
      <div style={{ height: 54 }} />
      <div style={{ padding: '0 16px' }}>{children}</div>
      {tabs && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 78, background: '#fff', borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-around', paddingTop: 10 }}>
          {tabs.map((t, i) => (
            <div key={t} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 600, color: i === active ? C.brand : C.muted }}>
              <div style={{ width: 22, height: 22, margin: '0 auto 4px', borderRadius: 7, background: i === active ? C.coralSoft : '#EEF0F3' }} />{t}
            </div>
          ))}
        </div>
      )}
    </div>
  </Stage>
);

// ── Guest App / Marketplace: search → hotel → book
export const GuestApp: React.FC = () => {
  const s = useStep();
  const cards = [s(10, 26), s(20, 36), s(30, 46)];
  const open = s(70, 92), booked = s(110, 122);
  const hotels = [['Hotel Sample', "Cox's Bazar", 6500, 'linear-gradient(135deg,#8ED3C6,#2F8FA3)'], ['Hill View Stay', 'Sylhet', 4200, 'linear-gradient(135deg,#B9D9A8,#4E8A5B)'], ['Riverside Inn', 'Dhaka', 5100, 'linear-gradient(135deg,#E9C9A8,#B9805A)']] as const;
  return (
    <Phone tabs={['Explore', 'Trips', 'Chat', 'Profile']}>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.5 }}>Find a stay</div>
      <div style={{ marginTop: 10, height: 44, borderRadius: 14, background: '#fff', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 14, color: C.muted }}>Cox's Bazar · 2 guests</div>
      <div style={{ position: 'relative', marginTop: 14 }}>
        {hotels.map(([n, c, p, bg], i) => (
          <Card key={n} style={{ marginBottom: 12, overflow: 'hidden', opacity: cards[i] * (i === 0 ? 1 : 1 - open), translate: `0 ${(1 - cards[i]) * 16}px` }}>
            <div style={{ height: 120, background: bg }} />
            <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: 15, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: C.muted }}>{c}</div></div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{taka(p)}<span style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>/night</span></div>
            </div>
          </Card>
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: open, translate: `0 ${(1 - open) * 30}px` }}>
          <Card style={{ overflow: 'hidden' }}>
            <div style={{ height: 210, background: hotels[0][3] }} />
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Hotel Sample</div>
              <div style={{ fontSize: 12.5, color: C.muted }}>Cox's Bazar · Deluxe King</div>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: C.muted }}>12 – 14 Nov · 2 nights</span><span style={{ fontWeight: 600 }}>{taka(13000)}</span></div>
              <div style={{ marginTop: 14, height: 46, borderRadius: 14, background: booked > 0.5 ? C.greenSoft : C.coral, color: booked > 0.5 ? C.green : '#fff', display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 600 }}>{booked > 0.5 ? '✓ Booking sent' : 'Book now'}</div>
            </div>
          </Card>
        </div>
      </div>
    </Phone>
  );
};

// ── HMS Mobile: reception "Today"
export const MobileToday: React.FC = () => {
  const s = useStep();
  const rows = [s(10, 26), s(22, 38), s(34, 50)];
  const ci = s(80, 92);
  return (
    <Phone tabs={['Today', 'Calendar', 'Rooms', 'Inbox', 'More']}>
      <div style={{ fontSize: 13, color: C.muted }}>Monday, 10 Nov</div>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.5 }}>Today</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
        {[['Arrivals', 8], ['Departures', 5]].map(([l, v]) => (
          <Card key={l as string} style={{ padding: 12 }}><div style={{ fontSize: 12, color: C.muted }}>{l as string}</div><div style={{ fontSize: 24, fontWeight: 600 }}>{v as number}</div></Card>
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: C.muted }}>ARRIVING</div>
      {[['Karim', '101'], ['Sultana', '204'], ['Rahman', '305']].map(([g, r], i) => (
        <Card key={g} style={{ marginTop: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 10, opacity: rows[i], translate: `0 ${(1 - rows[i]) * 10}px` }}>
          <div style={{ width: 34, height: 34, borderRadius: 99, background: C.navy, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>{g[0]}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600 }}>{g}</div><div style={{ fontSize: 12, color: C.muted }}>Room {r}</div></div>
          {i === 1
            ? <div style={{ height: 32, padding: '0 12px', borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 600, background: ci > 0.5 ? C.greenSoft : C.coral, color: ci > 0.5 ? C.green : '#fff' }}>{ci > 0.5 ? '✓ In' : 'Check in'}</div>
            : <Chip tone="gray" size={10.5}>Expected</Chip>}
        </Card>
      ))}
    </Phone>
  );
};
