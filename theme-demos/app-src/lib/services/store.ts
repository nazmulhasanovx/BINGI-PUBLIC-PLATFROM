"use client";
import { can } from "@/lib/plan";
// Other Services — v1 = Nazmul's 16 desktop screens (10 Nov 2026): catalog, orders (charge to booking / cash sale), categories.
// v2 (11 Nov 2026) adds what a large hotel or resort needs to RUN services, not just charge them:
//   work status (requested → confirmed → assigned → in progress → done) · assignment to staff (HRM) and resources
//   (cars, spa rooms…) · time slots with capacity (no double booking) · units, variants, child price · service charge
//   + VAT · guest requests (Guest App / QR / website) · outside vendors with cost · inventory used per service ·
//   reports · roles (front desk / department / manager) · refunds on cancel.
// Payment status stays separate from work status and from where the charge goes.
// Production: services(+variants, consumes), resources, vendors, service_orders(+log), refunds, settings.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY } from "@/lib/rooms/store";
import { useStays } from "@/lib/bookings/store";
import { useGuestNames } from "@/lib/guests/store";
import type { Dept } from "@/lib/hrm/store";

export type SvcCategory = { id: string; name: string; slug: string };
export type Unit = "each" | "person" | "trip" | "night" | "hour" | "piece";
export type ResType = "car" | "spa" | "guide" | "venue" | "other";
export type Variant = { id: string; name: string; price: number };
export type Service = {
  id: string; name: string; category: string; duration: string; price: number; description: string; image?: string; archived?: boolean;
  unit?: Unit; variants?: Variant[]; childPrice?: number; dept?: Dept;
  /** Needs one resource of this type for `minutes` (capacity check). */
  resourceType?: ResType; minutes?: number;
  vendor?: string; vendorCost?: number; consumes?: { item: string; qty: number }[]; guestRequest?: boolean; noTax?: boolean;
};
export type Resource = { id: string; name: string; type: ResType; off?: boolean };
export type Vendor = { id: string; name: string; phone: string; note: string };
export type BookingRef = { code: string; guest: string; room: string; phone: string };
export type WorkStatus = "requested" | "confirmed" | "assigned" | "in_progress" | "done" | "declined";
export type Source = "staff" | "guest_app" | "qr" | "website";
export type Order = {
  id: string; service: string; qty: number; unitPrice: number; method: "booking" | "cash";
  booking?: BookingRef; walkIn?: { name: string; phone: string };
  when: "now" | { date: string; time: string }; payment: "Paid" | "Unpaid" | "Refunded"; cancelled?: { reason: string; at: string }; created: string;
  status?: WorkStatus; source?: Source; variant?: string; children?: number; childPrice?: number; discount?: number; sc?: number; vat?: number;
  assignee?: string; resource?: string; minutes?: number; vendorCost?: number; log?: { at: string; text: string; by: string }[];
  refund?: { method: "Cash" | "Bank" | "bKash" | "Booking bill"; amount: number; at: string }; note?: string;
};
export type Role = "frontdesk" | "dept" | "manager";
export type Settings = { sc: number; vat: number; role: Role; discountLimit: number };
type State = { v: 2; photos?: 1; categories: SvcCategory[]; services: Service[]; orders: Order[]; cashboxOpen: boolean; next: number; resources: Resource[]; vendors: Vendor[]; settings: Settings };

export const SAMPLE_ART = "sample:shuttle";
/** Real demo photos for the seeded services (replaces the old sample artwork). */
const PHOTO: Record<string, string> = { s1: "/demo/azure-bay/exp-transfer.jpg", s2: "/demo/sea-pearl/transfer.jpg", s4: "/demo/sea-pearl/room-extra.jpg", s5: "/demo/azure-bay/exp-beach.jpg", s7: "/demo/azure-bay/exp-spa.jpg" };
export const UNIT_LABEL: Record<Unit, [string, string]> = { each: ["Quantity", "each"], person: ["Persons", "per person"], trip: ["Trips", "per trip"], night: ["Nights", "per night"], hour: ["Hours", "per hour"], piece: ["Pieces", "per piece"] };
export const RES_LABEL: Record<ResType, string> = { car: "Vehicle", spa: "Spa room", guide: "Guide", venue: "Venue / setup", other: "Other" };
export const STATUS_LABEL: Record<WorkStatus, string> = { requested: "New request", confirmed: "To assign", assigned: "Assigned", in_progress: "In progress", done: "Done", declined: "Declined" };
export const SOURCE_LABEL: Record<Source, string> = { staff: "Staff", guest_app: "Guest App", qr: "Room QR", website: "Website" };
export const ROLE_LABEL: Record<Role, string> = { frontdesk: "Front desk", dept: "Department staff", manager: "Manager" };
export const CAN = {
  create: (r: Role) => r !== "dept",
  assign: (r: Role) => r !== "dept",
  catalog: (r: Role) => r === "manager",
  refund: (r: Role) => r === "manager",
  settings: (r: Role) => r === "manager",
};
const cat = (id: string, name: string): SvcCategory => ({ id, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
const BASE: Service[] = [
  { id: "s1", name: "Airport Transfer", category: "t", duration: "45 min", price: 500, description: "Pick-up from the airport to the resort.", image: SAMPLE_ART, unit: "trip", dept: "Security", resourceType: "car", minutes: 60, variants: [{ id: "v1", name: "Sedan (3 guests)", price: 500 }, { id: "v2", name: "Microbus (8 guests)", price: 1200 }], guestRequest: true },
  { id: "s2", name: "City Drop-off", category: "t", duration: "30 min", price: 350, description: "Drop-off at any point in the city.", unit: "trip", dept: "Security", resourceType: "car", minutes: 45, guestRequest: true },
  { id: "s3", name: "Laundry Service", category: "g", duration: "24 hours", price: 150, description: "Wash and fold, priced per piece.", unit: "piece", dept: "Housekeeping", guestRequest: true, consumes: [{ item: "i8", qty: 0.05 }] },
  { id: "s4", name: "Extra Bed Setup", category: "g", duration: "On request", price: 1000, description: "Extra bed with fresh linen, per night.", unit: "night", dept: "Housekeeping", guestRequest: true, consumes: [{ item: "i2", qty: 1 }] },
  { id: "s5", name: "Guided Beach Walk", category: "e", duration: "60 min", price: 1200, description: "Morning walk with a local guide.", unit: "person", childPrice: 600, dept: "Front Office", resourceType: "guide", minutes: 60, vendor: "vd1", vendorCost: 600, guestRequest: true },
  { id: "s6", name: "Sunset Picnic Setup", category: "e", duration: "90 min", price: 1800, description: "Picnic setup on the beach at sunset.", archived: true, unit: "each", dept: "Kitchen", resourceType: "venue", minutes: 90 },
  { id: "s7", name: "Spa Massage", category: "w", duration: "60 min", price: 4500, description: "Full-body massage in our spa.", unit: "person", dept: "Front Office", resourceType: "spa", minutes: 60, variants: [{ id: "v1", name: "60 min", price: 4500 }, { id: "v2", name: "90 min", price: 6000 }], guestRequest: true },
];

const SERVICES: Service[] = BASE.map((x) => (PHOTO[x.id] ? { ...x, image: PHOTO[x.id] } : x));

function seed(bookings: BookingRef[]): State {
  const b = (i: number) => bookings[i % Math.max(1, bookings.length)];
  const L = (at: string, text: string, by = "Md Yeapas") => ({ at, text, by });
  return {
    v: 2, photos: 1, cashboxOpen: true, next: 1047,
    categories: [cat("t", "Transport"), cat("g", "Guest Services"), cat("e", "Experiences"), cat("w", "Wellness")],
    services: SERVICES,
    resources: [{ id: "r1", name: "Car 1 · Sedan", type: "car" }, { id: "r2", name: "Car 2 · Microbus", type: "car" }, { id: "r3", name: "Spa Room 1", type: "spa" }, { id: "r4", name: "Spa Room 2", type: "spa" }, { id: "r5", name: "Beach Guide", type: "guide" }, { id: "r6", name: "Picnic Kit", type: "venue" }],
    vendors: [{ id: "vd1", name: "Inani Local Tours", phone: "01815-332211", note: "Guides for walks and island trips" }],
    settings: { sc: 10, vat: 15, role: "frontdesk", discountLimit: 10 },
    orders: bookings.length ? [
      { id: "OSO-1046", service: "s7", variant: "v1", qty: 1, unitPrice: 4500, sc: 450, vat: 743, method: "booking", booking: b(1), when: { date: TODAY, time: "18:00" }, minutes: 60, payment: "Unpaid", status: "requested", source: "guest_app", created: `${TODAY}T16:05`, log: [L(`${TODAY}T16:05`, "Requested from Guest App", b(1).guest)] },
      { id: "OSO-1045", service: "s3", qty: 6, unitPrice: 150, sc: 90, vat: 149, method: "booking", booking: b(2), when: "now", payment: "Unpaid", status: "requested", source: "qr", created: `${TODAY}T15:48`, log: [L(`${TODAY}T15:48`, "Requested from room QR", b(2).guest)] },
      { id: "OSO-1044", service: "s1", variant: "v2", qty: 1, unitPrice: 1200, sc: 120, vat: 198, method: "booking", booking: b(3), when: { date: TODAY, time: "17:00" }, minutes: 60, resource: "r2", payment: "Unpaid", status: "confirmed", source: "staff", created: `${TODAY}T14:10`, log: [L(`${TODAY}T14:10`, "Order created")] },
      { id: "OSO-1043", service: "s5", qty: 2, children: 1, childPrice: 600, unitPrice: 1200, sc: 300, vat: 495, vendorCost: 1800, method: "booking", booking: b(1), when: { date: TODAY, time: "16:30" }, minutes: 60, resource: "r5", assignee: "EMP013", payment: "Unpaid", status: "assigned", source: "staff", created: "2026-11-09T18:40", log: [L("2026-11-09T18:40", "Order created"), L(`${TODAY}T09:00`, "Assigned")] },
      { id: "OSO-1042", service: "s1", variant: "v1", qty: 2, unitPrice: 500, method: "booking", booking: b(0), when: "now", payment: "Unpaid", status: "in_progress", source: "staff", resource: "r1", minutes: 60, created: `${TODAY}T15:20`, log: [L(`${TODAY}T15:20`, "Order created"), L(`${TODAY}T15:25`, "Started")] },
      { id: "OSO-1041", service: "s1", variant: "v1", qty: 1, unitPrice: 500, method: "booking", booking: b(0), when: "now", payment: "Unpaid", status: "done", source: "staff", resource: "r1", minutes: 60, created: `${TODAY}T11:05`, log: [L(`${TODAY}T11:05`, "Order created"), L(`${TODAY}T12:10`, "Done")] },
      { id: "OSO-1040", service: "s3", qty: 2, unitPrice: 150, method: "cash", walkIn: { name: "Walk-in Guest", phone: "" }, when: "now", payment: "Paid", status: "done", source: "staff", created: `${TODAY}T10:12`, log: [L(`${TODAY}T10:12`, "Cash sale"), L(`${TODAY}T10:12`, "Done")] },
      { id: "OSO-1038", service: "s6", qty: 1, unitPrice: 1800, method: "booking", booking: b(2), when: { date: "2026-11-09", time: "17:00" }, payment: "Paid", status: "done", source: "staff", created: "2026-11-08T12:00", log: [L("2026-11-08T12:00", "Order created")] },
    ] : [],
  };
}

/** v1 (no work status) → v2: services get units/departments, past orders become Done, future ones To assign. */
function migrate(p: { categories: SvcCategory[]; services: Service[]; orders: Order[]; cashboxOpen: boolean; next: number }, bookings: BookingRef[]): State {
  const base = seed(bookings);
  const known = new Map(SERVICES.map((s) => [s.id, s]));
  return {
    ...base, categories: p.categories, cashboxOpen: p.cashboxOpen, next: p.next,
    services: p.services.map((s) => ({ ...known.get(s.id), ...s, unit: s.unit ?? known.get(s.id)?.unit ?? "each" })),
    orders: p.orders.map((o) => ({ ...o, source: "staff", status: o.status ?? (o.when !== "now" && o.when.date >= TODAY ? "confirmed" : "done"), log: [{ at: o.created, text: "Order created", by: "Md Yeapas" }] })),
  };
}

const KEY = (slug: string) => `bingi-services-v2-${slug}`;
const OLD = (slug: string) => `bingi-services-v1-${slug}`;
const cache = new Map<string, { raw: string | null; st: State }>();
const listeners = new Set<() => void>();
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
function read(slug: string, bookings: BookingRef[]): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(slug)); } catch {}
  const hit = cache.get(slug);
  if (hit && hit.raw === raw && (raw || hit.st.orders.length || !bookings.length)) return hit.st;
  let st = seed(bookings);
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 2 && Array.isArray(p.services)) st = p.photos ? p : { ...p, photos: 1, services: p.services.map((x: Service) => (PHOTO[x.id] && (!x.image || x.image === SAMPLE_ART) ? { ...x, image: PHOTO[x.id] } : x)) }; } catch {}
  else try { const o = JSON.parse(localStorage.getItem(OLD(slug)) ?? "null"); if (o?.v === 1 && Array.isArray(o.services)) st = migrate(o, bookings); } catch {}
  cache.set(slug, { raw, st });
  return st;
}
function write(slug: string, st: State) {
  const raw = JSON.stringify(st);
  try { localStorage.setItem(KEY(slug), raw); } catch {}
  cache.set(slug, { raw, st });
  listeners.forEach((l) => l());
}

/** Before charges: quantity × unit price + children × child price − discount. */
export const orderSub = (o: Order) => o.qty * o.unitPrice + (o.children ?? 0) * (o.childPrice ?? 0) - (o.discount ?? 0);
/** What the guest pays: subtotal + service charge + VAT (amounts are fixed when the order is saved). */
export const orderTotal = (o: Order) => orderSub(o) + (o.sc ?? 0) + (o.vat ?? 0);
export const tk = (n: number) => `৳${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const dayLabel = (iso: string) => `${iso.slice(8, 10)} ${MON[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
export const t12 = (hm: string) => { const [H, M] = hm.split(":").map(Number); return `${String(H % 12 || 12).padStart(2, "0")}:${String(M).padStart(2, "0")} ${H >= 12 ? "PM" : "AM"}`; };
export const whenLabel = (o: Order) => (o.when === "now" ? "Immediate" : `${dayLabel(o.when.date)} · ${t12(o.when.time)}`);
export const statusOf = (o: Order): WorkStatus | "cancelled" => (o.cancelled ? "cancelled" : o.status ?? "done");
const toMin = (hm: string) => { const [H, M] = hm.split(":").map(Number); return H * 60 + M; };
const toHm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const nowHm = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
/** Start of an order as date + minutes (immediate orders start at their created time). */
export const slotOf = (o: Order) => o.when === "now" ? { date: o.created.slice(0, 10), start: toMin(o.created.slice(11, 16)) } : { date: o.when.date, start: toMin(o.when.time) };
/** Charges for a subtotal with the property's service charge + VAT. */
export const charges = (sub: number, s: Settings, noTax?: boolean) => { if (noTax) return { sc: 0, vat: 0 }; const sc = Math.round((sub * s.sc) / 100); return { sc, vat: Math.round(((sub + sc) * s.vat) / 100) }; };
export const hasServices = (h: Hotel) => can(h, "services");
const addLog = (s: State, o: Order, text: string, by = ROLE_LABEL[s.settings.role]) => { (o.log ??= []).push({ at: `${TODAY}T${nowHm()}`, text, by }); };

export function useServices(h: Hotel) {
  const stays = useStays(h);
  const names = useGuestNames(h);
  const bookings: BookingRef[] = useMemo(() => {
    return stays
      .filter((s) => s.status === "Checked in" || (s.status === "Confirmed" && s.from >= TODAY))
      .map((s) => ({ code: s.code, guest: names.get(s.guestId)?.name ?? "Guest", room: s.room, phone: names.get(s.guestId)?.phone ?? "" }));
  }, [stays, names]);
  const st = useSyncExternalStore(sub, () => read(h.slug, bookings), () => seed([]));
  const update = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h.slug, bookings)); fn(n); write(h.slug, n); }, [h.slug, bookings]);

  /**
   * Resources of a type that are free for [start, start+minutes) on a date. Busy = any live order on that resource
   * overlapping the window (cancelled / declined / done ones free it).
   */
  const freeAt = useCallback((type: ResType, date: string, start: number, minutes: number, except?: string) => {
    const s0 = read(h.slug, bookings);
    return s0.resources.filter((r) => r.type === type && !r.off && !s0.orders.some((o) => {
      if (o.id === except || o.resource !== r.id || o.cancelled || ["declined", "done"].includes(o.status ?? "")) return false;
      const sl = slotOf(o); if (sl.date !== date) return false;
      const end = sl.start + (o.minutes ?? 60);
      return sl.start < start + minutes && start < end;
    }));
  }, [h.slug, bookings]);
  /** Next start time (15-min steps, up to 23:00) when a resource of this type is free. */
  const nextFree = useCallback((type: ResType, date: string, start: number, minutes: number, except?: string) => {
    for (let m = Math.ceil(start / 15) * 15; m + minutes <= 23 * 60; m += 15) if (freeAt(type, date, m, minutes, except).length) return toHm(m);
    return null;
  }, [freeAt]);

  const saveService = useCallback((x: Service) => update((s) => { const i = s.services.findIndex((y) => y.id === x.id); if (i >= 0) s.services[i] = x; else s.services.unshift(x); }), [update]);
  const setArchived = useCallback((id: string, v: boolean) => update((s) => { const x = s.services.find((y) => y.id === id); if (x) x.archived = v; }), [update]);
  const saveCategory = useCallback((c: SvcCategory) => update((s) => { const i = s.categories.findIndex((y) => y.id === c.id); if (i >= 0) s.categories[i] = c; else s.categories.push(c); }), [update]);

  /** Creates (no id) or edits an order; picks a free resource when the service needs one. Returns { id } or { error }. */
  const saveOrder = useCallback((o: Omit<Order, "id" | "created"> & { id?: string }): { id: string } | { error: string } => {
    const s0 = read(h.slug, bookings);
    const svc = s0.services.find((x) => x.id === o.service);
    let resource = o.resource;
    if (svc?.resourceType) {
      const date = o.when === "now" ? TODAY : o.when.date, start = toMin(o.when === "now" ? nowHm() : o.when.time), mins = svc.minutes ?? 60;
      const free = freeAt(svc.resourceType, date, start, mins, o.id);
      if (!resource || !free.some((r) => r.id === resource)) resource = free[0]?.id;
      if (!resource) { const nx = nextFree(svc.resourceType, date, start, mins, o.id); return { error: `No ${RES_LABEL[svc.resourceType].toLowerCase()} is free at ${t12(toHm(start))}.${nx ? ` Next free: ${t12(nx)}.` : " None free later today."}` }; }
    }
    let id = o.id ?? "";
    update((s) => {
      const extra = { resource, minutes: svc?.resourceType ? svc.minutes ?? 60 : undefined };
      if (o.id) { const i = s.orders.findIndex((y) => y.id === o.id); if (i >= 0) { s.orders[i] = { ...s.orders[i], ...o, ...extra, id: o.id }; addLog(s, s.orders[i], "Order edited"); } return; }
      id = `OSO-${s.next++}`;
      const n: Order = { ...o, ...extra, id, created: `${TODAY}T${nowHm()}`, status: o.status ?? "confirmed", source: o.source ?? "staff", log: [] };
      addLog(s, n, o.method === "cash" ? "Cash sale recorded" : "Order created");
      if (n.assignee) { n.status = "assigned"; addLog(s, n, "Assigned"); }
      s.orders.unshift(n);
    });
    return { id };
  }, [bookings, freeAt, h.slug, nextFree, update]);

  const accept = useCallback((id: string) => {
    const s0 = read(h.slug, bookings); const o = s0.orders.find((x) => x.id === id); const svc = s0.services.find((x) => x.id === o?.service);
    if (!o) return "Not found";
    let resource = o.resource;
    if (svc?.resourceType && !resource) {
      const sl = slotOf(o); const free = freeAt(svc.resourceType, sl.date, sl.start, svc.minutes ?? 60, id);
      if (!free.length) { const nx = nextFree(svc.resourceType, sl.date, sl.start, svc.minutes ?? 60, id); return `No ${RES_LABEL[svc.resourceType].toLowerCase()} free at that time.${nx ? ` Offer the guest ${t12(nx)}.` : ""}`; }
      resource = free[0].id;
    }
    update((s) => { const x = s.orders.find((y) => y.id === id)!; x.status = "confirmed"; x.resource = resource; x.minutes = svc?.resourceType ? svc.minutes ?? 60 : x.minutes; addLog(s, x, "Request accepted"); });
    return null;
  }, [bookings, freeAt, h.slug, nextFree, update]);
  const decline = useCallback((id: string, reason: string) => update((s) => { const x = s.orders.find((y) => y.id === id)!; x.status = "declined"; x.note = reason; addLog(s, x, `Declined · ${reason}`); }), [update]);
  /** Booking checked out and paid at the front desk: its unpaid service orders become Paid. */
  const settleBooking = useCallback((code: string) => update((s) => { for (const o of s.orders) if (!o.cancelled && o.method === "booking" && o.booking?.code === code && o.payment === "Unpaid") { o.payment = "Paid"; addLog(s, o, `Paid at check-out (${code})`); } }), [update]);
  const assign = useCallback((id: string, assignee: string, resource?: string) => update((s) => { const x = s.orders.find((y) => y.id === id)!; x.assignee = assignee || undefined; if (resource) x.resource = resource; if (x.status === "confirmed" || x.status === "assigned") x.status = assignee ? "assigned" : "confirmed"; addLog(s, x, assignee ? "Assigned" : "Unassigned"); }), [update]);
  const start = useCallback((id: string) => update((s) => { const x = s.orders.find((y) => y.id === id)!; x.status = "in_progress"; addLog(s, x, "Started"); }), [update]);
  /** Done: marks the work finished; returns the inventory lines to take out (caller records them in Inventory). */
  const complete = useCallback((id: string) => {
    const s0 = read(h.slug, bookings); const o = s0.orders.find((x) => x.id === id); const svc = s0.services.find((x) => x.id === o?.service);
    update((s) => { const x = s.orders.find((y) => y.id === id)!; x.status = "done"; addLog(s, x, "Done"); });
    return (svc?.consumes ?? []).map((c) => ({ item: c.item, qty: Math.round(c.qty * (o?.qty ?? 1) * 1000) / 1000 }));
  }, [bookings, h.slug, update]);
  const noteLog = useCallback((id: string, text: string) => update((s) => { const x = s.orders.find((y) => y.id === id); if (x) addLog(s, x, text, "Inventory"); }), [update]);
  /** Cancel. A paid order needs a refund method (manager only); an unpaid booking charge simply leaves the bill. */
  const cancelOrder = useCallback((id: string, reason: string, refund?: "Cash" | "Bank" | "bKash" | "Booking bill") => update((s) => {
    const o = s.orders.find((y) => y.id === id); if (!o) return;
    o.cancelled = { reason, at: new Date().toISOString() };
    if (o.payment === "Paid" && refund) { o.refund = { method: refund, amount: orderTotal(o), at: `${TODAY}T${nowHm()}` }; o.payment = "Refunded"; addLog(s, o, `Cancelled · refunded ${tk(orderTotal(o))} by ${refund}`); }
    else addLog(s, o, `Cancelled · ${reason}`);
  }), [update]);
  /** Prototype: a guest asks for a service from the Guest App / room QR. */
  const simulateRequest = useCallback(() => update((s) => {
    const b = bookings[Math.floor(Math.random() * Math.max(1, bookings.length))]; const svc = s.services.filter((x) => x.guestRequest && !x.archived)[s.next % 3] ?? s.services[0];
    if (!b) return;
    const v = svc.variants?.[0]; const price = v?.price ?? svc.price; const time = toHm(Math.min(22 * 60, Math.ceil((toMin(nowHm()) + 60) / 15) * 15));
    const ch = charges(price, s.settings, svc.noTax);
    const o: Order = { id: `OSO-${s.next++}`, service: svc.id, variant: v?.id, qty: 1, unitPrice: price, ...ch, method: "booking", booking: b, when: svc.resourceType ? { date: TODAY, time } : "now", minutes: svc.resourceType ? svc.minutes ?? 60 : undefined, payment: "Unpaid", status: "requested", source: s.next % 2 ? "guest_app" : "qr", created: `${TODAY}T${nowHm()}`, log: [] };
    addLog(s, o, `Requested from ${SOURCE_LABEL[o.source!]}`, b.guest);
    s.orders.unshift(o);
  }), [bookings, update]);

  const saveResource = useCallback((r: Resource) => update((s) => { const i = s.resources.findIndex((x) => x.id === r.id); if (i >= 0) s.resources[i] = r; else s.resources.push(r); }), [update]);
  const removeResource = useCallback((id: string) => update((s) => { s.resources = s.resources.filter((x) => x.id !== id); }), [update]);
  const saveVendor = useCallback((v: Vendor) => update((s) => { const i = s.vendors.findIndex((x) => x.id === v.id); if (i >= 0) s.vendors[i] = v; else s.vendors.push(v); }), [update]);
  const setSettings = useCallback((p: Partial<Settings>) => update((s) => { s.settings = { ...s.settings, ...p }; }), [update]);
  const setCashbox = useCallback((v: boolean) => update((s) => { s.cashboxOpen = v; }), [update]);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY(h.slug)); localStorage.removeItem(OLD(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); }, [h.slug]);
  return {
    st, bookings, role: st.settings.role, settleBooking, saveService, setArchived, saveCategory, saveOrder, accept, decline, assign, start, complete, noteLog, cancelOrder, simulateRequest,
    freeAt, nextFree, saveResource, removeResource, saveVendor, setSettings, setCashbox, reset, uid: (p: string) => `${p}${Date.now().toString(36)}`,
  };
}
