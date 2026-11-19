"use client";
// Communication Center (live HMS): SMS / email credits, credit purchases, message history and delivery.
// Owns: purchases and the message log. Credits left = bought − used (never stored twice).
// Rules (which event sends what) live in Settings data (messages.rules) and the texts in Bookings settings;
// Communication Center is the one screen that edits them (D1). Credit packs are paid from the hotel's BinGi
// balance, so their cost shows in Finance as "SMS & email".
// Prototype: nothing is really sent — every row is a demo record. Production: message_log, credit_purchases.
import { useCallback, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY } from "@/lib/rooms/store";

export type Channel = "sms" | "email";
export type MsgStatus = "delivered" | "sent" | "failed";
export type Msg = { id: string; at: string; channel: Channel; to: string; guest: string; booking?: string; event: string; text: string; status: MsgStatus; parts: number; error?: string; manual?: boolean };
export type Purchase = { id: string; at: string; channel: Channel; qty: number; price: number; paidFrom: "balance" };
/** Demo prices — the real price list comes from BinGi (Super Admin). Shown as "demo" in the UI. */
export const PACKS: Record<Channel, { qty: number; price: number }[]> = {
  sms: [{ qty: 100, price: 45 }, { qty: 500, price: 210 }, { qty: 1000, price: 400 }],
  email: [{ qty: 1000, price: 20 }, { qty: 5000, price: 90 }],
};
export const CH_LABEL: Record<Channel, string> = { sms: "SMS", email: "Email" };
/** Monthly credits included with the plan (as on the live HMS) and cost per message part (from the live usage page). Demo values. */
export const PLAN_CREDITS: Record<Channel, number> = { email: 1000, sms: 100 };
export const RATE: Record<Channel, number> = { email: 0.16, sms: 0.5 };
export type Policy = { profile: "default" | "safe" | "cost" | "priority"; emailFirst: boolean; smsFallback: boolean; smsConsent: boolean; delay: number; retries: number; sender: string };
export const PROFILES: Record<Policy["profile"], [string, string, Partial<Policy>]> = {
  default: ["Default", "Balanced delivery and cost", { emailFirst: true, smsFallback: true, delay: 10, retries: 2 }],
  safe: ["Safe", "More retries and a quick SMS fallback", { emailFirst: true, smsFallback: true, delay: 5, retries: 4 }],
  cost: ["Cost-aware", "Email only; SMS only when there is no email", { emailFirst: true, smsFallback: false, delay: 30, retries: 1 }],
  priority: ["High priority", "Email and SMS together, no waiting", { emailFirst: false, smsFallback: true, delay: 0, retries: 3 }],
};
export const DEFAULT_POLICY: Policy = { profile: "default", emailFirst: true, smsFallback: true, smsConsent: false, delay: 10, retries: 2, sender: "" };
/** Message texts for events other than confirmation and pre-arrival (those live in Bookings settings). */
export const DEFAULT_TEMPLATES: Record<string, string> = {
  pending: "Dear {guest}, we got your request {code} for {from} – {to}. We will confirm soon. {hotel}",
  modified: "Dear {guest}, your booking {code} is now {from} – {to}. {hotel}",
  cancel: "Dear {guest}, booking {code} is cancelled. {hotel}",
  roomready: "Dear {guest}, your room {room} is ready. Welcome to {hotel}!",
  welcome: "Welcome to {hotel}, {guest}. Call the front desk any time.",
  checkout: "Thank you for staying with us, {guest}. We would love a review: {link}",
  payment: "Dear {guest}, we received {paid} for booking {code}. Thank you. {hotel}",
  refund: "Dear {guest}, a refund for booking {code} has been made. {hotel}",
  order: "Dear {guest}, we got your order. We will bring it soon. {hotel}",
  service: "Dear {guest}, your service is confirmed. {hotel}",
  newweb: "New website request {code} from {guest} for {from} – {to}.",
  newchat: "New chat message from {guest} on booking {code}.",
  lowstock: "Low stock alert at {hotel}.",
};
/** One SMS part = 160 Latin characters, or 70 when the text has Bangla (Unicode). */
export const smsParts = (t: string) => { const uni = /[^\u0000-\u007f]/.test(t); const per = uni ? 70 : 160; return Math.max(1, Math.ceil(t.length / per)); };

export type Ref = { code: string; guest: string; phone: string; email: string; created: string; from: string; status: string };
type State = { v: 1; purchases: Purchase[]; log: Msg[]; next: number; policy?: Policy; templates?: Record<string, string> };

function seed(refs: Ref[]): State {
  const purchases: Purchase[] = [];
  const log: Msg[] = [];
  let n = 1;
  refs.filter((r) => r.created.slice(0, 10) >= addDays(TODAY, -20)).forEach((r, i) => {
    const at = r.created.length > 10 ? r.created : `${r.created}T11:20`;
    if (r.email) log.push({ id: `MSG-${n++}`, at, channel: "email", to: r.email, guest: r.guest, booking: r.code, event: "Booking confirmed", text: `Booking ${r.code} confirmed`, status: "delivered", parts: 1 });
    if (r.phone) log.push({ id: `MSG-${n++}`, at, channel: "sms", to: r.phone, guest: r.guest, booking: r.code, event: "Booking confirmed", text: `Dear ${r.guest}, your booking ${r.code} is confirmed.`, status: i % 9 === 4 ? "failed" : "delivered", parts: 1, error: i % 9 === 4 ? "Number not reachable" : undefined });
    if (r.status === "Checked out" && r.email) log.push({ id: `MSG-${n++}`, at: `${r.from}T12:00`, channel: "email", to: r.email, guest: r.guest, booking: r.code, event: "After check-out", text: "Thank you for staying with us", status: "delivered", parts: 1 });
  });
  return { v: 1, purchases, log: log.sort((a, b) => b.at.localeCompare(a.at)), next: n };
}
function addDays(iso: string, k: number) { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + k); return d.toISOString().slice(0, 10); }

const KEY = (slug: string) => `bingi-comm-v1-${slug}`;
const cache = new Map<string, { raw: string | null; sig: string; st: State }>();
const seeds = new Map<string, State>();
const listeners = new Set<() => void>();
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const EMPTY: State = { v: 1, purchases: [], log: [], next: 1 };
function read(h: Hotel, refs: Ref[]): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(h.slug)); } catch {}
  const sig = `${h.slug}|${refs.length}`;
  const hit = cache.get(h.slug);
  if (hit && hit.raw === raw && (raw || hit.sig === sig)) return hit.st;
  const sk = `${h.slug}|${refs.map((r) => r.code).join(",")}`;
  if (!seeds.has(sk)) seeds.set(sk, seed(refs));
  let st = seeds.get(sk)!;
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 1 && Array.isArray(p.log)) st = p; } catch {}
  cache.set(h.slug, { raw, sig, st });
  return st;
}
function write(slug: string, st: State) { const raw = JSON.stringify(st); try { localStorage.setItem(KEY(slug), raw); } catch {} cache.set(slug, { raw, sig: cache.get(slug)?.sig ?? "", st }); listeners.forEach((l) => l()); }
const stamp = () => `${TODAY}T${new Date().toTimeString().slice(0, 5)}`;

/** Credits: the plan's monthly allowance is used first, then bought credits (bought credits never expire). */
export function credits(st: State, month = TODAY.slice(0, 7)) {
  const c = (ch: Channel) => {
    const used = (m?: string) => st.log.filter((x) => x.channel === ch && x.status !== "failed" && (!m || x.at.startsWith(m))).reduce((s, x) => s + x.parts, 0);
    const months = [...new Set(st.log.filter((x) => x.channel === ch).map((x) => x.at.slice(0, 7)))];
    const bought = st.purchases.filter((p) => p.channel === ch).reduce((s, p) => s + p.qty, 0);
    const overflow = months.reduce((s, m) => s + Math.max(0, used(m) - PLAN_CREDITS[ch]), 0);
    const thisMonth = used(month);
    const planLeft = Math.max(0, PLAN_CREDITS[ch] - thisMonth);
    const boughtLeft = Math.max(0, bought - overflow);
    return { plan: PLAN_CREDITS[ch], planLeft, bought, boughtLeft, left: planLeft + boughtLeft, usedMonth: thisMonth, costMonth: Math.round(thisMonth * RATE[ch] * 100) / 100 };
  };
  return { sms: c("sms"), email: c("email") };
}
/** For Finance ("SMS & email"): message cost per month + credit packs bought from the BinGi balance. */
export const messagingCost = (st: State) => {
  const months = [...new Set(st.log.map((m) => m.at.slice(0, 7)))].sort();
  return [
    ...months.map((m) => { const xs = st.log.filter((x) => x.at.startsWith(m) && x.status !== "failed"); const cost = xs.reduce((s, x) => s + x.parts * RATE[x.channel], 0); return { date: m === TODAY.slice(0, 7) ? TODAY : `${m}-28`, ref: m, text: `${xs.length} messages sent`, cost: Math.round(cost * 100) / 100 }; }).filter((x) => x.cost > 0),
    ...st.purchases.map((p) => ({ date: p.at.slice(0, 10), ref: p.id, text: `${p.qty} ${CH_LABEL[p.channel]} credits`, cost: p.price })),
  ];
};
export function useComm(h: Hotel, refs: Ref[]) {
  const st = useSyncExternalStore(sub, () => read(h, refs), () => EMPTY);
  const update = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h, refs)); fn(n); write(h.slug, n); }, [h, refs]);
  const c = credits(st);
  return {
    st, credits: c, policy: st.policy ?? DEFAULT_POLICY, templates: { ...DEFAULT_TEMPLATES, ...st.templates },
    savePolicy: (p: Policy) => update((s) => { s.policy = p; }),
    saveTemplate: (id: string, text: string) => update((s) => { s.templates = { ...s.templates, [id]: text }; }),
    buy: (channel: Channel, qty: number, price: number) => update((s) => { s.purchases.unshift({ id: `CR-${1000 + s.purchases.length + 1}`, at: stamp(), channel, qty, price, paidFrom: "balance" }); }),
    /** Send now (prototype: recorded only). Returns an error, or "". */
    send: (m: Omit<Msg, "id" | "at" | "status" | "parts">): string => {
      const parts = m.channel === "sms" ? smsParts(m.text) : 1;
      const left = credits(read(h, refs))[m.channel].left;
      if (parts > left) return `Not enough ${CH_LABEL[m.channel]} credits (${left} left) — buy more first`;
      if (m.channel === "sms" && !/^\+?[\d\s-]{8,}$/.test(m.to)) return "Check the phone number";
      if (m.channel === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.to)) return "Check the email address";
      update((s) => { s.log.unshift({ ...m, id: `MSG-${s.next++}`, at: stamp(), status: "sent", parts, manual: true }); });
      return "";
    },
    retry: (id: string): string => {
      const s0 = read(h, refs); const m = s0.log.find((x) => x.id === id);
      if (!m || m.status !== "failed") return "";
      if (credits(s0)[m.channel].left < m.parts) return `Not enough ${CH_LABEL[m.channel]} credits`;
      update((s) => { const x = s.log.find((y) => y.id === id)!; x.status = "sent"; x.error = undefined; x.at = stamp(); });
      return "";
    },
    reset: () => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); },
  };
}
export type Comm = ReturnType<typeof useComm>;
