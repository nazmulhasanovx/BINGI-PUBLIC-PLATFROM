// GRAND theme engine — 10 colour themes + WCAG contrast guard.
// Hotel picks a theme id in HMS; everything else is derived here.

export type ThemeId =
  | "coral" | "ocean" | "lagoon" | "forest" | "terracotta"
  | "sand" | "navy" | "plum" | "rose" | "graphite";

export const THEMES: { id: ThemeId; name: string; brand: string }[] = [
  { id: "coral", name: "Coral", brand: "#F0503F" },
  { id: "ocean", name: "Ocean", brand: "#1E6FD9" },
  { id: "lagoon", name: "Lagoon", brand: "#0F9488" },
  { id: "forest", name: "Forest", brand: "#2F7D4E" },
  { id: "terracotta", name: "Terracotta", brand: "#C2603A" },
  { id: "sand", name: "Sand Gold", brand: "#B88A2E" },
  { id: "navy", name: "Royal Navy", brand: "#1F3A6B" },
  { id: "plum", name: "Plum", brand: "#7A3E8C" },
  { id: "rose", name: "Rose", brand: "#D94B7B" },
  { id: "graphite", name: "Graphite", brand: "#2E3338" },
];

export const DEFAULT_THEME: ThemeId = "coral";

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && THEMES.some((t) => t.id === v);
}

// ---------- colour math ----------
type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
}
function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h /= 6;
  return [h, s, l];
}
function hslToRgb([h, s, l]: [number, number, number]): RGB {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue(p, q, h + 1 / 3) * 255, hue(p, q, h) * 255, hue(p, q, h - 1 / 3) * 255];
}
function luminance(rgb: RGB): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string): number {
  const la = luminance(hexToRgb(a)), lb = luminance(hexToRgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function shiftLightness(hex: string, delta: number): string {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([h, s, Math.max(0, Math.min(1, l + delta))]));
}
function mix(hex: string, withHex: string, amount: number): string {
  const a = hexToRgb(hex), b = hexToRgb(withHex);
  return rgbToHex([0, 1, 2].map((i) => a[i] * amount + b[i] * (1 - amount)) as RGB);
}

/** Darken until white text reaches 5.2:1 — keeps ≥4.5:1 (WCAG AA) also as text on the tinted surfaces (brand-soft, canvas). */
function ensureAA(hex: string): string {
  let out = hex;
  for (let i = 0; i < 40 && contrast(out, "#FFFFFF") < 5.2; i++) out = shiftLightness(out, -0.015);
  return out;
}

export const NEUTRALS = {
  ink: "#16181D",
  muted: "#5E6470",
  canvas: "#FAFAF9",
  surface: "#FFFFFF",
  line: "#ECEBE8",
};

export type ThemeTokens = Record<string, string>;

export function buildTokens(brandHex: string): ThemeTokens {
  const action = ensureAA(brandHex);
  return {
    "--brand": brandHex,
    "--action": action,
    "--action-hover": shiftLightness(action, -0.07),
    "--action-pressed": shiftLightness(action, -0.13),
    "--on-action": "#FFFFFF",
    "--brand-soft": mix(brandHex, "#FFFFFF", 0.07),
    "--brand-soft-2": mix(brandHex, "#FFFFFF", 0.14),
    "--brand-ring": mix(brandHex, "#FFFFFF", 0.35),
  };
}

export function themeById(id: ThemeId) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function tokensFor(id: ThemeId): ThemeTokens {
  return buildTokens(themeById(id).brand);
}

/** Custom hex (D2 pending): accepted only as #RRGGBB; contrast guard applies automatically. */
export function tokensForCustom(hex: string): ThemeTokens | null {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? buildTokens(hex.toUpperCase()) : null;
}
