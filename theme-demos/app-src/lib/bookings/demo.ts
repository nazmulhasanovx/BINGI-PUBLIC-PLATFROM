// DEMO stays for the prototype (no bookings backend yet). Built deterministically from the property's own
// rooms and prices, so Dashboard, Guests and Reviews show the same people and the same bookings.
// Booking status and payment status are separate fields (project rule).
import { TODAY } from "@/lib/rooms/store";

export type BookingStatus = "Confirmed" | "Checked in" | "Checked out";
export type PaymentStatus = "Paid" | "Partly paid" | "Due";
export type Stay = {
  code: string; guestId: string; room: string; type: string; from: string; to: string; nights: number;
  status: BookingStatus; payment: PaymentStatus; total: number; due: number; channel: string;
};
export type RoomLite = { code: string; type: string; rate: number };

export type DemoGuest = { id: string; name: string; phone: string; email: string; country: string; idType: "NID" | "Passport" | "Driving licence"; idNo: string; verified: boolean; vip: boolean; prefs: string[]; notes: string; address: string };
export const DEMO_GUESTS: DemoGuest[] = [
  ["Mira Ahmed", "01711-204518", "mira.ahmed@gmail.com", "Bangladesh", "NID", "1995264837", true, true, ["High floor", "Quiet room"], "Anniversary in December", "Dhanmondi, Dhaka"],
  ["Tanvir Islam", "01819-337402", "tanvir.islam@yahoo.com", "Bangladesh", "NID", "6894512037", true, false, ["Extra pillow"], "", "Agrabad, Chattogram"],
  ["Saba Noor", "01556-781240", "", "Bangladesh", "NID", "", false, false, [], "", ""],
  ["Rafi Karim", "01913-448126", "rafi.karim@outlook.com", "Bangladesh", "Driving licence", "DK0412785C00", true, false, ["Airport pickup"], "Corporate — pays by card", "Gulshan 2, Dhaka"],
  ["Nusrat Jahan", "01722-905613", "nusrat.j@gmail.com", "Bangladesh", "NID", "4217789035", true, true, ["Vegetarian", "Late check-out"], "Allergic to peanuts", "Uttara, Dhaka"],
  ["Arif Hossain", "01611-583920", "", "Bangladesh", "NID", "7764201398", true, false, [], "", "Sylhet Sadar"],
  ["Lamia Chowdhury", "01833-216745", "lamia.c@gmail.com", "Bangladesh", "NID", "", false, false, ["Twin beds"], "", ""],
  ["Sakib Rahman", "01714-662083", "", "Bangladesh", "NID", "2318840567", true, false, [], "", "Rajshahi"],
  ["Farhana Akter", "01521-470936", "farhana.akter@gmail.com", "Bangladesh", "NID", "9902314758", true, false, ["Quiet room"], "", "Mirpur, Dhaka"],
  ["Imtiaz Ali", "+91 98301 22745", "imtiaz.ali@gmail.com", "India", "Passport", "Z4419872", true, false, ["Airport pickup"], "Kolkata — comes every winter", "Kolkata, India"],
  ["Tahmid Hasan", "01918-055371", "", "Bangladesh", "NID", "5534108972", true, false, [], "", "Khulna"],
  ["Jannat Ara", "01712-830264", "jannat.ara@gmail.com", "Bangladesh", "NID", "", false, false, [], "", ""],
  ["Rakib Uddin", "01815-397410", "", "Bangladesh", "NID", "8812095634", true, false, ["Smoking room"], "", "Cumilla"],
  ["Sadia Islam", "01630-514287", "sadia.islam@gmail.com", "Bangladesh", "NID", "3307716240", true, false, ["Baby cot"], "Travels with a 2-year-old", "Bashundhara, Dhaka"],
  ["Kenji Sato", "+81 90 4417 2290", "k.sato@icloud.com", "Japan", "Passport", "TR8842017", true, true, ["High floor"], "Prefers English, breakfast at 7", "Osaka, Japan"],
  ["Priya Das", "01717-245098", "", "Bangladesh", "NID", "6650912874", true, false, [], "", "Narayanganj"],
  ...([
    ["Mahin Alam", "01716-302845"], ["Shuvo Roy", "01812-664019"], ["Anika Tabassum", "01913-208774"], ["Fahim Chowdhury", "01675-430912"],
    ["Rubaiya Khan", "01711-985320"], ["Asif Mahmud", "01823-117604"], ["Tasnim Haque", "01552-649801"], ["Zubair Ahmed", "01918-772036"],
    ["Mehnaz Rahman", "01714-350687"], ["Rezaul Karim", "01819-045213"], ["Ishrat Jahan", "01738-612490"], ["Nayeem Hossain", "01611-278354"],
    ["Sumaiya Akter", "01922-503871"], ["David Miller", "+44 7700 900412"],
  ] as [string, string][]).map(([n, ph], i) => [n, ph, i % 3 ? "" : `${n.split(" ")[0].toLowerCase()}@gmail.com`, ph.startsWith("+44") ? "United Kingdom" : "Bangladesh", ph.startsWith("+44") ? "Passport" : "NID", i % 4 === 1 ? "" : ph.startsWith("+44") ? "533380006" : String(4400000000 + i * 7919301).slice(0, 10), i % 4 !== 1, false, [], "", ""]),
].map((r, i) => ({ id: `GST-${String(1001 + i).padStart(8, "0")}`, name: r[0] as string, phone: r[1] as string, email: r[2] as string, country: r[3] as string, idType: r[4] as DemoGuest["idType"], idNo: r[5] as string, verified: r[6] as boolean, vip: r[7] as boolean, prefs: r[8] as string[], notes: r[9] as string, address: r[10] as string }));

export const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Current stays (~75% in house, 4 arrivals today) + past stays so some guests are returning. */
export function demoStays(slug: string, rooms: RoomLite[]): Stay[] {
  if (!rooms.length) return [];
  let seed = hash(slug);
  const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32);
  const G = DEMO_GUESTS.length;
  const out: Stay[] = [];
  const arrivals = Math.min(4, rooms.length);
  const occupied = Math.min(rooms.length, Math.round(rooms.length * 0.75));
  rooms.slice(0, occupied).forEach((r, i) => {
    const arriving = i < arrivals;
    const from = arriving ? TODAY : addDays(TODAY, -1 - Math.floor(rnd() * 3));
    const n0 = 1 + Math.floor(rnd() * 3);
    const to = arriving ? addDays(TODAY, n0) : i % 4 === 0 ? TODAY : addDays(TODAY, n0);
    const nights = Math.max(1, Math.round((Date.parse(to) - Date.parse(from)) / 864e5));
    const total = r.rate * nights;
    const paidAll = !arriving || i === 1 || i === 3;
    out.push({
      code: `BK-${2401 + i}`, guestId: DEMO_GUESTS[(hash(slug) + i) % G].id, room: r.code, type: r.type, from, to, nights,
      status: arriving ? "Confirmed" : "Checked in", payment: paidAll ? "Paid" : i === 2 ? "Partly paid" : "Due",
      total, due: paidAll ? 0 : i === 2 ? Math.round(total / 2) : total, channel: (["Website", "Walk-in", "Marketplace"] as const)[i % 3],
    });
  });
  // Past stays: guest j has (j % 4) earlier visits (the first 16 only, so some guests are new).
  let k = 0;
  DEMO_GUESTS.slice(0, 16).forEach((g, j) => {
    for (let v = 0; v < j % 4; v++) {
      const r = rooms[(j + v * 3) % rooms.length];
      const from = addDays(TODAY, -(9 + v * 41 + j * 5));
      const nights = 1 + ((j + v) % 3);
      out.push({ code: `BK-${2300 - k++}`, guestId: g.id, room: r.code, type: r.type, from, to: addDays(from, nights), nights, status: "Checked out", payment: "Paid", total: r.rate * nights, due: 0, channel: (["Website", "Marketplace", "Walk-in"] as const)[(j + v) % 3] });
    }
  });
  return out;
}

// ---------- Reviews (after checkout) ----------
export type Aspect = "Cleanliness" | "Staff" | "Location" | "Value";
export const ASPECTS: Aspect[] = ["Cleanliness", "Staff", "Location", "Value"];
export type Review = { id: string; stay: string; guestId: string; rating: number; aspects: Record<Aspect, number>; title: string; text: string; date: string; source: "Website" | "Marketplace"; published: boolean };
const TEXTS: [number, string, string][] = [
  [5, "Excellent stay", "Room was spotless and the staff remembered our names. Breakfast was great."],
  [5, "Will come again", "Beautiful view and very quick check-in. Thank you!"],
  [4, "Very good", "Comfortable bed and friendly team. Wi-Fi was a little slow in the evening."],
  [4, "Nice place", "Good value for the price. Parking was easy."],
  [5, "Perfect family trip", "The kids loved the pool. Staff helped with the baby cot right away."],
  [3, "Okay", "Room was fine but the AC was noisy at night. Front desk changed our room next day."],
  [2, "Not as expected", "Hot water did not work in the morning and check-in took 40 minutes."],
  [5, "", ""],
];
/** About two thirds of finished stays have a review; older ones are published by BinGi, the newest wait. */
export function demoReviews(stays: Stay[]): Review[] {
  return stays.filter((s) => s.status === "Checked out").filter((s) => hash(s.code) % 3 !== 0).map((s, i) => {
    const [rating, title, text] = TEXTS[hash(s.code + "r") % TEXTS.length];
    const a = (d: number) => Math.max(1, Math.min(5, rating + d));
    const date = addDays(s.to, 1);
    return {
      id: `RV-${s.code.slice(3)}`, stay: s.code, guestId: s.guestId, rating, title: title || "No title", text,
      aspects: { Cleanliness: a(hash(s.code + "c") % 2 ? 0 : -1), Staff: a(0), Location: a(hash(s.code + "l") % 2 ? 0 : 1), Value: a(i % 3 === 0 ? -1 : 0) },
      date, source: i % 2 ? "Marketplace" : "Website", published: date < addDays(TODAY, -12),
    };
  });
}
