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

// Theme Store (paid add-on themes): prototype only, prices not set → Coming soon.
export const storeThemes: { id: string; name: string; for: L }[] = [
  { id: 'drift', name: 'DRIFT', for: { bn: 'হাউসবোট', en: 'Houseboats' } },
  { id: 'canopy', name: 'CANOPY', for: { bn: 'ট্রিহাউস', en: 'Treehouses' } },
  { id: 'pod', name: 'POD', for: { bn: 'ক্যাপসুল হোটেল', en: 'Capsule hotels' } },
  { id: 'orbit', name: 'ORBIT', for: { bn: 'উঁচু ভবনের হোটেল ও অ্যাপার্টমেন্ট', en: 'High-rise hotels and apartments' } },
]

// Which plan unlocks which themes (Starter = 3 · Business = 7 · Ultra / Custom = all 8).
export const themesFor = (plan: PlanId) =>
  themes.filter((t) => plan === 'ultra' || plan === 'custom' || (plan === 'business' ? t.plan !== 'ultra' : t.plan === 'starter'))
