// Reports — read-only views over every module (one shared date range). Nothing is stored here.
// Definitions (same everywhere): room sales = room bill incl. VAT & service, shared per night in range;
// restaurant sales = bill total of orders placed in range (paid or charged to room, not cancelled);
// service sales = order total created in range; collections / refunds = Payments ledger; expenses = money paid out.
import type { Booking } from "@/lib/bookings/store";
import { bill, channelLabel, dueOf, totalOf } from "@/lib/bookings/store";
import type { Unit } from "@/lib/rooms/store";
import { oooOn } from "@/lib/rooms/store";
import type { Guest } from "@/lib/guests/store";
import { bill as mealBill, SERVICE_LABEL, type Order as MealOrder } from "@/lib/meals/seed";
import { orderTotal, type Order as SvcOrder } from "@/lib/services/store";
import { SOURCE_LABEL, METHODS, sums, type Row as PayRow } from "@/lib/payments/ledger";
import type { Item } from "@/lib/inventory/store";
import type { PayrollRun } from "@/lib/hrm/store";
import { runTotals } from "@/lib/hrm/store";

export type Fmt = "money" | "int" | "pct" | "text";
export type Col = { k: string; label: string; fmt?: Fmt };
export type Table = { title: string; cols: Col[]; rows: Record<string, string | number>[]; total?: boolean; empty?: string };
export type Kpi = { label: string; value: number; fmt: Fmt; sub?: string };
export type Chart = { title: string; fmt: Fmt; points: { label: string; v: number }[] };
export type Report = { id: string; label: string; kpis: Kpi[]; chart?: Chart; tables: Table[]; note?: string };

export type Input = {
  from: string; to: string; today: string;
  bookings: Booking[]; units: Unit[]; guests: Map<string, Guest>;
  pays: PayRow[];
  /** Money paid out for expenses (expense payments + petty cash), each with date and category. */
  spent: { date: string; category: string; payee: string; amount: number; method: string; title: string }[];
  meals?: MealOrder[]; services?: SvcOrder[]; serviceName?: (id: string) => string;
  items?: Item[]; payroll?: PayrollRun[]; staffName?: (id: string) => string;
};
export const REPORTS: { id: string; label: string; group: string; need?: "restaurant" | "services" | "expenses" | "inventory" | "hrm" }[] = [
  { id: "daily", label: "Daily sales", group: "Sales" },
  { id: "register", label: "Sales register", group: "Sales" },
  { id: "profit", label: "Revenue & profit", group: "Sales" },
  { id: "occupancy", label: "Occupancy, ADR, RevPAR", group: "Rooms" },
  { id: "bookings", label: "Bookings & sources", group: "Rooms" },
  { id: "guests", label: "Guests", group: "Rooms" },
  { id: "payments", label: "Payments", group: "Money" },
  { id: "expenses", label: "Expenses", group: "Money", need: "expenses" },
  { id: "restaurant", label: "Restaurant & Bar", group: "Departments", need: "restaurant" },
  { id: "services", label: "Other services", group: "Departments", need: "services" },
  { id: "inventory", label: "Inventory", group: "Departments", need: "inventory" },
  { id: "staff", label: "Staff cost", group: "Departments", need: "hrm" },
];

const days = (a: string, z: string) => { const out: string[] = []; for (let d = a; d <= z; d = add(d, 1)) out.push(d); return out; };
function add(iso: string, n: number) { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
const sold = (b: Booking) => b.status === "Confirmed" || b.status === "Checked in" || b.status === "Checked out";
const inR = (i: Input, d: string) => d >= i.from && d <= i.to;
const group = <T,>(xs: T[], key: (x: T) => string, val: (x: T) => number) => { const m = new Map<string, number>(); xs.forEach((x) => m.set(key(x), (m.get(key(x)) ?? 0) + val(x))); return [...m].sort((a, b) => b[1] - a[1]); };
const r2 = (n: number) => Math.round(n);

/** Room sales per night (incl. VAT & service), for sold stays. */
function roomNights(i: Input) {
  const out: { date: string; b: Booking; amount: number; base: number }[] = [];
  for (const b of i.bookings) {
    if (!sold(b) || !b.nights.length) continue;
    const t = bill(b), per = t.total / b.nights.length, disc = b.discount / b.nights.length;
    for (const n of b.nights) if (inR(i, n.date)) out.push({ date: n.date, b, amount: per, base: n.base - disc });
  }
  return out;
}
const mealsIn = (i: Input) => (i.meals ?? []).filter((o) => inR(i, o.at.slice(0, 10)) && o.status !== "cancelled" && o.status !== "declined");
const svcIn = (i: Input) => (i.services ?? []).filter((o) => inR(i, o.created.slice(0, 10)) && !o.cancelled && o.payment !== "Refunded");

export function build(id: string, i: Input): Report {
  const label = REPORTS.find((r) => r.id === id)?.label ?? id;
  const rn = roomNights(i), ml = mealsIn(i), sv = svcIn(i);
  const rooms = rn.reduce((s, x) => s + x.amount, 0), food = ml.reduce((s, o) => s + mealBill(o).total, 0), svc = sv.reduce((s, o) => s + orderTotal(o), 0);
  const pays = i.pays.filter((r) => inR(i, r.at.slice(0, 10)));
  const ps = sums(pays);
  const spent = i.spent.filter((x) => inR(i, x.date));
  const spentT = spent.reduce((s, x) => s + x.amount, 0);
  const payrollPaid = (i.payroll ?? []).flatMap((r) => r.payments).filter((p) => inR(i, p.date)).reduce((s, p) => s + p.amount, 0);

  switch (id) {
    case "daily": {
      const ds = days(i.from, i.to);
      const row = (d: string) => {
        const sales = rn.filter((x) => x.date === d).reduce((s, x) => s + x.amount, 0) + ml.filter((o) => o.at.startsWith(d)).reduce((s, o) => s + mealBill(o).total, 0) + sv.filter((o) => o.created.startsWith(d)).reduce((s, o) => s + orderTotal(o), 0);
        const col = sums(pays.filter((r) => r.at.startsWith(d))).net;
        const ex = spent.filter((x) => x.date === d).reduce((s, x) => s + x.amount, 0);
        return { date: d, sales: r2(sales), col, ex, net: col - ex };
      };
      const rows = ds.map(row);
      const due = i.bookings.filter((b) => ["Confirmed", "Checked in", "Checked out"].includes(b.status)).reduce((s, b) => s + dueOf(b), 0);
      return { id, label, kpis: [
        { label: "Gross sales", value: rooms + food + svc, fmt: "money" }, { label: "Room sales", value: rooms, fmt: "money" },
        ...(i.meals ? [{ label: "Food & drink sales", value: food, fmt: "money" as Fmt }] : []), ...(i.services ? [{ label: "Service sales", value: svc, fmt: "money" as Fmt }] : []),
        { label: "Collections", value: ps.collected, fmt: "money" }, { label: "Refunds", value: ps.refunded, fmt: "money" },
        { label: "Expenses paid", value: spentT, fmt: "money" }, { label: "Net cash", value: ps.net - spentT, fmt: "money", sub: "Collections − refunds − expenses" },
        { label: "Outstanding due", value: due, fmt: "money", sub: "All open bookings, today" },
      ], chart: { title: "Collections by day", fmt: "money", points: rows.map((r) => ({ label: r.date, v: r.col })) },
      tables: [
        { title: "Sales by source", cols: [{ k: "k", label: "Source" }, { k: "v", label: "Sales", fmt: "money" }], total: true, rows: [["Room bookings", rooms], ...(i.meals ? [["Restaurant & Bar", food]] : []), ...(i.services ? [["Other services", svc]] : [])].map(([k, v]) => ({ k, v: r2(v as number) })) },
        { title: "Collections by method", cols: [{ k: "k", label: "Method" }, { k: "n", label: "Payments", fmt: "int" }, { k: "v", label: "Net collected", fmt: "money" }], total: true, rows: METHODS.map((m) => ({ k: m, n: pays.filter((r) => r.method === m && r.kind === "payment").length, v: ps.byMethod[m] })).filter((x) => x.n || x.v) },
        { title: "Day by day", cols: [{ k: "date", label: "Date" }, { k: "sales", label: "Sales", fmt: "money" }, { k: "col", label: "Collections", fmt: "money" }, { k: "ex", label: "Expenses", fmt: "money" }, { k: "net", label: "Net cash", fmt: "money" }], total: true, rows },
      ] };
    }
    case "register": {
      const rows = [
        ...[...group(rn, (x) => `${x.date}|${x.b.code}`, (x) => x.amount)].map(([k, v]) => { const [date, code] = k.split("|"); const b = i.bookings.find((x) => x.code === code)!; return { date, ref: code, type: "Room night", guest: i.guests.get(b.guestId)?.name ?? "Guest", detail: `${b.unit ? `Room ${b.unit} · ` : ""}${b.type}`, v: r2(v) }; }),
        ...ml.map((o) => ({ date: o.at.slice(0, 10), ref: o.no, type: "Restaurant", guest: o.guest ?? (o.room ? `Room ${o.room}` : "Walk-in"), detail: `${o.outlet} · ${SERVICE_LABEL[o.service]}`, v: mealBill(o).total })),
        ...sv.map((o) => ({ date: o.created.slice(0, 10), ref: o.id, type: "Service", guest: o.booking?.guest ?? o.walkIn?.name ?? "Walk-in", detail: i.serviceName?.(o.service) ?? "Service", v: orderTotal(o) })),
      ].sort((a, b) => a.date.localeCompare(b.date) || a.ref.localeCompare(b.ref));
      return { id, label, kpis: [{ label: "Sales lines", value: rows.length, fmt: "int" }, { label: "Total sales", value: rows.reduce((s, r) => s + r.v, 0), fmt: "money" }],
        tables: [{ title: "Every sale", cols: [{ k: "date", label: "Date" }, { k: "ref", label: "Ref" }, { k: "type", label: "Type" }, { k: "guest", label: "Guest" }, { k: "detail", label: "Detail" }, { k: "v", label: "Amount", fmt: "money" }], total: true, rows }],
        note: "Room nights include VAT and service, shared equally over the stay." };
    }
    case "profit": {
      const rev = rooms + food + svc;
      const cats = group(spent, (x) => x.category, (x) => x.amount);
      const profit = rev - spentT - payrollPaid;
      return { id, label, kpis: [
        { label: "Revenue", value: rev, fmt: "money" }, { label: "Expenses paid", value: spentT, fmt: "money" },
        ...(i.payroll ? [{ label: "Payroll paid", value: payrollPaid, fmt: "money" as Fmt }] : []),
        { label: "Profit", value: profit, fmt: "money" }, { label: "Margin", value: rev ? profit / rev : 0, fmt: "pct" },
      ], tables: [
        { title: "Revenue by department", cols: [{ k: "k", label: "Department" }, { k: "v", label: "Revenue", fmt: "money" }, { k: "p", label: "Share", fmt: "pct" }], total: true, rows: [["Rooms", rooms], ...(i.meals ? [["Restaurant & Bar", food]] : []), ...(i.services ? [["Other services", svc]] : [])].map(([k, v]) => ({ k, v: r2(v as number), p: rev ? (v as number) / rev : 0 })) },
        { title: "Costs", cols: [{ k: "k", label: "Category" }, { k: "v", label: "Paid", fmt: "money" }], total: true, rows: [...cats.map(([k, v]) => ({ k, v })), ...(i.payroll ? [{ k: "Payroll (Staff)", v: payrollPaid }] : [])], empty: "No costs paid in this period." },
      ], note: "Revenue is what was sold (incl. VAT & service); costs are what was actually paid. Supplier bills count when paid." };
    }
    case "occupancy": {
      const ds = days(i.from, i.to);
      const pub = i.units.filter((u) => u.status === "published");
      const per = ds.map((d) => { const avail = pub.filter((u) => !oooOn(u, d, add(d, 1))).length; const xs = rn.filter((x) => x.date === d); return { date: d, avail, sold: xs.length, rev: r2(xs.reduce((s, x) => s + x.base, 0)) }; });
      const av = per.reduce((s, x) => s + x.avail, 0), n = per.reduce((s, x) => s + x.sold, 0), rv = per.reduce((s, x) => s + x.rev, 0);
      const types = group(rn, (x) => x.b.type, (x) => x.base), tn = group(rn, (x) => x.b.type, () => 1);
      return { id, label, kpis: [
        { label: "Occupancy", value: av ? n / av : 0, fmt: "pct", sub: `${n} of ${av} room-nights` }, { label: "ADR", value: n ? rv / n : 0, fmt: "money", sub: "Average price per sold night" },
        { label: "RevPAR", value: av ? rv / av : 0, fmt: "money", sub: "Room revenue per available night" }, { label: "Room revenue", value: rv, fmt: "money", sub: "Before VAT & service" },
      ], chart: { title: "Occupancy by night", fmt: "pct", points: per.map((x) => ({ label: x.date, v: x.avail ? x.sold / x.avail : 0 })) },
      tables: [
        { title: "Night by night", cols: [{ k: "date", label: "Date" }, { k: "avail", label: "Rooms open", fmt: "int" }, { k: "sold", label: "Sold", fmt: "int" }, { k: "occ", label: "Occupancy", fmt: "pct" }, { k: "rev", label: "Room revenue", fmt: "money" }], rows: per.map((x) => ({ ...x, occ: x.avail ? x.sold / x.avail : 0 })) },
        { title: "By room type", cols: [{ k: "k", label: "Room type" }, { k: "n", label: "Nights", fmt: "int" }, { k: "adr", label: "ADR", fmt: "money" }, { k: "v", label: "Revenue", fmt: "money" }], total: true, rows: types.map(([k, v]) => { const c = tn.find((x) => x[0] === k)?.[1] ?? 1; return { k, n: c, adr: r2(v / c), v: r2(v) }; }) },
      ], note: "Rooms that are out of order are not counted as open. Revenue here is the room price before VAT & service (industry basis for ADR / RevPAR)." };
    }
    case "bookings": {
      const made = i.bookings.filter((b) => inR(i, b.created.slice(0, 10)));
      const ok = made.filter((b) => b.status !== "Cancelled" && b.status !== "No-show");
      const lead = ok.length ? ok.reduce((s, b) => s + Math.max(0, (Date.parse(b.from) - Date.parse(b.created.slice(0, 10))) / 864e5), 0) / ok.length : 0;
      const los = ok.length ? ok.reduce((s, b) => s + b.nights.length, 0) / ok.length : 0;
      const lost = i.bookings.filter((b) => (b.status === "Cancelled" || b.status === "No-show") && b.from <= i.to && b.to > i.from);
      return { id, label, kpis: [
        { label: "Bookings made", value: made.length, fmt: "int" }, { label: "Room-nights booked", value: ok.reduce((s, b) => s + b.nights.length, 0), fmt: "int" },
        { label: "Average lead time", value: Math.round(lead), fmt: "int", sub: "Days between booking and arrival" }, { label: "Average stay", value: Math.round(los * 10) / 10, fmt: "int", sub: "Nights" },
        { label: "Cancelled & no-show", value: lost.length, fmt: "int", sub: `Fees kept ${new Intl.NumberFormat("en-IN").format(lost.reduce((s, b) => s + (b.cancel?.keep ?? 0), 0))}` },
      ], tables: [
        { title: "By source", cols: [{ k: "k", label: "Source" }, { k: "n", label: "Bookings", fmt: "int" }, { k: "v", label: "Value", fmt: "money" }], total: true, rows: group(ok, (b) => channelLabel(b), () => 1).map(([k, n]) => ({ k, n, v: r2(ok.filter((b) => channelLabel(b) === k).reduce((s, b) => s + totalOf(b), 0)) })) },
        { title: "By status", cols: [{ k: "k", label: "Status" }, { k: "n", label: "Bookings", fmt: "int" }], rows: group(made, (b) => b.status, () => 1).map(([k, n]) => ({ k, n })) },
        { title: "Bookings made in this period", cols: [{ k: "code", label: "Booking" }, { k: "guest", label: "Guest" }, { k: "src", label: "Source" }, { k: "stay", label: "Stay" }, { k: "status", label: "Status" }, { k: "v", label: "Value", fmt: "money" }], total: true,
          rows: made.map((b) => ({ code: b.code, guest: i.guests.get(b.guestId)?.name ?? "Guest", src: channelLabel(b), stay: `${b.from} → ${b.to}`, status: b.status, v: r2(totalOf(b)) })) },
      ] };
    }
    case "guests": {
      const stays = i.bookings.filter((b) => sold(b) && b.from <= i.to && b.to > i.from);
      const ids = [...new Set(stays.map((b) => b.guestId))];
      const returning = ids.filter((g) => i.bookings.some((b) => b.guestId === g && sold(b) && b.to <= i.from));
      const spend = ids.map((g) => ({ g, v: stays.filter((b) => b.guestId === g).reduce((s, b) => s + totalOf(b), 0), n: i.bookings.filter((b) => b.guestId === g && sold(b)).length })).sort((a, b) => b.v - a.v);
      return { id, label, kpis: [
        { label: "Guests staying", value: ids.length, fmt: "int" }, { label: "New guests", value: ids.length - returning.length, fmt: "int" },
        { label: "Returning guests", value: returning.length, fmt: "int" }, { label: "Foreign guests", value: ids.filter((g) => (i.guests.get(g)?.country ?? "Bangladesh") !== "Bangladesh").length, fmt: "int" },
      ], tables: [
        { title: "By country", cols: [{ k: "k", label: "Country" }, { k: "n", label: "Guests", fmt: "int" }], total: true, rows: group(ids, (g) => i.guests.get(g)?.country || "Not set", () => 1).map(([k, n]) => ({ k, n })) },
        { title: "Top guests by spend", cols: [{ k: "name", label: "Guest" }, { k: "phone", label: "Phone" }, { k: "n", label: "Stays (all time)", fmt: "int" }, { k: "v", label: "Spend in period", fmt: "money" }], rows: spend.slice(0, 20).map((x) => ({ name: i.guests.get(x.g)?.name ?? "Guest", phone: i.guests.get(x.g)?.phone ?? "", n: x.n, v: r2(x.v) })) },
      ] };
    }
    case "payments": {
      return { id, label, kpis: [
        { label: "Collected", value: ps.collected, fmt: "money", sub: `${ps.count} payments` }, { label: "Refunded", value: ps.refunded, fmt: "money" },
        { label: "Net received", value: ps.net, fmt: "money" }, { label: "Average payment", value: ps.avg, fmt: "money" },
      ], tables: [
        { title: "By method", cols: [{ k: "k", label: "Method" }, { k: "v", label: "Net", fmt: "money" }], total: true, rows: METHODS.map((m) => ({ k: m, v: ps.byMethod[m] })) },
        { title: "By source", cols: [{ k: "k", label: "Source" }, { k: "v", label: "Net", fmt: "money" }], total: true, rows: group(pays.filter((r) => r.kind !== "deposit"), (r) => SOURCE_LABEL[r.source], (r) => r.amount).map(([k, v]) => ({ k, v })) },
        { title: "All payments", cols: [{ k: "date", label: "Date" }, { k: "ref", label: "Ref" }, { k: "guest", label: "Guest" }, { k: "src", label: "Source" }, { k: "m", label: "Method" }, { k: "v", label: "Amount", fmt: "money" }], total: true,
          rows: pays.filter((r) => r.kind !== "deposit").map((r) => ({ date: r.at.slice(0, 10), ref: r.ref, guest: r.guest, src: SOURCE_LABEL[r.source], m: r.method, v: r.amount })) },
      ], note: "Security deposits are held for the guest and are not counted." };
    }
    case "expenses": {
      return { id, label, kpis: [{ label: "Paid out", value: spentT, fmt: "money" }, { label: "Payments", value: spent.length, fmt: "int" }, { label: "Biggest category", value: group(spent, (x) => x.category, (x) => x.amount)[0]?.[1] ?? 0, fmt: "money", sub: group(spent, (x) => x.category, (x) => x.amount)[0]?.[0] ?? "—" }],
        tables: [
          { title: "By category", cols: [{ k: "k", label: "Category" }, { k: "v", label: "Paid", fmt: "money" }], total: true, rows: group(spent, (x) => x.category, (x) => x.amount).map(([k, v]) => ({ k, v })) },
          { title: "By payee", cols: [{ k: "k", label: "Payee" }, { k: "v", label: "Paid", fmt: "money" }], total: true, rows: group(spent, (x) => x.payee, (x) => x.amount).map(([k, v]) => ({ k, v })) },
          { title: "Every payment", cols: [{ k: "date", label: "Date" }, { k: "title", label: "What for" }, { k: "category", label: "Category" }, { k: "method", label: "Method" }, { k: "amount", label: "Amount", fmt: "money" }], total: true, rows: spent.slice().sort((a, b) => a.date.localeCompare(b.date)) },
        ] };
    }
    case "restaurant": {
      const lines = ml.flatMap((o) => o.lines.map((l) => ({ name: l.name, qty: l.qty, v: l.price * l.qty })));
      return { id, label, kpis: [{ label: "Sales", value: food, fmt: "money" }, { label: "Orders", value: ml.length, fmt: "int" }, { label: "Average bill", value: ml.length ? food / ml.length : 0, fmt: "money" }, { label: "Charged to rooms", value: ml.filter((o) => o.pay === "room").reduce((s, o) => s + mealBill(o).total, 0), fmt: "money" }],
        tables: [
          { title: "By outlet", cols: [{ k: "k", label: "Outlet" }, { k: "n", label: "Orders", fmt: "int" }, { k: "v", label: "Sales", fmt: "money" }], total: true, rows: group(ml, (o) => o.outlet, (o) => mealBill(o).total).map(([k, v]) => ({ k, n: ml.filter((o) => o.outlet === k).length, v })) },
          { title: "By service", cols: [{ k: "k", label: "Service" }, { k: "v", label: "Sales", fmt: "money" }], total: true, rows: group(ml, (o) => SERVICE_LABEL[o.service], (o) => mealBill(o).total).map(([k, v]) => ({ k, v })) },
          { title: "Top items", cols: [{ k: "k", label: "Item" }, { k: "q", label: "Sold", fmt: "int" }, { k: "v", label: "Sales (before tax)", fmt: "money" }], rows: group(lines, (l) => l.name, (l) => l.v).slice(0, 15).map(([k, v]) => ({ k, q: lines.filter((l) => l.name === k).reduce((s, l) => s + l.qty, 0), v })) },
        ] };
    }
    case "services": {
      return { id, label, kpis: [{ label: "Sales", value: svc, fmt: "money" }, { label: "Orders", value: sv.length, fmt: "int" }, { label: "Vendor cost", value: sv.reduce((s, o) => s + (o.vendorCost ?? 0), 0), fmt: "money" }],
        tables: [{ title: "By service", cols: [{ k: "k", label: "Service" }, { k: "n", label: "Orders", fmt: "int" }, { k: "v", label: "Sales", fmt: "money" }], total: true, rows: group(sv, (o) => i.serviceName?.(o.service) ?? o.service, (o) => orderTotal(o)).map(([k, v]) => ({ k, n: sv.filter((o) => (i.serviceName?.(o.service) ?? o.service) === k).length, v })) }] };
    }
    case "inventory": {
      const it = (i.items ?? []).filter((x) => !(x as Item & { archived?: boolean }).archived);
      const low = it.filter((x) => x.qty <= x.reorder);
      return { id, label, kpis: [{ label: "Stock value", value: it.reduce((s, x) => s + x.qty * x.cost, 0), fmt: "money", sub: "At last cost, today" }, { label: "Items", value: it.length, fmt: "int" }, { label: "Low stock", value: low.length, fmt: "int" }],
        tables: [
          { title: "Value by category", cols: [{ k: "k", label: "Category" }, { k: "v", label: "Value", fmt: "money" }], total: true, rows: group(it, (x) => x.category, (x) => x.qty * x.cost).map(([k, v]) => ({ k, v })) },
          { title: "Low stock", cols: [{ k: "k", label: "Item" }, { k: "q", label: "In stock", fmt: "int" }, { k: "r", label: "Reorder at", fmt: "int" }], rows: low.map((x) => ({ k: x.name, q: x.qty, r: x.reorder })), empty: "Nothing is low." },
        ], note: "Stock is today's count. Movements, purchase orders and recipe costs are in Inventory › Reports." };
    }
    case "staff": {
      const runs = (i.payroll ?? []).slice().sort((a, b) => b.month.localeCompare(a.month));
      return { id, label, kpis: [{ label: "Payroll paid in period", value: payrollPaid, fmt: "money" }, { label: "Latest run net", value: runs[0] ? runTotals(runs[0]).net : 0, fmt: "money", sub: runs[0]?.label }, { label: "Latest run due", value: runs[0] ? runTotals(runs[0]).due : 0, fmt: "money" }],
        tables: [{ title: "Payroll runs", cols: [{ k: "k", label: "Month" }, { k: "g", label: "Gross", fmt: "money" }, { k: "n", label: "Net", fmt: "money" }, { k: "p", label: "Paid", fmt: "money" }, { k: "d", label: "Due", fmt: "money" }], total: true, rows: runs.map((r) => { const t = runTotals(r); return { k: r.label, g: t.gross, n: t.net, p: t.paid, d: t.due }; }) }],
        note: "Payroll is run and paid in Staff." };
    }
  }
  return { id, label, kpis: [], tables: [] };
}
