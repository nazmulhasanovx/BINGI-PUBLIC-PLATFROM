// DEMO DATA — Meghchura is a fictional hill lodge used to design the SUMMIT luxury theme.
// Photos: existing Unsplash demo photos, demo only. No real lodge is named.
import type { Hotel } from "@/lib/types";
import { luxBase } from "./_lux";

const M = "/demo/mistwood";
const T = "/demo/tea-valley";

export const meghchura: Hotel = {
  ...luxBase("MEGH10", "01333-222222"),
  slug: "meghchura",
  name: "Meghchura Lodge",
  type: "Hill lodge",
  stars: 5,
  tagline: "Wake up above the clouds",
  intro: "Twelve timber lodges on a ridge at 1,800 feet, with the clouds below you most mornings. Fires every evening, a long table for dinner and nothing to do unless you want to.",
  logoText: "Meghchura",
  heroPhoto: `${M}/hero.jpg`,
  area: "Sajek Valley",
  city: "Rangamati",
  address: "Ruilui Para Ridge, Sajek Valley, Baghaichhari, Rangamati",
  phone: "+880 1333-222222",
  whatsapp: "+8801333222222",
  email: "ridge@meghchura.example",
  checkIn: "1:00 PM",
  checkOut: "11:00 AM",
  highlights: ["1,800 ft ridge", "12 timber lodges", "Fire every evening"],
  facilities: [
    { name: "Fire terrace", short: "Lit every evening at six", icon: "flame" },
    { name: "Long table dinners", short: "Hill cooking, shared", icon: "utensils" },
    { name: "Wood-fired sauna", short: "With a cold shower in the open", icon: "bath" },
    { name: "Guided ridge walks", short: "Sunrise and sunset", icon: "sun" },
    { name: "4×4 transfer", short: "From Khagrachari", icon: "car" },
    { name: "Solar + backup", short: "Power through the night", icon: "plug" },
  ],
  nearby: [
    { name: "Konglak Para viewpoint", time: "25 min", mode: "walk" },
    { name: "Ruilui Para", time: "8 min", mode: "walk" },
    { name: "Khagrachari town", time: "2 h 30", mode: "drive" },
    { name: "Chattogram", time: "6 h", mode: "drive" },
  ],
  gallery: [`${M}/aerial.jpg`, `${M}/aframe.jpg`, `${M}/fire-pit.jpg`, `${T}/tea-hills.jpg`, `${M}/path.jpg`, `${M}/lodge.jpg`],
  pagePhotos: { rooms: `${M}/room-attic.jpg`, experiences: `${M}/path.jpg`, offers: `${M}/fire-pit.jpg`, explore: `${M}/aerial.jpg` },
  rooms: [
    { id: "g1", slug: "ridge-lodge", name: "Ridge Lodge", kind: "cottage", short: "A-frame on the edge, glass to the valley.", description: "A timber A-frame on the edge of the ridge, with a wall of glass to the valley, a wood stove and a deck over the clouds.", fromPrice: 26000, maxAdults: 2, maxChildren: 1, bed: "1 King bed", sizeSqft: 640, view: "Valley · 1,800 ft", units: 6, amenities: ["Glass gable", "Wood stove", "Cloud deck", "Rain shower", "Free Wi-Fi"], photos: [`${M}/living-aframe.jpg`, `${M}/aframe.jpg`], featured: true },
    { id: "g2", slug: "attic-loft", name: "Attic Loft", kind: "room", short: "Under the roof, warm wood all round.", description: "A loft under the eaves of the main lodge: warm wood, wool blankets and a window seat facing sunrise.", fromPrice: 18500, maxAdults: 2, maxChildren: 0, bed: "1 Queen bed", sizeSqft: 420, view: "Sunrise · 1,760 ft", units: 4, amenities: ["Window seat", "Wool blankets", "Rain shower", "Free Wi-Fi"], photos: [`${M}/room-attic.jpg`, `${M}/living.jpg`] },
    { id: "g3", slug: "forest-cabin", name: "Forest Cabin", kind: "cottage", short: "Down the path, in the trees, very quiet.", description: "Below the ridge in the forest: two rooms, a fireplace and a porch where the birds start at five.", fromPrice: 22000, maxAdults: 3, maxChildren: 1, bed: "1 King + 1 Single", sizeSqft: 560, view: "Forest · 1,700 ft", units: 2, amenities: ["Fireplace", "Porch", "Two rooms", "Free Wi-Fi"], photos: [`${M}/room-forest.jpg`, `${M}/cabin-river.jpg`] },
  ],
  services: [
    { id: "s1", name: "4×4 from Khagrachari", category: "transfer", short: "Private jeep up the hill road.", price: 9000, unit: "per jeep", addToStay: true },
    { id: "s2", name: "Sunrise ridge walk", category: "activity", short: "Guided, with coffee at Konglak.", price: 1500, unit: "per person", photo: `${M}/path.jpg`, addToStay: true },
    { id: "s3", name: "Private fire dinner", category: "celebration", short: "Your own fire, grilled hill chicken, the stars.", price: 12000, unit: "per couple", photo: `${M}/bonfire.jpg`, addToStay: true },
    { id: "s4", name: "Wood-fired sauna", category: "spa", short: "An hour, private, with the valley view.", price: 4000, unit: "for two", photo: `${M}/lodge.jpg`, addToStay: true },
    { id: "s5", name: "Long table dinner", category: "dining", short: "Bamboo chicken, hill rice, wild greens.", price: 3500, unit: "per person", photo: `${M}/dining.jpg`, addToStay: true },
  ],
  outlets: [
    { id: "d1", name: "The Long Table", kind: "restaurant", short: "One table for every guest. Hill cooking from Ruilui Para kitchens, every night at eight.", hours: "8 PM", location: "Main lodge", photo: `${M}/dining.jpg`, tableRequest: true },
  ],
  offers: [
    { id: "o1", title: "Midweek in the clouds", short: "Sunday to Thursday.", kind: "discount", value: "20% off", conditions: "Two nights or more, book direct." },
  ],
  reviews: [
    { id: "r1", name: "Shuvo D.", from: "Dhaka", score: 5, text: "Clouds under the deck at 6 AM. I have no other words.", stayed: "Oct 2026" },
    { id: "r2", name: "Julia K.", from: "Netherlands", score: 5, text: "The long table dinner felt like a family meal with strangers who became friends.", stayed: "Sep 2026" },
    { id: "r3", name: "Pritom C.", from: "Chattogram", score: 4.5, text: "Rough road, worth every bump.", stayed: "Aug 2026" },
    { id: "r4", name: "Lamia H.", from: "Dhaka", score: 5, text: "Sauna, cold shower, fire. Repeat.", stayed: "Oct 2026" },
    { id: "r5", name: "Ben T.", from: "USA", score: 5, text: "Beautifully built lodges and the kindest team.", stayed: "Jul 2026" },
  ],
  reviewScore: 4.9,
  reviewCount: 96,
  dayPlan: [
    { time: "17:45", title: "Sunset on the ridge", text: "The valley turns gold. Tea on the deck." },
    { time: "18:00", title: "Fires are lit", text: "On the terrace and in every lodge stove." },
    { time: "20:00", title: "The long table", text: "Dinner together. Hill cooking, slow conversation." },
    { time: "22:00", title: "Stars", text: "No city light for a hundred kilometres. Blankets by the fire." },
  ],
  theme: { master: "summit", id: "navy", heading: "serif" },
  propertyType: "resort",
  plan: "ultra",
};
