"use client";
// Guests + reviews for one property (prototype: localStorage per property).
// Production: guests table (unique phone per property), guest_documents, guest_notes, reviews + review_replies
// (reply and publication are moderated by BinGi Super Admin). Stays come from bookings.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY } from "@/lib/rooms/store";
import { DEMO_GUESTS, demoReviews, type Review, type Stay } from "@/lib/bookings/demo";
import { useStays } from "@/lib/bookings/store";

export type IdType = "NID" | "Passport" | "Driving licence" | "";
export type Guest = {
  id: string; name: string; phone: string; email: string; country: string; address: string;
  idType: IdType; idNo: string; idFront?: string; idBack?: string; verified: boolean;
  vip: boolean; blocked?: { reason: string; at: string }; prefs: string[]; notes: string; marketing: boolean; created: string;
  /** Guest register (Bangladesh hotels keep these for every stay; foreigners also need visa details). */
  gender?: "Male" | "Female" | "Other"; dob?: string; occupation?: string; visaNo?: string; visaExpiry?: string;
};
export type ReviewAct = { reply?: { text: string; at: string }; report?: { reason: string; at: string } };
type State = { v: 1; guests: Guest[]; acts: Record<string, ReviewAct> };

export const PREFS = ["High floor", "Quiet room", "Twin beds", "Extra pillow", "Late check-out", "Airport pickup", "Vegetarian", "Baby cot", "Smoking room"];
export const COUNTRIES = ["Bangladesh", "India", "Nepal", "Bhutan", "Sri Lanka", "Pakistan", "China", "Japan", "Malaysia", "Thailand", "Saudi Arabia", "United Arab Emirates", "United Kingdom", "United States", "Other"];

const KEY = (slug: string) => `bingi-guests-v1-${slug}`;
const base = (): State => ({ v: 1, acts: {}, guests: DEMO_GUESTS.map((g) => ({ ...g, marketing: !!g.email, created: "2026-05-01" })) });
const cache = new Map<string, { raw: string | null; st: State }>();
const listeners = new Set<() => void>();
const BASE = base();
function read(slug: string): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(slug)); } catch {}
  const hit = cache.get(slug);
  if (hit && hit.raw === raw) return hit.st;
  let st = base();
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 1 && Array.isArray(p.guests)) st = p; } catch {}
  cache.set(slug, { raw, st });
  return st;
}
function write(slug: string, st: State) {
  const raw = JSON.stringify(st);
  try { localStorage.setItem(KEY(slug), raw); } catch {}
  cache.set(slug, { raw, st });
  listeners.forEach((l) => l());
}
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** Digits only, Bangladesh numbers without the +880/0 prefix, so 01711-204518 and +8801711204518 match. */
export const phoneKey = (p: string) => { const d = p.replace(/\D/g, ""); return d.startsWith("880") ? d.slice(3) : d.startsWith("0") ? d.slice(1) : d; };
export const validPhone = (p: string, country: string) => {
  const d = p.replace(/\D/g, "");
  return country === "Bangladesh" ? /^(?:880|0)?1[3-9]\d{8}$/.test(d) : d.length >= 8 && d.length <= 15;
};
export const validId = (t: IdType, v: string) => !v || (t === "NID" ? /^(\d{10}|\d{13}|\d{17})$/.test(v) : t === "Passport" ? /^[A-Z0-9]{6,9}$/i.test(v) : /^[A-Z0-9-]{8,16}$/i.test(v));
export const initials = (n: string) => n.split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase();

export type GuestState = "In house" | "Arriving today" | "Upcoming" | "Checked out" | "No stay yet";
export type GuestRow = Guest & { stays: Stay[]; state: GuestState; spent: number; nights: number; last?: string; rating?: number; returning: boolean; idMissing: boolean };

export function useGuests(h: Hotel) {
  const st = useSyncExternalStore(sub, () => read(h.slug), () => BASE);
  const stays = useStays(h);
  const reviews: (Review & ReviewAct)[] = useMemo(() => demoReviews(stays).map((r) => ({ ...r, ...st.acts[r.id] })).sort((a, b) => b.date.localeCompare(a.date)), [stays, st.acts]);
  const rows: GuestRow[] = useMemo(() => st.guests.map((g) => {
    const s = stays.filter((x) => x.guestId === g.id).sort((a, b) => b.from.localeCompare(a.from));
    const cur = s.find((x) => x.status === "Checked in");
    const arr = s.find((x) => x.status === "Confirmed" && x.from === TODAY);
    const up = s.find((x) => x.status === "Confirmed" && x.from > TODAY);
    const rv = reviews.filter((r) => r.guestId === g.id);
    const state: GuestState = cur ? "In house" : arr ? "Arriving today" : up ? "Upcoming" : s.length ? "Checked out" : "No stay yet";
    return {
      ...g, stays: s, state, spent: s.reduce((a, x) => a + (x.total - x.due), 0), nights: s.reduce((a, x) => a + x.nights, 0),
      last: s.find((x) => x.status === "Checked out")?.to, rating: rv.length ? rv.reduce((a, r) => a + r.rating, 0) / rv.length : undefined,
      returning: s.length >= 2, idMissing: !g.idNo,
    };
  }), [st.guests, stays, reviews]);

  const update = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h.slug)); fn(n); write(h.slug, n); }, [h.slug]);
  const saveGuest = useCallback((g: Guest) => update((s) => { const i = s.guests.findIndex((x) => x.id === g.id); if (i >= 0) s.guests[i] = g; else s.guests.unshift(g); }), [update]);
  const nextId = () => `GST-${String(1001 + read(h.slug).guests.length + Math.floor(Math.random() * 900)).padStart(8, "0")}`;
  const findByPhone = (p: string, except?: string) => { const k = phoneKey(p); return k.length >= 8 ? read(h.slug).guests.find((g) => g.id !== except && phoneKey(g.phone) === k) : undefined; };
  const removeGuest = useCallback((id: string) => update((s) => { s.guests = s.guests.filter((g) => g.id !== id); }), [update]);
  const act = useCallback((id: string, fn: (a: ReviewAct) => void) => update((s) => { const a = s.acts[id] ?? {}; fn(a); s.acts[id] = a; }), [update]);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); }, [h.slug]);
  return { rows, stays, reviews, saveGuest, removeGuest, findByPhone, nextId, act, reset };
}

export const bdt = (n: number) => `BDT ${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const dateShort = (iso: string) => `${iso.slice(8, 10)} ${MON[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
export const dm = (iso: string) => `${iso.slice(8, 10)} ${MON[Number(iso.slice(5, 7)) - 1]}`;

/** Guest names by id (includes guests added in Bookings or Guests). */
export function useGuestNames(h: Hotel) {
  const st = useSyncExternalStore(sub, () => read(h.slug), () => BASE);
  return useMemo(() => new Map(st.guests.map((g) => [g.id, g])), [st.guests]);
}
