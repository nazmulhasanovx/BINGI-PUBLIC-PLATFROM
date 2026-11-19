"use client";
// Owner onboarding — one flow for every property type (rules 05 §18–19, Onboarding v5.1 adapted to code, 10 Nov 2026).
// PROTOTYPE: everything lives in this browser (localStorage). Production: onboarding draft API + accommodation APIs
// (see claude/design/Rooms_Backend_Handoff_v1.md). Nothing here is sent to BinGi.
import { useCallback, useSyncExternalStore } from "react";
import type { Hotel, PropertyType } from "@/lib/types";
import { teaValley } from "@/data/tea-valley";
import { PROPERTY_TYPES } from "@/lib/rooms/catalog";

export type PlanId = "starter" | "business" | "ultra";
export type Cycle = 1 | 6 | 12;
export type Status = "draft" | "pending" | "needs-changes" | "approved";

export type Draft = {
  id: string; slug: string; created: string; updated: string;
  step: StepId; seen: StepId[];
  // S1
  country: string; propertyType: string; name: string; area: string; city: string; address: string; phone: string;
  road: string; division: string; postcode: string; pin: { x: number; y: number } | null;
  units: number; extras: string[]; staff: string;
  // S2 (easy builder — presets only)
  stay: string[]; buildings: string[]; floors: number[]; ground: "G" | "0"; zones: string[];
  plan: PlanId; planPicked: boolean; cycle: Cycle;
  // S3
  rates: { weekendPct: number; breakfast: boolean; breakfastPrice: number; minStay: number; done: boolean };
  existing: { has: boolean | null; rows: { guest: string; checkIn: string; checkOut: string; unit: string }[] };
  policy: { preset: "flexible" | "moderate" | "strict" | ""; checkIn: string; checkOut: string; vat: number; sc: number };
  // S4
  modules: string[]; team: { phone: string; role: string }[]; teamLater: boolean;
  // S5
  pay: {
    cash: boolean; bkash: boolean; nagad: boolean; bank: boolean; bingi: "later" | "apply" | "";
    bkashNo?: string; bkashType?: "personal" | "merchant" | "agent"; nagadNo?: string; nagadType?: "personal" | "merchant" | "agent";
    bankName?: string; bankHolder?: string; bankAcc?: string; bankBranch?: string;
    settle?: { method: "bank" | "bkash"; holder: string; bank: string; acc: string; branch: string; routing: string; wallet: string };
  };
  site: { theme: string; later: boolean };
  // S6
  verify: { nid: string; trade: string; tin: string; later: boolean };
  status: Status; submitted?: string; note?: string;
};

export const SECTIONS = [
  { id: "s1", label: "Your property", bn: "আপনার property", steps: ["1.1", "1.2", "1.3", "1.4"] },
  { id: "s2", label: "Rooms", bn: "রুম", steps: ["2.1", "2.2", "2.3"] },
  { id: "s3", label: "Booking", bn: "বুকিং", steps: ["3.1"] },
  { id: "s4", label: "Team & tools", bn: "টিম ও টুলস", steps: ["4.1", "4.2"] },
  { id: "s5", label: "Money & website", bn: "টাকা ও ওয়েবসাইট", steps: ["5.1", "5.2"] },
  { id: "s6", label: "Finish", bn: "শেষ ধাপ", steps: ["6.1", "6.2", "6.3"] },
] as const;
export type StepId = (typeof SECTIONS)[number]["steps"][number];
export const ORDER: StepId[] = SECTIONS.flatMap((s) => [...s.steps]) as StepId[];
export const STEP_TITLE: Record<StepId, [string, string]> = {
  "1.1": ["কী ধরনের property", "Property type"], "1.2": ["নাম", "Name"], "1.3": ["ঠিকানা", "Address"], "1.4": ["আর কী আছে", "Extras"],
  "2.1": ["কী ভাড়া দেন", "What you rent"], "2.2": ["কোথায় আছে", "Where they are"], "2.3": ["রুমের ধরন", "Room types"],
  "3.1": ["বুকিংয়ের নিয়ম", "Booking rules"],
  "4.1": ["কাজের টুলস", "Tools"], "4.2": ["টিম", "Team"],
  "5.1": ["টাকা নেওয়া", "Payments"], "5.2": ["ওয়েবসাইট", "Website"],
  "6.1": ["প্ল্যান", "Plan"], "6.2": ["কাগজপত্র", "Documents"], "6.3": ["রিভিউ ও জমা", "Review & submit"],
};
/** "3.2" was merged into "3.1" (v7.4); old drafts may still point at it. */
export const stepOf = (s: StepId): StepId => (ORDER.includes(s) ? s : (s as string) === "3.2" ? "3.1" : ORDER[0]);
export const sectionOf = (s: StepId) => SECTIONS.findIndex((x) => (x.steps as readonly string[]).includes(stepOf(s)));
/** Rough minutes left: ~40 s per remaining step. */
export const minutesLeft = (s: StepId) => Math.max(1, Math.ceil((ORDER.length - ORDER.indexOf(stepOf(s)) - 1) * 0.7));

// ---------- Pricing (confirmed by Nazmul 9–10 Nov 2026) ----------
// Public site pricing ("Pay per room. Nothing hidden", Nazmul 10 Nov 2026).
export type PlanInfo = { label: string; perUnit: number; perUnitRegular?: number; activation: number; activationRegular?: number; for: string; forBn: string; tags: [string, string][]; fees: [number, number, number]; includes: [string, string][]; includesTitle: [string, string]; restaurant: boolean };
export const PLANS: Record<PlanId, PlanInfo> = {
  starter: {
    label: "Starter", perUnit: 25, activation: 0, for: "Rooms, bookings and your own website", forBn: "রুম, বুকিং আর নিজের ওয়েবসাইট",
    tags: [["হোম / ফ্ল্যাট", "Home / flat"], ["গেস্ট হাউস", "Guest house"]], fees: [12, 1.5, 0], restaurant: false,
    includesTitle: ["Starter-এ আছে", "Starter includes"],
    includes: [["রুম / থাকার জায়গা ম্যানেজমেন্ট", "Room / accommodation management"], ["অনলাইন ও অফলাইন বুকিং", "Online & offline bookings"], ["ওয়েবসাইট ম্যানেজমেন্ট", "Website management"], ["ডোমেইন ম্যানেজমেন্ট", "Domain management"], ["সীমিত ওয়েবসাইট থিম", "Limited website themes"]],
  },
  business: {
    label: "Business", perUnit: 70, perUnitRegular: 175, activation: 4999, activationRegular: 14500, for: "Day-to-day hotel operations", forBn: "হোটেলের প্রতিদিনের কাজ",
    tags: [["হোটেল", "Hotel"]], fees: [8, 1, 0], restaurant: true,
    includesTitle: ["Starter-এর সব, সাথে", "Everything in Starter, plus"],
    includes: [["হাউসকিপিং", "Housekeeping"], ["রেস্টুরেন্ট / মিল ম্যানেজমেন্ট", "Restaurant / meal management"], ["QR ফুড অর্ডার", "QR food ordering"], ["খরচের হিসাব", "Expense management"], ["অন্যান্য সার্ভিস", "Other services"]],
  },
  ultra: {
    label: "Ultra", perUnit: 116, perUnitRegular: 290, activation: 8999, activationRegular: 29500, for: "Staff, inventory and advanced operations", forBn: "স্টাফ, ইনভেন্টরি আর অ্যাডভান্সড অপারেশন",
    tags: [["রিসোর্ট", "Resort"]], fees: [4, 0.5, 0], restaurant: true,
    includesTitle: ["Business-এর সব, সাথে", "Everything in Business, plus"],
    includes: [["পূর্ণ HRM", "Full HRM"], ["ইনভেন্টরি", "Inventory"], ["অ্যাডভান্সড অপারেশন", "Advanced operations"], ["সব ওয়েবসাইট থিম", "Unlimited website themes"]],
  },
};
/** Which plan a module needs (public pricing page). */
export const MODULE_PLAN: Record<string, PlanId> = { frontdesk: "starter", housekeeping: "business", restaurant: "business", accounts: "business", services: "business", staff: "ultra", inventory: "ultra" };
export const MIN_BILLED = 10;
export const CYCLE_OFF: Record<Cycle, number> = { 1: 0, 6: 0.1, 12: 0.25 };
export const TRIAL_DAYS = 7;
const CYCLE_RATE: Record<number, Record<Cycle, number>> = { 25: { 1: 25, 6: 23, 12: 19 }, 70: { 1: 70, 6: 63, 12: 53 }, 116: { 1: 116, 6: 105, 12: 87 } };
export function quote(plan: PlanId, units: number, cycle: Cycle) {
  const p = PLANS[plan];
  const billed = Math.max(MIN_BILLED, units);
  const monthly = billed * p.perUnit;
  const gross = monthly * cycle;
  // Per-room rate per cycle, rounded to whole taka — same table as the public pricing page (approved 11 Nov 2026).
  const rate = CYCLE_RATE[p.perUnit]?.[cycle] ?? Math.round(p.perUnit * (1 - CYCLE_OFF[cycle]));
  const sub = billed * rate * cycle;
  const off = gross - sub;
  return { billed, monthly, gross, off, sub, activation: p.activation, activationRegular: p.activationRegular, total: sub + p.activation };
}
const RANK: Record<PlanId, number> = { starter: 0, business: 1, ultra: 2 };
const BY_TYPE: Record<string, PlanId> = { homestay: "starter", "guest-house": "starter", hostel: "starter", hotel: "business", motel: "business", "serviced-apartment": "business", other: "business", resort: "ultra", lodge: "ultra", "vacation-rental": "business" };
/** Property type (public pricing tags) + the modules the owner turned on → the plan that fits. */
export function recommend(d: Pick<Draft, "propertyType" | "modules" | "extras">): PlanId {
  let p: PlanId = BY_TYPE[d.propertyType] ?? "business";
  const need = [...d.modules, ...(d.extras.some((e) => e === "Restaurant" || e === "Bar") ? ["restaurant"] : [])];
  for (const m of need) { const q = MODULE_PLAN[m]; if (q && RANK[q] > RANK[p]) p = q; }
  return p;
}
export const planRank = (p: PlanId) => RANK[p];

export const EXTRAS = ["Restaurant", "Bar", "Café", "Pool", "Spa", "Event hall", "Airport transfer", "Tours", "Laundry", "Gym"];
export const STAFF = ["Just me", "2–5", "6–15", "16–50", "50+"];
export const COUNTRIES = [{ code: "BD", label: "Bangladesh", currency: "BDT" }];

// ---------- Store ----------
type Root = { v: 1; phone: string; verified: boolean; current: string; drafts: Draft[]; lang?: "bn" | "en" };
const KEY = "bingi-onb-v1";
const empty: Root = { v: 1, phone: "", verified: false, current: "", drafts: [] };
const listeners = new Set<() => void>();
let cache: { raw: string | null; st: Root } = { raw: null, st: empty };
function read(): Root {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch {}
  if (raw === cache.raw) return cache.st;
  let st = empty;
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 1 && Array.isArray(p.drafts)) st = p; } catch {}
  cache = { raw, st };
  return st;
}
function write(st: Root) {
  const raw = JSON.stringify(st);
  try { localStorage.setItem(KEY, raw); } catch {}
  cache = { raw, st };
  listeners.forEach((l) => l());
}
const sub = (l: () => void) => {
  listeners.add(l);
  const s = (e: StorageEvent) => { if (e.key === KEY) l(); };
  window.addEventListener("storage", s);
  return () => { listeners.delete(l); window.removeEventListener("storage", s); };
};
export const nowIso = () => new Date().toISOString();

export function useOnboarding() {
  const st = useSyncExternalStore(sub, read, () => empty);
  const update = useCallback((fn: (s: Root) => void) => { const n = structuredClone(read()); fn(n); write(n); }, []);
  const draft = st.drafts.find((d) => d.id === st.current);
  const edit = useCallback((fn: (d: Draft) => void) => update((s) => {
    const d = s.drafts.find((x) => x.id === s.current);
    if (d) { fn(d); d.updated = nowIso(); }
  }), [update]);
  return { st, draft, update, edit };
}
/** Read outside React (HMS shell): submitted onboarding properties appear in the property switcher. */
export function useSubmittedHotels(): Hotel[] {
  const st = useSyncExternalStore(sub, read, () => empty);
  return st.drafts.filter((d) => d.status !== "draft").map(hotelOf);
}
export function onboardingDraftFor(slug: string): Draft | undefined {
  return read().drafts.find((d) => d.slug === slug);
}
export function useDraftFor(slug: string): Draft | undefined {
  const st = useSyncExternalStore(sub, read, () => empty);
  return st.drafts.find((d) => d.slug === slug);
}

export function newDraft(n: number): Draft {
  const id = `onb-${Date.now().toString(36)}`;
  const t = nowIso();
  return {
    id, slug: id, created: t, updated: t, step: "1.1", seen: ["1.1"],
    country: "BD", propertyType: "", name: "", area: "", city: "", address: "", phone: "", units: 0, extras: [], staff: "",
    road: "", division: "", postcode: "", pin: null,
    stay: [], buildings: [], floors: [], ground: "G", zones: [],
    plan: "business", planPicked: false, cycle: 1,
    rates: { weekendPct: 0, breakfast: false, breakfastPrice: 0, minStay: 1, done: false },
    existing: { has: null, rows: [] },
    policy: { preset: "moderate", checkIn: "14:00", checkOut: "12:00", vat: 15, sc: 10 },
    modules: ["frontdesk", "housekeeping"], team: [], teamLater: false,
    pay: { cash: true, bkash: false, nagad: false, bank: false, bingi: "later" },
    site: { theme: "", later: false },
    verify: { nid: "", trade: "", tin: "", later: false },
    status: "draft",
    note: n > 0 ? undefined : undefined,
  };
}

// ---------- Draft → Hotel (so HMS modules can run on the new property) ----------
const OLD_TYPE: Record<string, PropertyType> = {
  hotel: "hotel", resort: "resort", "guest-house": "guest-house", motel: "hotel", hostel: "hostel", homestay: "home",
  "serviced-apartment": "serviced-apartment", "vacation-rental": "villa", lodge: "cottage", other: "other",
};
const hotels = new Map<string, { key: string; h: Hotel }>();
export function hotelOf(d: Draft): Hotel {
  const key = [d.name, d.propertyType, d.city, d.area, d.address, d.phone, d.plan, d.site.theme].join("|");
  const hit = hotels.get(d.slug);
  if (hit && hit.key === key) return hit.h;
  const label = PROPERTY_TYPES.find((p) => p.slug === d.propertyType)?.label ?? "Property";
  const h: Hotel = {
    ...teaValley,
    slug: d.slug, name: d.name || "New property", type: label, stars: 0, propertyType: OLD_TYPE[d.propertyType] ?? "other",
    propertyCode: d.propertyType || undefined,
    tagline: "", intro: "", logoText: d.name || "New property", area: d.area, city: d.city, country: "Bangladesh", address: d.address,
    phone: d.phone, whatsapp: d.phone.replace(/[^\d+]/g, ""), email: "", rooms: [], offers: [], promoCodes: [], reviews: [], reviewCount: 0, reviewScore: undefined,
    plan: d.plan, status: "paused", host: undefined, faq: undefined, dayPlan: undefined, houseRules: undefined,
    theme: { ...teaValley.theme, master: (d.site.theme || "nest") as Hotel["theme"]["master"] },
  };
  hotels.set(d.slug, { key, h });
  return h;
}

// ---------- Readiness ----------
export type Check = { id: string; label: string; bn: string; level: "required" | "recommended" | "optional"; ok: boolean; step: StepId };
export function checks(d: Draft, units: { total: number; published: number; categories: number }): Check[] {
  const c = (id: string, bn: string, label: string, level: Check["level"], ok: boolean, step: StepId): Check => ({ id, bn, label, level, ok, step });
  return [
    c("type", "Property-র ধরন", "Property type", "required", !!d.propertyType, "1.1"),
    c("name", "নাম", "Name", "required", !!d.name.trim(), "1.2"),
    c("address", "ঠিকানা", "Address", "required", !!(d.city.trim() && d.road.trim()), "1.3"),
    c("units", "কমপক্ষে ১টা রুম", "At least one room", "required", units.total > 0, "2.3"),
    c("plan", "প্ল্যান বাছাই", "Plan chosen", "required", d.planPicked, "6.1"),
    c("cash", "নগদ টাকা নেওয়া চালু", "Pay at property on", "required", d.pay.cash, "5.1"),
    c("rates", "দামের নিয়ম দেখা", "Price rules checked", "recommended", d.rates.done, "3.1"),
    c("policy", "বাতিলের নিয়ম", "Cancellation policy", "recommended", !!d.policy.preset, "3.1"),
    c("verify", "কাগজপত্র", "Documents", "recommended", !!(d.verify.nid && d.verify.trade), "6.2"),
    c("team", "টিম", "Team invited", "optional", d.team.length > 0, "4.2"),
    c("site", "ওয়েবসাইটের লুক", "Website look", "optional", !!d.site.theme, "5.2"),
  ];
}
export function score(cs: Check[]) {
  const w = { required: 3, recommended: 2, optional: 1 } as const;
  const total = cs.reduce((a, c) => a + w[c.level], 0);
  const got = cs.reduce((a, c) => a + (c.ok ? w[c.level] : 0), 0);
  return Math.round((got / total) * 100);
}
export const validPhone = (p: string) => /^(\+?880|0)1[3-9]\d{8}$/.test(p.replace(/[\s-]/g, ""));
export const trialLeft = (d: Draft) => {
  if (!d.submitted) return TRIAL_DAYS;
  const used = Math.floor((Date.now() - new Date(d.submitted).getTime()) / 86400000);
  return Math.max(0, TRIAL_DAYS - used);
};

// ---------- Language (onboarding is Bangla-first) ----------
export function useL() {
  const st = useSyncExternalStore(sub, read, () => empty);
  const lang = st.lang ?? "bn";
  return { lang, t: (bn: string, en: string) => (lang === "bn" ? bn : en) };
}
export function setOnbLang(l: "bn" | "en") { const n = structuredClone(read()); n.lang = l; write(n); }
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
/** Bangla digits when the onboarding is in Bangla. */
export const num = (n: number | string, lang: "bn" | "en") => (lang === "bn" ? String(n).replace(/\d/g, (x) => BN_DIGITS[+x]) : String(n));
