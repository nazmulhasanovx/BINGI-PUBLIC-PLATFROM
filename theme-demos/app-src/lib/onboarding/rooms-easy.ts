// Easy room builder — preset master lists (no custom buildings, floors, zones or numbers).
// Mirrors the live HMS room-add flow: pick a floor, tap numbers from a ready list.
// The presets produce the same Config / Category / Unit records the HMS Rooms module and the
// backend /accommodations batch API use (explicit codes), so nothing new is needed on the server.
import { emptyConfig, type Config, type LocNode } from "@/lib/rooms/store";
import type { CoreType, PresetSlug } from "@/lib/rooms/catalog";
import type { Draft } from "./store";

export const STAY: { id: CoreType; preset: PresetSlug; bn: string; en: string; subBn: string; subEn: string; prefix: string; where: "floor" | "zone" }[] = [
  { id: "ROOM", preset: "room", bn: "রুম", en: "Rooms", subBn: "বিল্ডিংয়ের তলায় রুম", subEn: "Rooms on floors", prefix: "", where: "floor" },
  { id: "COTTAGE", preset: "cottage", bn: "কটেজ", en: "Cottages", subBn: "আলাদা ছোট ঘর", subEn: "Standalone cottages", prefix: "C", where: "zone" },
  { id: "VILLA", preset: "villa", bn: "ভিলা", en: "Villas", subBn: "বড় আলাদা বাড়ি", subEn: "Private villas", prefix: "V", where: "zone" },
  { id: "APARTMENT", preset: "apartment", bn: "অ্যাপার্টমেন্ট", en: "Apartments", subBn: "রান্নাঘরসহ ফ্ল্যাট", subEn: "Flats with a kitchen", prefix: "A", where: "floor" },
  { id: "OTHER", preset: "custom", bn: "অন্য কিছু", en: "Something else", subBn: "তাঁবু, বোট, পড…", subEn: "Tents, boats, pods…", prefix: "U", where: "zone" },
];
export const SUGGEST: Record<string, CoreType[]> = {
  hotel: ["ROOM"], resort: ["ROOM", "COTTAGE", "VILLA"], "guest-house": ["ROOM"], homestay: ["ROOM"], "serviced-apartment": ["APARTMENT"],
  motel: ["ROOM"], hostel: ["ROOM"], "vacation-rental": ["VILLA"], lodge: ["COTTAGE"], other: ["ROOM"],
};

export const BUILDINGS: { id: string; bn: string; en: string; code: string }[] = [
  { id: "main", bn: "মূল বিল্ডিং", en: "Main building", code: "" },
  { id: "A", bn: "বিল্ডিং A", en: "Building A", code: "A" },
  { id: "B", bn: "বিল্ডিং B", en: "Building B", code: "B" },
  { id: "C", bn: "বিল্ডিং C", en: "Building C", code: "C" },
  { id: "D", bn: "বিল্ডিং D", en: "Building D", code: "D" },
  { id: "T1", bn: "টাওয়ার ১", en: "Tower 1", code: "T1" },
  { id: "T2", bn: "টাওয়ার ২", en: "Tower 2", code: "T2" },
];
export const MAX_FLOOR = 30;
export const PER_FLOOR = 50;
export const floorLabel = (l: number, bn: boolean) => {
  if (l === 0) return bn ? "নিচতলা" : "Ground floor";
  if (!bn) return `${l}${["th", "st", "nd", "rd"][l % 100 >= 11 && l % 100 <= 13 ? 0 : l % 10] ?? "th"} floor`;
  const B = "০১২৩৪৫৬৭৮৯";
  const n = String(l).replace(/\d/g, (x) => B[+x]);
  const suf = l === 1 ? "ম" : l === 2 ? "য়" : l === 3 ? "য়" : l === 4 ? "র্থ" : l === 6 ? "ষ্ঠ" : "ম";
  return `${n}${suf} তলা`;
};
export const ZONES: { id: string; bn: string; en: string; code: string }[] = [
  { id: "garden", bn: "বাগান", en: "Garden", code: "GD" },
  { id: "sea", bn: "সমুদ্রের পাশে", en: "Sea side", code: "SS" },
  { id: "hill", bn: "পাহাড়", en: "Hill", code: "HL" },
  { id: "lake", bn: "লেকের পাশে", en: "Lake side", code: "LK" },
  { id: "pool", bn: "পুলের পাশে", en: "Pool side", code: "PL" },
  { id: "zA", bn: "জোন A", en: "Zone A", code: "ZA" },
  { id: "zB", bn: "জোন B", en: "Zone B", code: "ZB" },
  { id: "zC", bn: "জোন C", en: "Zone C", code: "ZC" },
];

export const TYPE_NAMES: { bn: string; en: string }[] = [
  { bn: "স্ট্যান্ডার্ড", en: "Standard" }, { bn: "ডিলাক্স", en: "Deluxe" }, { bn: "প্রিমিয়াম", en: "Premium" }, { bn: "প্রিমিয়ার ডিলাক্স", en: "Premier Deluxe" },
  { bn: "এক্সিকিউটিভ", en: "Executive" }, { bn: "স্যুট", en: "Suite" }, { bn: "ফ্যামিলি", en: "Family" },
];
export const ROOM_KINDS: { id: string; bn: string; en: string; guests: number }[] = [
  { id: "single", bn: "সিঙ্গেল", en: "Single", guests: 1 }, { id: "double", bn: "ডাবল", en: "Double", guests: 2 }, { id: "twin", bn: "টুইন", en: "Twin", guests: 2 },
  { id: "triple", bn: "ট্রিপল", en: "Triple", guests: 3 }, { id: "family", bn: "ফ্যামিলি", en: "Family", guests: 4 },
];
export const BEDS: { id: string; bn: string; en: string }[] = [
  { id: "1 Single bed", bn: "সিঙ্গেল বেড", en: "Single bed" }, { id: "1 Double bed", bn: "ডাবল বেড", en: "Double bed" }, { id: "1 Queen bed", bn: "কুইন বেড", en: "Queen bed" },
  { id: "1 King bed", bn: "কিং বেড", en: "King bed" }, { id: "2 Single beds", bn: "টুইন বেড", en: "Twin beds" },
];
export const SIZES = [180, 250, 320, 400, 520, 700];

/** Presets → the accommodation config (buildings + floors, zones). Existing node ids are kept so units stay attached. */
export function configFrom(d: Draft, prev: Config): Config {
  const nodes: LocNode[] = [];
  const keep = (id: string) => prev.nodes.find((n) => n.id === id);
  const floorTypes = d.stay.filter((s) => STAY.find((x) => x.id === s)?.where === "floor");
  const zoneTypes = d.stay.filter((s) => STAY.find((x) => x.id === s)?.where === "zone");
  if (floorTypes.length) {
    const bs = d.buildings.length ? d.buildings : ["main"];
    for (const b of bs) {
      const B = BUILDINGS.find((x) => x.id === b)!;
      const bid = `b-${b}`;
      nodes.push({ ...(keep(bid) ?? {}), id: bid, kind: b.startsWith("T") ? "TOWER" : "BUILDING", name: B.en, code: bs.length > 1 ? B.code || "M" : B.code, active: true });
      for (const l of [...d.floors].sort((a, z) => a - z)) nodes.push({ id: `${bid}-f${l}`, kind: "FLOOR", name: l === 0 ? "Ground floor" : `Floor ${l}`, code: "", parent: bid, level: l, active: true });
    }
  }
  if (zoneTypes.length) for (const z of d.zones.length ? d.zones : ["garden"]) {
    const Z = ZONES.find((x) => x.id === z)!;
    nodes.push({ id: `z-${z}`, kind: "ZONE", name: Z.en, code: Z.code, active: true });
  }
  const base = prev.configured ? prev : emptyConfig();
  return { ...base, configured: true, version: prev.version + 1, savedAt: new Date().toISOString(), enabled: d.stay as CoreType[], nodes };
}

/** The ready list of numbers for one place (floor or zone), like the live HMS master settings list. */
export function presetNumbers(c: Config, leaf: LocNode, core: CoreType, ground: "G" | "0"): { local: string; code: string }[] {
  const st = STAY.find((s) => s.id === core)!;
  const out: { local: string; code: string }[] = [];
  if (leaf.kind === "FLOOR") {
    const b = c.nodes.find((n) => n.id === leaf.parent);
    const L = leaf.level ?? 0;
    for (let i = 1; i <= PER_FLOOR; i++) {
      const no = L === 0 ? (ground === "G" ? `G${String(i).padStart(2, "0")}` : String(i).padStart(3, "0")) : `${L}${String(i).padStart(2, "0")}`;
      const local = (core === "APARTMENT" ? st.prefix : "") + no;
      out.push({ local, code: b?.code ? `${b.code}-${local}` : local });
    }
  } else {
    for (let i = 1; i <= 99; i++) {
      const local = `${st.prefix}${String(i).padStart(2, "0")}`;
      out.push({ local, code: local });
    }
  }
  return out;
}
