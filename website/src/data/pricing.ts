import type { L } from '../i18n/lang'

// ONE pricing catalog — source: onbording-flow-/v4/03-PRICING-COMMERCIAL.md
// (confirmed by Nazmul as THE pricing on 9 Nov 2026; final published commercial agreement still pending).
// Formula: billable Q × per-room rate for the cycle × months. Q = max(rooms, 10). No VAT is added at present (Nazmul, 11 Nov 2026).
// 11 Nov 2026 (Nazmul): Starter ৳25 · Business ৳70 · Ultra ৳116; 6/12-month rates rounded to whole taka (table below).
// In production fetch this from the same pricing API the HMS uses, keeping this shape.

export const MIN_BILLABLE = 10

export type Cycle = 'monthly' | 'six' | 'yearly'
export const cycles: { id: Cycle; months: number; discount: number; label: L }[] = [
  { id: 'monthly', months: 1, discount: 0, label: { bn: 'মাসিক', en: 'Monthly' } },
  { id: 'six', months: 6, discount: 0.1, label: { bn: '৬ মাস', en: '6 months' } },
  { id: 'yearly', months: 12, discount: 0.25, label: { bn: '১২ মাস', en: '12 months' } },
]

export type PlanId = 'starter' | 'business' | 'ultra' | 'custom'

// Which plan fits which property — same mapping as the home page "From a small home to a large resort" picker.
export type PropertyType = 'home' | 'guest' | 'hotel' | 'resort' | 'group'
export const propertyTypes: { id: PropertyType; name: L; plan: PlanId; need: L }[] = [
  { id: 'home', name: { bn: 'হোম / ফ্ল্যাট', en: 'Home / flat' }, plan: 'starter', need: { bn: 'কয়েকটা রুম অনলাইনে দিন, বুকিং নিন', en: 'List a few rooms online and take bookings' } },
  { id: 'guest', name: { bn: 'গেস্ট হাউস', en: 'Guest house' }, plan: 'starter', need: { bn: 'বুকিং, গেস্ট তথ্য আর নিজের ওয়েবসাইট', en: 'Bookings, guest records and your own website' } },
  { id: 'hotel', name: { bn: 'হোটেল', en: 'Hotel' }, plan: 'business', need: { bn: 'প্রতিদিনের অপারেশন: হাউসকিপিং, রেস্টুরেন্ট, খরচ', en: 'Daily operations: housekeeping, restaurant, expenses' } },
  { id: 'resort', name: { bn: 'রিসোর্ট', en: 'Resort' }, plan: 'ultra', need: { bn: 'বড় টিম, স্টক আর অনেক চলমান কাজ', en: 'A bigger team, stock and more moving parts' } },
  { id: 'group', name: { bn: 'হোটেল গ্রুপ', en: 'Hotel group' }, plan: 'custom', need: { bn: 'একাধিক প্রপার্টি এক অ্যাকাউন্টে', en: 'Several properties under one account' } },
]
export type Plan = {
  id: PlanId
  name: string
  rate: number | null // BDT per room per month; null = quotation
  regular?: number // list price before the launch offer (shown struck through)
  activation: { standard?: number; now: number } | null // standard = regular price (shown struck through) when known
  fees: { marketplace: number; website: number; walkin: number } | null
  popular?: boolean
  tagline: L
  plus?: L // "Everything in X, plus:"
}

export const plans: Plan[] = [
  { id: 'starter', name: 'Starter', rate: 25, regular: 62, activation: null, fees: { marketplace: 12, website: 1.5, walkin: 0 },
    tagline: { bn: 'রুম, বুকিং ও নিজের ওয়েবসাইট', en: 'Rooms, bookings and your own website' } },
  { id: 'business', name: 'Business', rate: 70, regular: 175, activation: { standard: 14500, now: 4999 }, fees: { marketplace: 8, website: 1, walkin: 0 }, popular: true,
    tagline: { bn: 'হোটেলের দৈনন্দিন অপারেশন', en: 'Day-to-day hotel operations' }, plus: { bn: 'Starter-এর সব কিছু, সাথে:', en: 'Everything in Starter, plus:' } },
  { id: 'ultra', name: 'Ultra', rate: 116, regular: 290, activation: { standard: 29500, now: 8999 }, fees: { marketplace: 4, website: 0.5, walkin: 0 },
    tagline: { bn: 'স্টাফ, ইনভেন্টরি ও অ্যাডভান্সড অপারেশন', en: 'Staff, inventory and advanced operations' }, plus: { bn: 'Business-এর সব কিছু, সাথে:', en: 'Everything in Business, plus:' } },
  { id: 'custom', name: 'Custom', rate: null, activation: null, fees: null,
    tagline: { bn: 'হোটেল গ্রুপ ও বিশেষ প্রয়োজন', en: 'Hotel groups and special needs' } },
]

// Cell: true = included · false = not included · L = text (e.g. Limited) · 'tailored' = Custom
export type Cell = boolean | L | 'tailored'
export type Row = { name: L; values: Record<PlanId, Cell>; highlight?: PlanId } // highlight = plan that first adds it
export type Group = { name: L; rows: Row[] }
const v = (s: Cell, b: Cell, u: Cell): Record<PlanId, Cell> => ({ starter: s, business: b, ultra: u, custom: 'tailored' })
const limited = { bn: 'সীমিত', en: 'Limited' }
const unlimited = { bn: 'আনলিমিটেড', en: 'Unlimited' }

// Source: onbording-flow-/v4/04-PLAN-ENTITLEMENTS.md (only Y/— items; unresolved "?" items like Bar are left out).
export const compare: Group[] = [
  { name: { bn: 'প্রপার্টি ও বুকিং', en: 'Property & booking' }, rows: [
    { name: { bn: 'রুম / অ্যাকোমোডেশন ম্যানেজমেন্ট', en: 'Room / accommodation management' }, values: v(true, true, true), highlight: 'starter' },
    { name: { bn: 'অনলাইন ও অফলাইন বুকিং', en: 'Online & offline bookings' }, values: v(true, true, true), highlight: 'starter' },
    { name: { bn: 'ওয়েবসাইট ম্যানেজমেন্ট', en: 'Website management' }, values: v(true, true, true), highlight: 'starter' },
    { name: { bn: 'ওয়েবসাইট থিম', en: 'Website themes' }, values: v(limited, limited, unlimited) },
    { name: { bn: 'ডোমেইন ম্যানেজমেন্ট', en: 'Domain management' }, values: v(true, true, true), highlight: 'starter' },
  ]},
  { name: { bn: 'হোটেল অপারেশন', en: 'Hotel operations' }, rows: [
    { name: { bn: 'হাউসকিপিং', en: 'Housekeeping' }, values: v(false, true, true), highlight: 'business' },
    { name: { bn: 'রেস্টুরেন্ট / মিল ম্যানেজমেন্ট', en: 'Restaurant / meal management' }, values: v(false, limited, { bn: 'পূর্ণ', en: 'Full' }), highlight: 'business' },
    { name: { bn: 'QR ফুড অর্ডার', en: 'QR food ordering' }, values: v(false, true, true), highlight: 'business' },
    { name: { bn: 'খরচ ব্যবস্থাপনা', en: 'Expense management' }, values: v(false, true, true), highlight: 'business' },
    { name: { bn: 'অন্যান্য সার্ভিস', en: 'Other services' }, values: v(false, true, true), highlight: 'business' },
  ]},
  { name: { bn: 'স্টাফ ও কন্ট্রোল', en: 'Staff & control' }, rows: [
    { name: { bn: 'পূর্ণ HRM', en: 'Full HRM' }, values: v(false, false, true), highlight: 'ultra' },
    { name: { bn: 'ইনভেন্টরি', en: 'Inventory' }, values: v(false, false, true), highlight: 'ultra' },
    { name: { bn: 'অ্যাডভান্সড অপারেশন', en: 'Advanced operations' }, values: v(false, false, true), highlight: 'ultra' },
    { name: { bn: 'আনলিমিটেড ওয়েবসাইট থিম', en: 'Unlimited website themes' }, values: v(false, false, true), highlight: 'ultra' },
  ]},
]

// Current offers & services (v4 D-08…D-11). Never say "free forever".
export const offers: L[] = [
  { bn: 'Business অ্যাক্টিভেশন ৳১৪,৫০০ — এখন ৳৪,৯৯৯', en: 'Business activation ৳14,500 — now ৳4,999' },
  { bn: 'Ultra অ্যাক্টিভেশন ৳২৯,৫০০ — এখন ৳৮,৯৯৯', en: 'Ultra activation ৳29,500 — now ৳8,999' },
  { bn: 'রিমোট টিম ট্রেনিং ৳৫০০/শিফট — এখন ফ্রি', en: 'Remote team training ৳500/shift — now free' },
  { bn: 'অনসাইট ট্রেনিং ৳১২,৫০০ — টিমের থাকা-খাওয়া প্রপার্টি দেবে', en: 'Onsite training ৳12,500 — property provides team meals & stay' },
  { bn: 'ওয়েবসাইট ম্যানেজমেন্ট ও রেস্টুরেন্ট-বার: প্ল্যানে থাকলে এখন বাড়তি ৳০', en: 'Website management & Restaurant-Bar: currently ৳0 extra where your plan includes them' },
]

// Per-room rate per cycle, rounded to whole taka (approved 11 Nov 2026). Keyed by monthly rate.
export const cycleRates: Record<number, Record<Cycle, number>> = {
  25: { monthly: 25, six: 23, yearly: 19 },
  70: { monthly: 70, six: 63, yearly: 53 },
  116: { monthly: 116, six: 105, yearly: 87 },
}
export const rateFor = (rate: number, cycle: Cycle) => cycleRates[rate]?.[cycle] ?? Math.round(rate * (1 - cycles.find((x) => x.id === cycle)!.discount))

// Launch offer (11 Nov 2026): ~60% off the regular list price. Runs 3 months, until 11 Feb 2027;
// hotels that join during the offer keep the launch price (Nazmul, 11 Nov 2026).
export const LAUNCH_OFF = 60
export const LAUNCH_UNTIL = { bn: '১১ ফেব্রুয়ারি ২০২৭', en: '11 Feb 2027' }
// Theme Store: ৳50 per theme per month, free for now (Nazmul, 11 Nov 2026).
export const THEME_PRICE = 50

export function billable(rooms: number) { return Math.max(MIN_BILLABLE, Math.floor(rooms) || MIN_BILLABLE) }

export function priceFor(rate: number, rooms: number, cycle: Cycle) {
  const c = cycles.find((x) => x.id === cycle)!
  const q = billable(rooms)
  const perRoom = rateFor(rate, cycle)
  const list = q * rate * c.months
  const total = q * perRoom * c.months
  return { q, months: c.months, total, perMonth: Math.round(total / c.months), perRoom, saved: list - total }
}
