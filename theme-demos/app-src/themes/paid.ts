// Theme Store catalog — paid aesthetic/3D themes (plan: claude/design/Paid_Themes_Plan_v2.md).
// Included themes come with the subscription; these are bought per property as a monthly add-on.
// Prices are NOT decided: they come from Super Admin versioned pricing (null = not set yet).
import type { Hotel, MasterTheme, PaidTheme, PropertyType } from "@/lib/types";
import { PLAN_RULES } from "@/lib/data";

export type Tier = "A" | "B" | "C" | "L" | "S";
export const TIER: Record<Tier, { name: string; desc: string }> = {
  A: { name: "Aesthetic", desc: "Depth cards and 3D photo" },
  B: { name: "Living", desc: "+ live backgrounds (water, light, sky)" },
  C: { name: "Immersive", desc: "+ interactive 3D built from your own data" },
  L: { name: "Luxury", desc: "Editorial design for 5★–7★ hotels and resorts" },
  S: { name: "Signature", desc: "A complete look for one property type" },
};
/** Monthly price per property, from Super Admin pricing. null until BinGi sets it. */
export const TIER_PRICE: Record<Tier, number | null> = { A: null, B: null, C: null, L: null, S: null };

export type Motion = "calm" | "lively" | "immersive";
export const MOTION_LABEL: Record<Motion, { name: string; desc: string }> = {
  calm: { name: "Calm", desc: "No moving effects. Fastest." },
  lively: { name: "Lively", desc: "Soft depth and gentle motion." },
  immersive: { name: "Immersive 3D", desc: "Full 3D effects on capable devices." },
};

export type StoreTheme = {
  id: PaidTheme | string;
  name: string;
  tier: Tier;
  status: "available" | "coming-soon";
  tagline: string;
  description: string;
  bestFor: string;
  propertyTypes: PropertyType[];
  fx: string[];
  /** Highest motion level the theme offers. */
  maxMotion: Motion;
  /** Needed plan (only ATLAS: multi-property data). */
  minPlan?: Hotel["plan"];
  /** Included theme the site returns to if the licence ends and the hotel had no included theme chosen. */
  fallback?: MasterTheme;
  demo?: string;
  /** Luxury Collection (5★–7★). */
  collection?: "luxury" | "signature";
};

export const STORE: StoreTheme[] = [
  // ---- Luxury Collection (5★–7★) · plan: claude/design/Luxury_Collection_10_Themes_Plan_2026-11-10.md ----
  { id: "isle", name: "ISLE", tier: "L", collection: "luxury", status: "available", tagline: "Villas on the lagoon", description: "For island and overwater villa resorts: guests scroll through a real-time 3D island built from your own villas — from the speedboat arrival to sunset — then compare villas, read the tide clock and explore an island map.", bestFor: "Island resorts, overwater and beach villas", propertyTypes: ["resort", "villa"], fx: ["Real-time 3D island built from your villas", "Scroll voyage, morning to sunset", "Tide clock"], maxMotion: "immersive", fallback: "escape", demo: "nila-island" },
  { id: "zamindar", name: "ZAMINDAR", tier: "L", collection: "luxury", status: "available", tagline: "A house with a story", description: "For heritage palaces and rajbaris: ivory and antique gold, the house told chapter by chapter, suites with their history.", bestFor: "Heritage hotels, palaces, rajbaris", propertyTypes: ["hotel", "guest-house", "resort"], fx: ["Story timeline", "Heritage typography"], maxMotion: "calm", fallback: "city", demo: "shonali-rajbari" },
  { id: "maison", name: "MAISON", tier: "L", collection: "luxury", status: "available", tagline: "Grand hotel, classic manners", description: "For grand city hotels: cream and black, Didone headlines, centred symmetry and numbered suites like a printed brochure.", bestFor: "Grand city hotels, classic 5★", propertyTypes: ["hotel"], fx: ["Numbered suites", "Didone typography"], maxMotion: "calm", fallback: "city", demo: "maison-gulshan" },
  { id: "noir", name: "NOIR", tier: "L", collection: "luxury", status: "available", tagline: "After dark", description: "For rooftop and night-life luxury hotels: a black and champagne site, a slow light sweep and the evening told hour by hour.", bestFor: "Rooftop hotels, bars, night luxury", propertyTypes: ["hotel"], fx: ["Dark luxury", "Light sweep", "After-dark timeline"], maxMotion: "calm", fallback: "city", demo: "obsidian-gulshan" },
  { id: "orbit", name: "ORBIT", tier: "L", collection: "luxury", status: "available", tagline: "Above the city", description: "For sky towers and 6–7★ vertical hotels: midnight navy, thin type and an altitude rail that lists rooms from the highest floor down.", bestFor: "Sky towers, city landmark hotels", propertyTypes: ["hotel", "serviced-apartment"], fx: ["Altitude rail", "Midnight palette"], maxMotion: "calm", fallback: "city", demo: "altura" },
  { id: "haven", name: "HAVEN", tier: "L", collection: "luxury", status: "available", tagline: "Breathe slower", description: "For wellness and spa retreats: sage and sand, soft shapes, a breathing circle and the day's rituals with times and prices.", bestFor: "Wellness retreats, spa resorts, yoga stays", propertyTypes: ["resort", "villa"], fx: ["Breathing circle", "Rituals of the day"], maxMotion: "calm", fallback: "escape", demo: "haven-lalakhal" },
  { id: "summit", name: "SUMMIT", tier: "L", collection: "luxury", status: "available", tagline: "Above the clouds", description: "For hill and mountain lodges: layered ridges over your photo, lodges with their altitude and the evening by the fire.", bestFor: "Hill resorts, mountain lodges, chalets", propertyTypes: ["resort", "cottage"], fx: ["Layered ridges", "Fireside evenings"], maxMotion: "calm", fallback: "cottage", demo: "meghchura" },
  { id: "canopy", name: "CANOPY", tier: "L", collection: "luxury", status: "available", tagline: "Living in the canopy", description: "For rainforest and treehouse retreats: deep green and brass, treehouses on a height scale and the forest by day and night.", bestFor: "Treehouses, rainforest lodges, eco-luxury", propertyTypes: ["cottage", "other", "resort"], fx: ["Height scale", "Forest typography"], maxMotion: "calm", fallback: "cottage", demo: "canopy-nest" },
  { id: "drift", name: "DRIFT", tier: "L", collection: "luxury", status: "available", tagline: "A voyage, slowly", description: "For luxury houseboats and river cruises: ivory and river navy, cabins like a ship's plan and the voyage drawn as a river line.", bestFor: "Luxury houseboats, river cruises", propertyTypes: ["other", "resort", "villa"], fx: ["Voyage line", "Cabin plan"], maxMotion: "calm", fallback: "escape", demo: "haor-bilash" },
  { id: "estate", name: "ESTATE", tier: "L", collection: "luxury", status: "available", tagline: "The whole place is yours", description: "For private villa estates and exclusive-use houses: stone and olive, the estate at a glance (sleeps, bedrooms, staff) and villas as large rows.", bestFor: "Private estates, exclusive-use villas", propertyTypes: ["villa", "home", "resort"], fx: ["Whole-estate panel", "Butler services"], maxMotion: "calm", fallback: "villa", demo: "bonolota-estate" },
  // ---- Signature Collection (property types) · plan: claude/design/Signature_Collection_and_Theme_Audit_Plan_2026-11-10.md ----
  { id: "aurel", name: "AUREL", tier: "S", collection: "signature", status: "available", tagline: "The city. Your sanctuary.", description: "For contemporary city hotels: condensed headlines, a real 3D floor cutaway (lobby → suites → rooftop), rooms, a dark dining band and the city at your door.", bestFor: "City hotels, urban 4–5★", propertyTypes: ["hotel"], fx: [], maxMotion: "immersive", fallback: "city", demo: "aurel-banani" },
  { id: "courtyard", name: "COURTYARD", tier: "S", collection: "signature", status: "available", tagline: "Stay somewhere with soul.", description: "For boutique and heritage townhouses: a numbered story, arched suites, courtyard dining and local culture.", bestFor: "Boutique hotels, townhouses", propertyTypes: ["hotel"], fx: [], maxMotion: "calm", fallback: "city", demo: "the-courtyard" },
  { id: "axis", name: "AXIS", tier: "S", collection: "signature", status: "available", tagline: "Make room for your next move.", description: "For business hotels: a 3D suite that shows work, rest and recharge, meeting rooms with an enquiry page and city access.", bestFor: "Business hotels, corporate stays", propertyTypes: ["hotel"], fx: [], maxMotion: "immersive", fallback: "city", demo: "axis-gulshan" },
  { id: "waypoint", name: "WAYPOINT", tier: "S", collection: "signature", status: "available", tagline: "Good roads. Great rest.", description: "For highway inns and motels: the road-trip flow (rest, refuel, explore), easy parking and 24-hour check-in up front.", bestFor: "Motels, highway inns, transit stays", propertyTypes: ["hotel"], fx: [], maxMotion: "calm", fallback: "city", demo: "waypoint-inn" },
  { id: "shanti", name: "SHANTI", tier: "S", collection: "signature", status: "available", tagline: "A slower, warmer kind of stay.", description: "For guest houses: soft shapes, handwritten accents, the host, home breakfast and the garden.", bestFor: "Guest houses, small B&Bs", propertyTypes: ["guest-house"], fx: [], maxMotion: "calm", fallback: "nest", demo: "shanti-guest-house" },
  { id: "reside", name: "RESIDE", tier: "S", collection: "signature", status: "available", tagline: "Space to settle in.", description: "For serviced apartments: nightly or monthly, a 3D apartment plan (live, cook, rest, work), included services and the neighbourhood.", bestFor: "Serviced apartments, long stays", propertyTypes: ["serviced-apartment"], fx: [], maxMotion: "immersive", fallback: "flat", demo: "haven-residences" },
  { id: "commons", name: "COMMONS", tier: "S", collection: "signature", status: "available", tagline: "Come for a bed. Stay for the people.", description: "For social hostels: loud type, stickers, beds vs private rooms, social spaces and this week's events.", bestFor: "Hostels, social stays", propertyTypes: ["hostel"], fx: [], maxMotion: "calm", fallback: "bunk", demo: "common-ground" },
  { id: "roots", name: "ROOTS", tier: "S", collection: "signature", status: "available", tagline: "A new place. A familiar feeling.", description: "For homestays: torn-paper warmth, the hosts, home-cooked food and village life, Bangla first.", bestFor: "Homestays, host families", propertyTypes: ["home"], fx: [], maxMotion: "calm", fallback: "nest", demo: "roots-homestay" },
  { id: "morning", name: "MORNING", tier: "S", collection: "signature", status: "available", tagline: "Stay for the night. Love the morning.", description: "For bed & breakfasts: sunny type, breakfast up front with its own page, three rooms and the neighbourhood.", bestFor: "B&Bs, small inns", propertyTypes: ["guest-house"], fx: [], maxMotion: "calm", fallback: "nest", demo: "morning-house" },
  { id: "matir", name: "MATIR", tier: "S", collection: "signature", status: "available", tagline: "Let the countryside wake you.", description: "For farm stays: a 3D farm diorama, cottages, field-to-table food and hands-on rural life.", bestFor: "Farm stays, eco cottages", propertyTypes: ["cottage", "resort"], fx: [], maxMotion: "immersive", fallback: "cottage", demo: "matir-farm" },
  // ---- other paid themes ----
  { id: "pod", name: "POD", tier: "B", status: "available", tagline: "Sleep in the future", description: "For capsule hotels and pod hostels: a glowing capsule wall built from your real bed data, so guests see pod types, levels and prices at a glance.", bestFor: "Capsule hotels, pod hostels, transit stays", propertyTypes: ["hostel", "other"], fx: ["Capsule wall from your beds", "Neon light field", "Depth cards"], maxMotion: "immersive", fallback: "bunk", demo: "skypod" },
  { id: "starcamp", name: "STARCAMP", tier: "A", status: "coming-soon", tagline: "Nights under the stars", description: "Glamping and camping with a live night sky and a day/night switch.", bestFor: "Glamping, tents, camps", propertyTypes: ["other", "cottage"], fx: ["Starfield", "Day / night"], maxMotion: "lively" },
  { id: "uthan", name: "UTHAN", tier: "A", status: "coming-soon", tagline: "Home in the village", description: "Village homestays with a hand-drawn 2.5D village and the host's story, Bangla first.", bestFor: "Village homestays, host families", propertyTypes: ["home", "guest-house"], fx: ["Illustrated parallax"], maxMotion: "lively" },
  { id: "prism", name: "PRISM", tier: "A", status: "coming-soon", tagline: "Light and glass", description: "Boutique and design hotels with glass layers and refracted light.", bestFor: "Boutique and design hotels", propertyTypes: ["hotel"], fx: ["Glass cards", "Light refraction"], maxMotion: "lively" },
  { id: "atlas", name: "ATLAS", tier: "C", status: "coming-soon", tagline: "All your properties", description: "Hotel groups: a 3D map of Bangladesh with every property you run.", bestFor: "Hotel groups and chains", propertyTypes: ["hotel", "resort"], fx: ["3D map from your properties"], maxMotion: "immersive", minPlan: "enterprise" },
];

export const LUX_IDS: PaidTheme[] = ["isle", "zamindar", "maison", "noir", "orbit", "haven", "summit", "canopy", "drift", "estate"];
export const SIG_IDS: PaidTheme[] = ["aurel", "courtyard", "axis", "waypoint", "shanti", "reside", "commons", "roots", "morning", "matir"];
export const PAID_IDS: PaidTheme[] = [...LUX_IDS, ...SIG_IDS, "pod"];
export const isPaid = (m: string): m is PaidTheme => (PAID_IDS as string[]).includes(m);
export const storeTheme = (id: string) => STORE.find((t) => t.id === id);

/** Motion levels a theme allows (paid themes only; included themes stay calm). */
export function motionLevels(m: string): Motion[] {
  const t = storeTheme(m);
  if (!t) return ["calm"];
  return t.maxMotion === "immersive" ? ["calm", "lively", "immersive"] : t.maxMotion === "lively" ? ["calm", "lively"] : ["calm"];
}

/** Included theme the site shows when a paid licence is not active. */
export function fallbackMaster(h: Hotel): MasterTheme {
  const allowed = PLAN_RULES[h.plan].masters as readonly MasterTheme[];
  if (!isPaid(h.theme.master) && allowed.includes(h.theme.master)) return h.theme.master;
  const f = storeTheme(h.theme.master)?.fallback;
  return f && allowed.includes(f) ? f : allowed[0];
}
