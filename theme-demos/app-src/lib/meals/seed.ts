// Restaurant & Bar (Meals) — types, demo menu/tables/orders and bill maths. Pure: no React, no storage,
// so the Cashbox seed can use the same cash orders (one story across modules).
// Follows the live HMS Meal Management: Overview, Orders, POS, Counter (approval), Kitchen, Menu, Tables & QR, Reports, Settings.
import type { Hotel } from "@/lib/types";
import { TODAY } from "@/lib/rooms/store";

export type Service = "dinein" | "room" | "takeaway" | "delivery";
export type Source = "pos" | "table_qr" | "room_qr" | "general_qr";
export type Status = "approval" | "queued" | "preparing" | "ready" | "served" | "declined" | "cancelled";
export type PayState = "unpaid" | "paid" | "room";
export type PayMethod = "cash" | "card" | "bkash" | "room" | "split";
export type Category = { id: string; name: string };
export type Size = { name: string; price: number };
/** sizes: e.g. Half / Full — when set, each size has its own price and `price` is the smallest. */
export type Item = { id: string; name: string; cat: string; price: number; prep: number; available: boolean; pos: boolean; qr: boolean; veg?: boolean; short?: string; photo?: string; sizes?: Size[] };
export type Place = { id: string; name: string; kind: "table" | "room" | "general"; seats?: number; note?: string; visible: boolean; accepting: boolean };
/** round: 1 = first order, 2+ = items added later to the same (running) order. */
export type Line = { item: string; name: string; price: number; qty: number; note?: string; size?: string; round?: number };
export type Discount = { kind: "percent" | "fixed"; value: number; reason: string };
export type Payment = { method: Exclude<PayMethod, "split">; amount: number };
export type Order = {
  id: string; no: string; outlet: string; at: string; source: Source; service: Service; place?: string; room?: string; guest?: string;
  lines: Line[]; sc: number; vat: number; status: Status; pay: PayState; method?: PayMethod; paidAt?: string; reason?: string; by: string;
  round?: number; discount?: Discount; payments?: Payment[];
};
export type Settings = { sc: number; vat: number; services: Record<Service, boolean>; qrApproval: boolean; posApproval: boolean; paused: boolean; opens: string; closes: string };

export const SERVICE_LABEL: Record<Service, string> = { dinein: "Dine-in", room: "Room service", takeaway: "Takeaway", delivery: "Delivery" };
export const SOURCE_LABEL: Record<Source, string> = { pos: "Staff POS", table_qr: "Table QR", room_qr: "Room QR", general_qr: "General QR" };
export const STATUS_LABEL: Record<Status, string> = { approval: "Needs approval", queued: "Queued", preparing: "Preparing", ready: "Ready", served: "Served", declined: "Declined", cancelled: "Cancelled" };
export const METHOD_LABEL: Record<PayMethod, string> = { cash: "Cash", card: "Card", bkash: "bKash", room: "Charged to room", split: "Split" };

/** Bill: subtotal + service charge, VAT on (subtotal + service charge) — same rule as rooms. */
export function bill(o: Pick<Order, "lines" | "sc" | "vat"> & { discount?: Discount }) {
  const sub = o.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const disc = !o.discount ? 0 : o.discount.kind === "percent" ? Math.round((sub * o.discount.value) / 100) : Math.min(o.discount.value, sub);
  const base = sub - disc;
  const sc = Math.round((base * o.sc) / 100);
  const vat = Math.round(((base + sc) * o.vat) / 100);
  return { sub, disc, sc, vat, total: base + sc + vat, count: o.lines.reduce((s, l) => s + l.qty, 0) };
}
export const tk = (n: number) => `৳${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
export const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/** The restaurant outlets this module sells for (restaurants, cafés, bars). Room service is a service type. */
export function outletsOf(h: Hotel) {
  const os = (h.outlets ?? []).filter((o) => o.kind !== "room-service");
  return os.length ? os.map((o) => o.name) : ["Restaurant"];
}
export const roomServiceOutlet = (h: Hotel) => (h.outlets ?? []).find((o) => o.kind === "room-service")?.name;

export const DEFAULT_SETTINGS: Settings = { sc: 10, vat: 15, services: { dinein: true, room: true, takeaway: true, delivery: false }, qrApproval: true, posApproval: false, paused: false, opens: "07:00", closes: "23:00" };

export function seedMenu(h: Hotel): { categories: Category[]; items: Item[] } {
  const categories: Category[] = [
    { id: "c-bf", name: "Breakfast" }, { id: "c-st", name: "Starters & salads" }, { id: "c-lo", name: "Bangladeshi" },
    { id: "c-in", name: "International" }, { id: "c-de", name: "Desserts" }, { id: "c-dr", name: "Drinks" },
  ];
  const catFor = (tags: string[]) => tags.includes("Dessert") ? "c-de" : tags.includes("Local") ? "c-lo" : tags.includes("Fresh") ? "c-st" : "c-in";
  const fromHotel: Item[] = (h.menu ?? []).map((m) => ({ id: m.id, name: m.name, cat: catFor(m.tags), price: m.price, prep: m.tags.includes("Dessert") ? 5 : m.tags.includes("Grill") ? 25 : 15, available: true, pos: true, qr: true, short: m.short, photo: m.photo, veg: m.tags.includes("Fresh") && !/salmon|chicken|beef/i.test(m.name) }));
  const extra: Item[] = [
    { id: "x1", name: "Paratha & egg bhaji", cat: "c-bf", price: 320, prep: 10, available: true, pos: true, qr: true, veg: true },
    { id: "x2", name: "Full English breakfast", cat: "c-bf", price: 780, prep: 15, available: true, pos: true, qr: true, photo: "/demo/tea-valley/breakfast.jpg" },
    { id: "x3", name: "Vegetable pakora", cat: "c-st", price: 380, prep: 10, available: true, pos: true, qr: true, veg: true },
    { id: "x4", name: "Beef kala bhuna", cat: "c-lo", price: 650, prep: 20, available: true, pos: true, qr: true, sizes: [{ name: "Half", price: 650 }, { name: "Full", price: 1050 }] },
    { id: "x5", name: "Prawn malai curry", cat: "c-lo", price: 800, prep: 20, available: true, pos: true, qr: true, sizes: [{ name: "Half", price: 800 }, { name: "Full", price: 1350 }] },
    { id: "x6", name: "Plain rice", cat: "c-lo", price: 150, prep: 5, available: true, pos: true, qr: true, veg: true},
    { id: "x7", name: "Club sandwich & fries", cat: "c-in", price: 720, prep: 15, available: true, pos: true, qr: true },
    { id: "x8", name: "Chicken pasta alfredo", cat: "c-in", price: 890, prep: 18, available: false, pos: true, qr: true },
    { id: "x9", name: "Mishti doi", cat: "c-de", price: 220, prep: 2, available: true, pos: true, qr: true, veg: true },
    { id: "x10", name: "Fresh lime soda", cat: "c-dr", price: 220, prep: 3, available: true, pos: true, qr: true, veg: true },
    { id: "x11", name: "Mango lassi", cat: "c-dr", price: 320, prep: 4, available: true, pos: true, qr: true, veg: true, sizes: [{ name: "Regular", price: 320 }, { name: "Large", price: 420 }] },
    { id: "x12", name: "Masala tea", cat: "c-dr", price: 160, prep: 4, available: true, pos: true, qr: true, veg: true, photo: "/demo/tea-valley/tea-cup.jpg" },
    { id: "x13", name: "Cappuccino", cat: "c-dr", price: 360, prep: 4, available: true, pos: true, qr: true, veg: true },
    { id: "x14", name: "Mineral water (1 L)", cat: "c-dr", price: 120, prep: 1, available: true, pos: true, qr: false, veg: true },
  ];
  return { categories, items: [...fromHotel, ...extra] };
}

export function seedPlaces(roomCodes: string[]): Place[] {
  const t: Place[] = Array.from({ length: 8 }, (_, i) => ({ id: `t${i + 1}`, name: `T${i + 1}`, kind: "table", seats: i < 2 ? 2 : i < 6 ? 4 : 6, note: i >= 6 ? "Beach side" : undefined, visible: true, accepting: i !== 7 }));
  const r: Place[] = roomCodes.slice(0, 6).map((c) => ({ id: `r${c}`, name: `Room ${c}`, kind: "room", visible: true, accepting: true }));
  return [...t, ...r, { id: "g1", name: "Pool side", kind: "general", note: "Menu QR at the pool bar", visible: true, accepting: true }];
}

const hm = (min: number) => { const m = Math.max(1, Math.min(23 * 60 + 58, min)); return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
export const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

/** Orders: 6 past days (all served) + today. Amounts do not depend on rooms, so Cashbox can rebuild the same cash. */
export function seedOrders(h: Hotel, inHouse: { room: string; guest: string }[], clock = nowMin()): Order[] {
  const { items } = seedMenu(h);
  const live = items.filter((i) => i.available);
  const outlet = outletsOf(h)[0];
  const rso = roomServiceOutlet(h) ?? outlet;
  const pick = (k: number, n: number): Line[] => Array.from({ length: n }, (_, j) => { const it = live[(k * 7 + j * 5) % live.length]; const sz = it.sizes?.[it.sizes.length - 1]; return { item: it.id, name: sz ? `${it.name} (${sz.name})` : it.name, price: sz?.price ?? it.price, size: sz?.name, qty: 1 + ((k + j) % 2) }; });
  const room = (i: number) => inHouse[i % Math.max(1, inHouse.length)];
  const out: Order[] = [];
  let no = 5100;
  const mk = (o: Omit<Order, "id" | "no" | "sc" | "vat" | "by"> & { by?: string }): Order => { const n = no++; return { id: `o${n}`, no: `RB-${n}`, sc: 10, vat: 15, by: "Tanvir (Restaurant)", ...o }; };
  const methods: PayMethod[] = ["cash", "card", "cash", "room", "bkash", "cash", "card"];
  const times = ["08:30", "09:45", "12:40", "13:20", "15:10", "20:15", "21:30"];
  for (let k = 6; k >= 1; k--) {
    const date = addDays(TODAY, -k);
    times.forEach((tm, i) => {
      const m = methods[i];
      const svc: Service = m === "room" ? "room" : i === 5 ? "takeaway" : "dinein";
      out.push(mk({ outlet: svc === "room" ? rso : outlet, at: `${date}T${tm}`, source: i === 1 ? "table_qr" : "pos", service: svc, place: svc === "dinein" ? `t${(i % 8) + 1}` : undefined, room: svc === "room" ? room(i)?.room ?? "104" : undefined, guest: svc === "room" ? room(i)?.guest : undefined, lines: pick(k * 10 + i, 2 + (i % 2)), status: "served", pay: m === "room" ? "room" : "paid", method: m, paidAt: `${date}T${tm}` }));
    });
  }
  // today — finished orders at fixed times, live kitchen orders relative to the clock
  const T = (tm: string) => `${TODAY}T${tm}`;
  out.push(
    mk({ outlet, at: T("08:40"), source: "pos", service: "dinein", place: "t2", lines: pick(91, 2), status: "served", pay: "paid", method: "cash", paidAt: T("09:10") }),
    mk({ outlet: rso, at: T("10:05"), source: "room_qr", service: "room", room: room(3)?.room ?? "104", guest: room(3)?.guest, lines: pick(92, 2), status: "served", pay: "paid", method: "cash", paidAt: T("10:40") }),
    mk({ outlet, at: T("11:00"), source: "table_qr", service: "dinein", place: "t5", lines: pick(93, 1), status: "cancelled", pay: "unpaid", reason: "Guest left before ordering" }),
    mk({ outlet, at: T("12:15"), source: "pos", service: "dinein", place: "t4", lines: pick(94, 3), status: "served", pay: "paid", method: "card", paidAt: T("12:55") }),
    mk({ outlet: rso, at: T("12:30"), source: "room_qr", service: "room", room: room(1)?.room ?? "102", guest: room(1)?.guest, lines: pick(95, 2), status: "served", pay: "room", method: "room", paidAt: T("13:00") }),
    mk({ outlet, at: T("13:05"), source: "pos", service: "dinein", place: "t3", lines: pick(96, 3), status: "served", pay: "unpaid" }),
    mk({ outlet, at: T(hm(clock - 26)), source: "pos", service: "takeaway", guest: "Walk-in", lines: pick(97, 2), status: "ready", pay: "unpaid" }),
    mk({ outlet, at: T(hm(clock - 14)), source: "table_qr", service: "dinein", place: "t6", lines: pick(98, 3), status: "preparing", pay: "unpaid" }),
    mk({ outlet: rso, at: T(hm(clock - 9)), source: "room_qr", service: "room", room: room(2)?.room ?? "103", guest: room(2)?.guest, lines: pick(99, 2), status: "preparing", pay: "unpaid" }),
    mk({ outlet, at: T(hm(clock - 5)), source: "pos", service: "dinein", place: "t1", lines: pick(100, 2), status: "queued", pay: "unpaid" }),
    mk({ outlet, at: T(hm(clock - 1)), source: "table_qr", service: "dinein", place: "t7", lines: pick(101, 2), status: "approval", pay: "unpaid" }),
  );
  return out;
}

/** Cash taken by restaurant orders per day — the Cashbox seed posts exactly these. */
export function seedCash(h: Hotel) {
  return seedOrders(h, [], 12 * 60).filter((o) => o.method === "cash").map((o) => ({ day: (o.paidAt ?? o.at).slice(0, 10), at: o.paidAt ?? o.at, ref: o.no, amount: bill(o).total, source: o.service === "room" ? "roomservice" as const : o.service === "takeaway" ? "takeaway" as const : "dinein" as const, outlet: o.outlet }));
}
