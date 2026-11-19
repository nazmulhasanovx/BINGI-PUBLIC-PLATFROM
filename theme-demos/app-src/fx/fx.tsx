"use client";
// BinGi FX — the 3D / motion layer used by paid themes (plan: Paid_Themes_Plan_v2 §FX).
// Rule: the page is complete without FX. Effects start only after hydration, only on capable devices,
// never when the guest asks for reduced motion or data saving, and pause when off screen.
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { useSiteView } from "@/lib/site";
import { currentSearch } from "@/lib/href";
import { motionLevels, type Motion } from "@/themes/paid";

type Ctx = { slug: string; theme: string };
const FxCtx = createContext<Ctx | null>(null);

/** Wrap a paid theme's home with this so effects know the property and theme. */
export function FxScope({ slug, theme, children }: Ctx & { children: ReactNode }) {
  return <FxCtx.Provider value={{ slug, theme }}>{children}</FxCtx.Provider>;
}

// ---- device capability (client only) ----
let glOk: boolean | null = null;
function hasWebGL() {
  if (glOk !== null) return glOk;
  try {
    const c = document.createElement("canvas");
    glOk = !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { glOk = false; }
  return glOk;
}
type Cap = "ssr" | "calm" | "low" | "full";
function readCap(): Cap {
  const q = currentSearch().get("fx");
  if (q === "calm") return "calm";
  if (q === "low") return "low";
  if (q === "full") return "full";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "calm";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const low = nav.connection?.saveData || (nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4 || !hasWebGL();
  return low ? "low" : "full";
}
const subCap = (f: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", f);
  window.addEventListener("hashchange", f);
  window.addEventListener("popstate", f);
  return () => { mq.removeEventListener("change", f); window.removeEventListener("hashchange", f); window.removeEventListener("popstate", f); };
};
const subPointer = (f: () => void) => { const m = window.matchMedia("(pointer: fine)"); m.addEventListener("change", f); return () => m.removeEventListener("change", f); };

export type Fx = {
  /** What actually runs: calm = nothing moves; lively = CSS depth + light canvas; immersive = everything. */
  level: Motion;
  /** WebGL effects allowed (capable device, not data-saving). */
  gl: boolean;
  /** Mouse/trackpad present (tilt effects). */
  finePointer: boolean;
};
const ORDER: Motion[] = ["calm", "lively", "immersive"];
const min = (a: Motion, b: Motion) => (ORDER.indexOf(a) <= ORDER.indexOf(b) ? a : b);

export function useFx(): Fx {
  const ctx = useContext(FxCtx);
  const doc = useSiteView(ctx?.slug ?? "");
  const cap = useSyncExternalStore(subCap, readCap, () => "ssr" as Cap);
  const finePointer = useSyncExternalStore(subPointer, () => window.matchMedia("(pointer: fine)").matches, () => false);
  if (!ctx || cap === "ssr" || cap === "calm") return { level: "calm", gl: false, finePointer };
  const levels = motionLevels(ctx.theme);
  const max = levels[levels.length - 1];
  const requested = doc?.motion ?? max;
  const level = min(requested, max);
  if (level === "calm") return { level, gl: false, finePointer };
  if (cap === "low") return { level: "lively", gl: false, finePointer };
  return { level, gl: true, finePointer };
}
