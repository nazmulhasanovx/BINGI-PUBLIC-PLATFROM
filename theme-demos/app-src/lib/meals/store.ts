"use client";
// Restaurant & Bar store (prototype, localStorage per property). Production: menu_categories, menu_items,
// dining_places (tables / room QR / general QR), fb_orders + fb_order_lines, fb_settings. Cash payments are
// posted to the right Cashbox drawer by the UI (see components/hms/meals) using the Cashbox store.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY } from "@/lib/rooms/store";
import { DEFAULT_SETTINGS, nowMin, outletsOf, seedMenu, seedOrders, seedPlaces, type Category, type Item, type Discount, type Line, type Order, type PayMethod, type Payment, type Place, type Service, type Settings, type Source, type Status } from "./seed";

type State = { v: 1; categories: Category[]; items: Item[]; places: Place[]; orders: Order[]; settings: Settings; next: number };
export type InHouse = { room: string; guest: string };

const KEY = (slug: string) => `bingi-meals-v1-${slug}`;
const cache = new Map<string, { raw: string | null; sig: string; st: State }>();
const seeds = new Map<string, State>();
const listeners = new Set<() => void>();
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const EMPTY: State = { v: 1, categories: [], items: [], places: [], orders: [], settings: DEFAULT_SETTINGS, next: 1 };
function seed(h: Hotel, inHouse: InHouse[], rooms: string[]): State {
  const { categories, items } = seedMenu(h);
  const orders = seedOrders(h, inHouse);
  const next = Math.max(...orders.map((o) => Number(o.no.slice(3)))) + 1;
  return { v: 1, categories, items, places: seedPlaces(rooms), orders, settings: DEFAULT_SETTINGS, next };
}
function read(h: Hotel, inHouse: InHouse[], rooms: string[]): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(h.slug)); } catch {}
  const sig = `${h.slug}|${inHouse.map((x) => x.room).join(",")}|${rooms.join(",")}`;
  const hit = cache.get(h.slug);
  if (hit && hit.raw === raw && hit.sig === sig) return hit.st;
  if (!seeds.has(sig)) seeds.set(sig, seed(h, inHouse, rooms));
  let st = seeds.get(sig)!;
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 1 && Array.isArray(p.orders) && Array.isArray(p.items)) st = p; } catch {}
  cache.set(h.slug, { raw, sig, st });
  return st;
}
function write(slug: string, st: State) { const raw = JSON.stringify(st); try { localStorage.setItem(KEY(slug), raw); } catch {} cache.set(slug, { raw, sig: cache.get(slug)?.sig ?? "", st }); listeners.forEach((l) => l()); }
const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const stamp = () => `${TODAY}T${hm(nowMin())}`;
/** Minutes since an order was placed (today only). */
export const ageOf = (o: Order) => (o.at.slice(0, 10) === TODAY ? Math.max(0, nowMin() - (Number(o.at.slice(11, 13)) * 60 + Number(o.at.slice(14, 16)))) : 0);
export const uid = (p: string) => `${p}${Math.random().toString(36).slice(2, 8)}`;

export type NewOrder = { outlet: string; source: Source; service: Service; place?: string; room?: string; guest?: string; lines: Line[] };
export function useMeals(h: Hotel, inHouse: InHouse[], rooms: string[]) {
  const st = useSyncExternalStore(sub, () => read(h, inHouse, rooms), () => EMPTY);
  const update = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h, inHouse, rooms)); fn(n); write(h.slug, n); }, [h, inHouse, rooms]);
  const outlets = useMemo(() => outletsOf(h), [h]);
  const setOrder = (id: string, fn: (o: Order) => void) => update((s) => { const o = s.orders.find((x) => x.id === id); if (o) fn(o); });
  return {
    st, outlets, ready: st.items.length > 0,
    /** New order. POS goes straight to the kitchen unless POS approval is on; QR orders follow the QR rule. */
    create: (n: NewOrder): Order => {
      let made: Order | undefined;
      update((s) => {
        const needs = n.source === "pos" ? s.settings.posApproval : s.settings.qrApproval;
        made = { ...n, id: uid("o"), no: `RB-${s.next++}`, at: stamp(), sc: s.settings.sc, vat: s.settings.vat, status: needs ? "approval" : "queued", pay: "unpaid", by: "Md Yeapas" };
        s.orders.push(made);
      });
      return made!;
    },
    setStatus: (id: string, status: Status, reason?: string) => setOrder(id, (o) => { o.status = status; if (reason) o.reason = reason; }),
    pay: (id: string, method: PayMethod, room?: string, payments?: Payment[]) => setOrder(id, (o) => { o.pay = method === "room" ? "room" : "paid"; o.method = method; o.paidAt = stamp(); if (room) o.room = room; if (payments) o.payments = payments; }),
    /** Running order: add more dishes to an unpaid order. They go to the kitchen as a new round. */
    addLines: (id: string, lines: Line[]) => setOrder(id, (o) => {
      if (o.pay !== "unpaid" || ["cancelled", "declined"].includes(o.status)) return;
      const r = (o.round ?? 1) + 1;
      o.round = r;
      for (const l of lines) o.lines.push({ ...l, round: r });
      if (o.status !== "approval") o.status = "queued";
    }),
    setDiscount: (id: string, d?: Discount) => setOrder(id, (o) => { o.discount = d; }),
    saveItem: (it: Item) => update((s) => { const i = s.items.findIndex((x) => x.id === it.id); if (i >= 0) s.items[i] = it; else s.items.push(it); }),
    removeItem: (id: string) => update((s) => { s.items = s.items.filter((x) => x.id !== id); }),
    saveCategory: (c: Category) => update((s) => { const i = s.categories.findIndex((x) => x.id === c.id); if (i >= 0) s.categories[i] = c; else s.categories.push(c); }),
    removeCategory: (id: string) => update((s) => { s.categories = s.categories.filter((x) => x.id !== id); }),
    savePlace: (p: Place) => update((s) => { const i = s.places.findIndex((x) => x.id === p.id); if (i >= 0) s.places[i] = p; else s.places.push(p); }),
    saveSettings: (x: Settings) => update((s) => { s.settings = x; }),
    reset: () => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); },
  };
}
export type Meals = ReturnType<typeof useMeals>;
