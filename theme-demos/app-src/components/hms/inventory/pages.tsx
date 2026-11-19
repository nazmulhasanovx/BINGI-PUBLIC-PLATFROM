"use client";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Check, ChevronRight, CircleMinus, Clock, Download, History, Landmark, MoreHorizontal, Package, Pencil, Plus, Printer, Search, ShieldCheck, ShoppingCart, Store, Tag, TriangleAlert, Warehouse, X } from "lucide-react";
import { CAN, KIND_LABEL, MAIN, MOVE_LABEL, ROLE_LABEL, TODAY, at, fmtQty, inBuy, statusOf, tk, type Item, type Move, type MoveType, type Role, type StockStatus } from "@/lib/inventory/store";
import { btnLine, btnPrimary } from "../guests/ui";
import { imgSrc } from "@/lib/img";
import { InventoryFrame, StorePicker, useInv } from "./frame";

const card = "rounded-xl border border-hms-line bg-white";
const sel = "h-10 rounded-lg border border-hms-line bg-white px-3 text-[14px] outline-none focus:border-hms-ink";
const TONE: Record<string, string> = { "In stock": "bg-[#e5f5ec] text-[#16693a]", "Low stock": "bg-[#fdf3d9] text-[#7a5200]", "Out of stock": "bg-[#fde8e8] text-[#a11d2a]" };
const MOVE_TONE: Record<MoveType, string> = { opening: "bg-hms-hover text-[#4d5664]", receive: "bg-[#e5f5ec] text-[#16693a]", issue: "bg-[#e8f0fe] text-[#1d4ed8]", wastage: "bg-[#fdf3d9] text-[#7a5200]", adjust: "bg-[#eeebfc] text-[#5b44c9]", transfer: "bg-[#e3f4fa] text-[#155e75]", consume: "bg-[#fdefe7] text-[#9a3f12]" };
export const Pill = ({ tone, children }: { tone: string; children: React.ReactNode }) => <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[12.5px] font-semibold", tone)}><span className="size-1.5 rounded-full bg-current" />{children}</span>;
const ICON_TONE: Record<string, string> = { c1: "bg-[#f1edff] text-[#6b55e0]", c2: "bg-[#e8f0fe] text-[#1d4ed8]", c3: "bg-[#fdefe7] text-[#d9622b]", c4: "bg-[#e5f5ec] text-[#1c7d45]" };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (iso: string) => `${iso.slice(8, 10)} ${MON[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
const time = (iso: string) => { const [H, M] = iso.slice(11, 16).split(":").map(Number); return `${String(H % 12 || 12).padStart(2, "0")}:${String(M).padStart(2, "0")} ${H >= 12 ? "PM" : "AM"}`; };
const signed = (n: number, u: string) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmtQty(Math.abs(n), u)}`;

function Search_({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-hms-line bg-white px-3 focus-within:border-hms-ink sm:flex-none">
      <Search className="size-4 text-hms-muted" /><span className="sr-only">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search item or SKU" className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none" />
    </label>
  );
}

// ---------------- Stock ----------------
export function StockPage() { return <InventoryFrame tab="stock"><Stock /></InventoryFrame>; }
/** Stock status in one store: the reorder level is a property-wide rule, so outlets only show "Out" at 0. */
const statusIn = (i: Item, store: string): StockStatus => (!store ? statusOf(i) : at(i, store) <= 0 ? "Out of stock" : store === MAIN && i.qty <= i.reorder ? "Low stock" : "In stock");
function Stock() {
  const { inv, open, store } = useInv();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [st, setSt] = useState<StockStatus | "">("");
  const cats = new Map(inv.st.categories.map((c) => [c.id, c.name]));
  const sups = new Map(inv.st.suppliers.map((s) => [s.id, s.name]));
  const short = new Map(inv.st.stores.map((s) => [s.id, s.name.replace(/ Store$/, "")]));
  const scope = inv.items.filter((i) => !store || store === MAIN || store in i.stock);
  const list = scope.filter((i) => (!cat || i.category === cat) && (!st || statusIn(i, store) === st) && (!q || `${i.name} ${i.sku}`.toLowerCase().includes(q.toLowerCase())));
  const low = scope.filter((i) => statusIn(i, store) === "Low stock").length, out = scope.filter((i) => statusIn(i, store) === "Out of stock").length;
  const value = scope.reduce((t, i) => t + at(i, store) * i.cost, 0);
  const kpis: [string, string, string, typeof Package, string, StockStatus | ""][] = [
    ["Active Items", String(scope.length), `Stock value ${tk(Math.round(value))}`, Package, "bg-[#f1edff] text-[#6b55e0]", ""],
    ["Low Stock", String(low), store && store !== MAIN ? "Uses the property-wide reorder level" : "At or below reorder level", TriangleAlert, "bg-[#fdf3d9] text-[#a76f00]", "Low stock"],
    ["Out of Stock", String(out), store ? "Zero in this store" : "Zero available", CircleMinus, "bg-[#fde8e8] text-[#b11c29]", "Out of stock"],
  ];
  const pending = inv.st.approvals.filter((a) => a.status === "pending");
  return (
    <>
      {pending.length > 0 && <Approvals />}
      {inv.suggestions.length > 0 && (
        <Link href="/hms/inventory/purchase" className={clsx(card, "mb-4 flex items-center gap-3 px-4 py-3 hover:bg-hms-hover")}>
          <span className="grid size-9 place-items-center rounded-lg bg-[#fdf3d9] text-[#a76f00]"><ShoppingCart className="size-4" aria-hidden /></span>
          <span className="flex-1 text-[14px]"><b>{inv.suggestions.length} item{inv.suggestions.length > 1 ? "s" : ""} to reorder</b> <span className="text-hms-muted">— suggested quantities are ready as purchase orders</span></span>
          <ChevronRight className="size-4 text-hms-muted" aria-hidden />
        </Link>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        {kpis.map(([l, v, sub, I, tone, f]) => (
          <button key={l} onClick={() => setSt(st === f ? "" : f)} aria-pressed={!!f && st === f} className={clsx(card, "flex items-center gap-4 p-4 text-left transition-shadow hover:shadow-[0_2px_10px_-4px_rgb(0_0_0/0.15)]", f && st === f && "border-[#e9b949] ring-2 ring-[#e9b949]/30")}>
            <span className={clsx("grid size-11 shrink-0 place-items-center rounded-xl", tone)}><I className="size-5" /></span>
            <span className="flex-1"><span className="block text-[13.5px] font-semibold">{l}</span><span className="block text-[24px] font-bold leading-tight tabular-nums">{v}</span><span className="text-[12.5px] text-hms-muted">{sub}</span></span>
            <ChevronRight className="size-4 text-hms-muted" />
          </button>
        ))}
      </div>
      <section className={clsx(card, "mt-4 overflow-hidden")}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="mr-auto"><h2 className="text-[17px] font-bold">Stock Items</h2><p className="text-[13px] text-hms-muted">{store ? `On hand in ${inv.st.stores.find((x) => x.id === store)?.name}` : "On hand across all stores"}</p></div>
          <StorePicker />
          <Search_ value={q} onChange={setQ} label="Search stock items" />
          <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)} className={sel}><option value="">All categories</option>{inv.st.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          {st ? <button onClick={() => setSt("")} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#e9b949] bg-[#fffaf0] px-3 text-[14px] font-medium">{st}<X className="size-3.5" /><span className="sr-only">Clear status filter</span></button>
            : <select aria-label="Status" value={st} onChange={(e) => setSt(e.target.value as StockStatus | "")} className={sel}><option value="">All statuses</option><option>In stock</option><option>Low stock</option><option>Out of stock</option></select>}
        </div>
        {inv.items.length === 0 ? (
          <div className="border-t border-hms-line px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-hms-coral-soft text-hms-red"><Package className="size-6" /></span>
            <p className="mt-4 text-[18px] font-bold">Add your first item</p>
            <p className="mt-1 text-[14px] text-hms-muted">Start with an item you already keep in stock, such as guest soap or bath towels.</p>
            <button onClick={() => open({ k: "item" })} className={clsx(btnPrimary, "mt-4")}><Plus className="size-4" />Add your first item</button>
          </div>
        ) : list.length === 0 ? (
          <div className="border-t border-hms-line px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-hms-hover text-hms-muted"><Search className="size-5" /></span>
            <p className="mt-3 text-[16px] font-semibold">No items found</p>
            <p className="mt-1 text-[14px] text-hms-muted">{q ? `Nothing matches “${q}”.` : store && !scope.length ? "Nothing is kept in this store yet — transfer stock into it." : "Nothing matches these filters."}</p>
            <button onClick={() => { setQ(""); setCat(""); setSt(""); }} className={clsx(btnLine, "mt-4")}>Clear search</button>
          </div>
        ) : (
          <>
          <ul className="divide-y divide-hms-line border-t border-hms-line md:hidden" aria-label="Stock items">
            {list.map((i) => { const n = at(i, store); return (
              <li key={i.id} className="flex items-center gap-3 px-4 py-3">
                <ItemThumb i={i} big />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{i.name}</span>
                  <span className="block text-[12.5px] text-hms-muted">{i.sku} · {cats.get(i.category) ?? "—"}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2"><b className="tabular-nums">{fmtQty(n, i.unit)}</b><Pill tone={TONE[statusIn(i, store)]}>{statusIn(i, store)}</Pill></span>
                </span>
                <RowMenu item={i} />
              </li>); })}
          </ul>
          <div className="hidden overflow-x-auto border-t border-hms-line md:block" tabIndex={0} role="region" aria-label="Stock items">
            <table className="w-full min-w-[920px] text-[14px]">
              <thead><tr className="text-left text-[12.5px] text-hms-muted">
                <th className="px-5 py-2.5 font-medium">Item / SKU</th><th className="px-3 py-2.5 font-medium">Category</th><th className="px-3 py-2.5 font-medium">Default Supplier</th>
                <th className="px-3 py-2.5 text-right font-medium">Available</th><th className="px-3 py-2.5 text-right font-medium">On order</th><th className="px-3 py-2.5 font-medium">Stock Status</th><th className="px-3 py-2.5 text-right font-medium">Avg. Cost</th><th className="px-5 py-2.5 text-right font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {list.map((i) => {
                  const n = at(i, store), oo = inv.onOrder.get(i.id) ?? 0;
                  const split = Object.entries(i.stock).filter(([, v]) => v !== 0);
                  return (
                    <tr key={i.id} className="border-t border-hms-line">
                      <td className="px-5 py-2.5"><span className="flex items-center gap-3"><ItemThumb i={i} /><span><span className="block font-semibold">{i.name}</span><span className="text-[12.5px] text-hms-muted">{i.sku}{i.buyUnit ? ` · 1 ${i.buyUnit} = ${i.perBuy} ${i.unit}` : ""}</span></span></span></td>
                      <td className="px-3 py-2.5">{cats.get(i.category) ?? "—"}</td>
                      <td className="px-3 py-2.5">{sups.get(i.supplier) ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right"><span className="block font-bold tabular-nums">{fmtQty(n, i.unit)}</span>{!store && split.length > 1 ? <span className="text-[12px] text-hms-muted">{split.map(([k, v]) => `${short.get(k)} ${v}`).join(" · ")}</span> : inBuy(i, n) ? <span className="text-[12px] text-hms-muted">{inBuy(i, n)}</span> : null}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-hms-muted">{oo ? fmtQty(oo, i.unit) : "—"}</td>
                      <td className="px-3 py-2.5"><Pill tone={TONE[statusIn(i, store)]}>{statusIn(i, store)}</Pill></td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">{tk(i.cost)}</td>
                      <td className="px-5 py-2.5 text-right"><RowMenu item={i} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
        {inv.items.length > 0 && list.length > 0 && <p className="border-t border-hms-line px-5 py-3 text-[13px] text-hms-muted">Showing {list.length} of {scope.length} items</p>}
      </section>
    </>
  );
}

/** Item photo when one was added, otherwise a tinted box icon. */
function ItemThumb({ i, big }: { i: Item; big?: boolean }) {
  const sz = big ? "size-12 rounded-xl" : "size-10 rounded-lg";
  // eslint-disable-next-line @next/next/no-img-element -- uploaded data URL
  if (i.photo) return <img src={imgSrc(i.photo)} alt="" className={clsx(sz, "shrink-0 object-cover")} />;
  return <span className={clsx("grid shrink-0 place-items-center", sz, ICON_TONE[i.category] ?? "bg-hms-hover text-hms-muted")}><Package className="size-4" /></span>;
}

/** Wastage / adjustments above the approval limit, recorded by a store keeper. */
function Approvals() {
  const { inv, toast } = useInv();
  const [err, setErr] = useState("");
  const items = new Map(inv.st.items.map((i) => [i.id, i]));
  const stores = new Map(inv.st.stores.map((s) => [s.id, s.name]));
  const list = inv.st.approvals.filter((a) => a.status === "pending");
  const can = CAN.approve(inv.role);
  return (
    <section className={clsx(card, "mb-4 overflow-hidden border-[#f1dfb8]")} aria-labelledby="appr">
      <div className="flex items-center gap-3 bg-[#fdf8ec] px-5 py-3"><Clock className="size-4 text-[#a76f00]" aria-hidden /><h2 id="appr" className="flex-1 text-[15px] font-bold">Waiting for approval · {list.length}</h2>{!can && <span className="text-[13px] text-[#6b4309]">A manager approves these</span>}</div>
      <ul>{list.map((a) => { const it = items.get(a.item); return (
        <li key={a.id} className="flex flex-wrap items-center gap-3 border-t border-hms-line px-5 py-3">
          <span className="min-w-[220px] flex-1 basis-full sm:basis-auto"><span className="block font-semibold">{a.kind === "wastage" ? "Wastage" : "Adjust to"} {fmtQty(a.amount, it?.unit ?? "")} · {it?.name}</span><span className="text-[13px] text-hms-muted">{stores.get(a.store)} · worth {tk(a.value)} · “{a.note}” · {a.by}</span></span>
          {can && <><button onClick={() => { const e = inv.decide(a.id, false); setErr(e ?? ""); if (!e) toast("Rejected — stock unchanged"); }} className={clsx(btnLine, "h-9 px-3")}><X className="size-4" />Reject</button>
            <button onClick={() => { const e = inv.decide(a.id, true); setErr(e ?? ""); if (!e) toast(`Approved — ${it?.name} updated`); }} className={clsx(btnPrimary, "h-9 px-3")}><Check className="size-4" />Approve</button></>}
        </li>
      ); })}</ul>
      {err && <p className="border-t border-hms-line px-5 py-2 text-[13px] font-medium text-[#c81e1e]">{err}</p>}
    </section>
  );
}

function RowMenu({ item }: { item: Item }) {
  const { inv, open } = useInv();
  const [m, setM] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!m) return;
    const c = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setM(false); };
    document.addEventListener("mousedown", c);
    return () => document.removeEventListener("mousedown", c);
  }, [m]);
  const acts: [string, () => void][] = [
    ["Receive stock", () => open({ k: "move", type: "receive", item: item.id })],
    ["Issue stock", () => open({ k: "move", type: "issue", item: item.id })],
    ["Transfer", () => open({ k: "transfer", item: item.id })],
    ["Record wastage", () => open({ k: "move", type: "wastage", item: item.id })],
    ["Adjust stock", () => open({ k: "move", type: "adjust", item: item.id })],
    ["Edit item", () => open({ k: "item", item })],
    ["Archive item", () => { if (confirm(`Archive ${item.name}? Its history is kept.`)) inv.archiveItem(item.id); }],
  ];
  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setM((x) => !x)} aria-haspopup="menu" aria-expanded={m} aria-label={`Actions for ${item.name}`} className="grid size-8 place-items-center rounded-lg hover:bg-hms-hover"><MoreHorizontal className="size-4" /></button>
      {m && <div role="menu" className="hms-pop absolute right-0 top-9 z-20 w-48 rounded-xl border border-hms-line bg-white p-1 text-left shadow-lg">{acts.map(([l, f], k) => <button key={l} role="menuitem" onClick={() => { setM(false); f(); }} className={clsx("block w-full rounded-lg px-3 py-2 text-left text-[14px] hover:bg-hms-hover", k === 5 && "border-t border-hms-line", k === 6 && "text-[#c81e1e]")}>{l}</button>)}</div>}
    </div>
  );
}

// ---------------- History ----------------
export function HistoryPage() { return <InventoryFrame tab="history"><HistoryView /></InventoryFrame>; }
function HistoryView() {
  const { inv, store } = useInv();
  const [q, setQ] = useState("");
  const [t, setT] = useState<MoveType | "">("");
  const [d, setD] = useState(TODAY);
  const items = new Map(inv.st.items.map((i) => [i.id, i]));
  const stores = new Map(inv.st.stores.map((x) => [x.id, x.name]));
  const list = inv.st.moves.filter((m) => (!store || m.store === store) && (!t || m.type === t) && (!d || m.at.startsWith(d)) && (!q || `${items.get(m.item)?.name} ${items.get(m.item)?.sku}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <section className={clsx(card, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <div className="mr-auto"><h2 className="text-[17px] font-bold">Movement History</h2><p className="text-[13px] text-hms-muted">Track stock changes and who recorded them.</p></div>
        <StorePicker />
        <Search_ value={q} onChange={setQ} label="Search movements" />
        <select aria-label="Movement type" value={t} onChange={(e) => setT(e.target.value as MoveType | "")} className={sel}><option value="">All movements</option>{(Object.keys(MOVE_LABEL) as MoveType[]).map((k) => <option key={k} value={k}>{MOVE_LABEL[k]}</option>)}</select>
        <input type="date" aria-label="Date" value={d} onChange={(e) => setD(e.target.value)} className={sel} />
        {d && <button onClick={() => setD("")} className="text-[13.5px] font-semibold text-hms-red">All dates</button>}
      </div>
      {list.length ? (
        <div className="overflow-x-auto border-t border-hms-line" tabIndex={0} role="region" aria-label="Movements">
          <table className="w-full min-w-[980px] text-[14px]">
            <thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2.5 font-medium">Date / Time</th><th className="px-3 py-2.5 font-medium">Item / SKU</th><th className="px-3 py-2.5 font-medium">Movement</th><th className="px-3 py-2.5 font-medium">Store</th><th className="px-3 py-2.5 text-right font-medium">Change</th><th className="px-3 py-2.5 text-right font-medium">Store Balance</th><th className="px-3 py-2.5 font-medium">Reference / Note</th><th className="px-5 py-2.5 font-medium">Recorded By</th></tr></thead>
            <tbody>{list.map((m) => <MoveRow key={m.id} m={m} it={items.get(m.item)} store={stores.get(m.store) ?? "Main Store"} />)}</tbody>
          </table>
        </div>
      ) : <p className="border-t border-hms-line px-5 py-12 text-center text-[14px] text-hms-muted">No movements {d ? `on ${day(d)}` : ""} for these filters.</p>}
      <p className="border-t border-hms-line px-5 py-3 text-[13px] text-hms-muted">{list.length} movement{list.length === 1 ? "" : "s"} · Asia/Dhaka · history can’t be edited or deleted</p>
    </section>
  );
}
function MoveRow({ m, it, store }: { m: Move; it?: Item; store: string }) {
  const u = it?.unit ?? "";
  return (
    <tr className="border-t border-hms-line">
      <td className="whitespace-nowrap px-5 py-2.5"><span className="block font-semibold">{time(m.at)}</span><span className="text-[12.5px] text-hms-muted">{day(m.at)}</span></td>
      <td className="px-3 py-2.5"><span className="block font-semibold">{it?.name ?? "Removed item"}</span><span className="text-[12.5px] text-hms-muted">{it?.sku}</span></td>
      <td className="px-3 py-2.5"><Pill tone={MOVE_TONE[m.type]}>{MOVE_LABEL[m.type]}</Pill></td>
      <td className="whitespace-nowrap px-3 py-2.5">{store}</td>
      <td className={clsx("whitespace-nowrap px-3 py-2.5 text-right font-bold tabular-nums", m.change > 0 ? "text-[#16693a]" : "")}>{signed(m.change, u)}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">{fmtQty(m.balance, u)}</td>
      <td className="max-w-[260px] px-3 py-2.5">{m.ref && <span className="block font-mono text-[13px]">{m.ref}</span>}{m.note && <span className={m.ref ? "text-[12.5px] text-hms-muted" : ""}>{m.note}</span>}{!m.ref && !m.note && "—"}</td>
      <td className="whitespace-nowrap px-5 py-2.5 text-[#4d5664]">{m.by}</td>
    </tr>
  );
}

// ---------------- Reports ----------------
export function ReportsPage() { return <InventoryFrame tab="reports"><Reports /></InventoryFrame>; }
function Reports() {
  const { inv } = useInv();
  const [from, setFrom] = useState(TODAY), [to, setTo] = useState(TODAY);
  const [range, setRange] = useState({ from: TODAY, to: TODAY });
  const items = new Map(inv.st.items.map((i) => [i.id, i]));
  const moves = inv.st.moves.filter((m) => m.at.slice(0, 10) >= range.from && m.at.slice(0, 10) <= range.to);
  const value = inv.items.reduce((s, i) => s + i.qty * i.cost, 0);
  const review = inv.items.filter((i) => statusOf(i) !== "In stock").sort((a, b) => a.qty - b.qty);
  const low = review.filter((i) => statusOf(i) === "Low stock").length;
  const bad = from > to;
  const label = range.from === range.to ? day(range.from) : `${day(range.from)} – ${day(range.to)}`;
  const csv = () => {
    const rows = [["Item", "SKU", "Unit", "Available", "Status", "Unit cost (BDT)", "Value (BDT)"], ...inv.items.map((i) => [i.name, i.sku, i.unit, i.qty, statusOf(i), i.cost, i.qty * i.cost]), [], ["Movements", label], ["Date/time", "Item", "Movement", "Change", "Balance after", "Reference", "Note", "Recorded by"], ...moves.map((m) => [m.at.replace("T", " "), items.get(m.item)?.name ?? "", MOVE_LABEL[m.type], m.change, m.balance, m.ref, m.note, m.by])];
    const text = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv" }));
    a.download = `inventory-report-${range.from}-to-${range.to}.csv`;
    a.click();
  };
  const kpis: [string, string, string, typeof Package, string][] = [
    ["Estimated Stock Value", tk(Math.round(value)), "Current stock × unit cost", BadgeDollarSign, "bg-[#e5f5ec] text-[#1c7d45]"],
    ["Active Items", String(inv.items.length), "Current stock list", Package, "bg-[#f1edff] text-[#6b55e0]"],
    ["Needs Attention", String(review.length), `${low} low · ${review.length - low} out of stock`, TriangleAlert, "bg-[#fdf3d9] text-[#a76f00]"],
    ["Movements", String(moves.length), "Selected date range", History, "bg-[#e8f0fe] text-[#1d4ed8]"],
  ];
  return (
    <>
      <section className={clsx(card, "flex flex-wrap items-center gap-3 px-5 py-4 print:hidden")}>
        <div className="mr-auto"><h2 className="text-[17px] font-bold">Inventory Report</h2><p className="text-[13px] text-hms-muted">The date range applies to movement activity.</p></div>
        <input type="date" aria-label="From" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={sel} /><ArrowRight className="size-4 text-hms-muted" />
        <input type="date" aria-label="To" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={sel} />
        <button disabled={bad} onClick={() => setRange({ from, to })} className={clsx(btnPrimary, "h-10")}>Apply</button>
        <button onClick={csv} className={clsx(btnLine, "h-10")}><Download className="size-4" />CSV</button>
        <button onClick={() => window.print()} className={clsx(btnLine, "h-10")}><Printer className="size-4" />PDF</button>
      </section>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([l, v, s, I, tone]) => (
          <div key={l} className={clsx(card, "flex items-center gap-4 p-4")}>
            <span className={clsx("grid size-11 shrink-0 place-items-center rounded-xl", tone)}><I className="size-5" /></span>
            <span><span className="block text-[13.5px] font-semibold">{l}</span><span className="block text-[24px] font-bold leading-tight tabular-nums">{v}</span><span className="text-[12.5px] text-hms-muted">{s}</span></span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
        <section className={clsx(card, "self-start overflow-hidden")}>
          <div className="px-5 py-4"><h3 className="text-[17px] font-bold">Stock to Review</h3><p className="text-[13px] text-hms-muted">Current low-stock and out-of-stock items.</p></div>
          {review.length ? <ul>{review.map((i) => <li key={i.id} className="flex items-center gap-3 border-t border-hms-line px-5 py-3"><span className="flex-1"><span className="block font-semibold">{i.name}</span><span className="text-[13px] text-hms-muted">{fmtQty(i.qty, i.unit)} available · Reorder at {fmtQty(i.reorder, i.unit)}</span></span><Pill tone={TONE[statusOf(i)]}>{statusOf(i)}</Pill></li>)}</ul>
            : <p className="border-t border-hms-line px-5 py-6 text-[14px] text-hms-muted">All items are above their reorder level.</p>}
        </section>
        <section className={clsx(card, "overflow-hidden")}>
          <div className="px-5 py-4"><h3 className="text-[17px] font-bold">Movement Activity</h3><p className="text-[13px] text-hms-muted">{label} · {moves.length} movement{moves.length === 1 ? "" : "s"}</p></div>
          {moves.length ? (
            <table className="w-full border-t border-hms-line text-[14px]">
              <thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2.5 font-medium">Item / SKU</th><th className="px-3 py-2.5 font-medium">Movement</th><th className="px-5 py-2.5 text-right font-medium">Change</th></tr></thead>
              <tbody>{moves.map((m) => { const it = items.get(m.item); return <tr key={m.id} className="border-t border-hms-line"><td className="px-5 py-2.5"><span className="block font-semibold">{it?.name}</span><span className="text-[12.5px] text-hms-muted">{it?.sku}</span></td><td className="px-3 py-2.5"><Pill tone={MOVE_TONE[m.type]}>{MOVE_LABEL[m.type]}</Pill></td><td className="whitespace-nowrap px-5 py-2.5 text-right font-bold tabular-nums">{signed(m.change, it?.unit ?? "")}</td></tr>; })}</tbody>
            </table>
          ) : <p className="border-t border-hms-line px-5 py-6 text-[14px] text-hms-muted">No movements in this date range.</p>}
        </section>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <Cogs from={range.from} to={range.to} label={label} />
        <section className={clsx(card, "self-start overflow-hidden")}>
          <div className="px-5 py-4"><h3 className="text-[17px] font-bold">Stock value by store</h3><p className="text-[13px] text-hms-muted">Now, at average cost.</p></div>
          <table className="w-full border-t border-hms-line text-[14px]"><tbody>{inv.st.stores.map((x) => { const v = inv.items.reduce((t, i) => t + (i.stock[x.id] ?? 0) * i.cost, 0); return <tr key={x.id} className="border-t border-hms-line first:border-t-0"><td className="px-5 py-2.5"><span className="block font-semibold">{x.name}</span><span className="text-[12.5px] text-hms-muted">{KIND_LABEL[x.kind]}</span></td><td className="px-5 py-2.5 text-right font-semibold tabular-nums">{tk(Math.round(v))}</td></tr>; })}</tbody></table>
        </section>
      </div>
    </>
  );
}

/** Cost of goods used (issued, used in sales, wasted) by category, and sending it to Accounts. */
function Cogs({ from, to, label }: { from: string; to: string; label: string }) {
  const { inv, toast } = useInv();
  const [err, setErr] = useState("");
  const cats = new Map(inv.st.categories.map((c) => [c.id, c.name]));
  const lines = inv.cogs(from, to);
  const total = lines.reduce((a, b) => a + b.amount, 0);
  const sent = inv.st.postings.find((p) => p.from === from && p.to === to);
  const can = CAN.approve(inv.role);
  return (
    <section className={clsx(card, "self-start overflow-hidden")}>
      <div className="flex flex-wrap items-start gap-3 px-5 py-4">
        <div className="mr-auto"><h3 className="text-[17px] font-bold">Cost of goods used</h3><p className="text-[13px] text-hms-muted">{label} · issued, used in sales and wasted, at average cost.</p></div>
        {sent ? <span className="inline-flex items-center gap-1.5 rounded-md bg-[#e5f5ec] px-2.5 py-1 text-[13px] font-semibold text-[#16693a]"><Check className="size-4" />{sent.id} sent to Accounts</span>
          : <button disabled={!total || !can} onClick={() => { const e = inv.postCogs(from, to); setErr(e ?? ""); if (!e) toast("Cost of goods sent to Accounts"); }} className={clsx(btnPrimary, "h-10")}><Landmark className="size-4" />Send to Accounts</button>}
      </div>
      {lines.length ? (
        <table className="w-full border-t border-hms-line text-[14px]">
          <tbody>{lines.map((l) => <tr key={l.category} className="border-t border-hms-line first:border-t-0"><td className="px-5 py-2.5">{cats.get(l.category) ?? "Other"}</td><td className="px-5 py-2.5 text-right tabular-nums">{tk(l.amount)}</td></tr>)}</tbody>
          <tfoot><tr className="border-t-2 border-hms-line"><td className="px-5 py-3 font-bold">Total</td><td className="px-5 py-3 text-right font-bold tabular-nums">{tk(total)}</td></tr></tfoot>
        </table>
      ) : <p className="border-t border-hms-line px-5 py-6 text-[14px] text-hms-muted">Nothing used in this period.</p>}
      {err && <p className="border-t border-hms-line px-5 py-2 text-[13px] font-medium text-[#c81e1e]">{err}</p>}
      {!can && total > 0 && !sent && <p className="border-t border-hms-line px-5 py-2.5 text-[13px] text-hms-muted">A manager sends this to Accounts.</p>}
      <p className="border-t border-hms-line bg-[#f8f9fb] px-5 py-3 text-[12.5px] text-hms-muted">Prototype: creates a journal record ({inv.st.postings.length} so far). In production it posts “Cost of goods” to the live Accounts module.</p>
    </section>
  );
}

// ---------------- Categories & suppliers ----------------
function Block({ title, sub, add, onAdd, rows, icon: I, head }: { title: string; sub: string; add: string; onAdd: () => void; rows: { id: string; name: string; n: number; extra?: string; edit: () => void }[]; icon: typeof Tag; head: string }) {
  return (
    <section className={clsx(card, "self-start overflow-hidden")}>
      <div className="flex items-start gap-3 px-5 py-4"><div className="flex-1"><h2 className="text-[17px] font-bold">{title}</h2><p className="text-[13px] text-hms-muted">{sub}</p></div><button onClick={onAdd} className={clsx(btnLine, "h-9 px-3")}><Plus className="size-4" />{add}</button></div>
      <table className="w-full border-t border-hms-line text-[14px]">
        <thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2.5 font-medium">{head}</th><th className="px-3 py-2.5 text-right font-medium">Items</th><th className="w-16 px-5 py-2.5 text-right font-medium">Edit</th></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id} className="border-t border-hms-line">
            <td className="px-5 py-3"><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[#f1edff] text-[#6b55e0]"><I className="size-4" /></span><span><span className="block font-semibold">{r.name}</span>{r.extra && <span className="text-[12.5px] text-hms-muted">{r.extra}</span>}</span></span></td>
            <td className="px-3 py-3 text-right tabular-nums">{r.n}</td>
            <td className="px-5 py-3 text-right"><button onClick={r.edit} aria-label={`Edit ${r.name}`} className="grid size-8 place-items-center rounded-lg hover:bg-hms-hover"><Pencil className="size-4" /></button></td>
          </tr>
        ))}</tbody>
      </table>
      {!rows.length && <p className="border-t border-hms-line px-5 py-6 text-[14px] text-hms-muted">Nothing here yet.</p>}
    </section>
  );
}

export function SetupPage() { return <InventoryFrame tab="setup"><Setup /></InventoryFrame>; }
function Setup() {
  const { inv, open } = useInv();
  const count = (k: "category" | "supplier", id: string) => inv.items.filter((i) => i[k] === id).length;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Stores" sub="Places that keep their own stock: store room, kitchen, bar, housekeeping." add="Add Store" onAdd={() => open({ k: "store" })} head="Store" icon={Warehouse}
          rows={inv.st.stores.map((x) => ({ id: x.id, name: x.name, n: inv.items.filter((i) => (i.stock[x.id] ?? 0) > 0).length, extra: KIND_LABEL[x.kind], edit: () => open({ k: "store", store: x }) }))} />
        <Roles />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Categories" sub="Group items so staff can find them faster." add="Add Category" onAdd={() => open({ k: "cat" })} head="Category" icon={Tag}
          rows={inv.st.categories.map((c) => ({ id: c.id, name: c.name, n: count("category", c.id), edit: () => open({ k: "cat", cat: c }) }))} />
        <Block title="Suppliers" sub="Vendors you order from and receive stock from." add="Add Supplier" onAdd={() => open({ k: "sup" })} head="Supplier" icon={Store}
          rows={inv.st.suppliers.map((s) => ({ id: s.id, name: s.name, n: count("supplier", s.id), extra: [s.contact, s.phone].filter(Boolean).join(" · "), edit: () => open({ k: "sup", sup: s }) }))} />
      </div>
    </div>
  );
}

/** Who can do what, the approval limit, and (prototype only) which role you are acting as. */
function Roles() {
  const { inv, toast } = useInv();
  const s = inv.st.settings;
  const can = (r: Role) => [r !== "keeper" ? "Approve orders, wastage & adjustments" : "Receive, issue, transfer, count, create orders", r !== "keeper" ? "Post stock counts · send cost to Accounts" : `Wastage / adjust over ${tk(s.approveAbove)} needs approval`, r === "owner" ? "Change these settings" : r === "manager" ? "Change these settings" : "Can't change settings"];
  const edit = CAN.settings(inv.role);
  return (
    <section id="roles" className={clsx(card, "self-start overflow-hidden")}>
      <div className="flex items-start gap-3 px-5 py-4"><span className="grid size-9 place-items-center rounded-lg bg-[#e5f5ec] text-[#1c7d45]"><ShieldCheck className="size-4" aria-hidden /></span><div className="flex-1"><h2 className="text-[17px] font-bold">Roles & approvals</h2><p className="text-[13px] text-hms-muted">Who can change stock, and what needs a manager.</p></div></div>
      <div className="space-y-4 border-t border-hms-line px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label htmlFor="ap-lim" className="mb-1.5 block text-[13.5px] font-semibold">Approval needed above (৳)</label><input id="ap-lim" inputMode="numeric" disabled={!edit} value={s.approveAbove} onChange={(e) => inv.setSettings({ approveAbove: Number(e.target.value.replace(/\D/g, "")) || 0 })} className="h-11 w-full rounded-lg border border-[#858c97] bg-white px-3 text-[15px] outline-none focus:border-hms-ink disabled:bg-[#f4f6f8]" /><p className="mt-1 text-[12.5px] text-hms-muted">For wastage and adjustments by a store keeper.</p></div>
          <label className="flex items-start gap-2.5 self-start rounded-lg border border-hms-line p-3 text-[14px]"><input type="checkbox" disabled={!edit} checked={s.poNeedsApproval} onChange={(e) => inv.setSettings({ poNeedsApproval: e.target.checked })} className="mt-0.5 size-4 accent-[#b11c29]" /><span><b className="block">Orders need approval</b><span className="text-[12.5px] text-hms-muted">Store keeper orders wait for a manager.</span></span></label>
        </div>
        <ul className="divide-y divide-hms-line rounded-xl border border-hms-line">{(["keeper", "manager", "owner"] as Role[]).map((r) => <li key={r} className="px-4 py-3 text-[13.5px]"><p className="font-semibold">{ROLE_LABEL[r]}</p><p className="text-hms-muted">{can(r).join(" · ")}</p></li>)}</ul>
        <div className="rounded-xl bg-[#f4f6f8] p-3">
          <p className="text-[13px] font-semibold">Prototype: try it as</p>
          <div role="radiogroup" aria-label="Acting as" className="mt-2 flex flex-wrap gap-1.5">{(["keeper", "manager", "owner"] as Role[]).map((r) => <button key={r} role="radio" aria-checked={inv.role === r} onClick={() => { inv.setSettings({ role: r }); toast(`Now acting as ${ROLE_LABEL[r]}`); }} className={clsx("h-9 rounded-lg px-3 text-[13.5px] font-semibold", inv.role === r ? "bg-hms-ink text-white" : "border border-hms-line bg-white")}>{ROLE_LABEL[r]}</button>)}</div>
          <p className="mt-2 text-[12px] text-hms-muted">In the real HMS your role comes from Staff permissions per property.</p>
        </div>
      </div>
    </section>
  );
}
