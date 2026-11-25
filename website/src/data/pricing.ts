import type { L } from '../i18n/lang'
import { pick } from './content'

// ONE pricing catalog — source: onbording-flow-/v4/03-PRICING-COMMERCIAL.md
// (confirmed by Nazmul as THE pricing on 9 Nov 2026; final published commercial agreement still pending).
// Formula: billable Q × per-room rate for the cycle × months. Q = max(rooms, MIN_BILLABLE). No VAT is added at present (Nazmul, 11 Nov 2026).
// MIN_BILLABLE = 1 since 22 Nov 2026 (Nazmul): a property with a single room can use BinGi and pays for 1 room. Was 10.
// 11 Nov 2026 (Nazmul): Starter ৳25 · Business ৳70 · Ultra ৳116; 6/12-month rates rounded to whole taka (table below).
// In production fetch this from the same pricing API the HMS uses, keeping this shape.

export const MIN_BILLABLE: number = pick('minBillable', 1)

export type Cycle = 'monthly' | 'six' | 'yearly'
export const cycles: { id: Cycle; months: number; discount: number; label: L }[] = pick('cycles', [
  { id: 'monthly', months: 1, discount: 0, label: { bn: 'মাসিক', en: 'Monthly' } },
  { id: 'six', months: 6, discount: 0.1, label: { bn: '6 মাস', en: '6 months' } },
  { id: 'yearly', months: 12, discount: 0.25, label: { bn: '12 মাস', en: '12 months' } },
])

export type PlanId = 'starter' | 'business' | 'ultra' | 'custom'

// Which plan fits which property — same mapping as the home page "From a small home to a large resort" picker.
export type PropertyType = 'home' | 'guest' | 'hotel' | 'resort' | 'group'
export const propertyTypes: { id: PropertyType; name: L; plan: PlanId; need: L }[] = pick('propertyTypes', [
  { id: 'home', name: { bn: 'হোম / ফ্ল্যাট', en: 'Home / flat' }, plan: 'starter', need: { bn: 'কয়েকটা রুম অনলাইনে দিন, বুকিং নিন', en: 'List a few rooms online and take bookings' } },
  { id: 'guest', name: { bn: 'গেস্ট হাউস', en: 'Guest house' }, plan: 'starter', need: { bn: 'বুকিং, গেস্ট তথ্য আর নিজের ওয়েবসাইট', en: 'Bookings, guest records and your own website' } },
  { id: 'hotel', name: { bn: 'হোটেল', en: 'Hotel' }, plan: 'business', need: { bn: 'প্রতিদিনের অপারেশন: হাউসকিপিং, রেস্টুরেন্ট, খরচ', en: 'Daily operations: housekeeping, restaurant, expenses' } },
  { id: 'resort', name: { bn: 'রিসোর্ট', en: 'Resort' }, plan: 'ultra', need: { bn: 'বড় টিম, স্টক আর অনেক চলমান কাজ', en: 'A bigger team, stock and more moving parts' } },
  { id: 'group', name: { bn: 'হোটেল গ্রুপ', en: 'Hotel group' }, plan: 'custom', need: { bn: 'একাধিক প্রপার্টি এক অ্যাকাউন্টে', en: 'Several properties under one account' } },
])
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

// Marketplace commission 7% on every plan (Nazmul, 25 Nov 2026). Website fee (1.5/1/0.5) = old values, NOT yet re-decided.
export const plans: Plan[] = pick('plans', [
  { id: 'starter', name: 'Starter', rate: 25, // Starter ৳25 always (Nazmul 11 Nov 13:32) — no launch label
    activation: null, fees: { marketplace: 7, website: 1.5, walkin: 0 },
    tagline: { bn: 'রুম, বুকিং ও নিজের ওয়েবসাইট', en: 'Rooms, bookings and your own website' } },
  { id: 'business', name: 'Business', rate: 70, regular: 175, activation: { standard: 14500, now: 4999 }, fees: { marketplace: 7, website: 1, walkin: 0 }, popular: true,
    tagline: { bn: 'হোটেলের দৈনন্দিন অপারেশন', en: 'Day-to-day hotel operations' }, plus: { bn: 'Starter-এর সব কিছু, সাথে:', en: 'Everything in Starter, plus:' } },
  { id: 'ultra', name: 'Ultra', rate: 116, regular: 290, activation: { standard: 29500, now: 8999 }, fees: { marketplace: 7, website: 0.5, walkin: 0 },
    tagline: { bn: 'পূর্ণ HR, ইনভেন্টরি ও রেস্টুরেন্ট', en: 'Full HR, inventory and restaurant' }, plus: { bn: 'Business-এর সব কিছু, সাথে:', en: 'Everything in Business, plus:' } },
  { id: 'custom', name: 'Custom', rate: null, activation: null, fees: null,
    tagline: { bn: 'হোটেল গ্রুপ ও বিশেষ প্রয়োজন', en: 'Hotel groups and special needs' } },
])

// Cell: true = included · false = not included · L = text (e.g. Limited) · 'tailored' = Custom
export type Cell = boolean | L | 'tailored'
export type Row = { name: L; values: Record<PlanId, Cell>; highlight?: PlanId } // highlight = plan that first adds it
export type Group = { name: L; rows: Row[] }
const v = (s: Cell, b: Cell, u: Cell): Record<PlanId, Cell> => ({ starter: s, business: b, ultra: u, custom: 'tailored' })
const limited = { bn: 'সীমিত', en: 'Limited' }
const unlimited = { bn: 'আনলিমিটেড', en: 'Unlimited' }

// Source: pricing update brief (25 Nov 2026) = plan rules 22 Nov + HR decision 23 Nov + commission decision 25 Nov.
// Row names = the module names owners see in HMS. Business restaurant / QR = still the old value until Nazmul decides.
const pct7 = { bn: '7%', en: '7%' }
export const compare: Group[] = pick('compare', [
  { name: { bn: 'প্রপার্টি ও বুকিং', en: 'Property & booking' }, rows: [
    { name: { bn: 'রুম ও দাম', en: 'Rooms & rates' }, values: v(true, true, true), highlight: 'starter' },
    { name: { bn: 'বুকিং ও ক্যালেন্ডার', en: 'Bookings & calendar' }, values: v(true, true, true), highlight: 'starter' },
    { name: { bn: 'গেস্ট ও চ্যাট', en: 'Guests & chat' }, values: v(true, true, true), highlight: 'starter' },
    { name: { bn: 'নিজের ওয়েবসাইট ও ডোমেইন', en: 'Website & domain' }, values: v(true, true, true), highlight: 'starter' },
    { name: { bn: 'ওয়েবসাইট থিম', en: 'Website themes' }, values: v(limited, limited, unlimited) },
    { name: { bn: 'BinGi Marketplace লিস্টিং', en: 'BinGi Marketplace listing' }, values: v(pct7, pct7, pct7), highlight: 'starter' },
  ]},
  { name: { bn: 'টাকা ও রিপোর্ট', en: 'Money & reports' }, rows: [
    { name: { bn: 'পেমেন্ট ও Finance', en: 'Payments & finance' }, values: v(true, true, true), highlight: 'starter' },
    { name: { bn: 'রিপোর্ট', en: 'Reports' }, values: v({ bn: 'বেসিক', en: 'Basic' }, true, true), highlight: 'starter' },
    { name: { bn: 'Cashbox (ক্যাশ ড্রয়ার, দিন বন্ধ)', en: 'Cashbox (cash drawer, day close)' }, values: v(false, true, true), highlight: 'business' },
    { name: { bn: 'খরচ', en: 'Expenses' }, values: v(false, true, true), highlight: 'business' },
  ]},
  { name: { bn: 'হোটেল অপারেশন', en: 'Hotel operations' }, rows: [
    { name: { bn: 'Room board (সব রুম এক নজরে)', en: 'Room board (every room at a glance)' }, values: v(false, true, true), highlight: 'business' },
    { name: { bn: 'হাউসকিপিং ও মেইনটেন্যান্স', en: 'Housekeeping & maintenance' }, values: v(false, true, true), highlight: 'business' },
    { name: { bn: 'অন্যান্য সার্ভিস', en: 'Other services' }, values: v(false, true, true), highlight: 'business' },
    { name: { bn: 'রেস্টুরেন্ট ও বার', en: 'Restaurant & bar' }, values: v(false, limited, { bn: 'পূর্ণ (POS, KOT, একাধিক আউটলেট)', en: 'Full (POS, KOT, multiple outlets)' }), highlight: 'business' },
    { name: { bn: 'QR ফুড অর্ডার', en: 'QR food ordering' }, values: v(false, true, true), highlight: 'business' },
  ]},
  { name: { bn: 'টিম ও স্টক', en: 'Team & stock' }, rows: [
    { name: { bn: 'স্টাফ', en: 'Staff' }, values: v(false, { bn: 'টিম (স্টাফ লিস্ট)', en: 'Team (staff list)' }, { bn: 'পূর্ণ HR (হাজিরা, শিফট, ছুটি, বেতন)', en: 'Full HR (attendance, shifts, leave, payroll)' }), highlight: 'business' },
    { name: { bn: 'ইনভেন্টরি', en: 'Inventory' }, values: v(false, false, true), highlight: 'ultra' },
    { name: { bn: 'Communication Center (SMS, ইমেইল)', en: 'Communication Center (SMS, email)' }, values: v(false, false, true), highlight: 'ultra' },
    { name: { bn: 'একাধিক প্রপার্টি', en: 'Multi-property' }, values: { starter: false, business: false, ultra: false, custom: true } },
  ]},
])

// Current offers & services (v4 D-08…D-11). Never say "free forever".
export const offers: L[] = pick('offers', [
  { bn: '7 দিন ফ্রি ট্রায়াল — অ্যাকাউন্ট খুলুন, প্রপার্টি সেটআপ করুন, আজই শুরু করুন', en: '7-day free trial — create your account, set up your property and start today' },
  { bn: 'Business অ্যাক্টিভেশন ৳14,500 — এখন ৳4,999', en: 'Business activation ৳14,500 — now ৳4,999' },
  { bn: 'Ultra অ্যাক্টিভেশন ৳29,500 — এখন ৳8,999', en: 'Ultra activation ৳29,500 — now ৳8,999' },
  { bn: 'রিমোট টিম ট্রেনিং ৳500/শিফট — এখন ফ্রি', en: 'Remote team training ৳500/shift — now free' },
  { bn: 'অনসাইট ট্রেনিং ৳12,500 — টিমের থাকা-খাওয়া প্রপার্টি দেবে', en: 'Onsite training ৳12,500 — property provides team meals & stay' },
  { bn: 'ওয়েবসাইট ম্যানেজমেন্ট ও রেস্টুরেন্ট-বার: প্ল্যানে থাকলে এখন বাড়তি ৳0', en: 'Website management & Restaurant-Bar: currently ৳0 extra where your plan includes them' },
  { bn: 'অনলাইনে গেস্ট টাকা দিলে payment gateway fee 2.5% আলাদা (অনলাইন পেমেন্ট Coming Soon)। হোটেলে নগদ নিলে কোনো fee নেই।', en: 'Online guest payments carry a separate 2.5% gateway fee (online payment coming soon). No fee on cash taken at the hotel.' },
])

// Per-room rate per cycle, rounded to whole taka (approved 11 Nov 2026). Keyed by monthly rate.
export const cycleRates: Record<number, Record<Cycle, number>> = pick('cycleRates', {
  25: { monthly: 25, six: 23, yearly: 19 },
  70: { monthly: 70, six: 63, yearly: 53 },
  116: { monthly: 116, six: 105, yearly: 87 },
})
export const rateFor = (rate: number, cycle: Cycle) => cycleRates[rate]?.[cycle] ?? Math.round(rate * (1 - cycles.find((x) => x.id === cycle)!.discount))

// Launch offer (11 Nov 2026): ~60% off the regular list price. Runs 3 months, until 11 Feb 2027;
// hotels that join during the offer keep the launch price (Nazmul, 11 Nov 2026).
export const LAUNCH_OFF: number = pick('launchOff', 60)
export const LAUNCH_UNTIL: L = pick('launchUntil', { bn: '11 ফেব্রুয়ারি 2027', en: '11 Feb 2027' })
// Theme Store: ৳50 per theme per month, free for now (Nazmul, 11 Nov 2026).
export const THEME_PRICE: number = pick('themePrice', 50)

export function billable(rooms: number) { return Math.max(MIN_BILLABLE, Math.floor(rooms) || MIN_BILLABLE) }

export function priceFor(rate: number, rooms: number, cycle: Cycle) {
  const c = cycles.find((x) => x.id === cycle)!
  const q = billable(rooms)
  const perRoom = rateFor(rate, cycle)
  const list = q * rate * c.months
  const total = q * perRoom * c.months
  return { q, months: c.months, total, perMonth: Math.round(total / c.months), perRoom, saved: list - total }
}

// What each plan adds (same source as the pricing cards: the comparison rows that plan first includes).
export function includesFor(p: Plan): L[] {
  if (p.id === 'custom') return [
    { bn: 'যা দরকার, শুধু সেটাই', en: 'Only what you need:' },
    { bn: 'মাইগ্রেশন ও ইন্টিগ্রেশন প্ল্যান', en: 'Migration and integration planning' },
    { bn: 'প্রপার্টি অনুযায়ী মডিউল', en: 'Modules per property' },
    { bn: 'প্রয়োজন দেখে কোটেশন', en: 'Quotation after review' },
  ]
  const rows: L[] = compare.flatMap((g) => g.rows).filter((r) => r.highlight === p.id).map((r) => {
    const cell = r.values[p.id]
    return typeof cell === 'object' ? { bn: `${r.name.bn} (${cell.bn})`, en: `${r.name.en} (${cell.en.toLowerCase()})` } : r.name
  })
  if (p.id === 'ultra') rows.unshift({ bn: 'পূর্ণ রেস্টুরেন্ট ও বার', en: 'Full restaurant & bar' }, { bn: 'পূর্ণ HR (হাজিরা, শিফট, ছুটি, বেতন)', en: 'Full HR (attendance, shifts, leave, payroll)' }); if (p.id === 'ultra') rows.push({ bn: 'আনলিমিটেড ওয়েবসাইট থিম', en: 'Unlimited website themes' })
  if (p.id === 'starter') return [{ bn: 'Starter-এ আছে:', en: 'Starter includes:' }, ...rows, { bn: 'সীমিত ওয়েবসাইট থিম', en: 'Limited website themes' }]
  return [p.plus!, ...rows]
}
