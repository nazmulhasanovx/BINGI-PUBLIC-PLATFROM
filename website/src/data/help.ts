import type { L } from '../i18n/lang'

export type Category = { id: string; icon: string; name: L }
export const categories: Category[] = [
  { id: 'start', icon: 'Rocket', name: { bn: 'শুরু করা', en: 'Getting started' } },
  { id: 'bookings', icon: 'CalendarDays', name: { bn: 'বুকিং', en: 'Bookings' } },
  { id: 'rooms', icon: 'BedDouble', name: { bn: 'রুম', en: 'Rooms' } },
  { id: 'housekeeping', icon: 'Sparkles', name: { bn: 'হাউসকিপিং', en: 'Housekeeping' } },
  { id: 'guests', icon: 'MessagesSquare', name: { bn: 'গেস্ট ও চ্যাট', en: 'Guests & Chat' } },
  { id: 'restaurant', icon: 'UtensilsCrossed', name: { bn: 'রেস্টুরেন্ট ও বার', en: 'Restaurant & Bar' } },
  { id: 'staff', icon: 'Users', name: { bn: 'স্টাফ ও HRM', en: 'Staff & HRM' } },
  { id: 'billing', icon: 'Wallet', name: { bn: 'পেমেন্ট ও বিলিং', en: 'Payments & Billing' } },
]

export type Article = { slug: string; category: string; title: L; summary: L; steps: L[]; draft: boolean }

// draft: true = written from the current HMS screens; support team must verify before publishing.
export const articles: Article[] = [
  { slug: 'create-booking', category: 'bookings', draft: true,
    title: { bn: 'নতুন বুকিং তৈরি করবেন যেভাবে', en: 'How to create a new booking' },
    summary: { bn: 'ড্যাশবোর্ড থেকে এক মিনিটে বুকিং', en: 'Book a guest from the dashboard in a minute' },
    steps: [
      { bn: 'ড্যাশবোর্ডের ডান দিকে উপরে "New Booking" চাপুন।', en: 'On the Dashboard, click "New Booking" at the top right.' },
      { bn: 'চেক-ইন ও চেক-আউট তারিখ, রুম টাইপ ও রুম বেছে নিন।', en: 'Choose check-in and check-out dates, room type and room.' },
      { bn: 'নতুন বা পুরনো গেস্ট বেছে গেস্টের তথ্য দিন।', en: 'Pick a new or existing guest and fill in the details.' },
      { bn: 'পেমেন্টের তথ্য দিয়ে বুকিং কনফার্ম করুন।', en: 'Add payment details and confirm the booking.' },
    ] },
  { slug: 'add-room-type', category: 'rooms', draft: true,
    title: { bn: 'রুম টাইপ ও রুম যোগ করা', en: 'Add a room type and rooms' },
    summary: { bn: 'ক্যাটাগরি, দাম ও রুম নম্বর একবারে', en: 'Category, rate and room numbers in one go' },
    steps: [
      { bn: 'সাইডবারে "Rooms" খুলে "Add Room Type" চাপুন।', en: 'Open "Rooms" in the sidebar and click "Add Room Type".' },
      { bn: 'ক্যাটাগরি, বেড, গেস্ট সংখ্যা, সুবিধা ও প্রতি রাতের দাম দিন।', en: 'Set category, beds, guests, amenities and nightly rate.' },
      { bn: 'রুম নম্বর যোগ করুন, যেমন ১০১, ১০২।', en: 'Add the room numbers, e.g. 101, 102.' },
      { bn: 'ছবি দিয়ে সেভ করুন। মার্কেটপ্লেসে দেখাতে BinGi-এর অনুমোদন লাগে।', en: 'Add photos and save. Marketplace listing needs BinGi approval.' },
    ] },
  { slug: 'change-plan', category: 'billing', draft: true,
    title: { bn: 'প্ল্যান দেখা ও পরিবর্তন', en: 'View and change your plan' },
    summary: { bn: 'মাসিক, ৬ মাস বা বাৎসরিক', en: 'Monthly, 6 months or yearly' },
    steps: [
      { bn: 'সাইডবারে "Billing & Subscription" খুলুন।', en: 'Open "Billing & Subscription" in the sidebar.' },
      { bn: '"Plan List" ট্যাবে যান।', en: 'Go to the "Plan List" tab.' },
      { bn: 'মাসিক, ৬ মাস (১০% ছাড়) বা বাৎসরিক (২৫% ছাড়) বেছে নিন।', en: 'Pick monthly, 6 months (10% off) or yearly (25% off).' },
      { bn: 'প্ল্যানে "Choose" চেপে পেমেন্ট সম্পন্ন করুন।', en: 'Click "Choose" on a plan and complete payment.' },
    ] },
]

// Only items actually seen in the HMS on 9 Nov 2026.
export const whatsNew: { date: L; title: L }[] = [
  { date: { bn: 'নভেম্বর ২০২৬', en: 'Nov 2026' }, title: { bn: 'নতুন ড্যাশবোর্ড: আজকের আগমন, রুম প্রস্তুতি ও ওয়েবসাইট স্ট্যাটাস', en: 'New dashboard: arrivals, room readiness and website status' } },
  { date: { bn: 'নভেম্বর ২০২৬', en: 'Nov 2026' }, title: { bn: 'সাইডবার Flat বা Expandable — যেটা সুবিধা', en: 'Sidebar in Flat or Expandable mode' } },
  { date: { bn: 'নভেম্বর ২০২৬', en: 'Nov 2026' }, title: { bn: 'প্ল্যান লিস্টে ৬ মাস ও বাৎসরিক ছাড়', en: '6-month and yearly discounts in Plan List' } },
]
