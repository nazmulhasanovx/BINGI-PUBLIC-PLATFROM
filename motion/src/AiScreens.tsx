// BinGi AI loops for the public /ai page. Built on the real BinGi AI beta screenshots (sample hotel):
// parts of each screen are revealed in the order they appear in the app, plus a pointer and typing.
// Nothing new is invented — every pixel that ends up on screen comes from the real screenshot,
// except the typed question, which is the same text the app itself shows in the chat.
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/fonts';
import { Cursor, Ripple } from './kit';

export const AI_LOOP = 210; // 7 s at 30 fps
const BG = '#F4F6F8';
const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const aiFontsReady = Promise.all([
  loadFont({ family: 'AiInter', url: staticFile('fonts/inter-latin-400-normal.woff2'), weight: '400' }),
  loadFont({ family: 'AiBangla', url: staticFile('fonts/noto-sans-bengali-bengali-400-normal.woff2'), weight: '400' }),
]);

type Rect = { x: number; y: number; w: number; h: number };

/** 0→1 between seconds a and b; everything eases back to the start state over the last 0.6 s so the loop is seamless. */
const useT = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames: d } = useVideoConfig();
  const reset = interpolate(f, [d - 0.75 * fps, d - 0.1 * fps], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const t = (a: number, b: number) => interpolate(f, [a * fps, b * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease }) * reset;
  return { t, f, fps, reset };
};

const Shot: React.FC<{ src: string }> = ({ src }) => (
  <Img src={staticFile(src)} style={{ position: 'absolute', inset: 0, width: 1600, height: 900 }} />
);

/** Hides a part of the screenshot behind its own background, then lets the real pixels rise in (p 0→1). */
const Part: React.FC<{ src: string; r: Rect; p: number; bg?: string; dy?: number; dx?: number; cover?: number }> = ({ src, r, p, bg = BG, dy = 14, dx = 0, cover = 1 }) => (
  <>
    {p < 0.999 && cover > 0 && <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, background: bg, opacity: cover }} />}
    <div
      style={{
        position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h,
        backgroundImage: `url(${staticFile(src)})`, backgroundSize: '1600px 900px', backgroundPosition: `-${r.x}px -${r.y}px`,
        opacity: p, translate: `${(1 - p) * dx}px ${(1 - p) * dy}px`, scale: String(0.985 + 0.015 * p),
      }}
    />
  </>
);

const font = 'AiInter, AiBangla, sans-serif';

/* ── 1 · Ask BinGi home: cards load, the owner types a question and sends it ── */
export const AiHome: React.FC = () => {
  const { t, f, fps } = useT();
  const src = 'ai/home.webp';
  const cards: Rect[] = [];
  [529, 613].forEach((y) => [635, 838, 1041].forEach((x) => cards.push({ x, y, w: 193, h: 75 })));
  const q = 'আজ কয়টা check-out আছে?';
  const chars = Array.from(q);
  const typed = Math.round(interpolate(f, [2.0 * fps, 3.6 * fps], [0, chars.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const typing = t(1.85, 1.9);
  const caretOn = Math.floor(f / 15) % 2 === 0;
  // pointer path: off-screen → input → send button → rest
  const toInput = t(0.9, 1.6);
  const toSend = t(3.8, 4.5);
  const cx = interpolate(toSend, [0, 1], [interpolate(toInput, [0, 1], [1500, 760]), 1252]);
  const cy = interpolate(toSend, [0, 1], [interpolate(toInput, [0, 1], [860, 404]), 402]);
  const click1 = interpolate(f, [1.65 * fps, 2.0 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const click2 = interpolate(f, [4.6 * fps, 5.0 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const press = Math.max(1 - Math.abs(f - 1.7 * fps) / 4, 1 - Math.abs(f - 4.65 * fps) / 4, 0);
  const sent = t(4.6, 4.9);
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: font }}>
      <Shot src={src} />
      <Part src={src} r={{ x: 590, y: 459, w: 690, h: 50 }} p={t(0.15, 0.7)} />
      {cards.map((r, i) => <Part key={i} src={src} r={r} p={t(0.3 + i * 0.09, 0.85 + i * 0.09)} />)}
      {/* input: placeholder → typed question → cleared on send */}
      {typing > 0.5 && (
        <div style={{ position: 'absolute', left: 632, top: 392, width: 596, height: 32, background: '#fff', display: 'flex', alignItems: 'center', paddingLeft: 9, fontSize: 15.5, color: '#1F2328', opacity: 1 - sent }}>
          {chars.slice(0, typed).join('')}
          {typed < chars.length || sent < 0.05 ? <span style={{ width: 1.5, height: 19, marginLeft: 1, background: caretOn ? '#B11C29' : 'transparent' }} /> : null}
        </div>
      )}
      {sent > 0 && sent < 1 && (
        <div style={{ position: 'absolute', left: 1243, top: 391, width: 34, height: 34, borderRadius: 9, boxShadow: `0 0 0 ${10 * sent}px rgba(177,28,41,${0.25 * (1 - sent)})` }} />
      )}
      <Ripple x={760} y={414} p={click1} />
      <Ripple x={1260} y={408} p={click2} />
      <div style={{ opacity: interpolate(toInput, [0, 0.15], [0, 1]) }}>
        <Cursor x={cx} y={cy} press={press} size={34} />
      </div>
    </AbsoluteFill>
  );
};

/* ── 2 · The answer: question sent, BinGi AI thinks, the answer and booking cards appear ── */
export const AiAnswer: React.FC = () => {
  const { t, f, fps } = useT();
  const src = 'ai/answer.webp';
  const thinking = t(1.0, 1.2) * (1 - t(1.85, 2.0));
  const dot = (i: number) => 0.35 + 0.65 * Math.max(0, Math.sin((f / fps) * 7 - i * 0.9));
  const hover = t(5.0, 5.6);
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: font }}>
      <Shot src={src} />
      <Part src={src} r={{ x: 1090, y: 92, w: 240, h: 50 }} p={t(0.2, 0.75)} dx={40} dy={0} />
      <Part src={src} r={{ x: 548, y: 194, w: 110, h: 32 }} p={t(0.8, 1.2)} />
      <Part src={src} r={{ x: 582, y: 234, w: 260, h: 34 }} p={t(1.9, 2.3)} />
      <Part src={src} r={{ x: 588, y: 274, w: 410, h: 26 }} p={t(2.1, 2.5)} />
      <Part src={src} r={{ x: 588, y: 302, w: 410, h: 26 }} p={t(2.25, 2.65)} />
      <Part src={src} r={{ x: 582, y: 336, w: 670, h: 56 }} p={t(2.45, 2.9)} />
      {/* booking panel arrives first (empty), then each booking card inside it */}
      <Part src={src} r={{ x: 584, y: 396, w: 746, h: 268 }} p={t(2.8, 3.2)} />
      <Part src={src} r={{ x: 599, y: 442, w: 354, h: 224 }} p={t(3.1, 3.6)} bg="#FFFFFF" cover={t(2.8, 2.81)} />
      <Part src={src} r={{ x: 959, y: 442, w: 354, h: 224 }} p={t(3.25, 3.75)} bg="#FFFFFF" cover={t(2.8, 2.81)} />
      {thinking > 0 && (
        <div style={{ position: 'absolute', left: 590, top: 243, display: 'flex', gap: 7, opacity: thinking }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: 9, background: '#B11C29', opacity: dot(i) }} />)}
        </div>
      )}
      {/* hover on "open in BinGi" */}
      <div style={{ position: 'absolute', left: 612, top: 651, width: 112, height: 3, borderRadius: 2, background: '#B11C29', scale: `${hover} 1`, transformOrigin: 'left', opacity: hover }} />
      <div style={{ opacity: t(4.3, 4.6) }}>
        <Cursor x={interpolate(t(4.3, 5.1), [0, 1], [880, 690])} y={interpolate(t(4.3, 5.1), [0, 1], [780, 650])} size={34} />
      </div>
    </AbsoluteFill>
  );
};

/* ── 3 · Daily Brief: Refresh → every section arrives, straight from BinGi data ── */
export const AiBrief: React.FC = () => {
  const { t, f, fps } = useT();
  const src = 'ai/brief.webp';
  const cols = [551, 814, 1076];
  const cards: Rect[] = [
    ...cols.map((x) => ({ x, y: 224, w: 249, h: 192 })),
    ...cols.map((x) => ({ x, y: 430, w: 249, h: 191 })),
    ...cols.slice(0, 2).map((x) => ({ x, y: 635, w: 249, h: 142 })),
  ];
  const click = interpolate(f, [0.95 * fps, 1.35 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const press = Math.max(1 - Math.abs(f - 1.0 * fps) / 4, 0);
  const spin = interpolate(f, [1.0 * fps, 1.9 * fps], [0, 360], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const toRefresh = t(0.2, 0.9);
  const toAi = t(4.6, 5.4);
  const cx = interpolate(toAi, [0, 1], [interpolate(toRefresh, [0, 1], [1450, 600]), 728]);
  const cy = interpolate(toAi, [0, 1], [interpolate(toRefresh, [0, 1], [820, 192]), 192]);
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: font }}>
      <Shot src={src} />
      {cards.map((r, i) => <Part key={i} src={src} r={r} p={t(1.3 + i * 0.13, 1.9 + i * 0.13)} />)}
      {/* refresh icon turns while loading */}
      <div style={{ position: 'absolute', left: 563, top: 176, width: 20, height: 20, overflow: 'hidden', background: '#fff' }}>
        <div style={{ width: 20, height: 20, backgroundImage: `url(${staticFile(src)})`, backgroundSize: '1600px 900px', backgroundPosition: '-563px -176px', rotate: `${spin}deg` }} />
      </div>
      {/* hover state on "AI দিয়ে report" */}
      <div style={{ position: 'absolute', left: 666, top: 165, width: 138, height: 43, borderRadius: 12, boxShadow: `0 0 0 ${2 * toAi}px rgba(177,28,41,${0.35 * toAi})` }} />
      <Ripple x={604} y={186} p={click} />
      <div style={{ opacity: interpolate(toRefresh, [0, 0.15], [0, 1]) }}>
        <Cursor x={cx} y={cy} press={press} size={34} />
      </div>
    </AbsoluteFill>
  );
};
