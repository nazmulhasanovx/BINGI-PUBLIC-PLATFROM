"use client";
import clsx from "clsx";
import { useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown, CircleAlert, Clock, ImagePlus, Info, SlidersHorizontal } from "lucide-react";
import { imgSrc } from "@/lib/img";
import { PhotoButton } from "../photo";
import { BUY_UNITS, KIND_LABEL, MAIN, UNITS, fmtQty, q, tk, type Category, type Item, type Location, type StoreKind, type Supplier, type Unit } from "@/lib/inventory/store";
import type { useInventory } from "@/lib/inventory/store";
import { Sheet, btnLine, btnPrimary, input, lbl } from "../guests/ui";

type Inv = ReturnType<typeof useInventory>;
export const Err = ({ children }: { children: ReactNode }) => <p className="mt-1 flex items-center gap-1 text-[13px] font-medium text-[#c81e1e]"><CircleAlert className="size-3.5" />{children}</p>;
export const Hint = ({ children }: { children: ReactNode }) => <p className="flex items-center gap-2 rounded-lg bg-[#f4f2fb] px-3 py-2 text-[13px] text-[#4d5664]"><Info className="size-4 shrink-0 text-[#6b55e0]" />{children}</p>;
export const Foot = ({ onClose, label, onSave, disabled }: { onClose: () => void; label: string; onSave: () => void; disabled?: boolean }) => (
  <><button onClick={onClose} className={clsx(btnLine, "flex-1")}>Cancel</button><button onClick={onSave} disabled={disabled} className={clsx(btnPrimary, "flex-1")}>{label}</button></>
);
export function Fold({ title, sub, open: o = false, children }: { title: string; sub: string; open?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(o);
  return (
    <div className="rounded-xl border border-hms-line">
      <button type="button" onClick={() => setOpen((x) => !x)} aria-expanded={open} className="flex w-full items-center gap-2 px-4 py-3 text-left">
        <SlidersHorizontal className="size-4 text-hms-muted" /><span className="flex-1 text-[14px] font-semibold">{title}</span>
        <span className="hidden text-[12.5px] text-hms-muted sm:inline">{sub}</span><ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-3 border-t border-hms-line p-4">{children}</div>}
    </div>
  );
}
export function QtyInput({ id, value, onChange, unit, invalid, label }: { id: string; value: string; onChange: (v: string) => void; unit: string; invalid?: boolean; label?: string }) {
  return (
    <div className={clsx("flex h-11 items-center rounded-lg border bg-white pr-3 focus-within:ring-2", invalid ? "border-[#c81e1e] focus-within:ring-[#c81e1e]/15" : "border-[#858c97] focus-within:border-hms-ink focus-within:ring-hms-ink/10")}>
      <input id={id} aria-label={label} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={invalid} className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] outline-none" />
      <span className="text-[13px] text-hms-muted">{unit}</span>
    </div>
  );
}

// ---------------- Item ----------------
export function ItemSheet({ inv, item, onClose }: { inv: Inv; item?: Item; onClose: () => void }) {
  const cats = inv.st.categories, sups = inv.st.suppliers;
  const [f, setF] = useState(() => ({
    name: item?.name ?? "", unit: (item?.unit ?? "pcs") as Unit, opening: "", openStore: MAIN, category: item?.category ?? cats[0]?.id ?? "", sku: item?.sku ?? "",
    supplier: item?.supplier ?? "", reorder: item ? String(item.reorder) : "", par: item?.par ? String(item.par) : "", cost: item ? String(item.cost) : "",
    buyUnit: item?.buyUnit ?? "", perBuy: item?.perBuy ? String(item.perBuy) : "", photo: item?.photo ?? "",
  }));
  const [photoErr, setPhotoErr] = useState("");
  const [tried, setTried] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  const sku = f.sku.trim() || inv.nextSku(f.category);
  const dupName = inv.items.some((i) => i.id !== item?.id && i.name.trim().toLowerCase() === f.name.trim().toLowerCase());
  const dupSku = inv.st.items.some((i) => i.id !== item?.id && i.sku.toUpperCase() === sku.toUpperCase());
  const per = Number(f.perBuy);
  const errs = {
    name: !f.name.trim() ? "Enter the item name" : dupName ? "An item with this name already exists" : "",
    sku: dupSku ? "This SKU is already used" : "",
    buy: f.buyUnit && !(per > 1) ? "Enter how many units are in one " + f.buyUnit : "",
    par: f.par && Number(f.par) <= Number(f.reorder || 0) ? "Par level should be above the reorder level" : "",
  };
  const save = () => {
    setTried(true);
    if (errs.name || errs.sku || errs.buy || errs.par) return;
    inv.saveItem({ id: item?.id ?? inv.newId("i"), name: f.name.trim(), sku: sku.toUpperCase(), unit: f.unit, category: f.category, supplier: f.supplier, reorder: q(Number(f.reorder) || 0), par: f.par ? q(Number(f.par)) : undefined, cost: Number(f.cost) || 0, qty: item?.qty ?? 0, stock: item?.stock ?? {}, buyUnit: f.buyUnit || undefined, perBuy: f.buyUnit ? per : undefined, photo: f.photo || undefined, archived: item?.archived }, item ? undefined : Number(f.opening) || 0, f.openStore);
    onClose();
  };
  return (
    <Sheet title={item ? "Edit Item" : "Add Item"} sub={item ? `${item.sku} · stock changes only through movements` : "Create an item and set its starting quantity."} onClose={onClose} footer={<Foot onClose={onClose} label="Save Item" onSave={save} />}>
      <div className="space-y-4">
        <p className="text-[14px] font-semibold">Item details</p>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- uploaded data URL */}
          {f.photo ? <img src={imgSrc(f.photo)} alt="" className="size-16 shrink-0 rounded-xl object-cover" /> : <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-hms-hover text-hms-muted"><ImagePlus className="size-6" /></span>}
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <PhotoButton label={f.photo ? "Change item photo" : "Add item photo"} onPhoto={(v) => { setPhotoErr(""); set("photo", v); }} onError={setPhotoErr} className={clsx(btnLine, "h-9 px-3")}>{f.photo ? "Change photo" : "Add photo"}</PhotoButton>
              {f.photo && <button type="button" onClick={() => set("photo", "")} className="h-9 px-2 text-[13.5px] font-semibold text-hms-red">Remove</button>}
            </div>
            <p className="mt-1 text-[12.5px] text-hms-muted">Optional — helps staff pick the right item.</p>
            {photoErr && <Err>{photoErr}</Err>}
          </div>
        </div>
        <div><label htmlFor="it-name" className={lbl}>Item Name</label><input id="it-name" autoFocus value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Bath Mat" className={input} />{tried && errs.name && <Err>{errs.name}</Err>}</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="it-unit" className={lbl}>Unit (how you use it)</label><select id="it-unit" value={f.unit} onChange={(e) => set("unit", e.target.value)} className={input}>{UNITS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          {item ? <div><p className={lbl}>Available (all stores)</p><p className="flex h-11 items-center rounded-lg bg-[#f4f6f8] px-3 text-[15px] font-semibold">{fmtQty(item.qty, item.unit)}</p></div>
            : <div><label htmlFor="it-open" className={lbl}>Opening Stock</label><QtyInput id="it-open" value={f.opening} onChange={(v) => set("opening", v)} unit={f.unit} /></div>}
        </div>
        {!item && Number(f.opening) > 0 && <div><label htmlFor="it-ostore" className={lbl}>Opening stock is in</label><select id="it-ostore" value={f.openStore} onChange={(e) => set("openStore", e.target.value)} className={input}>{inv.st.stores.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>}
        <Fold title="Buying unit" sub="e.g. 1 carton = 48 pcs" open={!!item?.buyUnit}>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="it-bu" className={lbl}>Bought in</label><select id="it-bu" value={f.buyUnit} onChange={(e) => set("buyUnit", e.target.value)} className={input}><option value="">Same as unit</option>{BUY_UNITS.map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
            <div><label htmlFor="it-pb" className={lbl}>{f.buyUnit ? `${f.unit} in 1 ${f.buyUnit}` : "Units per pack"}</label><QtyInput id="it-pb" value={f.perBuy} onChange={(v) => set("perBuy", v)} unit={f.unit} invalid={tried && !!errs.buy} /></div>
          </div>
          {tried && errs.buy && <Err>{errs.buy}</Err>}
          <Hint>Receive and order in {f.buyUnit || "the buying unit"}; stock is kept and used in {f.unit}.</Hint>
        </Fold>
        <Fold title="Item settings" sub="SKU, category, supplier, levels & cost" open={!!item}>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="it-cat" className={lbl}>Category</label><select id="it-cat" value={f.category} onChange={(e) => set("category", e.target.value)} className={input}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}{!cats.length && <option value="">No categories yet</option>}</select></div>
            <div><label htmlFor="it-sku" className={lbl}>SKU</label><input id="it-sku" value={f.sku} onChange={(e) => set("sku", e.target.value)} placeholder={sku} className={input} />{tried && errs.sku && <Err>{errs.sku}</Err>}</div>
            <div className="col-span-2"><label htmlFor="it-sup" className={lbl}>Default Supplier</label><select id="it-sup" value={f.supplier} onChange={(e) => set("supplier", e.target.value)} className={input}><option value="">None</option>{sups.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label htmlFor="it-re" className={lbl}>Reorder Level</label><QtyInput id="it-re" value={f.reorder} onChange={(v) => set("reorder", v)} unit={f.unit} /></div>
            <div><label htmlFor="it-par" className={lbl}>Par Level (order up to)</label><QtyInput id="it-par" value={f.par} onChange={(v) => set("par", v)} unit={f.unit} invalid={tried && !!errs.par} /></div>
            {tried && errs.par && <div className="col-span-2"><Err>{errs.par}</Err></div>}
            <div className="col-span-2"><label htmlFor="it-cost" className={lbl}>Unit Cost (৳ per {f.unit})</label><input id="it-cost" inputMode="decimal" value={f.cost} onChange={(e) => set("cost", e.target.value.replace(/[^\d.]/g, ""))} placeholder="0" className={input} />{item && <p className="mt-1 text-[12.5px] text-hms-muted">Updates automatically as a weighted average when you receive stock.</p>}</div>
          </div>
        </Fold>
        {!item && <Hint>Enter 0 if this item has no stock yet. Low-stock alerts use the reorder level; purchase suggestions order up to the par level.</Hint>}
      </div>
    </Sheet>
  );
}

// ---------------- Movements ----------------
type MT = "receive" | "issue" | "wastage" | "adjust";
const MOVE_UI: Record<MT, { title: string; sub: string; qty: string; save: string; noteReq: boolean }> = {
  receive: { title: "Receive Stock", sub: "Stock that arrived without a purchase order.", qty: "Quantity Received", save: "Save Receipt", noteReq: false },
  issue: { title: "Issue Stock", sub: "Record stock used from a store.", qty: "Quantity Issued", save: "Save Issue", noteReq: false },
  wastage: { title: "Record Wastage", sub: "Record damaged or unusable stock.", qty: "Wasted Quantity", save: "Save Wastage", noteReq: true },
  adjust: { title: "Adjust Stock", sub: "Fix one item's balance after checking it.", qty: "Counted Quantity", save: "Save Adjustment", noteReq: true },
};
export function MoveSheet({ inv, type, itemId, store: store0, onClose, onDone }: { inv: Inv; type: MT; itemId?: string; store?: string; onClose: () => void; onDone: (msg: string) => void }) {
  const ui = MOVE_UI[type];
  const [id, setId] = useState(itemId ?? inv.items[0]?.id ?? "");
  const it = inv.items.find((x) => x.id === id);
  const [store, setStore] = useState(store0 || "main");
  const [amt, setAmt] = useState("");
  const [inBuyUnit, setInBuyUnit] = useState(type === "receive" && !!it?.buyUnit);
  const [note, setNote] = useState("");
  const [ref, setRef] = useState("");
  const [sup, setSup] = useState(it?.supplier ?? "");
  const [cost, setCost] = useState(it ? String(it.cost) : "");
  const [err, setErr] = useState("");
  const have = it ? it.stock[store] ?? 0 : 0;
  const mult = inBuyUnit && it?.perBuy ? it.perBuy : 1;
  const n = q(Number(amt) * mult);
  const after = !it || amt === "" ? null : q(type === "receive" ? have + n : type === "adjust" ? n : have - n);
  const over = !!it && (type === "issue" || type === "wastage") && amt !== "" && n > have;
  const value = it && after !== null ? Math.round(Math.abs(after - have) * it.cost) : 0;
  const needsOk = (type === "wastage" || type === "adjust") && inv.role === "keeper" && value > inv.st.settings.approveAbove;
  const pick = (v: string) => { setId(v); const x = inv.items.find((y) => y.id === v); setSup(x?.supplier ?? ""); setCost(x ? String(x.cost) : ""); setInBuyUnit(type === "receive" && !!x?.buyUnit); setErr(""); };
  const save = () => {
    if (ui.noteReq && !note.trim()) { setErr("Add a short note — it shows in Movement History."); return; }
    const unitCost = type === "receive" && cost ? Number(cost) : undefined;
    const e = inv.move(type, id, n, { note: note.trim(), ref: ref.trim(), store, supplier: type === "receive" ? sup : undefined, cost: unitCost });
    if (e === "pending") { onDone(`Sent to a manager for approval — ${it?.name}`); onClose(); return; }
    if (e) { setErr(e); return; }
    onDone(`${ui.title.replace("Record ", "")} saved — ${it?.name}`);
    onClose();
  };
  if (!inv.items.length) return <Sheet title={ui.title} onClose={onClose} footer={<button onClick={onClose} className={clsx(btnLine, "flex-1")}>Close</button>}><p className="text-[14.5px] text-hms-muted">Add an item first, then record its movements.</p></Sheet>;
  const unitLabel = inBuyUnit && it?.buyUnit ? it.buyUnit : it?.unit ?? "";
  return (
    <Sheet title={ui.title} sub={ui.sub} onClose={onClose} footer={<Foot onClose={onClose} label={needsOk ? "Send for approval" : ui.save} onSave={save} disabled={!it || amt === "" || over || (type !== "adjust" && !(n > 0))} />}>
      <div className="space-y-4">
        <p className="text-[14px] font-semibold">Movement details</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <div><label htmlFor="mv-item" className={lbl}>Stock Item</label>
            <select id="mv-item" value={id} onChange={(e) => pick(e.target.value)} className={input}>{inv.items.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.sku}</option>)}</select></div>
          <div><label htmlFor="mv-store" className={lbl}>Store</label>
            <select id="mv-store" value={store} onChange={(e) => { setStore(e.target.value); setErr(""); }} className={input}>{inv.st.stores.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
        </div>
        <div><label htmlFor="mv-qty" className={lbl}>{ui.qty}</label>
          <div className="flex gap-2">
            <div className="flex-1"><QtyInput id="mv-qty" value={amt} onChange={(v) => { setAmt(v); setErr(""); }} unit={unitLabel} invalid={over} /></div>
            {type === "receive" && it?.buyUnit && (
              <div role="radiogroup" aria-label="Quantity unit" className="flex rounded-lg border border-hms-line p-1">
                {([[true, it.buyUnit], [false, it.unit]] as const).map(([v, l]) => <button key={l} type="button" role="radio" aria-checked={inBuyUnit === v} onClick={() => setInBuyUnit(v)} className={clsx("rounded-md px-3 text-[13.5px] font-semibold", inBuyUnit === v ? "bg-hms-ink text-white" : "text-hms-muted")}>{l}</button>)}
              </div>
            )}
          </div>
          {inBuyUnit && it?.perBuy && amt !== "" && <p className="mt-1 text-[12.5px] text-hms-muted">= {fmtQty(n, it.unit)} (1 {it.buyUnit} = {it.perBuy} {it.unit})</p>}
          {over && it && <Err>Enter {fmtQty(have, it.unit)} or less. This store has {fmtQty(have, it.unit)} available.</Err>}
          {type === "adjust" && <p className="mt-1 text-[12.5px] text-hms-muted">Enter the total quantity you physically counted in this store. For many items use Stock count.</p>}</div>
        {it && (
          <div className="flex items-center gap-3 rounded-lg bg-[#f4f6f8] px-4 py-3">
            <span className="flex-1"><span className="block text-[14px] font-semibold">Balance in {inv.st.stores.find((x) => x.id === store)?.name}</span><span className="text-[12.5px] text-hms-muted">{type === "adjust" && after !== null ? `Adjustment of ${after - have > 0 ? "+" : ""}${fmtQty(q(after - have), it.unit)}` : "After saving"}</span></span>
            <span className="tabular-nums text-[14.5px] font-semibold">{fmtQty(have, it.unit)}</span><ArrowRight className="size-4 text-hms-muted" />
            <span className={clsx("tabular-nums text-[15px] font-bold", after === null ? "text-hms-muted" : after < 0 ? "text-[#c81e1e]" : "text-[#16693a]")}>{after === null ? "—" : fmtQty(after, it.unit)}</span>
          </div>
        )}
        {needsOk && <p className="flex items-start gap-2 rounded-lg bg-[#fdf3d9] px-3 py-2 text-[13px] text-[#6b4309]"><Clock className="mt-0.5 size-4 shrink-0" />Worth {tk(value)} — above the {tk(inv.st.settings.approveAbove)} limit, so a manager approves it before stock changes.</p>}
        {type === "receive" ? (
          <Fold title="Supplier & cost details" sub="Supplier, unit cost & invoice" open>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="mv-sup" className={lbl}>Supplier</label><select id="mv-sup" value={sup} onChange={(e) => setSup(e.target.value)} className={input}><option value="">None</option>{inv.st.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div><label htmlFor="mv-cost" className={lbl}>Unit Cost (৳ per {it?.unit})</label><input id="mv-cost" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value.replace(/[^\d.]/g, ""))} className={input} /></div>
              <div className="col-span-2"><label htmlFor="mv-ref" className={lbl}>Supplier Invoice / Reference</label><input id="mv-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. INV-CS-105" className={input} /></div>
            </div>
            <p className="text-[12.5px] text-hms-muted">Have a purchase order? Receive it from Purchase orders so the order shows what arrived.</p>
          </Fold>
        ) : null}
        <div><label htmlFor="mv-note" className={clsx(lbl, "flex justify-between")}>Note <span className="font-normal text-hms-muted">{ui.noteReq ? "Required" : "Optional"}</span></label>
          <textarea id="mv-note" rows={3} value={note} onChange={(e) => { setNote(e.target.value); setErr(""); }} placeholder={type === "issue" ? "e.g. Housekeeping use" : type === "wastage" ? "e.g. Packaging damaged during storage" : type === "adjust" ? "e.g. Physical count at shift handover" : "e.g. Morning delivery"} className={clsx(input, "h-auto py-2.5")} />
          <div className="mt-1.5 flex flex-wrap gap-1.5">{(type === "issue" ? ["Housekeeping use", "Breakfast service", "Room minibar", "Restaurant"] : type === "wastage" ? ["Damaged", "Expired", "Spilled"] : type === "adjust" ? ["Physical count", "Shift handover"] : ["Morning delivery"]).map((x) => <button key={x} type="button" onClick={() => setNote(x)} className="h-7 rounded-md border border-hms-line px-2 text-[12.5px] hover:bg-hms-hover">{x}</button>)}</div>
        </div>
        {type !== "receive" && (
          <Fold title="Additional details" sub="Reference">
            <div><label htmlFor="mv-ref2" className={lbl}>Reference</label><input id="mv-ref2" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. Room 204 or KOT-118" className={input} /></div>
          </Fold>
        )}
        {err && <Err>{err}</Err>}
      </div>
    </Sheet>
  );
}

// ---------------- Transfer ----------------
export function TransferSheet({ inv, itemId, from: from0, onClose, onDone }: { inv: Inv; itemId?: string; from?: string; onClose: () => void; onDone: (m: string) => void }) {
  const stores = inv.st.stores;
  const [id, setId] = useState(itemId ?? inv.items[0]?.id ?? "");
  const [from, setFrom] = useState(from0 || MAIN);
  const [to, setTo] = useState(stores.find((x) => x.id !== (from0 || MAIN))?.id ?? "");
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const it = inv.items.find((x) => x.id === id);
  const have = it?.stock[from] ?? 0, there = it?.stock[to] ?? 0, n = Number(amt);
  const over = amt !== "" && n > have;
  const save = () => { const e = inv.transfer(id, from, to, n, note.trim()); if (e) { setErr(e); return; } onDone(`Transferred ${fmtQty(q(n), it!.unit)} ${it!.name} → ${stores.find((x) => x.id === to)?.name}`); onClose(); };
  const name = (s: string) => stores.find((x) => x.id === s)?.name ?? "";
  return (
    <Sheet title="Transfer Stock" sub="Move stock between your stores — e.g. Main Store → Kitchen." onClose={onClose} footer={<Foot onClose={onClose} label="Save Transfer" onSave={save} disabled={!it || !(n > 0) || over || from === to} />}>
      <div className="space-y-4">
        <div><label htmlFor="tr-item" className={lbl}>Stock Item</label><select id="tr-item" value={id} onChange={(e) => { setId(e.target.value); setErr(""); }} className={input}>{inv.items.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.sku}</option>)}</select></div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div><label htmlFor="tr-from" className={lbl}>From</label><select id="tr-from" value={from} onChange={(e) => { setFrom(e.target.value); setErr(""); }} className={input}>{stores.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
          <ArrowRight className="mb-3.5 size-4 text-hms-muted" aria-hidden />
          <div><label htmlFor="tr-to" className={lbl}>To</label><select id="tr-to" value={to} onChange={(e) => { setTo(e.target.value); setErr(""); }} className={input}>{stores.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
        </div>
        {from === to && <Err>Pick two different stores</Err>}
        <div><label htmlFor="tr-qty" className={lbl}>Quantity</label><QtyInput id="tr-qty" value={amt} onChange={(v) => { setAmt(v); setErr(""); }} unit={it?.unit ?? ""} invalid={over} />
          {over && it && <Err>{name(from)} has {fmtQty(have, it.unit)}.</Err>}</div>
        {it && (
          <div className="grid grid-cols-2 gap-2 text-[13.5px]">
            {[[from, have, -1], [to, there, 1]].map(([s, h, sign]) => (
              <div key={s as string} className="rounded-lg bg-[#f4f6f8] px-3 py-2.5"><p className="font-semibold">{name(s as string)}</p><p className="tabular-nums text-hms-muted">{fmtQty(h as number, it.unit)} → <b className="text-hms-ink">{amt === "" ? "—" : fmtQty(q((h as number) + (sign as number) * n), it.unit)}</b></p></div>
            ))}
          </div>
        )}
        <div><label htmlFor="tr-note" className={clsx(lbl, "flex justify-between")}>Note <span className="font-normal text-hms-muted">Optional</span></label><input id="tr-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Dinner prep" className={input} /></div>
        {err && <Err>{err}</Err>}
      </div>
    </Sheet>
  );
}

// ---------------- Store ----------------
export function StoreSheet({ inv, loc, onClose }: { inv: Inv; loc?: Location; onClose: () => void }) {
  const [name, setName] = useState(loc?.name ?? "");
  const [kind, setKind] = useState<StoreKind>(loc?.kind ?? "other");
  const [tried, setTried] = useState(false);
  const dup = inv.st.stores.some((x) => x.id !== loc?.id && x.name.trim().toLowerCase() === name.trim().toLowerCase());
  const used = loc ? inv.items.filter((i) => (i.stock[loc.id] ?? 0) !== 0).length : 0;
  const save = () => { setTried(true); if (!name.trim() || dup) return; inv.saveStore({ id: loc?.id ?? inv.newId("st"), name: name.trim(), kind }); onClose(); };
  return (
    <Sheet title={loc ? "Edit Store" : "Add Store"} sub="A place that keeps its own stock — store room, kitchen, bar, housekeeping." onClose={onClose} footer={<Foot onClose={onClose} label="Save Store" onSave={save} />}>
      <div className="space-y-4">
        <div><label htmlFor="stn" className={lbl}>Store Name</label><input id="stn" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pool Bar" className={input} />{tried && !name.trim() && <Err>Enter a name</Err>}{tried && dup && <Err>This store already exists</Err>}</div>
        <div><label htmlFor="stk" className={lbl}>Type</label><select id="stk" value={kind} disabled={loc?.id === MAIN} onChange={(e) => setKind(e.target.value as StoreKind)} className={input}>{(Object.keys(KIND_LABEL) as StoreKind[]).filter((k) => k !== "main" || loc?.id === MAIN).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select></div>
        {loc && loc.id !== MAIN && <button type="button" disabled={used > 0} onClick={() => { inv.removeStore(loc.id); onClose(); }} className="text-[13.5px] font-semibold text-[#c81e1e] disabled:text-hms-muted">{used ? `${used} item${used === 1 ? " has" : "s have"} stock here — transfer it out to delete the store` : "Delete store"}</button>}
      </div>
    </Sheet>
  );
}

// ---------------- Category & supplier ----------------
export function CategorySheet({ inv, cat, onClose }: { inv: Inv; cat?: Category; onClose: () => void }) {
  const [name, setName] = useState(cat?.name ?? "");
  const [tried, setTried] = useState(false);
  const dup = inv.st.categories.some((c) => c.id !== cat?.id && c.name.trim().toLowerCase() === name.trim().toLowerCase());
  const used = cat ? inv.items.filter((i) => i.category === cat.id).length : 0;
  const save = () => { setTried(true); if (!name.trim() || dup) return; inv.saveCategory({ id: cat?.id ?? inv.newId("c"), name: name.trim() }); onClose(); };
  return (
    <Sheet title={cat ? "Edit Category" : "Add Category"} sub={cat ? `${used} item${used === 1 ? "" : "s"}` : "Create an inventory category."} onClose={onClose} footer={<Foot onClose={onClose} label="Save Category" onSave={save} />}>
      <div className="space-y-4">
        <p className="text-[14px] font-semibold">Category details</p>
        <div><label htmlFor="cat-name" className={lbl}>Category Name</label><input id="cat-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maintenance Supplies" className={input} />
          {tried && !name.trim() && <Err>Enter a name</Err>}{tried && dup && <Err>This category already exists</Err>}</div>
        <Hint>Use categories to group and filter stock items.</Hint>
        {cat && <button type="button" disabled={used > 0} onClick={() => { inv.removeCategory(cat.id); onClose(); }} className="text-[13.5px] font-semibold text-[#c81e1e] disabled:text-hms-muted">{used ? "Move its items to another category to delete it" : "Delete category"}</button>}
      </div>
    </Sheet>
  );
}

export function SupplierSheet({ inv, sup, onClose }: { inv: Inv; sup?: Supplier; onClose: () => void }) {
  const [f, setF] = useState<Supplier>(sup ?? { id: inv.newId("s"), name: "", contact: "", phone: "", email: "", address: "" });
  const [tried, setTried] = useState(false);
  const set = (k: keyof Supplier, v: string) => setF((x) => ({ ...x, [k]: v }));
  const dup = inv.st.suppliers.some((s) => s.id !== f.id && s.name.trim().toLowerCase() === f.name.trim().toLowerCase());
  const badEmail = !!f.email && !/^\S+@\S+\.\S+$/.test(f.email);
  const used = inv.items.filter((i) => i.supplier === f.id).length;
  const save = () => { setTried(true); if (!f.name.trim() || dup || badEmail) return; inv.saveSupplier({ ...f, name: f.name.trim() }); onClose(); };
  const opt = <span className="font-normal text-hms-muted">Optional</span>;
  return (
    <Sheet title={sup ? "Edit Supplier" : "Add Supplier"} sub={sup ? `${used} item${used === 1 ? "" : "s"} use this supplier` : "Create a supplier record."} onClose={onClose} footer={<Foot onClose={onClose} label="Save Supplier" onSave={save} />}>
      <div className="space-y-4">
        <p className="text-[14px] font-semibold">Supplier details</p>
        <div><label htmlFor="sp-name" className={lbl}>Supplier Name</label><input id="sp-name" autoFocus value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Seaside Essentials" className={input} />{tried && !f.name.trim() && <Err>Enter a name</Err>}{tried && dup && <Err>This supplier already exists</Err>}</div>
        <div><label htmlFor="sp-c" className={clsx(lbl, "flex justify-between")}>Contact Name {opt}</label><input id="sp-c" value={f.contact} onChange={(e) => set("contact", e.target.value)} placeholder="Vendor representative" className={input} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="sp-p" className={clsx(lbl, "flex justify-between")}>Phone {opt}</label><input id="sp-p" inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="01XXX-XXXXXX" className={input} /></div>
          <div><label htmlFor="sp-e" className={clsx(lbl, "flex justify-between")}>Email {opt}</label><input id="sp-e" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="Enter email" className={input} />{tried && badEmail && <Err>Check the email</Err>}</div>
        </div>
        <div><label htmlFor="sp-a" className={clsx(lbl, "flex justify-between")}>Address {opt}</label><textarea id="sp-a" rows={3} value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Enter address" className={clsx(input, "h-auto py-2.5")} /></div>
        {sup && <button type="button" disabled={used > 0} onClick={() => { inv.removeSupplier(sup.id); onClose(); }} className="text-[13.5px] font-semibold text-[#c81e1e] disabled:text-hms-muted">{used ? "Items use this supplier — change them to delete it" : "Delete supplier"}</button>}
      </div>
    </Sheet>
  );
}
