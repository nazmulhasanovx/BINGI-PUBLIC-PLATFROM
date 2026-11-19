import type { L } from '../i18n/lang'
import { pick } from './content'

// Blog / guides. Practical advice only — no invented statistics, no customer claims.
export type Block = { h: L } | { p: L } | { list: L[] }
// cover = a real BinGi screen (never stock UI); caption says which screen it is.
export type Post = { slug: string; date: string; tag: L; title: L; summary: L; cover: { src: string; alt: L }; body: Block[] }

export const posts: Post[] = pick('posts', [
  {
    slug: 'write-a-listing-guests-trust', date: '2026-11-19',
    cover: { src: '/media/guest/hotel.webp', alt: { bn: 'BinGi Guest App-এ একটা হোটেল পেজ', en: 'A hotel page in the BinGi Guest App' } },
    tag: { bn: 'মার্কেটপ্লেস', en: 'Marketplace' },
    title: { bn: 'এমন লিস্টিং লিখুন যাতে গেস্ট ভরসা পায়', en: 'Write a listing guests trust' },
    summary: { bn: 'ছবি, রুমের তথ্য, দাম আর উত্তর দেওয়ার গতি — অনলাইনে গেস্ট এই চারটা দেখেই সিদ্ধান্ত নেয়।', en: 'Photos, room facts, price and how fast you reply — guests decide online on these four things.' },
    body: [
      { p: { bn: 'অনলাইনে গেস্ট আপনার হোটেলে আগে কখনো আসেনি। তার হাতে শুধু আপনার পেজ। পেজটা যত পরিষ্কার আর সত্য, ভরসা তত বেশি।', en: 'Online, a guest has never been to your hotel. All they have is your page. The clearer and more honest it is, the more they trust it.' } },
      { h: { bn: '1. ছবি: আসল, উজ্জ্বল, পুরো রুম', en: '1. Photos: real, bright, the whole room' } },
      { list: [
        { bn: 'দিনের আলোয় তুলুন, জানালা খোলা রেখে।', en: 'Shoot in daylight, with the curtains open.' },
        { bn: 'রুমের কোণা থেকে তুলুন, যাতে পুরো রুম দেখা যায়।', en: 'Shoot from a corner so the whole room shows.' },
        { bn: 'বাথরুম আর বাইরের দৃশ্যের ছবিও দিন।', en: 'Add the bathroom and the view too.' },
        { bn: 'প্রথম ছবিটা সবচেয়ে সুন্দরটা দিন — সেটাই তালিকায় দেখায়।', en: 'Put your best photo first — that is the one shown in lists.' },
      ] },
      { h: { bn: '2. রুমের তথ্য ঠিক রাখুন', en: '2. Keep room facts right' } },
      { p: { bn: 'বেড কয়টা, কী ধরনের, রুম কত বড়, কতজন থাকতে পারবে — এগুলো ভুল থাকলে গেস্ট এসে অখুশি হয়, আর খারাপ রিভিউ আসে।', en: 'How many beds and what kind, how big the room is, how many guests fit — if these are wrong, guests arrive unhappy and reviews suffer.' } },
      { h: { bn: '3. দাম পরিষ্কার', en: '3. A clear price' } },
      { p: { bn: 'রাতপ্রতি দাম, ট্যাক্স বা সার্ভিস চার্জ, নাস্তা আছে কিনা — আগে থেকে লিখে দিন। চেক-আউটে নতুন খরচ দেখলে গেস্ট আর ফেরে না।', en: 'Nightly price, taxes or service charge, whether breakfast is included — say it up front. A surprise cost at check-out loses the guest for good.' } },
      { h: { bn: '4. দ্রুত উত্তর', en: '4. Fast replies' } },
      { p: { bn: 'বুক করার আগে অনেক গেস্ট প্রশ্ন করে। যে হোটেল আগে উত্তর দেয়, বুকিং সাধারণত সে-ই পায়। দিনে কয়েকবার মেসেজ দেখার একটা নিয়ম রাখুন।', en: 'Many guests ask a question before they book. The hotel that answers first usually gets the booking. Set a habit of checking messages a few times a day.' } },
      { p: { bn: 'BinGi মার্কেটপ্লেসে আপনার হোটেল পেজ HMS-এর রুম আর ছবি থেকেই তৈরি হয়, আর গেস্টের প্রশ্ন আসে HMS-এর Chat-এ।', en: 'On the BinGi Marketplace, your hotel page is built from the rooms and photos in your HMS, and guest questions arrive in HMS Chat.' } },
    ],
  },
  {
    slug: 'close-the-day-cash-routine', date: '2026-11-19',
    cover: { src: '/media/hms/bentoCash.webp', alt: { bn: 'BinGi HMS-এর ক্যাশবক্স', en: 'The Cashbox in BinGi HMS' } },
    tag: { bn: 'টাকা-পয়সা', en: 'Money' },
    title: { bn: 'দিন শেষের ক্যাশ মেলানো: 5 মিনিটের রুটিন', en: 'Closing the cash drawer: a 5-minute routine' },
    summary: { bn: 'ড্রয়ারে যা থাকার কথা আর যা আছে — প্রতিদিন মেলালে ছোট ভুল বড় হয় না।', en: 'What should be in the drawer and what is there — check daily and small mistakes never grow.' },
    body: [
      { p: { bn: 'ক্যাশের হিসাব সপ্তাহ শেষে মেলাতে গেলে কোন দিন কী হয়েছিল কেউ মনে রাখে না। প্রতিদিনের ছোট একটা রুটিন এই সমস্যা মিটিয়ে দেয়।', en: 'Leave the cash count to the end of the week and nobody remembers what happened on which day. A short daily routine solves it.' } },
      { h: { bn: 'পাঁচ ধাপ', en: 'Five steps' } },
      { list: [
        { bn: 'দিনের শুরুতে ড্রয়ারে কত টাকা রাখলেন (ওপেনিং), লিখে রাখুন।', en: 'Write down the opening float when the day starts.' },
        { bn: 'প্রতিটা ক্যাশ পেমেন্ট সাথে সাথে তুলুন — বুকিং বা অন্য সার্ভিস, যেটার জন্যই হোক।', en: 'Record every cash payment straight away — booking or other service.' },
        { bn: 'ড্রয়ার থেকে টাকা বের হলে (খরচ, মালিকের নেওয়া) কারণসহ লিখুন।', en: 'When cash leaves the drawer (an expense, the owner taking some), write why.' },
        { bn: 'দিন শেষে গুনুন, আর হিসাবের সাথে মেলান।', en: 'At the end of the day, count and compare with the expected amount.' },
        { bn: 'কম-বেশি হলে তখনই কারণ লিখুন, তারপর দিন বন্ধ করুন।', en: 'If it is over or short, write the reason now, then close the day.' },
      ] },
      { h: { bn: 'রেস্টুরেন্টের ক্যাশ আলাদা রাখুন', en: 'Keep restaurant cash separate' } },
      { p: { bn: 'রেস্টুরেন্ট বা বারের নিজের ক্যাশ থাকলে সেটা আলাদা রাখুন, আর শুধু হ্যান্ডওভারের সময় মূল ড্রয়ারে যোগ করুন। তাহলে কোথায় গরমিল, সহজে ধরা যায়।', en: 'If the restaurant or bar has its own cash, keep it apart and add it to the main drawer only at handover. Then it is easy to see where a gap came from.' } },
      { p: { bn: 'BinGi-র ক্যাশবক্সে ওপেনিং, ক্যাশ ইন-আউট আর দিন বন্ধ করা — সব এক জায়গায়।', en: 'BinGi’s Cashbox keeps the opening float, cash in and out, and closing the day in one place.' } },
    ],
  },
  {
    slug: 'walk-in-check-in-checklist', date: '2026-11-19',
    cover: { src: '/media/hms/checkin.webp', alt: { bn: 'BinGi HMS-এর চেক-ইন', en: 'Check-in in BinGi HMS' } },
    tag: { bn: 'ফ্রন্ট ডেস্ক', en: 'Front desk' },
    title: { bn: 'ওয়াক-ইন গেস্টের চেক-ইন: রিসেপশনের চেকলিস্ট', en: 'Walk-in check-in: a reception checklist' },
    summary: { bn: 'হঠাৎ আসা গেস্টকেও দুই মিনিটে ঠিকঠাক চেক-ইন — কিছু বাদ না দিয়ে।', en: 'Check in a guest who just walks in, properly, in two minutes — without missing a step.' },
    body: [
      { p: { bn: 'ওয়াক-ইন গেস্ট সাধারণত তাড়াহুড়োয় থাকে, আর তখনই আইডি নেওয়া বা টাকার হিসাব বাদ পড়ে যায়। একটা ছোট চেকলিস্ট রিসেপশনের সবাইকে একই কাজ একইভাবে করতে সাহায্য করে।', en: 'Walk-in guests are often in a hurry, and that is when the ID or the payment gets skipped. A short checklist helps everyone at reception do it the same way.' } },
      { h: { bn: 'চেকলিস্ট', en: 'The checklist' } },
      { list: [
        { bn: 'আগে দেখুন কোন রুম আজ রাতে খালি আর পরিষ্কার।', en: 'First check which rooms are free tonight and clean.' },
        { bn: 'কয় রাত থাকবে আর কতজন, জেনে নিন।', en: 'Ask how many nights and how many guests.' },
        { bn: 'দাম বলুন — ট্যাক্স আর সার্ভিস চার্জসহ মোট টাকা।', en: 'Tell the price — the total with taxes and service charge.' },
        { bn: 'নাম আর ফোন নম্বর তুলুন; আগের গেস্ট হলে আগের তথ্য মিলিয়ে নিন।', en: 'Take the name and phone; for a returning guest, check the saved details.' },
        { bn: 'আইডি (NID বা পাসপোর্ট) দেখে নম্বর তুলুন।', en: 'Look at the ID (NID or passport) and record the number.' },
        { bn: 'অগ্রিম নিলে কত টাকা আর কীভাবে (ক্যাশ, bKash), সাথে সাথে লিখুন।', en: 'If you take an advance, record how much and how (cash, bKash) right away.' },
        { bn: 'চাবি দিন, আর চেক-আউটের সময়টা বলে দিন।', en: 'Hand over the key and tell the check-out time.' },
      ] },
      { p: { bn: 'BinGi-তে রিসেপশনে নেওয়া ওয়াক-ইন বুকিং একই ক্যালেন্ডারে ওঠে, আর এতে কোনো বুকিং ফি নেই।', en: 'In BinGi, walk-ins taken at reception go on the same calendar, and they carry no booking fee.' } },
    ],
  },
  {
    slug: 'one-calendar-no-double-bookings', date: '2026-11-10',
    cover: { src: '/media/hms/calendar.webp', alt: { bn: 'BinGi HMS-এর বুকিং ক্যালেন্ডার', en: 'The BinGi HMS booking calendar' } },
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
    cover: { src: '/media/hms/housekeeping.webp', alt: { bn: 'BinGi HMS-এর হাউসকিপিং টাস্ক', en: 'Housekeeping tasks in BinGi HMS' } },
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
    cover: { src: '/media/hms/bentoWebsite.webp', alt: { bn: 'BinGi HMS-এর ওয়েবসাইট ম্যানেজমেন্ট', en: 'Website Management in BinGi HMS' } },
    tag: { bn: 'গ্রোথ', en: 'Growth' },
    title: { bn: 'সরাসরি বুকিং বাড়ানোর 6টা সহজ উপায়', en: '6 simple ways to get more direct bookings' },
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
])

export const readMinutes = (p: Post, lang: 'bn' | 'en') => {
  const words = p.body.flatMap((b) => ('p' in b ? [b.p[lang]] : 'h' in b ? [b.h[lang]] : b.list.map((x) => x[lang]))).join(' ').split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
