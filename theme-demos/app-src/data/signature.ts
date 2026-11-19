// DEMO DATA — the 10 fictional properties of the Signature Collection (one per theme). Demo only.
import { sig } from "./_sig";

const AL = "/demo/altura", SP = "/demo/sea-pearl", AZ = "/demo/azure-bay", TV = "/demo/tea-valley", WB = "/demo/wave-bunk";
const LV = "/demo/lakeview", MW = "/demo/mistwood", SR = "/demo/shonali-rajbari", MG = "/demo/maison-gulshan", MT = "/demo/matir", HB = "/demo/haor-bilash", SH = "/demo/shalbon";

const REV = (place: string): [string, string, number, string][] => [
  ["Sadia R.", "Dhaka", 5, `Exactly what we hoped for — ${place} felt cared for in every detail.`],
  ["Tom B.", "UK", 5, "Friendly team, spotless rooms, easy booking direct."],
  ["Imran H.", "Chattogram", 4.5, "Great location and very good value."],
  ["Nusrat J.", "Sylhet", 5, "We are already planning to come back."],
  ["Aiko M.", "Japan", 4.5, "Quiet, clean and comfortable."],
];

export const aurel = sig({
  slug: "aurel-banani", name: "Aurel Hotel", type: "Contemporary city hotel", stars: 5, master: "aurel", colour: "terracotta", propertyType: "hotel", plan: "ultra",
  tagline: "The city. Your sanctuary.", intro: "A contemporary city hotel for modern travellers — rooftop pool, a lobby that feels like a living room and rooms above Banani.", logoText: "Aurel", hero: `${AL}/tower.jpg`,
  area: "Banani", city: "Dhaka", address: "Road 17, Banani, Dhaka 1213", phone: "+880 1301-100100", email: "stay@aurel.example",
  highlights: ["Rooftop pool", "Premier suites", "All-day dining"],
  facilities: [["Rooftop pool", "Swim above the city", "waves"], ["Premier suites", "Spacious, calm and refined", "bath"], ["The lobby", "A warm welcome, 24 hours", "coffee"], ["Fitness", "Open 24 hours", "dumbbell"], ["Fast Wi-Fi", "Every floor", "wifi"], ["Airport car", "On request", "car"]],
  nearby: [["Banani Road 11", "4 min", "walk"], ["Gulshan 2", "10 min", "drive"], ["Dhaka airport", "25 min", "drive"]],
  gallery: [`${AL}/pool-2.jpg`, `${AL}/lobby.jpg`, `${AL}/sunset.jpg`, `${AL}/reception.jpg`, `${AZ}/dining-venue.jpg`],
  rooms: [
    ["Deluxe Room", "room", "A comfortable city retreat.", 14500, 2, 1, "1 King bed", 360, "City", 40, [`${AL}/twin.jpg`, `${AL}/desk.jpg`], ["City view", "Rain shower", "Smart TV", "Free Wi-Fi"], { specs: ["Floors 3–8"] }],
    ["Premier Suite", "suite", "More space to relax.", 24000, 2, 1, "1 King bed", 640, "City", 12, [`${AL}/lounge.jpg`, `${AL}/suite.jpg`], ["Living area", "Bathtub", "Nespresso", "Free Wi-Fi"], { specs: ["Floors 9–11"] }],
    ["Aurel Suite", "suite", "Our signature city suite.", 42000, 3, 1, "1 King + sofa bed", 980, "Skyline", 3, [`${AL}/suite.jpg`, `${AL}/sunset.jpg`], ["Terrace", "Dining table", "Butler", "Free Wi-Fi"], { specs: ["Floor 12"] }],
  ],
  services: [["Airport car", "transfer", "Sedan to or from the airport.", 3000, "per trip"], ["City explorer", "activity", "Iconic sights, hidden gems.", 4500, "per person", `${SP}/rooftop.jpg`], ["Local flavours", "activity", "Taste the city's best street food.", 2500, "per person", `${AZ}/dish-platter.jpg`], ["Lakeside escape", "activity", "A calmer side of the city by Gulshan Lake.", 2000, "per person", `${LV}/building.jpg`]],
  outlets: [["Copper Kitchen", "restaurant", "Modern cuisine with a local soul — seasonal flavours, refined plates.", "7 AM – 11 PM", "Ground floor", `${AZ}/dining-venue.jpg`], ["Sky Bar", "bar", "Sunset drinks by the rooftop pool.", "5 PM – 1 AM", "Rooftop", `${AL}/pool.jpg`]],
  offers: [["Weekend in the city", "Breakfast included.", "15% off", "Fri–Sat, book direct."]],
  reviews: REV("Aurel"), score: 4.7, count: 286,
});

export const courtyard = sig({
  slug: "the-courtyard", name: "The Courtyard", type: "Boutique hotel", stars: 4, master: "courtyard", colour: "rose", propertyType: "hotel",
  tagline: "Stay somewhere with soul.", intro: "A hidden courtyard retreat where heritage, hospitality and modern comfort meet — a restored townhouse in Old Dhaka.", logoText: "The Courtyard", hero: `${SR}/arch.jpg`,
  area: "Puran Dhaka", city: "Dhaka", address: "14 Hrishikesh Das Road, Puran Dhaka", phone: "+880 1302-200200", email: "hello@courtyard.example",
  highlights: ["Restored 1920s townhouse", "11 suites", "Courtyard dining"],
  facilities: [["The courtyard", "Fountain, lanterns, quiet", "leaf"], ["Courtyard kitchen", "Local flavours, courtyard style", "utensils"], ["Roof terrace", "Sunset over old Dhaka", "sun"], ["Library lounge", "Books and tea", "coffee"], ["Bicycle loan", "Explore the old city", "car"], ["Fast Wi-Fi", "Every suite", "wifi"]],
  nearby: [["Ahsan Manzil", "8 min", "walk"], ["Sadarghat", "12 min", "walk"], ["Lalbagh Fort", "15 min", "drive"]],
  gallery: [`${SR}/atrium.jpg`, `${SR}/jali.jpg`, `${SR}/garden.jpg`, `${SR}/pigeons.jpg`, `${MG}/salon.jpg`],
  rooms: [
    ["Courtyard Suite", "suite", "Serene, garden-facing and light-filled.", 16500, 2, 1, "1 King bed", 480, "Courtyard", 4, [`${TV}/room-garden.jpg`, `${SR}/garden.jpg`], ["Courtyard view", "Clawfoot bath", "Free Wi-Fi"]],
    ["Terrace Suite", "suite", "A private terrace with town views.", 21000, 2, 1, "1 King bed", 560, "Old town", 3, [`${TV}/balcony.jpg`, `${SR}/domes.jpg`], ["Private terrace", "Rain shower", "Free Wi-Fi"]],
    ["Heritage Suite", "suite", "Original details with modern comfort.", 26000, 3, 1, "1 King + day bed", 720, "Courtyard", 2, [`${TV}/room-heritage.jpg`, `${SR}/atrium.jpg`], ["Painted ceiling", "Sitting room", "Free Wi-Fi"]],
  ],
  services: [["Coastal escape", "activity", "Sea, villages and scenic drives — a day trip.", 9000, "per car", `${HB}/sunset.jpg`], ["Local crafts", "activity", "Meet artisans and traditional makers.", 2500, "per person", `${SR}/jali.jpg`], ["Town in bloom", "activity", "Markets, festivals and everyday culture.", 1800, "per person", `${SR}/pigeons.jpg`]],
  outlets: [["Courtyard Kitchen", "restaurant", "Seasonal dishes inspired by the region, served in our intimate courtyard.", "7 AM – 11 PM", "Courtyard", `${AZ}/dish-salad.jpg`]],
  reviews: REV("The Courtyard"), score: 4.8, count: 142,
  dayPlan: [{ time: "1922", title: "A merchant's townhouse", text: "Built around a courtyard with a fountain and an old neem tree." }, { time: "2019", title: "Restored by hand", text: "Lime plaster, teak shutters and the tiles, one room at a time." }, { time: "Today", title: "Eleven suites", text: "A small hotel that still feels like a home." }],
});

export const axis = sig({
  slug: "axis-gulshan", name: "Axis Hotel", type: "City business hotel", stars: 4, master: "axis", colour: "ocean", propertyType: "hotel",
  tagline: "Make room for your next move.", intro: "A modern business hotel in the heart of the city — for focused work, restful stays and what's next.", logoText: "Axis", hero: `${AL}/desk.jpg`,
  area: "Gulshan Avenue", city: "Dhaka", address: "Plot 52, Gulshan Avenue, Dhaka 1212", phone: "+880 1303-300300", email: "stay@axis.example",
  highlights: ["Business ready", "Rest & recharge", "Connected stays"],
  facilities: [["Boardroom", "Up to 14 people", "briefcase"], ["Meeting room", "Up to 30 people", "briefcase"], ["Event space", "Up to 120 people", "briefcase"], ["Fast Wi-Fi", "1 Gbps, every floor", "wifi"], ["Gym", "24 hours", "dumbbell"], ["Airport car", "On request", "car"]],
  nearby: [["Gulshan 1 circle", "3 min", "walk"], ["Banani", "8 min", "drive"], ["Dhaka airport", "22 min", "drive"]],
  gallery: [`${SP}/conference.jpg`, `${SP}/meeting.jpg`, `${AL}/lobby.jpg`, `${SP}/gym.jpg`, `${AL}/night.jpg`],
  rooms: [
    ["Deluxe Room", "room", "A modern, comfortable stay for focused travel.", 11500, 2, 0, "1 King bed", 340, "City", 60, [`${SP}/room-deluxe.jpg`, `${AL}/desk.jpg`], ["Work desk", "Ergonomic chair", "Rain shower", "Free Wi-Fi"]],
    ["Executive Room", "room", "More space to work, unwind and stay in control.", 15500, 2, 1, "1 King bed", 420, "City", 30, [`${SP}/room-super-deluxe.jpg`, `${AL}/twin.jpg`], ["Lounge access", "Work desk", "Nespresso", "Free Wi-Fi"]],
    ["Business Suite", "suite", "A complete space for work, rest and longer stays.", 24000, 2, 1, "1 King bed", 650, "City", 8, [`${SP}/room-suite.jpg`, `${AL}/lounge.jpg`], ["Separate office", "Living room", "Lounge access", "Free Wi-Fi"]],
  ],
  services: [["Meeting room (half day)", "activity", "Screen, coffee and Wi-Fi for 30.", 18000, "per half day", `${SP}/meeting.jpg`], ["Boardroom (full day)", "activity", "14 seats, lunch included.", 32000, "per day", `${SP}/conference.jpg`], ["Airport car", "transfer", "Sedan, meet and greet.", 3000, "per trip"]],
  outlets: [["Axis Kitchen", "restaurant", "Seasonal cuisine and refined all-day dining in a relaxed setting.", "6:30 AM – 11 PM", "Ground floor", `${AZ}/dining-venue.jpg`]],
  reviews: REV("Axis"), score: 4.6, count: 512,
});

export const waypoint = sig({
  slug: "waypoint-inn", name: "Waypoint Highway Inn", type: "Highway inn", stars: 0, master: "waypoint", colour: "terracotta", propertyType: "hotel",
  tagline: "Good roads. Great rest.", intro: "A friendly roadside inn for modern road-trippers on the Dhaka–Sylhet highway — park at your door, sleep well, drive on.", logoText: "Waypoint", hero: `${WB}/entrance.jpg`,
  area: "Ashuganj", city: "Brahmanbaria", address: "Dhaka–Sylhet Highway, Ashuganj, Brahmanbaria", phone: "+880 1304-400400", email: "rest@waypoint.example", checkIn: "Any time (24h desk)", checkOut: "11:00 AM",
  highlights: ["Free parking", "24-hour check-in", "Coffee & snacks"],
  facilities: [["Free parking", "At your door", "car"], ["Fast Wi-Fi", "Every room", "wifi"], ["Coffee & snacks", "All night", "coffee"], ["A/C & heating", "Every room", "sun"], ["Easy check-in", "24-hour desk", "clock"], ["Clean rooms", "Every day", "shield"]],
  nearby: [["Meghna bridge", "6 min", "drive"], ["Bhairab", "20 min", "drive"], ["Sylhet", "3 h 30", "drive"], ["Dhaka", "2 h", "drive"]],
  gallery: [`${WB}/sign.jpg`, `${WB}/common.jpg`, `${TV}/tea-cup.jpg`, `${MT}/golden-grass.jpg`, `${MW}/path.jpg`],
  rooms: [
    ["Roadside King", "room", "A spacious, no-fuss stay for a restful stop.", 3800, 2, 0, "1 King bed", 260, "Courtyard", 12, [`${WB}/private-2.jpg`, `${WB}/twin.jpg`], ["King bed", "Hot shower", "Free Wi-Fi", "Parking at door"]],
    ["Double Queen", "room", "Room to relax, recharge and travel together.", 4800, 4, 0, "2 Queen beds", 320, "Courtyard", 10, [`${WB}/twin.jpg`, `${WB}/private-4.jpg`], ["Two queen beds", "Hot shower", "Free Wi-Fi"]],
    ["Family Suite", "suite", "Extra space for longer stays and larger crews.", 6500, 4, 2, "1 King + 1 Queen", 420, "Garden", 4, [`${WB}/private-4.jpg`, `${WB}/common.jpg`], ["Sitting area", "Mini fridge", "Free Wi-Fi"]],
  ],
  services: [["Scenic drives", "activity", "Tea gardens of Srimangal, 2 hours east.", 0, "map from the desk", `${TV}/tea-hills.jpg`], ["Local towns", "activity", "Bhairab's river market and old bazaar.", 0, "map from the desk", `${MT}/paddy-reflection.jpg`], ["Outdoor adventures", "activity", "Haor boat trips in the wet season.", 4000, "per boat", `${HB}/boat-2.jpg`]],
  outlets: [["Night Kitchen", "cafe", "Coffee, paratha, snacks — open all night for drivers.", "24 hours", "Lobby", `${TV}/tea-cup.jpg`]],
  reviews: REV("Waypoint"), score: 4.5, count: 734,
});

export const shanti = sig({
  slug: "shanti-guest-house", name: "Shanti Guest House", type: "Guest house", stars: 0, master: "shanti", colour: "forest", propertyType: "guest-house",
  tagline: "A slower, warmer kind of stay.", intro: "A welcoming guest house with cozy rooms, home breakfast and a garden to unwind.", logoText: "Shanti", hero: `${TV}/veranda.jpg`,
  area: "Sreemangal", city: "Moulvibazar", address: "College Road, Sreemangal, Moulvibazar", phone: "+880 1305-500500", email: "hello@shanti.example",
  highlights: ["Home breakfast", "Garden", "Five rooms"],
  facilities: [["Garden", "Shady seats, birdsong", "leaf"], ["Lounge", "Books and board games", "coffee"], ["Home breakfast", "7–10 AM", "utensils"], ["Veranda", "Tea at sunset", "sun"], ["Fast Wi-Fi", "Every room", "wifi"], ["Pickup", "From the station", "car"]],
  nearby: [["Sreemangal station", "6 min", "drive"], ["Lawachara forest", "20 min", "drive"], ["Tea estates", "5 min", "drive"]],
  gallery: [`${TV}/bungalow.jpg`, `${TV}/balcony.jpg`, `${TV}/tea-garden.jpg`, `${TV}/veranda.jpg`, `${TV}/breakfast.jpg`],
  rooms: [
    ["Garden Room", "room", "A bright, restful room with garden views.", 3500, 2, 1, "1 Queen bed", 220, "Garden", 2, [`${TV}/room-garden.jpg`, `${TV}/tea-garden.jpg`], ["Garden view", "Hot shower", "Free Wi-Fi"]],
    ["Veranda Room", "room", "A cozy room with a private veranda.", 4200, 2, 1, "1 Queen bed", 240, "Garden", 2, [`${TV}/room-cottage.jpg`, `${TV}/balcony.jpg`], ["Private veranda", "Hot shower", "Free Wi-Fi"]],
    ["Attic Room", "room", "A quiet, intimate space to unwind.", 3000, 2, 0, "1 Double bed", 180, "Tea hills", 1, [`${MW}/room-attic.jpg`, `${TV}/tea-hills.jpg`], ["Slanted ceiling", "Reading nook", "Free Wi-Fi"]],
  ],
  services: [["Home breakfast", "dining", "Simple, wholesome, freshly made — a warm part of your stay.", 0, "included", `${TV}/breakfast.jpg`], ["Tea garden walk", "activity", "An easy morning walk with tea at the end.", 600, "per person", `${TV}/tea-garden.jpg`], ["Station pickup", "transfer", "From Sreemangal station.", 400, "per trip"]],
  reviews: REV("Shanti"), score: 4.9, count: 96,
  host: { name: "Rina Das", role: "Host", since: "2016", note: "Breakfast is made in our own kitchen, and the garden is yours. Ask me anything about Sreemangal.", languages: ["Bangla", "English"] },
});

export const reside = sig({
  slug: "haven-residences", name: "Haven Residences", type: "Serviced apartments", stars: 0, master: "reside", colour: "graphite", propertyType: "serviced-apartment",
  tagline: "Space to settle in.", intro: "Serviced apartments for short or long stays — a full kitchen, a proper desk and housekeeping, a few minutes from the diplomatic zone.", logoText: "Haven", hero: `${LV}/living-open.jpg`,
  area: "Baridhara", city: "Dhaka", address: "Road 7, Baridhara DOHS, Dhaka", phone: "+880 1306-600600", email: "stay@havenresidences.example",
  highlights: ["Nightly or monthly", "Full kitchens", "Housekeeping"],
  facilities: [["Housekeeping", "Twice a week (daily on request)", "shield"], ["High-speed Wi-Fi", "Every apartment", "wifi"], ["Fitness access", "24 hours", "dumbbell"], ["Resident lounge", "Coffee and co-working", "coffee"], ["In-suite laundry", "Washer-dryer", "plug"], ["Thoughtful essentials", "Starter pantry on arrival", "leaf"]],
  nearby: [["Cafes on Road 7", "2 min", "walk"], ["Gulshan shopping", "8 min", "drive"], ["Baridhara park", "5 min", "walk"], ["Dining street", "6 min", "walk"]],
  gallery: [`${LV}/living.jpg`, `${LV}/kitchen.jpg`, `${LV}/work.jpg`, `${LV}/facade.jpg`, `${LV}/bed-2.jpg`],
  rooms: [
    ["Studio", "apartment", "A smart, stylish space for one.", 6500, 2, 0, "1 Queen bed", 420, "City", 10, [`${LV}/studio.jpg`, `${LV}/kitchen.jpg`], ["Kitchenette", "Work desk", "Washer-dryer", "Free Wi-Fi"], { bedrooms: 1 }],
    ["One Bedroom", "apartment", "More room to live, work and unwind.", 9500, 2, 1, "1 King bed", 680, "City", 14, [`${LV}/living-cozy.jpg`, `${LV}/bed-1.jpg`], ["Full kitchen", "Living room", "Work desk", "Free Wi-Fi"], { bedrooms: 1 }],
    ["Two Bedrooms", "apartment", "A spacious stay for more flexibility.", 14500, 4, 2, "1 King + 2 Single", 1050, "Park", 6, [`${LV}/living-open.jpg`, `${LV}/bed-3.jpg`], ["Full kitchen", "Dining table", "Two bathrooms", "Free Wi-Fi"], { bedrooms: 2 }],
  ],
  services: [["Grocery delivery", "stay", "Your fridge filled before you arrive.", 1500, "per order", `${LV}/kitchen.jpg`], ["Daily housekeeping", "stay", "Upgrade from twice a week.", 900, "per day"], ["Airport pickup", "transfer", "Sedan from the airport.", 2500, "per trip"]],
  offers: [["Stay a month", "Monthly rate for 28+ nights.", "30% off", "Any apartment, 28 nights or more."], ["Stay a week", "7 nights or more.", "12% off", "Any apartment."]],
  reviews: REV("Haven Residences"), score: 4.8, count: 203,
});

export const commons = sig({
  slug: "common-ground", name: "Common Ground Hostel", type: "Social hostel", stars: 0, master: "commons", colour: "ocean", propertyType: "hostel",
  tagline: "Your next story starts with a hello.", intro: "A social hostel for curious travellers, open minds and new friendships — dorm beds, private rooms and a rooftop in Dhanmondi.", logoText: "Common Ground", hero: `${WB}/common.jpg`,
  area: "Dhanmondi", city: "Dhaka", address: "Road 27, Dhanmondi, Dhaka 1209", phone: "+880 1307-700700", email: "hello@commonground.example", checkIn: "1:00 PM", checkOut: "11:00 AM",
  highlights: ["Rooftop lounge", "Weekly events", "Lockers in every bed"],
  facilities: [["Work & hang", "Big tables, fast Wi-Fi", "wifi"], ["Play & chill", "Pool table, games", "coffee"], ["Rooftop lounge", "Sunsets over the lake", "sun"], ["Lockers", "In every bed", "lock"], ["Shared kitchen", "Open 24 hours", "utensils"], ["Laundry", "Self-service", "plug"]],
  nearby: [["Dhanmondi Lake", "3 min", "walk"], ["Rabindra Sarobar", "6 min", "walk"], ["New Market", "12 min", "drive"]],
  gallery: [`${WB}/common.jpg`, `${WB}/campfire.jpg`, `${WB}/bunk.jpg`, `${WB}/sign.jpg`, `${WB}/pods.jpg`],
  rooms: [
    ["Dorm Bed", "dorm", "A social, budget-friendly way to stay.", 900, 1, 0, "1 Bunk bed", 0, "Shared room", 24, [`${WB}/dorm-6.jpg`, `${WB}/bunk.jpg`], ["Locker", "Reading light", "USB charger", "Curtain"], { bedrooms: 6 }],
    ["Private Room", "room", "Your own space to recharge.", 3200, 2, 0, "1 Double bed", 160, "Courtyard", 6, [`${WB}/private-2.jpg`, `${WB}/twin.jpg`], ["Private bathroom", "Desk", "Free Wi-Fi"]],
    ["Private Twin", "room", "A comfy option for travel buddies.", 3600, 2, 0, "2 Single beds", 180, "Street", 4, [`${WB}/twin.jpg`, `${WB}/private-4.jpg`], ["Two beds", "Private bathroom", "Free Wi-Fi"]],
  ],
  services: [["Rooftop game night", "activity", "Every Thursday — free for guests.", 0, "free", `${WB}/campfire.jpg`], ["Old Dhaka walk", "activity", "Cafés, culture and street food with a local.", 700, "per person", `${SR}/pigeons.jpg`], ["Art & creative spots", "activity", "Galleries and murals tour.", 500, "per person", `${SR}/jali.jpg`], ["Lake run club", "activity", "Saturday 6:30 AM.", 0, "free", `${LV}/building.jpg`]],
  reviews: REV("Common Ground"), score: 4.7, count: 1208,
});

export const roots = sig({
  slug: "roots-homestay", name: "Roots Homestay", type: "Homestay", stars: 0, master: "roots", colour: "rose", propertyType: "home",
  tagline: "A new place. A familiar feeling.", intro: "A home opened with care, rooted in Bangladeshi hospitality — home-cooked food, a garden and tea gardens all around.", logoText: "Roots", hero: `${TV}/bungalow.jpg`,
  area: "Kamalganj", city: "Moulvibazar", address: "Bhanugach Road, Kamalganj, Moulvibazar", phone: "+880 1308-800800", email: "home@roots.example",
  highlights: ["Home-cooked food", "Local family hosts", "Tea gardens"],
  facilities: [["Home-cooked meals", "Three a day", "utensils"], ["Garden", "Mango and jackfruit trees", "leaf"], ["Veranda", "Tea at dusk", "sun"], ["Hot water", "Every room", "flame"], ["Wi-Fi", "In the house", "wifi"], ["Pickup", "From Sreemangal", "car"]],
  nearby: [["Madhabpur Lake", "15 min", "drive"], ["Lawachara forest", "25 min", "drive"], ["Sreemangal", "35 min", "drive"]],
  gallery: [`${TV}/tea-garden.jpg`, `${HB}/sunset.jpg`, `${SR}/jali.jpg`, `${TV}/veranda.jpg`, `${MT}/paddy-reflection.jpg`],
  rooms: [
    ["Garden Room", "room", "A peaceful room with garden views.", 2500, 2, 0, "1 Queen bed", 200, "Garden", 1, [`${TV}/room-garden.jpg`, `${TV}/tea-garden.jpg`], ["Garden view", "Fan + A/C", "Mosquito net"]],
    ["Heritage Twin", "room", "A warm, traditional space for friends or family.", 2800, 2, 0, "2 Twin beds", 210, "Courtyard", 1, [`${TV}/room-heritage.jpg`, `${TV}/veranda.jpg`], ["Twin beds", "Teak furniture", "Hot water"]],
    ["Family Suite", "suite", "Spacious and homely, perfect for a small group.", 4200, 4, 2, "Queen + extra", 340, "Garden", 1, [`${TV}/room-family.jpg`, `${TV}/bungalow.jpg`], ["Two rooms", "Sitting area", "Hot water"]],
  ],
  services: [["Tea garden walk", "activity", "With our neighbour who works the estate.", 500, "per person", `${TV}/tea-garden.jpg`], ["Village life", "activity", "A boat at dusk, the bazaar, the school.", 800, "per person", `${HB}/sunset.jpg`], ["Local crafts", "activity", "Manipuri weaving in the next village.", 600, "per person", `${SR}/jali.jpg`], ["Home-cooked food", "dining", "Authentic Bangladeshi meals with fresh, local ingredients.", 600, "per meal", `${AZ}/dish-bhuna.jpg`]],
  reviews: REV("Roots"), score: 4.9, count: 64,
  host: { name: "Shefali & Abul Roy", role: "Your hosts", since: "2018", note: "We are a local family who love good food, long conversations and sharing the simple joys of our home.", languages: ["Bangla", "English", "Sylheti"] },
});

export const morning = sig({
  slug: "morning-house", name: "Morning House", type: "Bed & breakfast", stars: 0, master: "morning", colour: "sand", propertyType: "guest-house",
  tagline: "Stay for the night. Love the morning.", intro: "A bed & breakfast for slower, brighter days — three rooms, a garden and the best breakfast in Sylhet.", logoText: "Morning House", hero: `${TV}/breakfast.jpg`,
  area: "Uposhohor", city: "Sylhet", address: "Block D, Uposhohor, Sylhet", phone: "+880 1309-900900", email: "hello@morninghouse.example",
  highlights: ["Breakfast included", "Garden", "Three rooms"],
  facilities: [["Breakfast", "7:30–10:30, included", "utensils"], ["Garden", "Coffee outside", "leaf"], ["Reading corner", "Books to borrow", "coffee"], ["Bicycles", "Free to borrow", "car"], ["Fast Wi-Fi", "Every room", "wifi"], ["Quiet street", "No traffic at night", "shield"]],
  nearby: [["Zindabazar cafés", "10 min", "drive"], ["Shahjalal Mazar", "12 min", "drive"], ["Sylhet airport", "20 min", "drive"]],
  gallery: [`${AZ}/dish-dessert.jpg`, `${AZ}/dish-salad.jpg`, `${AZ}/dish-bowl.jpg`, `${TV}/balcony.jpg`, `${SR}/garden.jpg`],
  rooms: [
    ["The Sunroom", "room", "Bright, airy, garden view.", 4500, 2, 0, "1 Queen bed", 230, "Garden", 1, [`${TV}/room-garden.jpg`, `${TV}/balcony.jpg`], ["Breakfast included", "Garden view", "Free Wi-Fi"]],
    ["The Garden Room", "room", "Calm, natural, extra space.", 5200, 3, 0, "1 King bed", 280, "Garden", 1, [`${TV}/room-cottage.jpg`, `${SR}/garden.jpg`], ["Breakfast included", "Garden door", "Free Wi-Fi"]],
    ["The Loft", "room", "Cozy, charming, sky view.", 3900, 2, 0, "1 Double bed", 200, "Sky", 1, [`${MW}/room-attic.jpg`, `${TV}/tea-cup.jpg`], ["Breakfast included", "Skylight", "Free Wi-Fi"]],
  ],
  services: [["Fresh pastries", "dining", "Baked at six every morning.", 0, "included", `${AZ}/dish-dessert.jpg`], ["Seasonal plates", "dining", "Eggs, greens and local tomatoes.", 0, "included", `${AZ}/dish-salad.jpg`], ["House favourites", "dining", "Yoghurt, granola and Sylhet oranges.", 0, "included", `${AZ}/dish-bowl.jpg`], ["Breakfast in bed", "celebration", "Flowers and a tray at your door.", 900, "per room", `${TV}/breakfast.jpg`]],
  reviews: REV("Morning House"), score: 4.9, count: 88,
  dayPlan: [{ time: "7:30", title: "Coffee in the garden", text: "Filter coffee and the newspaper under the guava tree." }, { time: "8:00", title: "Breakfast is served", text: "Fresh pastries, seasonal plates and house favourites, until 10:30." }, { time: "10:30", title: "Bicycles out", text: "Borrow one and ride to the tea gardens." }],
});

export const matir = sig({
  slug: "matir-farm", name: "Matir Farm Stay", type: "Farm stay", stars: 0, master: "matir", colour: "terracotta", propertyType: "cottage",
  tagline: "Let the countryside wake you.", intro: "A farm stay in nature, food and slower living — cottages, fields, gardens and a pond on a working farm.", logoText: "Matir", hero: `${MT}/sunset-field.jpg`,
  area: "Muktagachha", city: "Mymensingh", address: "Kheru Para, Muktagachha, Mymensingh", phone: "+880 1310-010010", email: "farm@matir.example",
  highlights: ["Organic farming", "Farm meals", "Nature stays"],
  facilities: [["Organic farming", "Rice, vegetables, fruit", "leaf"], ["Farm meals", "Grown here, cooked here", "utensils"], ["Fish pond", "Fishing and a boat", "boat"], ["Cycling", "Village lanes", "car"], ["Solar power", "With backup", "plug"], ["Wi-Fi", "In the dining hall", "wifi"]],
  nearby: [["Muktagachha Rajbari", "15 min", "drive"], ["Mymensingh town", "35 min", "drive"], ["Brahmaputra river", "40 min", "drive"]],
  gallery: [`${MT}/paddy-reflection.jpg`, `${MT}/farmer-mist.jpg`, `${MT}/rice-close.jpg`, `${MT}/golden-grass.jpg`, `${MT}/terraces.jpg`],
  pagePhotos: { rooms: `${MW}/cabin-a.jpg`, experiences: `${MT}/farmer-mist.jpg`, offers: `${MT}/golden-grass.jpg`, explore: `${MT}/terraces.jpg` },
  rooms: [
    ["Field Cottage", "cottage", "A cozy stay with open field views.", 4500, 2, 0, "1 Queen bed", 300, "Field", 3, [`${MW}/cabin-a.jpg`, `${MT}/sunset-field.jpg`], ["Field view", "Veranda", "Hot water"]],
    ["Garden Cottage", "cottage", "Surrounded by herbs and fruit trees.", 5200, 3, 0, "1 King bed", 340, "Garden", 2, [`${MW}/lodge.jpg`, `${SR}/garden.jpg`], ["Herb garden", "Veranda", "Hot water"]],
    ["Farmhouse Suite", "suite", "Spacious, perfect for families.", 8500, 4, 2, "1 King + 2 Single", 620, "Farm", 1, [`${MW}/living.jpg`, `${MW}/dining.jpg`], ["Two rooms", "Kitchen", "Veranda"]],
  ],
  services: [["Garden walks", "activity", "Pick tomorrow's vegetables with our gardener.", 0, "included", `${MT}/rice-close.jpg`], ["Farm life", "activity", "Feed the hens, milk the cow, plant rice in season.", 800, "per person", `${MT}/farmer-mist.jpg`], ["Countryside rides", "activity", "Bicycles and a map of the village lanes.", 300, "per bicycle", `${MT}/golden-grass.jpg`], ["Farm meals", "dining", "Fresh, seasonal meals with ingredients grown on the farm.", 900, "per person per day", `${AZ}/dish-bhuna.jpg`]],
  reviews: REV("Matir"), score: 4.8, count: 77,
});

export const SIGNATURE = [aurel, courtyard, axis, waypoint, shanti, reside, commons, roots, morning, matir];
