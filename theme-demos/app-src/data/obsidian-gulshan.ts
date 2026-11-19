// DEMO DATA — Obsidian is a fictional rooftop luxury hotel used to design the NOIR luxury theme.
// Photos: existing Unsplash demo photos, demo only. No real hotel is named.
import type { Hotel } from "@/lib/types";
import { luxBase } from "./_lux";

const A = "/demo/altura";
const S = "/demo/sea-pearl";

export const obsidianGulshan: Hotel = {
  ...luxBase("OBSIDIAN10", "01311-000000"),
  slug: "obsidian-gulshan",
  name: "Obsidian Gulshan",
  type: "Rooftop luxury hotel",
  stars: 5,
  tagline: "The city looks better after dark",
  intro: "Sixty dark, quiet rooms under the best rooftop in Dhaka: a heated pool on the 22nd floor, a cocktail bar and a kitchen that cooks over charcoal until late.",
  logoText: "Obsidian",
  heroPhoto: `${A}/pool-2.jpg`,
  area: "Gulshan 2",
  city: "Dhaka",
  address: "Road 90, Gulshan 2, Dhaka 1212",
  phone: "+880 1311-000000",
  whatsapp: "+8801311000000",
  email: "nights@obsidian.example",
  checkIn: "3:00 PM",
  checkOut: "1:00 PM",
  highlights: ["Rooftop pool, 22nd floor", "Late check-out", "Charcoal kitchen"],
  facilities: [
    { name: "Sky pool", short: "Heated, open until midnight", icon: "waves" },
    { name: "Rooftop bar", short: "Cocktails and DJ, Thu–Sat", icon: "coffee" },
    { name: "Charcoal kitchen", short: "Open until 1 AM", icon: "utensils" },
    { name: "Blackout rooms", short: "Sleep until you want to", icon: "lock" },
    { name: "Night spa", short: "Treatments until 11 PM", icon: "leaf" },
    { name: "House car", short: "Anywhere in Gulshan, free", icon: "car" },
  ],
  nearby: [
    { name: "Gulshan 2 circle", time: "4 min", mode: "walk" },
    { name: "Banani Road 11", time: "10 min", mode: "drive" },
    { name: "Gulshan Lake", time: "6 min", mode: "walk" },
    { name: "Dhaka airport", time: "25 min", mode: "drive" },
  ],
  gallery: [`${A}/night.jpg`, `${A}/sunset.jpg`, `${A}/lounge.jpg`, `${S}/lobby.jpg`, `${A}/night-room.jpg`, `${A}/suite.jpg`],
  pagePhotos: { rooms: `${A}/night-room.jpg`, experiences: `${A}/pool-2.jpg`, offers: `${A}/sunset.jpg`, explore: `${A}/night.jpg` },
  rooms: [
    { id: "x1", slug: "midnight-king", name: "Midnight King", kind: "room", short: "Dark wood, blackout glass, a very good bed.", description: "Smoked oak, blackout glass and a bed you will not want to leave. Late check-out until 1 PM is standard.", fromPrice: 24000, maxAdults: 2, maxChildren: 0, bed: "1 King bed", sizeSqft: 420, view: "City lights", units: 30, amenities: ["Blackout glass", "Rain shower", "Vinyl player", "Free minibar", "Free Wi-Fi"], photos: [`${A}/night-room.jpg`, `${A}/desk.jpg`], featured: true },
    { id: "x2", slug: "skyline-studio", name: "Skyline Studio", kind: "room", short: "A wall of glass over Gulshan.", description: "A corner studio with floor-to-ceiling windows, a lounge chair and a cocktail cabinet.", fromPrice: 32000, maxAdults: 2, maxChildren: 0, bed: "1 King bed", sizeSqft: 560, view: "Skyline", units: 18, amenities: ["Corner windows", "Cocktail cabinet", "Bathtub", "Free Wi-Fi"], photos: [`${A}/lounge.jpg`, `${A}/sunset.jpg`], featured: true },
    { id: "x3", slug: "obsidian-suite", name: "Obsidian Suite", kind: "suite", short: "The top floor, a terrace and a private bar.", description: "On the 21st floor with a private terrace, a bar of your own and a bathtub at the window.", fromPrice: 68000, maxAdults: 2, maxChildren: 1, bed: "1 King bed", sizeSqft: 1100, view: "Skyline · terrace", units: 4, amenities: ["Private terrace", "Private bar", "Window bathtub", "Butler", "Free Wi-Fi"], photos: [`${A}/suite.jpg`, `${A}/pool-2.jpg`], featured: true },
  ],
  services: [
    { id: "s1", name: "Airport car, any hour", category: "transfer", short: "Including the 3 AM flights.", price: 5500, unit: "per trip", addToStay: true },
    { id: "s2", name: "Rooftop cabana", category: "celebration", short: "A private cabana by the pool with a bottle.", price: 25000, unit: "per evening", photo: `${A}/pool-2.jpg`, addToStay: true },
    { id: "s3", name: "Midnight massage", category: "spa", short: "Sixty minutes, until 11 PM.", price: 9000, unit: "per person", photo: `${A}/night-room.jpg`, addToStay: true },
  ],
  outlets: [
    { id: "d1", name: "Ember", kind: "restaurant", short: "A charcoal kitchen: grilled fish, smoked meats, small plates to share.", hours: "6 PM – 1 AM", location: "Floor 21", photo: `${A}/sunset.jpg`, tableRequest: true },
    { id: "d2", name: "Twenty-Two", kind: "bar", short: "The rooftop bar. Cocktails, a DJ from Thursday to Saturday.", hours: "5 PM – 2 AM", location: "Rooftop, floor 22", photo: `${A}/night.jpg`, tableRequest: true },
    { id: "d3", name: "Lobby Noir", kind: "cafe", short: "Coffee all day, wine all night.", hours: "7 AM – midnight", location: "Lobby", tableRequest: false },
  ],
  offers: [
    { id: "o1", title: "Stay late", short: "Check out at 6 PM on Sundays.", kind: "discount", value: "Free 6 PM", conditions: "Saturday night stays, book direct." },
    { id: "o2", title: "Rooftop weekend", short: "A cabana evening included.", kind: "discount", value: "15% off", conditions: "Two nights, Thursday to Saturday." },
  ],
  reviews: [
    { id: "r1", name: "Rafiq S.", from: "Dhaka", score: 5, text: "The rooftop at midnight is the best room in Dhaka.", stayed: "Oct 2026" },
    { id: "r2", name: "Emma W.", from: "Australia", score: 5, text: "Blackout rooms and a 1 PM check-out. Finally.", stayed: "Sep 2026" },
    { id: "r3", name: "Sadia M.", from: "Dhaka", score: 4.5, text: "Ember's grilled fish — order two.", stayed: "Aug 2026" },
    { id: "r4", name: "Leo F.", from: "Italy", score: 5, text: "Stylish, quiet, and the staff never seem to sleep.", stayed: "Oct 2026" },
    { id: "r5", name: "Nusrat J.", from: "Chattogram", score: 5, text: "Suite terrace at sunset was unreal.", stayed: "Jul 2026" },
  ],
  reviewScore: 4.8,
  reviewCount: 389,
  dayPlan: [
    { time: "17:30", title: "Golden hour", text: "The pool deck turns orange. First drinks at Twenty-Two." },
    { time: "19:00", title: "Lights on", text: "The city switches on below you. Dinner at Ember from seven." },
    { time: "22:00", title: "The DJ starts", text: "Thursday to Saturday on the rooftop. Quiet floors below, always." },
    { time: "00:00", title: "Midnight swim", text: "The sky pool stays open until midnight, heated." },
    { time: "13:00", title: "Check-out, slowly", text: "Late check-out is standard. Breakfast is served until noon." },
  ],
  theme: { master: "noir", id: "sand", heading: "serif" },
  propertyType: "hotel",
  plan: "ultra",
};
