"use client";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Wrench } from "lucide-react";
import { TODAY, oooOn, type Unit } from "@/lib/rooms/store";
import { addDays } from "@/lib/bookings/demo";
import { channelLabel, dm, dow, dueOf, holds, overlaps, tk, type Booking } from "@/lib/bookings/store";
import { useRates } from "@/lib/rates/store";
import { useHousekeeping } from "@/lib/housekeeping/store";
import { useProperty } from "../property";
import { BookingsFrame, card, channelIcon, statusLabel, useBk } from "./ui";

export function CalendarPage() { return <BookingsFrame tab="calendar"><Calendar /></BookingsFrame>; }

const BAR: Record<string, string> = {
  Confirmed: "border-[#9db8f2] bg-[#e8f0fe] text-[#1e3a8a]",
  "Checked in": "border-[#86cfa3] bg-[#dcf3e5] text-[#14532d]",
  "Checked out": "border-[#d3d8df] bg-[#eef0f3] text-[#4d5664]",
};

type Drag = { code: string; kind: "move" | "end"; x0: number; y0: number; dx: number; dy: number; room: string; moved: boolean };
type Pending = { code: string; unit: string; from: string; to: string };

function Calendar() {
  const { bk, guests, mode, open, toast } = useBk();
  const router = useRouter();
  const rates = useRates(useProperty());
  const hk = useHousekeeping(useProperty());
  const [drag, setDrag] = useState<Drag | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [perr, setPerr] = useState("");
  const [sel, setSel] = useState<{ room: string; a: string; b: string } | null>(null);
  const justDragged = useRef(false);
  const [days, setDays] = useState(14);
  const [start, setStart] = useState(addDays(TODAY, -1));
  const span = mode === "easy" ? 14 : days;
  const box = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(0);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width)); ro.observe(el); return () => ro.disconnect(); }, []);
  const minW = span <= 7 ? 112 : span <= 14 ? 76 : 46;
  // Fill the card on big screens; scroll sideways on small ones.
  const W = Math.max(minW, boxW ? Math.floor((boxW - 96) / span) : minW);
  const dates = useMemo(() => Array.from({ length: span }, (_, i) => addDays(start, i)), [start, span]);
  const end = addDays(start, span);
  const inRange = (b: Booking) => overlaps(b, start, end) && b.status !== "Cancelled" && b.status !== "No-show";
  const groups = useMemo(() => {
    const m = new Map<string, Unit[]>();
    for (const u of bk.units) m.set(u.category, [...(m.get(u.category) ?? []), u]);
    return [...m.entries()].map(([c, us]) => ({ id: c, name: bk.cats.get(c)?.name ?? "Rooms", units: us.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })) }));
  }, [bk.units, bk.cats]);
  const unassigned = bk.list.filter((b) => holds(b) && !b.unit && inRange(b));
  const name = (b: Booking) => guests.get(b.guestId)?.name ?? "Guest";
  const step = mode === "easy" ? 7 : Math.max(7, Math.floor(span / 2));
  const freeOn = (catUnits: Unit[], d: string) => catUnits.filter((u) => !oooOn(u, d, addDays(d, 1)) && !bk.list.some((b) => b.unit === u.code && holds(b) && overlaps(b, d, addDays(d, 1)))).length;

  const bar = (b: Booking) => {
    const s = b.from < start ? start : b.from;
    const e = b.to > end ? end : b.to;
    const left = ((Date.parse(s) - Date.parse(start)) / 864e5) * W + (b.from >= start ? W / 2 : 0);
    const right = ((Date.parse(e) - Date.parse(start)) / 864e5) * W + (b.to <= end ? W / 2 : 0);
    const d = dueOf(b);
    return (
      <button key={b.code} onClick={() => { if (!justDragged.current) open(b.code); }} title={`${name(b)} · ${b.code} · ${channelLabel(b)}`}
        aria-label={`${b.code} ${name(b)}${b.unit ? `, Room ${b.unit}` : ""}, ${dm(b.from)} to ${dm(b.to)}, ${statusLabel(b.status)}, ${channelLabel(b)}${d > 0 ? ", payment due" : ""}`}
        onPointerDown={(e) => startDrag(e, b, "move")} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => setDrag(null)}
        style={{ left: left + 2, width: Math.max(18, right - left - 4 + (drag?.code === b.code && drag.kind === "end" ? drag.dx : 0)), transform: drag?.code === b.code && drag.kind === "move" && drag.moved ? `translate(${b.status === "Checked in" ? 0 : drag.dx}px, ${drag.dy}px)` : undefined }}
        className={clsx("absolute top-1.5 bottom-1.5 flex items-center gap-1 overflow-hidden rounded-lg border px-2 text-left text-[12.5px] font-semibold shadow-[0_1px_0_rgb(0_0_0/0.04)] hover:brightness-[0.97] focus-visible:outline-2 focus-visible:outline-hms-ink", drag?.code === b.code && drag.moved ? "pointer-events-none z-[5] cursor-grabbing opacity-80 shadow-lg" : "z-[1] transition", b.status !== "Checked out" && "cursor-grab", BAR[b.status] ?? BAR.Confirmed)}>
        {d > 0 && <span className="size-1.5 shrink-0 rounded-full bg-[#d97706]" aria-hidden />}
        {(() => { const I = channelIcon(b.channel); return <I className="size-3.5 shrink-0 opacity-70" aria-hidden />; })()}
        <span className="truncate">{name(b)}</span>
        {mode === "details" && right - left > 150 && <span className="ml-auto shrink-0 font-normal">{b.code}</span>}
        {b.status !== "Checked out" && b.to <= end && <span aria-hidden onPointerDown={(e) => startDrag(e, b, "end")} className="absolute inset-y-0 right-0 w-2.5 cursor-ew-resize rounded-r-lg hover:bg-black/10" />}
      </button>
    );
  };
  const newAt = (room: string, d: string, to?: string) => router.push(`/hms/bookings/new?room=${encodeURIComponent(room)}&from=${d}${to ? `&to=${to}` : ""}`);
  const priceAt = (unit: string) => (d: string) => { const u = bk.unitByCode.get(unit)!; const p = rates.unitPrice(u, d); return rates.deal(u.category, d, p.price, u.id)?.price ?? p.price; };
  // ---- drag a booking (mouse / pen): move to another room or day, or drag its end to change check-out
  const roomAt = (x: number, y: number) => (document.elementFromPoint(x, y)?.closest("[data-room]") as HTMLElement | null)?.dataset.room;
  const startDrag = (e: React.PointerEvent, b: Booking, kind: Drag["kind"]) => {
    if (e.pointerType === "touch" || e.button !== 0 || b.status === "Checked out") return;
    e.stopPropagation(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ code: b.code, kind, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, room: b.unit, moved: false });
  };
  const moveDrag = (e: React.PointerEvent) => {
    if (!drag) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    const moved = drag.moved || Math.abs(dx) > 6 || Math.abs(dy) > 6;
    setDrag({ ...drag, dx, dy, moved, room: drag.kind === "move" ? roomAt(e.clientX, e.clientY) ?? drag.room : drag.room });
  };
  const dropOf = (d: Drag): Pending | null => {
    const b = bk.list.find((x) => x.code === d.code); if (!b) return null;
    const days = Math.round(d.dx / W);
    if (d.kind === "end") { const to = addDays(b.to, days); return { code: b.code, unit: b.unit, from: b.from, to: to <= b.from ? addDays(b.from, 1) : to }; }
    const shift = b.status === "Checked in" ? 0 : days;
    return { code: b.code, unit: d.room || b.unit, from: addDays(b.from, shift), to: addDays(b.to, shift) };
  };
  const endDrag = () => {
    if (!drag) return;
    const d = drag; setDrag(null);
    if (!d.moved) return;
    justDragged.current = true; setTimeout(() => { justDragged.current = false; }, 0);
    const p = dropOf(d); const b = bk.list.find((x) => x.code === d.code);
    if (!p || !b || !p.unit || (p.unit === b.unit && p.from === b.from && p.to === b.to)) return;
    setPerr(""); setPending(p);
  };
  const pb = pending ? bk.list.find((x) => x.code === pending.code) : undefined;
  const confirmMove = () => {
    if (!pending || !pb) return;
    const e = bk.moveStay(pending.code, pending.unit, pending.from, pending.to, priceAt(pending.unit));
    if (e) return setPerr(e);
    if (pb.status === "Checked in" && pb.unit && pb.unit !== pending.unit) hk.vacated(pb.unit, pb.code);
    toast(`${pending.code} → Room ${pending.unit} · ${dm(pending.from)}–${dm(pending.to)}`); setPending(null);
  };
  const newTotal = pending && pb ? (() => { const old = new Map(pb.nights.map((n) => [n.date, n.base])); const f = priceAt(pending.unit); let s0 = 0; for (let d = pending.from; d < pending.to; d = addDays(d, 1)) s0 += old.get(d) ?? f(d); return s0; })() : 0;
  const oldTotal = pb ? pb.nights.reduce((s0, n) => s0 + n.base, 0) : 0;
  // ---- drag across empty days to start a booking for those nights
  useEffect(() => {
    if (!sel) return;
    const up = () => { const a = sel.a < sel.b ? sel.a : sel.b, z = sel.a < sel.b ? sel.b : sel.a; setSel(null); if (a !== z) { justDragged.current = true; setTimeout(() => { justDragged.current = false; }, 0); newAt(sel.room, a, addDays(z, 1)); } };
    window.addEventListener("pointerup", up); return () => window.removeEventListener("pointerup", up);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  return (
    <section className={clsx(card, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-2 border-b border-hms-line px-3 py-3 sm:px-4">
        <div className="flex items-center gap-1">
          <button onClick={() => setStart(addDays(start, -step))} aria-label="Earlier dates" className="grid size-9 place-items-center rounded-lg border border-hms-line bg-white hover:bg-hms-hover"><ChevronLeft className="size-4" /></button>
          <button onClick={() => setStart(addDays(TODAY, -1))} className="h-9 rounded-lg border border-hms-line bg-white px-3 text-[14px] font-semibold hover:bg-hms-hover">Today</button>
          <button onClick={() => setStart(addDays(start, step))} aria-label="Later dates" className="grid size-9 place-items-center rounded-lg border border-hms-line bg-white hover:bg-hms-hover"><ChevronRight className="size-4" /></button>
        </div>
        <p className="text-[15px] font-bold">{dm(start)} – {dm(addDays(end, -1))}</p>
        {mode === "details" && (
          <div role="radiogroup" aria-label="Days shown" className="ml-auto flex rounded-lg bg-[#e9edf2] p-1">
            {[7, 14, 30].map((n) => <button key={n} role="radio" aria-checked={days === n} onClick={() => setDays(n)} className={clsx("rounded-md px-3 py-1 text-[13.5px] font-semibold", days === n ? "bg-white shadow-sm" : "text-[#4d5664]")}>{n} days</button>)}
          </div>
        )}
        <div className={clsx("flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[#4d5664]", mode === "easy" && "ml-auto")}>
          <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded border border-[#9db8f2] bg-[#e8f0fe]" />Booked</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded border border-[#86cfa3] bg-[#dcf3e5]" />In house</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#d97706]" />Payment due</span>
          <span className="inline-flex items-center gap-1.5"><span className="hms-hatch size-3 rounded border border-[#e9b949]" />Out of order</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#d92d20]" />Needs cleaning</span>
          <span className="inline-flex items-center gap-1.5"><span className="font-semibold text-[#16693a]">৳</span>Deal price</span>
        </div>
      </div>

      {pending && pb && (
        <div role="region" aria-label="Confirm move" className="hms-up flex flex-wrap items-center gap-3 border-b border-hms-line bg-[#f5f8ff] px-4 py-3">
          <div className="min-w-0 flex-1 text-[14px]">
            <b>{name(pb)} · {pb.code}</b>
            <p className="text-[13.5px] text-[#3a414c]">{pb.unit !== pending.unit && <>Room {pb.unit || "—"} → <b>{pending.unit}</b> · </>}{(pb.from !== pending.from || pb.to !== pending.to) ? <>{dm(pb.from)}–{dm(pb.to)} → <b>{dm(pending.from)}–{dm(pending.to)}</b></> : <>{dm(pb.from)}–{dm(pb.to)}</>}{newTotal !== oldTotal && <> · room price {tk(oldTotal)} → <b>{tk(newTotal)}</b> <span className="text-hms-muted">before VAT</span></>}</p>
            {perr && <p role="alert" className="mt-1 text-[13px] font-semibold text-[#b42318]">{perr}</p>}
          </div>
          <button onClick={() => { setPending(null); setPerr(""); }} className="h-10 rounded-xl bg-white px-4 text-[14px] font-semibold ring-1 ring-hms-line hover:bg-hms-hover">Cancel</button>
          <button onClick={confirmMove} className="btn-glow h-10 rounded-xl px-4 text-[14px] font-semibold text-white">Confirm move</button>
        </div>
      )}
      <div ref={box} className="overflow-x-auto" role="region" aria-label="Booking calendar" tabIndex={0}>
        <div style={{ width: 96 + span * W }} className="relative">
          {/* header */}
          <div className="sticky top-0 z-[3] flex border-b border-hms-line bg-white">
            <div className="sticky left-0 z-[4] w-24 shrink-0 border-r border-hms-line bg-white px-3 py-2 text-[12.5px] font-semibold text-hms-muted">Room</div>
            {dates.map((d) => (
              <div key={d} style={{ width: W }} className={clsx("shrink-0 border-r border-hms-line py-1.5 text-center last:border-r-0", d === TODAY && "bg-hms-coral-soft", (dow(d) === "Fri" || dow(d) === "Sat") && d !== TODAY && "bg-[#fafbfc]")}>
                <p className={clsx("text-[11.5px] font-medium", d === TODAY ? "text-hms-red" : "text-hms-muted")}>{dow(d)}</p>
                <p className={clsx("text-[14px] font-bold tabular-nums", d === TODAY && "text-hms-red")}>{W >= 60 ? dm(d) : d.slice(8, 10)}</p>
              </div>
            ))}
          </div>

          {unassigned.length > 0 && (
            <div className="flex border-b border-hms-line bg-[#fffaf0]">
              <div className="sticky left-0 z-[2] w-24 shrink-0 border-r border-hms-line bg-[#fffaf0] px-3 py-2"><p className="text-[13px] font-bold text-[#8a4b00]">No room</p><p className="text-[11.5px] text-[#8a4b00]">{unassigned.length} booking{unassigned.length > 1 ? "s" : ""}</p></div>
              <div className="relative" style={{ width: span * W, height: Math.max(1, unassigned.length) * 44 }}>
                {unassigned.map((b, i) => <div key={b.code} className="absolute inset-x-0" style={{ top: i * 44, height: 44 }}>{bar(b)}</div>)}
              </div>
            </div>
          )}

          {groups.map((g) => (
            <div key={g.id}>
              <div className="border-b border-hms-line bg-[#f7f8fa]">
                <div className="sticky left-0 z-[2] w-max max-w-[100vw] px-3 py-1.5 text-[13px] font-bold">{g.name} <span className="font-normal text-hms-muted">· {g.units.length} room{g.units.length > 1 ? "s" : ""}</span></div>
              </div>
              <div className="flex border-b border-hms-line bg-[#fbfcfd]">
                <div className="sticky left-0 z-[2] flex w-24 shrink-0 items-center border-r border-hms-line bg-[#fbfcfd] px-3 text-[11.5px] font-medium text-hms-muted">{mode === "details" ? "Price · free" : "Price"}</div>
                {dates.map((d) => {
                  const f = freeOn(g.units, d);
                  const c = rates.catPrice(g.id, d);
                  const deal = c.closed ? null : rates.deal(g.id, d, c.price);
                  const p = deal?.price ?? c.price;
                  return (
                    <div key={d} style={{ width: W }} title={c.closed ? "Closed for sale" : `${tk(p)} per night before VAT & service${deal ? ` · ${deal.c.name}` : ""}${c.from === "custom" ? " · custom price" : ""}`}
                      className={clsx("shrink-0 border-r border-hms-line py-1 text-center leading-tight last:border-r-0", d === TODAY && "bg-hms-coral-soft/40")}>
                      <span className={clsx("block text-[12px] font-semibold tabular-nums", c.closed ? "text-[#b42318]" : deal ? "text-[#16693a]" : f ? "text-hms-ink" : "text-[#4d5664] line-through")}>{c.closed ? "Closed" : W >= 70 ? new Intl.NumberFormat("en-IN").format(p) : `${Math.round(p / 100) / 10}k`}</span>
                      {mode === "details" && <span className={clsx("block text-[11px] tabular-nums", f ? "text-hms-muted" : "font-semibold text-[#b42318]")}>{f ? `${f} free` : "Full"}</span>}
                    </div>
                  );
                })}
              </div>
              {g.units.map((u) => (
                <div key={u.code} className="flex border-b border-hms-line last:border-b-0">
                  <div className="sticky left-0 z-[2] flex w-24 shrink-0 items-center gap-1.5 border-r border-hms-line bg-white px-3 py-2">
                    <span className="text-[14.5px] font-bold">{u.code}</span>
                    {!hk.isReady(u.code) && <span title={`Housekeeping: ${hk.stateOf(u.code)}`} className={clsx("size-2 rounded-full", hk.stateOf(u.code) === "Dirty" ? "bg-[#d92d20]" : "bg-[#d97706]")}><span className="sr-only">{hk.stateOf(u.code)}</span></span>}
                    {u.ooo && oooOn(u, start, end) && <span title={`Out of order · ${u.ooo.reason}${u.ooo.until ? ` until ${dm(u.ooo.until)}` : ""}`} className="text-[#b26a00]"><Wrench className="size-3.5" aria-label="Out of order" /></span>}
                  </div>
                  <div data-room={u.code} className={clsx("relative flex", drag?.moved && drag.kind === "move" && drag.room === u.code && "bg-[#eef3ff] outline-2 -outline-offset-2 outline-[#7aa2f7]")} style={{ width: span * W, height: 44 }}>
                    {dates.map((d) => {
                      const busy = bk.list.some((b) => b.unit === u.code && holds(b) && overlaps(b, d, addDays(d, 1)));
                      const off = oooOn(u, d, addDays(d, 1));
                      const can = !off && !busy && d >= TODAY;
                      const cls = clsx("h-full shrink-0 border-r border-hms-line last:border-r-0", off && "hms-hatch", d === TODAY && "bg-hms-coral-soft/40", can && "hover:bg-[#f0f4ff]", d < TODAY && "bg-[#fafbfc]");
                      const inSel = sel?.room === u.code && d >= (sel.a < sel.b ? sel.a : sel.b) && d <= (sel.a < sel.b ? sel.b : sel.a);
                      return can ? <button key={d} tabIndex={-1} onClick={() => { if (!justDragged.current) newAt(u.code, d); }} onPointerDown={(e) => { if (e.pointerType !== "touch" && e.button === 0) setSel({ room: u.code, a: d, b: d }); }} onPointerEnter={() => { if (sel?.room === u.code) setSel({ ...sel, b: d }); }} aria-label={`New booking, Room ${u.code}, ${dm(d)}`} style={{ width: W }} className={clsx(cls, inSel && "!bg-[#dfe8ff]")} /> : <div key={d} style={{ width: W }} className={cls} />;
                    })}
                    {bk.list.filter((b) => b.unit === u.code && inRange(b)).map(bar)}
                    {u.ooo && oooOn(u, start, end) && <span style={{ left: Math.max(0, (Date.parse(u.ooo.since.slice(0, 10) > start ? u.ooo.since.slice(0, 10) : start) - Date.parse(start)) / 864e5) * W + 8 }} className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded bg-white/90 px-1.5 text-[12px] font-semibold text-[#8a4b00]">Out of order · {u.ooo.reason}{u.ooo.until ? ` → ${dm(u.ooo.until)}` : ""}</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="border-t border-hms-line px-4 py-2.5 text-[12.5px] text-hms-muted">Prices are per night before VAT &amp; service, from Discounts &amp; Rates. Tap an empty day to book — or drag across days. Drag a booking to move it; drag its right edge to change check-out.</p>
    </section>
  );
}
