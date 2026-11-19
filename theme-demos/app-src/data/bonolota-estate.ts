// DEMO DATA — Bonolota Estate is a fictional private villa estate used to design the ESTATE luxury theme.
// Photos: existing Unsplash demo photos, demo only. No real estate is named.
import type { Hotel } from "@/lib/types";
import { luxBase } from "./_lux";

const SH = "/demo/shalbon";

export const bonolotaEstate: Hotel = {
  ...luxBase("BONOLOTA10", "01344-333333"),
  slug: "bonolota-estate",
  name: "Bonolota Estate",
  type: "Private villa estate",
  stars: 5,
  tagline: "Three villas, twelve acres, one family at a time",
  intro: "A walled estate of sal forest and lawns an hour from Dhaka. Book a single villa, or the whole estate with its own chef, butler and three pools — for families, weddings and quiet weekends.",
  logoText: "Bonolota",
  heroPhoto: `${SH}/villa-modern.jpg`,
  area: "Rajendrapur",
  city: "Gazipur",
  address: "Sal Bagan Road, Rajendrapur, Gazipur",
  phone: "+880 1344-333333",
  whatsapp: "+8801344333333",
  email: "stay@bonolota.example",
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
  highlights: ["Private chef & butler", "Three pools", "12 acres of sal forest"],
  facilities: [
    { name: "Three pools", short: "Lap pool, villa pool and a forest plunge", icon: "waves" },
    { name: "Private chef", short: "Menus planned with you", icon: "utensils" },
    { name: "Butler", short: "One for the estate, day and night", icon: "shield" },
    { name: "Lawns & pavilion", short: "Events up to 120 guests", icon: "sun" },
    { name: "Security", short: "Gated, guarded 24 hours", icon: "lock" },
    { name: "Driver on call", short: "Dhaka pickups", icon: "car" },
  ],
  nearby: [
    { name: "Bhawal National Park", time: "12 min", mode: "drive" },
    { name: "Gazipur Chowrasta", time: "25 min", mode: "drive" },
    { name: "Dhaka airport", time: "1 h 10", mode: "drive" },
    { name: "Gulshan", time: "1 h 30", mode: "drive" },
  ],
  gallery: [`${SH}/pool-deck.jpg`, `${SH}/living-room.jpg`, `${SH}/dining.jpg`, `${SH}/infinity.jpg`, `${SH}/villa-white.jpg`, `${SH}/kitchen.jpg`],
  pagePhotos: { rooms: `${SH}/villa-white.jpg`, experiences: `${SH}/pool-deck.jpg`, offers: `${SH}/living-room.jpg`, explore: `${SH}/villa-modern.jpg` },
  rooms: [
    { id: "e1", slug: "main-house", name: "The Main House", kind: "villa", bedrooms: 4, short: "Four bedrooms around the lap pool.", description: "The estate's main house: four bedrooms, a double-height living room, the lap pool and the kitchen where the chef works.", fromPrice: 95000, maxAdults: 8, maxChildren: 2, bed: "4 King beds", sizeSqft: 5200, view: "Lawn and pool", units: 1, amenities: ["Lap pool", "Chef's kitchen", "Double-height living", "Butler", "Free Wi-Fi"], photos: [`${SH}/villa-modern.jpg`, `${SH}/living-room.jpg`], featured: true, specs: ["4 bedrooms", "Lap pool"] },
    { id: "e2", slug: "white-villa", name: "The White Villa", kind: "villa", bedrooms: 2, short: "Two bedrooms and a terrace in the trees.", description: "A white modernist villa with two bedrooms, a roof terrace and a pool of its own, at the forest edge.", fromPrice: 54000, maxAdults: 4, maxChildren: 2, bed: "2 King beds", sizeSqft: 2600, view: "Sal forest", units: 1, amenities: ["Private pool", "Roof terrace", "Kitchenette", "Free Wi-Fi"], photos: [`${SH}/villa-white.jpg`, `${SH}/bedroom.jpg`], featured: true, specs: ["2 bedrooms", "Private pool"] },
    { id: "e3", slug: "forest-pavilion", name: "The Forest Pavilion", kind: "villa", bedrooms: 1, short: "One bedroom, deep in the trees.", description: "A one-bedroom pavilion in the sal forest with a plunge pool and an outdoor bath — the quietest place on the estate.", fromPrice: 32000, maxAdults: 2, maxChildren: 1, bed: "1 King bed", sizeSqft: 1100, view: "Forest", units: 1, amenities: ["Plunge pool", "Outdoor bath", "Free Wi-Fi"], photos: [`${SH}/plunge.jpg`, `${SH}/bed-loft.jpg`], specs: ["1 bedroom", "Plunge pool"] },
  ],
  services: [
    { id: "s1", name: "Dhaka pickup", category: "transfer", short: "Private car with the estate driver.", price: 7000, unit: "per trip", addToStay: true },
    { id: "s2", name: "Chef's table", category: "dining", short: "A five-course dinner planned with you.", price: 6500, unit: "per person", photo: `${SH}/dining.jpg`, addToStay: true },
    { id: "s3", name: "Lawn celebration", category: "celebration", short: "Birthdays, holud and small weddings on the lawn.", price: 150000, unit: "from, per event", photo: `${SH}/pool-deck.jpg`, addToStay: true },
    { id: "s4", name: "Forest walk & picnic", category: "activity", short: "Bhawal forest with a guide, lunch in a basket.", price: 3000, unit: "per person", photo: `${SH}/infinity.jpg`, addToStay: true },
  ],
  outlets: [],
  offers: [
    { id: "o1", title: "Whole estate, weekdays", short: "All three villas, Sunday to Thursday.", kind: "discount", value: "25% off", conditions: "Exclusive use, two nights or more." },
  ],
  reviews: [
    { id: "r1", name: "The Chowdhury family", from: "Dhaka", score: 5, text: "Three generations, one weekend, no one wanted to leave.", stayed: "Oct 2026" },
    { id: "r2", name: "Nafisa & Ryan", from: "Dhaka · Toronto", score: 5, text: "Our holud on the lawn was exactly what we dreamed of.", stayed: "Sep 2026" },
    { id: "r3", name: "Imtiaz K.", from: "Dhaka", score: 5, text: "The chef remembered every allergy without being told twice.", stayed: "Aug 2026" },
    { id: "r4", name: "Mark D.", from: "UK", score: 4.5, text: "An hour from Dhaka and completely silent.", stayed: "Oct 2026" },
    { id: "r5", name: "Sharmin A.", from: "Dhaka", score: 5, text: "The White Villa roof terrace at night is magic.", stayed: "Jul 2026" },
  ],
  reviewScore: 4.9,
  reviewCount: 58,
  faq: [
    { q: "Can we book the whole estate?", a: "Yes. Message us with your dates and number of guests; we confirm exclusive use and the chef's menu within a few hours." },
    { q: "Are events allowed?", a: "Yes, on the lawn and pavilion, up to 120 guests, with music until 11 PM." },
  ],
  theme: { master: "estate", id: "plum", heading: "serif" },
  propertyType: "villa",
  plan: "ultra",
};
