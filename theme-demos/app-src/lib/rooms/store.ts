"use client";
// Accommodation (Rooms) module — data + actions. Spec: Room-Accomodation- V1.2.
// Prototype: kept per property in this browser (localStorage). Production: HMS Rooms API, where
// code uniqueness and bulk creation are enforced by the database in one transaction.
import { useCallback, useSyncExternalStore } from "react";
import type { Hotel, RoomCategory } from "@/lib/types";
import { BUILDING_KINDS, CORE, CORE_TYPES, FLOOR_KINDS, ZONE_KINDS, pad, preset, propertyTypeOf, type CoreType, type LocKindCode, type PresetSlug, type Template } from "./catalog";

export type LocKind = LocKindCode;
export type LocNode = { id: string; kind: LocKind; name: string; code: string; parent?: string; level?: number; active: boolean };
export const isBuilding = (n: LocNode) => BUILDING_KINDS.includes(n.kind);
export const isFloor = (n: LocNode) => FLOOR_KINDS.includes(n.kind);
export const isZone = (n: LocNode) => ZONE_KINDS.includes(n.kind);
export type Numbering = { template: Template; digits: 2 | 3 };
export type Config = {
  configured: boolean;
  version: number;
  savedAt?: string;
  enabled: CoreType[];
  nodes: LocNode[];
  numbering: Record<CoreType, Numbering>;
  prefixes: Partial<Record<PresetSlug, string>>;
};
export type MealMode = "none" | "included" | "extra";
export type Category = {
  id: string; name: string; core: CoreType; preset: PresetSlug;
  bed: string; maxAdults: number; maxChildren: number; sizeSqft?: number; bedrooms?: number;
  bathrooms?: number;
  amenities: string[]; video?: string; baseRate: number; photo?: string; created: string;
  /** Backend rule: BinGi (Superadmin) approves a category before its units can be published. */
  approval: "pending" | "approved";
  archived?: boolean;
  /** From the easy room builder (live HMS fields): Single/Double/Twin… and meal setup. */
  roomKind?: string;
  meals?: { breakfast: MealMode; lunch: MealMode; dinner?: MealMode };
  /** Paid meal price per person per night (only used when that meal is "extra"). */
  mealPrices?: { breakfast?: number; lunch?: number; dinner?: number };
  description?: string;
  /** Photos uploaded for this room type (max 10). */
  photos?: string[];
  /** Room-type tax. syncTax (default) = follow the hotel defaults from Settings. Snapshotted on each booking (backend). */
  vat?: number; service?: number; syncTax?: boolean;
};
export type Unit = {
  id: string; code: string; local: string; node: string; category: string; core: CoreType; preset: PresetSlug;
  /** draft = persisted, owns its code, not bookable · published = sellable on eligible dates · archived = kept for history, code stays reserved, frees capacity */
  /** Out of order (maintenance) — separate from publish status and from bookings; blocks new sales. */
  /** Out of order (maintenance) from `since`; open-ended unless `until` (first day back in service). */
  ooo?: { reason: string; since: string; until?: string };
  status: "draft" | "published" | "archived"; rate?: number; video: "inherit" | "replace" | "hide"; videoUrl?: string; note?: string;
  created: string;
};
export type Pick = { node: string; local: string; code: string };
export type SetupDraft = { id: string; savedAt: string; preset: PresetSlug; core: CoreType; category?: string; picks: Pick[] };
export type RoomsState = { v: number; config: Config; categories: Category[]; units: Unit[]; drafts: SetupDraft[]; activity: { at: string; text: string }[];
  /** Inventory this release cannot hold (dormitory beds): shown as a notice, never converted. */
  excluded?: { name: string; reason: string }[] };
/** Backend limit for one batch create. */
export const BATCH_MAX = 100;

export const TODAY = "2026-11-10";
export const nowStamp = () => `${TODAY}T${new Date().toTimeString().slice(0, 5)}`;
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

export const defaultNumbering = (): Record<CoreType, Numbering> => ({
  ROOM: { template: "floor", digits: 2 },
  APARTMENT: { template: "floor", digits: 2 },
  COTTAGE: { template: "prefix", digits: 2 },
  VILLA: { template: "prefix", digits: 2 },
  OTHER: { template: "prefix", digits: 2 },
});
export const emptyConfig = (): Config => ({ configured: false, version: 0, enabled: [], nodes: [], numbering: defaultNumbering(), prefixes: {} });

// ---------------- location + numbering helpers ----------------
export const node = (c: Config, id?: string) => c.nodes.find((n) => n.id === id);
export function nodePath(c: Config, id: string): string {
  const n = node(c, id);
  if (!n) return "Unknown location";
  const p = n.parent ? node(c, n.parent) : undefined;
  return p ? `${p.name} › ${n.name}` : n.name;
}
/** Where units of this Core Type can sit: floors (inside buildings), or zones/blocks. */
export function leaves(c: Config, core: CoreType): LocNode[] {
  const active = c.nodes.filter((n) => n.active);
  if (CORE[core].strategy === "floor") {
    // Buildings in the order the owner added them, then floors bottom-up.
    const order = (id?: string) => c.nodes.findIndex((n) => n.id === id);
    return active.filter((n) => isFloor(n) && active.some((b) => b.id === n.parent)).sort((a, b) => order(a.parent) - order(b.parent) || (a.level ?? 0) - (b.level ?? 0));
  }
  const zones = active.filter((n) => isZone(n));
  return zones.flatMap((z) => {
    const blocks = active.filter((b) => b.kind === "BLOCK" && b.parent === z.id);
    return blocks.length ? [z, ...blocks] : [z];
  });
}
export const prefixOf = (c: Config, p: PresetSlug) => (c.prefixes[p] ?? preset(p).prefix).toUpperCase();

/** The i-th suggested number for a location. null = this template is manual only. */
export function codeFor(c: Config, core: CoreType, p: PresetSlug, leaf: LocNode, i: number): { local: string; code: string } | null {
  const { template: t, digits: d } = c.numbering[core];
  if (t === "custom") return null;
  const px = prefixOf(c, p);
  if (CORE[core].strategy === "floor") {
    const b = node(c, leaf.parent);
    const L = leaf.level ?? 0;
    // A tower/building code already tells apartments apart (TA-101), so the "A" prefix is dropped there.
    const p2 = b?.code ? "" : px;
    const floorNo = L === 0 ? `G${pad(i, d)}` : `${L}${pad(i, d)}`;
    const local = t === "floor" || t === "block" ? p2 + floorNo : t === "sequential" ? p2 + pad(i, 3) : p2 + pad(i, d);
    const bc = b?.code || (t === "block" ? (b?.name ?? "B").replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase() : "");
    return { local, code: bc ? `${bc}-${local}` : local };
  }
  const zone = leaf.kind === "BLOCK" ? node(c, leaf.parent) : leaf;
  const local = t === "sequential" ? px + pad(i, 3) : px + pad(i, d);
  if (t === "block" && leaf.kind === "BLOCK") return { local, code: `${leaf.code || leaf.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase()}-${local}` };
  return { local, code: t === "zone" && zone?.code ? `${zone.code}-${local}` : local };
}
export const sameCode = (a: string, b: string) => a.trim().toUpperCase() === b.trim().toUpperCase();
/** Hotel defaults (Settings → Taxes in the live HMS; fixed here in the prototype). */
export const HOTEL_TAX = { vat: 15, service: 10 };
/** Is the room out of order on any night in [from, to)? */
export const oooOn = (u: { ooo?: Unit["ooo"] }, from: string, to: string) => !!u.ooo && u.ooo.since.slice(0, 10) < to && (!u.ooo.until || u.ooo.until > from);
export const taxOf = (c: Category) => (c.syncTax === false ? { vat: c.vat ?? 0, service: c.service ?? 0 } : HOTEL_TAX);
/** Guest price for one night: base + service charge + VAT (VAT on base + service, as in Discounts & Rates). */
export function priceBreak(base: number, t: { vat: number; service: number }) {
  const service = base * t.service / 100, vat = (base + service) * t.vat / 100;
  return { base, service, vat, total: base + service + vat };
}
export const unitRate = (u: Unit, cat?: Category) => u.rate ?? cat?.baseRate ?? 0;

/** Problems that stop a unit from being published (video is never one of them). */
export function publishIssues(s: RoomsState, u: Unit): string[] {
  const cat = s.categories.find((c) => c.id === u.category);
  const out: string[] = [];
  if (!cat) out.push("Category is missing");
  if (!s.config.enabled.includes(u.core)) out.push(`${CORE[u.core].label} is not turned on in setup`);
  const n = node(s.config, u.node);
  if (!n || !n.active) out.push("Location no longer exists");
  if (!(unitRate(u, cat) > 0)) out.push("Price is missing");
  if (cat && cat.maxAdults < 1) out.push("Occupancy is missing");
  if (cat && cat.approval !== "approved") out.push("Category is waiting for BinGi approval");
  if (u.status === "archived") out.push("Unit is archived");
  if (s.units.some((o) => o.id !== u.id && sameCode(o.code, u.code))) out.push(`Code ${u.code} is used twice`);
  return out;
}

// ---------------- seed from the demo hotel ----------------
const isPod = (r: RoomCategory) => r.kind === "dorm" && /pod/i.test(r.bed);
function presetFor(r: RoomCategory): PresetSlug {
  const n = r.name.toLowerCase();
  if (r.kind === "cottage") return n.includes("bungalow") ? "bungalow" : n.includes("cabin") ? "cabin" : "cottage";
  if (r.kind === "dorm") return "capsule";
  return ({ room: "room", suite: "room", villa: "villa", apartment: "apartment" } as const)[r.kind];
}
const coreFor = (r: RoomCategory): CoreType => (r.kind === "dorm" ? "OTHER" : ({ room: "ROOM", suite: "ROOM", villa: "VILLA", cottage: "COTTAGE", apartment: "APARTMENT" } as const)[r.kind]);

/** Demo backfill: every website room category becomes an APPROVED category with PUBLISHED units.
 *  Pod dorms become Capsule/Pod whole units (one unit per pod). Bunk-bed dorms sell single beds — out of this release, listed as excluded. */
export function seed(h: Hotel): RoomsState {
  // New property from onboarding: nothing set up yet.
  if (!h.rooms.length) return { v: 2, config: emptyConfig(), categories: [], units: [], drafts: [], activity: [] } as RoomsState;
  const c: Config = { ...emptyConfig(), configured: true, version: 1, savedAt: "2026-11-01T10:00" };
  const cats: Category[] = [];
  const units: Unit[] = [];
  const excluded: { name: string; reason: string }[] = [];
  const at = "2026-11-01T10:00";
  const rooms = h.rooms.filter((r) => { if (r.kind === "dorm" && !isPod(r)) { excluded.push({ name: r.name, reason: "Sells single beds. Dormitory / per-bed selling is not part of this release." }); return false; } return true; });
  const cores = [...new Set(rooms.map(coreFor))];
  c.enabled = CORE_TYPES.filter((t) => cores.includes(t));
  const allApt = rooms.length > 0 && rooms.every((r) => r.kind === "apartment");
  const building: LocNode = { id: "loc-main", kind: allApt ? "TOWER" : "BUILDING", name: allApt ? "Tower A" : "Main Building", code: allApt ? "TA" : "", active: true };
  let floor = 0;
  const floors: LocNode[] = [];
  const zones: Record<string, LocNode> = {};
  const zoneFor = (core: CoreType, r: RoomCategory) => {
    const name = isPod(r) ? `${r.name} room` : core === "VILLA" ? (h.propertyType === "resort" ? "Beach Zone" : "Villa Zone") : core === "COTTAGE" ? "Garden Zone" : "Outdoor Zone";
    return (zones[name] ??= { id: `loc-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`, kind: isPod(r) ? "SECTION" : "ZONE", name, code: isPod(r) ? "" : name[0], active: true });
  };
  const counters: Record<string, number> = {};
  for (const r of rooms) {
    const core = coreFor(r);
    const p = presetFor(r);
    const cat: Category = {
      id: `cat-${r.id}`, name: r.name, core, preset: p, bed: r.bed, maxAdults: r.maxAdults, maxChildren: r.maxChildren, sizeSqft: r.sizeSqft,
      bedrooms: r.kind === "dorm" ? undefined : r.bedrooms, amenities: [...(r.amenities ?? []), ...(r.specs ?? [])].slice(0, 8), baseRate: r.fromPrice, photo: r.photos[0], description: r.description, created: at, approval: "approved",
    };
    cats.push(cat);
    if (CORE[core].strategy === "floor") {
      let left = r.units;
      while (left > 0) {
        floor += 1;
        const f: LocNode = { id: `loc-f${floor}`, kind: "FLOOR", name: `Floor ${floor}`, code: String(floor), parent: building.id, level: floor, active: true };
        floors.push(f);
        const take = Math.min(left, 10);
        for (let i = 1; i <= take; i++) {
          const k = codeFor({ ...c, nodes: [building, f] }, core, p, f, i)!;
          units.push({ id: uid("u"), code: k.code, local: k.local, node: f.id, category: cat.id, core, preset: p, status: "published", video: "inherit", created: at });
        }
        left -= take;
      }
    } else {
      const z = zoneFor(core, r);
      const px = (c.prefixes[p] ?? preset(p).prefix).toUpperCase();
      for (let i = 0; i < r.units; i++) {
        counters[px] = (counters[px] ?? 0) + 1;
        const local = `${px}${pad(counters[px], 2)}`;
        units.push({ id: uid("u"), code: local, local, node: z.id, category: cat.id, core, preset: p, status: "published", video: "inherit", created: at });
      }
    }
  }
  const oooCat = cats[2] ?? cats[0];
  const oooUnit = oooCat && units.find((u) => u.category === oooCat.id);
  if (oooUnit) oooUnit.ooo = { reason: "AC repair", since: "2026-11-09" };
  for (const k of cats) { k.syncTax = true; k.meals = { breakfast: "included", lunch: "none", dinner: "extra" }; k.mealPrices = { dinner: 1200 }; }
  c.nodes = [...(floors.length ? [building, ...floors] : []), ...Object.values(zones)];
  return { v: 2, config: c, categories: cats, units, drafts: [], excluded, activity: [{ at, text: `Accommodation setup saved for ${h.name} (${propertyTypeOf(h.propertyType).label})` }] };
}

// ---------------- store (one record per property) ----------------
const KEY = (slug: string) => `bingi-rooms-v1-${slug}`;
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; st: RoomsState }>();
const seeds = new Map<string, RoomsState>();
const base = (h: Hotel) => { if (!seeds.has(h.slug)) seeds.set(h.slug, seed(h)); return seeds.get(h.slug)!; };
function read(h: Hotel): RoomsState {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(h.slug)); } catch {}
  const hit = cache.get(h.slug);
  if (hit && hit.raw === raw) return hit.st;
  let st = base(h);
  if (raw) try {
    const p = JSON.parse(raw);
    if (p && p.v === st.v && p.config && Array.isArray(p.units) && Array.isArray(p.categories)) st = p;
  } catch {}
  cache.set(h.slug, { raw, st });
  return st;
}
function write(h: Hotel, st: RoomsState) {
  const raw = JSON.stringify(st);
  try { localStorage.setItem(KEY(h.slug), raw); } catch {}
  cache.set(h.slug, { raw, st });
  listeners.forEach((l) => l());
}
const sub = (l: () => void) => {
  listeners.add(l);
  const s = (e: StorageEvent) => { if (e.key?.startsWith("bingi-rooms-v1-")) l(); };
  window.addEventListener("storage", s);
  return () => { listeners.delete(l); window.removeEventListener("storage", s); };
};

/** Outside React: has this property finished the one-time setup? */
export function roomsConfigured(h: Hotel) { try { return read(h).config.configured; } catch { return false; } }

export type CreateResult = { ok: true; ids: string[] } | { ok: false; conflicts: string[] };

export function useRooms(h: Hotel) {
  const st = useSyncExternalStore(sub, () => read(h), () => base(h));
  const update = useCallback((fn: (s: RoomsState) => void, log?: string) => {
    const next = structuredClone(read(h));
    fn(next);
    if (log) next.activity.unshift({ at: nowStamp(), text: log });
    next.activity = next.activity.slice(0, 50);
    write(h, next);
  }, [h]);

  /** All-or-nothing: re-checks every code against the latest saved data (another staff member may have created it). */
  const createUnits = useCallback((picks: Pick[], cat: Category, status: Unit["status"], over: Record<string, { rate?: number; video?: Unit["video"]; videoUrl?: string; note?: string }> = {}): CreateResult => {
    const now = read(h);
    const conflicts: string[] = [];
    const seen = new Set<string>();
    for (const p of picks) {
      const k = p.code.trim().toUpperCase();
      if (seen.has(k)) conflicts.push(`${p.code} is selected twice`);
      seen.add(k);
      const ex = now.units.find((u) => sameCode(u.code, p.code));
      if (ex) conflicts.push(`${p.code} already exists (${ex.status === "draft" ? "draft" : "published"})`);
      if (!node(now.config, p.node)?.active) conflicts.push(`${p.code}: location no longer exists`);
    }
    if (!picks.length) conflicts.push("No units selected");
    if (picks.length > BATCH_MAX) conflicts.push(`At most ${BATCH_MAX} units in one batch`);
    const existingCat = now.categories.find((c) => c.id === cat.id);
    if (status === "published" && (existingCat ?? cat).approval !== "approved") conflicts.push("This category is waiting for BinGi approval. Create the units as drafts now; publish after approval.");
    if (conflicts.length) return { ok: false, conflicts };
    const ids: string[] = [];
    update((s) => {
      if (!s.categories.some((c) => c.id === cat.id)) s.categories.push(cat);
      for (const p of picks) {
        const o = over[p.code] ?? {};
        const id = uid("u");
        ids.push(id);
        s.units.push({
          id, code: p.code.toUpperCase(), local: p.local.toUpperCase(), node: p.node, category: cat.id, core: cat.core, preset: cat.preset, status,
          rate: o.rate, video: o.video ?? "inherit", videoUrl: o.videoUrl, note: o.note, created: nowStamp(),
        });
      }
    }, `${picks.length} ${picks.length === 1 ? "unit" : "units"} ${status === "published" ? "published" : "created as draft"} · ${cat.name} (${picks.map((p) => p.code.toUpperCase()).slice(0, 6).join(", ")}${picks.length > 6 ? "…" : ""})`);
    return { ok: true, ids };
  }, [h, update]);

  const reset = useCallback(() => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); }, [h]);
  const startFresh = useCallback(() => {
    write(h, { v: 2, config: emptyConfig(), categories: [], units: [], drafts: [], activity: [{ at: nowStamp(), text: "Demo: accommodation setup cleared" }] });
  }, [h]);
  return { st, update, createUnits, reset, startFresh };
}
export { uid };
