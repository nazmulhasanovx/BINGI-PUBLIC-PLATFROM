// DEMO DATA factory for the Signature Collection (10 fictional Bangladeshi properties). Demo only.
// Photos: existing demo photos (Unsplash) + Pexels (credits in public/demo/CREDITS.md). No real property is named.
import type { Hotel, MasterTheme, PropertyType, RoomCategory, ServiceItem, Outlet, Review } from "@/lib/types";
import type { ThemeId } from "@/lib/theme";

type R = [name: string, kind: RoomCategory["kind"], short: string, price: number, adults: number, kids: number, bed: string, sqft: number, view: string, units: number, photos: string[], amenities: string[], extra?: Partial<RoomCategory>];
type S = [name: string, cat: ServiceItem["category"], short: string, price: number, unit: string, photo?: string];
type O = [name: string, kind: Outlet["kind"], short: string, hours: string, location: string, photo?: string];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function sig(o: {
  slug: string; name: string; type: string; stars?: number; tagline: string; intro: string; logoText: string; hero: string;
  area: string; city: string; address: string; phone: string; email: string; checkIn?: string; checkOut?: string;
  highlights: string[]; facilities: [string, string, string][]; nearby: [string, string, "walk" | "drive"][];
  gallery: string[]; pagePhotos?: Hotel["pagePhotos"]; rooms: R[]; services: S[]; outlets?: O[];
  offers?: [string, string, string, string][]; reviews: [string, string, number, string][]; score: number; count: number;
  dayPlan?: Hotel["dayPlan"]; faq?: Hotel["faq"]; host?: Hotel["host"];
  master: MasterTheme; colour: ThemeId; propertyType: PropertyType; plan?: Hotel["plan"]; cancellation?: string;
}): Hotel {
  const digits = o.phone.replace(/[^\d]/g, "");
  return {
    slug: o.slug, name: o.name, type: o.type, stars: o.stars ?? 0, tagline: o.tagline, intro: o.intro, logoText: o.logoText, heroPhoto: o.hero,
    area: o.area, city: o.city, country: "Bangladesh", address: o.address, phone: o.phone, whatsapp: `+${digits}`, email: o.email, currency: "BDT",
    checkIn: o.checkIn ?? "2:00 PM", checkOut: o.checkOut ?? "12:00 PM", highlights: o.highlights,
    facilities: o.facilities.map(([name, short, icon]) => ({ name, short, icon })),
    nearby: o.nearby.map(([name, time, mode]) => ({ name, time, mode })),
    gallery: o.gallery, pagePhotos: o.pagePhotos ?? { rooms: o.rooms[0][10][0], experiences: o.gallery[1], offers: o.gallery[2], explore: o.gallery[0] },
    rooms: o.rooms.map(([name, kind, short, fromPrice, maxAdults, maxChildren, bed, sizeSqft, view, units, photos, amenities, extra], i) => ({
      id: `${o.slug}-r${i + 1}`, slug: slugify(name), name, kind, short, description: `${short} ${amenities.slice(0, 3).join(", ")}.`, fromPrice, maxAdults, maxChildren, bed, sizeSqft: sizeSqft || undefined, view, units, photos, amenities, featured: i < 2, ...extra,
    })),
    services: o.services.map(([name, category, short, price, unit, photo], i) => ({ id: `s${i + 1}`, name, category, short, price, unit, photo, addToStay: category !== "stay" })),
    outlets: (o.outlets ?? []).map(([name, kind, short, hours, location, photo], i) => ({ id: `d${i + 1}`, name, kind, short, hours, location, photo, tableRequest: kind === "restaurant" })),
    menu: [],
    offers: (o.offers ?? []).map(([title, short, value, conditions], i) => ({ id: `o${i + 1}`, title, short, kind: "discount" as const, value, conditions })),
    promoCodes: [{ code: `${o.logoText.replace(/\W/g, "").toUpperCase().slice(0, 8)}10`, percent: 10, label: "Direct 10%" }],
    reviews: o.reviews.map(([name, from, score, text], i) => ({ id: `rv${i + 1}`, name, from, score, text, stayed: ["Oct 2026", "Sep 2026", "Aug 2026", "Oct 2026", "Jul 2026"][i % 5] }) satisfies Review),
    reviewScore: o.score, reviewCount: o.count,
    policies: { cancellation: o.cancellation ?? "Free cancellation up to 48 hours before check-in.", children: "Children under 6 stay free in their parents' room.", pets: "Pets are not allowed.", tax: "15% VAT is added at checkout." },
    payments: [{ kind: "pay-at-property" }, { kind: "mfs-manual", provider: "bKash", number: o.phone.replace("+880 ", "0") }, { kind: "advance", percent: 30 }, { kind: "card-online", gatewayApproved: false }],
    taxes: { vatPercent: 15, serviceChargePercent: 0, inclusive: false },
    social: { facebook: "#", instagram: "#" },
    dayPlan: o.dayPlan, faq: o.faq, host: o.host,
    theme: { master: o.master, id: o.colour, heading: "serif" }, propertyType: o.propertyType,
    flags: { packages: false, events: false }, plan: o.plan ?? "ultra", status: "live",
  };
}
