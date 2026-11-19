// Theme Manifest — every master theme describes itself here.
// HMS → Website Management builds its forms, toggles, section list and plan locks from this.
// A new theme = a new Home component + a new manifest entry. No new admin screens.
import type { Hotel, MasterTheme, PropertyType } from "@/lib/types";

export type Plan = Hotel["plan"];
export const PLAN_ORDER: Plan[] = ["starter", "business", "ultra", "enterprise"];
export const PLAN_LABEL: Record<Plan, string> = { starter: "Starter", business: "Business", ultra: "Ultra", enterprise: "Enterprise" };

export type FieldDef = {
  key: string; // stored as `<sectionId>.<key>` in the site record
  label: string;
  type: "text" | "textarea";
  max?: number;
  /** Where the default comes from when the hotel hasn't typed anything. */
  fallback?: (h: Hotel) => string;
  hint?: string;
};

export type DataSource = "rooms" | "reviews" | "offers" | "services" | "facilities" | "nearby" | "host" | "gallery" | "outlets" | "contact";

export type SectionDef = {
  id: string;
  name: string;
  description: string;
  required?: boolean; // cannot be hidden or moved (hero)
  source?: DataSource; // reads HMS data; the admin links to that module
  fields?: FieldDef[];
  /** Only for these property types (e.g. host = guest house / home). */
  propertyTypes?: PropertyType[];
  /** Only from this plan up (e.g. dining = Ultra). */
  minPlan?: Plan;
};

export type PageDef = { id: string; name: string; path: string; system: boolean; minPlan?: Plan; needs?: "dining" | "events" | "experiences" | "offers" };

export type ThemeManifest = {
  id: MasterTheme;
  name: string;
  version: string;
  tagline: string;
  description: string;
  minPlan: Plan;
  bestFor: PropertyType[];
  demo: string; // demo hotel slug, used for the preview
  defaultHeading: "sans" | "serif";
  features: { extras: boolean; promoCode: boolean; advance: boolean; diningPage: boolean; eventsPage: boolean };
  /** Paid themes are bought in the Theme Store (any plan); they are not unlocked by the plan. */
  paid?: boolean;
  pages: PageDef[];
  sections: SectionDef[];
};

const heroFields: FieldDef[] = [
  { key: "title", label: "Headline", type: "text", max: 70, fallback: (h) => h.tagline, hint: "One line guests read first." },
  { key: "intro", label: "Short intro", type: "textarea", max: 180, fallback: (h) => h.intro },
];

const commonPages: PageDef[] = [
  { id: "home", name: "Home", path: "/", system: true },
  { id: "rooms", name: "Rooms", path: "/rooms", system: true },
  { id: "experiences", name: "Experiences", path: "/experiences", system: false, needs: "experiences" },
  { id: "offers", name: "Offers", path: "/offers", system: false, needs: "offers" },
  { id: "explore", name: "Explore", path: "/explore", system: false },
  { id: "policies", name: "Policies", path: "/policies", system: true },
  { id: "my-trip", name: "My Trip", path: "/my-trip", system: true },
];

/* ---------- Luxury Collection (5★–7★): one section library, each theme picks its order ---------- */
const t = (fallback: string): FieldDef[] => [{ key: "title", label: "Section title", type: "text", max: 60, fallback: () => fallback }];
const LUX_SECTIONS: Record<string, SectionDef> = {
  hero: { id: "hero", name: "Hero", description: "Large photo, headline, intro and booking bar.", required: true, fields: heroFields },
  facts: { id: "facts", name: "Key facts", description: "Category, check-in/out and guest rating.", source: "facilities" },
  rooms: { id: "rooms", name: "Rooms & suites", description: "Every room or suite with photo and price.", source: "rooms", fields: t("Rooms & suites") },
  signature: { id: "signature", name: "Signature section", description: "The theme's own section (see theme description).", source: "rooms" },
  amenities: { id: "amenities", name: "Amenities", description: "Facilities with one large photo.", source: "facilities", fields: t("Every comfort, quietly done") },
  experiences: { id: "experiences", name: "Experiences", description: "Activities, spa and celebrations with photos.", source: "services", fields: t("Days worth remembering") },
  dining: { id: "dining", name: "Dining", description: "Restaurants and bars (or dining services).", source: "outlets", fields: t("At the table") },
  journey: { id: "journey", name: "The day here", description: "Timeline from Property Info › Day plan (hidden when empty).", source: "contact", fields: t("A day here") },
  story: { id: "story", name: "The story", description: "Heritage timeline (website field; hidden when empty).", source: "contact", fields: t("The house through time") },
  gallery: { id: "gallery", name: "Gallery", description: "Five photos from your gallery.", source: "gallery", fields: t("A closer look") },
  offers: { id: "offers", name: "Offers", description: "Direct-booking offers.", source: "offers", fields: t("Privileges for direct guests") },
  reviews: { id: "reviews", name: "Guest words", description: "One large quote plus three more (rating shows from 5 reviews).", source: "reviews" },
  arrival: { id: "arrival", name: "Arrival", description: "Address, travel times, transfer and directions.", source: "nearby" },
  faq: { id: "faq", name: "Good to know", description: "Questions from Property Info › FAQ (hidden when empty).", source: "contact", fields: t("Before you arrive") },
  reserve: { id: "reserve", name: "Reserve band", description: "Closing photo with Reserve, WhatsApp concierge and call.", source: "contact", fields: [{ key: "title", label: "Headline", type: "text", max: 60, fallback: () => "Your stay begins here" }] },
};
function lux(id: MasterTheme, name: string, tagline: string, description: string, bestFor: PropertyType[], demo: string, order: string[], signature: string, heading: "sans" | "serif" = "serif"): ThemeManifest {
  return {
    id, name, version: "2.0", tagline, description, minPlan: "starter", paid: true, bestFor, demo, defaultHeading: heading,
    features: { extras: true, promoCode: true, advance: true, diningPage: false, eventsPage: false },
    pages: commonPages,
    sections: order.map((s) => (s === "signature" ? { ...LUX_SECTIONS.signature, name: signature.split(":")[0], description: signature.split(":")[1]?.trim() ?? signature } : LUX_SECTIONS[s])),
  };
}

export const MANIFESTS: Record<MasterTheme, ThemeManifest> = {
  nest: {
    id: "nest",
    name: "NEST",
    version: "1.0",
    tagline: "Warm and personal",
    description: "One warm page for small hotels, guest houses and homes: rooms, the host and how to get there.",
    minPlan: "starter",
    bestFor: ["guest-house", "home", "hostel", "hotel"],
    demo: "tea-valley",
    defaultHeading: "serif",
    features: { extras: true, promoCode: true, advance: true, diningPage: false, eventsPage: false },
    pages: commonPages,
    sections: [
      { id: "hero", name: "Hero", description: "Headline, intro, booking bar and three photos.", required: true, fields: heroFields },
      { id: "rooms", name: "Rooms", description: "Every room with a Book button.", source: "rooms", fields: [{ key: "title", label: "Section title", type: "text", max: 50, fallback: (h) => (h.rooms.length > 1 ? `${h.rooms.length} rooms, each a little different` : "Your room") }] },
      { id: "host", name: "Your host", description: "Host name, note and a message button.", source: "host", propertyTypes: ["guest-house", "home"] },
      { id: "life", name: "Life here", description: "Facilities with one photo.", source: "facilities" },
      { id: "extras", name: "Add to your stay", description: "Meals, walks and pickup guests can add.", source: "services" },
      { id: "getting-here", name: "Getting here", description: "Address, directions and travel times.", source: "nearby" },
      { id: "reviews", name: "Reviews", description: "Guest reviews (rating shows from 5 reviews).", source: "reviews" },
      { id: "book-band", name: "Book your stay", description: "Closing band with rooms and phone.", source: "contact" },
    ],
  },
  city: {
    id: "city",
    name: "CITY",
    version: "2.0",
    tagline: "Clean and practical",
    description: "Editorial city and business hotel layout: wide hero, rooms, meetings and location.",
    minPlan: "business",
    bestFor: ["hotel", "serviced-apartment"],
    demo: "sea-pearl",
    defaultHeading: "sans",
    features: { extras: true, promoCode: true, advance: true, diningPage: false, eventsPage: false },
    pages: commonPages,
    sections: [
      { id: "hero", name: "Hero", description: "Headline, intro, wide photo and docked booking bar.", required: true, fields: heroFields },
      { id: "quick-links", name: "Quick links (phone)", description: "Rooms, experiences and offers tiles on phone." },
      { id: "facts", name: "Key facts", description: "Four facts in one row.", source: "facilities" },
      { id: "rooms", name: "Rooms", description: "Room cards with price per night.", source: "rooms", fields: [{ key: "title", label: "Section title", type: "text", max: 40, fallback: () => "Choose your room" }] },
      { id: "work-stay", name: "Work & unwind", description: "Meeting rooms and pool, two large photos.", source: "services" },
      { id: "location", name: "Location", description: "Travel times and directions.", source: "nearby" },
      { id: "offers", name: "Offers", description: "Direct-booking discounts.", source: "offers" },
      { id: "reviews", name: "Reviews", description: "Guest reviews (rating shows from 5 reviews).", source: "reviews" },
    ],
  },
  grand: {
    id: "grand",
    name: "GRAND",
    version: "1.0",
    tagline: "Luxury and cinematic",
    description: "Full-screen photos, dining, experiences and events for resorts and premium hotels.",
    minPlan: "ultra",
    bestFor: ["resort", "hotel"],
    demo: "azure-bay",
    defaultHeading: "sans",
    features: { extras: true, promoCode: true, advance: true, diningPage: true, eventsPage: true },
    pages: [
      ...commonPages.slice(0, 2),
      { id: "dining", name: "Dining", path: "/dining", system: false, minPlan: "ultra", needs: "dining" },
      ...commonPages.slice(2, 5),
      { id: "events", name: "Events", path: "/events", system: false, minPlan: "ultra", needs: "events" },
      ...commonPages.slice(5),
    ],
    sections: [
      { id: "hero", name: "Hero", description: "Full-screen photo with headline and booking bar.", required: true, fields: heroFields },
      { id: "quick-links", name: "Quick links (phone)", description: "Rooms, dining, experiences tiles on phone." },
      { id: "facts", name: "Key facts", description: "Check-in, check-out, cancellation, rating.", source: "facilities" },
      { id: "featured-stays", name: "Featured stays", description: "Featured rooms and villas.", source: "rooms" },
      { id: "dine-do", name: "Dine & do", description: "Restaurants and experiences.", source: "outlets", minPlan: "ultra" },
      { id: "offers", name: "Offers", description: "Direct-booking discounts.", source: "offers" },
      { id: "reviews", name: "Reviews", description: "Guest reviews (rating shows from 5 reviews).", source: "reviews" },
      { id: "location", name: "Location", description: "Map, address and directions.", source: "nearby" },
    ],
  },
  cottage: {
    id: "cottage",
    name: "COTTAGE",
    version: "1.0",
    tagline: "Earthy and slow",
    description: "For cottages, eco-lodges and hill or village stays: one big row per cottage, the day told hour by hour, clear directions.",
    minPlan: "starter",
    bestFor: ["cottage", "guest-house", "home", "resort"],
    demo: "mistwood",
    defaultHeading: "serif",
    features: { extras: true, promoCode: true, advance: true, diningPage: false, eventsPage: false },
    pages: commonPages,
    sections: [
      { id: "hero", name: "Hero", description: "Arched photo, headline, intro and booking bar.", required: true, fields: heroFields },
      { id: "cottages", name: "Cottages", description: "One large row per cottage with a Book button.", source: "rooms", fields: [{ key: "title", label: "Section title", type: "text", max: 60, fallback: () => "Each cottage has its own corner of the hill" }] },
      { id: "day", name: "A day here", description: "Morning to night, from meals, walks and the bonfire.", source: "services" },
      { id: "host", name: "Your host", description: "Host note and a message button.", source: "host" },
      { id: "getting-here", name: "Getting here", description: "Travel times, address and directions.", source: "nearby" },
      { id: "reviews", name: "Reviews", description: "Guest reviews (rating shows from 5 reviews).", source: "reviews" },
      { id: "book-band", name: "Book your stay", description: "Closing photo band with prices and phone.", source: "contact" },
    ],
  },
  villa: {
    id: "villa",
    name: "VILLA",
    version: "1.0",
    tagline: "Private and spacious",
    description: "For private villas and pool villas: whole-villa specs, a photo walk-through, what is included and house rules.",
    minPlan: "business",
    bestFor: ["villa", "home", "resort"],
    demo: "shalbon",
    defaultHeading: "serif",
    features: { extras: true, promoCode: true, advance: true, diningPage: false, eventsPage: false },
    pages: commonPages,
    sections: [
      { id: "hero", name: "Hero", description: "Full-width photo, headline and booking bar.", required: true, fields: heroFields },
      { id: "villas", name: "The villas", description: "Each villa with bedrooms, guests, size and pool.", source: "rooms", fields: [{ key: "title", label: "Section title", type: "text", max: 50, fallback: () => "Choose your villa" }] },
      { id: "inside", name: "Inside", description: "Photo walk-through of living, kitchen, bedrooms and pool.", source: "gallery" },
      { id: "included", name: "Included & on request", description: "Housekeeping, cook, BBQ and pickup.", source: "services" },
      { id: "rules", name: "House rules", description: "Check-in, deposit, guests and quiet hours.", source: "contact" },
      { id: "location", name: "Location", description: "Travel times and directions.", source: "nearby" },
      { id: "reviews", name: "Reviews", description: "Guest reviews (rating shows from 5 reviews).", source: "reviews" },
      { id: "enquire", name: "Events & long stays", description: "WhatsApp band for parties, shoots and long stays.", source: "contact" },
    ],
  },
  flat: {
    id: "flat",
    name: "FLAT",
    version: "1.0",
    tagline: "Practical long stays",
    description: "For flats and serviced apartments: nightly and monthly prices, long-stay codes, what each flat has and the neighbourhood.",
    minPlan: "business",
    bestFor: ["serviced-apartment", "home", "hotel"],
    demo: "lakeview",
    defaultHeading: "sans",
    features: { extras: true, promoCode: true, advance: true, diningPage: false, eventsPage: false },
    pages: commonPages,
    sections: [
      { id: "hero", name: "Hero", description: "Headline, nightly and monthly price, photo and booking bar.", required: true, fields: heroFields },
      { id: "apartments", name: "Apartments", description: "Each flat with size, bedrooms, kitchen and price per night / month.", source: "rooms", fields: [{ key: "title", label: "Section title", type: "text", max: 50, fallback: () => "Find your flat" }] },
      { id: "long-stay", name: "Long-stay prices", description: "Weekly and monthly codes from HMS discounts.", source: "offers" },
      { id: "amenities", name: "Every flat has", description: "Kitchen, Wi-Fi, washer, backup power and security.", source: "facilities" },
      { id: "neighbourhood", name: "Neighbourhood", description: "Walk and drive times.", source: "nearby" },
      { id: "reviews", name: "Reviews", description: "Guest reviews (rating shows from 5 reviews).", source: "reviews" },
      { id: "faq", name: "Questions", description: "Check-in, ID, utilities and cleaning.", source: "contact" },
    ],
  },
  escape: {
    id: "escape",
    name: "ESCAPE",
    version: "1.0",
    tagline: "Relaxed and sunny",
    description: "For beach, island and nature resorts on the Business plan: big photos, stays, things to do and how to get there.",
    minPlan: "business",
    bestFor: ["resort", "hotel", "cottage"],
    demo: "coral-cove",
    defaultHeading: "sans",
    features: { extras: true, promoCode: true, advance: true, diningPage: false, eventsPage: false },
    pages: commonPages,
    sections: [
      { id: "hero", name: "Hero", description: "Full-screen photo, headline and floating booking bar.", required: true, fields: heroFields },
      { id: "stays", name: "Stays", description: "Rooms and cottages in a swipe row.", source: "rooms", fields: [{ key: "title", label: "Section title", type: "text", max: 40, fallback: () => "Where you'll sleep" }] },
      { id: "days", name: "Your days", description: "Activities guests can add.", source: "services" },
      { id: "unwind", name: "Eat & unwind", description: "Meals, spa and the pool from facilities.", source: "facilities" },
      { id: "offers", name: "Offers", description: "Direct-booking discounts.", source: "offers" },
      { id: "getting-here", name: "Getting here", description: "Ferry, road and travel times.", source: "nearby" },
      { id: "reviews", name: "Reviews", description: "Guest reviews (rating shows from 5 reviews).", source: "reviews" },
    ],
  },
  bunk: {
    id: "bunk",
    name: "BUNK",
    version: "1.0",
    tagline: "Young and social",
    description: "For hostels and backpacker stays: price per bed, dorms and privates, hostel life and simple house rules.",
    minPlan: "starter",
    bestFor: ["hostel", "guest-house"],
    demo: "wave-bunk",
    defaultHeading: "sans",
    features: { extras: true, promoCode: true, advance: true, diningPage: false, eventsPage: false },
    pages: commonPages,
    sections: [
      { id: "hero", name: "Hero", description: "Big headline, bed price and photo collage.", required: true, fields: heroFields },
      { id: "beds", name: "Pick your bed", description: "Dorm beds and private rooms with price per bed.", source: "rooms", fields: [{ key: "title", label: "Section title", type: "text", max: 40, fallback: () => "Pick your bed" }] },
      { id: "life", name: "Hostel life", description: "Common areas, events and add-ons.", source: "facilities" },
      { id: "rules", name: "House rules", description: "Quiet hours, lockers, ID and age.", source: "contact" },
      { id: "getting-here", name: "Getting here", description: "Bus, beach and travel times.", source: "nearby" },
      { id: "reviews", name: "Reviews", description: "Guest reviews (rating shows from 5 reviews).", source: "reviews" },
    ],
  },
  pod: {
    id: "pod",
    name: "POD",
    version: "1.0",
    tagline: "Sleep in the future",
    description: "Paid theme for capsule hotels: neon light field and a capsule wall built from your real bed setup.",
    minPlan: "starter",
    paid: true,
    bestFor: ["hostel", "other"],
    demo: "skypod",
    defaultHeading: "sans",
    features: { extras: true, promoCode: true, advance: true, diningPage: false, eventsPage: false },
    pages: commonPages,
    sections: [
      { id: "hero", name: "Hero", description: "Neon field, capsule photo, pod price and booking bar.", required: true, fields: heroFields },
      { id: "wall", name: "Capsule wall", description: "Pods drawn from HMS › Rooms beds; pick a pod type.", source: "rooms", fields: [{ key: "title", label: "Section title", type: "text", max: 40, fallback: () => "Pick your pod type" }] },
      { id: "stays", name: "Pods and rooms", description: "Every stay type as a depth card.", source: "rooms" },
      { id: "facilities", name: "Inside", description: "Showers, lockers, lounge.", source: "facilities" },
      { id: "rules", name: "Good to know", description: "Check-in, house rules and questions.", source: "contact" },
      { id: "getting-here", name: "Getting here", description: "Airport and travel times.", source: "nearby" },
      { id: "reviews", name: "Reviews", description: "Guest reviews (rating shows from 5 reviews).", source: "reviews" },
    ],
  },
  isle: { ...lux("isle", "ISLE", "Villas on the lagoon", "Luxury Collection — island and overwater villa resorts.", ["resort", "villa"], "nila-island", ["hero", "facts", "signature", "journey", "experiences", "dining", "gallery", "reviews", "arrival", "reserve"], "Villa comparison: every villa side by side"), pages: [commonPages[0], { id: "rooms", name: "Villas", path: "/rooms", system: true }, { id: "island", name: "The Island", path: "/island", system: true }, ...commonPages.slice(2, 4), ...commonPages.slice(5)] },
  zamindar: lux("zamindar", "ZAMINDAR", "A house with a story", "Luxury Collection — heritage palaces and rajbaris.", ["hotel", "guest-house", "resort"], "shonali-rajbari", ["hero", "story", "rooms", "amenities", "dining", "experiences", "gallery", "reviews", "faq", "arrival", "reserve"], "The house through time: heritage timeline"),
  maison: lux("maison", "MAISON", "Grand hotel, classic manners", "Luxury Collection — grand classic city hotels.", ["hotel"], "maison-gulshan", ["hero", "facts", "rooms", "signature", "dining", "amenities", "offers", "reviews", "arrival", "reserve"], "Salons: the public rooms in a three-photo spread"),
  noir: lux("noir", "NOIR", "After dark", "Luxury Collection — rooftop and night luxury hotels.", ["hotel"], "obsidian-gulshan", ["hero", "rooms", "signature", "journey", "dining", "amenities", "gallery", "offers", "reviews", "arrival", "reserve"], "The rooftop: big night photo with venues and hours"),
  orbit: lux("orbit", "ORBIT", "Above the city", "Luxury Collection — sky towers and 6–7★ vertical hotels.", ["hotel", "serviced-apartment"], "altura", ["hero", "facts", "signature", "amenities", "experiences", "dining", "gallery", "offers", "reviews", "arrival", "reserve"], "Altitude rail: rooms from the highest floor down", "sans"),
  haven: lux("haven", "HAVEN", "Breathe slower", "Luxury Collection — wellness and spa retreats.", ["resort", "villa"], "haven-lalakhal", ["hero", "signature", "journey", "rooms", "experiences", "dining", "amenities", "gallery", "reviews", "arrival", "reserve"], "Breathe: breathing circle with the retreat's promise"),
  summit: lux("summit", "SUMMIT", "Above the clouds", "Luxury Collection — hill and mountain lodges.", ["resort", "cottage"], "meghchura", ["hero", "facts", "rooms", "signature", "experiences", "dining", "amenities", "gallery", "reviews", "arrival", "reserve"], "Fireside: the evening at the lodge"),
  canopy: lux("canopy", "CANOPY", "Living in the canopy", "Luxury Collection — rainforest and treehouse retreats.", ["cottage", "other", "resort"], "canopy-nest", ["hero", "signature", "rooms", "journey", "experiences", "amenities", "gallery", "reviews", "faq", "arrival", "reserve"], "Height scale: treehouses by how high they sit"),
  drift: lux("drift", "DRIFT", "A voyage, slowly", "Luxury Collection — luxury houseboats and river cruises.", ["other", "resort", "villa"], "haor-bilash", ["hero", "facts", "signature", "rooms", "amenities", "experiences", "gallery", "reviews", "faq", "arrival", "reserve"], "Voyage line: the day on board along the river"),
  estate: lux("estate", "ESTATE", "The whole place is yours", "Luxury Collection — private villa estates and exclusive-use houses.", ["villa", "home", "resort"], "bonolota-estate", ["hero", "signature", "rooms", "experiences", "dining", "amenities", "gallery", "reviews", "faq", "arrival", "reserve"], "The whole estate: sleeps, bedrooms, staff and pools"),
  aurel: lux("aurel", "AUREL", "The city. Your sanctuary.", "Signature Collection — City hotels, urban 4–5★.", ["hotel"], "aurel-banani", ["hero", "signature", "rooms", "dining", "experiences", "reserve"], "The building: 3D floor cutaway"),
  courtyard: lux("courtyard", "COURTYARD", "Stay somewhere with soul.", "Signature Collection — Boutique hotels, townhouses.", ["hotel"], "the-courtyard", ["hero", "story", "rooms", "dining", "experiences", "reserve"], "Signature"),
  axis: lux("axis", "AXIS", "Make room for your next move.", "Signature Collection — Business hotels, corporate stays.", ["hotel"], "axis-gulshan", ["hero", "facts", "signature", "rooms", "dining", "experiences", "arrival", "reserve"], "The business suite: 3D suite"),
  waypoint: lux("waypoint", "WAYPOINT", "Good roads. Great rest.", "Signature Collection — Motels, highway inns, transit stays.", ["hotel"], "waypoint-inn", ["hero", "signature", "rooms", "amenities", "experiences", "reserve"], "Road-trip flow: rest, refuel, explore"),
  shanti: lux("shanti", "SHANTI", "A slower, warmer kind of stay.", "Signature Collection — Guest houses, small B&Bs.", ["guest-house"], "shanti-guest-house", ["hero", "story", "rooms", "dining", "gallery", "reserve"], "Signature"),
  reside: lux("reside", "RESIDE", "Space to settle in.", "Signature Collection — Serviced apartments, long stays.", ["serviced-apartment"], "haven-residences", ["hero", "signature", "rooms", "amenities", "arrival", "offers", "gallery", "reserve"], "Explore the space: 3D apartment"),
  commons: lux("commons", "COMMONS", "Come for a bed. Stay for the people.", "Signature Collection — Hostels, social stays.", ["hostel"], "common-ground", ["hero", "gallery", "rooms", "experiences", "arrival", "reserve"], "Signature"),
  roots: lux("roots", "ROOTS", "A new place. A familiar feeling.", "Signature Collection — Homestays, host families.", ["home"], "roots-homestay", ["hero", "story", "rooms", "dining", "experiences", "gallery", "reserve"], "Signature"),
  morning: lux("morning", "MORNING", "Stay for the night. Love the morning.", "Signature Collection — B&Bs, small inns.", ["guest-house"], "morning-house", ["hero", "dining", "rooms", "experiences", "arrival", "reserve"], "Signature"),
  matir: lux("matir", "MATIR", "Let the countryside wake you.", "Signature Collection — Farm stays, eco cottages.", ["cottage"], "matir-farm", ["hero", "signature", "rooms", "dining", "experiences", "story", "reserve"], "The farm: 3D diorama"),
};

export const MASTER_LIST: ThemeManifest[] = [MANIFESTS.nest, MANIFESTS.cottage, MANIFESTS.bunk, MANIFESTS.city, MANIFESTS.villa, MANIFESTS.flat, MANIFESTS.escape, MANIFESTS.grand];
/** Paid themes (Theme Store). */
export const PAID_LIST: ThemeManifest[] = [MANIFESTS.isle, MANIFESTS.zamindar, MANIFESTS.maison, MANIFESTS.noir, MANIFESTS.orbit, MANIFESTS.haven, MANIFESTS.summit, MANIFESTS.canopy, MANIFESTS.drift, MANIFESTS.estate, MANIFESTS.aurel, MANIFESTS.courtyard, MANIFESTS.axis, MANIFESTS.waypoint, MANIFESTS.shanti, MANIFESTS.reside, MANIFESTS.commons, MANIFESTS.roots, MANIFESTS.morning, MANIFESTS.matir, MANIFESTS.pod];

export const planAllows = (plan: Plan, min?: Plan) => !min || PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(min);

/** Sections this hotel can use in this theme (property type + plan). */
export function sectionsFor(m: ThemeManifest, h: Hotel) {
  return m.sections.map((s) => ({
    ...s,
    available: planAllows(h.plan, s.minPlan) && (!s.propertyTypes || s.propertyTypes.includes(h.propertyType)),
  }));
}
