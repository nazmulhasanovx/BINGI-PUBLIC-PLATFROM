"use client";
// Discounts & Rates — one place for every price: a month calendar per room category (Easy) and a
// category → room grid for the whole property (Advanced), plus discount campaigns. Rules: src/lib/rates/store.ts.
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, CircleCheck, Copy, Lock, Pause, Pencil, Play, Plus, Sparkles, Tag, Trash2, X } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { addDays, campaignState, dow, isWeekend, range, tk, useRates, type Campaign, type DayRule } from "@/lib/rates/store";
import { useProperty } from "../property";
import { Sheet, btnLine, btnPrimary, input, lbl } from "../guests/ui";

type Rates = ReturnType<typeof useRates>;
const card = "rounded-xl border border-hms-line bg-white";
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const short = (iso: string) => `${MON[Number(iso.slice(5, 7)) - 1].slice(0, 3)} ${Number(iso.slice(8, 10))}`;
const monthDays = (ym: string) => { const first = `${ym}-01`; const n = new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)), 0)).getUTCDate(); return range(first, `${ym}-${String(n).padStart(2, "0")}`); };
const kShort = (n: number) => (n >= 1000 ? `৳${(Math.round(n / 100) / 10).toString()}k` : tk(n));
const shiftMonth = (ym: string, k: number) => { const d = new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1 + k, 1)); return d.toISOString().slice(0, 7); };

function Frame({ tab, children, rt, toast }: { tab: "calendar" | "discounts"; children: ReactNode; rt: Rates; toast: string }) {
  return (
    <div className="h-full overflow-y-auto"><div className="hms-page">
      <div><h1 className="text-[24px] font-bold tracking-[-0.01em]">Discounts &amp; Rates</h1><p className="text-[14px] text-hms-muted">Set every night&apos;s price from one calendar, and run discounts on top.</p></div>
      <nav aria-label="Discounts & Rates sections" className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-hms-line">
        {([["calendar", "Rates calendar", "/hms/discounts"], ["discounts", `Discounts · ${rt.st.campaigns.filter((c) => campaignState(c) === "active").length} active`, "/hms/discounts/campaigns"]] as const).map(([id, l, href]) => (
          <Link key={id} href={href} aria-current={tab === id ? "page" : undefined} className={clsx("-mb-px shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-[14.5px] font-semibold", tab === id ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}>{l}</Link>
        ))}
      </nav>
      <div key={tab} className="hms-page-in mt-5">{children}</div>
    </div>
    {toast && <div role="status" className="hms-up fixed bottom-6 left-1/2 z-[95] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0f1720] px-4 py-2.5 text-[14px] font-medium text-white shadow-lg"><CircleCheck className="size-4 shrink-0 text-[#7ee2a8]" />{toast}</div>}
    </div>
  );
}
function useToast() { const [t, setT] = useState(""); const show = (m: string) => { setT(m); setTimeout(() => setT((x) => (x === m ? "" : x)), 2600); }; return [t, show] as const; }
function Locked() {
  return <div className="h-full overflow-y-auto"><div className="mx-auto max-w-[720px] p-6"><div className="mt-10 rounded-2xl border border-hms-line bg-white p-8 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-hms-coral-soft text-hms-red"><Lock className="size-7" /></span><h1 className="mt-4 text-[22px] font-bold">Add rooms first</h1><p className="mx-auto mt-2 max-w-[440px] text-[14.5px] text-hms-muted">Prices are set per room category. Publish at least one room in Rooms, then come back.</p><Link href="/hms/rooms" className={clsx(btnPrimary, "mt-5")}>Go to Rooms</Link></div></div></div>;
}

// =================== Rates calendar ===================
type Sel = { row: string; kind: "cat" | "unit"; dates: string[] } | null;
export function RatesPage() {
  const h = useProperty();
  const rt = useRates(h);
  const [toast, show] = useToast();
  const [mode, setMode] = useState<"easy" | "advanced">("easy");
  const [ym, setYm] = useState(TODAY.slice(0, 7));
  const [cat, setCat] = useState("");
  const [sel, setSel] = useState<Sel>(null);
  if (!rt.cats.length) return <Locked />;
  const catId = rt.cats.some((c) => c.id === cat) ? cat : rt.cats[0].id;
  return (
    <Frame tab="calendar" rt={rt} toast={toast}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button onClick={() => { setYm(shiftMonth(ym, -1)); setSel(null); }} aria-label="Previous month" className="grid size-10 place-items-center rounded-lg border border-hms-line bg-white hover:bg-hms-hover"><ChevronLeft className="size-4" /></button>
          <h2 className="min-w-[170px] text-center text-[20px] font-bold">{MON[Number(ym.slice(5, 7)) - 1]} {ym.slice(0, 4)}</h2>
          <button onClick={() => { setYm(shiftMonth(ym, 1)); setSel(null); }} aria-label="Next month" className="grid size-10 place-items-center rounded-lg border border-hms-line bg-white hover:bg-hms-hover"><ChevronRight className="size-4" /></button>
          {ym !== TODAY.slice(0, 7) && <button onClick={() => setYm(TODAY.slice(0, 7))} className="ml-1 text-[13.5px] font-semibold text-hms-red">Today</button>}
        </div>
        <div role="radiogroup" aria-label="Mode" className="ml-auto flex rounded-lg bg-[#e9edf2] p-1">
          {([["easy", "Easy · by category"], ["advanced", "Advanced · room by room"]] as const).map(([v, l]) => <button key={v} role="radio" aria-checked={mode === v} onClick={() => { setMode(v); setSel(null); }} className={clsx("h-9 rounded-md px-3 text-[13.5px] font-semibold", mode === v ? "bg-white shadow-sm" : "text-[#4d5664]")}>{l}</button>)}
        </div>
      </div>
      <div className={clsx("grid gap-4", (mode === "easy" || sel) && "xl:grid-cols-[minmax(0,1fr)_340px]")}>
        <div className="min-w-0">
          {mode === "easy"
            ? <EasyCalendar rt={rt} ym={ym} catId={catId} setCat={(c) => { setCat(c); setSel(null); }} sel={sel} setSel={setSel} />
            : <AdvancedGrid rt={rt} ym={ym} sel={sel} setSel={setSel} />}
        </div>
        <aside className="xl:sticky xl:top-4 xl:self-start">
          {sel ? <EditPanel key={`${sel.row}-${sel.dates[0]}-${sel.dates.length}`} rt={rt} sel={sel} onClose={() => setSel(null)} onDone={(m) => { show(m); setSel(null); }} />
            : <div className={clsx(mode === "advanced" && "grid gap-4 lg:grid-cols-2 [&>div]:contents")}><Summary rt={rt} ym={ym} catId={mode === "easy" ? catId : ""} onDone={show} /></div>}
        </aside>
      </div>
    </Frame>
  );
}

function EasyCalendar({ rt, ym, catId, setCat, sel, setSel }: { rt: Rates; ym: string; catId: string; setCat: (c: string) => void; sel: Sel; setSel: (s: Sel) => void }) {
  const days = monthDays(ym);
  const lead = dow(days[0]);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [rangeMode, setRangeMode] = useState(false);
  const pick = (d: string, shift: boolean) => {
    if ((shift || rangeMode) && anchor && sel?.row === catId) { setSel({ row: catId, kind: "cat", dates: range(anchor, d) }); setRangeMode(false); return; }
    setAnchor(d); setSel({ row: catId, kind: "cat", dates: [d] });
  };
  const count = (id: string) => rt.units.filter((u) => u.category === id).length;
  const future = days.filter((d) => d >= TODAY);
  return (
    <div className="grid gap-4 2xl:grid-cols-[250px_minmax(0,1fr)]">
      <div role="radiogroup" aria-label="Room category" className="flex gap-2 overflow-x-auto pb-1 2xl:flex-col 2xl:overflow-visible">
        {rt.cats.map((c) => { const tonight = rt.catPrice(c.id, TODAY); const on = c.id === catId; return (
          <button key={c.id} role="radio" aria-checked={on} onClick={() => setCat(c.id)} className={clsx("min-w-[200px] shrink-0 rounded-xl border p-3 text-left transition-colors 2xl:min-w-0", on ? "border-hms-ink bg-white shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line bg-white hover:bg-hms-hover")}>
            <span className="block truncate text-[14.5px] font-semibold">{c.name}</span>
            <span className="text-[12.5px] text-hms-muted">{count(c.id)} room{count(c.id) === 1 ? "" : "s"} · base {tk(c.baseRate)}</span>
            <span className="mt-1.5 flex items-baseline gap-1.5"><b className="text-[18px] tabular-nums">{tonight.closed ? "Closed" : tk(tonight.price)}</b><span className="text-[12px] text-hms-muted">tonight{tonight.from === "custom" ? " · custom" : tonight.from === "weekend" ? " · weekend" : ""}</span></span>
          </button>
        ); })}
      </div>
      <section className={clsx(card, "overflow-hidden p-2 sm:p-3")} aria-label={`${rt.cats.find((c) => c.id === catId)?.name} prices`}>
        <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
          <span className="text-[13px] text-hms-muted">Tap a night · <span className="hidden sm:inline">Shift-click</span><span className="sm:hidden">“Select range”</span> to pick many</span>
          <span className="ml-auto flex flex-wrap gap-1.5">
            <button onClick={() => setRangeMode((x) => !x)} aria-pressed={rangeMode} className={clsx("h-8 rounded-lg border px-2.5 text-[12.5px] font-semibold sm:hidden", rangeMode ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line")}>Select range</button>
            <button onClick={() => future.length && setSel({ row: catId, kind: "cat", dates: future.filter(isWeekend) })} className="h-8 rounded-lg border border-hms-line px-2.5 text-[12.5px] font-semibold hover:bg-hms-hover">Weekends</button>
            <button onClick={() => future.length && setSel({ row: catId, kind: "cat", dates: future })} className="h-8 rounded-lg border border-hms-line px-2.5 text-[12.5px] font-semibold hover:bg-hms-hover">Whole month</button>
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {DOW.map((d, i) => <div key={d} aria-hidden className={clsx("pb-1 text-center text-[12px] font-semibold", [5, 6].includes(i) ? "text-[#7a5200]" : "text-hms-muted")}>{d}</div>)}
          {Array.from({ length: lead }, (_, i) => <div key={`e${i}`} />)}
          {days.map((d) => {
            const p = rt.catPrice(catId, d), past = d < TODAY, on = sel?.row === catId && sel.dates.includes(d);
            const dl = !p.closed ? rt.deal(catId, d, p.price) : null;
            return (
              <button key={d} disabled={past} aria-pressed={on} onClick={(e) => pick(d, e.shiftKey)}
                className={clsx("relative flex aspect-[1/1.05] min-w-0 flex-col justify-between rounded-lg border p-1.5 text-left transition-colors sm:aspect-[1.15/1] sm:p-2.5",
                  on ? "border-hms-ink bg-hms-ink text-white" : past ? "border-transparent bg-[#f4f6f8] text-[#9aa0aa]" : p.closed ? "border-hms-line bg-[repeating-linear-gradient(135deg,#fff,#fff_6px,#f1f3f6_6px,#f1f3f6_12px)]" : isWeekend(d) ? "border-[#f3e3bd] bg-[#fffbf1] hover:border-hms-ink" : "border-hms-line bg-white hover:border-hms-ink")}>
                <span className="flex items-center justify-between text-[12.5px] font-semibold sm:text-[14px]">
                  <span className={clsx(d === TODAY && !on && "grid size-6 place-items-center rounded-full bg-[#b11c29] text-white")}>{Number(d.slice(8))}</span>
                  {p.from === "custom" && !past && <span aria-hidden className={clsx("size-1.5 rounded-full", on ? "bg-white" : "bg-[#1d4ed8]")} />}
                </span>
                <span className="sr-only"> {DOW[dow(d)]} {short(d)}{p.from === "custom" ? ", custom price" : ""}: </span>
                {p.closed ? <span className="text-[11px] font-semibold sm:text-[12.5px]">Closed</span> : (
                  <span className="min-w-0">
                    {dl && !past && <span className={clsx("hidden truncate text-[11px] line-through sm:block", on ? "text-white/70" : "text-hms-muted")}>{tk(p.price)}</span>}
                    <span className={clsx("block truncate text-[11.5px] font-semibold tabular-nums sm:text-[14.5px]", dl && !past && !on && "text-[#16693a]")}><span className="sm:hidden">{kShort(dl?.price ?? p.price)}</span><span className="hidden sm:inline">{tk(dl?.price ?? p.price)}</span></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1 text-[12px] text-hms-muted">
          <li className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#1d4ed8]" />Custom price</li>
          <li className="flex items-center gap-1.5"><span className="size-3 rounded border border-[#f3e3bd] bg-[#fffbf1]" />Weekend (Fri–Sat)</li>
          <li className="flex items-center gap-1.5"><span className="font-semibold text-[#16693a]">৳</span>After automatic deal</li>
          <li className="flex items-center gap-1.5"><span className="size-3 rounded border border-hms-line bg-[repeating-linear-gradient(135deg,#fff,#fff_3px,#e3e7ec_3px,#e3e7ec_5px)]" />Closed (not sold)</li>
        </ul>
      </section>
    </div>
  );
}

/** Advanced: every category and, opened, every room — 14 nights at a time — plus the whole-property total. */
function AdvancedGrid({ rt, ym, sel, setSel }: { rt: Rates; ym: string; sel: Sel; setSel: (s: Sel) => void }) {
  const first = ym === TODAY.slice(0, 7) ? TODAY : `${ym}-01`;
  const [start, setStart] = useState(first);
  const s0 = start.slice(0, 7) === ym ? start : first;
  const days = range(s0, addDays(s0, 13));
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({ [rt.cats[0]?.id ?? ""]: true }));
  const [anchor, setAnchor] = useState<{ row: string; d: string } | null>(null);
  const [editPrem, setEditPrem] = useState<string | null>(null);
  const click = (row: string, kind: "cat" | "unit", d: string, shift: boolean) => {
    if (shift && anchor?.row === row) { setSel({ row, kind, dates: range(anchor.d, d) }); return; }
    setAnchor({ row, d }); setSel({ row, kind, dates: [d] });
  };
  const total = (d: string) => rt.units.reduce((s, u) => { const p = rt.unitPrice(u, d); return s + (p.closed ? 0 : p.price); }, 0);
  const cell = (key: string, d: string, price: number, closed: boolean, strong: boolean, on: boolean, onClick: (e: React.MouseEvent) => void, label: string) => (
    <td key={key} className="p-0.5">
      <button disabled={d < TODAY} onClick={onClick} aria-label={label} aria-pressed={on} className={clsx("h-11 w-full rounded-md px-1.5 text-right text-[13px] tabular-nums transition-colors", on ? "bg-hms-ink text-white" : d < TODAY ? "text-[#9aa0aa]" : closed ? "bg-[#f1f3f6] text-hms-muted" : isWeekend(d) ? "bg-[#fffbf1] hover:ring-1 hover:ring-hms-ink" : "hover:bg-hms-hover hover:ring-1 hover:ring-hms-ink", strong && !on && "font-bold")}>
        {closed ? "Closed" : tk(price)}
      </button>
    </td>
  );
  return (
    <section className={clsx(card, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <p className="mr-auto text-[13px] text-hms-muted">Bold = its own price. Grey = follows the category. Shift-click to pick many nights in one row.</p>
        <button onClick={() => setStart(addDays(s0, -14) < TODAY && ym === TODAY.slice(0, 7) ? TODAY : addDays(s0, -14))} aria-label="Earlier nights" className="grid size-9 place-items-center rounded-lg border border-hms-line hover:bg-hms-hover"><ChevronLeft className="size-4" /></button>
        <span className="text-[13.5px] font-semibold">{short(days[0])} – {short(days[13])}</span>
        <button onClick={() => setStart(addDays(s0, 14))} aria-label="Later nights" className="grid size-9 place-items-center rounded-lg border border-hms-line hover:bg-hms-hover"><ChevronRight className="size-4" /></button>
      </div>
      <div className="overflow-x-auto border-t border-hms-line" tabIndex={0} role="region" aria-label="Rates by room">
        <table className="w-full min-w-[1080px] border-collapse text-[13px]">
          <thead><tr><th className="sticky left-0 z-10 w-[220px] bg-white px-3 py-2 text-left text-[12px] font-semibold text-hms-muted">Category / room</th>
            {days.map((d) => <th key={d} className={clsx("px-1 py-2 text-center text-[12px] font-semibold", isWeekend(d) ? "text-[#7a5200]" : "text-hms-muted")}>{DOW[dow(d)]}<span className={clsx("block text-[13px]", d === TODAY ? "text-[#b11c29]" : "text-hms-ink")}>{Number(d.slice(8))}</span></th>)}</tr></thead>
          <tbody>
            {rt.cats.map((c) => { const us = rt.units.filter((u) => u.category === c.id); const isOpen = !!open[c.id]; return (
              <FragmentRows key={c.id}>
                <tr className="border-t border-hms-line bg-[#fafbfc]">
                  <th scope="row" className="sticky left-0 z-10 bg-[#fafbfc] px-2 py-1 text-left">
                    <button onClick={() => setOpen({ ...open, [c.id]: !isOpen })} aria-expanded={isOpen} className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left hover:bg-hms-hover"><ChevronDown className={clsx("size-4 shrink-0 transition-transform", !isOpen && "-rotate-90")} /><span className="min-w-0"><span className="block truncate font-semibold">{c.name}</span><span className="text-[12px] font-normal text-hms-muted">{us.length} rooms · base {tk(c.baseRate)}</span></span></button>
                  </th>
                  {days.map((d) => { const p = rt.catPrice(c.id, d); return cell(d, d, p.price, p.closed, p.from === "custom", sel?.row === c.id && sel.dates.includes(d), (e) => click(c.id, "cat", d, e.shiftKey), `${c.name} ${short(d)} ${p.closed ? "closed" : tk(p.price)}`); })}
                </tr>
                {isOpen && us.map((u) => { const pr = rt.premium(u); return (
                  <tr key={u.id} className="border-t border-hms-line/60">
                    <th scope="row" className="sticky left-0 z-10 bg-white py-1 pl-8 pr-2 text-left font-normal">
                      <span className="flex items-center gap-2"><span className="font-semibold">Room {u.code}</span>
                        {editPrem === u.id ? <PremiumInput value={pr} onSave={(v) => { rt.setPremium(u.id, v); setEditPrem(null); }} onCancel={() => setEditPrem(null)} label={`Room ${u.code} premium`} />
                          : <button onClick={() => setEditPrem(u.id)} className="rounded-md px-1.5 py-0.5 text-[12px] text-hms-muted hover:bg-hms-hover" aria-label={`${pr ? `${pr > 0 ? "+" : "−"}${tk(Math.abs(pr))}` : "same"}, change room ${u.code} premium`}>{pr ? `${pr > 0 ? "+" : "−"}${tk(Math.abs(pr))}` : "same"} <Pencil className="inline size-3" aria-hidden /></button>}</span>
                    </th>
                    {days.map((d) => { const p = rt.unitPrice(u, d); return cell(d, d, p.price, p.closed, p.from === "room", sel?.row === u.id && sel.dates.includes(d), (e) => click(u.id, "unit", d, e.shiftKey), `Room ${u.code} ${short(d)} ${p.closed ? "closed" : tk(p.price)}`); })}
                  </tr>
                ); })}
              </FragmentRows>
            ); })}
            <tr className="border-t-2 border-hms-ink/20 bg-[#f4f6f8]"><th scope="row" className="sticky left-0 z-10 bg-[#f4f6f8] px-3 py-2 text-left"><span className="block font-bold">Whole property</span><span className="text-[12px] font-normal text-hms-muted">{rt.units.length} rooms, if all sell</span></th>
              {days.map((d) => <td key={d} className="px-1.5 py-2 text-right text-[12.5px] font-semibold tabular-nums">{tk(total(d))}</td>)}</tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
const FragmentRows = ({ children }: { children: ReactNode }) => <>{children}</>;
function PremiumInput({ value, onSave, onCancel, label }: { value: number; onSave: (v: number | null) => void; onCancel: () => void; label: string }) {
  const [v, setV] = useState(value ? String(value) : "");
  return (
    <span className="flex items-center gap-1">
      <input autoFocus aria-label={label} inputMode="numeric" value={v} onChange={(e) => setV(e.target.value.replace(/[^\d-]/g, ""))} onKeyDown={(e) => { if (e.key === "Enter") onSave(Number(v) || null); if (e.key === "Escape") onCancel(); }} placeholder="+0" className="h-8 w-20 rounded-md border border-[#858c97] px-2 text-[13px]" />
      <button onClick={() => onSave(Number(v) || null)} className="h-8 rounded-md bg-hms-ink px-2 text-[12px] font-semibold text-white">Save</button>
    </span>
  );
}

/** Right panel for the picked nights: price, quick changes, open/closed, minimum stay, guest price. */
function EditPanel({ rt, sel, onClose, onDone }: { rt: Rates; sel: NonNullable<Sel>; onClose: () => void; onDone: (m: string) => void }) {
  const unit = sel.kind === "unit" ? rt.units.find((u) => u.id === sel.row) : undefined;
  const catId = unit ? unit.category : sel.row;
  const cat = rt.cats.find((c) => c.id === catId)!;
  const prices = sel.dates.map((d) => (unit ? rt.unitPrice(unit, d) : rt.catPrice(catId, d)));
  const same = prices.every((p) => p.price === prices[0].price);
  const [price, setPrice] = useState(same ? String(prices[0].price) : "");
  const [closed, setClosed] = useState(prices.every((p) => p.closed));
  const minStay0 = !unit ? rt.st.cat[catId]?.[sel.dates[0]]?.minStay : undefined;
  const [minStay, setMinStay] = useState(minStay0 ? String(minStay0) : "");
  const [wkOnly, setWkOnly] = useState(false);
  const n = Number(price);
  const dates = wkOnly ? sel.dates.filter(isWeekend) : sel.dates;
  const ref = prices[0].price;
  const dl = n > 0 ? rt.deal(catId, sel.dates[0], n, unit?.id) : null;
  const vat = Math.round(((dl?.price ?? n) * 1.1) * 0.15 + (dl?.price ?? n) * 0.1);
  const box = useRef<HTMLElement>(null);
  useEffect(() => { if (window.innerWidth < 1280) box.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, []);
  const label = sel.dates.length === 1 ? short(sel.dates[0]) : `${short(sel.dates[0])} – ${short(sel.dates[sel.dates.length - 1])} · ${sel.dates.length} nights`;
  const save = () => {
    const rule: DayRule = { closed, ...(price !== "" && n > 0 ? { price: n } : {}), ...(!unit && minStay ? { minStay: Number(minStay) } : {}) };
    if (unit) rt.setUnitDays(unit.id, dates, rule); else rt.setCatDays(catId, dates, rule);
    onDone(`${unit ? `Room ${unit.code}` : cat.name} · ${dates.length} night${dates.length > 1 ? "s" : ""} updated`);
  };
  const reset = () => { if (unit) rt.setUnitDays(unit.id, dates, null); else rt.setCatDays(catId, dates, null); onDone(`Back to the default price for ${dates.length} night${dates.length > 1 ? "s" : ""}`); };
  return (
    <section ref={box} aria-label="Edit selected nights" className="scroll-mt-4 rounded-2xl bg-[#0f1720] p-5 text-white">
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-[15px] font-semibold">{label}</p><p className="text-[12.5px] text-white/65">{unit ? `Room ${unit.code} · ${cat.name}` : `${cat.name} · all ${rt.units.filter((u) => u.category === catId).length} rooms`}</p></div>
        <button onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-lg hover:bg-white/10"><X className="size-4" /></button>
      </div>
      <label className="mt-6 block text-center"><span className="sr-only">Price per night</span>
        <span className="flex items-center justify-center gap-1"><span className="text-[34px] font-bold">৳</span><input inputMode="numeric" value={price} placeholder={same ? "" : "Mixed"} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} className="w-[190px] bg-transparent text-center text-[44px] font-bold tabular-nums outline-none placeholder:text-white/40" /></span>
      </label>
      <p className="text-center text-[13px] text-white/70">{dl ? <>Guests see <b className="text-[#7ee2a8]">{tk(dl.price)}</b> · {dl.c.name}</> : "No automatic deal on these nights"}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {[-10, -5, 5, 10].map((p) => <button key={p} onClick={() => setPrice(String(Math.round(((n || ref) * (1 + p / 100)) / 50) * 50))} className="h-8 rounded-full border border-white/25 px-3 text-[12.5px] font-semibold hover:bg-white/10">{p > 0 ? "+" : "−"}{Math.abs(p)}%</button>)}
        <button onClick={() => setPrice(String(unit ? cat.baseRate + rt.premium(unit) : cat.baseRate))} className="h-8 rounded-full border border-white/25 px-3 text-[12.5px] font-semibold hover:bg-white/10">Base {tk(unit ? cat.baseRate + rt.premium(unit) : cat.baseRate)}</button>
      </div>
      <div className="mt-5 space-y-3 rounded-xl bg-white/[0.06] p-3 text-[14px]">
        <label className="flex items-center justify-between gap-3"><span><b className="block">Open for sale</b><span className="text-[12.5px] text-white/65">Off = closed, nobody can book</span></span><input type="checkbox" checked={!closed} onChange={(e) => setClosed(!e.target.checked)} className="size-5 accent-[#7ee2a8]" /></label>
        {!unit && <label className="flex items-center justify-between gap-3"><span><b className="block">Minimum stay</b><span className="text-[12.5px] text-white/65">Nights a booking must cover</span></span><input inputMode="numeric" value={minStay} onChange={(e) => setMinStay(e.target.value.replace(/\D/g, ""))} placeholder="1" aria-label="Minimum stay nights" className="h-9 w-16 rounded-lg bg-white/10 px-2 text-center outline-none" /></label>}
        {sel.dates.length > 1 && <label className="flex items-center justify-between gap-3"><span><b className="block">Weekends only</b><span className="text-[12.5px] text-white/65">Apply to Fri–Sat in the selection ({sel.dates.filter(isWeekend).length})</span></span><input type="checkbox" checked={wkOnly} onChange={(e) => setWkOnly(e.target.checked)} className="size-5 accent-[#7ee2a8]" /></label>}
      </div>
      {n > 0 && <p className="mt-3 text-center text-[12.5px] text-white/60">With 10% service charge + 15% VAT the guest pays about {tk((dl?.price ?? n) + vat)} a night.</p>}
      <div className="mt-5 flex gap-2">
        <button onClick={reset} className="h-11 flex-1 rounded-xl border border-white/25 text-[14px] font-semibold hover:bg-white/10">Use default</button>
        <button onClick={save} disabled={!dates.length || (price === "" && !same && !closed)} className="h-11 flex-[1.4] rounded-xl bg-white text-[14px] font-semibold text-[#0f1720] disabled:opacity-40">Save</button>
      </div>
    </section>
  );
}

/** No nights picked: the category's default prices + what the month adds up to. */
function Summary({ rt, ym, catId, onDone }: { rt: Rates; ym: string; catId: string; onDone: (m: string) => void }) {
  const days = monthDays(ym).filter((d) => d >= TODAY);
  const cat = rt.cats.find((c) => c.id === catId);
  const [base, setBase] = useState(cat ? String(cat.baseRate) : "");
  const [wk, setWk] = useState(cat && rt.st.weekend[cat.id] != null ? String(rt.st.weekend[cat.id]) : "");
  const [key, setKey] = useState(catId);
  if (key !== catId) { setKey(catId); setBase(cat ? String(cat.baseRate) : ""); setWk(cat && rt.st.weekend[cat.id] != null ? String(rt.st.weekend[cat.id]) : ""); }
  const units = catId ? rt.units.filter((u) => u.category === catId) : rt.units;
  const nights = days.reduce((s, d) => s + units.filter((u) => !rt.unitPrice(u, d).closed).length, 0);
  const potential = days.reduce((s, d) => s + units.reduce((t, u) => { const p = rt.unitPrice(u, d); return t + (p.closed ? 0 : p.price); }, 0), 0);
  const custom = cat ? days.filter((d) => rt.catPrice(cat.id, d).from === "custom").length : 0;
  const closed = cat ? days.filter((d) => rt.catPrice(cat.id, d).closed).length : 0;
  return (
    <div className="space-y-4">
      {cat && (
        <section className={clsx(card, "p-4")} aria-labelledby="defaults">
          <h3 id="defaults" className="text-[16px] font-bold">{cat.name} · default prices</h3>
          <p className="text-[12.5px] text-hms-muted">Used on every night without its own price.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div><label htmlFor="rt-base" className={lbl}>Base / night</label><input id="rt-base" inputMode="numeric" value={base} onChange={(e) => setBase(e.target.value.replace(/\D/g, ""))} className={input} /></div>
            <div><label htmlFor="rt-wk" className={lbl}>Fri–Sat / night</label><input id="rt-wk" inputMode="numeric" value={wk} onChange={(e) => setWk(e.target.value.replace(/\D/g, ""))} placeholder="Same as base" className={input} /></div>
          </div>
          <button onClick={() => { if (Number(base) > 0 && Number(base) !== cat.baseRate) rt.setBase(cat.id, Number(base)); rt.setWeekend(cat.id, Number(wk) > 0 ? Number(wk) : null); onDone(`${cat.name} default prices saved`); }} disabled={!(Number(base) > 0)} className={clsx(btnPrimary, "mt-3 w-full")}>Save default prices</button>
          <p className="mt-2 text-[12px] text-hms-muted">The base price is the same one shown in Rooms.</p>
        </section>
      )}
      <section className={clsx(card, "p-4")} aria-labelledby="msum">
        <h3 id="msum" className="text-[16px] font-bold">{MON[Number(ym.slice(5, 7)) - 1]} · {cat ? cat.name : "whole property"}</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
          <div><dt className="text-hms-muted">Average night</dt><dd className="text-[18px] font-bold tabular-nums">{nights ? tk(potential / nights) : "—"}</dd></div>
          <div><dt className="text-hms-muted">If every room sells</dt><dd className="text-[18px] font-bold tabular-nums">{tk(potential)}</dd></div>
          {cat && <><div><dt className="text-hms-muted">Custom nights</dt><dd className="text-[18px] font-bold tabular-nums">{custom}</dd></div><div><dt className="text-hms-muted">Closed nights</dt><dd className="text-[18px] font-bold tabular-nums">{closed}</dd></div></>}
        </dl>
        <p className="mt-3 text-[12px] text-hms-muted">Remaining nights this month, before discounts, service charge and VAT.</p>
      </section>
      <Link href="/hms/discounts/campaigns" className={clsx(card, "flex items-center gap-3 p-4 hover:bg-hms-hover")}><span className="grid size-9 place-items-center rounded-lg bg-[#e5f5ec] text-[#16693a]"><Tag className="size-4" aria-hidden /></span><span className="flex-1 text-[14px]"><b className="block">Discounts</b><span className="text-[12.5px] text-hms-muted">{rt.st.campaigns.filter((c) => campaignState(c) === "active").length} active · automatic deals show in green on the calendar</span></span><ChevronRight className="size-4 text-hms-muted" aria-hidden /></Link>
    </div>
  );
}

// =================== Discounts ===================
const ST_TONE: Record<string, string> = { active: "bg-[#e5f5ec] text-[#16693a]", scheduled: "bg-[#e8f0fe] text-[#1d4ed8]", paused: "bg-[#fdf3d9] text-[#7a5200]", expired: "bg-hms-hover text-[#4d5664]", draft: "bg-hms-hover text-[#4d5664]" };
const ST_LABEL: Record<string, string> = { active: "Active", scheduled: "Scheduled", paused: "Paused", expired: "Expired", draft: "Draft" };
export function DiscountsPage() {
  const h = useProperty();
  const rt = useRates(h);
  const [toast, show] = useToast();
  const [f, setF] = useState<"all" | "active" | "scheduled" | "paused" | "expired" | "draft">("all");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Campaign | "new" | null>(null);
  const list = rt.st.campaigns.filter((c) => (f === "all" || campaignState(c) === f) && (!q || `${c.name} ${c.code ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  const count = (k: typeof f) => rt.st.campaigns.filter((c) => k === "all" || campaignState(c) === k).length;
  const scopeText = (c: Campaign) => c.scope === "all" ? "All rooms" : c.scope === "type" ? c.cats.map((id) => rt.cats.find((x) => x.id === id)?.name).filter(Boolean).join(", ") || "Room type" : `${c.units.length} room${c.units.length === 1 ? "" : "s"}`;
  return (
    <Frame tab="discounts" rt={rt} toast={toast}>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Active", count("active")], ["Scheduled", count("scheduled")], ["All campaigns", count("all")], ["Times used", rt.st.campaigns.reduce((s, c) => s + c.used, 0)]].map(([l, v]) => <div key={l} className={clsx(card, "px-4 py-3")}><p className="text-[13px] text-hms-muted">{l}</p><p className="text-[24px] font-bold tabular-nums">{v}</p></div>)}
      </div>
      <section className={clsx(card, "overflow-hidden")}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="mr-auto"><h2 className="text-[17px] font-bold">Campaigns</h2><p className="text-[13px] text-hms-muted">Automatic deals lower the price everyone sees. Coupons need a code.</p></div>
          <label className="flex h-10 min-w-[200px] items-center rounded-lg border border-hms-line px-3 focus-within:border-hms-ink"><span className="sr-only">Search campaigns</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or code" className="w-full bg-transparent text-[14px] outline-none" /></label>
          <button onClick={() => setEdit("new")} className={clsx(btnPrimary, "h-10")}><Plus className="size-4" />New campaign</button>
        </div>
        <div role="tablist" aria-label="Campaign status" className="no-scrollbar flex gap-1 overflow-x-auto border-t border-hms-line px-4 py-2">
          {(["all", "active", "scheduled", "paused", "expired", "draft"] as const).map((k) => <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)} className={clsx("h-9 shrink-0 rounded-lg px-3 text-[13.5px] font-semibold", f === k ? "bg-hms-ink text-white" : "text-hms-muted hover:bg-hms-hover")}>{k === "all" ? "All" : ST_LABEL[k]} <span className="tabular-nums opacity-70">{count(k)}</span></button>)}
        </div>
        {list.length ? (
          <ul className="grid gap-3 border-t border-hms-line p-4 md:grid-cols-2 xl:grid-cols-3">{list.map((c) => { const s = campaignState(c); return (
            <li key={c.id} className="flex flex-col rounded-xl border border-hms-line p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0"><p className="truncate text-[16px] font-bold">{c.name}</p>{c.nameBn && <p className="text-[13px] text-hms-muted">{c.nameBn}</p>}</div>
                <span className={clsx("shrink-0 rounded-md px-2 py-0.5 text-[12.5px] font-semibold", ST_TONE[s])}>{ST_LABEL[s]}</span>
              </div>
              <p className="mt-2 text-[24px] font-bold text-[#b11c29]">{c.kind === "percent" ? `${c.value}%` : tk(c.value)} <span className="text-[14px] font-semibold text-hms-muted">off {c.kind === "fixed" ? "per night" : ""}</span></p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[12.5px]">
                <span className="rounded-md bg-hms-hover px-2 py-0.5 font-semibold">{c.type === "flash" ? "Automatic deal" : "Coupon"}</span>
                {c.code && <button onClick={() => { navigator.clipboard?.writeText(c.code!); show(`Code ${c.code} copied`); }} className="inline-flex items-center gap-1 rounded-md border border-dashed border-hms-line px-2 py-0.5 font-mono font-semibold">{c.code}<Copy className="size-3" aria-hidden /><span className="sr-only">Copy code</span></button>}
                <span className="rounded-md bg-hms-hover px-2 py-0.5">{scopeText(c)}</span>
              </div>
              <p className="mt-2 text-[13px] text-hms-muted">{short(c.start)} – {short(c.end)} · used {c.used}{c.limit ? ` of ${c.limit}` : ""}</p>
              {c.message && <p className="mt-1 text-[13px]">{c.message}</p>}
              <div className="mt-auto flex gap-2 pt-3">
                {(s === "active" || s === "scheduled") && <button onClick={() => { rt.setStatus(c.id, "paused"); show(`${c.name} paused`); }} className={clsx(btnLine, "h-9 flex-1 px-3")}><Pause className="size-4" />Pause</button>}
                {(s === "paused" || s === "draft") && <button onClick={() => { rt.setStatus(c.id, "active"); show(`${c.name} is live`); }} className={clsx(btnLine, "h-9 flex-1 px-3")}><Play className="size-4" />{s === "draft" ? "Publish" : "Resume"}</button>}
                <button onClick={() => setEdit(c)} className={clsx(btnLine, "h-9 flex-1 px-3")}><Pencil className="size-4" />Edit</button>
                <button onClick={() => { if (confirm(`Delete ${c.name}? This can't be undone.`)) { rt.removeCampaign(c.id); show(`${c.name} deleted`); } }} aria-label={`Delete ${c.name}`} className="grid size-9 place-items-center rounded-lg border border-hms-line hover:bg-hms-hover"><Trash2 className="size-4 text-[#c81e1e]" /></button>
              </div>
            </li>
          ); })}</ul>
        ) : (
          <div className="border-t border-hms-line px-6 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-hms-hover text-hms-muted"><Sparkles className="size-5" aria-hidden /></span><p className="mt-3 text-[16px] font-semibold">No campaigns here</p><p className="mt-1 text-[14px] text-hms-muted">Create an automatic deal for quiet nights, or a coupon for partners.</p></div>
        )}
      </section>
      {edit && <CampaignSheet rt={rt} c={edit === "new" ? undefined : edit} onClose={() => setEdit(null)} onDone={(m) => { show(m); setEdit(null); }} />}
    </Frame>
  );
}

function CampaignSheet({ rt, c, onClose, onDone }: { rt: Rates; c?: Campaign; onClose: () => void; onDone: (m: string) => void }) {
  const [f, setF] = useState<Campaign>(c ?? { id: rt.uid("cp"), type: "flash", name: "", nameBn: "", message: "", scope: "all", cats: [], units: [], kind: "percent", value: 10, start: TODAY, end: addDays(TODAY, 30), used: 0, status: "active" });
  const [tried, setTried] = useState(false);
  const set = <K extends keyof Campaign>(k: K, v: Campaign[K]) => setF((x) => ({ ...x, [k]: v }));
  const dupCode = !!f.code && rt.st.campaigns.some((x) => x.id !== f.id && x.code?.toUpperCase() === f.code?.toUpperCase());
  const minBase = useMemo(() => Math.min(...rt.cats.map((x) => x.baseRate)), [rt.cats]);
  const errs = {
    name: !f.name.trim() ? "Enter a name" : "",
    code: f.type === "coupon" && !f.code?.trim() ? "Enter or generate a code" : dupCode ? "This code is already used" : "",
    value: !(f.value > 0) ? "Enter a value above 0" : f.kind === "percent" && f.value > 90 ? "Up to 90%" : f.kind === "fixed" && f.value >= minBase ? `Less than the lowest base price (${tk(minBase)})` : "",
    dates: !f.start || !f.end || f.end < f.start ? "End must be on or after start" : "",
    scope: f.scope === "type" && !f.cats.length ? "Pick at least one room type" : f.scope === "rooms" && !f.units.length ? "Pick at least one room" : "",
  };
  const ok = !Object.values(errs).some(Boolean);
  const save = (status: Campaign["status"]) => { setTried(true); if (!ok) return; rt.saveCampaign({ ...f, name: f.name.trim(), code: f.type === "coupon" ? f.code?.trim().toUpperCase() : undefined, status }); onDone(status === "draft" ? "Saved as draft" : c ? `${f.name} updated` : `${f.name} created`); };
  const gen = () => set("code", `${(f.name.replace(/[^A-Za-z]/g, "").slice(0, 4) || "BNG").toUpperCase()}${Math.floor(100 + Math.random() * 900)}`);
  const err = (k: keyof typeof errs) => (tried && errs[k] ? <p className="mt-1 text-[13px] font-medium text-[#c81e1e]">{errs[k]}</p> : null);
  const sample = rt.cats[0];
  return (
    <Sheet wide title={c ? "Edit campaign" : "New campaign"} sub="Set up an offer to fill rooms." onClose={onClose}
      footer={<><button onClick={onClose} className={clsx(btnLine, "flex-1")}>Cancel</button><button onClick={() => save("draft")} className={clsx(btnLine, "flex-1")}>Save draft</button><button onClick={() => save("active")} className={clsx(btnPrimary, "flex-[1.4]")}>{f.start > TODAY ? "Schedule" : "Publish"}</button></>}>
      <div className="space-y-5">
        <div><p className={lbl}>Type</p>
          <div role="radiogroup" aria-label="Campaign type" className="grid gap-2 sm:grid-cols-2">
            {([["flash", "Automatic deal", "Everyone sees the lower price on the dates"], ["coupon", "Coupon code", "Only guests with the code get it"]] as const).map(([v, t, d]) => <button key={v} type="button" role="radio" aria-checked={f.type === v} onClick={() => set("type", v)} className={clsx("rounded-xl border p-3 text-left", f.type === v ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line")}><b className="block text-[14.5px]">{t}</b><span className="text-[12.5px] text-hms-muted">{d}</span></button>)}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label htmlFor="cp-n" className={lbl}>Name (English)</label><input id="cp-n" autoFocus value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Winter offer" className={input} />{err("name")}</div>
          <div><label htmlFor="cp-bn" className={clsx(lbl, "flex justify-between")}>নাম (বাংলা) <span className="font-normal text-hms-muted">Optional</span></label><input id="cp-bn" lang="bn" value={f.nameBn} onChange={(e) => set("nameBn", e.target.value)} placeholder="যেমন শীতের অফার" className={input} /></div>
        </div>
        {f.type === "coupon" && <div><label htmlFor="cp-code" className={lbl}>Coupon code</label><div className="flex gap-2"><input id="cp-code" value={f.code ?? ""} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="e.g. WINTER10" className={clsx(input, "font-mono")} /><button type="button" onClick={gen} className={clsx(btnLine, "h-11 shrink-0")}>Generate</button></div>{err("code")}</div>}
        <div><label htmlFor="cp-msg" className={clsx(lbl, "flex justify-between")}>Message guests see <span className="font-normal text-hms-muted">Optional</span></label><input id="cp-msg" value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="e.g. 10% off Sunday–Thursday stays" className={input} /></div>
        <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
          <div><p className={lbl}>Discount</p><div role="radiogroup" aria-label="Discount kind" className="flex rounded-lg bg-[#e9edf2] p-1">{([["percent", "Percentage"], ["fixed", "Fixed ৳ per night"]] as const).map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={f.kind === v} onClick={() => set("kind", v)} className={clsx("h-9 flex-1 rounded-md text-[14px] font-semibold", f.kind === v ? "bg-white shadow-sm" : "text-[#4d5664]")}>{l}</button>)}</div></div>
          <div><label htmlFor="cp-v" className={lbl}>{f.kind === "percent" ? "Percent" : "Amount (৳)"}</label><input id="cp-v" inputMode="numeric" value={f.value || ""} onChange={(e) => set("value", Number(e.target.value.replace(/\D/g, "")) || 0)} className={input} /></div>
        </div>
        {err("value")}
        {sample && f.value > 0 && !errs.value && <p className="-mt-3 rounded-lg bg-[#e5f5ec] px-3 py-2 text-[13px] text-[#16693a]">{sample.name}: {tk(sample.baseRate)} → <b>{tk(f.kind === "percent" ? sample.baseRate * (1 - f.value / 100) : sample.baseRate - f.value)}</b> a night</p>}
        <div><p className={lbl}>Applies to</p>
          <div role="radiogroup" aria-label="Applies to" className="grid gap-2 sm:grid-cols-3">{([["all", "All rooms"], ["type", "Room types"], ["rooms", "Specific rooms"]] as const).map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={f.scope === v} onClick={() => set("scope", v)} className={clsx("h-11 rounded-lg border text-[14px] font-semibold", f.scope === v ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line")}>{l}</button>)}</div>
          {f.scope === "type" && <div className="mt-2 flex flex-wrap gap-1.5">{rt.cats.map((x) => { const on = f.cats.includes(x.id); return <button key={x.id} type="button" aria-pressed={on} onClick={() => set("cats", on ? f.cats.filter((y) => y !== x.id) : [...f.cats, x.id])} className={clsx("rounded-full border px-3 py-1.5 text-[13.5px]", on ? "border-[#b11c29] bg-[#ffe7e4] text-[#8e1621]" : "border-hms-line")}>{x.name}</button>; })}</div>}
          {f.scope === "rooms" && <div className="mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">{rt.units.map((u) => { const on = f.units.includes(u.id); return <button key={u.id} type="button" aria-pressed={on} onClick={() => set("units", on ? f.units.filter((y) => y !== u.id) : [...f.units, u.id])} className={clsx("rounded-full border px-3 py-1.5 text-[13.5px]", on ? "border-[#b11c29] bg-[#ffe7e4] text-[#8e1621]" : "border-hms-line")}>{u.code}</button>; })}</div>}
          {err("scope")}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label htmlFor="cp-s" className={lbl}>Starts</label><input id="cp-s" type="date" value={f.start} onChange={(e) => set("start", e.target.value)} className={input} /></div>
          <div><label htmlFor="cp-e" className={lbl}>Ends</label><input id="cp-e" type="date" min={f.start} value={f.end} onChange={(e) => set("end", e.target.value)} className={input} /></div>
          <div><label htmlFor="cp-l" className={clsx(lbl, "flex justify-between")}>Use limit <span className="font-normal text-hms-muted">Optional</span></label><input id="cp-l" inputMode="numeric" value={f.limit ?? ""} onChange={(e) => set("limit", Number(e.target.value.replace(/\D/g, "")) || undefined)} placeholder="No limit" className={input} /></div>
        </div>
        {err("dates")}
        <p className="text-[12.5px] text-hms-muted">Starts automatically on the start date and stops after the end date or the use limit. You can pause it any time.</p>
      </div>
    </Sheet>
  );
}
