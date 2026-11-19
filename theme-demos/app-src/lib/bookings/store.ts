"use client";
// Bookings for one property (prototype: localStorage per property; production: bookings + booking_nights + payments).
// Rules kept from the project:
//   • booking status, payment status and room state (out of order) are separate fields — never mixed
//   • a room can hold one active booking per night (Confirmed / Checked in); cancelled and no-show free it
//   • prices come from Discounts & Rates (room price per night + automatic deals); VAT/service from the room type
//   • cash taken here is posted to the main Cashbox
// Every other module (Dashboard, Guests, Rooms, Cashbox, Other Services, Restaurant) reads stays from here via useStays().
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY, oooOn, taxOf, useRooms, type Category, type RoomsState, type Unit } from "@/lib/rooms/store";
import { DEMO_GUESTS, addDays, demoStays, hash, type Stay } from "./demo";

export type BStatus = "Confirmed" | "Checked in" | "Checked out" | "Cancelled" | "No-show";
/** Where a booking came from. OTA bookings carry the OTA name + its reference (recorded here; no live OTA sync in this prototype). */
export type Channel = "Walk-in" | "Phone" | "Website" | "Marketplace" | "OTA" | "Agent" | "Corporate";
export const CHANNELS: Channel[] = ["Walk-in", "Phone", "Website", "Marketplace", "OTA", "Agent", "Corporate"];
export const OTAS = ["Booking.com", "Agoda", "Expedia", "Airbnb"];
export const channelLabel = (b: Pick<Booking, "channel" | "ota">) => (b.channel === "OTA" ? b.ota || "OTA" : b.channel);
/** Meal pre-ordered with the booking. Held on the booking until sent to the kitchen (then it is a Restaurant order charged to the room). */
export type Charge = { id: string; label: string; amount: number; at: string };
export type Settings = {
  checkIn: string; checkOut: string; earlyFee: number; lateFee: number;
  /** Free cancellation up to this many days before arrival; later cancellations keep feePct of the first night. */
  freeCancelDays: number; cancelFeePct: number; noShowFeePct: number; depositDefault: number;
  preArrivalMsg: string; confirmMsg: string;
};
/** 24-hour "2:00 PM" → "14:00". */
const to24 = (x: string) => { const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(x.trim()); if (!m) return ""; let hh = Number(m[1]) % 12; if (m[3]?.toUpperCase() === "PM") hh += 12; if (!m[3]) hh = Number(m[1]); return `${String(hh).padStart(2, "0")}:${m[2]}`; };
/** Booking rules start from what the hotel already publishes (check-in times, cancellation days), so HMS and website agree. */
export function defaultSettings(h: Hotel): Settings {
  const c = h.policies?.cancellation ?? "";
  const hrs = /(\d+)\s*hours?/i.exec(c), dys = /(\d+)\s*days?/i.exec(c), pct = /(\d+)%/.exec(c);
  const free = hrs ? Math.max(1, Math.ceil(Number(hrs[1]) / 24)) : dys ? Number(dys[1]) : DEFAULT_SETTINGS.freeCancelDays;
  return { ...DEFAULT_SETTINGS, checkIn: to24(h.checkIn) || DEFAULT_SETTINGS.checkIn, checkOut: to24(h.checkOut) || DEFAULT_SETTINGS.checkOut, freeCancelDays: free, cancelFeePct: pct ? Number(pct[1]) : DEFAULT_SETTINGS.cancelFeePct };
}
export const DEFAULT_SETTINGS: Settings = {
  checkIn: "14:00", checkOut: "12:00", earlyFee: 1500, lateFee: 1500, freeCancelDays: 2, cancelFeePct: 50, noShowFeePct: 100, depositDefault: 2000,
  confirmMsg: "Dear {guest}, your booking {code} at {hotel} is confirmed: {room}, {from} to {to} ({nights} nights). Total {total}, paid {paid}. Check-in from {checkin}. See you soon!",
  preArrivalMsg: "Hi {guest}, we look forward to welcoming you at {hotel} on {from}. Check-in is from {checkin}. Save time at the desk — pre-check-in here: {link} . Booking {code}.",
};
export type Audit = { date: string; at: string; by: string; arrivals: number; departures: number; noShows: number; inHouse: number; revenue: number; collected: number };
export type Wait = { id: string; name: string; phone: string; from: string; to: string; category?: string; adults: number; note: string; at: string; done?: string };
export type Companion = { name: string; idType: string; idNo: string; relation: string; age?: string };
export const PURPOSES = ["Holiday", "Business", "Family visit", "Event / wedding", "Medical", "Other"];
export type PreMeal = { id: string; item: string; name: string; price: number; qty: number; date: string; time: string; note?: string; sc: number; vat: number; sent?: string };
export type PayMethod = "Cash" | "bKash" | "Card" | "Bank";
export const METHODS: PayMethod[] = ["Cash", "bKash", "Card", "Bank"];
export type Pay = { id: string; at: string; amount: number; method: PayMethod; by: string; note?: string };
export type Night = { date: string; base: number };
export type Booking = {
  code: string; group?: string; guestId: string;
  /** Room number; "" = not assigned yet. */
  unit: string; categoryId: string; type: string;
  from: string; to: string; adults: number; children: number;
  status: BStatus; channel: Channel; ota?: string; channelRef?: string;
  payer?: { kind: "Guest" | "Company"; name?: string };
  preMeals?: PreMeal[];
  /** Guest register for this stay. */
  purpose?: string; comingFrom?: string; goingTo?: string; eta?: string;
  companions?: Companion[];
  /** Person who made the booking, when not the guest (agent, family member, office). */
  booker?: { name: string; phone: string };
  /** Meals added to every night (e.g. dinner for all adults) — part of the room package, taxed like the room. */
  mealPlan?: { name: string; perNight: number };
  /** Guest filled the online pre-check-in form (prototype: this browser only). */
  precheck?: { at: string; idType?: string; idNo?: string; note?: string };
  /** Extra charges on the bill (early check-in, late check-out, minibar, damage…). Amounts include VAT. */
  charges?: Charge[];
  /** Security deposit — held, not part of the bill. Returned, or used to pay the bill. */
  deposit?: { amount: number; method: PayMethod; at: string; settled?: { returned: number; used: number; at: string } };
  /** Price before VAT/service for each night (from Discounts & Rates when booked). */
  nights: Night[]; tax: { service: number; vat: number };
  /** Discount on room charges (before VAT/service). */
  discount: number;
  payments: Pay[]; note: string; created: string;
  checkedInAt?: string; checkedOutAt?: string; cancel?: { reason: string; at: string; keep: number };
  log: { at: string; text: string; by: string }[];
  demo?: boolean;
};
type State = { v: 1; sig: string; list: Booking[]; next: number; settings?: Settings; audits?: Audit[]; waitlist?: Wait[] };

export const ME = "Md Yeapas";
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const dm = (iso: string) => `${iso.slice(8, 10)} ${MON[Number(iso.slice(5, 7)) - 1]}`;
export const dmy = (iso: string) => `${dm(iso)} ${iso.slice(0, 4)}`;
export const dow = (iso: string) => DOW[new Date(`${iso}T00:00:00Z`).getUTCDay()];
export const nightsBetween = (a: string, b: string) => Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 864e5));
export const tk = (n: number) => `৳${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
const nowHm = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
export const stamp = () => `${TODAY}T${nowHm()}`;
export const timeOf = (at: string) => { const [H, M] = at.slice(11, 16).split(":").map(Number); return `${H % 12 || 12}:${String(M).padStart(2, "0")} ${H >= 12 ? "PM" : "AM"}`; };

// ---------- money ----------
/** Room bill: nights − discount, then service charge, then VAT on (room + service). */
export function bill(b: Pick<Booking, "nights" | "discount" | "tax"> & { mealPlan?: Booking["mealPlan"] }) {
  const rooms = b.nights.reduce((s, n) => s + n.base, 0) + (b.mealPlan?.perNight ?? 0) * b.nights.length;
  const base = Math.max(0, rooms - b.discount);
  const service = Math.round((base * b.tax.service) / 100);
  const vat = Math.round(((base + service) * b.tax.vat) / 100);
  return { rooms, discount: Math.min(b.discount, rooms), base, service, vat, total: base + service + vat };
}
export const preMealTotal = (m: PreMeal) => { const sub = m.price * m.qty; const sc = Math.round((sub * m.sc) / 100); return sub + sc + Math.round(((sub + sc) * m.vat) / 100); };
/** Meals pre-ordered and not yet sent to the kitchen (they are charged on the room bill). */
export const heldMeals = (b: Booking) => (b.preMeals ?? []).filter((m) => !m.sent);
export const paidOf = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);
/** What the guest owes for the room bill. Cancelled: only what was kept as a fee counts. */
export const chargesOf = (b: Pick<Booking, "charges">) => (b.charges ?? []).reduce((s, c) => s + c.amount, 0);
export const totalOf = (b: Booking) => (b.status === "Cancelled" || b.status === "No-show" ? b.cancel?.keep ?? 0 : bill(b).total + heldMeals(b).reduce((s, m) => s + preMealTotal(m), 0) + chargesOf(b));
/** Cancellation / no-show fee by the property's policy (share of the first night's price incl. VAT). */
export function policyFee(b: Booking, kind: "Cancelled" | "No-show", s: Settings, today = TODAY) {
  const first = bill({ ...b, nights: b.nights.slice(0, 1), discount: 0 }).total;
  if (kind === "No-show") return Math.round((first * s.noShowFeePct) / 100);
  const days = nightsBetween(today, b.from);
  return days >= s.freeCancelDays ? 0 : Math.round((first * s.cancelFeePct) / 100);
}
export const dueOf = (b: Booking) => Math.max(0, totalOf(b) - paidOf(b));
export type PayState = "Paid" | "Partly paid" | "Due" | "Refund due";
export const payState = (b: Booking): PayState => {
  const t = totalOf(b), p = paidOf(b);
  if (p > t) return "Refund due";
  return p >= t ? "Paid" : p > 0 ? "Partly paid" : "Due";
};
/** Nights this booking holds a room (cancelled / no-show hold nothing). */
export const holds = (b: Booking) => b.status === "Confirmed" || b.status === "Checked in";
export const overlaps = (b: { from: string; to: string }, from: string, to: string) => b.from < to && from < b.to;

/** Situations front desk must notice — separate from status. */
export function flags(b: Booking) {
  const f: string[] = [];
  if (b.status === "Confirmed" && b.from < TODAY) f.push("Not arrived");
  if (b.status === "Checked in" && b.to < TODAY) f.push("Checkout overdue");
  if (holds(b) && !b.unit) f.push("No room yet");
  return f;
}

// ---------- seed ----------
type RoomLite = { code: string; type: string; rate: number; category: string };
export function bookableUnits(st: RoomsState) {
  const live = st.units.filter((u) => u.status === "published");
  return live.length ? live : st.units.filter((u) => u.status !== "archived");
}
const lite = (st: RoomsState): RoomLite[] => {
  const cat = new Map(st.categories.map((c) => [c.id, c]));
  return bookableUnits(st).map((u) => ({ code: u.code, type: cat.get(u.category)?.name ?? "Room", rate: u.rate ?? cat.get(u.category)?.baseRate ?? 0, category: u.category }));
};
const sigOf = (slug: string, rooms: RoomLite[]) => `${slug}|${rooms.map((r) => `${r.code}:${r.category}:${r.rate}`).join(",")}`;
const PEOPLE: [number, number][] = [[2, 0], [2, 1], [1, 0], [2, 0], [3, 0], [2, 2]];
const METH: PayMethod[] = ["Cash", "bKash", "Card", "Cash", "Bank"];

function seed(slug: string, rooms: RoomLite[], cats: Category[]): State {
  const cat = new Map(cats.map((c) => [c.id, c]));
  const byCode = new Map(rooms.map((r) => [r.code, r]));
  const mk = (s: Omit<Stay, "payment" | "due" | "total"> & { pay: "Paid" | "Partly paid" | "Due" }, i: number, extra: Partial<Booking> = {}): Booking => {
    const r = byCode.get(s.room);
    const c = r ? cat.get(r.category) : undefined;
    const nights: Night[] = []; for (let d = s.from; d < s.to; d = addDays(d, 1)) nights.push({ date: d, base: r?.rate ?? 0 });
    // Every 4th booking came through an OTA (recorded source only).
    const ota = i % 4 === 3 ? OTAS[(i >> 2) % 3] : undefined;
    const b: Booking = {
      code: s.code, guestId: s.guestId, unit: s.room, categoryId: r?.category ?? "", type: s.type, from: s.from, to: s.to,
      adults: PEOPLE[i % PEOPLE.length][0], children: PEOPLE[i % PEOPLE.length][1], status: s.status,
      channel: ota ? "OTA" : (s.channel as Channel), ota, channelRef: ota ? `${ota.slice(0, 3).toUpperCase()}-${48210 + i * 37}` : s.channel === "Marketplace" ? `MKT-${9100 + i}` : undefined,
      nights, tax: c ? taxOf(c) : { service: 10, vat: 15 }, discount: 0, payments: [], note: "", created: addDays(s.from, -((i % 9) + 1)) + "T11:20",
      log: [{ at: addDays(s.from, -((i % 9) + 1)) + "T11:20", text: `Booked · ${ota ?? s.channel}`, by: ota || s.channel === "Website" || s.channel === "Marketplace" ? "Guest (online)" : ME }], demo: true, ...extra,
    };
    const t = bill(b).total;
    const amt = s.pay === "Paid" ? t : s.pay === "Partly paid" ? Math.round(t / 2) : 0;
    if (amt) b.payments.push({ id: `p${s.code}`, at: `${s.from}T${s.status === "Confirmed" ? "10:05" : "14:10"}`, amount: amt, method: METH[i % METH.length], by: ME });
    if (s.status !== "Confirmed") { b.checkedInAt = `${s.from}T14:${String(10 + (i % 40)).padStart(2, "0")}`; b.log.push({ at: b.checkedInAt, text: `Checked in · Room ${s.room}`, by: ME }); }
    if (s.status === "Checked out") { b.checkedOutAt = `${s.to}T11:${String(5 + (i % 50)).padStart(2, "0")}`; b.log.push({ at: b.checkedOutAt, text: "Checked out", by: ME }); }
    return b;
  };
  const stays = demoStays(slug, rooms.map(({ code, type, rate }) => ({ code, type, rate })));
  const list = stays.map((s, i) => mk({ ...s, pay: s.payment }, i));
  // Upcoming bookings so the calendar has a week ahead: guests with no stay yet, free rooms first, then after current stays end.
  const used = new Set(list.map((b) => b.guestId));
  const free = DEMO_GUESTS.filter((g) => !used.has(g.id));
  let k = 0;
  const h0 = hash(slug);
  const plan: [number, number, number][] = [[0, 1, 2], [1, 2, 3], [2, 3, 1], [3, 5, 2], [4, 6, 3], [5, 8, 2], [6, 10, 4], [7, 12, 2]];
  for (const [ri, start, len] of plan) {
    if (!rooms.length || k >= free.length) break;
    const r = rooms[(rooms.length - 1 - ((ri * 3 + h0) % rooms.length) + rooms.length) % rooms.length];
    let from = addDays(TODAY, start);
    const busy = (f: string, t: string) => list.some((b) => b.unit === r.code && holds(b) && overlaps(b, f, t));
    let tries = 0;
    while (busy(from, addDays(from, len)) && tries++ < 10) from = addDays(from, 1);
    if (busy(from, addDays(from, len))) continue;
    const g = free[k++];
    list.push(mk({ code: `BK-${2501 + k}`, guestId: g.id, room: r.code, type: r.type, from, to: addDays(from, len), nights: len, status: "Confirmed", channel: (["Website", "Phone", "Marketplace", "Walk-in", "Agent"] as const)[k % 5], pay: k % 3 === 0 ? "Due" : "Partly paid" }, k + 3, k % 3 === 1 ? { channel: "OTA", ota: OTAS[k % 4], channelRef: `${OTAS[k % 4].slice(0, 3).toUpperCase()}-${51800 + k * 13}` } : {}));
  }
  // One upcoming booking where front desk has not picked a room yet.
  // (a returning guest whose earlier stays are finished, if no new guest is left)
  const past = DEMO_GUESTS.find((g) => list.some((b) => b.guestId === g.id) && list.every((b) => b.guestId !== g.id || b.status === "Checked out"));
  const pick = k < free.length ? free[k++] : past;
  if (rooms.length && pick) {
    const r = rooms[h0 % rooms.length]; const g = pick; k++;
    const b = mk({ code: `BK-${2501 + k}`, guestId: g.id, room: r.code, type: r.type, from: addDays(TODAY, 4), to: addDays(TODAY, 6), nights: 2, status: "Confirmed", channel: "Website", pay: "Partly paid" }, k);
    b.unit = ""; b.note = "Asked for a sea-facing room if possible";
    list.push(b);
  }
  return { v: 1, sig: sigOf(slug, rooms), list, next: 2601 };
}

// ---------- store ----------
const KEY = (slug: string) => `bingi-bookings-v1-${slug}`;
const cache = new Map<string, { raw: string | null; sig: string; st: State }>();
const seeds = new Map<string, State>();
const listeners = new Set<() => void>();
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const EMPTY: State = { v: 1, sig: "", list: [], next: 2601 };

function read(slug: string, rooms: RoomLite[], cats: Category[]): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(slug)); } catch {}
  const sig = sigOf(slug, rooms);
  const hit = cache.get(slug);
  if (hit && hit.raw === raw && hit.sig === sig) return hit.st;
  if (!seeds.has(sig)) seeds.set(sig, seed(slug, rooms, cats));
  let st = seeds.get(sig)!;
  if (raw) try {
    const p = JSON.parse(raw) as State;
    if (p?.v === 1 && Array.isArray(p.list)) {
      if (p.sig === sig) st = p;
      else {
        // Rooms changed: demo bookings are rebuilt, bookings made here are kept (room cleared if it no longer exists).
        const codes = new Set(rooms.map((r) => r.code));
        const mine = p.list.filter((b) => !b.demo).map((b) => (codes.has(b.unit) ? b : { ...b, unit: "" }));
        st = { ...st, list: [...st.list, ...mine], next: Math.max(st.next, p.next) };
      }
    }
  } catch {}
  cache.set(slug, { raw, sig, st });
  return st;
}
function write(slug: string, st: State) {
  const raw = JSON.stringify(st);
  try { localStorage.setItem(KEY(slug), raw); } catch {}
  cache.set(slug, { raw, sig: st.sig, st });
  listeners.forEach((l) => l());
}

/** Map a booking to the shared Stay shape the other modules read. Cancelled and no-show bookings are left out. */
export const toStay = (b: Booking): Stay | null => (b.status === "Cancelled" || b.status === "No-show" ? null : {
  code: b.code, guestId: b.guestId, room: b.unit, type: b.type, from: b.from, to: b.to, nights: b.nights.length,
  status: b.status, payment: payState(b) === "Refund due" ? "Paid" : (payState(b) as Stay["payment"]), total: totalOf(b), due: dueOf(b), channel: channelLabel(b),
});

function useRaw(h: Hotel) {
  const { st: rooms } = useRooms(h);
  const rl = useMemo(() => lite(rooms), [rooms]);
  const st = useSyncExternalStore(sub, () => read(h.slug, rl, rooms.categories), () => EMPTY);
  return { st, rooms, rl };
}

/** Stays for other modules (same people, same rooms, same money as Bookings). */
export function useStays(h: Hotel): Stay[] {
  const { st } = useRaw(h);
  return useMemo(() => st.list.map(toStay).filter((x): x is Stay => !!x), [st.list]);
}

export type NewBooking = Omit<Booking, "code" | "status" | "payments" | "log" | "created" | "demo"> & { advance?: { amount: number; method: PayMethod } };
export type Result = { ok: true; codes: string[] } | { ok: false; error: string };

export function useBookings(h: Hotel) {
  const { st, rooms, rl } = useRaw(h);
  const ready = st.sig !== "" || !rl.length;
  const units = useMemo(() => bookableUnits(rooms), [rooms]);
  const cats = useMemo(() => new Map(rooms.categories.map((c) => [c.id, c])), [rooms.categories]);
  const now = () => read(h.slug, rl, rooms.categories);
  const save = (fn: (s: State) => void) => { const n = structuredClone(now()); fn(n); write(h.slug, n); return n; };
  const find = (s: State, code: string) => s.list.find((b) => b.code === code)!;
  const log = (b: Booking, text: string) => b.log.push({ at: stamp(), text, by: ME });

  /** Who holds this room on any of these nights (ignores `except`). */
  const clash = useCallback((unit: string, from: string, to: string, except?: string) =>
    now().list.find((b) => b.code !== except && b.unit === unit && holds(b) && overlaps(b, from, to)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const unitByCode = useMemo(() => new Map(units.map((u) => [u.code, u])), [units]);
  /** Rooms free for the dates (published, not out of order, no active booking). */
  const freeUnits = useCallback((from: string, to: string, except?: string) => units.filter((u) => !oooOn(u, from, to) && !clash(u.code, from, to, except)), [units, clash]);

  const create = useCallback((items: NewBooking[]): Result => {
    if (!items.length) return { ok: false, error: "Pick at least one room" };
    for (const it of items) {
      if (it.from >= it.to) return { ok: false, error: "Check-out must be after check-in" };
      if (it.unit) {
        const u = unitByCode.get(it.unit);
        if (!u) return { ok: false, error: `Room ${it.unit} is not bookable` };
        if (oooOn(u, it.from, it.to)) return { ok: false, error: `Room ${it.unit} is out of order (${u.ooo!.reason})` };
        const c = clash(it.unit, it.from, it.to);
        if (c) return { ok: false, error: `Room ${it.unit} was just booked (${c.code}) — pick another room` };
      }
    }
    const codes: string[] = [];
    save((s) => {
      const group = items.length > 1 ? `GRP-${s.next}` : undefined;
      for (const it of items) {
        const code = `BK-${s.next++}`; codes.push(code);
        const { advance, ...rest } = it;
        const b: Booking = { ...rest, code, group, status: "Confirmed", payments: [], created: stamp(), log: [{ at: stamp(), text: `Booked · ${channelLabel(it)}${it.channelRef ? ` (${it.channelRef})` : ""}${it.unit ? ` · Room ${it.unit}` : ""}`, by: ME }] };
        if (advance && advance.amount > 0 && it === items[0]) { b.payments.push({ id: `p${Date.now().toString(36)}`, at: stamp(), amount: advance.amount, method: advance.method, by: ME, note: "Advance" }); log(b, `Advance ${tk(advance.amount)} · ${advance.method}`); }
        s.list.push(b);
      }
    });
    return { ok: true, codes };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st, unitByCode, clash]);

  const pay = useCallback((code: string, amount: number, method: PayMethod, note?: string) => save((s) => {
    const b = find(s, code); b.payments.push({ id: `p${Date.now().toString(36)}${b.payments.length}`, at: stamp(), amount, method, by: ME, note });
    log(b, `${amount < 0 ? "Refund" : "Payment"} ${tk(Math.abs(amount))} · ${method}${note ? ` · ${note}` : ""}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [st]);

  const assign = useCallback((code: string, unit: string, reprice?: Night[]): string => {
    const b0 = find(now(), code);
    const u = unitByCode.get(unit);
    if (!u) return "Pick a room";
    const from = b0.status === "Checked in" ? (TODAY > b0.from ? TODAY : b0.from) : b0.from;
    if (oooOn(u, from, b0.to)) return `Room ${unit} is out of order`;
    const c = clash(unit, from, b0.to, code);
    if (c) return `Room ${unit} is taken by ${c.code} on these dates`;
    save((s) => {
      const b = find(s, code); const old = b.unit;
      b.unit = unit; b.categoryId = u.category; b.type = cats.get(u.category)?.name ?? b.type;
      if (reprice) b.nights = reprice;
      log(b, old ? `Moved from Room ${old} to Room ${unit}${reprice ? " · new price" : ""}` : `Room ${unit} assigned`);
    });
    return "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st, unitByCode, clash, cats]);

  const checkIn = useCallback((code: string): string => {
    const b = find(now(), code);
    if (b.status !== "Confirmed") return "Only confirmed bookings can be checked in";
    if (b.from > TODAY) return `Check-in date is ${dmy(b.from)} — change the dates to check in early`;
    if (!b.unit) return "Assign a room first";
    const u = unitByCode.get(b.unit);
    if (u && oooOn(u, TODAY, addDays(TODAY, 1))) return `Room ${b.unit} is out of order — move the guest to another room`;
    const inRoom = now().list.find((x) => x.code !== code && x.unit === b.unit && x.status === "Checked in");
    if (inRoom) return `Room ${b.unit} still has a guest (${inRoom.code}) — check them out or move this guest`;
    save((s) => { const x = find(s, code); x.status = "Checked in"; x.checkedInAt = stamp(); log(x, `Checked in · Room ${x.unit}`); });
    return "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st, unitByCode]);

  /** Early check-out can charge only the nights stayed. Balance can be left due (logged). */
  const checkOut = useCallback((code: string, opts: { shorten: boolean; leaveDue?: boolean; extras?: number }): string => {
    const b = find(now(), code);
    if (b.status !== "Checked in") return "Only guests in house can be checked out";
    const nights = opts.shorten && b.to > TODAY ? b.nights.filter((n) => n.date < TODAY) : b.nights;
    const kept = nights.length ? nights : b.nights.slice(0, 1);
    const due = Math.max(0, totalOf({ ...b, nights: kept }) + (opts.extras ?? 0) - paidOf(b));
    if (due > 0 && !opts.leaveDue) return `${tk(due)} is still due — take the payment first`;
    save((s) => {
      const x = find(s, code);
      if (opts.shorten && x.to > TODAY) { x.nights = kept; x.to = addDays(kept.at(-1)!.date, 1); log(x, `Early check-out · charged ${kept.length} night${kept.length > 1 ? "s" : ""}`); }
      x.status = "Checked out"; x.checkedOutAt = stamp(); log(x, due > 0 ? `Checked out with ${tk(due)} due` : "Checked out");
    });
    return "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st]);

  const undoCheckIn = useCallback((code: string) => save((s) => { const x = find(s, code); if (x.status === "Checked in") { x.status = "Confirmed"; x.checkedInAt = undefined; log(x, "Check-in undone"); } }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);

  /** Change dates. Nights already priced keep their price; new nights take today's price. */
  const setDates = useCallback((code: string, from: string, to: string, price: (date: string) => number): string => {
    const b = find(now(), code);
    if (from >= to) return "Check-out must be after check-in";
    if (b.status === "Checked in" && from !== b.from) return "Guest is in house — only the check-out date can change";
    if (b.status === "Checked in" && to <= TODAY) return "To end today, use Check out";
    if (b.unit) { const c = clash(b.unit, from, to, code); if (c) return `Room ${b.unit} is booked by ${c.code} from ${dm(c.from)} — move the guest or pick other dates`; }
    save((s) => {
      const x = find(s, code); const old = new Map(x.nights.map((n) => [n.date, n.base]));
      const n: Night[] = []; for (let d = from; d < to; d = addDays(d, 1)) n.push({ date: d, base: old.get(d) ?? price(d) });
      const was = `${dm(x.from)}–${dm(x.to)}`;
      x.from = from; x.to = to; x.nights = n;
      log(x, `Dates changed ${was} → ${dm(from)}–${dm(to)}`);
    });
    return "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st, clash]);

  const precheckIn = useCallback((code: string, p: { eta?: string; idType?: string; idNo?: string; note?: string }) => save((s) => {
    const x = find(s, code); x.precheck = { at: stamp(), idType: p.idType, idNo: p.idNo, note: p.note };
    if (p.eta) x.eta = p.eta;
    log(x, `Guest pre-checked in online${p.eta ? ` · arriving ${p.eta}` : ""}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [st]);
  /** Drag on the calendar: new room and/or new dates in one step. Booked nights keep their price; new nights take `price`. */
  const moveStay = useCallback((code: string, unit: string, from: string, to: string, price: (date: string) => number): string => {
    const b = find(now(), code);
    if (b.status !== "Confirmed" && b.status !== "Checked in") return "Only upcoming or in-house bookings can move";
    if (from >= to) return "Check-out must be after check-in";
    if (b.status === "Checked in" && from !== b.from) return "Guest is in house — only the room or the check-out date can change";
    if (b.status === "Checked in" && to <= TODAY) return "To end today, use Check out";
    if (b.status === "Confirmed" && from < TODAY) return "Check-in can't be in the past";
    const u = unitByCode.get(unit);
    if (!u) return "Pick a room";
    if (oooOn(u, from, to)) return `Room ${unit} is out of order (${u.ooo!.reason})`;
    const c = clash(unit, b.status === "Checked in" && TODAY > from ? TODAY : from, to, code);
    if (c) return `Room ${unit} is taken by ${c.code} on these dates`;
    save((s) => {
      const x = find(s, code); const old = new Map(x.nights.map((n) => [n.date, n.base]));
      const n: Night[] = []; for (let d = from; d < to; d = addDays(d, 1)) n.push({ date: d, base: old.get(d) ?? price(d) });
      const parts: string[] = [];
      if (x.unit !== unit) parts.push(x.unit ? `Room ${x.unit} → ${unit}` : `Room ${unit} assigned`);
      if (x.from !== from || x.to !== to) parts.push(`${dm(x.from)}–${dm(x.to)} → ${dm(from)}–${dm(to)}`);
      x.unit = unit; x.categoryId = u.category; x.type = cats.get(u.category)?.name ?? x.type; x.from = from; x.to = to; x.nights = n;
      log(x, `Moved on calendar · ${parts.join(" · ")}`);
    });
    return "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st, clash, unitByCode, cats]);

  const update = useCallback((code: string, patch: Partial<Pick<Booking, "adults" | "children" | "note" | "channel" | "discount" | "purpose" | "comingFrom" | "goingTo" | "eta" | "companions" | "booker" | "payer">>, text = "Details updated") => save((s) => { Object.assign(find(s, code), patch); log(find(s, code), text); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);

  /** Cancel or no-show. `keep` = how much of what was paid stays as a fee; the rest shows as refund due. */
  const cancel = useCallback((code: string, kind: "Cancelled" | "No-show", reason: string, keep: number) => save((s) => {
    const x = find(s, code); x.status = kind; x.cancel = { reason, at: stamp(), keep: Math.max(0, keep) };
    log(x, `${kind === "No-show" ? "Marked no-show" : "Cancelled"}${reason ? ` · ${reason}` : ""}${keep ? ` · keeps ${tk(keep)}` : ""}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [st]);

  const addMeals = useCallback((code: string, meals: PreMeal[]) => save((s) => { const x = find(s, code); x.preMeals = [...(x.preMeals ?? []), ...meals]; log(x, `Meals added · ${meals.map((m) => `${m.qty}× ${m.name}`).join(", ")}`); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const removeMeal = useCallback((code: string, id: string) => save((s) => { const x = find(s, code); const m = x.preMeals?.find((y) => y.id === id); x.preMeals = (x.preMeals ?? []).filter((y) => y.id !== id); if (m) log(x, `Meal removed · ${m.qty}× ${m.name}`); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const mealSent = useCallback((code: string, id: string, orderNo: string) => save((s) => { const x = find(s, code); const m = x.preMeals?.find((y) => y.id === id); if (m) { m.sent = orderNo; log(x, `${m.qty}× ${m.name} sent to kitchen · ${orderNo}`); } }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const setSource = useCallback((code: string, channel: Channel, ota?: string, ref?: string) => save((s) => { const x = find(s, code); x.channel = channel; x.ota = channel === "OTA" ? ota : undefined; x.channelRef = ref || undefined; log(x, `Source set to ${channel === "OTA" ? ota : channel}${ref ? ` · ${ref}` : ""}`); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const addCharge = useCallback((code: string, label: string, amount: number) => save((s) => { const x = find(s, code); (x.charges ??= []).push({ id: `c${Date.now().toString(36)}`, label, amount, at: stamp() }); log(x, `Charge added · ${label} ${tk(amount)}`); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const removeCharge = useCallback((code: string, id: string) => save((s) => { const x = find(s, code); const c = x.charges?.find((y) => y.id === id); x.charges = (x.charges ?? []).filter((y) => y.id !== id); if (c) log(x, `Charge removed · ${c.label}`); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const takeDeposit = useCallback((code: string, amount: number, method: PayMethod) => save((s) => { const x = find(s, code); x.deposit = { amount, method, at: stamp() }; log(x, `Security deposit ${tk(amount)} · ${method}`); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  /** Settle the deposit: `used` goes to the bill as a payment, the rest is returned. */
  const settleDeposit = useCallback((code: string, used: number) => save((s) => {
    const x = find(s, code); const d = x.deposit; if (!d || d.settled) return;
    const u = Math.max(0, Math.min(used, d.amount));
    d.settled = { returned: d.amount - u, used: u, at: stamp() };
    if (u > 0) x.payments.push({ id: `p${Date.now().toString(36)}d`, at: stamp(), amount: u, method: d.method, by: ME, note: "From deposit" });
    log(x, `Deposit settled · ${u ? `${tk(u)} used for the bill` : ""}${u && d.amount - u ? " · " : ""}${d.amount - u ? `${tk(d.amount - u)} returned` : ""}`);
  }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const setMealPlan = useCallback((code: string, plan: Booking["mealPlan"]) => save((s) => { const x = find(s, code); x.mealPlan = plan; log(x, plan ? `Meal plan · ${plan.name} (${tk(plan.perNight)}/night)` : "Meal plan removed"); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const settings = st.settings ?? defaultSettings(h);
  const saveSettings = useCallback((n: Settings) => save((s) => { s.settings = n; }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const closeDay = useCallback((a: Omit<Audit, "at" | "by">) => save((s) => { (s.audits ??= []).unshift({ ...a, at: stamp(), by: ME }); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const addWait = useCallback((w: Omit<Wait, "id" | "at">) => save((s) => { (s.waitlist ??= []).unshift({ ...w, id: `w${Date.now().toString(36)}`, at: stamp() }); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const closeWait = useCallback((id: string, how: string) => save((s) => { const w = s.waitlist?.find((x) => x.id === id); if (w) w.done = how; }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st]);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); }, [h.slug]);

  return { list: st.list, ready, units, cats, unitByCode, clash, freeUnits, create, pay, assign, checkIn, checkOut, undoCheckIn, setDates, moveStay, precheckIn, update, cancel, addMeals, removeMeal, mealSent, setSource, addCharge, removeCharge, takeDeposit, settleDeposit, setMealPlan, settings, saveSettings, audits: st.audits ?? [], closeDay, waitlist: st.waitlist ?? [], addWait, closeWait, reset };
}
export type Bk = ReturnType<typeof useBookings>;
export type { Unit };
