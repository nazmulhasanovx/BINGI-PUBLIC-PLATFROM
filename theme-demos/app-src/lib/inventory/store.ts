"use client";
import { can } from "@/lib/plan";
// Inventory for one property (prototype: localStorage per property).
// v1 = Nazmul's 20 desktop screens (10 Nov 2026). v2 (11 Nov) adds what a large hotel needs:
//   stores/outlets + transfers · purchase orders → approval → receive (partial GRN) · stock count sessions ·
//   unit conversion (buy in cartons, use pieces) · weighted-average cost · recipes → consumption from sales ·
//   cost-of-goods posting for Accounts · roles + approvals.
// Rule (unchanged): on-hand quantity changes ONLY through movements — every change is in History.
// Production: inventory_items, item_stock(store), stores, suppliers, categories, stock_movements (append-only),
// purchase_orders(+lines, grns), stock_counts(+lines), recipes(+lines), sales_consumption, cogs_postings, approvals.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Hotel } from "@/lib/types";

export const UNITS = [["pcs", "Piece (pcs)"], ["kg", "Kilogram (kg)"], ["L", "Litre (L)"], ["box", "Box"], ["pack", "Pack"], ["bottle", "Bottle"], ["roll", "Roll"], ["set", "Set"]] as const;
export const BUY_UNITS = ["carton", "case", "box", "pack", "sack", "crate", "dozen", "bundle"] as const;
export type Unit = (typeof UNITS)[number][0];
export type StoreKind = "main" | "kitchen" | "bar" | "housekeeping" | "other";
export type Location = { id: string; name: string; kind: StoreKind };
export type Item = {
  id: string; name: string; sku: string; unit: Unit; category: string; supplier: string; reorder: number; cost: number;
  /** Total on hand across stores (kept equal to the sum of `stock`). */
  qty: number;
  /** On hand per store id. */
  stock: Record<string, number>;
  /** Unit conversion: bought in `buyUnit`, 1 buyUnit = `perBuy` × unit. */
  buyUnit?: string; perBuy?: number;
  /** Order up to this total when reordering (par level). */
  par?: number;
  archived?: boolean;
  /** Optional photo so staff recognise the item (data URL). */
  photo?: string;
};
export type Category = { id: string; name: string };
export type Supplier = { id: string; name: string; contact: string; phone: string; email: string; address: string };
export type MoveType = "opening" | "receive" | "issue" | "wastage" | "adjust" | "transfer" | "consume";
export type Move = { id: string; at: string; item: string; store: string; type: MoveType; change: number; balance: number; ref: string; note: string; supplier?: string; cost?: number; by: string; value?: number };
export type PoStatus = "draft" | "pending" | "approved" | "partial" | "received" | "cancelled";
export type PoLine = { item: string; qty: number; cost: number; received: number };
export type Grn = { id: string; at: string; invoice: string; by: string; lines: { item: string; qty: number }[] };
export type Po = { id: string; supplier: string; store: string; date: string; expected: string; status: PoStatus; lines: PoLine[]; note: string; by: string; approvedBy?: string; grns: Grn[] };
export type CountLine = { item: string; system: number; counted: number | null };
export type Count = { id: string; store: string; at: string; status: "open" | "review" | "posted"; lines: CountLine[]; by: string; postedBy?: string; note: string };
export type Recipe = { id: string; name: string; store: string; price: number; lines: { item: string; qty: number }[] };
export type Sale = { id: string; at: string; recipe: string; qty: number; by: string };
export type Posting = { id: string; at: string; from: string; to: string; by: string; total: number; lines: { category: string; amount: number }[] };
export type Role = "keeper" | "manager" | "owner";
export type Approval = { id: string; at: string; kind: "wastage" | "adjust"; item: string; store: string; amount: number; value: number; note: string; ref: string; by: string; status: "pending" | "approved" | "rejected"; decidedBy?: string };
export type Settings = { role: Role; approveAbove: number; poNeedsApproval: boolean };
type State = { v: 2; items: Item[]; categories: Category[]; suppliers: Supplier[]; moves: Move[]; stores: Location[]; pos: Po[]; counts: Count[]; recipes: Recipe[]; sales: Sale[]; postings: Posting[]; approvals: Approval[]; settings: Settings };

export const MOVE_LABEL: Record<MoveType, string> = { opening: "Opening Stock", receive: "Receive Stock", issue: "Issue Stock", wastage: "Wastage", adjust: "Adjustment", transfer: "Transfer", consume: "Used in sales" };
export const ROLE_LABEL: Record<Role, string> = { keeper: "Store keeper", manager: "Manager", owner: "Owner" };
export const PO_LABEL: Record<PoStatus, string> = { draft: "Draft", pending: "Waiting approval", approved: "Approved", partial: "Partly received", received: "Received", cancelled: "Cancelled" };
export const KIND_LABEL: Record<StoreKind, string> = { main: "Main store", kitchen: "Kitchen", bar: "Bar", housekeeping: "Housekeeping", other: "Other" };
export const USERS: Record<Role, string> = { keeper: "Rafiq (Store keeper)", manager: "Md Yeapas", owner: "Nazmul Hasan" };
export const USER = "Md Yeapas";
export const TODAY = "2026-11-10";
export const MAIN = "main";
/** What each role may do. Production: enforced on the server with role + property permissions. */
export const CAN = {
  approve: (r: Role) => r !== "keeper",
  settings: (r: Role) => r === "owner" || r === "manager",
  postCount: (r: Role) => r !== "keeper",
  cancelPo: (r: Role) => r !== "keeper",
};

const C = (id: string, name: string): Category => ({ id, name });
const S = (id: string, name: string, phone = ""): Supplier => ({ id, name, contact: "", phone, email: "", address: "" });
function seed(): State {
  const I = (id: string, name: string, sku: string, unit: Unit, category: string, supplier: string, reorder: number, cost: number, stock: Record<string, number>, extra: Partial<Item> = {}): Item =>
    ({ id, name, sku, unit, category, supplier, reorder, cost, stock, qty: Object.values(stock).reduce((a, b) => a + b, 0), ...extra });
  const items: Item[] = [
    I("i1", "Guest Soap", "HK-001", "pcs", "c1", "s1", 20, 18, { main: 50, hk: 12 }, { buyUnit: "carton", perBuy: 48, par: 144 }),
    I("i2", "Bath Towels", "LN-004", "pcs", "c2", "s2", 20, 420, { main: 36, hk: 12 }, { buyUnit: "bundle", perBuy: 12, par: 72 }),
    I("i3", "Drinking Water 500 ml", "FB-002", "pcs", "c3", "s3", 48, 14, { main: 72, kitchen: 12, bar: 12 }, { buyUnit: "case", perBuy: 24, par: 192 }),
    I("i4", "Coffee Beans", "FB-008", "kg", "c3", "s3", 3, 1100, { main: 6, kitchen: 2 }, { par: 10 }),
    I("i5", "Facial Tissue Box", "HK-003", "pcs", "c1", "s1", 12, 65, { main: 8 }, { buyUnit: "carton", perBuy: 24, par: 48 }),
    I("i6", "Floor Cleaner", "CL-006", "L", "c4", "s1", 5, 160, { main: 4 }, { buyUnit: "case", perBuy: 4, par: 16 }),
    I("i7", "Paper Cups", "FB-012", "pcs", "c3", "s3", 20, 4, { main: 20, bar: 10 }, { buyUnit: "pack", perBuy: 50, par: 200 }),
    I("i8", "Laundry Detergent", "LN-009", "kg", "c2", "s2", 5, 140, { main: 0 }, { buyUnit: "sack", perBuy: 25, par: 25 }),
    I("i9", "Basmati Rice", "FB-020", "kg", "c3", "s3", 25, 135, { main: 40, kitchen: 10 }, { buyUnit: "sack", perBuy: 25, par: 100 }),
    I("i10", "Chicken", "FB-021", "kg", "c3", "s3", 10, 290, { kitchen: 14 }, { par: 30 }),
    I("i11", "Cooking Oil", "FB-022", "L", "c3", "s3", 10, 185, { main: 15, kitchen: 5 }, { buyUnit: "carton", perBuy: 5, par: 40 }),
    I("i12", "Lemon Juice", "FB-030", "L", "c3", "s3", 2, 220, { bar: 1.5 }, { par: 6 }),
    I("i13", "Toilet Rolls", "HK-007", "roll", "c1", "s1", 40, 22, { main: 30, hk: 6 }, { buyUnit: "bundle", perBuy: 10, par: 120 }),
  ];
  const m = (id: string, time: string, item: string, store: string, type: MoveType, change: number, balance: number, ref: string, note: string): Move => ({ id, at: `${TODAY}T${time}`, item, store, type, change, balance, ref, note, by: USER });
  return {
    v: 2, items,
    stores: [{ id: MAIN, name: "Main Store", kind: "main" }, { id: "kitchen", name: "Kitchen", kind: "kitchen" }, { id: "bar", name: "Lobby Bar", kind: "bar" }, { id: "hk", name: "Housekeeping Store", kind: "housekeeping" }],
    categories: [C("c1", "Guest Amenities"), C("c2", "Linen & Laundry"), C("c3", "Food & Beverage"), C("c4", "Cleaning Supplies")],
    suppliers: [S("s1", "Coastline Supplies", "01711-200300"), S("s2", "Harbor Linen Co.", "01819-445566"), S("s3", "Bay Food Traders", "01912-778899")],
    moves: [
      m("m7", "16:10", "i1", "hk", "transfer", 12, 12, "TR-1001", "From Main Store"),
      m("m8", "16:10", "i1", MAIN, "transfer", -12, 50, "TR-1001", "To Housekeeping Store"),
      m("m6", "15:40", "i1", MAIN, "issue", -8, 62, "", "Housekeeping use"),
      m("m5", "14:55", "i7", MAIN, "wastage", -5, 20, "", "Damaged packaging"),
      m("m4", "13:20", "i4", MAIN, "adjust", -0.5, 6, "", "Physical count"),
      m("m3", "11:45", "i2", MAIN, "receive", 12, 36, "PO-1001 · INV-HL-208", ""),
      m("m2", "10:30", "i3", MAIN, "issue", -24, 72, "", "Breakfast service"),
      m("m1", "09:10", "i1", MAIN, "receive", 20, 70, "INV-CS-104", ""),
    ],
    pos: [
      { id: "PO-1001", supplier: "s2", store: MAIN, date: "2026-11-07", expected: "2026-11-10", status: "partial", note: "", by: USER, approvedBy: "Nazmul Hasan",
        lines: [{ item: "i2", qty: 24, cost: 420, received: 12 }, { item: "i8", qty: 25, cost: 140, received: 0 }],
        grns: [{ id: "GRN-1001", at: `${TODAY}T11:45`, invoice: "INV-HL-208", by: USER, lines: [{ item: "i2", qty: 12 }] }] },
      { id: "PO-1002", supplier: "s1", store: MAIN, date: TODAY, expected: "2026-11-12", status: "pending", note: "Weekly amenities", by: USERS.keeper,
        lines: [{ item: "i5", qty: 48, cost: 65, received: 0 }, { item: "i6", qty: 8, cost: 160, received: 0 }], grns: [] },
    ],
    counts: [],
    recipes: [
      { id: "r1", name: "Chicken Biryani", store: "kitchen", price: 450, lines: [{ item: "i9", qty: 0.2 }, { item: "i10", qty: 0.25 }, { item: "i11", qty: 0.03 }] },
      { id: "r2", name: "Fresh Lime Soda", store: "bar", price: 180, lines: [{ item: "i12", qty: 0.04 }, { item: "i3", qty: 1 }] },
      { id: "r3", name: "Cappuccino", store: "kitchen", price: 220, lines: [{ item: "i4", qty: 0.018 }] },
    ],
    sales: [], postings: [],
    approvals: [{ id: "AP-1", at: `${TODAY}T15:05`, kind: "wastage", item: "i2", store: MAIN, amount: 3, value: 1260, note: "Stained, cannot be used", ref: "", by: USERS.keeper, status: "pending" }],
    settings: { role: "manager", approveAbove: 1000, poNeedsApproval: true },
  };
}

/** v1 data (one store) → v2: everything moves into Main Store. */
function migrate(p: { items: Item[]; categories: Category[]; suppliers: Supplier[]; moves: Move[] }): State {
  const base = seed();
  return {
    ...base, categories: p.categories, suppliers: p.suppliers, pos: [], approvals: [], recipes: [], counts: [],
    items: p.items.map((i) => ({ ...i, stock: { [MAIN]: i.qty } })),
    moves: p.moves.map((m) => ({ ...m, store: MAIN })),
  };
}

const KEY = (slug: string) => `bingi-inventory-v2-${slug}`;
const OLD = (slug: string) => `bingi-inventory-v1-${slug}`;
const cache = new Map<string, { raw: string | null; st: State }>();
const listeners = new Set<() => void>();
const BASE = seed();
function read(slug: string): State {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY(slug)); } catch {}
  const hit = cache.get(slug);
  if (hit && hit.raw === raw) return hit.st;
  let st = seed();
  if (raw) try { const p = JSON.parse(raw); if (p?.v === 2 && Array.isArray(p.items)) st = p; } catch {}
  else try { const o = JSON.parse(localStorage.getItem(OLD(slug)) ?? "null"); if (o?.v === 1 && Array.isArray(o.items)) st = migrate(o); } catch {}
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

export type StockStatus = "In stock" | "Low stock" | "Out of stock";
export const statusOf = (i: Item): StockStatus => (i.qty <= 0 ? "Out of stock" : i.qty <= i.reorder ? "Low stock" : "In stock");
/** 3 decimals max (recipes use 0.018 kg). */
export const q = (n: number) => Math.round(n * 1000) / 1000;
export const fmtQty = (n: number, u: string) => `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 }).format(n)} ${u}`;
export const tk = (n: number) => `৳${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n)}`;
/** "2 carton + 6 pcs" style hint for a base quantity. */
export const inBuy = (i: Item, n: number) => (i.buyUnit && i.perBuy && n >= i.perBuy ? `${Math.floor(n / i.perBuy)} ${i.buyUnit}${n % i.perBuy ? ` + ${fmtQty(q(n % i.perBuy), i.unit)}` : ""}` : "");
export const at = (i: Item, store: string) => (store ? i.stock[store] ?? 0 : i.qty);
export const poTotal = (p: Po) => p.lines.reduce((s, l) => s + l.qty * l.cost, 0);
const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const nowIso = () => { const d = new Date(); return `${TODAY}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const nextNo = (list: { id: string }[], pre: string, start = 1001) => `${pre}-${Math.max(start - 1, ...list.map((x) => Number(x.id.split("-")[1]) || 0)) + 1}`;

/** Apply one stock change to a store and log it. Caller checks limits. */
function apply(s: State, itemId: string, store: string, type: MoveType, change: number, extra: Partial<Move> & { by: string }) {
  const it = s.items.find((x) => x.id === itemId)!;
  it.stock[store] = q((it.stock[store] ?? 0) + change);
  it.qty = q(Object.values(it.stock).reduce((a, b) => a + b, 0));
  s.moves.unshift({ id: uid("m"), at: nowIso(), item: itemId, store, type, change: q(change), balance: it.stock[store], ref: "", note: "", value: Math.round(Math.abs(change) * it.cost * 100) / 100, ...extra });
}

export function useInventory(h: Hotel) {
  const st = useSyncExternalStore(sub, () => read(h.slug), () => BASE);
  const update = useCallback((fn: (s: State) => void) => { const n = structuredClone(read(h.slug)); fn(n); write(h.slug, n); }, [h.slug]);
  const items = useMemo(() => st.items.filter((i) => !i.archived), [st.items]);
  const me = USERS[st.settings.role];
  const role = st.settings.role;

  const nextSku = useCallback((cat: string) => {
    const name = read(h.slug).categories.find((c) => c.id === cat)?.name ?? "Item";
    const pre = name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "IT";
    const n = Math.max(0, ...read(h.slug).items.filter((i) => i.sku.startsWith(pre + "-")).map((i) => Number(i.sku.split("-")[1]) || 0)) + 1;
    return `${pre}-${String(n).padStart(3, "0")}`;
  }, [h.slug]);

  const saveItem = useCallback((it: Item, opening?: number, openingStore = MAIN) => update((s) => {
    const i = s.items.findIndex((x) => x.id === it.id);
    if (i >= 0) { s.items[i] = { ...it, qty: s.items[i].qty, stock: s.items[i].stock }; return; }
    s.items.unshift({ ...it, qty: 0, stock: {} });
    const qty = q(opening ?? 0);
    if (qty > 0) apply(s, it.id, openingStore, "opening", qty, { note: "Opening stock", by: USERS[s.settings.role] });
  }), [update]);
  const archiveItem = useCallback((id: string) => update((s) => { const i = s.items.find((x) => x.id === id); if (i) i.archived = true; }), [update]);

  /**
   * One movement in one store. For "adjust" pass the counted quantity; others a positive amount.
   * Wastage / adjust worth more than the approval limit, recorded by a store keeper, wait for a manager.
   * Returns an error, "pending" (sent for approval) or null.
   */
  const move = useCallback((type: "receive" | "issue" | "wastage" | "adjust", itemId: string, amount: number, extra: { note: string; ref?: string; supplier?: string; cost?: number; store?: string }) => {
    const s0 = read(h.slug);
    const cur = s0.items.find((x) => x.id === itemId);
    if (!cur) return "Item not found";
    const store = extra.store ?? MAIN;
    const have = cur.stock[store] ?? 0;
    const amt = q(amount);
    if (!(amt >= 0) || (type !== "adjust" && amt <= 0)) return "Enter a quantity above 0";
    if ((type === "issue" || type === "wastage") && amt > have) return `Enter ${fmtQty(have, cur.unit)} or less. This store has ${fmtQty(have, cur.unit)} available.`;
    const change = type === "receive" ? amt : type === "adjust" ? q(amt - have) : -amt;
    if (type === "adjust" && change === 0) return "Counted quantity is the same as the balance — nothing to adjust";
    const value = Math.round(Math.abs(change) * cur.cost);
    if ((type === "wastage" || type === "adjust") && s0.settings.role === "keeper" && value > s0.settings.approveAbove) {
      update((s) => { s.approvals.unshift({ id: nextNo(s.approvals.map((a) => ({ id: a.id })), "AP", 1), at: nowIso(), kind: type, item: itemId, store, amount: type === "adjust" ? amt : amt, value, note: extra.note, ref: extra.ref ?? "", by: USERS[s.settings.role], status: "pending" }); });
      return "pending";
    }
    update((s) => {
      const it = s.items.find((x) => x.id === itemId)!;
      if (type === "receive" && extra.cost !== undefined && extra.cost > 0) it.cost = it.qty + change > 0 ? Math.round(((it.qty * it.cost + change * extra.cost) / (it.qty + change)) * 100) / 100 : extra.cost;
      apply(s, itemId, store, type, change, { ref: extra.ref ?? "", note: extra.note, supplier: extra.supplier, cost: extra.cost, by: USERS[s.settings.role] });
    });
    return null;
  }, [h.slug, update]);

  const decide = useCallback((id: string, ok: boolean) => {
    const s0 = read(h.slug); const a = s0.approvals.find((x) => x.id === id);
    if (!a || a.status !== "pending") return "Already decided";
    const it = s0.items.find((x) => x.id === a.item)!; const have = it.stock[a.store] ?? 0;
    if (ok && a.kind === "wastage" && a.amount > have) return `Only ${fmtQty(have, it.unit)} left in this store now — reject and record again`;
    update((s) => {
      const x = s.approvals.find((y) => y.id === id)!;
      x.status = ok ? "approved" : "rejected"; x.decidedBy = USERS[s.settings.role];
      if (!ok) return;
      const cur = s.items.find((y) => y.id === x.item)!.stock[x.store] ?? 0;
      const change = x.kind === "adjust" ? q(x.amount - cur) : -x.amount;
      if (change !== 0) apply(s, x.item, x.store, x.kind, change, { note: x.note, ref: x.ref || x.id, by: `${x.by} · approved by ${USERS[s.settings.role]}` });
    });
    return null;
  }, [h.slug, update]);

  /** Move stock between stores (e.g. Main Store → Kitchen). */
  const transfer = useCallback((itemId: string, from: string, to: string, amount: number, note: string) => {
    const s0 = read(h.slug); const it = s0.items.find((x) => x.id === itemId);
    if (!it) return "Item not found";
    if (from === to) return "Pick two different stores";
    const amt = q(amount); const have = it.stock[from] ?? 0;
    if (!(amt > 0)) return "Enter a quantity above 0";
    if (amt > have) return `Enter ${fmtQty(have, it.unit)} or less. This store has ${fmtQty(have, it.unit)} available.`;
    update((s) => {
      const ref = nextNo(s.moves.filter((m) => m.ref.startsWith("TR-")).map((m) => ({ id: m.ref })), "TR");
      const name = (id: string) => s.stores.find((x) => x.id === id)?.name ?? id;
      apply(s, itemId, from, "transfer", -amt, { ref, note: `To ${name(to)}${note ? ` · ${note}` : ""}`, by: USERS[s.settings.role] });
      apply(s, itemId, to, "transfer", amt, { ref, note: `From ${name(from)}${note ? ` · ${note}` : ""}`, by: USERS[s.settings.role] });
    });
    return null;
  }, [h.slug, update]);

  // ---- purchase orders ----
  const savePo = useCallback((p: Omit<Po, "id" | "status" | "by" | "grns" | "approvedBy"> & { id?: string }, submit: boolean) => {
    let id = p.id ?? "";
    update((s) => {
      const needs = s.settings.poNeedsApproval && s.settings.role === "keeper";
      const status: PoStatus = !submit ? "draft" : needs ? "pending" : "approved";
      const ex = s.pos.find((x) => x.id === p.id);
      if (ex) Object.assign(ex, p, { status, approvedBy: status === "approved" ? USERS[s.settings.role] : undefined });
      else { id = nextNo(s.pos, "PO"); s.pos.unshift({ ...p, id, status, by: USERS[s.settings.role], grns: [], approvedBy: status === "approved" ? USERS[s.settings.role] : undefined }); }
    });
    return id;
  }, [update]);
  const setPoStatus = useCallback((id: string, status: "approved" | "cancelled" | "draft") => update((s) => { const p = s.pos.find((x) => x.id === id); if (!p) return; p.status = status; if (status === "approved") p.approvedBy = USERS[s.settings.role]; }), [update]);
  /** Receive against a PO (any part). Creates one GRN and a receive movement per line; updates average cost. */
  const receivePo = useCallback((id: string, lines: { item: string; qty: number; cost: number }[], invoice: string) => {
    const s0 = read(h.slug); const p = s0.pos.find((x) => x.id === id);
    if (!p || !["approved", "partial"].includes(p.status)) return "This order can't be received";
    const real = lines.filter((l) => l.qty > 0);
    if (!real.length) return "Enter at least one received quantity";
    for (const l of real) { const pl = p.lines.find((x) => x.item === l.item)!; if (l.qty > q(pl.qty - pl.received)) return "You can't receive more than is still due on the order"; }
    update((s) => {
      const po = s.pos.find((x) => x.id === id)!;
      const grn: Grn = { id: nextNo(s.pos.flatMap((x) => x.grns), "GRN"), at: nowIso(), invoice, by: USERS[s.settings.role], lines: real.map((l) => ({ item: l.item, qty: q(l.qty) })) };
      for (const l of real) {
        const it = s.items.find((x) => x.id === l.item)!; const pl = po.lines.find((x) => x.item === l.item)!;
        pl.received = q(pl.received + l.qty);
        if (l.cost > 0) { pl.cost = l.cost; it.cost = it.qty + l.qty > 0 ? Math.round(((it.qty * it.cost + l.qty * l.cost) / (it.qty + l.qty)) * 100) / 100 : l.cost; }
        apply(s, l.item, po.store, "receive", l.qty, { ref: `${po.id} · ${grn.id}${invoice ? ` · ${invoice}` : ""}`, note: "", supplier: po.supplier, cost: l.cost, by: USERS[s.settings.role] });
      }
      po.grns.unshift(grn);
      po.status = po.lines.every((x) => x.received >= x.qty) ? "received" : "partial";
    });
    return null;
  }, [h.slug, update]);

  // ---- stock count ----
  const startCount = useCallback((store: string, cat: string) => {
    let id = "";
    update((s) => {
      id = nextNo(s.counts, "CNT");
      const list = s.items.filter((i) => !i.archived && (!cat || i.category === cat) && (store === MAIN || store in i.stock));
      s.counts.unshift({ id, store, at: nowIso(), status: "open", by: USERS[s.settings.role], note: "", lines: list.map((i) => ({ item: i.id, system: i.stock[store] ?? 0, counted: null })) });
    });
    return id;
  }, [update]);
  const setCounted = useCallback((id: string, item: string, v: number | null) => update((s) => { const c = s.counts.find((x) => x.id === id); const l = c?.lines.find((x) => x.item === item); if (l && c?.status !== "posted") l.counted = v === null ? null : q(v); }), [update]);
  const submitCount = useCallback((id: string) => update((s) => { const c = s.counts.find((x) => x.id === id); if (c && c.status === "open") c.status = "review"; }), [update]);
  /** Post a count: one adjustment per line whose counted quantity differs from the balance NOW. */
  const postCount = useCallback((id: string) => {
    const s0 = read(h.slug); const c = s0.counts.find((x) => x.id === id);
    if (!c || c.status === "posted") return "Already posted";
    if (c.lines.some((l) => l.counted === null)) return "Count every item first (enter 0 if there is none)";
    update((s) => {
      const cc = s.counts.find((x) => x.id === id)!;
      for (const l of cc.lines) {
        const now = s.items.find((x) => x.id === l.item)?.stock[cc.store] ?? 0;
        const change = q((l.counted ?? 0) - now);
        if (change !== 0) apply(s, l.item, cc.store, "adjust", change, { ref: cc.id, note: "Stock count", by: USERS[s.settings.role] });
      }
      cc.status = "posted"; cc.postedBy = USERS[s.settings.role];
    });
    return null;
  }, [h.slug, update]);

  // ---- recipes + sales ----
  const saveRecipe = useCallback((r: Recipe) => update((s) => { const i = s.recipes.findIndex((x) => x.id === r.id); if (i >= 0) s.recipes[i] = r; else s.recipes.push(r); }), [update]);
  const removeRecipe = useCallback((id: string) => update((s) => { s.recipes = s.recipes.filter((r) => r.id !== id); }), [update]);
  /** Record dishes sold → ingredients leave the recipe's outlet store. Blocks when an outlet would go below zero. */
  const recordSales = useCallback((rows: { recipe: string; qty: number }[]) => {
    const s0 = read(h.slug);
    const need = new Map<string, number>();
    for (const r of rows.filter((x) => x.qty > 0)) { const rc = s0.recipes.find((x) => x.id === r.recipe)!; for (const l of rc.lines) { const k = `${l.item}|${rc.store}`; need.set(k, q((need.get(k) ?? 0) + l.qty * r.qty)); } }
    if (!need.size) return "Enter how many were sold";
    for (const [k, n] of need) { const [item, store] = k.split("|"); const it = s0.items.find((x) => x.id === item)!; const have = it.stock[store] ?? 0; if (n > have) return `Not enough ${it.name} in ${s0.stores.find((x) => x.id === store)?.name}: needs ${fmtQty(n, it.unit)}, has ${fmtQty(have, it.unit)}. Transfer stock first.`; }
    update((s) => {
      const ref = nextNo(s.sales.map((x) => ({ id: x.id })), "SALE");
      for (const r of rows.filter((x) => x.qty > 0)) s.sales.unshift({ id: `${ref}`, at: nowIso(), recipe: r.recipe, qty: r.qty, by: USERS[s.settings.role] });
      for (const [k, n] of need) { const [item, store] = k.split("|"); apply(s, item, store, "consume", -n, { ref, note: "Recipe use from sales", by: USERS[s.settings.role] }); }
    });
    return null;
  }, [h.slug, update]);

  /** Cost of goods for a period (issue + used in sales + wastage), by category. */
  const cogs = useCallback((from: string, to: string) => {
    const s0 = st; const by = new Map<string, number>();
    for (const m of s0.moves) {
      const d = m.at.slice(0, 10);
      if (d < from || d > to || !["issue", "consume", "wastage"].includes(m.type)) continue;
      const it = s0.items.find((x) => x.id === m.item); const cat = it?.category ?? "";
      by.set(cat, (by.get(cat) ?? 0) + (m.value ?? Math.abs(m.change) * (it?.cost ?? 0)));
    }
    return [...by].map(([category, amount]) => ({ category, amount: Math.round(amount) })).filter((x) => x.amount > 0);
  }, [st]);
  const postCogs = useCallback((from: string, to: string) => {
    const lines = cogs(from, to); const total = lines.reduce((a, b) => a + b.amount, 0);
    if (!total) return "Nothing used in this period";
    if (read(h.slug).postings.some((p) => p.from === from && p.to === to)) return "This period is already sent to Accounts";
    update((s) => { s.postings.unshift({ id: nextNo(s.postings, "JV"), at: nowIso(), from, to, by: USERS[s.settings.role], total, lines }); });
    return null;
  }, [cogs, h.slug, update]);

  const saveStore = useCallback((x: Location) => update((s) => { const i = s.stores.findIndex((y) => y.id === x.id); if (i >= 0) s.stores[i] = x; else s.stores.push(x); }), [update]);
  const removeStore = useCallback((id: string) => update((s) => { s.stores = s.stores.filter((x) => x.id !== id); }), [update]);
  const setSettings = useCallback((p: Partial<Settings>) => update((s) => { s.settings = { ...s.settings, ...p }; }), [update]);
  const saveCategory = useCallback((c: Category) => update((s) => { const i = s.categories.findIndex((x) => x.id === c.id); if (i >= 0) s.categories[i] = c; else s.categories.push(c); }), [update]);
  const removeCategory = useCallback((id: string) => update((s) => { s.categories = s.categories.filter((c) => c.id !== id); }), [update]);
  const saveSupplier = useCallback((x: Supplier) => update((s) => { const i = s.suppliers.findIndex((y) => y.id === x.id); if (i >= 0) s.suppliers[i] = x; else s.suppliers.push(x); }), [update]);
  const removeSupplier = useCallback((id: string) => update((s) => { s.suppliers = s.suppliers.filter((c) => c.id !== id); }), [update]);
  const clearAll = useCallback(() => update((s) => { s.items = []; s.moves = []; s.pos = []; s.counts = []; s.approvals = []; s.recipes = []; s.sales = []; }), [update]);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY(h.slug)); localStorage.removeItem(OLD(h.slug)); } catch {} cache.delete(h.slug); listeners.forEach((l) => l()); }, [h.slug]);

  /** Quantity still due on approved / part-received orders, per item. */
  const onOrder = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of st.pos) if (["approved", "partial", "pending"].includes(p.status)) for (const l of p.lines) m.set(l.item, q((m.get(l.item) ?? 0) + l.qty - l.received));
    return m;
  }, [st.pos]);
  /** Items at/below reorder level, with an order-up-to-par suggestion rounded to whole buy units. */
  const suggestions = useMemo(() => items.filter((i) => i.qty + (onOrder.get(i.id) ?? 0) <= i.reorder).map((i) => {
    const target = Math.max(i.par ?? i.reorder * 2, i.reorder + 1);
    let need = q(target - i.qty - (onOrder.get(i.id) ?? 0));
    if (i.perBuy) need = Math.ceil(need / i.perBuy) * i.perBuy;
    return { item: i, need: Math.max(need, i.perBuy ?? 1) };
  }), [items, onOrder]);

  return {
    st, items, me, role, update, nextSku, saveItem, archiveItem, move, decide, transfer, savePo, setPoStatus, receivePo,
    startCount, setCounted, submitCount, postCount, saveRecipe, removeRecipe, recordSales, cogs, postCogs,
    saveStore, removeStore, setSettings, saveCategory, removeCategory, saveSupplier, removeSupplier, clearAll, reset, newId: uid, onOrder, suggestions,
  };
}

/** Inventory is an Ultra (and custom/Enterprise) tool per the public pricing page. */
export const hasInventory = (h: Hotel) => can(h, "inventory");
