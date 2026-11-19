"use client";
// HRM view mode, per browser: "easy" = just the team list + add/edit; "full" = every HRM module.
// Same data either way (useHrm store) — switching mode never changes or hides records.
import { useCallback, useSyncExternalStore } from "react";

export type HrmMode = "easy" | "full";
const KEY = "bingi.hrm.mode";
const subs = new Set<() => void>();
const read = (): HrmMode => { try { return localStorage.getItem(KEY) === "easy" ? "easy" : "full"; } catch { return "full"; } };

export function useHrmMode() {
  const mode = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, read, () => "full" as HrmMode);
  const setMode = useCallback((m: HrmMode) => { try { localStorage.setItem(KEY, m); } catch {} subs.forEach((f) => f()); }, []);
  return { mode, setMode };
}
