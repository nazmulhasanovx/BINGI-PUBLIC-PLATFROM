// DEMO DATA — Azure Bay Grand Resort is a fictional property used for design and testing.
// Photos are cropped from the GRAND reference screens; real hotels upload their own in HMS.
import type { Hotel } from "@/lib/types";

const P = "/demo/azure-bay";

export const azureBay: Hotel = {
  slug: "azure-bay",
  name: "Azure Bay Grand Resort",
  type: "5-star beach resort",
  stars: 5,
  tagline: "Where the hills meet the sea at Inani.",
  intro:
    "A quiet beachfront resort on Marine Drive with garden rooms, ocean suites and two private pool villas — a few steps from Inani beach.",
  logoText: "Azure Bay",
  heroPhoto: `${P}/hero.jpg`,
  area: "Inani, Marine Drive",
  city: "Cox's Bazar",
  country: "Bangladesh",
  address: "Marine Drive, Inani, Ukhia, Cox's Bazar",
  phone: "+880 1700-000000",
  whatsapp: "+8801700000000",
  email: "stay@azurebay.example",
  currency: "BDT",
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
  highlights: ["Beachfront", "Infinity pool", "Spa"],
  facilities: [
    { name: "Infinity pool", short: "Sea-facing, open 7 AM – 9 PM", icon: "waves" },
    { name: "Private beach access", short: "Two-minute walk", icon: "umbrella" },
    { name: "Spa", short: "Massage and treatments", icon: "flower" },
    { name: "Ocean Table", short: "All-day restaurant", icon: "utensils" },
    { name: "Meeting room", short: "Up to 30 guests", icon: "presentation" },
    { name: "Airport pickup", short: "On request", icon: "car" },
  ],
  pagePhotos: { rooms: `${P}/room-premier-ocean.jpg`, dining: `${P}/dining-venue.jpg`, experiences: `${P}/exp-beach.jpg`, offers: `${P}/offer-couple.jpg`, explore: `${P}/gallery-1.jpg`, events: `${P}/events.jpg` },
  gallery: [`${P}/gallery-1.jpg`, `${P}/gallery-2.jpg`, `${P}/gallery-3.jpg`, `${P}/gallery-4.jpg`, `${P}/gallery-5.jpg`],
  rooms: [
    {
      id: "r1", slug: "deluxe-garden-view", name: "Deluxe Garden View", kind: "room",
      short: "Quiet room facing the garden, with a private terrace.",
      description: "A calm, light-filled room on the first floor that opens onto a small terrace over the tropical garden.",
      fromPrice: 12000, maxAdults: 2, maxChildren: 1, bed: "1 King bed", sizeSqft: 380, view: "Garden",
      units: 8, amenities: ["Terrace", "Air conditioning", "Rain shower", "Smart TV", "Free Wi-Fi", "Tea & coffee"],
      photos: [`${P}/room-deluxe-garden.jpg`, `${P}/gallery-2.jpg`, `${P}/gallery-4.jpg`], featured: true,
    },
    {
      id: "r2", slug: "premier-ocean-view", name: "Premier Ocean View", kind: "room",
      short: "Wide sea views from the second floor.",
      description: "Floor-to-ceiling windows look straight over the bay. Ideal for couples who want the sunrise from bed.",
      fromPrice: 16000, maxAdults: 2, maxChildren: 1, bed: "1 King bed", sizeSqft: 420, view: "Ocean",
      units: 6, amenities: ["Sea view", "Balcony", "Bathtub", "Smart TV", "Free Wi-Fi", "Minibar"],
      photos: [`${P}/room-premier-ocean.jpg`, `${P}/room-ocean-suite-2.jpg`, `${P}/gallery-3.jpg`],
    },
    {
      id: "r3", slug: "executive-ocean-suite", name: "Executive Ocean Suite", kind: "suite",
      short: "Separate living room and a large sea-view balcony.",
      description: "A top-floor suite with a separate living area, dining corner and a wide balcony facing the sea.",
      fromPrice: 25000, maxAdults: 3, maxChildren: 1, bed: "1 King bed + sofa bed", sizeSqft: 640, view: "Ocean",
      units: 4, amenities: ["Living room", "Sea-view balcony", "Bathtub", "Nespresso", "Free Wi-Fi", "Late check-out on request"],
      photos: [`${P}/room-ocean-suite.jpg`, `${P}/room-ocean-suite-2.jpg`, `${P}/gallery-3.jpg`], featured: true,
    },
    {
      id: "r4", slug: "family-resort-suite", name: "Family Resort Suite", kind: "suite",
      short: "Two queen beds and space for children.",
      description: "Made for families: two queen beds, a lounge area and a terrace onto the garden lawn.",
      fromPrice: 32000, maxAdults: 4, maxChildren: 2, bed: "2 Queen beds", sizeSqft: 720, view: "Garden",
      units: 4, amenities: ["Terrace", "Two bathrooms", "Kids' amenities", "Smart TV", "Free Wi-Fi", "Minibar"],
      photos: [`${P}/room-family.jpg`, `${P}/gallery-2.jpg`, `${P}/gallery-5.jpg`],
    },
    {
      id: "r5", slug: "private-pool-villa", name: "Private Pool Villa", kind: "villa",
      short: "Your own pool, garden and outdoor lounge.",
      description: "A standalone villa in the beach zone with a private plunge pool, outdoor lounge and two bedrooms.",
      fromPrice: 55000, maxAdults: 4, maxChildren: 2, bed: "1 King + 2 Single", sizeSqft: 1400, view: "Pool & garden",
      units: 2, amenities: ["Private pool", "2 bedrooms", "Outdoor lounge", "Kitchenette", "Butler on call", "Free Wi-Fi"],
      photos: [`${P}/room-pool-villa.jpg`, `${P}/room-pool-suite.jpg`, `${P}/gallery-1.jpg`], featured: true,
    },
  ],
  services: [
    { id: "s1", name: "Signature spa massage", category: "spa", short: "60 minutes, aromatherapy oils.", price: 4500, unit: "per person", photo: `${P}/exp-spa.jpg`, addToStay: true },
    { id: "s2", name: "Airport pickup", category: "transfer", short: "Cox's Bazar Airport to the resort.", price: 3500, unit: "per car", photo: `${P}/exp-transfer.jpg`, addToStay: true },
    { id: "s3", name: "Beach BBQ dinner", category: "dining", short: "Seafood grill by the water.", price: 2800, unit: "per person", photo: `${P}/exp-bbq.jpg`, addToStay: true },
    { id: "s4", name: "Room decoration", category: "celebration", short: "Flowers and candles for a special night.", price: 3000, unit: "per setup", photo: `${P}/exp-decoration.jpg`, addToStay: true },
    { id: "s5", name: "Breakfast", category: "stay", short: "Buffet at Ocean Table.", price: 1200, unit: "per adult", addToStay: true },
    { id: "s6", name: "Pool day", category: "activity", short: "Sun loungers, towels and a welcome drink.", price: 1500, unit: "per person", photo: `${P}/exp-pool.jpg`, addToStay: true },
  ],
  outlets: [
    { id: "o1", name: "Ocean Table", kind: "restaurant", short: "All-day dining with local seafood and international plates.", hours: "7:00 AM – 11:00 PM", location: "Beachfront", photo: `${P}/dining-hero.jpg`, tableRequest: true },
    { id: "o2", name: "In-room dining", kind: "room-service", short: "A shorter menu, served to your room.", hours: "24 hours (limited menu at night)", location: "Your room", photo: `${P}/gallery-2.jpg`, tableRequest: false },
  ],
  menu: [
    { id: "m1", outletId: "o1", name: "Spiced grill platter", tags: ["Grill"], short: "Chicken, beef and seasonal vegetables.", price: 1650, photo: `${P}/dish-platter.jpg` },
    { id: "m2", outletId: "o1", name: "Chicken bhuna & naan", tags: ["Local"], short: "Slow-cooked, with butter naan.", price: 950, photo: `${P}/dish-bhuna.jpg` },
    { id: "m3", outletId: "o1", name: "Garden salad", tags: ["Fresh"], short: "Greens, citrus and toasted seeds.", price: 650, photo: `${P}/dish-salad.jpg` },
    { id: "m4", outletId: "o1", name: "Salmon poke bowl", tags: ["Fresh"], short: "Rice, avocado, egg and greens.", price: 1150, photo: `${P}/dish-bowl.jpg` },
    { id: "m5", outletId: "o1", name: "Strawberry panna cotta", tags: ["Dessert"], short: "Vanilla cream, fresh berries.", price: 550, photo: `${P}/dish-dessert.jpg` },
  ],
  offers: [
    { id: "f1", title: "Stay longer, pay less", short: "Book 3 nights or more on any room.", kind: "discount", value: "15% off", conditions: "Min. 3 nights. Not combinable.", photo: `${P}/offer-escape.jpg` },
    { id: "f2", title: "Weekday escape", short: "Sunday to Wednesday check-ins.", kind: "discount", value: "10% off", conditions: "Check-in Sun–Wed.", photo: `${P}/offer-couple.jpg` },
    { id: "f3", title: "Family weekend", short: "Two nights with breakfast and pool day.", kind: "package", value: "Package", conditions: "Packages are planned — hidden until live.", photo: `${P}/offer-family.jpg` },
  ],
  promoCodes: [
    { code: "WELCOME10", percent: 10, label: "Welcome 10%" },
    { code: "STAY3", percent: 20, minNights: 3, label: "3+ nights 20%" },
  ],
  reviews: [
    { id: "v1", name: "Farhana R.", from: "Dhaka", score: 5, text: "Quiet, clean and the staff remembered our names. The ocean suite balcony was the best part.", stayed: "Oct 2026" },
    { id: "v2", name: "Tanvir A.", from: "Chattogram", score: 4.5, text: "Great for families. Kids loved the pool, breakfast had good local options.", stayed: "Sep 2026" },
    { id: "v3", name: "Mehedi H.", from: "Sylhet", score: 4.5, text: "Easy booking, pickup was on time and the beach is really close.", stayed: "Aug 2026" },
  ],
  reviewScore: 4.7,
  reviewCount: 128,
  policies: {
    cancellation: "Free cancellation up to 48 hours before check-in. After that, the first night is charged.",
    children: "Children under 6 stay free using existing beds. Extra bed with breakfast ৳2,500.",
    pets: "Pets are not allowed.",
    tax: "Prices exclude 15% VAT and 10% service charge.",
  },
  payments: [
    { kind: "pay-at-property" },
    { kind: "mfs-manual", provider: "bKash", number: "01700-000000" },
    { kind: "advance", percent: 30 },
    { kind: "card-online", gatewayApproved: false },
  ],
  taxes: { vatPercent: 15, serviceChargePercent: 10, inclusive: false },
  social: { facebook: "#", instagram: "#", youtube: "#" },
  theme: { master: "grand", id: "coral", heading: "sans" },
  propertyType: "resort",
  flags: { packages: false, events: true },
  plan: "ultra",
  status: "live",
};

/** Same demo hotel with the website paused — to preview the paused state. */
export const azureBayPaused: Hotel = { ...azureBay, slug: "paused-demo", status: "paused" };
