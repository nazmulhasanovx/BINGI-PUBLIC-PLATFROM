import type { L } from '../i18n/lang'

// ONE status registry. Change a value here and every chip on the site updates.
// live = in production · beta = limited test (BinGi AI local beta) · soon = Coming Soon · confirm = not verified yet (do not ship as "live")
export type Status = 'live' | 'beta' | 'soon' | 'confirm'

export type Module = { id: string; status: Status; icon: string; name: L; desc: L }

export const modules: Module[] = [
  { id: 'bookings', status: 'live', icon: 'CalendarDays', name: { bn: 'বুকিং ও ক্যালেন্ডার', en: 'Bookings & Calendar' }, desc: { bn: 'সব বুকিং এক ক্যালেন্ডারে, ডাবল বুকিং আটকায়', en: 'Every booking on one calendar, no double booking' } },
  { id: 'rooms', status: 'live', icon: 'BedDouble', name: { bn: 'রুম', en: 'Rooms' }, desc: { bn: 'রুম টাইপ, ক্যাটাগরি, দাম ও অবস্থা', en: 'Room types, categories, rates and status' } },
  { id: 'housekeeping', status: 'live', icon: 'Sparkles', name: { bn: 'হাউসকিপিং', en: 'Housekeeping' }, desc: { bn: 'চেকআউটের পর নিজে থেকেই ক্লিনিং টাস্ক', en: 'Cleaning task created on every checkout' } },
  { id: 'guests', status: 'live', icon: 'MessagesSquare', name: { bn: 'গেস্ট ও চ্যাট', en: 'Guests & Chat' }, desc: { bn: 'গেস্ট হিস্ট্রি, রিভিউ ও রিয়েল-টাইম চ্যাট', en: 'Guest history, reviews and real-time chat' } },
  { id: 'restaurant', status: 'live', icon: 'UtensilsCrossed', name: { bn: 'রেস্টুরেন্ট ও বার', en: 'Restaurant & Bar' }, desc: { bn: 'মেনু, POS, কিচেন — রুম বিলে যোগ হয়', en: 'Menu, POS and kitchen, posted to the room bill' } },
  { id: 'hrm', status: 'live', icon: 'Users', name: { bn: 'স্টাফ ও HRM', en: 'Staff & HRM' }, desc: { bn: 'স্টাফ, হাজিরা, শিফট, ছুটি ও বেতন', en: 'Staff, attendance, shifts, leave and payroll' } },
  { id: 'inventory', status: 'live', icon: 'Boxes', name: { bn: 'ইনভেন্টরি', en: 'Inventory' }, desc: { bn: 'স্টক ইন-আউট ও কম স্টকের সতর্কতা', en: 'Stock in/out and low-stock alerts' } },
  { id: 'finance', status: 'live', icon: 'Wallet', name: { bn: 'অ্যাকাউন্টস ও ক্যাশবক্স', en: 'Accounts & Cashbox' }, desc: { bn: 'পেমেন্ট, খরচ, ক্যাশ ও রিপোর্ট', en: 'Payments, expenses, cash and reports' } },
  { id: 'website', status: 'live', icon: 'Globe', name: { bn: 'ওয়েবসাইট ও বুকিং ইঞ্জিন', en: 'Website & Booking engine' }, desc: { bn: 'নিজের ওয়েবসাইট থেকে সরাসরি বুকিং', en: 'Direct bookings from your own website' } },
  { id: 'reports', status: 'live', icon: 'BarChart3', name: { bn: 'রিপোর্ট', en: 'Reports' }, desc: { bn: 'অকুপেন্সি, আয় ও অপারেশন রিপোর্ট', en: 'Occupancy, revenue and operations reports' } },
  { id: 'communication', status: 'live', icon: 'Send', name: { bn: 'কমিউনিকেশন', en: 'Communication' }, desc: { bn: 'গেস্টকে SMS ও ইমেইল', en: 'SMS and email to guests' } },
  { id: 'ota', status: 'soon', icon: 'Network', name: { bn: 'চ্যানেল ম্যানেজার (OTA)', en: 'Channel Manager (OTA)' }, desc: { bn: 'Booking.com, Agoda সহ OTA সংযোগ', en: 'Connect Booking.com, Agoda and more' } },
  { id: 'payments', status: 'soon', icon: 'CreditCard', name: { bn: 'BinGi Payments', en: 'BinGi Payments' }, desc: { bn: 'অনলাইন পেমেন্ট সরাসরি BinGi দিয়ে', en: 'Online payments through BinGi' } },
  { id: 'api', status: 'soon', icon: 'Code2', name: { bn: 'ডেভেলপার API', en: 'Developer API' }, desc: { bn: 'নিজের সিস্টেম BinGi-এর সাথে যুক্ত করুন', en: 'Connect your own systems to BinGi' } },
  { id: 'ai', status: 'beta', icon: 'Bot', name: { bn: 'BinGi AI', en: 'BinGi AI' }, desc: { bn: 'হোটেলের জন্য AI সহকারী — বেটা, নিজের কম্পিউটারে', en: 'An AI assistant for your hotel — beta, on your own computer' } },
]

// Platforms. Mobile app store status is NOT verified yet → 'confirm'.
export const platformStatus: Record<'web' | 'mobile' | 'guest', Status> = {
  web: 'live',
  mobile: 'confirm',
  guest: 'confirm',
}
