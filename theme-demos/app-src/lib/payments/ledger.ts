// Payments — one read-only ledger of guest money. Nothing is stored here: every row is read from the module that
// owns it (Bookings payments, Restaurant & Bar paid bills, Other Services cash sales / refunds), so money is never
// counted twice. Room-charged restaurant bills and booking-charged services are paid on the booking bill, so they
// appear once — as the booking payment. Production: a `payments` view over bookings_payments, fb_payments, svc_payments.
import type { Booking, PayMethod as BkMethod } from "@/lib/bookings/store";
import { dueOf, payState, paidOf, totalOf } from "@/lib/bookings/store";
import { bill, type Order as MealOrder } from "@/lib/meals/seed";
import { orderTotal, type Order as SvcOrder } from "@/lib/services/store";

export type Source = "booking" | "restaurant" | "service";
export type Method = "Cash" | "bKash" | "Card" | "Bank";
export type Row = {
  id: string; at: string; source: Source; kind: "payment" | "refund" | "deposit";
  ref: string; booking?: string; guest: string; amount: number; method: Method;
  /** Gateway / transaction reference, when the money came through one (e.g. website advance via MFS). */
  gateway?: string; by: string; note?: string;
};
export const SOURCE_LABEL: Record<Source, string> = { booking: "Room booking", restaurant: "Restaurant & Bar", service: "Other services" };
export const METHODS: Method[] = ["Cash", "bKash", "Card", "Bank"];
const fromMeal: Record<string, Method> = { cash: "Cash", card: "Card", bkash: "bKash" };

export function ledger(o: {
  bookings: Booking[]; guestName: (id: string) => string;
  meals?: MealOrder[]; services?: SvcOrder[]; serviceName?: (id: string) => string;
}): Row[] {
  const rows: Row[] = [];
  for (const b of o.bookings) {
    const guest = o.guestName(b.guestId);
    for (const p of b.payments) {
      const web = p.note?.startsWith("Website advance");
      rows.push({
        id: `b-${b.code}-${p.id}`, at: p.at, source: "booking", kind: p.amount < 0 ? "refund" : "payment", ref: b.code, booking: b.code, guest,
        amount: p.amount, method: p.method as Method, by: p.by, note: p.note, gateway: web ? p.note!.replace(/^Website advance · ?/, "Website · ") : undefined,
      });
    }
    if (b.deposit) {
      rows.push({ id: `d-${b.code}`, at: b.deposit.at, source: "booking", kind: "deposit", ref: b.code, booking: b.code, guest, amount: b.deposit.amount, method: b.deposit.method as BkMethod as Method, by: "Front desk", note: "Security deposit held" });
      const s = b.deposit.settled;
      if (s?.returned) rows.push({ id: `dr-${b.code}`, at: s.at, source: "booking", kind: "deposit", ref: b.code, booking: b.code, guest, amount: -s.returned, method: b.deposit.method as Method, by: "Front desk", note: "Deposit returned" });
    }
  }
  for (const m of o.meals ?? []) {
    if (m.pay !== "paid" || m.status === "cancelled" || m.status === "declined") continue;
    const total = bill(m).total;
    const parts = m.payments?.length ? m.payments.filter((x) => x.method !== "room") : [{ method: m.method as "cash" | "card" | "bkash", amount: total }];
    parts.forEach((x, i) => rows.push({
      id: `r-${m.id}-${i}`, at: m.paidAt ?? m.at, source: "restaurant", kind: "payment", ref: m.no, booking: undefined,
      guest: m.guest ?? (m.room ? `Room ${m.room}` : "Walk-in guest"), amount: x.amount, method: fromMeal[x.method] ?? "Cash", by: m.by, note: m.outlet,
    }));
  }
  for (const s of o.services ?? []) {
    const name = s.booking?.guest ?? s.walkIn?.name ?? "Walk-in guest";
    const label = o.serviceName?.(s.service) ?? "Service";
    if (s.method === "cash" && !s.cancelled && (s.payment === "Paid" || s.payment === "Refunded"))
      rows.push({ id: `s-${s.id}`, at: s.created, source: "service", kind: "payment", ref: s.id, guest: name, amount: orderTotal(s), method: "Cash", by: "Front desk", note: label });
    if (s.refund && s.refund.method !== "Booking bill")
      rows.push({ id: `sr-${s.id}`, at: s.refund.at, source: "service", kind: "refund", ref: s.id, booking: s.booking?.code, guest: name, amount: -s.refund.amount, method: s.refund.method, by: "Front desk", note: label });
  }
  return rows.sort((a, b) => b.at.localeCompare(a.at));
}

/** Money in/out for a list of rows. Deposits are held for the guest — not revenue — so they are kept apart. */
export function sums(rows: Row[]) {
  const pay = rows.filter((r) => r.kind === "payment"), ref = rows.filter((r) => r.kind === "refund");
  const collected = pay.reduce((s, r) => s + r.amount, 0), refunded = ref.reduce((s, r) => s - r.amount, 0);
  const byMethod = Object.fromEntries(METHODS.map((m) => [m, rows.filter((r) => r.kind !== "deposit" && r.method === m).reduce((s, r) => s + r.amount, 0)])) as Record<Method, number>;
  return { collected, refunded, net: collected - refunded, count: pay.length, avg: pay.length ? Math.round(collected / pay.length) : 0, byMethod };
}

/** Bookings that still owe money, most urgent first: leaving today → in house → arriving → already left. */
export function toCollect(bookings: Booking[], today: string) {
  const rank = (b: Booking) => (b.status === "Checked in" && b.to <= today ? 0 : b.status === "Checked out" ? 1 : b.status === "Checked in" ? 2 : b.from <= today ? 3 : 4);
  return bookings.filter((b) => ["Confirmed", "Checked in", "Checked out"].includes(b.status) && dueOf(b) > 0)
    .sort((a, b) => rank(a) - rank(b) || a.from.localeCompare(b.from))
    .map((b) => ({ b, due: dueOf(b), total: totalOf(b), paid: paidOf(b), rank: rank(b) }));
}
export const URGENCY = ["Leaving today", "Left with balance", "In house", "Arriving today", "Upcoming"];
/** Bookings where the guest paid more than the bill (cancellations, early check-out): money to give back. */
export const refundsDue = (bookings: Booking[]) => bookings.filter((b) => payState(b) === "Refund due").map((b) => ({ b, amount: paidOf(b) - totalOf(b) }));
