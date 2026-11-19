"use client";
// Housekeeping — follows the live HMS structure: Tasks · Maintenance · Checklist.
// Tasks: one status strip (Pending → Cleaning → Awaiting inspection → Ready), who is working where right now,
// task cards (person, step, checklist progress, target time) and one task sheet that walks through the steps.
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlarmClock, BedDouble, Brush, Check, CheckCheck, ChevronRight, CircleCheck, Clock, History, LayoutGrid, List, ListChecks,
  Plus, Search, Settings2, ShieldCheck, Sparkles, Trash2, User, Wrench,
} from "lucide-react";
import { can } from "@/lib/plan";
import { PlanGate } from "../plan-gate";
import { TODAY, nodePath, oooOn, useRooms } from "@/lib/rooms/store";
import { addDays } from "@/lib/bookings/demo";
import { dm, holds, overlaps, timeOf, useBookings } from "@/lib/bookings/store";
import { useGuestNames } from "@/lib/guests/store";
import { useSettings } from "@/lib/settings/store";
import { DEFAULT_LISTS, KINDS, LIST_KINDS, PRIORITIES, listFor, useHousekeeping, type CheckItem, type HK, type Priority, type Task, type TaskKind } from "@/lib/housekeeping/store";
import { useProperty } from "../property";
import { Drawer, Field, Input, Select, Area } from "../staff/ui";
import { Toast, bMain, bSoft, card } from "../bookings/ui";

type Tab = "tasks" | "maintenance" | "checklist";
type Stage = "all" | "Open" | "Doing" | "Review" | "ready";
const CLEANING: TaskKind[] = ["Check-out clean", "Stay-over", "Deep clean", "Inspection"];
const STAGE: Record<Task["status"], { label: string; dot: string; text: string }> = {
  Open: { label: "Pending", dot: "#d97706", text: "text-[#8a4b00]" },
  Doing: { label: "Cleaning", dot: "#2563eb", text: "text-[#1d4ed8]" },
  Review: { label: "Awaiting inspection", dot: "#6d5bd0", text: "text-[#5140aa]" },
  Done: { label: "Ready", dot: "#16a34a", text: "text-[#16693a]" },
};
const PRI: Record<Priority, string> = { Low: "bg-[#eef0f3] text-[#4d5664]", Normal: "bg-[#e8f0fe] text-[#1d4ed8]", High: "bg-[#fdecec] text-[#b42318]", Urgent: "bg-[#b42318] text-white" };
const KIND_LABEL: Record<TaskKind, string> = { "Check-out clean": "Check-out cleaning", "Stay-over": "Stay-over cleaning", "Deep clean": "Deep cleaning", Inspection: "Inspection", Fix: "Maintenance" };
const initials = (n?: string) => (n ? n.split(" ").map((p) => p[0]).slice(0, 2).join("") : "");
const hm = (iso?: string) => (iso ? timeOf(iso) : "");
const nowHm = () => new Date().toTimeString().slice(0, 5);
const segBtn = (on: boolean) => clsx("inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13.5px] font-semibold transition-colors", on ? "bg-[#ffecec] text-[#c8232e]" : "text-[#4d5664] hover:text-hms-ink");

export function HousekeepingPage() {
  const h = useProperty();
  if (!can(h, "housekeeping")) return <PlanGate h={h} f="housekeeping" title="Housekeeping" text="Plan room cleaning, assign attendants and track room readiness after every check-out." />;
  return <HousekeepingBoard />;
}

function HousekeepingBoard() {
  const h = useProperty();
  const hk = useHousekeeping(h);
  const bk = useBookings(h);
  const rooms = useRooms(h);
  const sp = useSearchParams();
  const router = useRouter();
  const tab = (sp.get("tab") as Tab) || "tasks";
  const setTab = (t: Tab) => router.replace(t === "tasks" ? "/hms/housekeeping" : `/hms/housekeeping?tab=${t}`, { scroll: false });
  const [toast, setToastS] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const say = (t: string) => { setToastS(t); clearTimeout(timer.current); timer.current = setTimeout(() => setToastS(""), 2400); };
  const [adding, setAdding] = useState(false);

  if (!hk.ready || !bk.ready) return <div className="hms-page"><p role="status" className="py-10 text-[14px] text-hms-muted">Loading housekeeping…</p></div>;
  return (
    <div className="h-full overflow-y-auto"><div className="hms-page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-[24px] font-bold tracking-[-0.01em]">Housekeeping</h1><p className="text-[14px] text-hms-muted">Cleaning tasks, maintenance and room checklists · {dm(TODAY)}</p></div>
        <div className="flex items-center gap-2">
          <Link href="/hms/settings/housekeeping" aria-label="Housekeeping rules" className="grid size-11 place-items-center rounded-xl border border-hms-line bg-white hover:bg-hms-hover"><Settings2 className="size-[18px]" /></Link>
          {tab !== "checklist" && <button onClick={() => setAdding(true)} className={bMain}><Plus className="size-4" />{tab === "maintenance" ? "Add maintenance" : "Add task"}</button>}
        </div>
      </div>
      <div role="tablist" aria-label="Housekeeping sections" className="mt-4 flex gap-6 border-b border-hms-line">
        {([["tasks", "Tasks"], ["maintenance", "Maintenance"], ["checklist", "Checklist"]] as [Tab, string][]).map(([id, l]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={clsx("-mb-px border-b-2 pb-2.5 text-[14.5px] font-semibold transition-colors", tab === id ? "border-[#c8232e] text-[#c8232e]" : "border-transparent text-[#4d5664] hover:text-hms-ink")}>{l}</button>
        ))}
      </div>
      <div className="mt-5">
        {tab === "tasks" && <Tasks hk={hk} say={say} />}
        {tab === "maintenance" && <Maintenance hk={hk} rooms={rooms} say={say} />}
        {tab === "checklist" && <Checklists hk={hk} say={say} />}
      </div>
      {adding && (tab === "maintenance"
        ? <AddMaintenance hk={hk} rooms={rooms} onClose={() => setAdding(false)} say={say} />
        : <AddTask hk={hk} onClose={() => setAdding(false)} say={say} />)}
      {toast && <Toast text={toast} />}
    </div></div>
  );
}

// ---------------------------------------------------------------- Tasks
function useRoomInfo() {
  const h = useProperty();
  const bk = useBookings(h);
  const rooms = useRooms(h);
  const names = useGuestNames(h);
  return useMemo(() => {
    const m = new Map<string, { type: string; where: string; occ: "Vacant" | "Occupied" | "Arriving" | "Leaving"; guest?: string; ooo: boolean; reason?: string }>();
    for (const u of bk.units) {
      const cat = rooms.st.categories.find((c) => c.id === u.category);
      const here = bk.list.filter((b) => b.unit === u.code && holds(b));
      const ins = here.find((b) => b.status === "Checked in");
      const arr = here.find((b) => b.status === "Confirmed" && b.from <= TODAY && overlaps(b, TODAY, addDays(TODAY, 1)));
      const occ = ins ? (ins.to <= TODAY ? "Leaving" : "Occupied") : arr ? "Arriving" : "Vacant";
      const g = ins ?? arr;
      m.set(u.code, { type: cat?.name ?? "", where: nodePath(rooms.st.config, u.node).replace(/^.* › /, ""), occ, guest: g ? names.get(g.guestId)?.name : undefined, ooo: oooOn(u, TODAY, addDays(TODAY, 1)), reason: u.ooo?.reason });
    }
    return m;
  }, [bk.units, bk.list, rooms.st, names]);
}

function Tasks({ hk, say }: { hk: HK; say: (t: string) => void }) {
  const info = useRoomInfo();
  const [stage, setStage] = useState<Stage>("all");
  const [q, setQ] = useState("");
  const [who, setWho] = useState("");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [history, setHistory] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const active = hk.st.tasks.filter((t) => t.status !== "Done" && CLEANING.includes(t.kind));
  const arriving = [...info].filter(([code, r]) => r.occ === "Arriving" && !hk.isReady(code)).map(([c]) => c);
  const readyRooms = hk.units.filter((u) => hk.isReady(u) && !info.get(u)?.ooo);
  const n = (s: Task["status"]) => active.filter((t) => t.status === s).length;
  const late = (t: Task) => !!t.due && t.status !== "Done" && t.due < nowHm();
  const rank = (t: Task) => (arriving.includes(t.room) ? 0 : 1) * 10 + (t.priority === "Urgent" ? 0 : t.priority === "High" ? 1 : 2);
  const shownBase = history ? hk.st.tasks.filter((t) => t.status === "Done" && CLEANING.includes(t.kind)) : active;
  const shown = shownBase
    .filter((t) => history || stage === "all" || stage === "ready" || t.status === stage)
    .filter((t) => !who || (who === "-" ? !t.who : t.who === who))
    .filter((t) => !q || `${t.room} ${t.who ?? ""} ${t.kind}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => history ? (b.done ?? "").localeCompare(a.done ?? "") : rank(a) - rank(b) || (a.due ?? "").localeCompare(b.due ?? ""));
  const task = hk.st.tasks.find((t) => t.id === open);

  return (
    <>
      <div role="radiogroup" aria-label="Task status" className={clsx(card, "grid grid-cols-2 overflow-hidden md:grid-cols-4")}>
        {([["Open", "Pending", n("Open"), Clock], ["Doing", "Cleaning", n("Doing"), Brush], ["Review", "Awaiting inspection", n("Review"), ShieldCheck], ["ready", "Ready rooms", readyRooms.length, CircleCheck]] as [Stage, string, number, typeof Clock][]).map(([id, l, c, I], i) => (
          <button key={id} role="radio" aria-checked={stage === id} onClick={() => { setStage(stage === id ? "all" : id); setHistory(false); }}
            className={clsx("flex items-center gap-2.5 px-4 py-3.5 text-left transition-colors", i % 2 === 1 && "border-l border-hms-line", i > 1 && "border-t border-hms-line md:border-t-0", i === 2 && "md:border-l", stage === id ? "bg-[#fff6f6]" : "hover:bg-hms-hover")}>
            <I className={clsx("size-[18px]", stage === id ? "text-[#c8232e]" : "text-[#4d5664]")} /><span className="min-w-0 flex-1 truncate text-[14px] font-medium">{l}</span><b className="text-[18px] tabular-nums">{c}</b>
          </button>
        ))}
      </div>

      {arriving.length > 0 && stage !== "ready" && (
        <p className="mt-3 flex items-center gap-2.5 rounded-2xl border border-[#f1dfb8] bg-[#fdf8ec] px-4 py-3 text-[14px] text-[#6b4309]">
          <Sparkles className="size-[18px] shrink-0" /><span><b className="font-semibold">Guest arriving, room not ready:</b> {arriving.join(", ")} — these are shown first.</span>
        </p>
      )}

      {stage === "ready" ? <ReadyRooms hk={hk} rooms={readyRooms} info={info} say={say} /> : (
        <>
          <TeamNow hk={hk} onPick={(t) => setOpen(t)} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search room or staff</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-hms-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search room or staff" className="h-11 w-full rounded-xl border border-hms-line bg-white pl-9 pr-3 text-[14px] outline-none focus:border-[#c8232e]" />
            </label>
            <select aria-label="Filter by staff" value={who} onChange={(e) => setWho(e.target.value)} className="h-11 rounded-xl border border-hms-line bg-white px-3 text-[14px]">
              <option value="">All staff</option><option value="-">Not assigned</option>{hk.staff.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setHistory(!history)} aria-pressed={history} className={clsx("inline-flex h-11 items-center gap-1.5 rounded-xl border px-3.5 text-[14px] font-semibold", history ? "border-[#f3c4c0] bg-[#ffecec] text-[#c8232e]" : "border-hms-line bg-white hover:bg-hms-hover")}><History className="size-4" />History</button>
            <div role="radiogroup" aria-label="Task layout" className="inline-flex h-11 items-center gap-0.5 rounded-xl border border-hms-line bg-white p-1">
              <button role="radio" aria-checked={view === "cards"} onClick={() => setView("cards")} className={segBtn(view === "cards")}><LayoutGrid className="size-4" />Cards</button>
              <button role="radio" aria-checked={view === "list"} onClick={() => setView("list")} className={segBtn(view === "list")}><List className="size-4" />List</button>
            </div>
          </div>

          {shown.length === 0 ? (
            <div className={clsx(card, "mt-4 grid place-items-center px-6 py-12 text-center")}>
              <span className="grid size-12 place-items-center rounded-2xl bg-[#e5f5ec] text-[#16693a]"><CheckCheck className="size-6" /></span>
              <p className="mt-3 text-[16px] font-semibold">{history ? "Nothing finished yet today" : "No tasks here"}</p>
              <p className="mt-1 text-[14px] text-hms-muted">{history ? "Finished tasks show here." : "Check-out in Bookings opens a cleaning task by itself."}</p>
            </div>
          ) : view === "cards" ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((t) => <TaskCard key={t.id} t={t} hk={hk} info={info.get(t.room)} arriving={arriving.includes(t.room)} late={late(t)} onOpen={() => setOpen(t.id)} say={say} />)}
            </ul>
          ) : (
            <div className={clsx(card, "mt-4 overflow-x-auto")} tabIndex={0} role="region" aria-label="Tasks table">
              <table className="w-full min-w-[760px] text-left text-[14px]">
                <thead className="text-[12.5px] text-hms-muted"><tr className="border-b border-hms-line">{["Room", "Task", "Staff", "Status", "Checklist", "Target", ""].map((x) => <th key={x} className="px-4 py-3 font-medium">{x}</th>)}</tr></thead>
                <tbody>{shown.map((t) => { const items = listFor(hk.lists, t.kind); const d = (t.checks ?? []).filter(Boolean).length; return (
                  <tr key={t.id} className="border-b border-hms-line last:border-0">
                    <td className="px-4 py-3"><b>Room {t.room}</b><span className="block text-[12.5px] text-hms-muted">{info.get(t.room)?.type}</span></td>
                    <td className="px-4 py-3">{KIND_LABEL[t.kind]}</td>
                    <td className="px-4 py-3"><Person name={t.who} small /></td>
                    <td className="px-4 py-3"><Stage t={t} /></td>
                    <td className="px-4 py-3 tabular-nums">{items.length ? `${d}/${items.length}` : "—"}</td>
                    <td className={clsx("px-4 py-3 tabular-nums", late(t) && "font-semibold text-[#b42318]")}>{t.status === "Done" ? hm(t.done) : t.due ?? "—"}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => setOpen(t.id)} className="h-9 rounded-xl border border-hms-line bg-white px-3 text-[13.5px] font-semibold hover:bg-hms-hover">{t.status === "Review" ? "Inspect" : "View task"}</button></td>
                  </tr>); })}</tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-[13px] text-hms-muted">Showing {shown.length} {history ? "finished" : "active"} task{shown.length === 1 ? "" : "s"} · Check-out in <Link href="/hms/bookings" className="font-semibold text-[#c8232e]">Bookings</Link> makes the room dirty and opens a cleaning task.</p>
        </>
      )}
      {task && <TaskSheet t={task} hk={hk} info={info.get(task.room)} onClose={() => setOpen(null)} say={say} />}
    </>
  );
}

function Person({ name, sub, small }: { name?: string; sub?: string; small?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className={clsx("grid shrink-0 place-items-center rounded-full font-bold", small ? "size-8 text-[11.5px]" : "size-10 text-[13px]", name ? "bg-[#ffecec] text-[#c8232e]" : "border border-dashed border-[#c9ced6] text-hms-muted")}>{name ? initials(name) : <User className="size-4" />}</span>
      <span className="min-w-0"><span className={clsx("block truncate font-semibold", small ? "text-[13.5px]" : "text-[14.5px]", !name && "text-hms-muted")}>{name ?? "Not assigned"}</span>{sub && <span className="block truncate text-[12.5px] text-hms-muted">{sub}</span>}</span>
    </span>
  );
}
function Stage({ t }: { t: Task }) {
  const s = STAGE[t.status];
  const label = t.status === "Open" && t.who ? "Assigned" : s.label;
  return <span className={clsx("inline-flex items-center gap-1.5 text-[13px] font-semibold", s.text)}><span className="size-2 rounded-full" style={{ background: s.dot }} />{label}</span>;
}
const personSub = (t: Task) => t.status === "Done" ? `Finished ${hm(t.done)}` : t.status === "Review" ? `Finished ${hm(t.sent)}` : t.status === "Doing" ? `Started ${hm(t.started)}` : t.who ? "Not started" : "Assign someone";

function TaskCard({ t, hk, info, arriving, late, onOpen, say }: { t: Task; hk: HK; info?: ReturnType<typeof useRoomInfo> extends Map<string, infer V> ? V : never; arriving: boolean; late: boolean; onOpen: () => void; say: (s: string) => void }) {
  const items = listFor(hk.lists, t.kind);
  const done = (t.checks ?? []).filter(Boolean).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const action =
    t.status === "Done" ? null
    : t.status === "Review" ? <button onClick={onOpen} aria-label={`Inspect room ${t.room}`} className="h-10 rounded-xl border border-hms-line bg-white px-3.5 text-[13.5px] font-semibold hover:bg-hms-hover">Inspect</button>
    : t.status === "Doing" ? <button onClick={onOpen} aria-label={`Open checklist room ${t.room}`} className="h-10 rounded-xl border border-hms-line bg-white px-3.5 text-[13.5px] font-semibold hover:bg-hms-hover">Checklist</button>
    : t.who ? <button onClick={() => { hk.start(t.id); say(`Room ${t.room} · cleaning started`); }} aria-label={`Start cleaning room ${t.room}`} className="h-10 rounded-xl border border-hms-line bg-white px-3.5 text-[13.5px] font-semibold hover:bg-hms-hover">Start cleaning</button>
    : <select aria-label={`Assign room ${t.room}`} value="" onChange={(e) => { hk.assign(t.id, e.target.value); say(`Room ${t.room} → ${e.target.value}`); }} className="h-10 rounded-xl border border-hms-line bg-white px-2.5 text-[13.5px] font-semibold"><option value="">Assign…</option>{hk.staff.map((s) => <option key={s}>{s}</option>)}</select>;
  return (
    <li className={clsx("flex flex-col rounded-[20px] border bg-white p-4", arriving ? "border-[#f1d39a]" : "border-hms-line")}>
      <div className="flex items-start gap-2">
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <span className="block text-[17px] font-bold">Room {t.room}</span>
          <span className="block truncate text-[13px] text-hms-muted">{[info?.type, info?.where, KIND_LABEL[t.kind]].filter(Boolean).join(" · ")}</span>
        </button>
        <Stage t={t} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="min-w-0 flex-1"><Person name={t.who} sub={personSub(t)} /></div>
        <div className="shrink-0 text-right text-[12.5px]">
          {t.status !== "Done" && t.due && <span className={clsx("flex items-center justify-end gap-1", late ? "font-semibold text-[#b42318]" : "text-hms-muted")}>{late ? <AlarmClock className="size-3.5" /> : <Clock className="size-3.5" />}{late ? "Overdue · " : "Due "}{t.due}</span>}
          {(arriving || (t.priority && t.priority !== "Normal" && t.priority !== "Low")) && <span className={clsx("mt-1 inline-block rounded-md px-1.5 py-0.5 text-[11.5px] font-bold", arriving ? "bg-[#fdf3d9] text-[#7a4a0b]" : PRI[t.priority!])}>{arriving ? "Guest arriving" : t.priority}</span>}
        </div>
      </div>
      {items.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[12.5px] text-hms-muted"><span className="flex items-center gap-1"><ListChecks className="size-3.5" />Checklist</span><span className="tabular-nums">{done}/{items.length} done</span></div>
          <div role="progressbar" aria-label={`Room ${t.room} checklist`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#eef0f3]"><div className="h-full rounded-full bg-[#1d4ed8] transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-hms-line pt-3">
        <button onClick={onOpen} className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-hms-muted hover:text-hms-ink">View task<ChevronRight className="size-4" /></button>
        {action}
      </div>
    </li>
  );
}

/** Who is working where right now — one chip per housekeeping staff member. */
function TeamNow({ hk, onPick }: { hk: HK; onPick: (id: string) => void }) {
  const rows = hk.staff.map((s) => {
    const mine = hk.st.tasks.filter((t) => t.who === s && t.status !== "Done" && CLEANING.includes(t.kind));
    const now = mine.find((t) => t.status === "Doing");
    const items = now ? listFor(hk.lists, now.kind).length : 0;
    const next = mine.filter((t) => t.status === "Open");
    const waitingInsp = mine.filter((t) => t.status === "Review");
    return { s, now, items, next, waitingInsp, first: now ?? next[0] ?? waitingInsp[0] };
  });
  if (!rows.length) return <p className="mt-4 text-[13.5px] text-hms-muted">No housekeeping staff yet — add them in <Link href="/hms/staff/people" className="font-semibold text-[#c8232e]">Staff</Link> (department Housekeeping).</p>;
  return (
    <section aria-label="Team now" className="mt-4">
      <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-hms-muted">Team now</h2>
      <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {rows.map((r) => (
          <li key={r.s} className="shrink-0">
            <button onClick={() => r.first && onPick(r.first.id)} disabled={!r.first} className="flex w-[232px] items-center gap-2.5 rounded-2xl border border-hms-line bg-white px-3 py-2.5 text-left enabled:hover:border-[#c9ced6]">
              <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-[#ffecec] text-[12px] font-bold text-[#c8232e]">{initials(r.s)}
                <span className={clsx("absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white", r.now ? "bg-[#2563eb]" : r.next.length ? "bg-[#d97706]" : "bg-[#16a34a]")} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-semibold">{r.s}</span>
                <span className="block truncate text-[12.5px] text-hms-muted">
                  {r.now ? <>Cleaning <b className="text-hms-ink">{r.now.room}</b> · {(r.now.checks ?? []).filter(Boolean).length}/{r.items}</>
                    : r.next.length ? <>Next: <b className="text-hms-ink">{r.next.map((t) => t.room).join(", ")}</b></>
                    : r.waitingInsp.length ? <>{r.waitingInsp.map((t) => t.room).join(", ")} waiting inspection</> : "Free"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReadyRooms({ hk, rooms, info, say }: { hk: HK; rooms: string[]; info: ReturnType<typeof useRoomInfo>; say: (t: string) => void }) {
  return (
    <section aria-label="Ready rooms" className="mt-4">
      <p className="mb-3 text-[13.5px] text-hms-muted">Rooms clean{hk.rules.inspection ? " and inspected" : ""} — ready to sell or check in. Mark a room dirty if a guest used it or it needs cleaning again.</p>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {rooms.map((c) => { const r = info.get(c); return (
          <li key={c} className="flex flex-col rounded-2xl border border-[#b8e2c8] bg-white p-3">
            <div className="flex items-center gap-2"><b className="text-[17px] tabular-nums">{c}</b><span className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#16693a]"><CircleCheck className="size-3.5" />Ready</span></div>
            <p className="mt-0.5 truncate text-[12.5px] text-hms-muted">{r?.occ}{r?.guest ? ` · ${r.guest}` : ""}</p>
            <button onClick={() => { hk.setClean(c, "Dirty"); hk.addTask(c, r?.occ === "Occupied" ? "Stay-over" : "Check-out clean"); say(`Room ${c} · needs cleaning`); }} aria-label={`Mark room ${c} dirty`} className="mt-2.5 h-9 rounded-xl border border-hms-line bg-white text-[13px] font-semibold text-[#4d5664] hover:bg-hms-hover">Mark dirty</button>
          </li>); })}
      </ul>
      {!rooms.length && <p className={clsx(card, "px-6 py-10 text-center text-[14px] text-hms-muted")}>No rooms ready yet.</p>}
    </section>
  );
}

// ---------------------------------------------------------------- Task sheet (step by step)
function TaskSheet({ t, hk, info, onClose, say }: { t: Task; hk: HK; info?: { type: string; where: string; occ: string; guest?: string }; onClose: () => void; say: (s: string) => void }) {
  const [pane, setPane] = useState<"checklist" | "activity">("checklist");
  const [back, setBack] = useState(false);
  const [why, setWhy] = useState("");
  const items = listFor(hk.lists, t.kind);
  const checks = t.checks ?? items.map(() => false);
  const reqLeft = items.filter((x, i) => x.req && !checks[i]).length;
  const insp = hk.rules.inspection && t.kind !== "Inspection";
  const steps = insp ? ["Assigned", "Cleaning", "Inspection", "Ready"] : ["Assigned", "Cleaning", "Ready"];
  const at = t.status === "Done" ? steps.length : t.status === "Review" ? 2 : t.status === "Doing" ? 1 : t.who ? 1 : 0;
  const log = hk.st.log.filter((l) => l.room === t.room || l.text.includes(`Room ${t.room}`)).slice(0, 20);
  const canTick = t.status === "Doing";
  const footer = t.status === "Done" ? <button onClick={onClose} className={bSoft}>Close</button>
    : t.status === "Open" ? <><button onClick={onClose} className={bSoft}>Close</button><button disabled={!t.who} onClick={() => { hk.start(t.id); say(`Room ${t.room} · cleaning started`); }} className={bMain}>Start cleaning</button></>
    : t.status === "Doing" ? <><button onClick={onClose} className={bSoft}>Close</button><button disabled={reqLeft > 0} onClick={() => { hk.submit(t.id); say(insp ? `Room ${t.room} · sent for inspection` : `Room ${t.room} · ready`); onClose(); }} className={bMain}>{insp ? "Submit for inspection" : "Mark room ready"}</button></>
    : back ? <><button onClick={() => setBack(false)} className={bSoft}>Cancel</button><button onClick={() => { hk.sendBack(t.id, why.trim()); say(`Room ${t.room} · sent back`); onClose(); }} className={bMain}>Send back</button></>
    : <><button onClick={() => setBack(true)} className={bSoft}>Send back</button><button onClick={() => { hk.approve(t.id); say(`Room ${t.room} · inspected, ready`); onClose(); }} className={bMain}>Approve inspection</button></>;
  return (
    <Drawer title={`Room ${t.room} · ${KIND_LABEL[t.kind]}`} onClose={onClose} footer={footer}>
      <ol aria-label="Steps" className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <li key={s} className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className={clsx("grid size-6 shrink-0 place-items-center rounded-full text-[11.5px] font-bold", i < at ? "bg-[#16a34a] text-white" : i === at ? "bg-[#c8232e] text-white" : "bg-[#eef0f3] text-hms-muted")} aria-hidden>{i < at ? <Check className="size-3.5" /> : i + 1}</span>
            <span className={clsx("truncate text-[12.5px] font-semibold", i === at ? "text-hms-ink" : "text-hms-muted")} aria-current={i === at ? "step" : undefined}>{s}</span>
            {i < steps.length - 1 && <span className={clsx("h-px min-w-2 flex-1", i < at ? "bg-[#16a34a]" : "bg-hms-line")} />}
          </li>
        ))}
      </ol>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-hms-line p-3.5 text-[13.5px]">
        <div className="col-span-2 flex items-center gap-2"><Stage t={t} /><span className="ml-auto inline-flex items-center gap-1.5 text-hms-muted"><BedDouble className="size-4" />{[info?.type, info?.where].filter(Boolean).join(" · ")}</span></div>
        <div><p className="text-[12px] text-hms-muted">Started</p><p className="font-semibold">{hm(t.started) || "Not yet"}</p></div>
        <div><p className="text-[12px] text-hms-muted">Target</p><p className="font-semibold">{t.due ?? "—"}</p></div>
        {info?.guest && <div className="col-span-2"><p className="text-[12px] text-hms-muted">Guest</p><p className="font-semibold">{info.guest} · {info.occ}</p></div>}
      </div>

      <Field label="Assigned to">
        <div className="mt-0 flex gap-2">
          <Select aria-label={`Assign ${t.kind} room ${t.room}`} value={t.who ?? ""} disabled={t.status === "Done"} onChange={(e) => { hk.assign(t.id, e.target.value); say(e.target.value ? `Room ${t.room} → ${e.target.value}` : `Room ${t.room} unassigned`); }}>
            <option value="">Not assigned</option>{hk.staff.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select aria-label="Priority" value={t.priority ?? "Normal"} disabled={t.status === "Done"} onChange={(e) => hk.setPriority(t.id, e.target.value as Priority)} className="!w-32">{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select>
        </div>
      </Field>

      <div role="tablist" aria-label="Task details" className="mt-5 inline-flex gap-1 rounded-xl bg-[#f4f5f7] p-1">
        <button role="tab" aria-selected={pane === "checklist"} onClick={() => setPane("checklist")} className={segBtn(pane === "checklist")}>Checklist</button>
        <button role="tab" aria-selected={pane === "activity"} onClick={() => setPane("activity")} className={segBtn(pane === "activity")}>Activity</button>
      </div>

      {pane === "checklist" ? (items.length ? (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[13.5px]"><b>{KIND_LABEL[t.kind]} <span className="font-normal text-hms-muted">({items.filter((x) => x.req).length} required)</span></b><span className="tabular-nums text-hms-muted">{checks.filter(Boolean).length} of {items.length} done</span></div>
          <ul className="mt-2 divide-y divide-hms-line rounded-2xl border border-hms-line">
            {items.map((x, i) => (
              <li key={i}><label className={clsx("flex items-center gap-3 px-3.5 py-3 text-[14px]", canTick ? "cursor-pointer" : "opacity-80")}>
                <input type="checkbox" checked={!!checks[i]} disabled={!canTick} onChange={() => hk.toggleCheck(t.id, i)} className="size-[18px] accent-[#c8232e]" />
                <span className={clsx("flex-1", checks[i] && "text-hms-muted line-through")}>{x.t}</span>{!x.req && <span className="text-[12px] text-hms-muted">Optional</span>}
              </label></li>
            ))}
          </ul>
          {t.status === "Open" && <p className="mt-2 text-[13px] text-hms-muted">{t.who ? "Start cleaning to tick items." : "Assign someone, then start cleaning."}</p>}
          {t.status === "Doing" && reqLeft > 0 && <p className="mt-2 rounded-xl bg-[#e8f0fe] px-3 py-2 text-[13px] text-[#1e3a8a]">{reqLeft} required item{reqLeft > 1 ? "s" : ""} left.</p>}
          {t.note && <p className="mt-2 rounded-xl bg-[#fdf3d9] px-3 py-2 text-[13px] text-[#6b4309]">{t.note}</p>}
          {back && <div className="mt-3"><Field label="What needs fixing?"><Area value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. bathroom mirror not clean" /></Field></div>}
        </div>
      ) : <p className="mt-3 text-[14px] text-hms-muted">No checklist for this task.</p>) : (
        <ul className="mt-3 space-y-2.5 text-[13.5px]">
          {log.map((l, i) => <li key={i} className="flex gap-2.5"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#c9ced6]" /><span><span className="block">{l.text}</span><span className="text-[12px] text-hms-muted">{hm(l.at)} · {l.by}</span></span></li>)}
          {!log.length && <li className="text-hms-muted">Task opened {hm(t.at)}{t.ref ? ` · ${t.ref}` : ""}.</li>}
        </ul>
      )}
    </Drawer>
  );
}

function AddTask({ hk, onClose, say }: { hk: HK; onClose: () => void; say: (s: string) => void }) {
  const [room, setRoom] = useState("");
  const [kind, setKind] = useState<TaskKind>("Check-out clean");
  const [who, setWho] = useState("");
  const [pri, setPri] = useState<Priority>(hk.rules.priority);
  const [due, setDue] = useState("");
  const [note, setNote] = useState("");
  const items = listFor(hk.lists, kind);
  return (
    <Drawer title="Add cleaning task" onClose={onClose} footer={<><button onClick={onClose} className={bSoft}>Cancel</button><button disabled={!room} onClick={() => { hk.addTask(room, kind, { who: who || undefined, note: note.trim() || undefined, priority: pri, ...(due ? { due } : {}) }); say(`${KIND_LABEL[kind]} added for ${room}`); onClose(); }} className={bMain}>Create task</button></>}>
      <div className="space-y-4">
        <Field label="Room"><Select aria-label="Task room" value={room} onChange={(e) => setRoom(e.target.value)}><option value="">Choose room…</option>{hk.units.map((u) => <option key={u}>{u}</option>)}</Select></Field>
        <Field label="Task type" hint={items.length ? `${items.length} checklist items · ${items.filter((x) => x.req).length} required` : undefined}><Select aria-label="Task type" value={kind} onChange={(e) => setKind(e.target.value as TaskKind)}>{KINDS.filter((k) => k !== "Fix").map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</Select></Field>
        <Field label="Assign staff"><Select aria-label="Assign to" value={who} onChange={(e) => setWho(e.target.value)}><option value="">Not assigned</option>{hk.staff.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority"><Select aria-label="Task priority" value={pri} onChange={(e) => setPri(e.target.value as Priority)}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
          <Field label="Target time" hint="Empty = from task type"><Input type="time" aria-label="Target time" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        </div>
        <Field label="Note (optional)"><Area aria-label="Task note" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </div>
    </Drawer>
  );
}

// ---------------------------------------------------------------- Maintenance
function Maintenance({ hk, rooms, say }: { hk: HK; rooms: ReturnType<typeof useRooms>; say: (t: string) => void }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const fixes = hk.st.tasks.filter((t) => t.kind === "Fix" && t.status !== "Done");
  const blockedOnly = rooms.st.units.filter((u) => u.ooo && (!u.ooo.until || u.ooo.until > TODAY) && !fixes.some((t) => t.room === u.code));
  const rows = fixes.filter((t) => (!status || (status === "open" ? t.status === "Open" : t.status === "Doing")) && (!q || `${t.room} ${t.note ?? ""} ${t.who ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  const unit = (c: string) => rooms.st.units.find((u) => u.code === c);
  const setBlock = (c: string, on: boolean, reason: string) => rooms.update((s) => { const u = s.units.find((x) => x.code === c)!; if (on) u.ooo = { reason, since: TODAY }; else delete u.ooo; }, on ? `${c} out of order: ${reason}` : `${c} back in service`);
  const fixed = (t: Task) => { hk.finish(t.id); if (unit(t.room)?.ooo) setBlock(t.room, false, ""); say(`Room ${t.room} fixed`); };
  return (
    <>
      <div className={clsx(card, "grid grid-cols-3 overflow-hidden")}>
        {[["Open", fixes.filter((t) => t.status === "Open").length], ["In progress", fixes.filter((t) => t.status === "Doing").length], ["Rooms blocked", rooms.st.units.filter((u) => oooOn(u, TODAY, addDays(TODAY, 1))).length]].map(([l, c], i) => (
          <div key={l as string} className={clsx("flex items-center justify-center gap-2 px-3 py-3.5 text-[14px]", i > 0 && "border-l border-hms-line")}><span className="font-medium">{l}</span><b className="text-[18px] tabular-nums">{c}</b></div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search maintenance</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-hms-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search room, issue or staff" className="h-11 w-full rounded-xl border border-hms-line bg-white pl-9 pr-3 text-[14px] outline-none focus:border-[#c8232e]" /></label>
        <select aria-label="Maintenance status" value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-hms-line bg-white px-3 text-[14px]"><option value="">All status</option><option value="open">Open</option><option value="doing">In progress</option></select>
      </div>
      <div className={clsx(card, "mt-4 overflow-x-auto")} tabIndex={0} role="region" aria-label="Maintenance requests">
        <table className="w-full min-w-[820px] text-left text-[14px]">
          <thead className="text-[12.5px] text-hms-muted"><tr className="border-b border-hms-line">{["Room", "Issue", "Priority", "Assignee", "Status", "Room block", ""].map((x) => <th key={x} className="px-4 py-3 font-medium">{x}</th>)}</tr></thead>
          <tbody>
            {rows.map((t) => { const u = unit(t.room); return (
              <tr key={t.id} className="border-b border-hms-line last:border-0">
                <td className="px-4 py-3 font-semibold">Room {t.room}</td>
                <td className="max-w-[260px] px-4 py-3">{t.note ?? "—"}</td>
                <td className="px-4 py-3"><span className={clsx("rounded-md px-1.5 py-0.5 text-[12px] font-bold", PRI[t.priority ?? "Normal"])}>{t.priority ?? "Normal"}</span></td>
                <td className="px-4 py-3"><select aria-label={`Assign maintenance room ${t.room}`} value={t.who ?? ""} onChange={(e) => hk.assign(t.id, e.target.value)} className="h-9 rounded-xl border border-hms-line bg-white px-2 text-[13px]"><option value="">Not assigned</option>{hk.staff.map((s) => <option key={s}>{s}</option>)}</select></td>
                <td className="px-4 py-3"><span className={clsx("text-[13px] font-semibold", t.status === "Doing" ? "text-[#1d4ed8]" : "text-[#8a4b00]")}>{t.status === "Doing" ? "In progress" : "Open"}</span></td>
                <td className="px-4 py-3"><Toggle on={!!u?.ooo} label={`Block room ${t.room}`} set={(on) => { setBlock(t.room, on, t.note ?? "Maintenance"); say(on ? `Room ${t.room} blocked` : `Room ${t.room} open for sale`); }} /><span className="ml-2 text-[12.5px] text-hms-muted">{u?.ooo ? "Out of order" : "Sellable"}</span></td>
                <td className="px-4 py-3 text-right">{t.status === "Open"
                  ? <button onClick={() => { hk.start(t.id); say(`Room ${t.room} · repair started`); }} className="h-9 rounded-xl border border-hms-line bg-white px-3 text-[13.5px] font-semibold hover:bg-hms-hover">Start</button>
                  : <button onClick={() => fixed(t)} aria-label={`Mark room ${t.room} fixed`} className="h-9 rounded-xl border border-hms-line bg-white px-3 text-[13.5px] font-semibold hover:bg-hms-hover">Mark fixed</button>}</td>
              </tr>); })}
            {blockedOnly.map((u) => (
              <tr key={u.code} className="border-b border-hms-line last:border-0">
                <td className="px-4 py-3 font-semibold">Room {u.code}</td>
                <td className="px-4 py-3">{u.ooo!.reason}<span className="block text-[12px] text-hms-muted">{dm(u.ooo!.since.slice(0, 10))} → {u.ooo!.until ? dm(u.ooo!.until) : "until fixed"}</span></td>
                <td className="px-4 py-3 text-hms-muted">—</td><td className="px-4 py-3 text-hms-muted">—</td><td className="px-4 py-3 text-[13px] font-semibold text-[#8a4b00]">Out of order</td>
                <td className="px-4 py-3"><Toggle on label={`Block room ${u.code}`} set={() => { setBlock(u.code, false, ""); say(`${u.code} back in service`); }} /><span className="ml-2 text-[12.5px] text-hms-muted">Out of order</span></td>
                <td className="px-4 py-3 text-right"><button onClick={() => { setBlock(u.code, false, ""); say(`${u.code} back in service`); }} className="h-9 rounded-xl border border-hms-line bg-white px-3 text-[13.5px] font-semibold hover:bg-hms-hover">Back in service</button></td>
              </tr>
            ))}
            {!rows.length && !blockedOnly.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-hms-muted"><Wrench className="mx-auto mb-2 size-5" />No open maintenance.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[13px] text-hms-muted">A blocked room can’t be sold. Bookings already on those dates are not moved — the calendar shows them so you can move guests.</p>
    </>
  );
}
function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return <button role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)} className={clsx("relative inline-flex h-6 w-10 shrink-0 rounded-full align-middle transition-colors", on ? "bg-[#c8232e]" : "bg-[#d3d8df]")}><span className={clsx("absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]", on ? "left-[18px]" : "left-0.5")} /></button>;
}

function AddMaintenance({ hk, rooms, onClose, say }: { hk: HK; rooms: ReturnType<typeof useRooms>; onClose: () => void; say: (t: string) => void }) {
  const [room, setRoom] = useState("");
  const [issue, setIssue] = useState("");
  const [pri, setPri] = useState<Priority>("High");
  const [who, setWho] = useState("");
  const [block, setBlock] = useState(false);
  const [since, setSince] = useState(TODAY);
  const [until, setUntil] = useState("");
  const ok = room && issue.trim() && (!until || until > since);
  return (
    <Drawer title="Add maintenance" onClose={onClose} footer={<><button onClick={onClose} className={bSoft}>Cancel</button><button disabled={!ok} onClick={() => {
      hk.addTask(room, "Fix", { note: issue.trim(), priority: pri, who: who || undefined, block });
      if (block) rooms.update((s) => { s.units.find((x) => x.code === room)!.ooo = { reason: issue.trim(), since, ...(until ? { until } : {}) }; }, `${room} out of order: ${issue.trim()}`);
      say(block ? `${room} blocked from ${dm(since)}` : `Maintenance added for ${room}`); onClose();
    }} className={bMain}>Add maintenance</button></>}>
      <div className="space-y-4">
        <Field label="Room"><Select aria-label="Room out of order" value={room} onChange={(e) => setRoom(e.target.value)}><option value="">Choose room…</option>{hk.units.map((u) => <option key={u}>{u}</option>)}</Select></Field>
        <Field label="Issue"><Input aria-label="Out of order reason" value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="e.g. AC not cooling" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority"><Select aria-label="Maintenance priority" value={pri} onChange={(e) => setPri(e.target.value as Priority)}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
          <Field label="Assign"><Select aria-label="Maintenance assignee" value={who} onChange={(e) => setWho(e.target.value)}><option value="">Not assigned</option>{hk.staff.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-hms-line p-3.5"><span className="flex-1"><span className="block text-[14px] font-semibold">Block the room (out of order)</span><span className="block text-[12.5px] text-hms-muted">The room can’t be sold on these dates.</span></span><Toggle on={block} set={setBlock} label="Block the room" /></label>
        {block && <div className="grid grid-cols-2 gap-3">
          <Field label="From"><Input type="date" aria-label="Out of order from" min={TODAY} value={since} onChange={(e) => setSince(e.target.value || TODAY)} /></Field>
          <Field label="Back on (optional)"><Input type="date" aria-label="Back in service on" min={since} value={until} onChange={(e) => setUntil(e.target.value)} /></Field>
        </div>}
      </div>
    </Drawer>
  );
}

// ---------------------------------------------------------------- Checklist templates
function Checklists({ hk, say }: { hk: HK; say: (t: string) => void }) {
  const h = useProperty();
  const set = useSettings(h);
  const [k, setK] = useState<(typeof LIST_KINDS)[number]>("Check-out clean");
  const [draft, setDraft] = useState(() => structuredClone(hk.lists));
  const [add, setAdd] = useState("");
  const list = draft[k];
  const put = (l: CheckItem[]) => setDraft({ ...draft, [k]: l });
  const dirty = JSON.stringify(draft) !== JSON.stringify(hk.lists);
  return (
    <section className={clsx(card, "p-5")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-[18px] font-bold">Checklist template</h2><p className="text-[13.5px] text-hms-muted">Changes apply to new tasks. Tasks already open keep their checklist.</p></div>
        <label className="flex items-center gap-2.5 text-[14px] font-medium">Inspection required<Toggle on={hk.rules.inspection} label="Inspection required" set={(v) => { set.save((s) => { s.hk.inspection = v; }, v ? "Inspection required" : "Inspection not required"); say(v ? "Rooms need inspection before ready" : "Rooms are ready after cleaning"); }} /></label>
      </div>
      <div role="radiogroup" aria-label="Checklist type" className="mt-4 flex flex-wrap gap-2">
        {LIST_KINDS.map((x) => <button key={x} role="radio" aria-checked={k === x} onClick={() => setK(x)} className={clsx("h-10 rounded-xl border px-4 text-[14px] font-semibold", k === x ? "border-[#f3c4c0] bg-[#ffecec] text-[#c8232e]" : "border-hms-line bg-white hover:bg-hms-hover")}>{KIND_LABEL[x]}</button>)}
      </div>
      <p className="mt-4 text-[13.5px] font-semibold">Checklist items ({list.length})</p>
      <ol className="mt-2 space-y-2">
        {list.map((x, i) => (
          <li key={i} className="flex items-center gap-3 rounded-xl border border-hms-line px-3 py-2">
            <span className="w-5 text-right text-[13px] tabular-nums text-hms-muted">{i + 1}.</span>
            <input aria-label={`Item ${i + 1}`} value={x.t} onChange={(e) => put(list.map((y, j) => (j === i ? { ...y, t: e.target.value } : y)))} className="h-9 min-w-0 flex-1 rounded-lg bg-transparent px-1 text-[14px] outline-none focus:bg-hms-hover" />
            <label className="flex items-center gap-1.5 text-[13px]"><input type="checkbox" checked={x.req} onChange={() => put(list.map((y, j) => (j === i ? { ...y, req: !y.req } : y)))} className="size-4 accent-[#c8232e]" />Required</label>
            <button aria-label={`Remove item ${i + 1}`} onClick={() => put(list.filter((_, j) => j !== i))} className="grid size-9 place-items-center rounded-xl text-hms-muted hover:bg-hms-hover hover:text-[#b42318]"><Trash2 className="size-4" /></button>
          </li>
        ))}
      </ol>
      <form onSubmit={(e) => { e.preventDefault(); if (add.trim()) { put([...list, { t: add.trim(), req: true }]); setAdd(""); } }} className="mt-2 flex gap-2">
        <input aria-label="New checklist item" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Add an item" className="h-11 min-w-0 flex-1 rounded-xl border border-hms-line px-3 text-[14px] outline-none focus:border-[#c8232e]" />
        <button className={bSoft}><Plus className="size-4" />Add</button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-hms-line pt-4">
        <button onClick={() => setDraft(structuredClone(DEFAULT_LISTS))} className="mr-auto text-[13.5px] font-semibold text-hms-muted hover:text-hms-ink">Reset to BinGi default</button>
        <button disabled={!dirty} onClick={() => setDraft(structuredClone(hk.lists))} className={bSoft}>Discard</button>
        <button disabled={!dirty || draft[k].some((x) => !x.t.trim())} onClick={() => { hk.saveLists(draft); say("Checklist saved"); }} className={bMain}>Save checklist</button>
      </div>
    </section>
  );
}

