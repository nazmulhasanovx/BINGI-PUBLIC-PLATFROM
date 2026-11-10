import type { L } from '../i18n/lang'

// Blog / guides. Practical advice only — no invented statistics, no customer claims.
export type Block = { h: L } | { p: L } | { list: L[] }
export type Post = { slug: string; date: string; tag: L; title: L; summary: L; body: Block[] }

export const posts: Post[] = [
  {
    slug: 'one-calendar-no-double-bookings', date: '2026-11-10',
    tag: { bn: 'বুকিং', en: 'Bookings' },
    title: { bn: 'এক ক্যালেন্ডারে সব বুকিং: ডাবল বুকিং বন্ধ করুন', en: 'One calendar for every booking: stop double bookings' },
    summary: { bn: 'ফোন, ওয়াক-ইন, ওয়েবসাইট আর মার্কেটপ্লেস — সব বুকিং এক জায়গায় রাখলে ভুল কমে।', en: 'Phone, walk-in, website and marketplace — keep every booking in one place and mistakes drop.' },
    body: [
      { p: { bn: 'ডাবল বুকিং সাধারণত হয় যখন বুকিং কয়েক জায়গায় লেখা থাকে — রিসেপশনের খাতা, কারও ফোন, আর অনলাইনের আলাদা তালিকা। এক রুম দুইজনকে দেওয়া হয়ে যায়, কারণ কেউ পুরো ছবিটা দেখছে না।', en: 'Double bookings usually happen when bookings live in several places — a notebook at reception, someone’s phone and a separate online list. The same room goes to two guests because nobody sees the full picture.' } },
      { h: { bn: 'নিয়ম একটাই: এক রুম, এক ক্যালেন্ডার', en: 'One rule: one room, one calendar' } },
      { list: [
        { bn: 'প্রতিটা বুকিং — যেখান থেকেই আসুক — একই ক্যালেন্ডারে তুলুন।', en: 'Put every booking — wherever it came from — on the same calendar.' },
        { bn: 'ফোনে বুকিং নিলে সাথে সাথে তুলুন, পরে নয়।', en: 'Enter phone bookings straight away, not later.' },
        { bn: 'বুকিংয়ের অবস্থা (কনফার্ম, অপেক্ষায়) আর পেমেন্টের অবস্থা আলাদা রাখুন।', en: 'Keep booking status (confirmed, pending) separate from payment status.' },
        { bn: 'দিনের শুরুতে আজকের আগমন আর খালি রুম একবার মিলিয়ে নিন।', en: 'Each morning, check today’s arrivals against free rooms once.' },
      ] },
      { h: { bn: 'BinGi-তে যেভাবে হয়', en: 'How it works in BinGi' } },
      { p: { bn: 'BinGi-তে ওয়েবসাইট, মার্কেটপ্লেস আর রিসেপশনের বুকিং একই তালিকায় আসে, প্রতিটার একটা বুকিং আইডি থাকে। একটা রুম একই রাতে দুইবার বিক্রি করা যায় না।', en: 'In BinGi, website, marketplace and reception bookings land in one list, each with one booking ID. A room cannot be sold twice for the same night.' } },
    ],
  },
  {
    slug: 'housekeeping-routine-small-hotels', date: '2026-11-10',
    tag: { bn: 'হাউসকিপিং', en: 'Housekeeping' },
    title: { bn: 'ছোট হোটেলের জন্য সহজ হাউসকিপিং রুটিন', en: 'A simple housekeeping routine for small hotels' },
    summary: { bn: 'চেক-আউট থেকে "রুম রেডি" পর্যন্ত — চার ধাপের একটা রুটিন যা যেকোনো টিম মানতে পারে।', en: 'From check-out to “room ready” — a four-step routine any team can follow.' },
    body: [
      { p: { bn: 'গেস্ট এসে রুম রেডি না পেলে প্রথম ধারণাই খারাপ হয়। সমাধান বড় সফটওয়্যার না — একটা পরিষ্কার রুটিন, যা সবাই জানে।', en: 'A guest who arrives to a room that isn’t ready starts on a bad note. The fix isn’t big software — it’s a clear routine everyone knows.' } },
      { h: { bn: 'চার ধাপ', en: 'Four steps' } },
      { list: [
        { bn: 'চেক-আউট হলেই রুমটা "পরিষ্কার দরকার" হিসেবে চিহ্নিত করুন।', en: 'The moment a guest checks out, mark the room “needs cleaning”.' },
        { bn: 'একজনকে কাজটা দিন — নাম ধরে, যাতে দায়িত্ব পরিষ্কার থাকে।', en: 'Give the task to one person, by name, so ownership is clear.' },
        { bn: 'পরিষ্কারের পর সুপারভাইজার একবার দেখে নিন।', en: 'After cleaning, a supervisor checks the room once.' },
        { bn: 'তারপরই রুম "রেডি" — তার আগে নয়।', en: 'Only then mark it “ready” — not before.' },
      ] },
      { h: { bn: 'যে ভুলটা সবচেয়ে বেশি হয়', en: 'The most common mistake' } },
      { p: { bn: 'বুকিংয়ের অবস্থা আর রুমের অবস্থা মিশিয়ে ফেলা। "চেক-আউট হয়েছে" মানে রুম রেডি না। দুটো আলাদা রাখুন, তাহলে রিসেপশন জানবে কোন রুম আসলেই দেওয়া যাবে।', en: 'Mixing booking status with room status. “Checked out” does not mean “ready”. Keep the two apart and reception always knows which rooms can really be given.' } },
      { p: { bn: 'BinGi-তে চেক-আউট হলে ক্লিনিং টাস্ক নিজে থেকেই তৈরি হয়, আর রুমের অবস্থা বুকিং থেকে আলাদা দেখায়।', en: 'In BinGi, a cleaning task is created on check-out and room status is shown separately from the booking.' } },
    ],
  },
  {
    slug: 'more-direct-bookings', date: '2026-11-10',
    tag: { bn: 'গ্রোথ', en: 'Growth' },
    title: { bn: 'সরাসরি বুকিং বাড়ানোর ৬টা সহজ উপায়', en: '6 simple ways to get more direct bookings' },
    summary: { bn: 'নিজের ওয়েবসাইট থেকে আসা বুকিংয়ে কমিশন কম — এই ছয়টা কাজ দিয়ে শুরু করুন।', en: 'Bookings from your own website cost less in commission — start with these six things.' },
    body: [
      { p: { bn: 'অনলাইন ট্রাভেল এজেন্সি নতুন গেস্ট আনে, কিন্তু প্রতিটা বুকিংয়ে কমিশন নেয়। পুরনো ও ফিরে আসা গেস্টদের সরাসরি বুক করাতে পারলে সেই টাকা আপনার থাকে।', en: 'Online travel agencies bring new guests but take a commission on each booking. When returning guests book you directly, that money stays with you.' } },
      { list: [
        { bn: 'নিজের ওয়েবসাইটে বুক করার বোতাম রাখুন — প্রতিটা পাতায়।', en: 'Put a “Book” button on your own website — on every page.' },
        { bn: 'দাম পরিষ্কার দেখান: রুমের দাম, ট্যাক্স, যা যা যোগ হবে।', en: 'Show prices clearly: room rate, taxes, anything added.' },
        { bn: 'আসল ও পরিষ্কার ছবি দিন — রুম, বাথরুম, ভিউ।', en: 'Use real, clear photos — room, bathroom, view.' },
        { bn: 'মেসেজ ও WhatsApp-এ দ্রুত উত্তর দিন।', en: 'Answer messages and WhatsApp quickly.' },
        { bn: 'Google-এ আপনার হোটেলের প্রোফাইল ঠিক রাখুন, ওয়েবসাইটের লিংক সহ।', en: 'Keep your hotel’s Google profile up to date, with your website link.' },
        { bn: 'চেক-আউটের সময় গেস্টকে পরের বার সরাসরি বুক করতে বলুন।', en: 'At check-out, invite guests to book direct next time.' },
      ] },
      { p: { bn: 'BinGi-র প্রতিটা প্ল্যানে বুকিং ইঞ্জিনসহ নিজের ওয়েবসাইট থাকে, আর রিসেপশনে নেওয়া ওয়াক-ইন বুকিংয়ে কোনো ফি নেই।', en: 'Every BinGi plan includes your own website with a booking engine, and walk-in bookings at reception have no fee.' } },
    ],
  },
]

export const readMinutes = (p: Post, lang: 'bn' | 'en') => {
  const words = p.body.flatMap((b) => ('p' in b ? [b.p[lang]] : 'h' in b ? [b.h[lang]] : b.list.map((x) => x[lang]))).join(' ').split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
