// BinGi HMS Mobile — real iPhone 16 Pro Max screenshots (12 Nov 2026) as one app tour:
// splash → dashboard (scrolls to Room status + recent bookings) → Staff tab → dark mode.
// The test property's name and a staff member's email, phone and pay are softly blurred; nothing else is changed.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const MOBILE_LOOP = 360; // 12 s
const W = 1320, H = 2868; // screenshot pixels; the composition scales them down
const HEAD = 360, NAV = 2640, OFF = 1172; // fixed header bottom, bottom-nav top, scroll offset between the two dashboard shots
const ease = Easing.bezier(0.32, 0.72, 0, 1);

const Blur: React.FC<{ x: number; y: number; w: number; h: number; tint?: string }> = ({ x, y, w, h, tint = 'rgba(255,255,255,0.08)' }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 18, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', background: tint }} />
);

const Tap: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(f, [at * fps, (at + 0.5) * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (p <= 0 || p >= 1) return null;
  const r = 40 + 90 * p;
  return <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999, background: `rgba(177,28,41,${0.28 * (1 - p)})`, border: `4px solid rgba(177,28,41,${0.5 * (1 - p)})` }} />;
};

const src = (n: string) => staticFile(`mobile/${n}.webp`);
const slice = (n: string, sy: number, sh: number, dy: number): React.CSSProperties => ({
  position: 'absolute', left: 0, top: dy, width: W, height: sh, backgroundImage: `url(${src(n)})`, backgroundSize: `${W}px ${H}px`, backgroundPosition: `0 -${sy}px`,
});

export const MobileTour: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = (a: number, b: number) => interpolate(f, [a * fps, b * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const z = width / W;

  const dashIn = t(1.4, 1.9);
  const scroll = t(2.6, 4.4) * (1 - t(4.9, 5.4)) * OFF; // scroll down, then back to top before switching tab
  const staffIn = t(5.9, 6.4);
  const darkIn = t(9.2, 9.7);
  const back = t(11.3, 11.9); // fade to splash for a clean loop

  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <div style={{ width: W, height: H, zoom: z, position: 'relative', overflow: 'hidden' }}>
        {/* 1 · splash */}
        <Img src={src('splash')} style={{ position: 'absolute', inset: 0, width: W, height: H }} />

        {/* 2 · dashboard (light) with scrolling content between fixed header and tab bar */}
        <div style={{ position: 'absolute', inset: 0, opacity: dashIn * (1 - back), scale: String(0.97 + 0.03 * dashIn) }}>
          <div style={slice('dash', 0, H, 0)} />
          <div style={{ position: 'absolute', left: 0, top: HEAD, width: W, height: NAV - HEAD, overflow: 'hidden', background: '#F6F7F9' }}>
            <div style={{ position: 'absolute', left: 0, top: -scroll, width: W }}>
              <div style={slice('dash', HEAD, NAV - HEAD, 0)} />
              <div style={slice('dash2', NAV - OFF, OFF, NAV - HEAD)} />
              <Blur x={230} y={570 - HEAD} w={720} h={82} />
            </div>
          </div>
          <Tap x={513} y={2700} at={5.5} />
        </div>

        {/* 3 · Staff tab */}
        <div style={{ position: 'absolute', inset: 0, opacity: (1 - back), translate: `${(1 - staffIn) * W}px 0`, boxShadow: '-30px 0 60px rgba(0,0,0,0.12)' }}>
          {staffIn > 0 && (
            <>
              <Img src={src('staff')} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
              <Blur x={200} y={2355} w={430} h={72} tint="rgba(255,255,255,0.25)" />
              <Blur x={755} y={2355} w={330} h={72} tint="rgba(255,255,255,0.25)" />
              <Blur x={920} y={2500} w={380} h={72} tint="rgba(255,240,240,0.3)" />
              <Blur x={30} y={2580} w={1270} h={60} tint="rgba(255,240,240,0.3)" />
              <Tap x={370} y={810} at={7.6} />
            </>
          )}
        </div>

        {/* 4 · dark mode */}
        <div style={{ position: 'absolute', inset: 0, opacity: darkIn * (1 - back) }}>
          <Img src={src('dashDark')} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
          <Blur x={950 - 720} y={570} w={720} h={82} tint="rgba(0,0,0,0.05)" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── BinGi Guest App — real iPhone screenshots (12 Nov 2026): search → hotel → room → Book Now ── */
export const GUEST_LOOP = 360; // 12 s
const GW = 1186, GH = 2576;
const gsrc = (n: string) => staticFile(`guest/${n}.webp`);

export const GuestTour: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = (a: number, b: number) => interpolate(f, [a * fps, b * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const z = width / GW;
  const sheet = t(2.2, 2.8);
  const hotel = t(4.4, 4.9);
  const room = t(8.0, 8.5);
  const back = t(11.3, 11.9);
  const press = (at: number) => 1 - 0.04 * Math.max(0, 1 - Math.abs(f - at * fps) / 5);
  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <div style={{ width: GW, height: GH, zoom: z, position: 'relative', overflow: 'hidden' }}>
        <Img src={gsrc('home')} style={{ position: 'absolute', inset: 0, width: GW, height: GH }} />
        <Tap x={590} y={503} at={1.7} />

        {/* search sheet: dimmed home + sheet sliding up */}
        <div style={{ position: 'absolute', inset: 0, opacity: (1 - back) * (sheet > 0 ? 1 : 0) }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: GW, height: 660, backgroundImage: `url(${gsrc('search')})`, backgroundSize: `${GW}px ${GH}px`, opacity: sheet }} />
          <div style={{ position: 'absolute', left: 0, top: 640, width: GW, height: GH - 640, backgroundImage: `url(${gsrc('search')})`, backgroundSize: `${GW}px ${GH}px`, backgroundPosition: '0 -640px', translate: `0 ${(1 - sheet) * (GH - 640)}px` }} />
          <Tap x={340} y={1430} at={3.9} />
        </div>

        {/* hotel page */}
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - back, translate: `${(1 - hotel) * GW}px 0`, boxShadow: '-30px 0 60px rgba(0,0,0,0.12)' }}>
          {hotel > 0 && <Img src={gsrc('hotel')} style={{ position: 'absolute', inset: 0, width: GW, height: GH, scale: String(1 + 0.02 * t(5.0, 7.5)) }} />}
          <Tap x={875} y={2200} at={7.5} />
        </div>

        {/* room detail → Book Now */}
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - back, translate: `${(1 - room) * GW}px 0`, boxShadow: '-30px 0 60px rgba(0,0,0,0.12)' }}>
          {room > 0 && (
            <>
              <Img src={gsrc('room')} style={{ position: 'absolute', inset: 0, width: GW, height: GH }} />
              <div style={{ position: 'absolute', left: 48, top: 2305, width: 1090, height: 136, borderRadius: 70, boxShadow: `0 0 0 ${16 * t(10.0, 10.4) * (1 - t(10.9, 11.3))}px rgba(209,52,56,0.18)`, scale: String(press(10.4)) }} />
              <Tap x={592} y={2372} at={10.4} />
            </>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
