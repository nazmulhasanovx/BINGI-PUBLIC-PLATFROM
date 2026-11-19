// Accommodation catalog — from the BinGi Accommodation spec V1.2 (repo: Room-Accomodation-).
// 5 whole-unit Core Types (booking engines) · 13 visible cards (presets that map to a Core Type).
import type { PropertyType } from "@/lib/types";

// Backend alignment: Accommodation Management Development Plan v1.12 (09 Nov 2026) — whole-unit stays only.
// Dormitory / per-bed selling is OUT of this release. Codes match the backend AccommodationCatalogSeeder.
export type CoreType = "ROOM" | "COTTAGE" | "VILLA" | "APARTMENT" | "OTHER";
export const CORE_TYPES: CoreType[] = ["ROOM", "COTTAGE", "VILLA", "APARTMENT", "OTHER"];

export const CORE: Record<CoreType, { label: string; plural: string; desc: string; strategy: "floor" | "zone"; inventory: string }> = {
  ROOM: { label: "Room", plural: "Rooms", desc: "Rooms inside a building, on floors.", strategy: "floor", inventory: "Entire room" },
  COTTAGE: { label: "Cottage", plural: "Cottages", desc: "Standalone cottages in a zone or garden.", strategy: "zone", inventory: "Entire cottage" },
  VILLA: { label: "Villa", plural: "Villas", desc: "Private villas, usually with their own space.", strategy: "zone", inventory: "Entire villa" },
  APARTMENT: { label: "Apartment", plural: "Apartments", desc: "Flats in a tower or building, on floors.", strategy: "floor", inventory: "Entire apartment" },
  OTHER: { label: "Other", plural: "Other stays", desc: "Anything else, sold as one whole unit.", strategy: "zone", inventory: "Entire unit" },
};

export type PresetSlug =
  | "room" | "cottage" | "villa" | "apartment"
  | "bungalow" | "cabin" | "chalet" | "treehouse" | "glamping" | "houseboat" | "capsule" | "holiday-home"
  | "custom";
/** `code` = backend stable preset code. */
export type Preset = { slug: PresetSlug; code: string; label: string; core: CoreType; prefix: string; group: "standard" | "specialty" | "other"; desc: string; example: string };

export const PRESETS: Preset[] = [
  { slug: "room", code: "ROOM", label: "Room", core: "ROOM", prefix: "", group: "standard", desc: "Standard, deluxe, suite…", example: "101, 201" },
  { slug: "cottage", code: "COTTAGE", label: "Cottage", core: "COTTAGE", prefix: "C", group: "standard", desc: "Standalone cottage", example: "C01" },
  { slug: "villa", code: "VILLA", label: "Villa", core: "VILLA", prefix: "V", group: "standard", desc: "Private villa", example: "V01" },
  { slug: "apartment", code: "APARTMENT", label: "Apartment", core: "APARTMENT", prefix: "A", group: "standard", desc: "Studio, 1BR, 2BR…", example: "A101" },
  { slug: "bungalow", code: "BUNGALOW", label: "Bungalow", core: "COTTAGE", prefix: "B", group: "specialty", desc: "Works like a cottage", example: "B01" },
  { slug: "cabin", code: "CABIN", label: "Cabin", core: "COTTAGE", prefix: "CB", group: "specialty", desc: "Works like a cottage", example: "CB01" },
  { slug: "chalet", code: "CHALET", label: "Chalet", core: "COTTAGE", prefix: "CH", group: "specialty", desc: "Works like a cottage", example: "CH01" },
  { slug: "treehouse", code: "TREEHOUSE", label: "Treehouse", core: "OTHER", prefix: "TH", group: "specialty", desc: "Whole unit", example: "TH01" },
  { slug: "glamping", code: "TENT_GLAMPING", label: "Tent / Glamping", core: "OTHER", prefix: "GL", group: "specialty", desc: "Whole unit", example: "GL01" },
  { slug: "houseboat", code: "HOUSEBOAT", label: "Houseboat", core: "OTHER", prefix: "HB", group: "specialty", desc: "Whole unit", example: "HB01" },
  { slug: "capsule", code: "CAPSULE_POD", label: "Capsule / Pod", core: "OTHER", prefix: "CP", group: "specialty", desc: "Each pod sold as a whole unit", example: "CP01" },
  { slug: "holiday-home", code: "HOLIDAY_HOME", label: "Holiday Home", core: "VILLA", prefix: "H", group: "specialty", desc: "Villa, or an apartment in a tower", example: "H01" },
  { slug: "custom", code: "OTHER_CUSTOM", label: "Other / Custom", core: "OTHER", prefix: "", group: "other", desc: "Name it yourself", example: "Custom" },
];
export const preset = (slug: string) => PRESETS.find((p) => p.slug === slug) ?? PRESETS[PRESETS.length - 1];
/** Standard cards are fixed. A specialty/custom card's suggested core can be changed BEFORE its first unit is published. */
export const coreChoices = (p: Preset): CoreType[] =>
  p.group === "standard" ? [p.core] : [p.core, ...CORE_TYPES.filter((c) => c !== p.core)];

// Property Types (backend: 10 stable codes, single choice) and their suggestions — never a hard restriction.
export const PROPERTY_TYPES: { slug: string; code: string; label: string; suggest: CoreType[] }[] = [
  { slug: "hotel", code: "HOTEL", label: "Hotel", suggest: ["ROOM", "APARTMENT"] },
  { slug: "resort", code: "RESORT", label: "Resort", suggest: ["ROOM", "COTTAGE", "VILLA", "APARTMENT", "OTHER"] },
  { slug: "guest-house", code: "GUEST_HOUSE", label: "Guest House", suggest: ["ROOM", "APARTMENT"] },
  { slug: "motel", code: "MOTEL", label: "Motel", suggest: ["ROOM", "COTTAGE", "APARTMENT"] },
  { slug: "hostel", code: "HOSTEL", label: "Hostel", suggest: ["ROOM", "APARTMENT"] },
  { slug: "homestay", code: "HOMESTAY", label: "Homestay", suggest: ["ROOM", "APARTMENT", "COTTAGE", "VILLA"] },
  { slug: "serviced-apartment", code: "SERVICED_APARTMENT", label: "Serviced Apartment", suggest: ["APARTMENT", "ROOM", "VILLA"] },
  { slug: "vacation-rental", code: "VACATION_RENTAL", label: "Vacation Rental", suggest: ["VILLA", "COTTAGE", "APARTMENT", "ROOM", "OTHER"] },
  { slug: "lodge", code: "LODGE_RETREAT", label: "Lodge / Retreat", suggest: ["ROOM", "COTTAGE", "VILLA", "OTHER"] },
  { slug: "other", code: "OTHER_CUSTOM", label: "Other / Custom Property", suggest: [...CORE_TYPES] },
];
/** The demo hotel records use the website's older property list; map them onto the backend's 10 codes. */
export function propertyTypeFor(h: { propertyType: PropertyType; propertyCode?: string }) {
  return PROPERTY_TYPES.find((p) => p.slug === h.propertyCode) ?? propertyTypeOf(h.propertyType);
}
export function propertyTypeOf(t: PropertyType) {
  const map: Record<PropertyType, string> = { hotel: "hotel", resort: "resort", "guest-house": "guest-house", home: "homestay", "serviced-apartment": "serviced-apartment", hostel: "hostel", cottage: "lodge", villa: "vacation-rental", other: "other" };
  return PROPERTY_TYPES.find((p) => p.slug === map[t]) ?? PROPERTY_TYPES[PROPERTY_TYPES.length - 1];
}

// Location kinds (backend: 10). Containers hold units directly or contain inner levels.
export type LocKindCode = "BUILDING" | "TOWER" | "BLOCK" | "WING" | "FLOOR" | "LEVEL" | "ZONE" | "AREA" | "SECTION" | "CLUSTER";
export const BUILDING_KINDS: LocKindCode[] = ["BUILDING", "TOWER", "WING"];
export const FLOOR_KINDS: LocKindCode[] = ["FLOOR", "LEVEL"];
export const ZONE_KINDS: LocKindCode[] = ["ZONE", "AREA", "SECTION", "CLUSTER"];
export const BLOCK_KINDS: LocKindCode[] = ["BLOCK"];
export const kindLabel = (k: LocKindCode) => k[0] + k.slice(1).toLowerCase();

// Full amenities library (searchable multi-select). Saved on the Category once.
export const AMENITIES: { group: string; items: string[] }[] = [
  { group: "Basics", items: ["Free Wi-Fi", "Air conditioning", "Fan", "Hot water", "Smart TV", "Work desk", "Wardrobe", "Safe", "Iron", "Hair dryer"] },
  { group: "Bathroom", items: ["Attached bathroom", "Shared bathroom", "Rain shower", "Bathtub", "Toiletries", "Towels"] },
  { group: "Food & drink", items: ["Tea & coffee", "Minibar", "Kitchenette", "Full kitchen", "Fridge", "Microwave", "Dining table", "Breakfast included"] },
  { group: "View & outdoor", items: ["Sea view", "Lake view", "Garden view", "Hill view", "Balcony", "Terrace", "Private deck", "Private pool", "Plunge pool", "BBQ area"] },
  { group: "Space", items: ["Living room", "Sofa bed", "Washer", "Wood stove", "Reading corner", "Extra bed on request"] },
  { group: "Shared & pods", items: ["Locker", "Privacy curtain", "Reading light", "Own socket", "Pod bed", "Common lounge"] },
  { group: "Access & safety", items: ["Wheelchair access", "Lift", "Smoke detector", "Parking", "Pet friendly", "24h security"] },
];
export const ALL_AMENITIES = AMENITIES.flatMap((g) => g.items);

// ---------------- numbering ----------------
export type Template = "floor" | "prefix" | "sequential" | "block" | "zone" | "custom";
/** `code` = backend numbering template code. */
export const TEMPLATES: { v: Template; code: string; label: string; example: string; for: ("floor" | "zone")[] }[] = [
  { v: "floor", code: "FLOOR_BASED", label: "Floor-based", example: "101, 102 · 201", for: ["floor"] },
  { v: "block", code: "BLOCK_BASED", label: "Block / building code", example: "A-101, B-101", for: ["floor", "zone"] },
  { v: "prefix", code: "PREFIX_BASED", label: "Prefix + number", example: "C01, C02", for: ["zone", "floor"] },
  { v: "sequential", code: "SEQUENTIAL", label: "Sequential", example: "001, 002", for: ["zone", "floor"] },
  { v: "zone", code: "ZONE_BASED", label: "Zone code + number", example: "G-C01, L-C01", for: ["zone"] },
  { v: "custom", code: "CUSTOM_MANUAL", label: "Custom / manual", example: "SKY-501, HB-01", for: ["zone", "floor"] },
];
export const pad = (n: number, d: number) => String(n).padStart(d, "0");
export const CODE_RE = /^[A-Z0-9][A-Z0-9-]{0,13}$/;

/** YouTube links only (watch, youtu.be, shorts). Returns the 11-char video id or null. */
export function youtubeId(url: string): string | null {
  let u: URL;
  try { u = new URL(url.trim()); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else if (/^\/(shorts|embed|live)\//.test(u.pathname)) id = u.pathname.split("/")[2];
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}
