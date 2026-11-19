// DEMO DATA — Haven Lalakhal is a fictional wellness retreat used to design the HAVEN luxury theme.
// Photos: existing Unsplash demo photos, demo only. No real retreat is named.
import type { Hotel } from "@/lib/types";
import { luxBase } from "./_lux";

const SH = "/demo/shalbon";
const CC = "/demo/coral-cove";
const AZ = "/demo/azure-bay";

export const havenLalakhal: Hotel = {
  ...luxBase("HAVEN10", "01322-111111"),
  slug: "haven-lalakhal",
  name: "Haven Lalakhal",
  type: "Wellness retreat",
  stars: 5,
  tagline: "Come to rest. Leave restored.",
  intro: "Eighteen pool villas above the blue water of Lalakhal, a spa built around an old tea-garden spring and a kitchen that cooks from its own garden. Three-, five- and seven-night programmes.",
  logoText: "Haven",
  heroPhoto: `${SH}/infinity.jpg`,
  area: "Lalakhal",
  city: "Sylhet",
  address: "Lalakhal Tea Estate Road, Jaintiapur, Sylhet",
  phone: "+880 1322-111111",
  whatsapp: "+8801322111111",
  email: "rest@haven.example",
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
  highlights: ["Phones rest at reception, if you like", "Food from our own garden", "One therapist for your whole stay"],
  facilities: [
    { name: "Spring spa", short: "Eight rooms, hammam and cold plunge", icon: "leaf" },
    { name: "Infinity pool", short: "Over the river valley", icon: "waves" },
    { name: "Yoga pavilion", short: "Two classes a day", icon: "sun" },
    { name: "Garden kitchen", short: "Plant-forward, nothing fried", icon: "utensils" },
    { name: "Quiet hours", short: "9 PM – 8 AM, whole retreat", icon: "clock" },
    { name: "Private pickup", short: "From Sylhet airport", icon: "car" },
  ],
  nearby: [
    { name: "Lalakhal river ghat", time: "6 min", mode: "walk" },
    { name: "Jaflong", time: "35 min", mode: "drive" },
    { name: "Sylhet city", time: "50 min", mode: "drive" },
    { name: "Osmani airport", time: "55 min", mode: "drive" },
  ],
  gallery: [`${CC}/pool-jungle.jpg`, `${SH}/plunge.jpg`, `${SH}/pool-trees.jpg`, `${AZ}/exp-spa.jpg`, `${SH}/bathroom.jpg`, `${CC}/garden.jpg`],
  pagePhotos: { rooms: `${SH}/bedroom.jpg`, experiences: `${AZ}/exp-spa.jpg`, offers: `${SH}/pool-trees.jpg`, explore: `${CC}/garden.jpg` },
  rooms: [
    { id: "h1", slug: "valley-pool-villa", name: "Valley Pool Villa", kind: "villa", bedrooms: 1, short: "A plunge pool facing the river valley.", description: "Stone, linen and a plunge pool facing the valley. A daybed on the deck and an outdoor rain shower.", fromPrice: 38000, maxAdults: 2, maxChildren: 0, bed: "1 King bed", sizeSqft: 900, view: "River valley", units: 10, amenities: ["Plunge pool", "Outdoor shower", "Yoga mats", "No TV (on request)", "Free Wi-Fi"], photos: [`${SH}/plunge.jpg`, `${SH}/bedroom.jpg`], featured: true },
    { id: "h2", slug: "garden-sanctuary", name: "Garden Sanctuary", kind: "villa", bedrooms: 1, short: "Hidden in the herb garden.", description: "A quiet villa in the herb garden, with a soaking tub, a reading nook and morning sun on the terrace.", fromPrice: 29000, maxAdults: 2, maxChildren: 0, bed: "1 King bed", sizeSqft: 720, view: "Garden", units: 6, amenities: ["Soaking tub", "Reading nook", "Herb garden", "Free Wi-Fi"], photos: [`${SH}/bed-classic.jpg`, `${SH}/bathroom.jpg`] },
    { id: "h3", slug: "spring-residence", name: "Spring Residence", kind: "villa", bedrooms: 2, short: "Two bedrooms and a private treatment room.", description: "Two bedrooms, a private treatment room and a long pool — for friends or families on a programme together.", fromPrice: 64000, maxAdults: 4, maxChildren: 1, bed: "2 King beds", sizeSqft: 1600, view: "Valley and garden", units: 2, amenities: ["Private treatment room", "Long pool", "Kitchenette", "Free Wi-Fi"], photos: [`${SH}/pool-trees.jpg`, `${CC}/room-wood.jpg`] },
  ],
  services: [
    { id: "s1", name: "Airport pickup", category: "transfer", short: "Private car from Osmani airport, with herbal tea.", price: 5000, unit: "per trip", addToStay: true },
    { id: "s2", name: "Spring hammam ritual", category: "spa", short: "Steam, scrub, cold plunge, ninety minutes.", price: 12000, unit: "per person", photo: `${AZ}/exp-spa.jpg`, addToStay: true },
    { id: "s3", name: "Sunrise yoga", category: "activity", short: "Every morning at 6:30 in the pavilion.", price: 0, unit: "included", photo: `${SH}/infinity.jpg`, addToStay: false },
    { id: "s4", name: "Five-night reset", category: "stay", short: "Daily treatment, all meals, consultation.", price: 95000, unit: "per person", addToStay: true },
    { id: "s5", name: "Garden lunch", category: "dining", short: "Three courses from the morning harvest.", price: 2800, unit: "per person", photo: `${CC}/garden.jpg`, addToStay: true },
    { id: "s6", name: "River sound bath", category: "activity", short: "Forty minutes by the water at dusk.", price: 3500, unit: "per person", photo: `${CC}/pool-jungle.jpg`, addToStay: true },
  ],
  outlets: [
    { id: "d1", name: "The Garden Kitchen", kind: "restaurant", short: "Plant-forward, local fish twice a week. Menus written by our nutritionist and our cook together.", hours: "7 AM – 9 PM", location: "Main pavilion", photo: `${CC}/garden.jpg`, tableRequest: true },
    { id: "d2", name: "Tea House", kind: "cafe", short: "Estate teas and tonics, all day.", hours: "7 AM – 8 PM", location: "Spring garden", tableRequest: false },
  ],
  offers: [
    { id: "o1", title: "Seven nights, one free", short: "Stay seven, pay for six.", kind: "discount", value: "7 for 6", conditions: "Any villa, any programme." },
  ],
  reviews: [
    { id: "r1", name: "Tasnim A.", from: "Dhaka", score: 5, text: "I slept nine hours on the second night for the first time in years.", stayed: "Oct 2026" },
    { id: "r2", name: "Sophie L.", from: "Germany", score: 5, text: "The hammam ritual and the silence after it — worth the journey alone.", stayed: "Sep 2026" },
    { id: "r3", name: "Rehana K.", from: "London", score: 5, text: "Kind, unhurried people. Food I still think about.", stayed: "Aug 2026" },
    { id: "r4", name: "Mahbub R.", from: "Chattogram", score: 4.5, text: "Leaving my phone at reception was the best decision.", stayed: "Oct 2026" },
    { id: "r5", name: "Ana P.", from: "Spain", score: 5, text: "A real retreat, not a hotel with a spa.", stayed: "Jul 2026" },
  ],
  reviewScore: 4.9,
  reviewCount: 127,
  dayPlan: [
    { time: "6:30", title: "Sunrise yoga", text: "In the pavilion as the mist lifts off the river." },
    { time: "8:00", title: "Garden breakfast", text: "Fruit, grains and eggs from the farm next door." },
    { time: "11:00", title: "Your treatment", text: "With the same therapist every day of your stay." },
    { time: "16:00", title: "Tea and quiet", text: "Estate teas in the spring garden. No schedule." },
    { time: "18:30", title: "Sound bath by the river", text: "Forty minutes of sound and water as the light goes." },
    { time: "21:00", title: "Quiet hours", text: "The whole retreat goes quiet until morning." },
  ],
  theme: { master: "haven", id: "sand", heading: "serif" },
  propertyType: "resort",
  plan: "ultra",
};
