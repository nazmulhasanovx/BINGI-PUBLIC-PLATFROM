"use client";
// Cashbox v2 (11 Nov 2026) — cash drawers per property per business day.
// • Main cashbox (front desk): follows the live HMS Cashbox (Overview / Movement history / Withdraw / Close & reconcile).
// • Restaurant & Bar cashboxes (optional, Settings → "Separate restaurant cash"): one drawer per outlet group.
//   Their sales never post to the main cashbox one by one. Cash reaches the main cashbox only as a handover
//   (mid-day drop or at closing), or goes straight to the bank. Room-charged bills are paid at checkout (main).
// Movements are immutable: a mistake is fixed with a reversal. Auto-posted entries are fixed in their own module.
// Production: cashbox_drawers(property, kind, name, outlets[]), cashbox_days(drawer, date, …), cashbox_movements(drawer, day, …, link_id)
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY } from "@/lib/rooms/store";
import { seedCash } from "@/lib/meals/seed";

export type InSource = "booking" | "restaurant" | "service" | "other" | "dinein" | "takeaway" | "roomservice" | "handover";
export type OutReason = "owner" | "bank" | "transfer" | "petty" | "refund" | "handover" | "expense";
export type Movement = {
  id: string; drawer: string; day: string; at: string; kind: "in" | "out"; amount: number;
  source?: InSource; reason?: OutReason; ref?: string; party?: string; account?: string; category?: string; note?: string;
  by: string; approvedBy?: string; reverses?: string; reversedBy?: string; auto?: boolean; link?: string;
};
export type Day = {
  drawer: string; date: string; openedAt: string; openedBy: string; float: number; openNote?: string;
  closedAt?: string; closedBy?: string; expected?: number; counted?: number; varianceNote?: string; carry?: number; deposit?: number; depositTo?: "bank" | "main";
};
export type Drawer = { id: string; name: string; kind: "main" | "fnb"; outlets: string[] };
type State = { v: 2; separate: boolean; drawers: Drawer[]; days: Day[]; moves: Movement[]; seq: number };

export const ME = "Md Yeapas";
export const MAIN = "main";
/** Cash out above this needs the name of the manager who approved it. */
export const APPROVAL_LIMIT = 5000;
export const IN_LABEL: Record<InSource, string> = {
  booking: "Room booking", restaurant: "Restaurant & bar", service: "Other services", other: "Other income",
  dinein: "Dine-in / counter", takeaway: "Takeaway", roomservice: "Room service (cash)", handover: "Outlet handover",
};
export const OUT_LABEL: Record<OutReason, string> = { owner: "Owner withdrawal", bank: "Bank deposit", transfer: "Cash transfer", petty: "Petty cash expense", refund: "Guest refund", handover: "Handed to main cashbox", expense: "Expense paid" };
/** What each kind of drawer can record by hand. */
export const IN_FOR = (kind: Drawer["kind"], separate: boolean): InSource[] => kind === "fnb" ? ["dinein", "takeaway", "roomservice", "other"] : separate ? ["booking", "service", "other"] : ["booking", "restaurant", "service", "other"];
export const OUT_FOR = (kind: Drawer["kind"]): OutReason[] => kind === "fnb" ? ["handover", "petty", "refund", "bank"] : ["owner", "bank", "transfer", "petty", "refund"];
export const PETTY = ["Supplies", "Transport", "Repairs", "Staff food", "Laundry", "Other"];
export const NOTES = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
export const tk = (n: number) => `${n < 0 ? "−" : ""}৳${new Intl.NumberFormat("en-IN").format(Math.abs(Math.round(n)))}`;
export const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtDate = (d: string) => `${Number(d.slice(8, 10))} ${MON[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;
export const fmtTime = (at: string) => { const [h, m] = at.slice(11, 16).split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
export const label = (m: Movement) => (m.kind === "in" ? IN_LABEL[m.source ?? "other"] : OUT_LABEL[m.reason ?? "petty"]);

/** Expected cash for a drawer-day: opening float + cash in − cash out (reversals are movements too, so they net out). */
export function totals(day: Day | undefined, moves: Movement[]) {
  const ms = day ? moves.filter((m) => m.drawer === day.drawer && m.day === day.date) : [];
  const cin = ms.filter((m) => m.kind === "in").reduce((s, m) => s + m.amount, 0);
  const cout = ms.filter((m) => m.kind === "out").reduce((s, m) => s + m.amount, 0);
  return { float: day?.float ?? 0, cin, cout, now: (day?.float ?? 0) + cin - cout, count: ms.length };
}

// ---------------- demo seed ----------------
type StayRef = { code: string; guest: string };
function fnbDrawers(h: Hotel): Drawer[] {
  const os = h.outlets ?? [];
  const eat = os.filter((o) => o.kind === "restaurant" || o.kind === "cafe");
  const bar = os.filter((o) => o.kind === "bar");
  const rs = os.filter((o) => o.kind === "room-service").map((o) => o.name);
  const out: Drawer[] = [];
  if (eat.length) out.push({ id: "fnb-1", name: `${eat[0].name} cashbox`, kind: "fnb", outlets: [...eat.map((o) => o.name), ...rs] });
  if (bar.length) out.push({ id: "fnb-2", name: `${bar[0].name} cashbox`, kind: "fnb", outlets: bar.map((o) => o.name) });
  if (!out.length) out.push({ id: "fnb-1", name: "Restaurant cashbox", kind: "fnb", outlets: ["Restaurant", "Room service"] });
  return out;
}
function seed(h: Hotel, stays: StayRef[]): State {
  const fnb = fnbDrawers(h);
  const drawers: Drawer[] = [{ id: MAIN, name: "Main cashbox (front desk)", kind: "main", outlets: [] }, ...fnb];
  const days: Day[] = [];
  const moves: Movement[] = [];
  let n = 1;
  const id = () => `m${n++}`;
  const ref = (i: number) => stays[i % Math.max(1, stays.length)]?.code ?? `BK-${2380 + i}`;
  const who = (i: number) => stays[i % Math.max(1, stays.length)]?.guest;
  const staff = ["Rahim (Front desk)", "Sumi (Front desk)", ME];
  const cashier = ["Tanvir (Restaurant)", "Mitu (Bar)"];
  const variances = [0, -200, 0, 0, 150, 0];
  // restaurant cash comes from the same demo orders as Restaurant & Bar (Meals)
  const cash = seedCash(h);
  const salesFor = (d: Drawer, date: string, j: number, i: number): Movement[] => {
    const real = cash.filter((c) => c.day === date && d.outlets.includes(c.outlet));
    if (real.length || cash.some((c) => d.outlets.includes(c.outlet))) return real.map((c) => ({ id: id(), drawer: d.id, day: date, at: c.at, kind: "in", amount: c.amount, source: c.source, ref: c.ref, by: cashier[j % 2], auto: true }));
    return [
      { id: id(), drawer: d.id, day: date, at: `${date}T13:3${i}`, kind: "in", amount: 4200 + i * 330 + j * 900, source: "dinein", ref: `BR-${7100 + i * 7 + j}`, by: cashier[j % 2], auto: true },
      { id: id(), drawer: d.id, day: date, at: `${date}T20:1${i}`, kind: "in", amount: 6100 + i * 410 + j * 700, source: "dinein", ref: `BR-${7103 + i * 7 + j}`, by: cashier[j % 2], auto: true },
    ];
  };
  const close = (day: Day, ms: Movement[], counted: number, carry: number, to: "bank" | "main", note?: string) => {
    const t = totals(day, ms);
    day.expected = t.now; day.counted = counted; day.carry = carry; day.deposit = counted - carry; day.depositTo = to;
    if (counted !== t.now) day.varianceNote = note;
  };
  for (let k = 6; k >= 1; k--) {
    const date = addDays(TODAY, -k), i = 6 - k;
    // outlets close first (22:1x) and hand cash to the main cashbox, which closes at 23:4x
    const handovers: Movement[] = [];
    fnb.forEach((d, j) => {
      const day: Day = { drawer: d.id, date, openedAt: `${date}T07:0${i}`, openedBy: cashier[j % 2], float: 2000 };
      const ms: Movement[] = [
        ...salesFor(d, date, j, i),
        { id: id(), drawer: d.id, day: date, at: `${date}T16:0${i}`, kind: "out", amount: 300 + i * 40, reason: "petty", category: "Supplies", note: j ? "Ice" : "Lemons and mint", by: cashier[j % 2] },
      ];
      day.closedAt = `${date}T22:1${i}`; day.closedBy = cashier[j % 2];
      const v = i === 2 && j === 0 ? -100 : 0;
      const counted = totals(day, ms).now + v;
      close(day, ms, counted, 2000, "main", "Short at shift change");
      const out: Movement = { id: id(), drawer: d.id, day: date, at: day.closedAt, kind: "out", amount: counted - 2000, reason: "handover", note: "Handover at closing", by: cashier[j % 2], auto: true };
      const inn: Movement = { id: id(), drawer: MAIN, day: date, at: day.closedAt, kind: "in", amount: counted - 2000, source: "handover", party: d.name, note: "Handover at closing", by: cashier[j % 2], auto: true, link: out.id };
      out.link = inn.id;
      ms.push(out); handovers.push(inn);
      days.push(day); moves.push(...ms);
    });
    const day: Day = { drawer: MAIN, date, openedAt: `${date}T08:0${i}`, openedBy: staff[i % 2], float: 5000 };
    const ms: Movement[] = [
      { id: id(), drawer: MAIN, day: date, at: `${date}T09:1${i}`, kind: "in", amount: 8000 + i * 1300, source: "booking", ref: ref(i + 3), party: who(i + 3), by: staff[i % 2], auto: true },
      { id: id(), drawer: MAIN, day: date, at: `${date}T16:4${i}`, kind: "in", amount: 1800 + (i % 3) * 600, source: "service", ref: `OSO-${1020 + i}`, by: staff[i % 2], auto: true },
      { id: id(), drawer: MAIN, day: date, at: `${date}T17:1${i}`, kind: "out", amount: 600 + i * 90, reason: "petty", category: PETTY[i % PETTY.length], note: ["Cleaning liquid", "CNG to market", "Tap washer", "Staff lunch", "Iron repair", "Light bulbs"][i], by: staff[i % 2] },
      ...handovers,
    ];
    day.closedAt = `${date}T23:4${i}`; day.closedBy = staff[(i + 1) % 2];
    const counted = totals(day, ms).now + variances[i];
    close(day, ms, counted, 5000, "bank", variances[i] < 0 ? "Change given twice to a walk-in guest" : "Tip left in the drawer");
    if (counted > 5000) ms.push({ id: id(), drawer: MAIN, day: date, at: day.closedAt, kind: "out", amount: counted - 5000, reason: "bank", account: "City Bank ···4417", note: "Deposit at closing", by: day.closedBy, auto: true });
    days.push(day); moves.push(...ms);
  }
  days.push({ drawer: MAIN, date: TODAY, openedAt: `${TODAY}T08:02`, openedBy: "Rahim (Front desk)", float: 5000 });
  moves.push(
    { id: id(), drawer: MAIN, day: TODAY, at: `${TODAY}T09:05`, kind: "in", amount: 12000, source: "booking", ref: ref(0), party: who(0), by: "Rahim (Front desk)", auto: true },
    { id: id(), drawer: MAIN, day: TODAY, at: `${TODAY}T10:40`, kind: "out", amount: 850, reason: "petty", category: "Supplies", note: "Printer paper and pens", by: "Rahim (Front desk)" },
    { id: id(), drawer: MAIN, day: TODAY, at: `${TODAY}T12:30`, kind: "in", amount: 2500, source: "service", ref: "OSO-1044", party: who(1), by: ME, auto: true },
    { id: id(), drawer: MAIN, day: TODAY, at: `${TODAY}T13:10`, kind: "in", amount: 6200, source: "booking", ref: ref(2), party: who(2), by: ME, auto: true },
    { id: id(), drawer: MAIN, day: TODAY, at: `${TODAY}T14:05`, kind: "out", amount: 500, reason: "owner", party: "Owner", note: "Sent by bKash", by: ME },
  );
  fnb.forEach((d, j) => {
    days.push({ drawer: d.id, date: TODAY, openedAt: `${TODAY}T07:0${j}`, openedBy: cashier[j % 2], float: 2000 });
    moves.push(
      ...salesFor(d, TODAY, j, 0),
      { id: id(), drawer: d.id, day: TODAY, at: `${TODAY}T11:1${j}`, kind: "out", amount: 240, reason: "petty", category: "Supplies", note: j ? "Ice" : "Napkins", by: cashier[j % 2] },
    );
  });
  return { v: 2, separate: true, drawers, days, moves, seq: n };
}

// ---------------- store (one record per property) ----------------
const KEY = (slug: string) => `bingi-cashbox-v2-${slug}`;
const cache = new Map<string, { raw: string | null; sig: string; st: State }>();
const seeds = new Map<string, State>();
const listeners = new Set<() => void>();
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const EMPTY: State = { v: 2, separate: false, drawers: [], days: [], moves: [], seq: 1 };
function read(h: Hotel, stays: StayRef[]): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(h.slug)); } catch {}
  const sig = `${h.slug}|${stays.map((x) => x.code).join(",")}`;
  const hit = cache.get(h.slug);
  if (hit && hit.raw === raw && hit.sig === sig) return hit.st;
  if (!seeds.has(sig)) seeds.set(sig, seed(h, stays));
  let st = seeds.get(sig)!;
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 2 && Array.isArray(p.days) && Array.isArray(p.moves) && Array.isArray(p.drawers)) st = p; } catch {}
  cache.set(h.slug, { raw, sig, st });
  return st;
}
function write(slug: string, st: State) { const raw = JSON.stringify(st); try { localStorage.setItem(KEY(slug), raw); } catch {} cache.set(slug, { raw, sig: cache.get(slug)?.sig ?? "", st }); listeners.forEach((l) => l()); }
const stamp = () => `${TODAY}T${new Date().toTimeString().slice(0, 5)}`;
const isOpen = (s: State, drawer: string) => s.days.some((d) => d.drawer === drawer && d.date === TODAY && !d.closedAt);

export type NewMove = Omit<Movement, "id" | "day" | "at" | "by" | "drawer">;
export function useCashbox(h: Hotel, stays: StayRef[], drawerId = MAIN) {
  const st = useSyncExternalStore(sub, () => read(h, stays), () => EMPTY);
  const update = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h, stays)); fn(n); write(h.slug, n); }, [h, stays]);
  const drawer = st.drawers.find((d) => d.id === drawerId);
  const today = st.days.find((d) => d.drawer === drawerId && d.date === TODAY);
  const open = !!today && !today.closedAt;
  const last = useMemo(() => st.days.filter((d) => d.drawer === drawerId && d.closedAt).sort((a, b) => b.date.localeCompare(a.date))[0], [st.days, drawerId]);
  const t = totals(today, st.moves);
  const mainOpen = isOpen(st, MAIN);
  const fnb = st.drawers.filter((d) => d.kind === "fnb");
  /** Today's state of every outlet cashbox (for the main cashbox and for the manager). */
  const others = fnb.map((d) => { const day = st.days.find((x) => x.drawer === d.id && x.date === TODAY); return { d, day, open: !!day && !day.closedAt, t: totals(day, st.moves) }; });
  return {
    st, drawer, today, open, last, t, mainOpen, others, separate: st.separate,
    add: (m: NewMove) => update((s) => { s.moves.push({ ...m, id: `m${s.seq++}`, drawer: drawerId, day: TODAY, at: stamp(), by: ME }); }),
    /** Outlet → main cashbox. Two linked entries; needs the main cashbox open. */
    handover: (amount: number, note?: string) => update((s) => {
      if (!isOpen(s, MAIN)) return;
      const name = s.drawers.find((d) => d.id === drawerId)?.name ?? "Outlet";
      const a = `m${s.seq++}`, b = `m${s.seq++}`, at = stamp();
      s.moves.push({ id: a, drawer: drawerId, day: TODAY, at, kind: "out", amount, reason: "handover", note, by: ME, link: b });
      s.moves.push({ id: b, drawer: MAIN, day: TODAY, at, kind: "in", amount, source: "handover", party: name, note, by: ME, auto: true, link: a });
    }),
    reverse: (id: string, why: string) => update((s) => {
      const o = s.moves.find((m) => m.id === id); if (!o || o.reversedBy || o.reverses || o.auto || o.link) return;
      const nid = `m${s.seq++}`;
      s.moves.push({ id: nid, drawer: o.drawer, day: TODAY, at: stamp(), kind: o.kind === "in" ? "out" : "in", amount: o.amount, source: o.source, reason: o.reason, ref: o.ref, note: `Reversal: ${why}`, by: ME, reverses: o.id });
      o.reversedBy = nid;
    }),
    openDay: (float: number, note?: string) => update((s) => { if (!s.days.some((d) => d.drawer === drawerId && d.date === TODAY)) s.days.push({ drawer: drawerId, date: TODAY, openedAt: stamp(), openedBy: ME, float, openNote: note }); }),
    /** Close today: count, keep `carry` for tomorrow, the rest goes to the bank or (outlets) to the main cashbox. */
    closeDay: (counted: number, note: string | undefined, carry: number, to: "bank" | "main", account: string) => update((s) => {
      const d = s.days.find((x) => x.drawer === drawerId && x.date === TODAY); if (!d || d.closedAt) return;
      if (to === "main" && (drawerId === MAIN || !isOpen(s, MAIN))) return;
      const exp = totals(d, s.moves).now;
      d.closedAt = stamp(); d.closedBy = ME; d.expected = exp; d.counted = counted; d.varianceNote = counted !== exp ? note : undefined; d.carry = carry; d.deposit = Math.max(0, counted - carry); d.depositTo = to;
      if (!d.deposit) return;
      if (to === "bank") { s.moves.push({ id: `m${s.seq++}`, drawer: drawerId, day: TODAY, at: d.closedAt, kind: "out", amount: d.deposit, reason: "bank", account, note: "Deposit at closing", by: ME, auto: true }); return; }
      const name = s.drawers.find((x) => x.id === drawerId)?.name ?? "Outlet";
      const a = `m${s.seq++}`, b = `m${s.seq++}`;
      s.moves.push({ id: a, drawer: drawerId, day: TODAY, at: d.closedAt, kind: "out", amount: d.deposit, reason: "handover", note: "Handover at closing", by: ME, auto: true, link: b });
      s.moves.push({ id: b, drawer: MAIN, day: TODAY, at: d.closedAt, kind: "in", amount: d.deposit, source: "handover", party: name, note: "Handover at closing", by: ME, auto: true, link: a });
    }),
    // ---- settings (Restaurant & Bar → Cash settings) ----
    /** Returns an error message, or "" when saved. */
    setSeparate: (on: boolean): string => {
      const s0 = read(h, stays);
      if (!on && s0.drawers.some((d) => d.kind === "fnb" && isOpen(s0, d.id))) return "Close every restaurant & bar cashbox first";
      update((s) => {
        s.separate = on;
        if (on && !s.drawers.some((d) => d.kind === "fnb")) s.drawers.push(...fnbDrawers(h));
      });
      return "";
    },
    saveDrawer: (d: Drawer) => update((s) => { const i = s.drawers.findIndex((x) => x.id === d.id); if (i >= 0) s.drawers[i] = d; else s.drawers.push(d); }),
    removeDrawer: (id: string): string => {
      const s0 = read(h, stays);
      if (s0.moves.some((m) => m.drawer === id) || s0.days.some((d) => d.drawer === id)) return "This cashbox has history, so it can't be removed";
      update((s) => { s.drawers = s.drawers.filter((d) => d.id !== id); });
      return "";
    },
    newDrawerId: () => `fnb-${Date.now().toString(36)}`,
    reset: () => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); },
    startFresh: () => update((s) => { s.days = s.days.filter((d) => !(d.drawer === drawerId && d.date === TODAY)); s.moves = s.moves.filter((m) => !(m.drawer === drawerId && m.day === TODAY)); }),
  };
}
export type Cashbox = ReturnType<typeof useCashbox>;

/** Which drawer takes a restaurant outlet's cash: its own cashbox when separate is on, otherwise the main cashbox. */
export function drawerFor(h: Hotel, stays: StayRef[], outlet: string) {
  const s = read(h, stays);
  const own = s.separate ? s.drawers.find((d) => d.kind === "fnb" && d.outlets.includes(outlet)) : undefined;
  const d = own ?? s.drawers.find((x) => x.id === MAIN);
  return { id: d?.id ?? MAIN, name: d?.name ?? "Main cashbox", open: !!d && isOpen(s, d.id) };
}
/** Post a cash payment from another module (auto-posted, not reversible in Cashbox). Returns an error or "". */
export function postCash(h: Hotel, stays: StayRef[], outlet: string, m: { amount: number; source: InSource; ref: string; party?: string }) {
  const to = drawerFor(h, stays, outlet);
  if (!to.open) return `${to.name} is not open — open it before taking cash`;
  const s = structuredClone(read(h, stays));
  // Restaurant cash landing in the main drawer shows as "Restaurant"; bookings and services keep their own source.
  const source: InSource = to.id === MAIN && (m.source === "dinein" || m.source === "takeaway" || m.source === "roomservice") ? "restaurant" : m.source;
  s.moves.push({ id: `m${s.seq++}`, drawer: to.id, day: TODAY, at: stamp(), kind: "in", amount: m.amount, source, ref: m.ref, party: m.party, by: ME, auto: true });
  write(h.slug, s);
  return "";
}
/** Cash paid back to a guest from the main drawer (auto-posted). Returns an error or "". */
export function postCashOut(h: Hotel, stays: StayRef[], m: { amount: number; ref: string; party?: string }) {
  const s0 = read(h, stays);
  if (!isOpen(s0, MAIN)) return "Main cashbox is not open — open it before paying cash";
  const s = structuredClone(s0);
  s.moves.push({ id: `m${s.seq++}`, drawer: MAIN, day: TODAY, at: stamp(), kind: "out", amount: m.amount, reason: "refund", ref: m.ref, party: m.party, by: ME, auto: true });
  write(h.slug, s);
  return "";
}
/** Cash paid out of the main drawer for an approved expense / supplier bill (auto-posted from Expenses). Returns an error or "". */
export function postExpenseOut(h: Hotel, stays: StayRef[], m: { amount: number; ref: string; party?: string; category?: string; note?: string }) {
  const s0 = read(h, stays);
  if (!isOpen(s0, MAIN)) return "Main cashbox is not open — open it, or pay by bank / bKash";
  const day = s0.days.find((d) => d.drawer === MAIN && d.date === TODAY);
  const have = totals(day, s0.moves).now;
  if (m.amount > have) return `Only ${tk(have)} cash in the main cashbox`;
  const s = structuredClone(s0);
  s.moves.push({ id: `m${s.seq++}`, drawer: MAIN, day: TODAY, at: stamp(), kind: "out", amount: m.amount, reason: "expense", ref: m.ref, party: m.party, category: m.category, note: m.note, by: ME, auto: true });
  write(h.slug, s);
  return "";
}
