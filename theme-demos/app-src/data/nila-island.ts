// DEMO DATA — Nila Island is a fictional island villa resort used to design the ISLE luxury theme.
// Photos: Pexels (free licence), demo only. No real resort is shown or named.
import type { Hotel } from "@/lib/types";
import { luxBase } from "./_lux";

const P = "/demo/nila-island";

export const nilaIsland: Hotel = {
  ...luxBase("NILA10", "01377-000000"),
  slug: "nila-island",
  name: "Nila Island Villas",
  type: "Island villa resort",
  stars: 5,
  tagline: "An island of twenty-two villas",
  intro: "Private villas over the lagoon and along a white beach, a forty-minute speedboat from Cox's Bazar. Barefoot days, very good food, nobody in a hurry.",
  logoText: "Nila",
  heroPhoto: `${P}/hero.jpg`,
  area: "Sonadia Island",
  city: "Cox's Bazar",
  address: "Sonadia Island, Maheshkhali, Cox's Bazar (speedboat from Nuniachhara jetty)",
  phone: "+880 1377-000000",
  whatsapp: "+8801377000000",
  email: "arrive@nila.example",
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
  highlights: ["22 private villas", "Speedboat arrival", "House reef"],
  facilities: [
    { name: "Private pools", short: "In every water villa", icon: "waves" },
    { name: "Villa host", short: "One host for your whole stay", icon: "shield" },
    { name: "Two restaurants", short: "Sea grill and the lagoon table", icon: "utensils" },
    { name: "Overwater spa", short: "Six treatment rooms", icon: "leaf" },
    { name: "Dive & snorkel", short: "House reef, guided daily", icon: "boat" },
    { name: "Speedboat", short: "Arrival and island hops", icon: "plane" },
  ],
  nearby: [
    { name: "Nuniachhara jetty (speedboat)", time: "40 min", mode: "drive" },
    { name: "Cox's Bazar airport", time: "55 min", mode: "drive" },
    { name: "Maheshkhali island", time: "25 min", mode: "drive" },
    { name: "Private sandbank", time: "10 min", mode: "drive" },
  ],
  gallery: [`${P}/atoll.jpg`, `${P}/lagoon.jpg`, `${P}/walkway.jpg`, `${P}/beach.jpg`, `${P}/sunset.jpg`, `${P}/jetty.jpg`, `${P}/palm.jpg`, `${P}/villas-row.jpg`],
  pagePhotos: { rooms: `${P}/villas-row.jpg`, experiences: `${P}/lagoon.jpg`, offers: `${P}/sunset.jpg`, explore: `${P}/atoll.jpg` },
  rooms: [
    { id: "n1", slug: "lagoon-pool-villa", name: "Lagoon Pool Villa", kind: "villa", bedrooms: 1, short: "Over the water, with a private pool.", description: "A thatched villa on stilts over the lagoon with a private pool, a glass floor panel and steps straight into the sea.", fromPrice: 68000, maxAdults: 2, maxChildren: 1, bed: "1 King bed", sizeSqft: 1150, view: "Over water · lagoon", units: 8, amenities: ["Private pool", "Glass floor", "Sea steps", "Outdoor shower", "Villa host", "Free Wi-Fi"], photos: [`${P}/pool-villa.jpg`, `${P}/deck-pool.jpg`], featured: true, specs: ["Private pool", "Sea steps"] },
    { id: "n2", slug: "sunset-water-villa", name: "Sunset Water Villa", kind: "villa", bedrooms: 1, short: "Faces west for the sunset.", description: "At the far end of the walkway, facing west. A deep bathtub by the window and a deck that catches the last light.", fromPrice: 74000, maxAdults: 2, maxChildren: 0, bed: "1 King bed", sizeSqft: 1250, view: "Over water · sunset", units: 6, amenities: ["Sunset deck", "Window bathtub", "Plunge pool", "Villa host", "Free Wi-Fi"], photos: [`${P}/water-villa.jpg`, `${P}/sunset.jpg`], featured: true },
    { id: "n3", slug: "reef-residence", name: "Reef Residence", kind: "villa", bedrooms: 2, short: "Two bedrooms above the house reef.", description: "Two bedrooms, a long pool and a sundeck right above the house reef. For families or two couples.", fromPrice: 128000, maxAdults: 4, maxChildren: 2, bed: "2 King beds", sizeSqft: 2400, view: "Over water · reef", units: 2, amenities: ["Two bedrooms", "Long pool", "Reef deck", "Butler", "Free Wi-Fi"], photos: [`${P}/reef-villa.jpg`, `${P}/lagoon.jpg`] },
    { id: "n4", slug: "beach-villa", name: "Beach Villa", kind: "villa", bedrooms: 1, short: "Steps from the sand, under the palms.", description: "A garden villa on the white beach, shaded by palms, with an outdoor bath and a hammock at the waterline.", fromPrice: 52000, maxAdults: 2, maxChildren: 2, bed: "1 King bed", sizeSqft: 980, view: "Beach", units: 6, amenities: ["Beach front", "Outdoor bath", "Hammock", "Villa host", "Free Wi-Fi"], photos: [`${P}/palm.jpg`, `${P}/beach.jpg`] },
  ],
  services: [
    { id: "s1", name: "Speedboat arrival", category: "transfer", short: "From Nuniachhara jetty, with cold towels.", price: 9000, unit: "per boat, each way", addToStay: true },
    { id: "s2", name: "Sandbank dinner", category: "celebration", short: "A table for two on a private sandbank at sunset.", price: 38000, unit: "per couple", photo: `${P}/sunset.jpg`, addToStay: true },
    { id: "s3", name: "Reef snorkel", category: "activity", short: "Guided, with gear, every morning at nine.", price: 4500, unit: "per person", photo: `${P}/lagoon.jpg`, addToStay: true },
    { id: "s4", name: "Overwater massage", category: "spa", short: "Ninety minutes above the lagoon.", price: 14000, unit: "per person", photo: `${P}/walkway.jpg`, addToStay: true },
    { id: "s5", name: "Island hop", category: "activity", short: "Half a day by speedboat to empty beaches.", price: 22000, unit: "per boat", photo: `${P}/atoll.jpg`, addToStay: true },
  ],
  outlets: [
    { id: "d1", name: "The Lagoon Table", kind: "restaurant", short: "Breakfast to dinner over the water. Fish from the morning boats.", hours: "7 AM – 11 PM", location: "Main jetty", photo: `${P}/jetty.jpg`, tableRequest: true },
    { id: "d2", name: "Sea Grill", kind: "restaurant", short: "Grilled seafood on the sand, lanterns at night.", hours: "6 PM – 11 PM", location: "Beach", tableRequest: true },
    { id: "d3", name: "Driftwood Bar", kind: "bar", short: "Sunset drinks at the end of the walkway.", hours: "4 PM – 1 AM", location: "West walkway", tableRequest: false },
  ],
  offers: [
    { id: "o1", title: "Stay four, pay three", short: "The fourth night is ours.", kind: "discount", value: "4 for 3", conditions: "Any villa, May–September, book direct.", photo: `${P}/villas-row.jpg` },
    { id: "o2", title: "Honeymoon", short: "Sandbank dinner and a couples massage.", kind: "discount", value: "15% off", conditions: "Water villas, 3 nights or more.", photo: `${P}/sunset.jpg` },
  ],
  reviews: [
    { id: "r1", name: "Farzana & Imran", from: "Dhaka", score: 5, text: "We have stayed in the Maldives. This felt more personal — our host knew our names before the boat docked.", stayed: "Oct 2026" },
    { id: "r2", name: "Oliver H.", from: "UK", score: 5, text: "The reef right under the villa is the best alarm clock.", stayed: "Sep 2026" },
    { id: "r3", name: "Nadia R.", from: "Chattogram", score: 4.5, text: "Sandbank dinner was the highlight of our year.", stayed: "Aug 2026" },
    { id: "r4", name: "Kenji T.", from: "Japan", score: 5, text: "Quiet, clean and the fish was excellent.", stayed: "Oct 2026" },
    { id: "r5", name: "Sabrina K.", from: "Dhaka", score: 5, text: "Kids loved the snorkel. We loved the silence.", stayed: "Jul 2026" },
  ],
  reviewScore: 4.9,
  reviewCount: 214,
  dayPlan: [
    { time: "6:30", title: "Low tide walk", text: "The sandbar appears at dawn. Walk it before breakfast." },
    { time: "9:00", title: "Reef snorkel", text: "Guided from the main jetty while the water is clearest." },
    { time: "13:00", title: "Lunch at the Lagoon Table", text: "Whatever the morning boats brought in." },
    { time: "17:30", title: "High tide, sunset", text: "Drinks at Driftwood Bar as the water comes up under the villas." },
    { time: "20:00", title: "Dinner on the sand", text: "Sea Grill, lanterns, very slow evenings." },
  ],
  theme: { master: "isle", id: "lagoon", heading: "serif" },
  propertyType: "resort",
  plan: "ultra",
};
