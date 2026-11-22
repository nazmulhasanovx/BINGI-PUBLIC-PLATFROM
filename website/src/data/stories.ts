import type { L } from '../i18n/lang'
import { pick } from './content'

// Customer stories. Admin: Content → Customer stories.
// Rules (enforced by the API): written permission before a story is shown, a source for every number,
// and a `sample` story can never be shown. The five below are SAMPLES — shown only in the design preview.
export type Story = {
  slug: string
  property: string
  location: L
  propertyType: 'home' | 'guest' | 'hotel' | 'resort' | 'group'
  rooms?: number
  plan?: 'starter' | 'business' | 'ultra' | 'custom'
  since?: string
  headline: L
  summary: L
  cover?: { src: string; alt: L }
  logo?: string
  challenge: L
  solution: L
  results?: { value: string; label: L; source: string }[]
  quote?: { text?: L; name?: string; role?: L }
  modules?: string[]
  body?: ({ h: L } | { p: L } | { list: L[] })[]
  /** Only in the code samples (the published snapshot never contains samples). */
  sample?: boolean
}

// Every number in a sample is a fact of the set-up (rooms, plan, price from the pricing table) — never a made-up result.
// Real stories replace these: results then need the hotel's own report as the source, and quotes need written permission.
const priceSrc = 'BinGi pricing, monthly rate (22 Nov 2026)'
export const samples: Story[] = [
  {
    sample: true,
    slug: 'sample-home-stay',
    property: 'Matir Ghor Home Stay (sample)',
    location: { bn: 'বান্দরবান', en: 'Bandarban' },
    propertyType: 'home', rooms: 1, plan: 'starter',
    headline: { bn: 'একটা রুম, নিজের ওয়েবসাইট আর সরাসরি বুকিং', en: 'One room, its own website and direct bookings' },
    summary: { bn: 'নমুনা: পাহাড়ের একটা ঘরের মালিক কীভাবে মাসে ৳25-এ নিজের বুকিং পেজ আর ক্যালেন্ডার চালান।', en: 'Sample: how the owner of a single hillside room runs a booking page and calendar for ৳25 a month.' },
    cover: { src: '/theme-demo/demo/matir/terraces.jpg', alt: { bn: 'পাহাড়ের মাটির ঘর (নমুনা ছবি)', en: 'Mud house in the hills (sample photo)' } },
    challenge: { bn: 'অতিথিরা ফেসবুকে মেসেজ দিতেন, তারিখ মনে রাখতে হতো মাথায় বা ফোনের নোটে। একই সপ্তাহে দুজনকে কথা দেওয়ার ভয় সবসময় থাকত, আর অগ্রিম টাকার হিসাব আলাদা খাতায়।', en: 'Guests messaged on Facebook and dates lived in the owner’s head or phone notes. There was always a risk of promising the same week to two guests, and advance payments were kept in a separate notebook.' },
    solution: { bn: 'Starter প্ল্যানে একটা রুম যোগ করে বুকিং ক্যালেন্ডার চালু হলো। NEST থিমে নিজের ছোট ওয়েবসাইট, যেখান থেকে অতিথি নিজেই তারিখ দেখে বুক করেন। প্রতিটা বুকিংয়ের অগ্রিম আর বাকি টাকা বুকিংয়ের সাথেই থাকে।', en: 'On Starter, one room was added and the booking calendar switched on. A small website on the NEST theme lets guests check dates and book themselves. Each booking keeps its advance and balance with it.' },
    results: [
      { value: '1', label: { bn: 'রুম — কোনো ন্যূনতম নেই', en: 'room — no minimum' }, source: priceSrc },
      { value: '৳25', label: { bn: 'মাসে, Starter', en: 'a month on Starter' }, source: priceSrc },
    ],
    body: [
      { h: { bn: 'এখন একটা দিন যেভাবে চলে', en: 'How a day runs now' } },
      { list: [
        { bn: 'নতুন বুকিং এলে ফোনে নোটিফিকেশন, ক্যালেন্ডারে তারিখ বন্ধ।', en: 'A new booking sends a notification and blocks the dates on the calendar.' },
        { bn: 'অতিথি এলে এক ট্যাপে চেক-ইন।', en: 'Check-in is one tap when the guest arrives.' },
        { bn: 'মাস শেষে কত বুকিং, কত টাকা — এক রিপোর্টে।', en: 'At month end, bookings and money are in one report.' },
      ] },
    ],
    modules: ['bookings', 'rooms', 'website'],
  },
  {
    sample: true,
    slug: 'sample-guest-house',
    property: 'Tea Valley Guest House (sample)',
    location: { bn: 'শ্রীমঙ্গল, সিলেট', en: 'Sreemangal, Sylhet' },
    propertyType: 'guest', rooms: 8, plan: 'starter',
    headline: { bn: 'খাতা আর ফোনের বুকিং থেকে এক স্ক্রিনে', en: 'From a notebook and phone calls to one screen' },
    summary: { bn: 'নমুনা: চা-বাগানের পাশে 8 রুমের একটা গেস্ট হাউস কীভাবে বুকিং, রুম আর দিনের টাকা এক জায়গায় আনল।', en: 'Sample: how an 8-room guest house beside the tea gardens brought bookings, rooms and the day’s cash into one place.' },
    cover: { src: '/theme-demo/demo/tea-valley/hero.jpg', alt: { bn: 'চা-বাগানের পাশে গেস্ট হাউস (নমুনা ছবি)', en: 'Guest house beside a tea garden (sample photo)' } },
    challenge: { bn: 'বুকিং লেখা হতো খাতায়, আর ফোন আসত তিনটা নম্বরে। ছুটির মৌসুমে কোন রুম খালি তা জানতে খাতা ঘাঁটতে হতো। দিনের শেষে ক্যাশ মেলাতে সময় লাগত।', en: 'Bookings went into a notebook and calls came to three phone numbers. In the holiday season, finding a free room meant searching the notebook. Matching the cash at day end took time.' },
    solution: { bn: 'Starter প্ল্যানে সব রুম এক বুকিং ক্যালেন্ডারে। ফোনের বুকিংও সেখানে তোলা হয়, তাই একই রুম দুবার দেওয়া যায় না। ওয়েবসাইটের বুকিং নিজে থেকে ক্যালেন্ডারে আসে, আর দিনের ক্যাশ রিপোর্ট এক ক্লিকে।', en: 'On Starter, every room sits on one booking calendar. Phone bookings are entered there too, so a room can’t be given twice. Website bookings land on the calendar by themselves, and the day’s cash report is one click.' },
    results: [
      { value: '8', label: { bn: 'রুম এক ক্যালেন্ডারে', en: 'rooms on one calendar' }, source: 'Sample set-up' },
      { value: '৳200', label: { bn: 'মাসে (8 × ৳25)', en: 'a month (8 × ৳25)' }, source: priceSrc },
    ],
    modules: ['bookings', 'rooms', 'finance', 'website'],
  },
  {
    sample: true,
    slug: 'sample-city-hotel',
    property: 'Sea Pearl City Hotel (sample)',
    location: { bn: 'গুলশান, ঢাকা', en: 'Gulshan, Dhaka' },
    propertyType: 'hotel', rooms: 40, plan: 'business',
    headline: { bn: 'ফ্রন্ট ডেস্ক, হাউসকিপিং আর স্টাফ এক সিস্টেমে', en: 'Front desk, housekeeping and staff on one system' },
    summary: { bn: 'নমুনা: 40 রুমের সিটি হোটেলে রুম রেডি হওয়ার খবর আর স্টাফের শিফট কীভাবে এক জায়গায় এল।', en: 'Sample: how a 40-room city hotel got room readiness and staff shifts into one place.' },
    cover: { src: '/theme-demo/demo/sea-pearl/lobby.jpg', alt: { bn: 'হোটেলের লবি (নমুনা ছবি)', en: 'Hotel lobby (sample photo)' } },
    challenge: { bn: 'চেক-আউটের পর হাউসকিপিং ফোন করে জানাত কোন রুম রেডি, আর রিসেপশনে অতিথি অপেক্ষা করতেন। শিফট আর হাজিরা ছিল আলাদা খাতায়, মাস শেষে বেতনের হিসাবে সময় লাগত।', en: 'After check-out, housekeeping phoned the desk to say a room was ready while guests waited at reception. Shifts and attendance were in a separate register, so payroll took time at month end.' },
    solution: { bn: 'Business প্ল্যানে রুম বোর্ডে প্রতিটা রুমের অবস্থা আলাদা দেখা যায় — বুকিং, পেমেন্ট আর রুম রেডি কিনা। চেক-আউট হলে হাউসকিপিং টাস্ক নিজে থেকে তৈরি হয়, রুম পরিষ্কার হলে ডেস্ক সাথে সাথে দেখে। HRM-এ শিফট, হাজিরা আর বেতন।', en: 'On Business, the room board shows each room’s booking, payment and readiness separately. A housekeeping task is created at check-out, and the desk sees the moment a room is clean. Shifts, attendance and payroll run in HRM.' },
    results: [
      { value: '40', label: { bn: 'রুম, একটা রুম বোর্ড', en: 'rooms, one room board' }, source: 'Sample set-up' },
      { value: '৳2,800', label: { bn: 'মাসে (40 × ৳70)', en: 'a month (40 × ৳70)' }, source: priceSrc },
    ],
    modules: ['bookings', 'housekeeping', 'hrm', 'guests'],
  },
  {
    sample: true,
    slug: 'sample-heritage-hotel',
    property: 'Shonali Rajbari Heritage Hotel (sample)',
    location: { bn: 'পুরান ঢাকা', en: 'Old Dhaka' },
    propertyType: 'hotel', rooms: 18, plan: 'business',
    headline: { bn: 'পুরোনো বাড়ি, নতুন বুকিং — নিজের ওয়েবসাইট থেকে', en: 'An old house, new bookings — from its own website' },
    summary: { bn: 'নমুনা: 18 রুমের একটা হেরিটেজ হোটেল কীভাবে নিজের ওয়েবসাইট আর অতিথির সাথে যোগাযোগ এক জায়গায় আনল।', en: 'Sample: how an 18-room heritage hotel brought its website and guest messages into one place.' },
    cover: { src: '/theme-demo/demo/shonali-rajbari/hero.jpg', alt: { bn: 'হেরিটেজ বাড়ির আঙিনা (নমুনা ছবি)', en: 'Courtyard of a heritage house (sample photo)' } },
    challenge: { bn: 'অতিথিরা ছবি দেখতে চাইতেন, দাম জানতে মেসেজ করতেন, আর উত্তর যেত আলাদা আলাদা অ্যাপ থেকে। ওয়েবসাইট ছিল শুধু তথ্যের পাতা, বুক করা যেত না।', en: 'Guests wanted photos and messaged for prices, and replies went out from different apps. The website was an information page — no booking.' },
    solution: { bn: 'GRAND থিমে ওয়েবসাইট, যেখানে রুম, দাম আর খালি তারিখ সরাসরি HMS থেকে আসে। অতিথির মেসেজ আর বুকিং কনফার্মেশন এক জায়গা থেকে যায়। প্রতিটা অতিথির আগের থাকা আর পছন্দ গেস্ট প্রোফাইলে থাকে।', en: 'A website on the GRAND theme shows rooms, prices and free dates straight from the HMS. Guest messages and booking confirmations go out from one place, and each guest profile keeps past stays and preferences.' },
    results: [
      { value: '18', label: { bn: 'রুম, এক ওয়েবসাইটে বুক করা যায়', en: 'rooms bookable on one website' }, source: 'Sample set-up' },
      { value: '৳1,260', label: { bn: 'মাসে (18 × ৳70)', en: 'a month (18 × ৳70)' }, source: priceSrc },
    ],
    modules: ['website', 'bookings', 'guests', 'communication'],
  },
  {
    sample: true,
    slug: 'sample-beach-resort',
    property: 'Azure Bay Resort (sample)',
    location: { bn: 'ইনানী, কক্সবাজার', en: 'Inani, Cox’s Bazar' },
    propertyType: 'resort', rooms: 24, plan: 'ultra',
    headline: { bn: 'রুম, রেস্টুরেন্ট আর বিল এক ফোলিওতে', en: 'Rooms, restaurant and bills on one folio' },
    summary: { bn: 'নমুনা: সমুদ্রের পাশে 24 রুমের রিসোর্টে রেস্টুরেন্টের অর্ডার কীভাবে সরাসরি অতিথির রুমের বিলে যোগ হলো।', en: 'Sample: how a 24-room beach resort’s restaurant orders went straight onto the guest’s room bill.' },
    cover: { src: '/theme-demo/demo/azure-bay/hero.jpg', alt: { bn: 'সমুদ্রের পাশে রিসোর্ট (নমুনা ছবি)', en: 'Resort by the sea (sample photo)' } },
    challenge: { bn: 'রেস্টুরেন্টের বিল ছিল কাগজে। চেক-আউটের সময় সেগুলো খুঁজে হাতে যোগ করতে হতো। স্টোরে কী আছে তা বোঝা যেত মাস শেষে গোনার পর।', en: 'Restaurant bills were on paper and had to be found and added by hand at check-out. What was in the store was known only after the month-end count.' },
    solution: { bn: 'Ultra প্ল্যানে রেস্টুরেন্ট ও বার POS থেকে অর্ডার এক ট্যাপে রুমে চার্জ হয়। চেক-আউটে একটাই ফোলিও — রুম, খাবার আর সার্ভিস একসাথে। রান্নাঘরে ব্যবহার হলে ইনভেন্টরি কমে, আর টাকার হিসাব যায় অ্যাকাউন্টসে।', en: 'On Ultra, a restaurant & bar POS order is charged to the room in one tap. Check-out shows one folio — room, food and services together. Kitchen use lowers inventory, and the money flows into Accounts.' },
    results: [
      { value: '1', label: { bn: 'ফোলিও — রুম, খাবার, সার্ভিস', en: 'folio — room, food, services' }, source: 'Sample set-up' },
      { value: '৳2,784', label: { bn: 'মাসে (24 × ৳116)', en: 'a month (24 × ৳116)' }, source: priceSrc },
    ],
    modules: ['restaurant', 'inventory', 'finance', 'bookings'],
  },
]

/** Published stories (admin). With no published data: the samples, shown ONLY in the design preview build. */
const all: Story[] = pick('stories', samples)
export const stories: Story[] = all.filter((s) => !s.sample || import.meta.env.MODE === 'single')
export const storyBySlug = (slug: string) => stories.find((s) => s.slug === slug)
