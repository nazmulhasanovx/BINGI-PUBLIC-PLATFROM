// DEMO DATA — Shonali Rajbari is a fictional heritage palace hotel used to design the ZAMINDAR luxury theme.
// Photos: Pexels (free licence) + existing demo photos, demo only. No real palace or hotel is named.
import type { Hotel } from "@/lib/types";
import { luxBase } from "./_lux";

const P = "/demo/shonali-rajbari";

export const shonaliRajbari: Hotel = {
  ...luxBase("RAJBARI10", "01388-000000"),
  slug: "shonali-rajbari",
  name: "Shonali Rajbari",
  type: "Heritage palace hotel",
  stars: 5,
  tagline: "A zamindar's house, opened to guests",
  intro: "Built in 1891 for a family of indigo traders, restored over nine years. Fourteen suites around two courtyards, a garden of old mango trees and a kitchen that still cooks the house recipes.",
  logoText: "Shonali Rajbari",
  heroPhoto: `${P}/hero.jpg`,
  area: "Natore",
  city: "Rajshahi",
  address: "Rajbari Road, Natore Sadar, Natore",
  phone: "+880 1388-000000",
  whatsapp: "+8801388000000",
  email: "house@shonali.example",
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
  highlights: ["Built 1891", "14 suites", "Two courtyards"],
  facilities: [
    { name: "Courtyard pool", short: "In the old bathing court", icon: "waves" },
    { name: "Durbar dining hall", short: "House recipes, by candle", icon: "utensils" },
    { name: "Library", short: "Family papers and 2,000 books", icon: "coffee" },
    { name: "Ayurvedic spa", short: "In the old women's wing", icon: "leaf" },
    { name: "Butler per wing", short: "Seven suites each", icon: "shield" },
    { name: "Vintage car", short: "Station pickups in a 1956 sedan", icon: "car" },
  ],
  nearby: [
    { name: "Natore railway station", time: "12 min", mode: "drive" },
    { name: "Uttara Gonobhaban", time: "15 min", mode: "drive" },
    { name: "Chalan Beel", time: "50 min", mode: "drive" },
    { name: "Rajshahi airport", time: "1 h 20", mode: "drive" },
  ],
  gallery: [`${P}/domes.jpg`, `${P}/arch.jpg`, `${P}/jali.jpg`, `${P}/garden.jpg`, `${P}/atrium.jpg`, `${P}/pigeons.jpg`],
  pagePhotos: { rooms: `${P}/atrium.jpg`, experiences: `${P}/garden.jpg`, offers: `${P}/domes.jpg`, explore: `${P}/garden.jpg` },
  rooms: [
    { id: "z1", slug: "darbar-suite", name: "Darbar Suite", kind: "suite", short: "The old receiving room, with its painted ceiling.", description: "The zamindar's receiving room, now a suite: a painted ceiling, a four-poster bed, a sitting room and windows over the main courtyard.", fromPrice: 46000, maxAdults: 2, maxChildren: 1, bed: "1 four-poster King", sizeSqft: 980, view: "Main courtyard", units: 2, amenities: ["Painted ceiling", "Sitting room", "Clawfoot bath", "Butler", "Free Wi-Fi"], photos: [`${P}/atrium.jpg`, `${P}/arch.jpg`], featured: true },
    { id: "z2", slug: "jharokha-suite", name: "Jharokha Suite", kind: "suite", short: "A carved balcony over the garden.", description: "Behind a carved stone jharokha, looking over the mango garden. Morning light through the jali screens.", fromPrice: 34000, maxAdults: 2, maxChildren: 1, bed: "1 King bed", sizeSqft: 720, view: "Garden", units: 4, amenities: ["Carved balcony", "Jali screens", "Rain shower", "Butler", "Free Wi-Fi"], photos: [`${P}/jali.jpg`, `${P}/garden.jpg`], featured: true },
    { id: "z3", slug: "courtyard-room", name: "Courtyard Room", kind: "room", short: "Opens onto the quiet second courtyard.", description: "High ceilings, lime-plaster walls and teak furniture made for the house, opening onto the quiet second courtyard.", fromPrice: 24000, maxAdults: 2, maxChildren: 1, bed: "1 Queen bed", sizeSqft: 480, view: "Second courtyard", units: 6, amenities: ["High ceilings", "Teak furniture", "Rain shower", "Free Wi-Fi"], photos: [`/demo/tea-valley/room-heritage.jpg`, `${P}/pigeons.jpg`] },
    { id: "z4", slug: "dome-pavilion", name: "Dome Pavilion", kind: "suite", short: "A private pavilion under the east dome.", description: "The house's most private rooms: under the east dome, with a roof terrace of its own and a view over the town.", fromPrice: 62000, maxAdults: 3, maxChildren: 1, bed: "1 King bed + day bed", sizeSqft: 1300, view: "Roof terrace", units: 2, amenities: ["Private roof terrace", "Dome ceiling", "Bath for two", "Butler", "Free Wi-Fi"], photos: [`${P}/domes.jpg`, `${P}/hero.jpg`] },
  ],
  services: [
    { id: "s1", name: "Station pickup, 1956 sedan", category: "transfer", short: "From Natore station in the family car.", price: 3500, unit: "per trip", addToStay: true },
    { id: "s2", name: "House history walk", category: "activity", short: "An hour with the family archivist.", price: 2500, unit: "per person", photo: `${P}/arch.jpg`, addToStay: true },
    { id: "s3", name: "Durbar hall dinner", category: "celebration", short: "Twelve house dishes, candlelit, for your table only.", price: 18000, unit: "per couple", photo: `${P}/atrium.jpg`, addToStay: true },
    { id: "s4", name: "Garden breakfast", category: "dining", short: "Luchi, mango and sweets under the old trees.", price: 2200, unit: "per person", photo: `${P}/garden.jpg`, addToStay: true },
    { id: "s5", name: "Ayurvedic oil ritual", category: "spa", short: "Seventy-five minutes in the old women's wing.", price: 9500, unit: "per person", photo: `${P}/jali.jpg`, addToStay: true },
  ],
  outlets: [
    { id: "d1", name: "The Durbar Hall", kind: "restaurant", short: "The house recipes, served as the family served them — on brass, by candle.", hours: "7 PM – 11 PM", location: "Main wing", photo: `${P}/atrium.jpg`, tableRequest: true },
    { id: "d2", name: "Aam Bagan", kind: "cafe", short: "Breakfast and tea in the mango garden.", hours: "7 AM – 6 PM", location: "Garden", tableRequest: false },
  ],
  offers: [
    { id: "o1", title: "Three nights at the Rajbari", short: "The third night with our compliments.", kind: "discount", value: "3 for 2", conditions: "Any suite, Sunday–Thursday, book direct." },
  ],
  reviews: [
    { id: "r1", name: "Anisul H.", from: "Dhaka", score: 5, text: "It feels like being a guest of the family, not of a hotel.", stayed: "Oct 2026" },
    { id: "r2", name: "Charlotte M.", from: "France", score: 5, text: "The history walk turned the whole house into a story.", stayed: "Sep 2026" },
    { id: "r3", name: "Rumana S.", from: "Rajshahi", score: 4.5, text: "Durbar hall dinner — twelve dishes, every one remembered.", stayed: "Aug 2026" },
    { id: "r4", name: "Arjun P.", from: "India", score: 5, text: "The Dome Pavilion terrace at dusk is unforgettable.", stayed: "Oct 2026" },
    { id: "r5", name: "Tahmina A.", from: "Dhaka", score: 5, text: "Quiet, gracious and very well kept.", stayed: "Jul 2026" },
  ],
  reviewScore: 4.9,
  reviewCount: 168,
  story: [
    { time: "1891", title: "The house is built", text: "An indigo-trading family builds two courtyards and a durbar hall on the road to the river." },
    { time: "1920s", title: "The east dome", text: "A pavilion is added under a new dome for musicians and long summer evenings." },
    { time: "1971", title: "Quiet years", text: "The family moves to Dhaka. A caretaker keeps the doors oiled and the garden alive." },
    { time: "2017", title: "Nine years of restoration", text: "Lime plaster, teak and the painted ceilings are restored by hand, room by room." },
    { time: "Today", title: "Open to guests", text: "Fourteen suites, the old kitchen and the family's recipes — shared with guests." },
  ],
  faq: [
    { q: "Is the house suitable for children?", a: "Yes. Courtyard Rooms and the Dome Pavilion have space for a child's bed. The courtyard pool has a shallow end." },
    { q: "Can we visit without staying?", a: "Durbar hall dinners are open to outside guests on request, 24 hours ahead." },
  ],
  theme: { master: "zamindar", id: "terracotta", heading: "serif" },
  propertyType: "hotel",
  plan: "ultra",
};
