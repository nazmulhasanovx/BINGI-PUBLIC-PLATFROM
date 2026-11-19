"use client";
// Bookings home = the live HMS bookings table: 4 numbers, All / Arrivals / In house / Departures / Payment due,
// one search + source + status filter, one table (cards on phones). Arrivals and departures carry Check in / Check out.
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { BedDouble, CalendarCheck, CircleAlert, Clock, LogIn, LogOut, PlaneLanding, Search, Wallet } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { addDays } from "@/lib/bookings/demo";
import { CHANNELS, dm, dow, dueOf, holds, paidOf, payState, totalOf, tk, type Booking } from "@/lib/bookings/store";
import { useHousekeeping } from "@/lib/housekeeping/store";
import { useProperty } from "../property";
import { WebRequests } from "./web";
import { BookingsFrame, ChannelBadge, Flags, StatusPill, card, useBk, viewBtn } from "./ui";

type Seg = "all" | "arrivals" | "inhouse" | "departures" | "due";
const SEGS: [Seg, string][] = [["all", "All"], ["arrivals", "Arrivals"], ["inhouse", "In house"], ["departures", "Departures"], ["due", "Payment due"]];
const sel = "h-11 rounded-xl border border-hms-line bg-white px-3 text-[14px] outline-none focus:border-[#c8232e]";

export function TodayPage() {
  const [seg, setSeg] = useState<Seg>("all");
  return (
    <BookingsFrame tab="list" sub={<Stats seg={seg} setSeg={setSeg} />} bar={<SegTabs seg={seg} set={setSeg} />}>
      <BookingsTable seg={seg} />
    </BookingsFrame>
  );
}

function useLists() {
  const { bk } = useBk();
  const L = bk.list;
  return useMemo(() => {
    const test: Record<Seg, (b: Booking) => boolean> = {
      all: () => true,
      arrivals: (b) => b.status === "Confirmed" && b.from === TODAY,
      inhouse: (b) => b.status === "Checked in",
      departures: (b) => b.status === "Checked in" && b.to <= TODAY,
      due: (b) => (dueOf(b) > 0 && b.status !== "Cancelled" && b.status !== "No-show") || payState(b) === "Refund due",
    };
    return { test, n: (s: Seg) => L.filter(test[s]).length };
  }, [L]);
}

function Stats({ seg, setSeg }: { seg: Seg; setSeg: (s: Seg) => void }) {
  const { bk } = useBk();
  const { n } = useLists();
  const L = bk.list;
  const outstanding = L.filter((b) => b.status !== "Cancelled" && b.status !== "No-show" && dueOf(b) > 0);
  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {([
          ["all", "All bookings", String(L.length), CalendarCheck, "bg-[#e8f0fe] text-[#1d4ed8]", undefined],
          ["arrivals", "Arrivals today", String(n("arrivals")), PlaneLanding, "bg-[#e5f5ec] text-[#16693a]", undefined],
          ["inhouse", "In house today", String(n("inhouse")), BedDouble, "bg-[#f1edff] text-[#6b55e0]", `${bk.freeUnits(TODAY, addDays(TODAY, 1)).length} rooms free tonight`],
          ["due", "Outstanding", tk(outstanding.reduce((s, b) => s + dueOf(b), 0)), Wallet, "bg-[#fdecec] text-[#b42318]", `${outstanding.length} booking${outstanding.length === 1 ? "" : "s"}`],
        ] as [Seg, string, string, typeof Wallet, string, string | undefined][]).map(([id, l, v, I, tone, sub]) => (
          <button key={id} onClick={() => setSeg(id)} className={clsx("flex items-center gap-3 rounded-[20px] border bg-white p-4 text-left transition-colors", seg === id ? "border-[#f3c4c0]" : "border-hms-line hover:border-[#c9ced6]")}>
            <span className={clsx("grid size-11 shrink-0 place-items-center rounded-2xl", tone)}><I className="size-5" /></span>
            <span className="min-w-0"><span className="block text-[13px] text-hms-muted">{l}</span><b className="block truncate text-[19px] leading-tight tabular-nums sm:text-[22px]">{v}</b>{sub && <span className="block truncate text-[12px] text-hms-muted">{sub}</span>}</span>
          </button>
        ))}
      </div>

    </div>
  );
}

function SegTabs({ seg, set }: { seg: Seg; set: (s: Seg) => void }) {
  const { n } = useLists();
  return (
    <div role="tablist" aria-label="Booking status" className="flex items-center gap-1">
      {SEGS.map(([id, l]) => (
        <button key={id} role="tab" aria-selected={seg === id} onClick={() => set(id)} className={clsx(viewBtn(seg === id), seg === id && "!bg-[#c8232e] !text-white")}>
          {l} <span className="font-normal tabular-nums">({n(id)})</span>
        </button>
      ))}
    </div>
  );
}

function BookingsTable({ seg }: { seg: Seg }) {
  const { bk, guests, open } = useBk();
  const hk = useHousekeeping(useProperty());
  const { test } = useLists();
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [shown, setShown] = useState(25);
  const L = bk.list;
  const name = (b: Booking) => guests.get(b.guestId)?.name ?? "Guest";
  const attention = L.filter((b) => (b.status === "Confirmed" && b.from < TODAY) || (holds(b) && !b.unit && b.from <= addDays(TODAY, 7)));
  const rank = (b: Booking) => (b.status === "Checked in" ? (b.to <= TODAY ? 0 : 2) : b.status === "Confirmed" ? (b.from <= TODAY ? 1 : 3) : 4);
  const rows = L.filter(test[seg]).filter((b) => {
    if (channel && b.channel !== channel) return false;
    if (status && b.status !== status) return false;
    if (!q.trim()) return true;
    const s = q.toLowerCase(); const g = guests.get(b.guestId);
    return [b.code, b.unit, g?.name, g?.phone, b.group].some((x) => x?.toLowerCase().includes(s));
  }).sort((a, b) => rank(a) - rank(b) || (rank(a) < 4 ? a.from.localeCompare(b.from) : b.from.localeCompare(a.from)) || (a.unit || "zzz").localeCompare(b.unit || "zzz", undefined, { numeric: true }));
  const tag = (b: Booking) => {
    const pre = b.status === "Confirmed" && b.precheck ? <span className="mt-1 mr-1 inline-flex rounded-md bg-[#e5f5ec] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#16693a]">Online ✓ pre-checked-in</span> : null;
    if (pre) return <>{pre}{b.from === TODAY && b.unit && !hk.isReady(b.unit) && <span className="mt-1 inline-flex rounded-md bg-[#fdecec] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#b42318]">Room {hk.stateOf(b.unit).toLowerCase()}</span>}</>;
    if (b.status === "Checked in" && b.to < TODAY) return <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#fff4e0] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#8a4b00]"><Clock className="size-3" />Checkout overdue</span>;
    if (b.status === "Checked in" && b.to === TODAY) return <span className="mt-1 inline-flex rounded-md bg-[#fdefe7] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#c2410c]">Leaves today</span>;
    if (b.status === "Confirmed" && b.from === TODAY && b.unit && !hk.isReady(b.unit)) return <span className="mt-1 inline-flex rounded-md bg-[#fdecec] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#b42318]">Room {hk.stateOf(b.unit).toLowerCase()}</span>;
    return null;
  };
  const action = (b: Booking, full = false) => {
    if (b.status === "Confirmed" && b.from <= TODAY) return <button onClick={(e) => { e.stopPropagation(); open(b.code, "checkin"); }} aria-label={`Check in ${name(b)}`} className={clsx("inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl btn-glow px-3 text-[13.5px] font-semibold text-white", full && "flex-1")}><LogIn className="size-4" />Check in</button>;
    if (b.status === "Checked in" && b.to <= TODAY) return <button onClick={(e) => { e.stopPropagation(); open(b.code, "checkout"); }} aria-label={`Check out ${name(b)}`} className={clsx("inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-hms-line bg-white px-3 text-[13.5px] font-semibold hover:bg-hms-hover", full && "flex-1")}><LogOut className="size-4" />Check out</button>;
    return null;
  };

  return (
    <>
      <WebRequests />
      {attention.length > 0 && (
        <details className="mt-4 overflow-hidden rounded-2xl border border-[#f1dfb8] bg-[#fdf8ec]">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[14px] font-semibold text-[#6b4309] [&::-webkit-details-marker]:hidden"><CircleAlert className="size-4" />Needs attention · {attention.length} booking{attention.length > 1 ? "s" : ""}<span className="ml-auto text-[13px] font-semibold underline underline-offset-4">Show</span></summary>
          <ul className="border-t border-[#f1dfb8]">{attention.map((b) => (
            <li key={b.code}><button onClick={() => open(b.code)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-left hover:bg-[#fbf1da]">
              <b className="min-w-0 flex-1 truncate">{name(b)} <span className="font-normal text-[#6b4309]">· {dm(b.from)} → {dm(b.to)}</span></b><Flags b={b} />
            </button></li>
          ))}</ul>
        </details>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search bookings</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-hms-muted" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setShown(25); }} placeholder="Search guest name, phone, booking ID or room…" className="h-11 w-full rounded-xl border border-hms-line bg-white pl-9 pr-3 text-[14px] outline-none focus:border-[#c8232e]" />
        </label>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={sel}><option value="">All status</option>{["Confirmed", "Checked in", "Checked out", "Cancelled", "No-show"].map((x) => <option key={x} value={x}>{x === "Checked in" ? "In house" : x}</option>)}</select>
        <select aria-label="Source" value={channel} onChange={(e) => setChannel(e.target.value)} className={sel}><option value="">All sources</option>{CHANNELS.map((c) => <option key={c} value={c}>{c === "OTA" ? "OTA (Booking.com, Agoda…)" : c}</option>)}</select>
        {(status || channel) && <button onClick={() => { setStatus(""); setChannel(""); }} className="text-[13.5px] font-semibold text-[#c8232e]">Clear</button>}
      </div>

      <section aria-label={SEGS.find((s) => s[0] === seg)![1]} className={clsx(card, "mt-3 overflow-hidden")}>
        {rows.length === 0 ? (
          <p className="px-6 py-16 text-center text-[15px] text-hms-muted">{q || status || channel ? "No bookings match." : seg === "arrivals" ? "No more arrivals today" : seg === "departures" ? "Everyone due out has left" : seg === "inhouse" ? "No guests in house" : seg === "due" ? "Nothing to collect" : "No bookings yet"}</p>
        ) : <>
          <ul className="divide-y divide-hms-line md:hidden" aria-label="Bookings">
            {rows.slice(0, shown).map((b) => (
              <li key={b.code} className="px-4 py-3">
                <button onClick={() => open(b.code)} aria-label={`${name(b)}${b.unit ? `, Room ${b.unit}` : ""}`} className="block w-full text-left">
                  <span className="flex items-baseline justify-between gap-2"><b className="truncate text-[15px]">{name(b)}</b><span className="shrink-0 text-[13.5px] font-semibold">{b.unit ? `Room ${b.unit}` : "No room"}</span></span>
                  <span className="block text-[12.5px] text-hms-muted">{dm(b.from)} → {dm(b.to)} · {b.nights.length}n · {b.code}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-2"><StatusPill s={b.status} /><ChannelBadge b={b} />{dueOf(b) > 0 ? <b className="text-[12.5px] text-[#b42318]">{tk(dueOf(b))} due</b> : <span className="text-[12.5px] font-semibold text-[#16693a]">Paid</span>}{tag(b)}</span>
                </button>
                {action(b) && <div className="mt-2 flex">{action(b, true)}</div>}
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block" role="region" aria-label="Bookings table" tabIndex={0}>
            <table className="w-full min-w-[900px] text-[14px]">
              <thead><tr className="bg-[#fafafb] text-left text-[12.5px] text-hms-muted">
                {["Guest", "Room", "Source", "Stay (check-in – check-out)", "Status"].map((x) => <th key={x} className="whitespace-nowrap px-3 py-3 font-medium first:pl-4">{x}</th>)}
                <th className="px-3 py-3 text-right font-medium">Total</th><th className="hidden px-3 py-3 text-right font-medium 2xl:table-cell">Paid</th><th className="px-3 py-3 text-right font-medium">Due</th><th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr></thead>
              <tbody>{rows.slice(0, shown).map((b) => {
                const g = guests.get(b.guestId);
                return (
                  <tr key={b.code} onClick={() => open(b.code)} className={clsx("cursor-pointer border-t border-hms-line hover:bg-[#fafbfc]", (b.status === "Cancelled" || b.status === "No-show") && "text-hms-muted")}>
                    <td className="py-3 pl-4 pr-3"><span className="flex items-center gap-2.5"><span className="hidden size-8 shrink-0 place-items-center rounded-full bg-[#ffecec] 2xl:grid text-[11.5px] font-bold text-[#c8232e]">{name(b).split(" ").map((p) => p[0]).slice(0, 2).join("")}</span><span className="min-w-0"><button onClick={(e) => { e.stopPropagation(); open(b.code); }} aria-label={`${name(b)}${b.unit ? `, Room ${b.unit}` : ""}`} className="block max-w-full truncate text-left font-semibold hover:underline">{name(b)}</button>{g?.vip && <span className="rounded bg-[#fdf3d9] px-1 text-[10.5px] font-bold text-[#7a4a0b]">VIP</span>}<span className="block text-[12px] text-hms-muted">{b.code}</span></span></span></td>
                    <td className="px-3 py-3">{b.unit ? <b>{b.unit}</b> : <span className="font-semibold text-[#a15c00]">Not assigned</span>}<span className="block max-w-[120px] truncate text-[12px] text-hms-muted">{b.type}</span></td>
                    <td className="px-3 py-3"><ChannelBadge b={b} /></td>
                    <td className="whitespace-nowrap px-3 py-3">{dow(b.from)} {dm(b.from)} – {dow(b.to)} {dm(b.to)}<span className="block text-[12px] text-hms-muted">{b.nights.length} night{b.nights.length > 1 ? "s" : ""} · {b.adults + b.children} guest{b.adults + b.children > 1 ? "s" : ""}</span>{tag(b)}</td>
                    <td className="px-3 py-3"><span className="flex flex-wrap items-center gap-1.5"><StatusPill s={b.status} /><Flags b={b} /></span></td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">{tk(totalOf(b))}</td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-right tabular-nums 2xl:table-cell">{tk(paidOf(b))}</td>
                    <td className={clsx("whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums", dueOf(b) > 0 ? "text-[#b42318]" : "text-hms-muted")}>{dueOf(b) > 0 ? tk(dueOf(b)) : payState(b) === "Refund due" ? <span className="text-[#6b55e0]">Refund</span> : "0"}</td>
                    <td className="px-4 py-3"><span className="flex items-center justify-end">{action(b) ?? <button onClick={(e) => { e.stopPropagation(); open(b.code); }} aria-label={`Open ${b.code}`} className="h-9 whitespace-nowrap rounded-xl border border-hms-line bg-white px-3 text-[13.5px] font-semibold hover:bg-hms-hover">Open</button>}</span></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-hms-line px-4 py-3 text-[13px] text-hms-muted">
            <span>Showing {Math.min(shown, rows.length)} of {rows.length}</span>
            {shown < rows.length && <button onClick={() => setShown(shown + 25)} className="font-semibold text-[#c8232e]">Show more</button>}
          </div>
        </>}
      </section>
      <p className="mt-3 text-[12.5px] text-hms-muted">Booking status, payment and room cleaning are kept separate. <Link href="/hms/housekeeping" className="font-semibold text-[#c8232e]">Housekeeping</Link> · <Link href="/hms/payments" className="font-semibold text-[#c8232e]">Payments</Link></p>
    </>
  );
}
