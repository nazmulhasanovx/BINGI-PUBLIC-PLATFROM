"use client";
// Expenses (live HMS "Operations": Overview, Expenses, Payroll, Payees, Categories, Audit logs).
// Same tabs, made simpler: Payroll is a read-only cost line from Staff (D2), supplier bills come from Inventory
// goods received, petty cash comes from Cashbox. Rules and data: src/lib/expenses/store.ts.
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronRight, Lock, Pencil, Plus, Search, Wallet, X } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { dmy, timeOf, tk } from "@/lib/bookings/store";
import { can } from "@/lib/plan";
import { addDays, postExpenseOut } from "@/lib/cashbox/store";
import { useInventory } from "@/lib/inventory/store";
import { runTotals, useHrm } from "@/lib/hrm/store";
import { sums } from "@/lib/payments/ledger";
import { METHODS, STATUS_LABEL, dueOf, paidOf, payState, useExpenses, type Category, type Expense, type Method, type NewExpense, type PayState, type Payee, type PayeeKind } from "@/lib/expenses/store";
import { useProperty } from "../property";
import { useCashboxData } from "../cashbox/pages";
import { usePaymentRows } from "../payments/page";
import { PlanGate } from "../plan-gate";
import { Sheet, btnLine, btnPrimary, input, lbl } from "../guests/ui";

/** Cashbox petty-cash categories → the same names as expense categories (one list in reports). */
const PETTY_CAT: Record<string, string> = { Repairs: "Repairs & maintenance", "Staff food": "Staff food & welfare" };
type Tab = "overview" | "list" | "bills" | "payees" | "categories" | "activity";
const TABS: [Tab, string][] = [["overview", "Overview"], ["list", "Expenses"], ["bills", "Supplier bills"], ["payees", "Payees"], ["categories", "Categories & rules"], ["activity", "Activity"]];
type Period = "month" | "last" | "30" | "all";
const PERIODS: [Period, string][] = [["month", "This month"], ["last", "Last month"], ["30", "30 days"], ["all", "All"]];
const range = (p: Period): [string, string] => {
  const m = TODAY.slice(0, 7);
  if (p === "month") return [`${m}-01`, TODAY];
  if (p === "last") { const d = addDays(`${m}-01`, -1); return [`${d.slice(0, 7)}-01`, d]; }
  if (p === "30") return [addDays(TODAY, -29), TODAY];
  return ["0000", TODAY];
};
const card = "rounded-2xl border border-hms-line bg-white";
const sel = "h-10 rounded-lg border border-[#858c97] bg-white px-3 text-[14px] outline-none focus:border-hms-ink focus:ring-2 focus:ring-hms-blue/30";
const TONE: Record<PayState, string> = { "Waiting approval": "bg-hms-amber-soft text-hms-amber", Rejected: "bg-hms-hover text-hms-muted", "To pay": "bg-hms-coral-soft text-hms-accent-ink", "Partly paid": "bg-hms-blue-soft text-hms-blue", Paid: "bg-hms-green-soft text-hms-green" };
const Chip = ({ s }: { s: PayState | "Petty cash" | "Unpaid" }) => <span className={clsx("inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[12.5px] font-semibold", s === "Petty cash" ? "bg-hms-hover text-hms-muted" : s === "Unpaid" ? TONE["To pay"] : TONE[s])}>{s}</span>;

/** A row in the Expenses list: an expense, or a petty-cash entry from Cashbox (read-only). */
type Line = { id: string; date: string; title: string; category: string; payee: string; amount: number; paid: number; state: PayState | "Petty cash"; e?: Expense; method?: string };
/** Supplier bill = one Inventory goods-received note, valued at the PO line cost. */
type Bill = { id: string; po: string; supplier: string; invoice: string; date: string; amount: number; e?: Expense };

function useData() {
  const h = useProperty();
  const ex = useExpenses(h);
  const inv = useInventory(h);
  const hrm = useHrm();
  const cbx = useCashboxData();
  const pays = usePaymentRows();
  const cat = (id: string) => ex.st.categories.find((c) => c.id === id)?.name ?? id;
  const payee = (id?: string) => (id ? ex.st.payees.find((p) => p.id === id)?.name ?? inv.st.suppliers.find((s) => s.id === id)?.name ?? "—" : "—");
  const bills: Bill[] = useMemo(() => !can(h, "inventory") ? [] : inv.st.pos.flatMap((po) => po.grns.map((g) => ({
    id: g.id, po: po.id, supplier: po.supplier, invoice: g.invoice, date: g.at.slice(0, 10),
    amount: g.lines.reduce((s, l) => s + l.qty * (po.lines.find((x) => x.item === l.item)?.cost ?? 0), 0),
    e: ex.st.expenses.find((e) => e.grn === g.id),
  }))).sort((a, b) => b.date.localeCompare(a.date)), [h, inv.st.pos, ex.st.expenses]);
  const petty: Line[] = useMemo(() => cbx.cb.st.moves.filter((m) => m.kind === "out" && m.reason === "petty" && !m.reversedBy && !m.reverses).map((m) => ({
    id: m.id, date: m.day, title: m.note || m.category || "Petty cash", category: PETTY_CAT[m.category ?? ""] ?? m.category ?? "Other", payee: m.party ?? "—", amount: m.amount, paid: m.amount, state: "Petty cash" as const, method: "Cash",
  })), [cbx.cb.st.moves]);
  const lines: Line[] = useMemo(() => [
    ...ex.st.expenses.map((e) => ({ id: e.id, date: e.date, title: e.title, category: cat(e.category), payee: payee(e.payee), amount: e.amount, paid: paidOf(e), state: payState(e), e })),
    ...petty,
  ].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)), // eslint-disable-next-line react-hooks/exhaustive-deps
  [ex.st, petty, inv.st.suppliers]);
  const payroll = can(h, "hrm") ? hrm.st.runs.map((r) => ({ r, t: runTotals(r) })) : [];
  return { h, ex, inv, cbx, pays, bills, lines, payroll, cat, payee };
}
type Data = ReturnType<typeof useData>;

export function ExpensesPage() {
  const h = useProperty();
  if (!can(h, "expenses")) return <PlanGate h={h} f="expenses" title="Expenses" text="Record bills and daily costs, approve big spends, pay suppliers and see what is left after costs." />;
  return <Expenses />;
}

function Expenses() {
  const d = useData();
  const sp = useSearchParams();
  const router = useRouter();
  const tabs = TABS.filter(([k]) => k !== "bills" || can(d.h, "inventory"));
  const tab: Tab = tabs.find(([k]) => k === sp.get("tab"))?.[0] ?? "overview";
  const go = (t: Tab) => router.replace(t === "overview" ? "/hms/operations" : `/hms/operations?tab=${t}`, { scroll: false });
  const [sheet, setSheet] = useState<null | { k: "new" } | { k: "edit"; e: Expense } | { k: "view"; id: string } | { k: "pay"; id: string } | { k: "bill"; b: Bill }>(null);
  const [toast, setToast] = useState("");
  const say = (m: string) => { setToast(m); setTimeout(() => setToast((x) => (x === m ? "" : x)), 2600); };
  const pending = d.ex.st.expenses.filter((e) => e.status === "pending");
  const view = sheet?.k === "view" || sheet?.k === "pay" ? d.ex.st.expenses.find((e) => e.id === sheet.id) : undefined;

  return (
    <div className="h-full overflow-y-auto"><div className="hms-page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="text-[24px] font-bold tracking-[-0.01em]">Expenses</h1><p className="text-[14.5px] text-hms-muted">Bills, daily costs and supplier payments for {d.h.name}.</p></div>
        <button onClick={() => setSheet({ k: "new" })} className={clsx(btnPrimary, "h-10")}><Plus className="size-4" aria-hidden />New expense</button>
      </div>
      <div role="tablist" aria-label="Expenses" className="-mx-1 mt-4 flex gap-1 overflow-x-auto border-b border-hms-line px-1">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => go(k)} className={clsx("-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-[14.5px] font-semibold", tab === k ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}>
            {l}{k === "list" && pending.length > 0 && <span className="rounded-full bg-hms-amber-soft px-2 text-[12px] text-hms-amber">{pending.length}</span>}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "overview" && <Overview d={d} open={(id) => setSheet({ k: "view", id })} go={go} say={say} />}
        {tab === "list" && <List d={d} open={(id) => setSheet({ k: "view", id })} />}
        {tab === "bills" && <Bills d={d} pay={(b) => b.e ? setSheet({ k: "pay", id: b.e.id }) : setSheet({ k: "bill", b })} open={(id) => setSheet({ k: "view", id })} />}
        {tab === "payees" && <Payees d={d} say={say} />}
        {tab === "categories" && <Categories d={d} say={say} />}
        {tab === "activity" && <Activity d={d} open={(id) => setSheet({ k: "view", id })} />}
      </div>

      {(sheet?.k === "new" || sheet?.k === "edit") && <ExpenseForm d={d} e={sheet.k === "edit" ? sheet.e : undefined} onClose={() => setSheet(null)} done={(id, m) => { say(m); setSheet({ k: "view", id }); }} />}
      {sheet?.k === "view" && view && <Detail d={d} e={view} onClose={() => setSheet(null)} edit={() => setSheet({ k: "edit", e: view })} pay={() => setSheet({ k: "pay", id: view.id })} say={say} />}
      {sheet?.k === "pay" && view && <PaySheet d={d} e={view} onClose={() => setSheet({ k: "view", id: view.id })} done={(m) => { say(m); setSheet({ k: "view", id: view.id }); }} />}
      {sheet?.k === "bill" && <BillSheet d={d} b={sheet.b} onClose={() => setSheet(null)} done={(id) => setSheet({ k: "pay", id })} />}
      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-[95] -translate-x-1/2 rounded-full bg-hms-ink px-4 py-2.5 text-[14px] font-medium text-white shadow-lg"><Check className="mr-1.5 inline size-4" aria-hidden />{toast}</div>}
    </div></div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: ReactNode; tone?: "red" | "amber" }) {
  return <div className={clsx(card, "p-4")}><p className="text-[13px] font-medium text-hms-muted">{label}</p><p className={clsx("mt-1 text-[22px] font-bold tabular-nums", tone === "red" && "text-hms-red", tone === "amber" && "text-hms-amber")}>{value}</p><div className="mt-0.5 text-[12.5px] text-hms-muted">{sub}</div></div>;
}
function Periods({ p, set }: { p: Period; set: (p: Period) => void }) {
  return <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Period">{PERIODS.map(([k, l]) => <button key={k} aria-pressed={p === k} onClick={() => set(k)} className={clsx("h-9 shrink-0 rounded-full border px-3.5 text-[13.5px] font-medium", p === k ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line bg-white hover:bg-hms-hover")}>{l}</button>)}</div>;
}

function Overview({ d, open, go, say }: { d: Data; open: (id: string) => void; go: (t: Tab) => void; say: (m: string) => void }) {
  const [p, setP] = useState<Period>("month");
  const [a, z] = range(p);
  const inR = (x: string) => x >= a && x <= z;
  // money out = what was actually paid in the period (expense payments + petty cash)
  const spentEx = d.ex.st.expenses.flatMap((e) => e.payments.map((x) => ({ e, x }))).filter(({ x }) => inR(x.at.slice(0, 10)));
  const spentPetty = d.lines.filter((l) => l.state === "Petty cash" && inR(l.date));
  const spent = spentEx.reduce((s, { x }) => s + x.amount, 0) + spentPetty.reduce((s, l) => s + l.amount, 0);
  const toPay = d.ex.st.expenses.reduce((s, e) => s + dueOf(e), 0) + d.bills.filter((b) => !b.e).reduce((s, b) => s + b.amount, 0);
  const pending = d.ex.st.expenses.filter((e) => e.status === "pending");
  const payrollPaid = d.payroll.filter(({ r }) => r.payments.some((x) => inR(x.date))).reduce((s, { r }) => s + r.payments.filter((x) => inR(x.date)).reduce((t, x) => t + x.amount, 0), 0);
  const income = sums(d.pays.filter((r) => inR(r.at.slice(0, 10)))).net;
  const byCat = new Map<string, number>();
  spentEx.forEach(({ e, x }) => byCat.set(d.cat(e.category), (byCat.get(d.cat(e.category)) ?? 0) + x.amount));
  spentPetty.forEach((l) => byCat.set(l.category, (byCat.get(l.category) ?? 0) + l.amount));
  const cats = [...byCat].sort((x, y) => y[1] - x[1]);
  const max = Math.max(1, ...cats.map((c) => c[1]));
  const run = d.payroll.find(({ r }) => r.month === TODAY.slice(0, 7)) ?? d.payroll.at(-1);
  return (
    <>
      <Periods p={p} set={setP} />
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Spent" value={tk(spent)} sub="Paid out in this period" />
        <Kpi label="To pay" value={tk(toPay)} sub={<button onClick={() => go("list")} className="underline underline-offset-2">Unpaid bills and expenses</button>} tone={toPay ? "red" : undefined} />
        <Kpi label="Waiting approval" value={String(pending.length)} sub={`${tk(pending.reduce((s, e) => s + e.amount, 0))} · above ${tk(d.ex.st.limit)}`} tone={pending.length ? "amber" : undefined} />
        <Kpi label="Left after costs" value={tk(income - spent - payrollPaid)} sub={<>Received {tk(income)} − spent{d.payroll.length ? " − payroll" : ""}</>} />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <section className={clsx(card, "p-4")}>
          <h2 className="text-[15px] font-bold">Where the money went</h2>
          {cats.length === 0 ? <p className="mt-3 text-[14px] text-hms-muted">Nothing paid in this period.</p> : (
            <ul className="mt-3 space-y-2.5">{cats.slice(0, 8).map(([k, v]) => (
              <li key={k}><div className="flex justify-between text-[13.5px]"><span className="truncate pr-2">{k}</span><b className="tabular-nums">{tk(v)}</b></div>
                <div className="mt-1 h-2 rounded-full bg-hms-hover"><div className="h-2 rounded-full bg-hms-red" style={{ width: `${(v / max) * 100}%` }} /></div></li>
            ))}</ul>
          )}
        </section>
        <section className={clsx(card, "p-4")}>
          <div className="flex items-center justify-between"><h2 className="text-[15px] font-bold">Needs approval</h2>{pending.length > 0 && <span className="text-[13px] text-hms-muted">Above {tk(d.ex.st.limit)}</span>}</div>
          {pending.length === 0 ? <p className="mt-3 text-[14px] text-hms-muted">Nothing waiting.</p> : (
            <ul className="mt-2 divide-y divide-hms-line">{pending.map((e) => (
              <li key={e.id} className="flex items-center gap-2 py-2.5">
                <button onClick={() => open(e.id)} className="min-w-0 flex-1 text-left"><b className="block truncate text-[14px]">{e.title}</b><span className="text-[12.5px] text-hms-muted">{d.cat(e.category)} · {dmy(e.date)} · by {e.by}</span></button>
                <b className="tabular-nums">{tk(e.amount)}</b>
                <button onClick={() => { d.ex.approve(e.id); say(`Approved ${e.title}`); }} className={clsx(btnLine, "h-9 px-3")}><Check className="size-4" aria-hidden />Approve</button>
              </li>
            ))}</ul>
          )}
        </section>
      </div>
      {run && (
        <section className={clsx(card, "mt-3 flex flex-wrap items-center gap-4 p-4")}>
          <div className="min-w-0 flex-1"><h2 className="text-[15px] font-bold">Payroll · {run.r.label}</h2><p className="text-[13.5px] text-hms-muted">Staff salaries are run and paid in Staff. Shown here as a cost.</p></div>
          <div className="flex gap-5 text-[14px]"><span>Net <b className="tabular-nums">{tk(run.t.net)}</b></span><span>Paid <b className="tabular-nums text-hms-green">{tk(run.t.paid)}</b></span><span>Due <b className={clsx("tabular-nums", run.t.due > 0 && "text-hms-red")}>{tk(run.t.due)}</b></span></div>
          <Link href="/hms/staff/payroll" className={clsx(btnLine, "h-9")}>Open payroll<ChevronRight className="size-4" aria-hidden /></Link>
        </section>
      )}
    </>
  );
}

function List({ d, open }: { d: Data; open: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [st, setSt] = useState<"" | PayState | "Petty cash">("");
  const [cat, setCat] = useState("");
  const [p, setP] = useState<Period>("all");
  const [a, z] = range(p);
  const s = q.trim().toLowerCase();
  const rows = d.lines.filter((l) => l.date >= a && l.date <= z && (!st || l.state === st) && (!cat || l.category === cat) && (!s || [l.title, l.payee, l.id, l.e?.billNo ?? ""].some((x) => x.toLowerCase().includes(s))));
  const total = rows.reduce((t, l) => t + l.amount, 0), paid = rows.reduce((t, l) => t + l.paid, 0);
  const cats = [...new Set(d.lines.map((l) => l.category))].sort();
  const filtered = !!(q || st || cat);
  return (
    <>
      <Periods p={p} set={setP} />
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search expenses</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-hms-muted" aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, payee, bill no." className={clsx(input, "h-10 pl-9")} /></label>
        <select aria-label="Status" value={st} onChange={(e) => setSt(e.target.value as PayState)} className={sel}><option value="">All statuses</option>{(["Waiting approval", "To pay", "Partly paid", "Paid", "Rejected", "Petty cash"] as const).map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)} className={sel}><option value="">All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        {filtered && <button onClick={() => { setQ(""); setSt(""); setCat(""); }} className={clsx(btnLine, "h-10")}>Clear</button>}
      </div>
      <p className="mt-2 text-[13.5px] text-hms-muted">{rows.length} item{rows.length === 1 ? "" : "s"} · total {tk(total)} · paid {tk(paid)}</p>
      {rows.length === 0 ? <div className={clsx(card, "mt-2 p-8 text-center")}><p className="text-[15px] font-semibold">{filtered ? "No expenses match" : "No expenses yet"}</p><p className="mt-1 text-[14px] text-hms-muted">{filtered ? "Change or clear the filters." : "Add your first bill with New expense."}</p></div> : (
        <ul className={clsx(card, "mt-2 divide-y divide-hms-line")}>
          {rows.map((l) => {
            const body = <>
              <span className="min-w-0 flex-1"><b className="block truncate text-[14.5px]">{l.title}</b><span className="block truncate text-[13px] text-hms-muted">{l.e ? l.id : "Cashbox"} · {l.category}{l.payee !== "—" ? ` · ${l.payee}` : ""} · {dmy(l.date)}</span></span>
              <span className="text-right"><b className="block tabular-nums">{tk(l.amount)}</b><Chip s={l.state} /></span>
            </>;
            return <li key={l.id}>{l.e ? <button onClick={() => open(l.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f8f9fb]">{body}<ChevronRight className="size-4 shrink-0 text-hms-muted" aria-hidden /></button>
              : <Link href="/hms/cashbox/movements" className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8f9fb]">{body}<Wallet className="size-4 shrink-0 text-hms-muted" aria-label="Open in Cashbox" /></Link>}</li>;
          })}
        </ul>
      )}
    </>
  );
}

function Bills({ d, pay, open }: { d: Data; pay: (b: Bill) => void; open: (id: string) => void }) {
  const name = (id: string) => d.inv.st.suppliers.find((s) => s.id === id)?.name ?? id;
  return (
    <>
      <p className="text-[14px] text-hms-muted">Each goods-received note from Inventory is a bill to pay. <Link href="/hms/inventory/purchase" className="font-semibold text-hms-red underline underline-offset-2">Purchase orders</Link></p>
      {d.bills.length === 0 ? <div className={clsx(card, "mt-3 p-8 text-center text-[15px] font-semibold")}>No goods received yet.</div> : (
        <ul className={clsx(card, "mt-3 divide-y divide-hms-line")}>
          {d.bills.map((b) => {
            const s: PayState | "Unpaid" = b.e ? payState(b.e) : "Unpaid";
            const done = s === "Paid";
            return (
              <li key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1"><b className="block truncate text-[14.5px]">{name(b.supplier)}</b><span className="text-[13px] text-hms-muted">{b.id} · {b.po} · invoice {b.invoice || "—"} · {dmy(b.date)}</span></span>
                <span className="text-right"><b className="block tabular-nums">{tk(b.amount)}</b><Chip s={s} /></span>
                {done ? <button onClick={() => open(b.e!.id)} className={clsx(btnLine, "h-9")}>View</button> : <button onClick={() => pay(b)} className={clsx(btnPrimary, "h-9")}>Pay bill</button>}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Payees({ d, say }: { d: Data; say: (m: string) => void }) {
  const [edit, setEdit] = useState<Payee | null>(null);
  const used = (id: string) => d.ex.st.expenses.filter((e) => e.payee === id);
  const sup = can(d.h, "inventory") ? d.inv.st.suppliers : [];
  return (
    <>
      <div className="flex justify-end"><button onClick={() => setEdit({ id: d.ex.uid("p"), name: "", kind: "Supplier", phone: "" })} className={clsx(btnLine, "h-10")}><Plus className="size-4" aria-hidden />Add payee</button></div>
      <ul className={clsx(card, "mt-3 divide-y divide-hms-line")}>
        {d.ex.st.payees.filter((p) => !p.archived).map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1"><b className="block truncate text-[14.5px]">{p.name}</b><span className="text-[13px] text-hms-muted">{p.kind}{p.phone ? ` · ${p.phone}` : ""} · {used(p.id).length} expense{used(p.id).length === 1 ? "" : "s"} · {tk(used(p.id).reduce((s, e) => s + paidOf(e), 0))} paid</span></span>
            <button onClick={() => setEdit(p)} aria-label={`Edit ${p.name}`} className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover"><Pencil className="size-4" aria-hidden /></button>
          </li>
        ))}
        {sup.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1"><b className="block truncate text-[14.5px]">{s.name}</b><span className="text-[13px] text-hms-muted">Supplier · from Inventory{s.phone ? ` · ${s.phone}` : ""}</span></span>
            <Link href="/hms/inventory/setup" className="text-[13.5px] font-semibold text-hms-red underline underline-offset-2">Edit in Inventory</Link>
          </li>
        ))}
      </ul>
      {edit && <PayeeForm p={edit} onClose={() => setEdit(null)} save={(p) => { d.ex.savePayee(p); say(p.archived ? `Removed ${p.name}` : `Saved ${p.name}`); setEdit(null); }} isNew={!d.ex.st.payees.some((x) => x.id === edit.id)} />}
    </>
  );
}
function PayeeForm({ p, onClose, save, isNew }: { p: Payee; onClose: () => void; save: (p: Payee) => void; isNew: boolean }) {
  const [v, setV] = useState(p);
  const [err, setErr] = useState("");
  const ok = () => { if (!v.name.trim()) return setErr("Enter a name"); if (v.phone && !/^[+\d][\d\s-]{3,}$/.test(v.phone.trim())) return setErr("Check the phone number"); save({ ...v, name: v.name.trim(), phone: v.phone.trim() }); };
  return (
    <Sheet title={isNew ? "Add payee" : "Edit payee"} onClose={onClose} footer={<>{!isNew && <button onClick={() => save({ ...v, archived: true })} className={btnLine}>Remove</button>}<button onClick={ok} className={clsx(btnPrimary, "flex-1")}>Save</button></>}>
      <label className={lbl} htmlFor="py-name">Name</label><input id="py-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={input} />
      <label className={clsx(lbl, "mt-3")} htmlFor="py-kind">Type</label><select id="py-kind" value={v.kind} onChange={(e) => setV({ ...v, kind: e.target.value as PayeeKind })} className={input}>{(["Supplier", "Utility", "Contractor", "Staff", "Other"] as PayeeKind[]).map((k) => <option key={k}>{k}</option>)}</select>
      <label className={clsx(lbl, "mt-3")} htmlFor="py-phone">Phone</label><input id="py-phone" inputMode="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} className={input} />
      {err && <p role="alert" className="mt-3 text-[14px] font-semibold text-hms-red">{err}</p>}
    </Sheet>
  );
}

function Categories({ d, say }: { d: Data; say: (m: string) => void }) {
  const [name, setName] = useState("");
  const [lim, setLim] = useState(String(d.ex.st.limit));
  const [err, setErr] = useState("");
  const add = () => {
    const n = name.trim(); setErr("");
    if (!n) return setErr("Enter a category name");
    if (d.ex.st.categories.some((c) => !c.archived && c.name.toLowerCase() === n.toLowerCase())) return setErr("That category already exists");
    d.ex.saveCategory({ id: d.ex.uid("c"), name: n }); setName(""); say(`Added ${n}`);
  };
  const count = (c: Category) => d.ex.st.expenses.filter((e) => e.category === c.id).length;
  const limN = Number(lim);
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
      <section className={clsx(card, "p-4")}>
        <h2 className="text-[15px] font-bold">Categories</h2>
        <div className="mt-3 flex gap-2"><label className="sr-only" htmlFor="cat-new">New category</label><input id="cat-new" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="New category" className={clsx(input, "h-10")} /><button onClick={add} className={clsx(btnLine, "h-10")}><Plus className="size-4" aria-hidden />Add</button></div>
        {err && <p role="alert" className="mt-2 text-[14px] font-semibold text-hms-red">{err}</p>}
        <ul className="mt-3 divide-y divide-hms-line">
          {d.ex.st.categories.filter((c) => !c.archived).map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-2.5"><span className="flex-1 text-[14.5px]">{c.name}</span><span className="text-[13px] text-hms-muted">{count(c)} used</span>
              <button onClick={() => { d.ex.saveCategory({ ...c, archived: true }); say(`Archived ${c.name}`); }} aria-label={`Archive ${c.name}`} className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover"><X className="size-4" aria-hidden /></button></li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-hms-muted">Petty cash uses the Cashbox categories. Archived categories stay on old expenses.</p>
      </section>
      <section className={clsx(card, "h-fit p-4")}>
        <h2 className="text-[15px] font-bold">Approval rule</h2>
        <p className="mt-1 text-[13.5px] text-hms-muted">Expenses above this amount wait for a manager before they can be paid.</p>
        <label htmlFor="lim" className={clsx(lbl, "mt-3")}>Approve above (৳)</label>
        <input id="lim" inputMode="numeric" value={lim} onChange={(e) => setLim(e.target.value.replace(/\D/g, ""))} className={input} />
        {lim !== "" && (limN < 500 || limN > 1000000) && <p className="mt-2 text-[13.5px] font-semibold text-hms-red">Use ৳500 to ৳10,00,000</p>}
        <button disabled={lim === "" || limN === d.ex.st.limit || limN < 500 || limN > 1000000} onClick={() => { d.ex.setLimit(limN); say(`Approval limit ${tk(limN)}`); }} className={clsx(btnPrimary, "mt-3 w-full")}>Save rule</button>
        <p className="mt-3 text-[13px] text-hms-muted">Cashbox cash-outs use their own limit ({tk(5000)}).</p>
      </section>
    </div>
  );
}

function Activity({ d, open }: { d: Data; open: (id: string) => void }) {
  const rows = d.ex.st.log.slice(0, 100);
  return rows.length === 0 ? <div className={clsx(card, "p-8 text-center text-[15px] font-semibold")}>No activity yet.</div> : (
    <ul className={clsx(card, "divide-y divide-hms-line")}>
      {rows.map((l, i) => (
        <li key={i} className="flex items-start gap-3 px-4 py-2.5 text-[14px]">
          <span className="w-[150px] shrink-0 text-[13px] text-hms-muted">{dmy(l.at.slice(0, 10))} · {timeOf(l.at)}</span>
          <span className="min-w-0 flex-1">{l.text}<span className="text-hms-muted"> · {l.by}</span></span>
          {l.ref && d.ex.st.expenses.some((e) => e.id === l.ref) && <button onClick={() => open(l.ref!)} className="shrink-0 text-[13px] font-semibold text-hms-red underline underline-offset-2">{l.ref}</button>}
        </li>
      ))}
    </ul>
  );
}

function ExpenseForm({ d, e, onClose, done }: { d: Data; e?: Expense; onClose: () => void; done: (id: string, msg: string) => void }) {
  const cats = d.ex.st.categories.filter((c) => !c.archived || c.id === e?.category);
  const [v, setV] = useState<NewExpense>(e ? { title: e.title, date: e.date, category: e.category, payee: e.payee, amount: e.amount, note: e.note, billNo: e.billNo } : { title: "", date: TODAY, category: cats[0]?.id ?? "", payee: undefined, amount: 0, note: "", billNo: "" });
  const [amt, setAmt] = useState(e ? String(e.amount) : "");
  const [err, setErr] = useState("");
  const n = Number(amt) || 0;
  const save = () => {
    setErr("");
    if (!v.title.trim()) return setErr("Enter what the expense is for");
    if (n <= 0) return setErr("Enter the amount");
    if (n > 10000000) return setErr("Amount looks too large");
    if (!v.date || v.date > TODAY) return setErr("Date can't be in the future");
    if (!v.category) return setErr("Pick a category");
    const x = { ...v, title: v.title.trim(), amount: n, note: v.note?.trim() || undefined, billNo: v.billNo?.trim() || undefined };
    if (e) { d.ex.edit(e.id, x); done(e.id, "Expense updated"); return; }
    const id = d.ex.add(x);
    done(id, n > d.ex.st.limit ? "Saved · waiting for approval" : "Expense saved");
  };
  return (
    <Sheet title={e ? "Edit expense" : "New expense"} onClose={onClose} footer={<button onClick={save} className={clsx(btnPrimary, "flex-1")}>{e ? "Save changes" : "Save expense"}</button>}>
      <label className={lbl} htmlFor="ex-title">What for</label><input id="ex-title" value={v.title} onChange={(x) => setV({ ...v, title: x.target.value })} placeholder="e.g. Electricity bill — November" className={input} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div><label className={lbl} htmlFor="ex-amt">Amount (৳)</label><input id="ex-amt" inputMode="numeric" value={amt} onChange={(x) => setAmt(x.target.value.replace(/[^\d]/g, ""))} className={input} /></div>
        <div><label className={lbl} htmlFor="ex-date">Date</label><input id="ex-date" type="date" max={TODAY} value={v.date} onChange={(x) => setV({ ...v, date: x.target.value })} className={input} /></div>
      </div>
      {n > d.ex.st.limit && <p className="mt-2 text-[13.5px] font-medium text-hms-amber">Above {tk(d.ex.st.limit)} — a manager approves before it can be paid.</p>}
      <label className={clsx(lbl, "mt-3")} htmlFor="ex-cat">Category</label><select id="ex-cat" value={v.category} onChange={(x) => setV({ ...v, category: x.target.value })} className={input}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <label className={clsx(lbl, "mt-3")} htmlFor="ex-payee">Paid to (optional)</label>
      <select id="ex-payee" value={v.payee ?? ""} onChange={(x) => setV({ ...v, payee: x.target.value || undefined })} className={input}><option value="">—</option>{d.ex.st.payees.filter((p) => !p.archived || p.id === v.payee).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}{can(d.h, "inventory") && d.inv.st.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name} (Inventory)</option>)}</select>
      <label className={clsx(lbl, "mt-3")} htmlFor="ex-bill">Bill / receipt no. (optional)</label><input id="ex-bill" value={v.billNo ?? ""} onChange={(x) => setV({ ...v, billNo: x.target.value })} className={input} />
      <label className={clsx(lbl, "mt-3")} htmlFor="ex-note">Note (optional)</label><textarea id="ex-note" rows={2} value={v.note ?? ""} onChange={(x) => setV({ ...v, note: x.target.value })} className={clsx(input, "h-auto py-2")} />
      {err && <p role="alert" className="mt-3 text-[14px] font-semibold text-hms-red">{err}</p>}
    </Sheet>
  );
}

function Detail({ d, e, onClose, edit, pay, say }: { d: Data; e: Expense; onClose: () => void; edit: () => void; pay: () => void; say: (m: string) => void }) {
  const [why, setWhy] = useState<string | null>(null);
  const s = payState(e);
  const rows: [string, string][] = [["Status", s], ["Amount", tk(e.amount)], ["Paid", tk(paidOf(e))], ["Category", d.cat(e.category)], ["Paid to", d.payee(e.payee)], ["Date", dmy(e.date)], ["Bill / receipt no.", e.billNo ?? "—"], ["Added by", e.by], ...(e.approvedBy ? [["Approved by", e.approvedBy] as [string, string]] : []), ...(e.grn ? [["Supplier bill", e.grn] as [string, string]] : [])];
  return (
    <Sheet title={e.title} sub={`${e.id} · ${STATUS_LABEL[e.status]}`} onClose={onClose}
      footer={e.status === "pending" ? (why === null ? <>
        <button onClick={() => setWhy("")} className={btnLine}>Reject</button>
        <button onClick={() => { d.ex.approve(e.id); say("Approved"); }} className={clsx(btnPrimary, "flex-1")}><Check className="size-4" aria-hidden />Approve</button>
      </> : <>
        <button onClick={() => setWhy(null)} className={btnLine}>Back</button>
        <button disabled={!why.trim()} onClick={() => { d.ex.reject(e.id, why.trim()); say("Rejected"); setWhy(null); }} className={clsx(btnPrimary, "flex-1")}>Reject expense</button>
      </>) : <>
        {!e.payments.length && e.status !== "rejected" && !e.grn && <button onClick={edit} className={btnLine}><Pencil className="size-4" aria-hidden />Edit</button>}
        {dueOf(e) > 0 ? <button onClick={pay} className={clsx(btnPrimary, "flex-1")}>Pay {tk(dueOf(e))}</button> : <button onClick={onClose} className={clsx(btnLine, "flex-1")}>Close</button>}
      </>}>
      {e.status === "pending" && why === null && <p className="mb-3 flex items-start gap-2 rounded-xl bg-hms-amber-soft p-3 text-[13.5px] text-hms-amber"><Lock className="mt-0.5 size-4 shrink-0" aria-hidden />Above {tk(d.ex.st.limit)}. A manager approves it before anyone can pay.</p>}
      {why !== null && <div className="mb-3"><label htmlFor="rej" className={lbl}>Why reject?</label><input id="rej" autoFocus value={why} onChange={(x) => setWhy(x.target.value)} className={input} placeholder="e.g. Get a second quote" /></div>}
      {e.rejectReason && <p className="mb-3 rounded-xl bg-hms-hover p-3 text-[13.5px]">Rejected: {e.rejectReason}</p>}
      <dl className="divide-y divide-hms-line text-[14.5px]">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-hms-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
      {e.note && <p className="mt-3 rounded-xl bg-hms-canvas p-3 text-[14px]">{e.note}</p>}
      {e.payments.length > 0 && <>
        <h3 className="mt-5 text-[14px] font-bold">Payments</h3>
        <ul className="mt-1 divide-y divide-hms-line">{e.payments.map((p) => <li key={p.id} className="flex justify-between py-2 text-[14px]"><span>{dmy(p.at.slice(0, 10))} · {p.method}{p.ref ? ` · ${p.ref}` : ""}{p.method === "Cash" ? <span className="text-hms-muted"> · from Cashbox</span> : null}</span><b className="tabular-nums">{tk(p.amount)}</b></li>)}</ul>
      </>}
    </Sheet>
  );
}

function PaySheet({ d, e, onClose, done }: { d: Data; e: Expense; onClose: () => void; done: (m: string) => void }) {
  const due = dueOf(e);
  const [amt, setAmt] = useState(String(due));
  const [m, setM] = useState<Method>("Cash");
  const [ref, setRef] = useState("");
  const [err, setErr] = useState("");
  const go = () => {
    setErr("");
    const a = Number(amt) || 0;
    if (a <= 0) return setErr("Enter an amount");
    if (a > due) return setErr(`Only ${tk(due)} is left to pay`);
    if (m !== "Cash" && m !== "Card" && !ref.trim()) return setErr(m === "Bank" ? "Enter the bank / cheque reference" : "Enter the bKash transaction ID");
    if (m === "Cash") { const x = postExpenseOut(d.h, d.cbx.refs, { amount: a, ref: e.id, party: d.payee(e.payee) !== "—" ? d.payee(e.payee) : undefined, category: d.cat(e.category), note: e.title }); if (x) return setErr(x); }
    d.ex.pay(e.id, a, m, ref.trim() || undefined);
    done(`Paid ${tk(a)} · ${m}`);
  };
  return (
    <Sheet title={`Pay ${e.title}`} sub={`${e.id} · ${tk(due)} to pay`} onClose={onClose} footer={<button onClick={go} className={clsx(btnPrimary, "flex-1")}>Record payment{Number(amt) > 0 ? ` ${tk(Number(amt))}` : ""}</button>}>
      <label htmlFor="xp-amt" className={lbl}>Amount (৳)</label><input id="xp-amt" autoFocus inputMode="numeric" value={amt} onChange={(x) => setAmt(x.target.value.replace(/\D/g, ""))} className={input} />
      <p className={clsx(lbl, "mt-3")} id="xp-m">Method</p>
      <div role="radiogroup" aria-labelledby="xp-m" className="grid grid-cols-4 gap-2">{METHODS.map((k) => <button key={k} type="button" role="radio" aria-checked={m === k} onClick={() => setM(k)} className={clsx("h-11 rounded-lg border text-[14px] font-semibold", m === k ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line")}>{k}</button>)}</div>
      <p className="mt-2 text-[13px] text-hms-muted">{m === "Cash" ? "Taken out of the main Cashbox." : "Recorded only — no bank or gateway connection in this prototype."}</p>
      {m !== "Cash" && <><label htmlFor="xp-ref" className={clsx(lbl, "mt-3")}>{m === "bKash" ? "Transaction ID" : m === "Bank" ? "Bank / cheque reference" : "Reference (optional)"}</label><input id="xp-ref" value={ref} onChange={(x) => setRef(x.target.value)} className={input} /></>}
      {err && <p role="alert" className="mt-3 text-[14px] font-semibold text-hms-red">{err}</p>}
    </Sheet>
  );
}

function BillSheet({ d, b, onClose, done }: { d: Data; b: Bill; onClose: () => void; done: (id: string) => void }) {
  const sup = d.inv.st.suppliers.find((s) => s.id === b.supplier);
  const cat = d.ex.st.categories.find((c) => /supplies/i.test(c.name)) ?? d.ex.st.categories[0];
  const po = d.inv.st.pos.find((p) => p.id === b.po);
  const item = (id: string) => d.inv.items.find((i) => i.id === id)?.name ?? id;
  const g = po?.grns.find((x) => x.id === b.id);
  return (
    <Sheet title={`Bill from ${sup?.name ?? "supplier"}`} sub={`${b.id} · ${b.po} · ${dmy(b.date)}`} onClose={onClose}
      footer={<button onClick={() => { const id = d.ex.add({ title: `${sup?.name ?? "Supplier"} · ${b.id}`, date: b.date, category: cat.id, payee: b.supplier, amount: b.amount, billNo: b.invoice || undefined, grn: b.id }, true); done(id); }} className={clsx(btnPrimary, "flex-1")}>Pay this bill</button>}>
      <ul className="divide-y divide-hms-line text-[14px]">{g?.lines.map((l) => { const c = po?.lines.find((x) => x.item === l.item)?.cost ?? 0; return <li key={l.item} className="flex justify-between py-2"><span>{item(l.item)} × {l.qty}</span><b className="tabular-nums">{tk(l.qty * c)}</b></li>; })}</ul>
      <div className="mt-2 flex justify-between border-t border-hms-line pt-3 text-[15px] font-bold"><span>Total</span><span className="tabular-nums">{tk(b.amount)}</span></div>
      <p className="mt-3 text-[13.5px] text-hms-muted">The purchase order was approved in Inventory, so this bill is ready to pay.</p>
    </Sheet>
  );
}

/** Every payment out for costs (expense payments + petty cash), for Reports. Payroll is separate (Staff). */
export function useSpentRows() {
  const h = useProperty();
  const ex = useExpenses(h);
  const inv = useInventory(h);
  const cbx = useCashboxData();
  return useMemo(() => {
    const cat = (id: string) => ex.st.categories.find((c) => c.id === id)?.name ?? id;
    const payee = (id?: string) => (id ? ex.st.payees.find((p) => p.id === id)?.name ?? inv.st.suppliers.find((s) => s.id === id)?.name ?? "—" : "—");
    return [
      ...ex.st.expenses.flatMap((e) => e.payments.map((p) => ({ date: p.at.slice(0, 10), category: cat(e.category), payee: payee(e.payee), amount: p.amount, method: p.method as string, title: e.title, src: "expense" as const }))),
      ...cbx.cb.st.moves.filter((m) => m.kind === "out" && m.reason === "petty" && !m.reversedBy && !m.reverses).map((m) => ({ date: m.day, category: PETTY_CAT[m.category ?? ""] ?? m.category ?? "Other", payee: m.party ?? "—", amount: m.amount, method: "Cash", title: m.note || "Petty cash", src: "petty" as const })),
    ];
  }, [ex.st, inv.st.suppliers, cbx.cb.st.moves]);
}
