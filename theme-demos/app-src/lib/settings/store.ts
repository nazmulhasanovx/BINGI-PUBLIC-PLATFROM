"use client";
// HMS Settings — one record per property. Prototype: this browser (localStorage). Production: HMS settings API.
// One home per setting: booking times/fees/policy and message texts stay in the bookings store (Settings edits them there);
// VAT & service charge here are the hotel default every room type follows unless it has its own.
import { useCallback, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { HOTEL_TAX } from "@/lib/rooms/store";

export type PayKind = "cash" | "mfs" | "bank" | "gateway";
export type PayMethodRow = { id: string; name: string; kind: PayKind; account: string; enabled: boolean; atProperty: boolean; onWebsite: boolean; upcoming?: boolean };
export type Perm = "none" | "view" | "edit";
export const AREAS = ["Bookings", "Rooms & housekeeping", "Guests", "Restaurant", "Inventory", "Staff", "Money", "Reports", "Website", "Settings"] as const;
export type Area = (typeof AREAS)[number];
export type Role = { id: string; name: string; locked?: boolean; perms: Record<Area, Perm> };
/** Automatic messages (edited in Communication Center). New ids are merged into saved settings on read. */
export const DEFAULT_RULES: MsgRule[] = [
  { id: "confirm", group: "Booking", label: "Booking confirmed", when: "A booking is made or confirmed", to: "Guest", email: true, sms: true, whatsapp: false },
  { id: "pending", group: "Booking", label: "Booking request received", when: "A website request waits for the hotel", to: "Guest", email: true, sms: false, whatsapp: false },
  { id: "modified", group: "Booking", label: "Booking changed", when: "Dates or room change", to: "Guest", email: true, sms: false, whatsapp: false },
  { id: "cancel", group: "Booking", label: "Booking cancelled", when: "A booking is cancelled", to: "Guest", email: true, sms: true, whatsapp: false },
  { id: "prearrival", group: "Stay", label: "Day before arrival", when: "The day before check-in, with the online check-in link", to: "Guest", email: true, sms: false, whatsapp: false },
  { id: "roomready", group: "Stay", label: "Room ready", when: "Housekeeping marks the room ready", to: "Guest", email: false, sms: false, whatsapp: false },
  { id: "welcome", group: "Stay", label: "Welcome after check-in", when: "Guest is checked in", to: "Guest", email: false, sms: false, whatsapp: false },
  { id: "checkout", group: "Stay", label: "Thank you + review", when: "After check-out", to: "Guest", email: true, sms: false, whatsapp: false },
  { id: "payment", group: "Payments", label: "Payment received", when: "A payment is recorded on the booking", to: "Guest", email: true, sms: false, whatsapp: false },
  { id: "refund", group: "Payments", label: "Refund made", when: "A refund is recorded", to: "Guest", email: true, sms: false, whatsapp: false },
  { id: "order", group: "Restaurant & services", label: "Order received", when: "A QR / room-service order or service request is placed", to: "Guest", email: false, sms: false, whatsapp: false },
  { id: "service", group: "Restaurant & services", label: "Service confirmed", when: "An extra service is confirmed", to: "Guest", email: false, sms: false, whatsapp: false },
  { id: "newweb", group: "Team alerts", label: "New website request", when: "A guest books or asks on the website", to: "Staff", email: true, sms: false, whatsapp: false },
  { id: "newchat", group: "Team alerts", label: "New chat message", when: "A guest writes in Chat", to: "Staff", email: false, sms: false, whatsapp: false },
  { id: "lowstock", group: "Team alerts", label: "Low stock", when: "An item reaches its reorder level", to: "Staff", email: false, sms: false, whatsapp: false },
];
export type MsgRule = { id: string; label: string; to: "Guest" | "Staff"; email: boolean; sms: boolean; whatsapp: boolean; group?: string; when?: string };
export type Printer = { id: string; name: string; kind: "Receipt (80 mm)" | "Kitchen (KOT)" | "A4"; where: string };

export type Settings = {
  profile: { name: string; type: string; phone: string; email: string; address: string; city: string; postcode: string; tradeLicense: string; tin: string; bin: string; billingName: string; billingPhone: string; billingEmail: string };
  branding: { logo?: string; icon?: string; restaurantLogo?: string };
  regional: { tz: string; currency: string; dateFmt: "DD MMM YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"; timeFmt: "12" | "24"; lang: string; lang2: string };
  policy: { early: "request" | "none" | "charge" | "free"; late: "request" | "none" | "charge" | "free"; childFreeAge: number; childNote: string; extraBed: boolean; extraBedPrice: number; websitePay: "full" | "advance" | "hotel"; advancePct: number; reviewed: boolean };
  tax: { vat: number; service: number; minRate: number; discountBy: "Front desk" | "Manager" | "Owner"; discountLimit: number };
  hk: { dirtyOnCheckout: boolean; inspection: boolean; autoRelease: boolean; priority: "Low" | "Normal" | "High" };
  payments: PayMethodRow[];
  docs: { prefix: string; next: number; terms: string; footer: string; showLogo: boolean; paper: "A4" | "Thermal"; contract: { on: boolean; title: string; intro: string; rules: string; signBefore: "Check-in" | "Booking"; block: boolean } };
  printers: Printer[];
  messages: { rules: MsgRule[]; paymentNote: string; location: string; shortcuts: { id: string; title: string; text: string }[] };
  roles: Role[];
  userRoles: Record<string, string>;
  security: { twoStep: boolean; staffTwoStep: boolean; timeout: number };
  log: { at: string; by: string; text: string }[];
};

/** Bangladesh hotel default before the owner sets their own (HOTEL_TAX itself changes per property). */
const DEFAULT_TAX = { vat: 15, service: 10 };
const all = (p: Perm) => Object.fromEntries(AREAS.map((a) => [a, p])) as Record<Area, Perm>;
const perms = (edit: Area[], view: Area[] = []) => Object.fromEntries(AREAS.map((a) => [a, edit.includes(a) ? "edit" : view.includes(a) ? "view" : "none"])) as Record<Area, Perm>;
export const DEFAULT_ROLES: Role[] = [
  { id: "owner", name: "Owner", locked: true, perms: all("edit") },
  { id: "manager", name: "Manager", perms: { ...all("edit"), Settings: "view" } },
  { id: "front", name: "Front office", perms: perms(["Bookings", "Guests"], ["Rooms & housekeeping", "Restaurant", "Money"]) },
  { id: "accountant", name: "Accountant", perms: perms(["Money", "Reports"], ["Bookings", "Inventory", "Staff"]) },
  { id: "hk", name: "Housekeeping", perms: perms(["Rooms & housekeeping"], ["Bookings"]) },
  { id: "fnb", name: "Restaurant", perms: perms(["Restaurant"], ["Inventory", "Guests"]) },
];

const seed = (h: Hotel): Settings => ({
  profile: { name: h.name, type: String(h.propertyType ?? "hotel"), phone: h.phone ?? "", email: h.email ?? "", address: h.address ?? "", city: h.city ?? "", postcode: "", tradeLicense: "", tin: "", bin: "", billingName: "", billingPhone: "", billingEmail: "" },
  branding: {},
  regional: { tz: "Asia/Dhaka (GMT+6)", currency: "BDT · Bangladeshi Taka", dateFmt: "DD MMM YYYY", timeFmt: "12", lang: "English", lang2: "Bangla" },
  policy: { early: "request", late: "request", childFreeAge: 5, childNote: "", extraBed: true, extraBedPrice: 1500, websitePay: "advance", advancePct: 30, reviewed: false },
  tax: { vat: DEFAULT_TAX.vat, service: DEFAULT_TAX.service, minRate: 0, discountBy: "Manager", discountLimit: 10 },
  hk: { dirtyOnCheckout: true, inspection: false, autoRelease: true, priority: "Normal" },
  payments: [
    { id: "cash", name: "Cash", kind: "cash", account: "Cashbox", enabled: true, atProperty: true, onWebsite: false },
    { id: "bkash", name: "bKash", kind: "mfs", account: "", enabled: true, atProperty: true, onWebsite: true },
    { id: "nagad", name: "Nagad", kind: "mfs", account: "", enabled: false, atProperty: true, onWebsite: false },
    { id: "card", name: "Card (POS machine)", kind: "bank", account: "", enabled: true, atProperty: true, onWebsite: false },
    { id: "bank", name: "Bank transfer", kind: "bank", account: "", enabled: false, atProperty: true, onWebsite: false },
    { id: "gw", name: "Online payment gateway", kind: "gateway", account: "", enabled: false, atProperty: false, onWebsite: false, upcoming: true },
  ],
  docs: { prefix: "INV-", next: 1001, terms: "", footer: "Thank you for staying with us.", showLogo: true, paper: "A4", contract: { on: false, title: "Stay agreement", intro: "This agreement confirms the reservation and the terms accepted by the guest.", rules: "", signBefore: "Check-in", block: false } },
  printers: [],
  messages: {
    rules: DEFAULT_RULES,
    paymentNote: "", location: "", shortcuts: [],
  },
  roles: DEFAULT_ROLES,
  userRoles: {},
  security: { twoStep: false, staffTwoStep: false, timeout: 60 },
  log: [],
});

const KEY = (slug: string) => `bingi.settings.v1.${slug}`;
const cache = new Map<string, Settings>();
const listeners = new Set<() => void>();
const SERVER = new Map<string, Settings>();
/** Saved rules keep their toggles; new default events are added; labels/groups follow the defaults. */
function mergeRules(saved?: MsgRule[]): MsgRule[] {
  if (!Array.isArray(saved)) return DEFAULT_RULES;
  return DEFAULT_RULES.map((d) => { const x = saved.find((r) => r.id === d.id); return x ? { ...d, email: x.email, sms: x.sms, whatsapp: x.whatsapp } : d; });
}
function read(h: Hotel): Settings {
  const c = cache.get(h.slug); if (c) { applyTax(c); return c; }
  let s = seed(h);
  try { const raw = localStorage.getItem(KEY(h.slug)); if (raw) { const v = JSON.parse(raw); s = { ...s, ...v, profile: { ...s.profile, ...v.profile }, policy: { ...s.policy, ...v.policy }, tax: { ...s.tax, ...v.tax }, hk: { ...s.hk, ...v.hk }, docs: { ...s.docs, ...v.docs, contract: { ...s.docs.contract, ...v.docs?.contract } }, messages: { ...s.messages, ...v.messages, rules: mergeRules(v.messages?.rules) } }; } } catch {}
  cache.set(h.slug, s);
  applyTax(s);
  return s;
}
/** Rooms, bookings and the website quote all price with HOTEL_TAX; keep it equal to this property's setting. */
function applyTax(s: Settings) { HOTEL_TAX.vat = s.tax.vat; HOTEL_TAX.service = s.tax.service; }
const sub = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const nowStamp = () => { const d = new Date(); return `2026-11-10T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

export function useSettings(h: Hotel) {
  const st = useSyncExternalStore(sub, () => read(h), () => { if (!SERVER.has(h.slug)) SERVER.set(h.slug, seed(h)); return SERVER.get(h.slug)!; });
  const save = useCallback((fn: (s: Settings) => void, text?: string) => {
    const n = structuredClone(read(h)); fn(n);
    if (text) { n.log.unshift({ at: nowStamp(), by: "You", text }); n.log = n.log.slice(0, 200); }
    cache.set(h.slug, n); applyTax(n);
    try { localStorage.setItem(KEY(h.slug), JSON.stringify(n)); } catch {}
    listeners.forEach((l) => l());
  }, [h]);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); applyTax(seed(h)); listeners.forEach((l) => l()); }, [h]);
  return { st, save, reset };
}
/** Read-only: this property's settings outside React (e.g. housekeeping rules). */
export const settingsOf = (h: Hotel) => read(h);
