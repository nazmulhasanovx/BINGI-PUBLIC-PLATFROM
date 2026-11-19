// DEMO DATA — Maison Gulshan is a fictional grand city hotel used to design the MAISON luxury theme.
// Photos: Pexels (free licence) + existing demo photos, demo only. No real hotel is named.
import type { Hotel } from "@/lib/types";
import { luxBase } from "./_lux";

const P = "/demo/maison-gulshan";
const S = "/demo/sea-pearl";

export const maisonGulshan: Hotel = {
  ...luxBase("MAISON10", "01399-000000"),
  slug: "maison-gulshan",
  name: "Maison Gulshan",
  type: "Grand hotel",
  stars: 5,
  tagline: "The grand hotel of Gulshan",
  intro: "Ninety-six rooms and suites behind a white colonnade on Gulshan Avenue. Afternoon tea in the Salon, a brasserie that stays open late and a concierge who knows everyone.",
  logoText: "Maison",
  heroPhoto: `${P}/hero.jpg`,
  area: "Gulshan Avenue",
  city: "Dhaka",
  address: "House 11, Gulshan Avenue, Gulshan 1, Dhaka 1212",
  phone: "+880 1399-000000",
  whatsapp: "+8801399000000",
  email: "concierge@maison.example",
  checkIn: "3:00 PM",
  checkOut: "12:00 PM",
  highlights: ["96 rooms & suites", "Afternoon tea", "24-hour concierge"],
  facilities: [
    { name: "The Salon", short: "Afternoon tea, 3–6 PM", icon: "coffee" },
    { name: "Brasserie", short: "Open until 1 AM", icon: "utensils" },
    { name: "Indoor pool & spa", short: "Under a glass roof", icon: "waves" },
    { name: "Concierge", short: "Tables, cars, tickets", icon: "shield" },
    { name: "Fitness hall", short: "24 hours", icon: "dumbbell" },
    { name: "Chauffeur", short: "Airport and city", icon: "car" },
  ],
  nearby: [
    { name: "Gulshan 1 circle", time: "3 min", mode: "walk" },
    { name: "Gulshan Lake Park", time: "8 min", mode: "walk" },
    { name: "Diplomatic Zone", time: "6 min", mode: "drive" },
    { name: "Dhaka airport", time: "25 min", mode: "drive" },
  ],
  gallery: [`${P}/salon.jpg`, `${P}/chandelier.jpg`, `${P}/ceiling.jpg`, `${P}/windows.jpg`, `${P}/columns.jpg`, `${S}/lobby.jpg`],
  pagePhotos: { rooms: `${S}/room-suite.jpg`, experiences: `${P}/salon.jpg`, offers: `${P}/windows.jpg`, explore: `${P}/hero.jpg` },
  rooms: [
    { id: "m1", slug: "grand-suite", name: "The Grand Suite", kind: "suite", short: "The corner suite over the avenue.", description: "Two rooms on the corner of the second floor: a salon with a writing desk, a bedroom in silk and a marble bath under the window.", fromPrice: 72000, maxAdults: 2, maxChildren: 1, bed: "1 King bed", sizeSqft: 1200, view: "Gulshan Avenue", units: 2, amenities: ["Private salon", "Marble bath", "Butler", "Afternoon tea in suite", "Free Wi-Fi"], photos: [`${S}/room-suite.jpg`, `${P}/salon.jpg`], featured: true },
    { id: "m2", slug: "salon-suite", name: "Salon Suite", kind: "suite", short: "A sitting room and a bedroom, side by side.", description: "A proper sitting room with high windows, a separate bedroom and a dressing room. Our most requested suite.", fromPrice: 46000, maxAdults: 2, maxChildren: 1, bed: "1 King bed", sizeSqft: 820, view: "Courtyard", units: 10, amenities: ["Sitting room", "Dressing room", "Marble bath", "Free Wi-Fi"], photos: [`${S}/room-super-deluxe.jpg`, `${P}/windows.jpg`], featured: true },
    { id: "m3", slug: "deluxe-room", name: "Deluxe Room", kind: "room", short: "Classic, quiet and very comfortable.", description: "Tall windows, a king or twin beds, a marble bathroom and the quiet of the inner courtyard.", fromPrice: 26000, maxAdults: 2, maxChildren: 1, bed: "1 King or 2 Twin", sizeSqft: 460, view: "Courtyard", units: 60, amenities: ["Marble bath", "Nespresso", "Smart TV", "Free Wi-Fi"], photos: [`${S}/room-deluxe.jpg`, `${S}/lounge.jpg`] },
    { id: "m4", slug: "classic-room", name: "Classic Room", kind: "room", short: "Our smallest room, with every detail.", description: "Compact and elegant, for one or two, with the same linens, bath and service as our suites.", fromPrice: 19500, maxAdults: 2, maxChildren: 0, bed: "1 Queen bed", sizeSqft: 360, view: "City", units: 24, amenities: ["Rain shower", "Nespresso", "Free Wi-Fi"], photos: [`/demo/altura/twin.jpg`, `${S}/lobby.jpg`] },
  ],
  services: [
    { id: "s1", name: "Chauffeured airport car", category: "transfer", short: "Meet and greet at arrivals.", price: 6500, unit: "per trip", addToStay: true },
    { id: "s2", name: "Afternoon tea for two", category: "dining", short: "In the Salon, with the string trio on Fridays.", price: 7500, unit: "for two", photo: `${P}/salon.jpg`, addToStay: true },
    { id: "s3", name: "Anniversary turndown", category: "celebration", short: "Flowers, champagne and a handwritten card.", price: 9000, unit: "per stay", photo: `${P}/chandelier.jpg`, addToStay: true },
  ],
  outlets: [
    { id: "d1", name: "The Salon", kind: "cafe", short: "Afternoon tea under the painted ceiling. Scones, pastries and Darjeeling.", hours: "3 PM – 6 PM", location: "Ground floor", photo: `${P}/salon.jpg`, tableRequest: true },
    { id: "d2", name: "Brasserie Onze", kind: "restaurant", short: "Classic brasserie dishes and Bengali specials, late into the night.", hours: "12 PM – 1 AM", location: "Avenue side", tableRequest: true },
    { id: "d3", name: "The Library Bar", kind: "bar", short: "Leather chairs, old books and a very good martini.", hours: "5 PM – 1 AM", location: "First floor", tableRequest: false },
  ],
  offers: [
    { id: "o1", title: "A weekend at the Maison", short: "Breakfast and afternoon tea included.", kind: "discount", value: "20% off", conditions: "Friday and Saturday nights, book direct." },
    { id: "o2", title: "Stay longer", short: "Every fourth night is ours.", kind: "discount", value: "4 for 3", conditions: "Any room, all year." },
  ],
  reviews: [
    { id: "r1", name: "Sir David L.", from: "UK", score: 5, text: "Service the way it used to be — and the way it should be.", stayed: "Oct 2026" },
    { id: "r2", name: "Mehnaz Q.", from: "Dhaka", score: 5, text: "Afternoon tea in the Salon is now our family tradition.", stayed: "Sep 2026" },
    { id: "r3", name: "Hiro N.", from: "Japan", score: 4.5, text: "Quiet rooms in the middle of Gulshan. Remarkable.", stayed: "Aug 2026" },
    { id: "r4", name: "Ayesha R.", from: "Dubai", score: 5, text: "The concierge found us a table nobody else could.", stayed: "Oct 2026" },
    { id: "r5", name: "Karim B.", from: "Dhaka", score: 5, text: "Best martini in the city.", stayed: "Jul 2026" },
  ],
  reviewScore: 4.8,
  reviewCount: 642,
  theme: { master: "maison", id: "graphite", heading: "serif" },
  propertyType: "hotel",
  plan: "ultra",
};
