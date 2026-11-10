import type { L } from '../i18n/lang'
import type { PropertyType } from './pricing'

// "Solutions by property" pages. Plan + one-line need come from propertyTypes (data/pricing.ts) so the
// pricing finder, the home picker and these pages always agree. Modules = ids in data/status.ts.
export type Solution = { slug: string; type: PropertyType; title: L; intro: L; runs: L[]; modules: string[]; themes: string[] }

export const solutions: Solution[] = [
  { slug: 'hotel', type: 'hotel',
    title: { bn: 'হোটেলের জন্য BinGi', en: 'BinGi for hotels' },
    intro: { bn: 'রিসেপশন থেকে হাউসকিপিং, রেস্টুরেন্ট থেকে হিসাব — এক সিস্টেমে।', en: 'Reception to housekeeping, restaurant to accounts — in one system.' },
    runs: [{ bn: 'প্রতিদিনের চেক-ইন ও চেক-আউট', en: 'Daily check-ins and check-outs' }, { bn: 'রুম রেডি রাখা', en: 'Rooms kept ready' }, { bn: 'রুম বিলে রেস্টুরেন্ট অর্ডার', en: 'Restaurant orders on the room bill' }],
    modules: ['bookings', 'rooms', 'housekeeping', 'restaurant', 'finance', 'reports'], themes: ['city', 'flat'] },
  { slug: 'resort', type: 'resort',
    title: { bn: 'রিসোর্টের জন্য BinGi', en: 'BinGi for resorts' },
    intro: { bn: 'বড় টিম, স্টক আর অনেক আউটলেট — সব এক জায়গা থেকে দেখুন।', en: 'A bigger team, stock and many outlets — seen from one place.' },
    runs: [{ bn: 'স্টাফ শিফট ও হাজিরা', en: 'Staff shifts and attendance' }, { bn: 'কিচেন ও স্টোরের স্টক', en: 'Kitchen and store stock' }, { bn: 'রেস্টুরেন্ট, বার ও সার্ভিস', en: 'Restaurant, bar and services' }],
    modules: ['bookings', 'housekeeping', 'restaurant', 'hrm', 'inventory', 'finance'], themes: ['escape', 'villa', 'grand'] },
  { slug: 'guest-house', type: 'guest',
    title: { bn: 'গেস্ট হাউসের জন্য BinGi', en: 'BinGi for guest houses' },
    intro: { bn: 'বুকিং, গেস্টের তথ্য আর নিজের ওয়েবসাইট — খাতা ছাড়াই।', en: 'Bookings, guest records and your own website — no notebook.' },
    runs: [{ bn: 'ফোন, ওয়াক-ইন ও অনলাইন বুকিং', en: 'Phone, walk-in and online bookings' }, { bn: 'গেস্টের তথ্য ও চ্যাট', en: 'Guest records and chat' }, { bn: 'নিজের ছোট ওয়েবসাইট', en: 'A simple website of your own' }],
    modules: ['bookings', 'rooms', 'guests', 'website'], themes: ['nest', 'cottage', 'bunk'] },
  { slug: 'home-stay', type: 'home',
    title: { bn: 'হোম ও ফ্ল্যাটের জন্য BinGi', en: 'BinGi for homes and flats' },
    intro: { bn: 'কয়েকটা রুম অনলাইনে দিন, বুকিং নিন — শুরু করতে মিনিট লাগে।', en: 'List a few rooms online and take bookings — set up in minutes.' },
    runs: [{ bn: 'রুম অনলাইনে লিস্ট', en: 'Rooms listed online' }, { bn: 'মার্কেটপ্লেস ও ওয়াক-ইন বুকিং একসাথে', en: 'Marketplace and walk-in bookings together' }, { bn: 'নিজের ওয়েবসাইট', en: 'Your own website' }],
    modules: ['bookings', 'rooms', 'guests', 'website'], themes: ['nest', 'cottage'] },
  { slug: 'hotel-group', type: 'group',
    title: { bn: 'হোটেল গ্রুপের জন্য BinGi', en: 'BinGi for hotel groups' },
    intro: { bn: 'একাধিক প্রপার্টি এক অ্যাকাউন্টে — প্রয়োজন দেখে সাজানো।', en: 'Several properties under one account — set up around your needs.' },
    runs: [{ bn: 'প্রপার্টি অনুযায়ী মডিউল', en: 'Modules per property' }, { bn: 'এক জায়গা থেকে রিপোর্ট', en: 'Reports from one place' }, { bn: 'মাইগ্রেশন ও অনবোর্ডিং', en: 'Migration and onboarding' }],
    modules: ['bookings', 'hrm', 'inventory', 'finance', 'reports', 'restaurant'], themes: ['grand', 'city', 'escape'] },
]
