"use client";
// Personal preferences (this user, this browser): text size and motion. Sidebar style lives in the Shell (hms-sidebar-mode).
import { useCallback, useSyncExternalStore } from "react";

export type Prefs = { zoom: 90 | 100 | 110 | 120; reduceMotion: boolean };
const KEY = "bingi.hms.prefs";
const DEF: Prefs = { zoom: 100, reduceMotion: false };
const subs = new Set<() => void>();
let raw: string | null = null; let cached: Prefs = DEF;
const read = (): Prefs => { let r: string | null = null; try { r = localStorage.getItem(KEY); } catch {} if (r !== raw) { raw = r; try { cached = r ? { ...DEF, ...JSON.parse(r) } : DEF; } catch { cached = DEF; } } return cached; };
export function usePrefs() {
  const p = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, read, () => DEF);
  const set = useCallback((patch: Partial<Prefs>) => { try { localStorage.setItem(KEY, JSON.stringify({ ...read(), ...patch })); } catch {} subs.forEach((f) => f()); }, []);
  return [p, set] as const;
}
