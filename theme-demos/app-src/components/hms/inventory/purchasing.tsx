"use client";
// Purchasing: suggested orders (reorder → par), purchase orders with approval, and receiving against an order
// (partial deliveries create one GRN each). Stock only changes when goods are received.
import clsx from "clsx";
import { useState } from "react";
import { CheckCircle2, Clock, PackageCheck, Plus, ShoppingCart, Trash2, Truck } from "lucide-react";
import { CAN, PO_LABEL, TODAY, fmtQty, inBuy, poTotal, q, tk, type Po, type PoStatus, type useInventory } from "@/lib/inventory/store";
import { Sheet, btnLine, btnPrimary, input, lbl } from "../guests/ui";
import { Err, Hint, QtyInput } from "./sheets";
import { InventoryFrame, useInv } from "./frame";

type Inv = ReturnType<typeof useInventory>;
const card = "rounded-xl border border-hms-line bg-white";
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (iso: string) => `${iso.slice(8, 10)} ${MON[Number(iso.slice(5, 7)) - 1]}`;
export const PO_TONE: Record<PoStatus, string> = { draft: "bg-hms-hover text-[#4d5664]", pending: "bg-[#fdf3d9] text-[#7a5200]", approved: "bg-[#e8f0fe] text-[#1d4ed8]", partial: "bg-[#eeebfc] text-[#5b44c9]", received: "bg-[#e5f5ec] text-[#16693a]", cancelled: "bg-[#fde8e8] text-[#a11d2a]" };
const Status = ({ s }: { s: PoStatus }) => <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[12.5px] font-semibold", PO_TONE[s])}><span className="size-1.5 rounded-full bg-current" />{PO_LABEL[s]}</span>;

export function PurchasePage() { return <InventoryFrame tab="purchase"><Purchase /></InventoryFrame>; }
function Purchase() {
  const { inv, open } = useInv();
  const [f, setF] = useState<"all" | "pending" | "open" | "received" | "draft">("all");
  const sups = new Map(inv.st.suppliers.map((s) => [s.id, s.name]));
  const stores = new Map(inv.st.stores.map((s) => [s.id, s.name]));
  const list = inv.st.pos.filter((p) => f === "all" ? p.status !== "cancelled" : f === "open" ? ["approved", "partial"].includes(p.status) : p.status === f);
  const count = (k: typeof f) => inv.st.pos.filter((p) => k === "all" ? p.status !== "cancelled" : k === "open" ? ["approved", "partial"].includes(p.status) : p.status === k).length;
  const groups = new Map<string, typeof inv.suggestions>();
  for (const x of inv.suggestions) groups.set(x.item.supplier, [...(groups.get(x.item.supplier) ?? []), x]);
  return (
    <>
      {inv.suggestions.length > 0 && (
        <section className={clsx(card, "mb-4 overflow-hidden")} aria-labelledby="sugg">
          <div className="flex flex-wrap items-start gap-3 px-5 py-4">
            <span className="grid size-10 place-items-center rounded-xl bg-[#fdf3d9] text-[#a76f00]"><ShoppingCart className="size-5" aria-hidden /></span>
            <div className="flex-1"><h2 id="sugg" className="text-[17px] font-bold">Suggested to order</h2><p className="text-[13px] text-hms-muted">{inv.suggestions.length} item{inv.suggestions.length > 1 ? "s are" : " is"} at or below reorder level. Quantities fill up to the par level, in whole buying units, minus what is already on order.</p></div>
          </div>
          <div className="grid gap-3 border-t border-hms-line p-4 md:grid-cols-2 xl:grid-cols-3">
            {[...groups].map(([sup, rows]) => (
              <div key={sup || "none"} className="rounded-xl border border-hms-line p-4">
                <div className="flex items-center justify-between gap-2"><p className="font-semibold">{sups.get(sup) ?? "No default supplier"}</p><span className="text-[13px] text-hms-muted">{rows.length} item{rows.length > 1 ? "s" : ""}</span></div>
                <ul className="mt-2 space-y-1.5 text-[13.5px]">{rows.map(({ item, need }) => <li key={item.id} className="flex justify-between gap-2"><span className="truncate">{item.name} <span className="text-hms-muted">· has {fmtQty(item.qty, item.unit)}</span></span><b className="shrink-0 tabular-nums">{inBuy(item, need) || fmtQty(need, item.unit)}</b></li>)}</ul>
                <button onClick={() => open({ k: "po", prefill: { supplier: sup, lines: rows.map((r) => ({ item: r.item.id, qty: r.need })) } })} className={clsx(btnLine, "mt-3 h-9 w-full")}><Plus className="size-4" />Create order</button>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className={clsx(card, "overflow-hidden")}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="mr-auto"><h2 className="text-[17px] font-bold">Purchase Orders</h2><p className="text-[13px] text-hms-muted">Order → approve → receive. Stock goes up only when goods arrive.</p></div>
          <button onClick={() => open({ k: "po" })} className={clsx(btnPrimary, "h-10")}><Plus className="size-4" />New order</button>
        </div>
        <div role="tablist" aria-label="Order status" className="no-scrollbar flex gap-1 overflow-x-auto border-t border-hms-line px-4 py-2">
          {([["all", "All"], ["pending", "Waiting approval"], ["open", "To receive"], ["received", "Received"], ["draft", "Drafts"]] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)} className={clsx("h-9 shrink-0 rounded-lg px-3 text-[13.5px] font-semibold", f === k ? "bg-hms-ink text-white" : "text-hms-muted hover:bg-hms-hover")}>{l} <span className="tabular-nums opacity-70">{count(k)}</span></button>
          ))}
        </div>
        {list.length ? (
          <div className="overflow-x-auto border-t border-hms-line" tabIndex={0} role="region" aria-label="Purchase orders">
            <table className="w-full min-w-[860px] text-[14px]">
              <thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2.5 font-medium">Order</th><th className="px-3 py-2.5 font-medium">Supplier</th><th className="px-3 py-2.5 font-medium">Deliver to</th><th className="px-3 py-2.5 font-medium">Expected</th><th className="px-3 py-2.5 text-right font-medium">Total</th><th className="px-3 py-2.5 font-medium">Status</th><th className="px-5 py-2.5 text-right font-medium"><span className="sr-only">Open</span></th></tr></thead>
              <tbody>{list.map((p) => {
                return (
                  <tr key={p.id} className="border-t border-hms-line">
                    <td className="px-5 py-3"><button onClick={() => open({ k: "poView", id: p.id })} className="text-left"><span className="block font-semibold text-hms-ink underline-offset-2 hover:underline">{p.id}</span><span className="text-[12.5px] text-hms-muted">{day(p.date)} · {p.lines.length} item{p.lines.length > 1 ? "s" : ""}</span></button></td>
                    <td className="px-3 py-3">{sups.get(p.supplier) ?? "—"}</td>
                    <td className="px-3 py-3">{stores.get(p.store)}</td>
                    <td className={clsx("px-3 py-3", p.expected < TODAY && ["approved", "partial"].includes(p.status) && "font-semibold text-[#b11c29]")}>{day(p.expected)}{p.expected < TODAY && ["approved", "partial"].includes(p.status) ? " · late" : ""}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums">{tk(Math.round(poTotal(p)))}</td>
                    <td className="px-3 py-3"><Status s={p.status} /></td>
                    <td className="px-5 py-3 text-right">{["approved", "partial"].includes(p.status) ? <button onClick={() => open({ k: "poView", id: p.id })} className={clsx(btnPrimary, "h-9 px-3")}><Truck className="size-4" />Receive</button> : p.status === "pending" && CAN.approve(inv.role) ? <button onClick={() => open({ k: "poView", id: p.id })} className={clsx(btnLine, "h-9 px-3")}>Review</button> : <button onClick={() => open({ k: "poView", id: p.id })} className={clsx(btnLine, "h-9 px-3")}>Open</button>}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        ) : (
          <div className="border-t border-hms-line px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-hms-hover text-hms-muted"><ShoppingCart className="size-5" aria-hidden /></span>
            <p className="mt-3 text-[16px] font-semibold">No orders here</p>
            <p className="mt-1 text-[14px] text-hms-muted">Create an order for a supplier, or start from the suggestions above.</p>
          </div>
        )}
      </section>
    </>
  );
}

/** Create / edit an order. Quantities are entered in the item's buying unit when it has one. */
export function PoSheet({ inv, po, prefill, onClose, onDone }: { inv: Inv; po?: Po; prefill?: { supplier: string; lines: { item: string; qty: number }[] }; onClose: () => void; onDone: (id: string, msg: string) => void }) {
  const items = new Map(inv.items.map((i) => [i.id, i]));
  const toBuy = (item: string, base: number) => { const it = items.get(item); return it?.perBuy ? q(base / it.perBuy) : base; };
  const [sup, setSup] = useState(po?.supplier ?? prefill?.supplier ?? inv.st.suppliers[0]?.id ?? "");
  const [store, setStore] = useState(po?.store ?? "main");
  const [expected, setExpected] = useState(po?.expected ?? "2026-11-13");
  const [note, setNote] = useState(po?.note ?? "");
  const [lines, setLines] = useState(() => (po?.lines ?? prefill?.lines.map((l) => ({ item: l.item, qty: l.qty, cost: items.get(l.item)?.cost ?? 0 })) ?? []).map((l) => ({ item: l.item, qty: String(toBuy(l.item, l.qty)), cost: String(l.cost) })));
  const [tried, setTried] = useState(false);
  const add = () => { const free = inv.items.find((i) => !lines.some((l) => l.item === i.id) && (!sup || i.supplier === sup)) ?? inv.items.find((i) => !lines.some((l) => l.item === i.id)); if (free) setLines([...lines, { item: free.id, qty: "", cost: String(free.cost) }]); };
  const setL = (i: number, k: "item" | "qty" | "cost", v: string) => setLines(lines.map((l, j) => j !== i ? l : k === "item" ? { item: v, qty: "", cost: String(items.get(v)?.cost ?? 0) } : { ...l, [k]: v }));
  const base = (l: (typeof lines)[number]) => { const it = items.get(l.item); return q((Number(l.qty) || 0) * (it?.perBuy ?? 1)); };
  const total = lines.reduce((s, l) => s + base(l) * (Number(l.cost) || 0), 0);
  const errs = !sup ? "Pick a supplier" : !lines.length ? "Add at least one item" : lines.some((l) => !(Number(l.qty) > 0)) ? "Every line needs a quantity above 0" : new Set(lines.map((l) => l.item)).size !== lines.length ? "Each item can be on the order once" : "";
  const needs = inv.st.settings.poNeedsApproval && inv.role === "keeper";
  const save = (submit: boolean) => {
    setTried(true);
    if (errs) return;
    const id = inv.savePo({ id: po?.id, supplier: sup, store, date: po?.date ?? TODAY, expected, note: note.trim(), lines: lines.map((l) => ({ item: l.item, qty: base(l), cost: Number(l.cost) || 0, received: po?.lines.find((x) => x.item === l.item)?.received ?? 0 })) }, submit);
    onDone(id || po!.id, !submit ? "Saved as draft" : needs ? "Sent to a manager for approval" : "Order approved — ready to receive");
  };
  return (
    <Sheet wide title={po ? `Edit ${po.id}` : "New Purchase Order"} sub="What you order from one supplier, delivered to one store." onClose={onClose}
      footer={<><button onClick={onClose} className={clsx(btnLine, "flex-1")}>Cancel</button><button onClick={() => save(false)} className={clsx(btnLine, "flex-1")}>Save draft</button><button onClick={() => save(true)} className={clsx(btnPrimary, "flex-[1.4]")}>{needs ? "Send for approval" : "Approve order"}</button></>}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label htmlFor="po-sup" className={lbl}>Supplier</label><select id="po-sup" value={sup} onChange={(e) => setSup(e.target.value)} className={input}>{inv.st.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label htmlFor="po-store" className={lbl}>Deliver to</label><select id="po-store" value={store} onChange={(e) => setStore(e.target.value)} className={input}>{inv.st.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label htmlFor="po-exp" className={lbl}>Expected on</label><input id="po-exp" type="date" min={TODAY} value={expected} onChange={(e) => setExpected(e.target.value)} className={input} /></div>
        </div>
        <div>
          <p className={lbl}>Items</p>
          <div className="overflow-hidden rounded-xl border border-hms-line">
            <div className="hidden grid-cols-[1fr_150px_130px_110px_40px] gap-2 bg-[#f4f6f8] px-3 py-2 text-[12.5px] font-semibold text-hms-muted sm:grid"><span>Item</span><span>Quantity</span><span>Cost (৳ / unit)</span><span className="text-right">Line total</span><span /></div>
            {lines.map((l, i) => {
              const it = items.get(l.item);
              return (
                <div key={i} className="grid grid-cols-2 items-start gap-2 border-t border-hms-line px-3 py-2.5 first:border-t-0 sm:grid-cols-[1fr_150px_130px_110px_40px] sm:items-center sm:first:border-t">
                  <select aria-label={`Item ${i + 1}`} value={l.item} onChange={(e) => setL(i, "item", e.target.value)} className={clsx(input, "col-span-2 h-10 sm:col-span-1")}>{inv.items.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
                  <div><QtyInput id={`po-q${i}`} label={`Quantity for ${it?.name}`} value={l.qty} onChange={(v) => setL(i, "qty", v)} unit={it?.buyUnit ?? it?.unit ?? ""} invalid={tried && !(Number(l.qty) > 0)} />{it?.perBuy && Number(l.qty) > 0 && <p className="mt-0.5 text-[12px] text-hms-muted">= {fmtQty(base(l), it.unit)}</p>}</div>
                  <input aria-label={`Cost per ${it?.unit} for ${it?.name}`} inputMode="decimal" value={l.cost} onChange={(e) => setL(i, "cost", e.target.value.replace(/[^\d.]/g, ""))} className={clsx(input, "h-11")} />
                  <p className="self-center text-right font-semibold tabular-nums">{tk(Math.round(base(l) * (Number(l.cost) || 0)))}</p>
                  <button type="button" onClick={() => setLines(lines.filter((_, j) => j !== i))} aria-label={`Remove ${it?.name}`} className="grid size-9 place-items-center justify-self-end rounded-lg hover:bg-hms-hover"><Trash2 className="size-4 text-hms-muted" /></button>
                </div>
              );
            })}
            {!lines.length && <p className="px-3 py-6 text-center text-[14px] text-hms-muted">No items yet.</p>}
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <button type="button" onClick={add} disabled={lines.length >= inv.items.length} className={clsx(btnLine, "h-9 px-3")}><Plus className="size-4" />Add item</button>
            <p className="text-[15px]">Total <b className="tabular-nums">{tk(Math.round(total))}</b></p>
          </div>
          {tried && errs && <Err>{errs}</Err>}
        </div>
        <div><label htmlFor="po-note" className={clsx(lbl, "flex justify-between")}>Note to supplier <span className="font-normal text-hms-muted">Optional</span></label><textarea id="po-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={clsx(input, "h-auto py-2.5")} /></div>
        <Hint>{needs ? "As a store keeper, orders go to a manager for approval before the supplier is contacted." : "Orders you approve are ready to receive straight away."} Stock changes only when you receive.</Hint>
      </div>
    </Sheet>
  );
}

/** One order: lines with ordered / received / due, approval actions, receiving (GRN) and history of deliveries. */
export function PoView({ inv, id, onClose, onEdit, onDone }: { inv: Inv; id: string; onClose: () => void; onEdit: (po: Po) => void; onDone: (m: string) => void }) {
  const p = inv.st.pos.find((x) => x.id === id);
  const items = new Map(inv.st.items.map((i) => [i.id, i]));
  const [recv, setRecv] = useState<Record<string, string>>({});
  const [costs, setCosts] = useState<Record<string, string>>({});
  const [invoice, setInvoice] = useState("");
  const [err, setErr] = useState("");
  if (!p) return null;
  const can = ["approved", "partial"].includes(p.status);
  const sup = inv.st.suppliers.find((s) => s.id === p.supplier);
  const store = inv.st.stores.find((s) => s.id === p.store)?.name;
  const due = (l: Po["lines"][number]) => q(Math.max(0, l.qty - l.received));
  const fillAll = () => setRecv(Object.fromEntries(p.lines.map((l) => [l.item, String(due(l))])));
  const receive = () => {
    const e = inv.receivePo(p.id, p.lines.map((l) => ({ item: l.item, qty: Number(recv[l.item] ?? 0) || 0, cost: Number(costs[l.item] ?? l.cost) || 0 })), invoice.trim());
    if (e) { setErr(e); return; }
    onDone(`Received on ${p.id} — stock added to ${store}`); onClose();
  };
  const actions = (
    <>
      <button onClick={onClose} className={clsx(btnLine, "flex-1")}>Close</button>
      {p.status === "pending" && CAN.approve(inv.role) && <><button onClick={() => { inv.setPoStatus(p.id, "draft"); onDone(`${p.id} sent back as draft`); }} className={clsx(btnLine, "flex-1")}>Send back</button><button onClick={() => { inv.setPoStatus(p.id, "approved"); onDone(`${p.id} approved`); }} className={clsx(btnPrimary, "flex-1")}><CheckCircle2 className="size-4" />Approve</button></>}
      {(p.status === "draft" || (p.status === "pending" && !CAN.approve(inv.role))) && <button onClick={() => onEdit(p)} className={clsx(btnPrimary, "flex-1")}>Edit order</button>}
      {can && <button onClick={receive} className={clsx(btnPrimary, "flex-[1.4]")}><PackageCheck className="size-4" />Save receipt</button>}
    </>
  );
  return (
    <Sheet wide title={p.id} sub={`${sup?.name ?? "Supplier"} → ${store}`} onClose={onClose} footer={actions}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
          <Status s={p.status} />
          <span><span className="text-hms-muted">Ordered</span> {day(p.date)}</span>
          <span><span className="text-hms-muted">Expected</span> {day(p.expected)}</span>
          <span><span className="text-hms-muted">By</span> {p.by}</span>
          {p.approvedBy && <span><span className="text-hms-muted">Approved by</span> {p.approvedBy}</span>}
          {sup?.phone && <a href={`tel:${sup.phone.replace(/\D/g, "")}`} className="font-semibold text-action underline underline-offset-2">Call {sup.phone}</a>}
        </div>
        {p.status === "pending" && !CAN.approve(inv.role) && <p className="flex items-center gap-2 rounded-lg bg-[#fdf3d9] px-3 py-2 text-[13.5px] text-[#6b4309]"><Clock className="size-4" />Waiting for a manager to approve.</p>}
        <div className="overflow-x-auto rounded-xl border border-hms-line" tabIndex={0} role="region" aria-label="Order lines">
          <table className="w-full min-w-[620px] text-[14px]">
            <thead><tr className="bg-[#f4f6f8] text-left text-[12.5px] text-hms-muted"><th className="px-3 py-2 font-medium">Item</th><th className="px-3 py-2 text-right font-medium">Ordered</th><th className="px-3 py-2 text-right font-medium">Received</th><th className="px-3 py-2 text-right font-medium">Due</th>{can ? <><th className="px-3 py-2 font-medium">Receiving now</th><th className="px-3 py-2 font-medium">Cost ৳</th></> : <th className="px-3 py-2 text-right font-medium">Cost</th>}</tr></thead>
            <tbody>{p.lines.map((l) => { const it = items.get(l.item); const u = it?.unit ?? ""; const d = due(l); return (
              <tr key={l.item} className="border-t border-hms-line">
                <td className="px-3 py-2.5"><span className="block font-semibold">{it?.name}</span>{it && inBuy(it, l.qty) && <span className="text-[12.5px] text-hms-muted">{inBuy(it, l.qty)}</span>}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">{fmtQty(l.qty, u)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">{fmtQty(l.received, u)}</td>
                <td className={clsx("whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums", d === 0 && "text-[#16693a]")}>{d === 0 ? "Done" : fmtQty(d, u)}</td>
                {can ? <>
                  <td className="w-[150px] px-3 py-2">{d > 0 ? <><QtyInput id={`rc-${l.item}`} label={`Receiving now: ${it?.name}`} value={recv[l.item] ?? ""} onChange={(v) => { setRecv({ ...recv, [l.item]: v }); setErr(""); }} unit={u} invalid={Number(recv[l.item]) > d} /></> : <span className="text-hms-muted">—</span>}</td>
                  <td className="w-[110px] px-3 py-2">{d > 0 && <input aria-label={`Cost per ${u} for ${it?.name}`} inputMode="decimal" value={costs[l.item] ?? String(l.cost)} onChange={(e) => setCosts({ ...costs, [l.item]: e.target.value.replace(/[^\d.]/g, "") })} className={clsx(input, "h-11")} />}</td>
                </> : <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">{tk(l.cost)}</td>}
              </tr>
            ); })}</tbody>
          </table>
        </div>
        <p className="text-right text-[15px]">Order total <b className="tabular-nums">{tk(Math.round(poTotal(p)))}</b></p>
        {can && (
          <div className="space-y-3 rounded-xl border border-hms-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">Receive goods</p><button type="button" onClick={fillAll} className="text-[13.5px] font-semibold text-action underline underline-offset-2">Everything due arrived</button></div>
            <div><label htmlFor="rc-inv" className={clsx(lbl, "flex justify-between")}>Supplier invoice / challan no. <span className="font-normal text-hms-muted">Optional</span></label><input id="rc-inv" value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="e.g. INV-CS-118" className={input} /></div>
            <p className="text-[12.5px] text-hms-muted">Only enter what actually arrived. The rest stays due on the order. Cost changes update the item&apos;s average cost.</p>
            {err && <Err>{err}</Err>}
          </div>
        )}
        {p.grns.length > 0 && (
          <div><p className="text-[14px] font-semibold">Deliveries</p>
            <ul className="mt-2 divide-y divide-hms-line rounded-xl border border-hms-line">{p.grns.map((g) => (
              <li key={g.id} className="px-4 py-3 text-[13.5px]"><p><b>{g.id}</b> · {day(g.at)} {g.at.slice(11, 16)}{g.invoice && ` · ${g.invoice}`} · {g.by}</p><p className="text-hms-muted">{g.lines.map((l) => `${items.get(l.item)?.name} ${fmtQty(l.qty, items.get(l.item)?.unit ?? "")}`).join(", ")}</p></li>
            ))}</ul>
          </div>
        )}
        {p.note && <p className="text-[13.5px]"><span className="text-hms-muted">Note:</span> {p.note}</p>}
        {["draft", "pending", "approved"].includes(p.status) && CAN.cancelPo(inv.role) && <button type="button" onClick={() => { if (confirm(`Cancel ${p.id}? Nothing has been received on it.`)) { inv.setPoStatus(p.id, "cancelled"); onDone(`${p.id} cancelled`); onClose(); } }} className="text-[13.5px] font-semibold text-[#c81e1e]">Cancel order</button>}
      </div>
    </Sheet>
  );
}
