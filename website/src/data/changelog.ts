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
      { bn: 'থিম স্টোর', en: 'Theme Store' },
      { bn: 'ডেভেলপার API ও BinGi AI', en: 'Developer API and BinGi AI' },
    ] },
]
