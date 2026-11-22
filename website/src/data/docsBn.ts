import type { L } from '../i18n/lang'

// Bangla labels for the docs navigation. The articles themselves are written in English for now.
export const groupL: Record<string, L> = {
  'Start here': { bn: 'শুরু এখানে', en: 'Start here' },
  Platform: { bn: 'প্ল্যাটফর্ম', en: 'Platform' },
  Modules: { bn: 'মডিউল', en: 'Modules' },
  Account: { bn: 'অ্যাকাউন্ট', en: 'Account' },
  Help: { bn: 'সাহায্য', en: 'Help' },
}
const titleBn: Record<string, string> = {
  'fix-with-ai': 'AI দিয়ে সমস্যা সমাধান', overview: 'BinGi কী', 'getting-started': 'শুরু করুন',
  ecosystem: 'BinGi ইকোসিস্টেম', 'how-it-works': 'মডিউলগুলো যেভাবে যুক্ত', 'bingi-ai': 'BinGi AI', navigation: 'HMS-এ পথ চেনা',
  dashboard: 'ড্যাশবোর্ড', bookings: 'বুকিং', rooms: 'রুম', housekeeping: 'হাউসকিপিং', 'guests-chat': 'গেস্ট ও চ্যাট',
  meals: 'মিলস — রেস্টুরেন্ট ও বার', staff: 'স্টাফ (HRM)', inventory: 'ইনভেন্টরি', 'other-services': 'অন্যান্য সার্ভিস',
  'discounts-rates': 'ডিসকাউন্ট ও রেট', payments: 'পেমেন্ট', cashbox: 'ক্যাশবক্স', expenses: 'অপারেশনস (খরচ)', finance: 'ফিন্যান্স',
  reports: 'রিপোর্ট', communication: 'কমিউনিকেশন সেন্টার', website: 'ওয়েবসাইট ম্যানেজমেন্ট', settings: 'সেটিংস',
  'plans-billing': 'প্ল্যান, দাম ও বিল', troubleshooting: 'সমস্যা খোঁজার চেকলিস্ট', faq: 'সাধারণ প্রশ্ন', glossary: 'শব্দকোষ', support: 'সাপোর্টে যোগাযোগ',
}
export const docTitle = (d: { slug: string; title: string }): L => ({ bn: titleBn[d.slug] ?? d.title, en: d.title })
export const groupLabel = (g: string): L => groupL[g] ?? { bn: g, en: g }
