"use client";
// Paid theme licences (one per property + theme). Prototype: kept in this browser (localStorage) and NO money moves.
// Production: HMS backend `theme_licences` + subscription billing add-on line; the website checks the licence when it renders.
import { useCallback, useSyncExternalStore } from "react";
import type { PaidTheme } from "./types";

export type Licence = {
  id: string;
  slug: string;
  theme: PaidTheme;
  status: "active" | "cancelled" | "ended";
  start: string; // ISO date
  renews: string; // end of the paid period (ISO date); cancelled = runs until this date
  endedAt?: string;
  source: "purchase" | "demo";
  invoice?: string;
};

/** Demo properties show their paid theme because BinGi licensed it for the demo. */
export const DEMO_LICENCES: Record<string, PaidTheme[]> = { "haor-bilash": ["drift"], "canopy-nest": ["canopy"], skypod: ["pod"], altura: ["orbit"], "nila-island": ["isle"], "shonali-rajbari": ["zamindar"], "maison-gulshan": ["maison"], "obsidian-gulshan": ["noir"], "haven-lalakhal": ["haven"], meghchura: ["summit"], "bonolota-estate": ["estate"], "aurel-banani": ["aurel"], "the-courtyard": ["courtyard"], "axis-gulshan": ["axis"], "waypoint-inn": ["waypoint"], "shanti-guest-house": ["shanti"], "haven-residences": ["reside"], "common-ground": ["commons"], "roots-homestay": ["roots"], "morning-house": ["morning"], "matir-farm": ["matir"] };

const KEY = "bingi-theme-licences-v1";
const listeners = new Set<() => void>();
let cache: { raw: string | null; list: Licence[] } | null = null;
const EMPTY: Licence[] = [];
function read(): Licence[] {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch {}
  if (cache && cache.raw === raw) return cache.list;
  let list: Licence[] = [];
  try { const p = raw ? JSON.parse(raw) : []; if (Array.isArray(p)) list = p; } catch {}
  cache = { raw, list };
  return list;
}
function write(list: Licence[]) {
  const raw = JSON.stringify(list);
  try { localStorage.setItem(KEY, raw); } catch {}
  cache = { raw, list };
  listeners.forEach((l) => l());
}
const sub = (l: () => void) => {
  listeners.add(l);
  const s = (e: StorageEvent) => { if (e.key === KEY) { cache = null; l(); } };
  window.addEventListener("storage", s);
  return () => { listeners.delete(l); window.removeEventListener("storage", s); };
};

export const today = () => new Date().toISOString().slice(0, 10);
const addMonth = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + 1); return d.toISOString().slice(0, 10); };
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

/** Is the licence usable today? Cancelled licences run until the end of the paid period. */
export const isLive = (l: Licence, on = today()) => l.status !== "ended" && on < l.renews;

export function licensed(list: Licence[], slug: string, theme: string, on?: string) {
  if (DEMO_LICENCES[slug]?.includes(theme as PaidTheme)) return true;
  const mine = list.filter((l) => l.slug === slug && l.theme === theme);
  if (!mine.length) return false; // (no date needed — keeps server prerender free of `new Date()`)
  const d = on ?? today();
  return mine.some((l) => isLive(l, d));
}

/** Public site: is this paid theme licensed for this property right now? */
export function useLicensed(slug: string, theme: string) {
  const list = useSyncExternalStore(sub, read, () => EMPTY);
  return licensed(list, slug, theme);
}

export type BuyResult = { ok: true; licence: Licence } | { ok: false; error: string };

export function useLicences(slug: string) {
  const all = useSyncExternalStore(sub, read, () => EMPTY);
  const list = all.filter((l) => l.slug === slug);
  /** Prototype purchase. `fail` simulates a declined payment: nothing changes and no invoice is created. */
  const buy = useCallback((theme: PaidTheme, opts: { fail?: boolean } = {}): BuyResult => {
    if (opts.fail) return { ok: false, error: "Payment was not completed. Nothing was charged and your website did not change." };
    const now = read();
    if (licensed(now, slug, theme)) return { ok: false, error: "You already have this theme." };
    const start = today();
    const lic: Licence = { id: `lic-${Math.random().toString(36).slice(2, 8)}`, slug, theme, status: "active", start, renews: addMonth(start), source: "purchase", invoice: `DEMO-INV-${Date.now().toString(36).toUpperCase()}` };
    write([...now.filter((l) => !(l.slug === slug && l.theme === theme)), lic]);
    return { ok: true, licence: lic };
  }, [slug]);
  const update = useCallback((id: string, fn: (l: Licence) => void) => { write(read().map((l) => (l.id === id ? (() => { const c = { ...l }; fn(c); return c; })() : l))); }, []);
  const cancel = useCallback((id: string) => update(id, (l) => { l.status = "cancelled"; }), [update]);
  const resume = useCallback((id: string) => update(id, (l) => { if (l.status === "cancelled") l.status = "active"; }), [update]);
  /** Demo only: move the licence to its last week / past its end so the notice and fallback can be tested. */
  const demoEndSoon = useCallback((id: string) => update(id, (l) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + 5); l.renews = d.toISOString().slice(0, 10); l.status = "cancelled"; }), [update]);
  const demoEnd = useCallback((id: string) => update(id, (l) => { l.status = "ended"; l.endedAt = today(); l.renews = today(); }), [update]);
  return { list, buy, cancel, resume, demoEndSoon, demoEnd, has: (t: string) => licensed(all, slug, t) };
}
