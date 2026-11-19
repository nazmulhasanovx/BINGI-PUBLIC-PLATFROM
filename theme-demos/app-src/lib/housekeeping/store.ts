"use client";
// Housekeeping — room readiness (Dirty → Cleaning → Clean → Inspected) and cleaning tasks, per property.
// Kept separate from booking status, payment status and out-of-order (maintenance). Prototype: browser storage.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY, useRooms } from "@/lib/rooms/store";
import { useStays } from "@/lib/bookings/store";
import { hash } from "@/lib/bookings/demo";
import { useHrm } from "@/lib/hrm/store";
import { useSettings } from "@/lib/settings/store";

export type Clean = "Dirty" | "Cleaning" | "Clean" | "Inspected";
export const CLEAN: Clean[] = ["Dirty", "Cleaning", "Clean", "Inspected"];
export type TaskKind = "Check-out clean" | "Stay-over" | "Deep clean" | "Inspection" | "Fix";
export const KINDS: TaskKind[] = ["Check-out clean", "Stay-over", "Deep clean", "Inspection", "Fix"];
/** Open = waiting to start · Doing = cleaning · Review = waiting for inspection · Done = room ready. */
export type TaskStatus = "Open" | "Doing" | "Review" | "Done";
export type Priority = "Low" | "Normal" | "High" | "Urgent";
export const PRIORITIES: Priority[] = ["Low", "Normal", "High", "Urgent"];
export type Task = {
  id: string; room: string; kind: TaskKind; status: TaskStatus; who?: string; at: string; done?: string; note?: string; ref?: string;
  started?: string; sent?: string; due?: string; priority?: Priority; checks?: boolean[]; block?: boolean;
};
export type CheckItem = { t: string; req: boolean };
type ListKind = "Check-out clean" | "Stay-over" | "Deep clean";
export const LIST_KINDS: ListKind[] = ["Check-out clean", "Stay-over", "Deep clean"];
type RoomHK = { s: Clean; at: string; by: string };
type State = { sig: string; rooms: Record<string, RoomHK>; tasks: Task[]; log: { at: string; text: string; by: string; room?: string }[]; lists?: Record<ListKind, CheckItem[]> };

const it = (t: string, req = true): CheckItem => ({ t, req });
export const DEFAULT_LISTS: Record<ListKind, CheckItem[]> = {
  "Check-out clean": [it("Change bed linens & pillow covers"), it("Clean & disinfect bathroom"), it("Vacuum / mop floors"), it("Wipe surfaces & furniture"), it("Restock toiletries & amenities"), it("Empty trash bins"), it("Check & replace towels"), it("Check for damage / maintenance")],
  "Stay-over": [it("Make the bed"), it("Clean bathroom"), it("Replace used towels"), it("Empty trash bins"), it("Top up water & amenities", false)],
  "Deep clean": [it("Move furniture & clean behind"), it("Wash curtains"), it("Clean AC filter"), it("Shampoo carpet / scrub floor"), it("Descale bathroom"), it("Clean windows & frames"), it("Check & clean fridge / kettle")],
};
/** Checklist a task uses (Inspection / Fix have none). */
export const listFor = (lists: Record<ListKind, CheckItem[]> | undefined, k: TaskKind): CheckItem[] => (LIST_KINDS as TaskKind[]).includes(k) ? (lists ?? DEFAULT_LISTS)[k as ListKind] : [];
const addMin = (hm: string, m: number) => { const [h, mm] = hm.split(":").map(Number); const t = h * 60 + mm + m; return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; };
const MINUTES: Record<TaskKind, number> = { "Check-out clean": 45, "Stay-over": 25, "Deep clean": 120, Inspection: 15, Fix: 120 };

const KEY = (slug: string) => `bingi.hk.v2.${slug}`;
const EMPTY: State = { sig: "", rooms: {}, tasks: [], log: [] };
const cache = new Map<string, State>();
const listeners = new Set<() => void>();
const ME = "Front desk";
const nowHm = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const stamp = () => `${TODAY}T${nowHm()}`;
const CLEAN_KINDS: TaskKind[] = ["Check-out clean", "Stay-over", "Deep clean"];

function seed(units: string[], inHouse: string[], leaving: string[], staff: string[]): State {
  const rooms: Record<string, RoomHK> = {};
  const tasks: Task[] = [];
  const at = `${TODAY}T08:00`;
  const S = (i: number) => staff.length ? staff[i % staff.length] : undefined;
  const n = (k: TaskKind) => DEFAULT_LISTS[k as ListKind]?.length ?? 0;
  const vacant = units.filter((u) => !inHouse.includes(u));
  for (const u of units) rooms[u] = { s: "Inspected", at, by: "Supervisor" };
  // Last night's check-outs: one waiting (no one yet), one assigned not started, one being cleaned, one waiting inspection.
  const out = vacant.filter((u) => hash(u) % 3 === 0).slice(0, 4);
  out.forEach((u, i) => {
    const t0 = `07:${10 + i * 5}`;
    const base: Task = { id: `t${i}`, room: u, kind: "Check-out clean", status: "Open", at: `${TODAY}T${t0}`, due: addMin(nowHm(), 30 + i * 20), priority: "Normal", checks: Array(n("Check-out clean")).fill(false) };
    if (i === 0) { rooms[u] = { s: "Dirty", at: base.at, by: "Front desk" }; }
    if (i === 1) { rooms[u] = { s: "Dirty", at: base.at, by: "Front desk" }; base.who = S(0); }
    if (i === 2) { rooms[u] = { s: "Cleaning", at: `${TODAY}T09:05`, by: S(1) ?? "Housekeeping" }; Object.assign(base, { who: S(1), status: "Doing", started: `${TODAY}T09:05`, checks: base.checks!.map((_, j) => j < 5) }); }
    if (i === 3) { rooms[u] = { s: "Clean", at: `${TODAY}T09:40`, by: S(2) ?? "Housekeeping" }; Object.assign(base, { who: S(2), status: "Review", started: `${TODAY}T08:55`, sent: `${TODAY}T09:40`, checks: base.checks!.map(() => true) }); }
    tasks.push(base);
  });
  for (const u of inHouse) rooms[u] = { s: "Clean", at: `${TODAY}T10:00`, by: "Housekeeping" };
  inHouse.filter((u) => !leaving.includes(u)).slice(0, 3).forEach((u, i) => tasks.push({ id: `s${i}`, room: u, kind: "Stay-over", status: "Open", at, who: S(i + 3), due: addMin(nowHm(), 120 + i * 30), priority: "Low", checks: Array(n("Stay-over")).fill(false) }));
  return { sig: "", rooms, tasks, log: [], lists: DEFAULT_LISTS };
}

function read(slug: string, mk: () => State): State {
  const c = cache.get(slug); if (c) return c;
  let s: State | null = null;
  try { const raw = localStorage.getItem(KEY(slug)); if (raw) s = { ...EMPTY, ...JSON.parse(raw) }; } catch {}
  if (!s) s = { ...mk(), sig: "seed" };
  cache.set(slug, s);
  return s;
}
function write(slug: string, s: State) {
  cache.set(slug, s);
  try { localStorage.setItem(KEY(slug), JSON.stringify(s)); } catch {}
  listeners.forEach((l) => l());
}
const sub = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useHousekeeping(h: Hotel) {
  const { st: rooms } = useRooms(h);
  const stays = useStays(h);
  const hrm = useHrm();
  const rules = useSettings(h).st.hk;
  const units = useMemo(() => rooms.units.filter((u) => u.status === "published").map((u) => u.code), [rooms.units]);
  const ready = stays.length > 0 || units.length === 0;
  const mk = useCallback(() => {
    const inH = stays.filter((s) => s.status === "Checked in").map((s) => s.room).filter(Boolean);
    const lv = stays.filter((s) => s.status === "Checked in" && s.to <= TODAY).map((s) => s.room);
    const hkStaff = hrm.st.employees.filter((e) => e.dept === "Housekeeping" && e.status === "active").map((e) => e.name);
    return seed(units, inH, lv, hkStaff);
  }, [units, stays, hrm.st.employees]);
  const st = useSyncExternalStore(sub, () => (ready ? read(h.slug, mk) : EMPTY), () => EMPTY);
  const save = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h.slug, mk)); fn(n); write(h.slug, n); }, [h.slug, mk]);
  const log = (s: State, text: string, room?: string) => { s.log.unshift({ at: stamp(), text, by: ME, room }); s.log = s.log.slice(0, 200); };
  const lists = st.lists ?? DEFAULT_LISTS;
  const stateOf = useCallback((room: string): Clean => st.rooms[room]?.s ?? "Inspected", [st]);
  /** Settings → Housekeeping rules: with "inspection required", only Inspected rooms are ready. */
  const isReady = useCallback((room: string) => { const s = stateOf(room); return s === "Inspected" || (s === "Clean" && !rules.inspection); }, [stateOf, rules.inspection]);
  const staff = useMemo(() => hrm.st.employees.filter((e) => e.dept === "Housekeeping" && e.status === "active").map((e) => e.name), [hrm.st.employees]);

  const setClean = useCallback((room: string, s: Clean, by = ME) => save((x) => {
    x.rooms[room] = { s, at: stamp(), by };
    if (s === "Clean" || s === "Inspected") for (const t of x.tasks) if (t.room === room && t.status !== "Done" && (CLEAN_KINDS.includes(t.kind) || (s === "Inspected" && t.kind === "Inspection"))) { t.status = "Done"; t.done = stamp(); }
    log(x, `Room ${room} → ${s}`);
  }), [save]);
  const addTask = useCallback((room: string, kind: TaskKind, o: { who?: string; note?: string; ref?: string; due?: string; priority?: Priority; block?: boolean; since?: string } = {}) => save((x) => {
    const { since: _s, ...rest } = o; void _s;
    const items = listFor(x.lists, kind);
    x.tasks.unshift({ id: `t${Date.now().toString(36)}${x.tasks.length}`, room, kind, status: "Open", at: stamp(), due: o.due ?? addMin(nowHm(), MINUTES[kind]), priority: o.priority ?? rules.priority, checks: items.map(() => false), ...rest });
    log(x, `${kind} · Room ${room}${o.who ? ` → ${o.who}` : ""}`, room);
  }), [save, rules.priority]);
  const toggleCheck = useCallback((id: string, i: number) => save((x) => { const t = x.tasks.find((y) => y.id === id); if (t?.checks) t.checks[i] = !t.checks[i]; }), [save]);
  /** Cleaner finished: with inspection on → waits for a supervisor; otherwise the room is ready. */
  const submit = useCallback((id: string) => save((x) => {
    const t = x.tasks.find((y) => y.id === id); if (!t) return;
    const insp = rules.inspection && CLEAN_KINDS.includes(t.kind);
    t.sent = stamp();
    if (insp) { t.status = "Review"; x.rooms[t.room] = { s: "Clean", at: stamp(), by: t.who ?? ME }; log(x, `${t.kind} finished · Room ${t.room} · waiting inspection`, t.room); }
    else { t.status = "Done"; t.done = stamp(); if (CLEAN_KINDS.includes(t.kind)) x.rooms[t.room] = { s: "Clean", at: stamp(), by: t.who ?? ME }; log(x, `${t.kind} done · Room ${t.room}`, t.room); }
  }), [save, rules.inspection]);
  const approve = useCallback((id: string) => save((x) => {
    const t = x.tasks.find((y) => y.id === id); if (!t) return;
    t.status = "Done"; t.done = stamp(); x.rooms[t.room] = { s: "Inspected", at: stamp(), by: ME };
    log(x, `Inspection passed · Room ${t.room} ready`, t.room);
  }), [save]);
  const sendBack = useCallback((id: string, why: string) => save((x) => {
    const t = x.tasks.find((y) => y.id === id); if (!t) return;
    t.status = "Doing"; t.note = why ? `Sent back: ${why}` : t.note; x.rooms[t.room] = { s: "Cleaning", at: stamp(), by: t.who ?? ME };
    log(x, `Sent back to cleaning · Room ${t.room}${why ? ` · ${why}` : ""}`, t.room);
  }), [save]);
  const setPriority = useCallback((id: string, p: Priority) => save((x) => { const t = x.tasks.find((y) => y.id === id); if (t) t.priority = p; }), [save]);
  const saveLists = useCallback((l: Record<ListKind, CheckItem[]>) => save((x) => { x.lists = l; log(x, "Checklist template changed"); }), [save]);
  const assign = useCallback((id: string, who: string) => save((x) => { const t = x.tasks.find((y) => y.id === id); if (t) { t.who = who || undefined; log(x, `${t.kind} · Room ${t.room} → ${who || "unassigned"}`, t.room); } }), [save]);
  const start = useCallback((id: string) => save((x) => {
    const t = x.tasks.find((y) => y.id === id); if (!t) return;
    t.status = "Doing"; t.started = stamp(); if (CLEAN_KINDS.includes(t.kind)) x.rooms[t.room] = { s: "Cleaning", at: stamp(), by: t.who ?? ME };
    log(x, `${t.kind} started · Room ${t.room}${t.who ? ` · ${t.who}` : ""}`, t.room);
  }), [save]);
  const finish = useCallback((id: string) => save((x) => {
    const t = x.tasks.find((y) => y.id === id); if (!t) return;
    t.status = "Done"; t.done = stamp();
    if (CLEAN_KINDS.includes(t.kind)) x.rooms[t.room] = { s: "Clean", at: stamp(), by: t.who ?? ME };
    if (t.kind === "Inspection") x.rooms[t.room] = { s: "Inspected", at: stamp(), by: t.who ?? ME };
    log(x, `${t.kind} done · Room ${t.room}`);
  }), [save]);
  /** Guest left (check-out or room move): room becomes Dirty and a cleaning task opens. */
  const vacated = useCallback((room: string, ref?: string) => save((x) => {
    if (!room) return;
    if (!rules.dirtyOnCheckout) { log(x, `Room ${room} vacated${ref ? ` (${ref})` : ""}`); return; }
    x.rooms[room] = { s: "Dirty", at: stamp(), by: ME };
    if (!x.tasks.some((t) => t.room === room && t.status !== "Done" && t.kind === "Check-out clean")) x.tasks.unshift({ id: `t${Date.now().toString(36)}${x.tasks.length}`, room, kind: "Check-out clean", status: "Open", at: stamp(), ref, due: addMin(nowHm(), 45), priority: rules.priority, checks: listFor(x.lists, "Check-out clean").map(() => false) });
    for (const t of x.tasks) if (t.room === room && t.kind === "Stay-over" && t.status !== "Done") { t.status = "Done"; t.done = stamp(); }
    log(x, `Room ${room} vacated${ref ? ` (${ref})` : ""} → Dirty`);
  }), [save, rules.dirtyOnCheckout, rules.priority]);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); }, [h.slug]);
  return { st, ready: st !== EMPTY, units, rules, lists, stateOf, isReady, staff, setClean, addTask, assign, start, finish, submit, approve, sendBack, toggleCheck, setPriority, saveLists, vacated, reset };
}
export type HK = ReturnType<typeof useHousekeeping>;
