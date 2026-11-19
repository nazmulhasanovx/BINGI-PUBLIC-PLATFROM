// Pricing + availability (pure functions — used on server and client).
// DEMO: availability and weekend uplift are simulated here. In production these numbers come
// from HMS Rates & Inventory via the booking-engine API; only this file changes.
import type { Hotel, Offer, RoomCategory } from "./types";

export type RatePlanId = "room-only" | "breakfast";

export interface RatePlan {
  id: RatePlanId;
  name: string;
  short: string;
  perAdultPerNight: number; // add-on on top of room rate
  refundable: boolean;
}

export function ratePlans(h: Hotel): RatePlan[] {
  const breakfast = h.services.find((s) => s.category === "stay" && /breakfast/i.test(s.name));
  const plans: RatePlan[] = [
    { id: "room-only", name: "Room only", short: "Best price. Add breakfast later if you like.", perAdultPerNight: 0, refundable: true },
  ];
  if (breakfast) plans.push({ id: "breakfast", name: "With breakfast", short: `Breakfast buffet for every adult, every morning.`, perAdultPerNight: breakfast.price, refundable: true });
  return plans;
}

export function localISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dateList(checkIn: string, checkOut: string): string[] {
  const out: string[] = [];
  if (!checkIn || !checkOut) return out;
  const d = new Date(checkIn + "T00:00:00");
  const end = new Date(checkOut + "T00:00:00");
  while (d < end && out.length < 60) {
    out.push(localISO(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

const isWeekendBD = (iso: string) => {
  const day = new Date(iso + "T00:00:00").getDay();
  return day === 4 || day === 5; // Thu & Fri nights (Bangladesh weekend)
};

/** Nightly rate for a date (demo: +10% Thu/Fri nights). */
export function nightlyRate(room: RoomCategory, iso: string) {
  return Math.round((isWeekendBD(iso) ? room.fromPrice * 1.1 : room.fromPrice) / 10) * 10;
}

/** Demo availability: deterministic per room/date so it is stable between renders. */
export function unitsLeft(room: RoomCategory, dates: string[]): number {
  if (!dates.length) return room.units;
  let min = room.units;
  for (const iso of dates) {
    let hash = 0;
    for (const c of room.id + iso) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
    // Demo occupancy (HMS supplies real inventory): ~8% of nights sold out, otherwise up to 60% booked.
    const booked = hash % 100 < 8 ? room.units : Math.floor((hash % (room.units + 1)) * 0.6);
    min = Math.min(min, Math.max(0, room.units - booked));
  }
  return min;
}

export function fits(room: RoomCategory, adults: number, children: number) {
  return adults <= room.maxAdults && children <= room.maxChildren;
}

export interface Extra {
  serviceId: string;
  qty: number;
}

export interface StayDraft {
  roomSlug: string;
  plan: RatePlanId;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

export interface PriceLine {
  label: string;
  amount: number;
  kind?: "room" | "plan" | "discount" | "tax" | "extra";
  qty?: number;
  unit?: number;
}

export interface Quote {
  nights: number;
  lines: PriceLine[];
  roomTotal: number;
  extrasTotal: number;
  discount: number;
  discountLabel?: string;
  promoCode?: string;
  subtotal: number;
  serviceCharge: number;
  vat: number;
  total: number;
}

/** Which offer applies (best one, not combinable). Mirrors the hotel's Discounts rules. */
export function bestOffer(h: Hotel, checkIn: string, n: number): { offer: Offer; percent: number } | null {
  const candidates: { offer: Offer; percent: number }[] = [];
  for (const o of h.offers) {
    if (o.kind !== "discount") continue;
    const pct = parseInt(o.value, 10);
    if (!pct) continue;
    if (/3 nights/i.test(o.conditions) && n >= 3) candidates.push({ offer: o, percent: pct });
    if (/Sun.?Wed/i.test(o.conditions) && checkIn) {
      const day = new Date(checkIn + "T00:00:00").getDay();
      if (day === 0 || day === 1 || day === 2 || day === 3) candidates.push({ offer: o, percent: pct });
    }
  }
  return candidates.sort((a, b) => b.percent - a.percent)[0] ?? null;
}

export type PromoCheck = { ok: true; percent: number; label: string; code: string } | { ok: false; reason: string };

/** Coupon validation (HMS Discounts → coupons). */
export function checkPromo(h: Hotel, code: string, nights: number): PromoCheck {
  const c = h.promoCodes.find((p) => p.code.toLowerCase() === code.trim().toLowerCase());
  if (!c) return { ok: false, reason: "This code isn’t valid" };
  if (c.minNights && nights < c.minNights) return { ok: false, reason: `Needs ${c.minNights}+ nights` };
  return { ok: true, percent: c.percent, label: c.label, code: c.code };
}

export function quote(h: Hotel, stay: StayDraft, extras: Extra[], promo?: string): Quote | null {
  const room = h.rooms.find((r) => r.slug === stay.roomSlug);
  if (!room) return null;
  const dates = dateList(stay.checkIn, stay.checkOut);
  const n = dates.length;
  const plan = ratePlans(h).find((p) => p.id === stay.plan) ?? ratePlans(h)[0];
  const roomOnly = dates.reduce((s, d) => s + nightlyRate(room, d), 0);
  const planAdd = plan.perAdultPerNight * stay.adults * n;
  const roomTotal = roomOnly + planAdd;

  const lines: PriceLine[] = [{ label: `${room.name} · ${n} night${n > 1 ? "s" : ""}`, amount: roomOnly, kind: "room", qty: n, unit: Math.round(roomOnly / Math.max(1, n)) }];
  if (planAdd) lines.push({ label: `Breakfast · ${stay.adults} adult${stay.adults > 1 ? "s" : ""} × ${n}`, amount: planAdd, kind: "plan", qty: stay.adults * n, unit: plan.perAdultPerNight });

  // One discount per booking: the better of the automatic offer and a valid promo code.
  const best = bestOffer(h, stay.checkIn, n);
  const pc = promo ? checkPromo(h, promo, n) : null;
  const usePromo = pc && pc.ok && pc.percent >= (best?.percent ?? 0);
  const pct = usePromo ? (pc as Extract<PromoCheck, { ok: true }>).percent : best?.percent ?? 0;
  const discount = Math.round((roomOnly * pct) / 100);
  const discountLabel = usePromo ? `Code ${(pc as Extract<PromoCheck, { ok: true }>).code} (${pct}% off)` : best ? `${best.offer.title} (${best.offer.value})` : undefined;
  if (discount) lines.push({ label: discountLabel!, amount: -discount, kind: "discount" });

  let extrasTotal = 0;
  for (const e of extras) {
    const s = h.services.find((x) => x.id === e.serviceId);
    if (!s || e.qty < 1) continue;
    const amt = s.price * e.qty;
    extrasTotal += amt;
    lines.push({ label: `${s.name} × ${e.qty}`, amount: amt, kind: "extra", qty: e.qty, unit: s.price });
  }

  const base = roomTotal - discount + extrasTotal;
  const { vatPercent, serviceChargePercent, inclusive } = h.taxes;
  let serviceCharge = 0;
  let vat = 0;
  let total = base;
  if (!inclusive) {
    serviceCharge = Math.round((base * serviceChargePercent) / 100);
    vat = Math.round(((base + serviceCharge) * vatPercent) / 100); // BD: VAT on (rate + SC)
    total = base + serviceCharge + vat;
    if (serviceCharge) lines.push({ label: `Service charge ${serviceChargePercent}%`, amount: serviceCharge, kind: "tax" });
    if (vat) lines.push({ label: `VAT ${vatPercent}%`, amount: vat, kind: "tax" });
  }

  return { nights: n, lines, roomTotal, extrasTotal, discount, discountLabel, promoCode: usePromo ? (pc as Extract<PromoCheck, { ok: true }>).code : undefined, subtotal: base, serviceCharge, vat, total };
}
