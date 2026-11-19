"use client";
// Discounts & Rates (11 Nov 2026) — one calendar for the whole property's prices, plus discount campaigns.
// Price of a night, most specific wins:
//   room date override (Advanced) → category date override → category weekend price (Fri/Sat) → category base price
//   For a room without its own date price: category price for that night + the room's premium (room rate − base).
// The base price and the room rate live in Rooms (category.baseRate, unit.rate) — this module edits them there,
// so there is one source of truth. Campaign fields match the live HMS "Create Campaign" form.
// Production: rate_overrides(category|unit, date, price, closed, min_stay), category_weekend_price, discount_campaigns.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY, useRooms, type Category, type Unit } from "@/lib/rooms/store";

export type DayRule = { price?: number; closed?: boolean; minStay?: number };
export type Scope = "all" | "type" | "rooms";
export type CampaignStatus = "draft" | "scheduled" | "active" | "paused";
export type Campaign = {
  id: string; type: "coupon" | "flash"; name: string; nameBn: string; code?: string; message: string;
  scope: Scope; cats: string[]; units: string[]; kind: "percent" | "fixed"; value: number;
  start: string; end: string; limit?: number; used: number; status: CampaignStatus;
};
type State = { v: 1; cat: Record<string, Record<string, DayRule>>; unit: Record<string, Record<string, DayRule>>; weekend: Record<string, number>; campaigns: Campaign[] };

/** Bangladesh weekend: Friday + Saturday. */
export const WEEKEND = [5, 6];
const add = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const addDays = add;
export const dow = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();
export const isWeekend = (iso: string) => WEEKEND.includes(dow(iso));
export const tk = (n: number) => `৳${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
export const range = (a: string, b: string) => { const [x, y] = a <= b ? [a, b] : [b, a]; const out: string[] = []; for (let d = x; d <= y; d = add(d, 1)) out.push(d); return out; };

function seed(cats: Category[]): State {
  const c0 = cats[0]?.id, c1 = cats[1]?.id;
  const cat: State["cat"] = {};
  if (c0) cat[c0] = { [add(TODAY, 21)]: { price: Math.round((cats[0].baseRate * 1.25) / 100) * 100 }, [add(TODAY, 22)]: { price: Math.round((cats[0].baseRate * 1.25) / 100) * 100 }, [add(TODAY, 5)]: { closed: true } };
  return {
    v: 1, cat, unit: {}, weekend: Object.fromEntries(cats.slice(0, 2).map((c) => [c.id, Math.round((c.baseRate * 1.15) / 100) * 100])),
    campaigns: [
      { id: "cp1", type: "flash", name: "Winter offer", nameBn: "শীতের অফার", message: "10% off winter stays", scope: "all", cats: [], units: [], kind: "percent", value: 10, start: add(TODAY, 3), end: add(TODAY, 40), used: 4, status: "active" },
      { id: "cp2", type: "coupon", name: "Corporate", nameBn: "কর্পোরেট", code: "BIZ1500", message: "৳1,500 off for partner companies", scope: c1 ? "type" : "all", cats: c1 ? [c1] : [], units: [], kind: "fixed", value: 1500, start: TODAY, end: add(TODAY, 90), limit: 50, used: 12, status: "active" },
      { id: "cp3", type: "coupon", name: "Werwer", nameBn: "", code: "WERWER", message: "", scope: "all", cats: [], units: [], kind: "fixed", value: 20, start: add(TODAY, -7), end: add(TODAY, -5), used: 0, status: "active" },
    ],
  };
}
const KEY = (slug: string) => `bingi-rates-v1-${slug}`;
const cache = new Map<string, { raw: string | null; st: State }>();
const listeners = new Set<() => void>();
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
function read(slug: string, cats: Category[]): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(slug)); } catch {}
  const hit = cache.get(slug);
  if (hit && hit.raw === raw && (raw || !cats.length || Object.keys(hit.st.weekend).length)) return hit.st;
  let st = seed(cats);
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 1) st = p; } catch {}
  cache.set(slug, { raw, st });
  return st;
}
function write(slug: string, st: State) { const raw = JSON.stringify(st); try { localStorage.setItem(KEY(slug), raw); } catch {} cache.set(slug, { raw, st }); listeners.forEach((l) => l()); }

/** What a campaign shows as right now. */
export const campaignState = (c: Campaign, today = TODAY): "active" | "scheduled" | "expired" | "draft" | "paused" =>
  c.status === "draft" ? "draft" : c.status === "paused" ? "paused" : c.end < today ? "expired" : c.start > today ? "scheduled" : "active";
const applies = (c: Campaign, catId: string, unitId?: string) => c.scope === "all" || (c.scope === "type" && c.cats.includes(catId)) || (c.scope === "rooms" && !!unitId && c.units.includes(unitId));
const cut = (c: Campaign, p: number) => Math.max(0, c.kind === "percent" ? Math.round(p * (1 - c.value / 100)) : p - c.value);

export function useRates(h: Hotel) {
  const { st: rooms, update: updateRooms } = useRooms(h);
  const cats = useMemo(() => rooms.categories.filter((c) => !c.archived), [rooms.categories]);
  const units = useMemo(() => rooms.units.filter((u) => u.status === "published"), [rooms.units]);
  const st = useSyncExternalStore(sub, () => read(h.slug, cats), () => seed([]));
  const update = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h.slug, cats)); fn(n); write(h.slug, n); }, [h.slug, cats]);

  const catById = useMemo(() => new Map(cats.map((c) => [c.id, c])), [cats]);
  /** Category price for one night (before discounts) and where it came from. */
  const catPrice = useCallback((catId: string, date: string) => {
    const c = catById.get(catId); const r = st.cat[catId]?.[date];
    if (r?.price != null) return { price: r.price, from: "custom" as const, closed: !!r.closed };
    if (isWeekend(date) && st.weekend[catId] != null) return { price: st.weekend[catId], from: "weekend" as const, closed: !!r?.closed };
    return { price: c?.baseRate ?? 0, from: "base" as const, closed: !!r?.closed };
  }, [catById, st]);
  /** A room's premium over its category's base price (Rooms → room rate). */
  const premium = useCallback((u: Unit) => (u.rate != null ? u.rate - (catById.get(u.category)?.baseRate ?? 0) : 0), [catById]);
  const unitPrice = useCallback((u: Unit, date: string) => {
    const r = st.unit[u.id]?.[date]; const c = catPrice(u.category, date);
    if (r?.price != null) return { price: r.price, from: "room" as const, closed: c.closed || !!r.closed };
    return { price: c.price + premium(u), from: premium(u) ? ("premium" as const) : c.from, closed: c.closed || !!r?.closed };
  }, [catPrice, premium, st.unit]);
  /** Best automatic deal (flash) for a night — coupons need a code, so they never change the shown price. */
  const deal = useCallback((catId: string, date: string, price: number, unitId?: string) => {
    let best: { c: Campaign; price: number } | null = null;
    for (const c of st.campaigns) {
      if (c.type !== "flash" || campaignState(c) === "draft" || c.status === "paused" || date < c.start || date > c.end || !applies(c, catId, unitId)) continue;
      if (c.limit && c.used >= c.limit) continue;
      const p = cut(c, price); if (!best || p < best.price) best = { c, price: p };
    }
    return best;
  }, [st.campaigns]);

  // ---- edits ----
  const setCatDays = useCallback((catId: string, dates: string[], rule: DayRule | null) => update((s) => {
    const m = (s.cat[catId] ??= {});
    for (const d of dates) { if (rule === null) delete m[d]; else m[d] = { ...m[d], ...rule }; if (m[d] && m[d].price == null && !m[d].closed && !m[d].minStay) delete m[d]; }
  }), [update]);
  const setUnitDays = useCallback((unitId: string, dates: string[], rule: DayRule | null) => update((s) => {
    const m = (s.unit[unitId] ??= {});
    for (const d of dates) { if (rule === null) delete m[d]; else m[d] = { ...m[d], ...rule }; if (m[d] && m[d].price == null && !m[d].closed) delete m[d]; }
  }), [update]);
  const setWeekend = useCallback((catId: string, price: number | null) => update((s) => { if (price == null) delete s.weekend[catId]; else s.weekend[catId] = price; }), [update]);
  /** Base price lives on the category in Rooms. */
  const setBase = useCallback((catId: string, price: number) => updateRooms((s) => { const c = s.categories.find((x) => x.id === catId); if (c) c.baseRate = price; }, `Base price changed`), [updateRooms]);
  /** Room premium = the room's own rate in Rooms (base + premium). null = same as category. */
  const setPremium = useCallback((unitId: string, plus: number | null) => updateRooms((s) => { const u = s.units.find((x) => x.id === unitId); const c = s.categories.find((x) => x.id === u?.category); if (u) u.rate = plus == null || plus === 0 ? undefined : (c?.baseRate ?? 0) + plus; }, `Room price changed`), [updateRooms]);
  const saveCampaign = useCallback((c: Campaign) => update((s) => { const i = s.campaigns.findIndex((x) => x.id === c.id); if (i >= 0) s.campaigns[i] = c; else s.campaigns.unshift(c); }), [update]);
  const removeCampaign = useCallback((id: string) => update((s) => { s.campaigns = s.campaigns.filter((x) => x.id !== id); }), [update]);
  const setStatus = useCallback((id: string, status: CampaignStatus) => update((s) => { const c = s.campaigns.find((x) => x.id === id); if (c) c.status = status; }), [update]);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); }, [h.slug]);

  return { st, cats, units, catPrice, unitPrice, premium, deal, setCatDays, setUnitDays, setWeekend, setBase, setPremium, saveCampaign, removeCampaign, setStatus, reset, uid: (p: string) => `${p}${Date.now().toString(36)}` };
}
