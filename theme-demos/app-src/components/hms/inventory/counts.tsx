"use client";
// Stock count: count a whole store at once (month-end or spot check). The keeper enters counted quantities,
// a manager reviews the differences and posts them — each difference becomes one adjustment in History.
import clsx from "clsx";
import { useState } from "react";
import { ArrowLeft, ClipboardList, Eye, EyeOff, Plus } from "lucide-react";
import { CAN, fmtQty, q, tk, type Count } from "@/lib/inventory/store";
import { btnLine, btnPrimary, input, lbl } from "../guests/ui";
import { Err, QtyInput } from "./sheets";
import { InventoryFrame, useInv } from "./frame";

const card = "rounded-xl border border-hms-line bg-white";
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (iso: string) => `${iso.slice(8, 10)} ${MON[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
const LBL: Record<Count["status"], [string, string]> = { open: ["Counting", "bg-[#e8f0fe] text-[#1d4ed8]"], review: ["Waiting review", "bg-[#fdf3d9] text-[#7a5200]"], posted: ["Posted", "bg-[#e5f5ec] text-[#16693a]"] };

export function CountPage() { return <InventoryFrame tab="count"><Counts /></InventoryFrame>; }
function Counts() {
  const { inv } = useInv();
  const [openId, setOpenId] = useState<string | null>(null);
  const [store, setStore] = useState("main");
  const [cat, setCat] = useState("");
  const stores = new Map(inv.st.stores.map((s) => [s.id, s.name]));
  const cur = inv.st.counts.find((c) => c.id === openId);
  if (cur) return <Session c={cur} onBack={() => setOpenId(null)} />;
  return (
    <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
      <section className={clsx(card, "self-start p-5")}>
        <h2 className="text-[17px] font-bold">Start a count</h2>
        <p className="text-[13px] text-hms-muted">Count everything in one store. Stock keeps moving while you count — differences are worked out when you post.</p>
        <div className="mt-4 space-y-3">
          <div><label htmlFor="cn-store" className={lbl}>Store</label><select id="cn-store" value={store} onChange={(e) => setStore(e.target.value)} className={input}>{inv.st.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label htmlFor="cn-cat" className={lbl}>Category</label><select id="cn-cat" value={cat} onChange={(e) => setCat(e.target.value)} className={input}><option value="">All categories</option>{inv.st.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <button onClick={() => setOpenId(inv.startCount(store, cat))} disabled={!inv.items.length} className={clsx(btnPrimary, "w-full")}><Plus className="size-4" />Start count</button>
        </div>
      </section>
      <section className={clsx(card, "overflow-hidden")}>
        <div className="px-5 py-4"><h2 className="text-[17px] font-bold">Counts</h2><p className="text-[13px] text-hms-muted">Open, waiting review and posted counts.</p></div>
        {inv.st.counts.length ? (
          <ul className="border-t border-hms-line">{inv.st.counts.map((c) => {
            const done = c.lines.filter((l) => l.counted !== null).length;
            const diff = c.lines.filter((l) => l.counted !== null && l.counted !== l.system).length;
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-3 border-t border-hms-line px-5 py-3.5 first:border-t-0">
                <span className="grid size-10 place-items-center rounded-xl bg-hms-hover text-hms-muted"><ClipboardList className="size-5" aria-hidden /></span>
                <span className="min-w-0 flex-1"><span className="block font-semibold">{c.id} · {stores.get(c.store)}</span><span className="text-[13px] text-hms-muted">{day(c.at)} · {done}/{c.lines.length} counted · {diff} difference{diff === 1 ? "" : "s"} · {c.by}</span></span>
                <span className={clsx("rounded-md px-2 py-0.5 text-[12.5px] font-semibold", LBL[c.status][1])}>{LBL[c.status][0]}</span>
                <button onClick={() => setOpenId(c.id)} className={clsx(btnLine, "h-9 px-3")}>{c.status === "posted" ? "View" : "Open"}</button>
              </li>
            );
          })}</ul>
        ) : <p className="border-t border-hms-line px-5 py-10 text-center text-[14px] text-hms-muted">No counts yet. Start one on the left — month-end or whenever numbers look wrong.</p>}
      </section>
    </div>
  );
}

function Session({ c, onBack }: { c: Count; onBack: () => void }) {
  const { inv, toast } = useInv();
  const [blind, setBlind] = useState(true);
  const [err, setErr] = useState("");
  const items = new Map(inv.st.items.map((i) => [i.id, i]));
  const store = inv.st.stores.find((s) => s.id === c.store)?.name;
  const locked = c.status === "posted" || (c.status === "review" && !CAN.postCount(inv.role));
  const done = c.lines.filter((l) => l.counted !== null).length;
  const rows = c.lines.map((l) => { const it = items.get(l.item)!; const now = c.status === "posted" ? l.system : it.stock[c.store] ?? 0; const d = l.counted === null ? null : q(l.counted - now); return { l, it, now, d, val: d === null ? 0 : Math.round(d * it.cost) }; });
  const net = rows.reduce((s, r) => s + r.val, 0);
  const showSys = !blind || c.status !== "open";
  const post = () => { const e = inv.postCount(c.id); if (e) { setErr(e); return; } toast(`${c.id} posted — differences saved as adjustments`); onBack(); };
  return (
    <section className={clsx(card, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <button onClick={onBack} aria-label="Back to counts" className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover"><ArrowLeft className="size-5" /></button>
        <div className="mr-auto"><h2 className="text-[17px] font-bold">{c.id} · {store}</h2><p className="text-[13px] text-hms-muted">{done} of {c.lines.length} counted{c.status !== "open" ? ` · net difference ${net >= 0 ? "+" : "−"}${tk(Math.abs(net))}` : ""}</p></div>
        {c.status === "open" && <button onClick={() => setBlind((b) => !b)} aria-pressed={!blind} className={clsx(btnLine, "h-10")}>{blind ? <Eye className="size-4" /> : <EyeOff className="size-4" />}{blind ? "Show system qty" : "Hide system qty"}</button>}
        {c.status === "open" && <button onClick={() => { if (c.lines.some((l) => l.counted === null)) { setErr("Count every item first (enter 0 if there is none)"); return; } inv.submitCount(c.id); toast(`${c.id} sent for review`); }} className={clsx(CAN.postCount(inv.role) ? btnLine : btnPrimary, "h-10")}>Finish counting</button>}
        {c.status !== "posted" && CAN.postCount(inv.role) && <button onClick={post} className={clsx(btnPrimary, "h-10")}>Post differences</button>}
      </div>
      {c.status === "open" && blind && <p className="border-t border-hms-line bg-[#f8f9fb] px-5 py-2.5 text-[13px] text-hms-muted">Blind count: system quantities are hidden so the count is honest. A manager sees the differences when reviewing.</p>}
      {c.status === "review" && !CAN.postCount(inv.role) && <p className="border-t border-hms-line bg-[#fdf3d9] px-5 py-2.5 text-[13px] text-[#6b4309]">Sent for review — a manager posts the differences.</p>}
      {err && <div className="border-t border-hms-line px-5 py-2"><Err>{err}</Err></div>}
      <div className="overflow-x-auto border-t border-hms-line" tabIndex={0} role="region" aria-label="Count lines">
        <table className={clsx("w-full text-[14px]", showSys && "min-w-[720px]")}>
          <thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2.5 font-medium">Item</th>{showSys && <th className="px-3 py-2.5 text-right font-medium">System</th>}<th className="px-3 py-2.5 font-medium">Counted</th>{showSys && <><th className="px-3 py-2.5 text-right font-medium">Difference</th><th className="px-5 py-2.5 text-right font-medium">Value</th></>}</tr></thead>
          <tbody>{rows.map(({ l, it, now, d, val }) => (
            <tr key={l.item} className="border-t border-hms-line">
              <td className="px-4 py-2 sm:px-5"><span className="block font-semibold">{it.name}</span><span className="text-[12.5px] text-hms-muted">{it.sku}</span></td>
              {showSys && <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{fmtQty(now, it.unit)}</td>}
              <td className="w-[140px] py-2 pl-2 pr-4 sm:w-[180px] sm:px-3">{locked ? <span className="font-semibold tabular-nums">{l.counted === null ? "—" : fmtQty(l.counted, it.unit)}</span> : <><QtyInput id={`cnt-${l.item}`} label={`Counted ${it.name}`} value={l.counted === null ? "" : String(l.counted)} onChange={(v) => { inv.setCounted(c.id, l.item, v === "" ? null : Number(v)); setErr(""); }} unit={it.unit} /></>}</td>
              {showSys && <>
                <td className={clsx("whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums", d === null ? "text-hms-muted" : d < 0 ? "text-[#b11c29]" : d > 0 ? "text-[#16693a]" : "")}>{d === null ? "—" : d === 0 ? "OK" : `${d > 0 ? "+" : "−"}${fmtQty(Math.abs(d), it.unit)}`}</td>
                <td className="whitespace-nowrap px-5 py-2 text-right tabular-nums">{d ? `${val > 0 ? "+" : "−"}${tk(Math.abs(val))}` : "—"}</td>
              </>}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="border-t border-hms-line px-5 py-3 text-[13px] text-hms-muted">{c.status === "posted" ? `Posted by ${c.postedBy}. Adjustments are in History with reference ${c.id}.` : "Counted quantities save as you type."}</p>
    </section>
  );
}
