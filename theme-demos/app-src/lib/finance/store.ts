"use client";
// Finance = the hotel's account with BinGi (live HMS Finance): money guests paid online through BinGi, minus
// BinGi's booking fees, gateway fees and SMS / email cost, minus refunds and payouts → available balance.
// Cash and card taken at the hotel never pass through BinGi, so they are not here (they are in Payments / Cashbox).
// Owns only settlement requests. Everything else is read from Bookings (and Communication for message cost).
// Production: finance_ledger (append-only, written by the payment gateway webhook + billing jobs), settlements.
import { useCallback, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY } from "@/lib/rooms/store";
import { bill, totalOf, type Booking } from "@/lib/bookings/store";
import { PLANS } from "@/lib/onboarding/store";

export type Kind = "collected" | "fee" | "gateway" | "messaging" | "refund" | "payout";
export const KIND_LABEL: Record<Kind, string> = { collected: "Paid online", fee: "BinGi booking fee", gateway: "Gateway fee", messaging: "SMS & email", refund: "Online refund", payout: "Payout to you" };
export type Entry = { id: string; date: string; kind: Kind; ref: string; text: string; amount: number };
export type Settlement = { id: string; at: string; from: string; to: string; amount: number; account: string; note?: string; status: "requested" | "paid" | "cancelled"; paidAt?: string };

/** Demo gateway fee. The real rate comes from the gateway contract (EPS); shown as "demo" in the UI. */
export const GATEWAY_PCT = 1.5;
const fmt = (n: number) => `৳${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
/** Booking fee % by channel for this plan: [marketplace, website, walk-in]. Enterprise = custom (0 here). */
export const feesOf = (h: Hotel): [number, number, number] => (h.plan === "enterprise" ? [0, 0, 0] : PLANS[h.plan].fees);

/** Money that came in through BinGi: website advances (gateway) and marketplace prepayments. */
const online = (b: Booking, p: Booking["payments"][number]) =>
  p.amount > 0 && (p.note?.startsWith("Website advance") || (b.channel === "Marketplace" && (p.method === "bKash" || p.method === "Card") && p.at.slice(0, 10) <= b.from));

export function ledger(h: Hotel, bookings: Booking[], messaging: { date: string; ref: string; text: string; cost: number }[], settlements: Settlement[]): Entry[] {
  const [mkt, web] = feesOf(h);
  const out: Entry[] = [];
  for (const b of bookings) {
    for (const p of b.payments) {
      if (online(b, p)) {
        out.push({ id: `c-${p.id}`, date: p.at.slice(0, 10), kind: "collected", ref: b.code, text: `${b.channel} · ${p.method}`, amount: p.amount });
        out.push({ id: `g-${p.id}`, date: p.at.slice(0, 10), kind: "gateway", ref: b.code, text: `${GATEWAY_PCT}% of ${fmt(p.amount)}`, amount: -Math.round((p.amount * GATEWAY_PCT) / 100 * 100) / 100 });
      }
      if (p.amount < 0 && b.payments.some((x) => online(b, x)) && p.method !== "Cash") out.push({ id: `r-${p.id}`, date: p.at.slice(0, 10), kind: "refund", ref: b.code, text: `Refunded · ${p.method}`, amount: p.amount });
    }
    const pct = b.channel === "Marketplace" ? mkt : b.channel === "Website" ? web : 0;
    if (pct && b.status !== "Cancelled" && b.status !== "No-show") {
      const base = bill(b).total;
      out.push({ id: `f-${b.code}`, date: b.created.slice(0, 10), kind: "fee", ref: b.code, text: `${pct}% ${b.channel.toLowerCase()} fee on ${fmt(base)}`, amount: -Math.round(base * pct) / 100 });
    }
  }
  messaging.forEach((m, i) => out.push({ id: `m-${i}`, date: m.date, kind: "messaging", ref: m.ref, text: m.text, amount: -m.cost }));
  settlements.filter((s) => s.status === "paid").forEach((s) => out.push({ id: `p-${s.id}`, date: (s.paidAt ?? s.at).slice(0, 10), kind: "payout", ref: s.id, text: `Payout to ${s.account}`, amount: -s.amount }));
  return out.filter((e) => e.date <= TODAY).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
export function summary(entries: Entry[], settlements: Settlement[]) {
  const by = (k: Kind) => entries.filter((e) => e.kind === k).reduce((s, e) => s + e.amount, 0);
  const collected = by("collected"), fees = -by("fee"), gateway = -by("gateway"), messaging = -by("messaging"), refunds = -by("refund"), paid = -by("payout");
  const payable = collected - fees - gateway - messaging - refunds;
  const reserved = settlements.filter((s) => s.status === "requested").reduce((s, x) => s + x.amount, 0);
  const available = Math.max(0, Math.round((payable - paid - reserved) * 100) / 100);
  return { collected, fees, gateway, messaging, refunds, payable, paid, reserved, available, owed: payable - paid < 0 ? -(payable - paid) : 0 };
}
export { totalOf };

// ---------- settlements (one record per property) ----------
type State = { v: 1; settlements: Settlement[]; next: number };
const KEY = (slug: string) => `bingi-finance-v1-${slug}`;
const cache = new Map<string, { raw: string | null; st: State }>();
const listeners = new Set<() => void>();
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const EMPTY: State = { v: 1, settlements: [], next: 1 };
function read(slug: string): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(slug)); } catch {}
  const hit = cache.get(slug);
  if (hit && hit.raw === raw) return hit.st;
  let st = EMPTY;
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 1 && Array.isArray(p.settlements)) st = p; } catch {}
  cache.set(slug, { raw, st });
  return st;
}
function write(slug: string, st: State) { const raw = JSON.stringify(st); try { localStorage.setItem(KEY(slug), raw); } catch {} cache.set(slug, { raw, st }); listeners.forEach((l) => l()); }

export function useFinance(h: Hotel) {
  const st = useSyncExternalStore(sub, () => read(h.slug), () => EMPTY);
  const update = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h.slug)); fn(n); write(h.slug, n); }, [h.slug]);
  return {
    st,
    /** Ask BinGi to pay out. The amount is reserved until BinGi (Super Admin) pays or the hotel cancels. */
    request: (r: Omit<Settlement, "id" | "at" | "status">) => update((s) => { s.settlements.unshift({ ...r, id: `SET-${TODAY.slice(0, 4)}-${String(s.next++).padStart(6, "0")}`, at: `${TODAY}T${new Date().toTimeString().slice(0, 5)}`, status: "requested" }); }),
    cancel: (id: string) => update((s) => { const x = s.settlements.find((y) => y.id === id); if (x?.status === "requested") x.status = "cancelled"; }),
    reset: () => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); },
  };
}
