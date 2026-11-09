import type { L } from '../i18n/lang'

// ONE pricing catalog. Values copied from the live HMS Plan List
// (hms.bingi.app → Billing & Subscription → Plan List, checked 9 Nov 2026).
// In production this object should be fetched from the same API that feeds the HMS Plan List,
// so the website can never show a different price from the product.
// NOTE: onboarding spec v4 proposes per-room pricing (৳30/50/116) — not used here until decided.

export type Cycle = 'monthly' | 'six' | 'yearly'
export const cycles: { id: Cycle; months: number; discount: number; label: L }[] = [
  { id: 'monthly', months: 1, discount: 0, label: { bn: 'মাসিক', en: 'Monthly' } },
  { id: 'six', months: 6, discount: 0.1, label: { bn: '৬ মাস', en: '6 months' } },
  { id: 'yearly', months: 12, discount: 0.25, label: { bn: 'বাৎসরিক', en: 'Yearly' } },
]

export type PlanId = 'starter' | 'business' | 'ultra' | 'custom'
export type Plan = {
  id: PlanId
  name: string
  monthly: number | null // BDT per month, null = quotation
  maxRooms: number | null
  fees: { marketplace: number; website: number; offline: number } | null
  popular?: boolean
  tagline: L
}

export const plans: Plan[] = [
  { id: 'starter', name: 'Starter', monthly: 500, maxRooms: 30, fees: { marketplace: 12, website: 1.5, offline: 0 }, tagline: { bn: 'ছোট প্রপার্টির জন্য রুম ও বুকিং', en: 'Rooms and bookings for small properties' } },
  { id: 'business', name: 'Business', monthly: 1999, maxRooms: 100, fees: { marketplace: 8, website: 1, offline: 0 }, popular: true, tagline: { bn: 'পুরো হোটেল অপারেশন এক জায়গায়', en: 'Full hotel operations in one place' } },
  { id: 'ultra', name: 'Ultra', monthly: 3500, maxRooms: 200, fees: { marketplace: 4, website: 0.5, offline: 0 }, tagline: { bn: 'বড় হোটেল ও রিসোর্টের জন্য', en: 'For large hotels and resorts' } },
  { id: 'custom', name: 'Custom', monthly: null, maxRooms: null, fees: null, tagline: { bn: 'একাধিক প্রপার্টি বা বিশেষ প্রয়োজন', en: 'Multiple properties or special needs' } },
]

export type Row = { name: L; values: Record<PlanId, boolean | string> }
export type Group = { name: L; rows: Row[] }
const all = (s: boolean, b: boolean, u: boolean): Record<PlanId, boolean | string> => ({ starter: s, business: b, ultra: u, custom: 'tailored' })

export const compare: Group[] = [
  { name: { bn: 'প্রপার্টি ও বুকিং', en: 'Property & booking' }, rows: [
    { name: { bn: 'রুম ইনভেন্টরি', en: 'Room inventory' }, values: all(true, true, true) },
    { name: { bn: 'মার্কেটপ্লেস বুকিং', en: 'Marketplace bookings' }, values: all(true, true, true) },
    { name: { bn: 'অফলাইন / ওয়াক-ইন বুকিং', en: 'Offline / walk-in bookings' }, values: all(true, true, true) },
    { name: { bn: 'হোটেল ওয়েবসাইট', en: 'Hotel website' }, values: all(true, true, true) },
    { name: { bn: 'ডোমেইন ম্যানেজমেন্ট', en: 'Domain management' }, values: all(true, true, true) },
  ]},
  { name: { bn: 'হোটেল অপারেশন', en: 'Hotel operations' }, rows: [
    { name: { bn: 'হাউসকিপিং', en: 'Housekeeping' }, values: all(false, true, true) },
    { name: { bn: 'রেস্টুরেন্ট ও POS', en: 'Restaurant & POS' }, values: all(false, true, true) },
    { name: { bn: 'QR ফুড অর্ডার', en: 'QR food ordering' }, values: all(false, true, true) },
    { name: { bn: 'খরচ ব্যবস্থাপনা', en: 'Expense management' }, values: all(false, true, true) },
    { name: { bn: 'হোটেল সার্ভিস', en: 'Hotel services' }, values: all(false, true, true) },
  ]},
  { name: { bn: 'স্টাফ ও কন্ট্রোল', en: 'Staff & control' }, rows: [
    { name: { bn: 'স্টাফ ও রোল', en: 'Staff and roles' }, values: all(false, true, true) },
    { name: { bn: 'ইনভেন্টরি', en: 'Inventory' }, values: all(false, true, true) },
    { name: { bn: 'পূর্ণ অপারেশন', en: 'Full operations' }, values: all(false, true, true) },
  ]},
]

// Current offers — decided items only (onboarding v4 decisions D-08…D-10). Never say "free forever".
export const offers: L[] = [
  { bn: 'Business ও Ultra অ্যাক্টিভেশন ফি এখন ৳০ (স্ট্যান্ডার্ড ৳২৯,৫০০)', en: 'Business & Ultra activation fee now ৳0 (standard ৳29,500)' },
  { bn: 'রিমোট টিম ট্রেনিং এখন ফ্রি (স্ট্যান্ডার্ড ৳৫০০/শিফট)', en: 'Remote team training now free (standard ৳500/shift)' },
  { bn: 'অনসাইট ট্রেনিং ৳১২,৫০০ — টিমের থাকা-খাওয়া প্রপার্টি দেবে', en: 'Onsite training ৳12,500 — property provides team meals and stay' },
]

export function priceFor(monthly: number, cycle: Cycle) {
  const c = cycles.find((x) => x.id === cycle)!
  const perMonth = Math.round(monthly * (1 - c.discount))
  const total = perMonth * c.months
  const saved = monthly * c.months - total
  return { perMonth, total, saved, months: c.months }
}
