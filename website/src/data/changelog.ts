import type { L } from '../i18n/lang'

// What's new. Month-level dates. Status is explicit on every entry: live / testing / soon.
// Source: project status docs (9–10 Nov 2026). Confirm with the dev team before each release note goes out.
export type Change = { month: L; status: 'live' | 'testing' | 'soon'; title: L; items: L[] }

export const changes: Change[] = [
  { month: { bn: 'নভেম্বর ২০২৬', en: 'November 2026' }, status: 'testing',
    title: { bn: 'নতুন HMS ড্যাশবোর্ড ও সাইডবার', en: 'New HMS dashboard and sidebar' },
    items: [
      { bn: 'আজকের আগমন, অকুপেন্সি ও আয় এক নজরে', en: 'Today’s arrivals, occupancy and revenue at a glance' },
      { bn: 'কাজ অনুযায়ী সাজানো সাইডবার, Flat বা Expandable মোড', en: 'Sidebar grouped by work, with Flat or Expandable mode' },
      { bn: 'বিলিংয়ে প্ল্যান তালিকা ও তুলনা', en: 'Plan list and comparison in Billing' },
    ] },
  { month: { bn: 'নভেম্বর ২০২৬', en: 'November 2026' }, status: 'testing',
    title: { bn: 'নতুন হোটেল ওয়েবসাইট থিম', en: 'New hotel website themes' },
    items: [
      { bn: '৮টা থিম: NEST, COTTAGE, BUNK, CITY, VILLA, FLAT, ESCAPE, GRAND', en: '8 themes: NEST, COTTAGE, BUNK, CITY, VILLA, FLAT, ESCAPE, GRAND' },
      { bn: 'প্রতিটা থিমে বুকিং ইঞ্জিন, ১০টা রং ও দুই ধরনের ফন্ট', en: 'Booking engine in every theme, 10 colours and two heading styles' },
      { bn: 'HMS থেকে লেখা ও ছবি বদলান', en: 'Change text and photos from the HMS' },
    ] },
  { month: { bn: 'নভেম্বর ২০২৬', en: 'November 2026' }, status: 'testing',
    title: { bn: 'নতুন করে বানানো HMS মডিউল', en: 'Redesigned HMS modules' },
    items: [
      { bn: 'রুম / অ্যাকোমোডেশন: লাইভ লেআউট, রুম প্রতি আউট-অফ-অর্ডার', en: 'Room / Accommodation: the live layout, out-of-order per room' },
      { bn: 'ডিসকাউন্ট ও রেট: তারিখ অনুযায়ী দামের ক্যালেন্ডার', en: 'Discounts & Rates: a price-by-date calendar' },
      { bn: 'গেস্ট ও রিভিউ এক জায়গায়', en: 'Guests and Reviews in one place' },
      { bn: 'স্টাফ: ছোট টিমের জন্য Easy ভিউ', en: 'Staff: an Easy view for small teams' },
      { bn: 'ইনভেন্টরি: স্টোর, পারচেজ অর্ডার, স্টক কাউন্ট, রেসিপি', en: 'Inventory: stores, purchase orders, stock count, recipes' },
      { bn: 'অন্যান্য সার্ভিস: আজকের বোর্ড ও অ্যাসাইন', en: 'Other Services: Today board and assignment' },
    ] },
  { month: { bn: 'নভেম্বর ২০২৬', en: 'November 2026' }, status: 'testing',
    title: { bn: 'থিম স্টোর: ২১টা প্রিমিয়াম থিম', en: 'Theme Store: 21 premium themes' },
    items: [
      { bn: 'লাক্সারি কালেকশন (১০) ও সিগনেচার কালেকশন (১০), সাথে POD', en: 'Luxury Collection (10) and Signature Collection (10), plus POD' },
      { bn: 'প্রতি থিম ৳৫০/মাস — এখন ফ্রি', en: '৳50 per theme a month — free for now' },
    ] },
  { month: { bn: 'চলমান', en: 'Running' }, status: 'live',
    title: { bn: 'প্রোডাকশনে চালু', en: 'Live in production' },
    items: [
      { bn: 'স্টাফ ও HRM', en: 'Staff & HRM' },
      { bn: 'রেস্টুরেন্ট ও বার (মিল ম্যানেজমেন্ট)', en: 'Restaurant & Bar (meal management)' },
      { bn: 'ইনভেন্টরি', en: 'Inventory' },
      { bn: 'অ্যাকাউন্টস', en: 'Accounts' },
    ] },
  { month: { bn: 'আসছে', en: 'Next' }, status: 'soon',
    title: { bn: 'যা আসছে', en: 'Coming soon' },
    items: [
      { bn: 'চ্যানেল ম্যানেজার (OTA)', en: 'Channel manager (OTA)' },
      { bn: 'BinGi Payments', en: 'BinGi Payments' },
      { bn: 'ডেভেলপার API ও BinGi AI', en: 'Developer API and BinGi AI' },
    ] },
]
