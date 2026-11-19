import type { ThemeId } from "./theme";

/** Included masters come with the plan; paid masters (drift, canopy, pod, orbit) are bought in the Theme Store. */
export type MasterTheme = "nest" | "city" | "grand" | "cottage" | "villa" | "flat" | "escape" | "bunk" | PaidTheme;
export type PaidTheme = "drift" | "canopy" | "pod" | "orbit" | LuxTheme | SigTheme;
/** Signature Collection (property-type themes from Nazmul's 10 designs, 2026-11-10). */
export type SigTheme = "aurel" | "courtyard" | "axis" | "waypoint" | "shanti" | "reside" | "commons" | "roots" | "morning" | "matir";
/** Luxury Collection (5★–7★) — paid themes in the Theme Store. drift, canopy and orbit were rebuilt into it. */
export type LuxTheme = "isle" | "zamindar" | "maison" | "noir" | "haven" | "summit" | "estate";
export type PropertyType = "hotel" | "resort" | "guest-house" | "home" | "serviced-apartment" | "hostel" | "cottage" | "villa" | "other";

export type Money = number; // in hotel currency units (BDT)

export interface RoomCategory {
  id: string;
  slug: string;
  name: string;
  kind: "room" | "suite" | "villa" | "cottage" | "apartment" | "dorm";
  /** Villas / apartments: bedrooms in the unit. Dorms: beds per room (price is per bed). */
  bedrooms?: number;
  /** Extra spec lines shown by VILLA / FLAT (e.g. "Private pool", "Full kitchen"). */
  specs?: string[];
  short: string;
  description: string;
  fromPrice: Money; // per night, before tax
  maxAdults: number;
  maxChildren: number;
  bed: string;
  sizeSqft?: number;
  view?: string;
  units: number;
  amenities: string[];
  photos: string[];
  featured?: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: "spa" | "transfer" | "dining" | "celebration" | "activity" | "stay";
  short: string;
  price: Money;
  unit: string; // "per person", "per trip"…
  photo?: string;
  addToStay: boolean; // can be added to a booking as an extra
}

export interface Outlet {
  id: string;
  name: string;
  kind: "restaurant" | "bar" | "cafe" | "room-service";
  short: string;
  hours: string;
  location: string;
  photo?: string;
  tableRequest: boolean; // D4: endpoint to confirm — shown as "Request a table"
}

export interface MenuItem {
  id: string;
  outletId: string;
  name: string;
  tags: string[];
  short: string;
  price: Money;
  photo?: string;
}

export interface Offer {
  id: string;
  title: string;
  short: string;
  kind: "discount" | "package"; // packages = planned, hidden unless flag on
  value: string; // "15% off"
  conditions: string;
  photo?: string;
  validUntil?: string;
}

/** Coupon codes from HMS → Discounts & Rates → Discounts (coupons). */
export interface PromoCode {
  code: string;
  percent: number;
  minNights?: number;
  label: string;
}

export interface Review {
  id: string;
  name: string;
  from: string;
  score: number; // out of 5
  text: string;
  stayed: string; // "Oct 2026"
}

export type PaymentMethod =
  | { kind: "pay-at-property" }
  | { kind: "mfs-manual"; provider: "bKash" | "Nagad" | "Rocket"; number: string }
  | { kind: "advance"; percent: number }
  | { kind: "card-online"; gatewayApproved: boolean };

export interface Hotel {
  slug: string;
  name: string;
  type: string; // "5-star beach resort"
  stars?: number;
  tagline: string;
  intro: string;
  logoText: string;
  heroPhoto: string;
  area: string;
  city: string;
  country: string;
  address: string;
  mapUrl?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  currency: "BDT";
  checkIn: string;
  checkOut: string;
  highlights: string[];
  facilities: { name: string; short: string; icon: string }[];
  /** Places nearby with travel time (CITY shows these prominently). */
  nearby?: { name: string; time: string; mode: "walk" | "drive" }[];
  gallery: string[];
  /** Banner photo per page (from HMS → Website → Pages & Content). */
  pagePhotos: Partial<Record<"rooms" | "dining" | "experiences" | "offers" | "explore" | "events", string>>;
  rooms: RoomCategory[];
  services: ServiceItem[];
  outlets: Outlet[];
  menu: MenuItem[];
  offers: Offer[];
  promoCodes: PromoCode[];
  reviews: Review[];
  reviewScore?: number;
  reviewCount: number;
  policies: { cancellation: string; children: string; pets: string; tax: string };
  payments: PaymentMethod[];
  taxes: { vatPercent: number; serviceChargePercent: number; inclusive: boolean };
  social: { facebook?: string; instagram?: string; youtube?: string };
  /** master = layout (from plan) · id = colour theme (hotel's choice) · heading = font */
  theme: { master: MasterTheme; id: ThemeId; heading: "sans" | "serif" };
  /** From onboarding step 1 — drives the category preset (labels, sections). */
  propertyType: PropertyType;
  /** Backend property-type code slug from onboarding (motel, lodge…). Overrides propertyType for accommodation suggestions. */
  propertyCode?: string;
  /** Guest houses / homes: the person guests deal with (HMS → Property → Host). Initials only, no photo needed. */
  host?: { name: string; role: string; since: string; note: string; languages: string[] };
  /** Property-specific questions (HMS → Website → Pages & Content). Themes show only what is filled in. */
  faq?: { q: string; a: string }[];
  /** Optional "a day here" plan (houseboats, retreats). Themes hide the section when empty. */
  dayPlan?: { time: string; title: string; text: string }[];
  /** Heritage timeline (ZAMINDAR). Website content field — not in the HMS backend yet. Hidden when empty. */
  story?: { time: string; title: string; text: string }[];
  /** Extra house rules beyond the policies (quiet hours, parties, lockers…). */
  houseRules?: { title: string; text: string }[];
  flags: { packages: boolean; events: boolean };
  plan: "starter" | "business" | "ultra" | "enterprise";
  status: "live" | "paused"; // paused = hotel turned the website off in HMS → Online controls
}
