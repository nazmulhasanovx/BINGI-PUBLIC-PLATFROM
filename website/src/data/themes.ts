import type { L } from '../i18n/lang'
import type { PlanId } from './pricing'

// Hotel website themes. Source: BINGI-WEB-theme- repo + claude/design/Hotel_Website_Themes_Status (10 Nov 2026).
// Screens are the repo's own preview images (public/themes/*.jpg) of FICTIONAL demo hotels with demo photos.
// Status: front-end built and tested; HMS API wiring is the next stage → shown as "in final testing", not live.
export type Theme = { id: string; name: string; plan: PlanId; for: L }

export const themes: Theme[] = [
  { id: 'nest', name: 'NEST', plan: 'starter', for: { bn: 'গেস্ট হাউস, হোম ও ছোট হোটেল', en: 'Guest houses, homes and small hotels' } },
  { id: 'cottage', name: 'COTTAGE', plan: 'starter', for: { bn: 'কটেজ, ইকো-লজ, পাহাড় ও গ্রামের থাকা', en: 'Cottages, eco-lodges, hill and village stays' } },
  { id: 'bunk', name: 'BUNK', plan: 'starter', for: { bn: 'হোস্টেল (প্রতি বেড দাম)', en: 'Hostels, priced per bed' } },
  { id: 'city', name: 'CITY', plan: 'business', for: { bn: 'সিটি ও বিজনেস হোটেল', en: 'City and business hotels' } },
  { id: 'villa', name: 'VILLA', plan: 'business', for: { bn: 'প্রাইভেট ও পুল ভিলা', en: 'Private and pool villas' } },
  { id: 'flat', name: 'FLAT', plan: 'business', for: { bn: 'ফ্ল্যাট, সার্ভিসড অ্যাপার্টমেন্ট, লং স্টে', en: 'Flats, serviced apartments, long stays' } },
  { id: 'escape', name: 'ESCAPE', plan: 'business', for: { bn: 'সমুদ্র, দ্বীপ ও প্রকৃতির রিসোর্ট', en: 'Beach, island and nature resorts' } },
  { id: 'grand', name: 'GRAND', plan: 'ultra', for: { bn: 'লাক্সারি রিসোর্ট ও প্রিমিয়াম হোটেল', en: 'Luxury resorts and premium hotels' } },
]

// Theme Store (paid add-on themes). Source: BINGI-WEB-theme- src/themes/paid.ts (11 Nov 2026).
// Status: designed + front-end prototype with fictional demo hotels; licences/billing not built; prices NOT set → "Coming soon".
export type StoreTheme = { id: string; name: string; collection: 'luxury' | 'signature' | 'more'; for: L }
export const storeThemes: StoreTheme[] = [
  { id: 'isle', name: 'ISLE', collection: 'luxury', for: { bn: 'দ্বীপ ও ওভারওয়াটার ভিলা রিসোর্ট', en: 'Island and overwater villa resorts' } },
  { id: 'zamindar', name: 'ZAMINDAR', collection: 'luxury', for: { bn: 'হেরিটেজ প্রাসাদ ও রাজবাড়ি', en: 'Heritage palaces and rajbaris' } },
  { id: 'maison', name: 'MAISON', collection: 'luxury', for: { bn: 'ক্লাসিক গ্র্যান্ড সিটি হোটেল', en: 'Classic grand city hotels' } },
  { id: 'noir', name: 'NOIR', collection: 'luxury', for: { bn: 'রুফটপ ও নাইটলাইফ হোটেল', en: 'Rooftop and night-life hotels' } },
  { id: 'orbit', name: 'ORBIT', collection: 'luxury', for: { bn: 'স্কাই টাওয়ার হোটেল', en: 'Sky-tower hotels' } },
  { id: 'haven', name: 'HAVEN', collection: 'luxury', for: { bn: 'ওয়েলনেস ও স্পা রিট্রিট', en: 'Wellness and spa retreats' } },
  { id: 'summit', name: 'SUMMIT', collection: 'luxury', for: { bn: 'পাহাড়ি লজ ও রিসোর্ট', en: 'Hill and mountain lodges' } },
  { id: 'canopy', name: 'CANOPY', collection: 'luxury', for: { bn: 'ট্রিহাউস ও বনের রিট্রিট', en: 'Treehouses and forest retreats' } },
  { id: 'drift', name: 'DRIFT', collection: 'luxury', for: { bn: 'লাক্সারি হাউসবোট', en: 'Luxury houseboats' } },
  { id: 'estate', name: 'ESTATE', collection: 'luxury', for: { bn: 'প্রাইভেট ভিলা এস্টেট', en: 'Private villa estates' } },
  { id: 'aurel', name: 'AUREL', collection: 'signature', for: { bn: 'আধুনিক সিটি হোটেল', en: 'Contemporary city hotels' } },
  { id: 'courtyard', name: 'COURTYARD', collection: 'signature', for: { bn: 'বুটিক ও হেরিটেজ টাউনহাউস', en: 'Boutique and heritage townhouses' } },
  { id: 'axis', name: 'AXIS', collection: 'signature', for: { bn: 'বিজনেস হোটেল', en: 'Business hotels' } },
  { id: 'waypoint', name: 'WAYPOINT', collection: 'signature', for: { bn: 'হাইওয়ে ইন ও মোটেল', en: 'Highway inns and motels' } },
  { id: 'shanti', name: 'SHANTI', collection: 'signature', for: { bn: 'গেস্ট হাউস', en: 'Guest houses' } },
  { id: 'reside', name: 'RESIDE', collection: 'signature', for: { bn: 'সার্ভিসড অ্যাপার্টমেন্ট', en: 'Serviced apartments' } },
  { id: 'commons', name: 'COMMONS', collection: 'signature', for: { bn: 'সোশ্যাল হোস্টেল', en: 'Social hostels' } },
  { id: 'roots', name: 'ROOTS', collection: 'signature', for: { bn: 'হোমস্টে', en: 'Homestays' } },
  { id: 'morning', name: 'MORNING', collection: 'signature', for: { bn: 'বেড অ্যান্ড ব্রেকফাস্ট', en: 'Bed & breakfasts' } },
  { id: 'matir', name: 'MATIR', collection: 'signature', for: { bn: 'ফার্ম স্টে', en: 'Farm stays' } },
  { id: 'pod', name: 'POD', collection: 'more', for: { bn: 'ক্যাপসুল হোটেল', en: 'Capsule hotels' } },
]

// Which plan unlocks which themes (Starter = 3 · Business = 7 · Ultra / Custom = all 8).
export const themesFor = (plan: PlanId) =>
  themes.filter((t) => plan === 'ultra' || plan === 'custom' || (plan === 'business' ? t.plan !== 'ultra' : t.plan === 'starter'))
