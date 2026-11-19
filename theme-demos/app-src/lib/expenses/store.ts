"use client";
// Expenses (sidebar "Expenses", route /hms/operations — same place as the live HMS Operations).
// Owns: expenses, payees, categories, approval rule, activity. Reads (never copies):
//   • supplier bills = Inventory goods-received notes (GRN × PO line cost); paying one creates an expense linked to it
//   • petty cash = Cashbox cash-out "Petty cash expense" entries
//   • payroll = Staff › Payroll runs (cost line only — paid in Staff)
// Cash payments post to the main Cashbox as "Expense paid". Production: expenses, expense_payments, payees,
// expense_categories, expense_audit; bills view over inventory_grns.
import { useCallback, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";
import { TODAY } from "@/lib/rooms/store";

export type Method = "Cash" | "bKash" | "Card" | "Bank";
export const METHODS: Method[] = ["Cash", "Bank", "bKash", "Card"];
export type Status = "pending" | "approved" | "rejected";
export type ExPay = { id: string; at: string; amount: number; method: Method; by: string; ref?: string };
export type Expense = {
  id: string; title: string; date: string; category: string; payee?: string; amount: number; note?: string; billNo?: string;
  status: Status; by: string; at: string; approvedBy?: string; rejectReason?: string; payments: ExPay[];
  /** Supplier bill this expense pays (Inventory GRN id). */
  grn?: string;
};
export type PayeeKind = "Supplier" | "Utility" | "Contractor" | "Staff" | "Other";
export type Payee = { id: string; name: string; kind: PayeeKind; phone: string; note?: string; archived?: boolean };
export type Category = { id: string; name: string; archived?: boolean };
export type Log = { at: string; by: string; text: string; ref?: string };
type State = { v: 1; expenses: Expense[]; payees: Payee[]; categories: Category[]; limit: number; log: Log[]; next: number };

export const ME = "Md Yeapas";
export const DEFAULT_LIMIT = 5000;
export const STATUS_LABEL = { pending: "Waiting approval", approved: "Approved", rejected: "Rejected" } as const;
export const paidOf = (e: Expense) => e.payments.reduce((s, p) => s + p.amount, 0);
export const dueOf = (e: Expense) => (e.status === "approved" ? Math.max(0, e.amount - paidOf(e)) : 0);
export type PayState = "Waiting approval" | "Rejected" | "To pay" | "Partly paid" | "Paid";
export const payState = (e: Expense): PayState => e.status === "pending" ? "Waiting approval" : e.status === "rejected" ? "Rejected" : paidOf(e) <= 0 ? "To pay" : paidOf(e) >= e.amount ? "Paid" : "Partly paid";

const CATS = ["Utilities", "Repairs & maintenance", "Supplies", "Food & beverage purchase", "Laundry", "Transport", "Staff food & welfare", "Marketing", "Rent", "Bank & fees", "Other"];
const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

function seed(h: Hotel): State {
  const categories = CATS.map((name, i) => ({ id: `c${i + 1}`, name }));
  const c = (n: string) => categories.find((x) => x.name === n)!.id;
  const payees: Payee[] = [
    { id: "p1", name: "DESCO / Palli Bidyut", kind: "Utility", phone: "16116" },
    { id: "p2", name: "Titas Gas", kind: "Utility", phone: "16496" },
    { id: "p3", name: "Karim Electric Works", kind: "Contractor", phone: "01711-334455" },
    { id: "p4", name: "Shapla Laundry", kind: "Supplier", phone: "01819-220011" },
    { id: "p5", name: "Link3 Internet", kind: "Utility", phone: "09610-000999" },
  ];
  const big = h.plan === "ultra" || h.plan === "enterprise" ? 1.6 : h.plan === "business" ? 1 : 0.5;
  const amt = (n: number) => Math.round((n * big) / 10) * 10;
  let n = 1001;
  const E = (d: number, title: string, cat: string, payee: string | undefined, a: number, st: Status, paid: [number, Method][] = [], extra: Partial<Expense> = {}): Expense => {
    const date = addDays(TODAY, -d);
    return { id: `EX-${n++}`, title, date, category: c(cat), payee, amount: a, status: st, by: d % 2 ? "Nusrat Karim" : ME, at: `${date}T10:${10 + (d % 40)}`,
      approvedBy: st !== "pending" && a > DEFAULT_LIMIT ? "Tanvir Ahmed" : undefined,
      payments: paid.map(([x, m], i) => ({ id: `ep${n}-${i}`, at: `${date}T15:${10 + i}`, amount: x, method: m, by: ME })), ...extra };
  };
  const expenses: Expense[] = [
    E(25, "Electricity bill — October", "Utilities", "p1", amt(38500), "approved", [[amt(38500), "Bank"]], { billNo: "DESCO-10-2026" }),
    E(22, "Gas bill — October", "Utilities", "p2", amt(6200), "approved", [[amt(6200), "bKash"]]),
    E(18, "Generator servicing", "Repairs & maintenance", "p3", amt(12500), "approved", [[amt(12500), "Cash"]]),
    E(12, "Facebook ads — November", "Marketing", undefined, amt(8000), "approved", [[amt(8000), "Card"]]),
    E(9, "Laundry — linen (week 1)", "Laundry", "p4", amt(9400), "approved", [[amt(5000), "Cash"]]),
    E(6, "Internet — November", "Utilities", "p5", amt(4500), "approved", [[amt(4500), "bKash"]]),
    E(4, "AC repair, room 204", "Repairs & maintenance", "p3", amt(7800), "approved", []),
    E(2, "Laundry — linen (week 2)", "Laundry", "p4", amt(9100), "pending"),
    E(1, "Lobby flowers", "Supplies", undefined, 1800, "approved", [[1800, "Cash"]]),
    E(0, "Water pump motor", "Repairs & maintenance", "p3", amt(16500), "pending", [], { note: "Old motor burnt; quote attached" }),
  ];
  const log: Log[] = expenses.slice().reverse().map((e) => ({ at: e.at, by: e.by, text: `Added ${e.title}`, ref: e.id }));
  return { v: 1, expenses, payees, categories, limit: DEFAULT_LIMIT, log, next: n };
}

const KEY = (slug: string) => `bingi-expenses-v1-${slug}`;
const cache = new Map<string, { raw: string | null; st: State }>();
const seeds = new Map<string, State>();
const listeners = new Set<() => void>();
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const EMPTY: State = { v: 1, expenses: [], payees: [], categories: [], limit: DEFAULT_LIMIT, log: [], next: 1 };
function read(h: Hotel): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(h.slug)); } catch {}
  const hit = cache.get(h.slug);
  if (hit && hit.raw === raw) return hit.st;
  if (!seeds.has(h.slug)) seeds.set(h.slug, seed(h));
  let st = seeds.get(h.slug)!;
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 1 && Array.isArray(p.expenses)) st = p; } catch {}
  cache.set(h.slug, { raw, st });
  return st;
}
function write(slug: string, st: State) { const raw = JSON.stringify(st); try { localStorage.setItem(KEY(slug), raw); } catch {} cache.set(slug, { raw, st }); listeners.forEach((l) => l()); }
const now = () => `${TODAY}T${new Date().toTimeString().slice(0, 5)}`;

export type NewExpense = Omit<Expense, "id" | "status" | "by" | "at" | "payments" | "approvedBy" | "rejectReason">;
export function useExpenses(h: Hotel) {
  const st = useSyncExternalStore(sub, () => read(h), () => EMPTY);
  const update = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h)); fn(n); write(h.slug, n); }, [h]);
  const log = (s: State, text: string, ref?: string) => s.log.unshift({ at: now(), by: ME, text, ref });
  return {
    st,
    /** Up to the limit an expense is approved at once; above it, a manager approves first. Returns the new id. */
    add: (x: NewExpense, preApproved = false) => { let id = ""; update((s) => { id = `EX-${s.next++}`; const auto = preApproved || x.amount <= s.limit; s.expenses.unshift({ ...x, id, status: auto ? "approved" : "pending", by: ME, at: now(), payments: [] }); log(s, `Added ${x.title}${auto ? "" : " · waiting approval"}`, id); }); return id; },
    edit: (id: string, x: NewExpense) => update((s) => { const e = s.expenses.find((y) => y.id === id); if (!e || e.payments.length) return; const again = e.status === "approved" && x.amount > s.limit && x.amount !== e.amount; Object.assign(e, x); if (again) { e.status = "pending"; e.approvedBy = undefined; } log(s, `Edited ${e.title}${again ? " · needs approval again" : ""}`, id); }),
    approve: (id: string) => update((s) => { const e = s.expenses.find((y) => y.id === id); if (!e || e.status !== "pending") return; e.status = "approved"; e.approvedBy = ME; log(s, `Approved ${e.title}`, id); }),
    reject: (id: string, why: string) => update((s) => { const e = s.expenses.find((y) => y.id === id); if (!e || e.status !== "pending") return; e.status = "rejected"; e.rejectReason = why; log(s, `Rejected ${e.title} · ${why}`, id); }),
    pay: (id: string, amount: number, method: Method, ref?: string) => update((s) => { const e = s.expenses.find((y) => y.id === id); if (!e || e.status !== "approved") return; e.payments.push({ id: `ep${Date.now().toString(36)}`, at: now(), amount, method, by: ME, ref }); log(s, `Paid ${amount} · ${method} · ${e.title}`, id); }),
    savePayee: (p: Payee) => update((s) => { const i = s.payees.findIndex((x) => x.id === p.id); if (i >= 0) s.payees[i] = p; else s.payees.push(p); log(s, `${i >= 0 ? "Updated" : "Added"} payee ${p.name}`); }),
    saveCategory: (c: Category) => update((s) => { const i = s.categories.findIndex((x) => x.id === c.id); if (i >= 0) s.categories[i] = c; else s.categories.push(c); log(s, `${i >= 0 ? (c.archived ? "Archived" : "Updated") : "Added"} category ${c.name}`); }),
    setLimit: (n: number) => update((s) => { s.limit = n; log(s, `Approval limit set to ${n}`); }),
    uid: (p: string) => `${p}${Date.now().toString(36)}`,
    reset: () => { try { localStorage.removeItem(KEY(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); },
  };
}
export type Ex = ReturnType<typeof useExpenses>;
