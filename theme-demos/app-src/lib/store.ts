"use client";

// Guest-side state kept in the browser (per hotel): stay cart, demo bookings, demo sign-in.
// In production: cart stays in the browser; bookings + session come from the
// BinGi Marketplace guest account API (see technology/data-contract.md).
import { useSyncExternalStore } from "react";
import type { Extra, Quote, StayDraft } from "./pricing";

export interface Cart {
  stay: StayDraft | null;
  extras: Extra[];
  promo?: string;
}

export type PaymentChoice = "pay-at-property" | "mfs-manual" | "advance" | "card-online";

export interface GuestBooking {
  id: string; // WBK-2026-000123
  createdAt: string;
  stay: StayDraft;
  extras: Extra[];
  quote: Quote;
  guest: { name: string; phone: string; email?: string; arrival?: string; request?: string };
  payment: { method: PaymentChoice; dueNow: number; reference?: string; provider?: string };
  bookingStatus: "pending" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "pay-at-hotel" | "advance-submitted" | "paid";
  /** Set when the hotel accepts it in BinGi HMS Bookings. */
  hmsCode?: string;
}

export interface Session {
  phone: string;
  name?: string;
}

interface State {
  cart: Cart;
  bookings: GuestBooking[];
  session: Session | null;
}

const EMPTY: State = { cart: { stay: null, extras: [] }, bookings: [], session: null };
const listeners = new Set<() => void>();
const cache = new Map<string, State>();

const key = (slug: string) => `bingi-grand:${slug}`;

function read(slug: string): State {
  if (cache.has(slug)) return cache.get(slug)!;
  let s = EMPTY;
  try {
    const raw = localStorage.getItem(key(slug));
    if (raw) s = { ...EMPTY, ...JSON.parse(raw) };
  } catch {}
  cache.set(slug, s);
  return s;
}

function write(slug: string, next: State) {
  cache.set(slug, next);
  try {
    localStorage.setItem(key(slug), JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith("bingi-grand:")) {
      cache.clear();
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useGuestState(slug: string) {
  const state = useSyncExternalStore(subscribe, () => read(slug), () => EMPTY);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const update = (fn: (s: State) => State) => write(slug, fn(read(slug)));
  return {
    ...state,
    ready,
    setStay: (stay: StayDraft) => update((s) => ({ ...s, cart: { ...s.cart, stay } })),
    setPromo: (promo?: string) => update((s) => ({ ...s, cart: { ...s.cart, promo } })),
    clearCart: () => update((s) => ({ ...s, cart: { stay: null, extras: [] } })),
    setExtra: (serviceId: string, qty: number) =>
      update((s) => {
        const extras = s.cart.extras.filter((e) => e.serviceId !== serviceId);
        if (qty > 0) extras.push({ serviceId, qty });
        return { ...s, cart: { ...s.cart, extras } };
      }),
    addBooking: (b: GuestBooking) => update((s) => ({ ...s, bookings: [b, ...s.bookings], cart: { stay: null, extras: [] } })),
    cancelBooking: (id: string) =>
      update((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, bookingStatus: "cancelled" as const } : b)) })),
    /** Hotel side (HMS): accept / decline a website request — the guest sees the new status on their trip page. */
    setStatus: (id: string, bookingStatus: GuestBooking["bookingStatus"], paymentStatus?: GuestBooking["paymentStatus"], hmsCode?: string) =>
      update((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, bookingStatus, paymentStatus: paymentStatus ?? b.paymentStatus, hmsCode: hmsCode ?? b.hmsCode } : b)) })),
    signIn: (session: Session) => update((s) => ({ ...s, session })),
    signOut: () => update((s) => ({ ...s, session: null })),
  };
}

/** Demo booking reference in HMS format. */
export function newBookingId() {
  const n = Math.floor(100000 + Math.random() * 899999);
  return `WBK-${new Date().getFullYear()}-${n}`;
}
