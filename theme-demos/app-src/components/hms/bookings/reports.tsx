"use client";
import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { TODAY, oooOn } from "@/lib/rooms/store";
import { addDays } from "@/lib/bookings/demo";
import { channelLabel, dm, dow, tk, type Booking } from "@/lib/bookings/store";
import { BookingsFrame, card, useBk } from "./ui";

export function ReportsPage() { return <BookingsFrame tab="reports"><Reports /></BookingsFrame>; }

type Range = "next7" | "next30" | "last7" | "month";
const RANGES: [Range, string][] = [["next7", "Next 7 days"], ["next30", "Next 30 days"], ["last7", "Last 7 days"], ["month", "This month"]];
const span = (r: Range): [string, string] => {
  if (r === "next7") return [TODAY, addDays(TODAY, 7)];
  if (r === "next30") return [TODAY, addDays(TODAY, 30)];
  if (r === "last7") return [addDays(TODAY, -7), TODAY];
  const a = `${TODAY.slice(0, 7)}-01`; const d = new Date(`${a}T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + 1);
  return [a, d.toISOString().slice(0, 10)];
};
const sold = (b: Booking) => b.status === "Confirmed" || b.status === "Checked in" || b.status === "Checked out";
const pct = (n: number) => `${Math.round(n * 100)}%`;
const BAR = "#3b6fd8";

/** Room revenue in these reports = room price before VAT & service, after discount (the industry basis for ADR / RevPAR). */
function Reports() {
  const { bk, mode } = useBk();
  const [r, setR] = useState<Range>("next7");
  const [a, z] = span(r);
  const days = useMemo(() => { const out: string[] = []; for (let d = a; d < z; d = addDays(d, 1)) out.push(d); return out; }, [a, z]);
  const data = useMemo(() => {
    const perDay = days.map((d) => {
      const avail = bk.units.filter((u) => !oooOn(u, d, addDays(d, 1))).length;
      let n = 0, rev = 0;
      for (const b of bk.list) {
        if (!sold(b)) continue;
        const night = b.nights.find((x) => x.date === d); if (!night) continue;
        n += 1; rev += night.base - (b.nights.length ? b.discount / b.nights.length : 0);
      }
      return { d, avail, n, rev };
    });
    const avail = perDay.reduce((s, x) => s + x.avail, 0), n = perDay.reduce((s, x) => s + x.n, 0), rev = perDay.reduce((s, x) => s + x.rev, 0);
    const src = new Map<string, { n: number; rev: number }>();
    for (const b of bk.list) {
      if (!sold(b)) continue;
      const inR = b.nights.filter((x) => x.date >= a && x.date < z); if (!inR.length) continue;
      const k = channelLabel(b); const v = src.get(k) ?? { n: 0, rev: 0 };
      v.n += inR.length; v.rev += inR.reduce((s, x) => s + x.base, 0) - (b.discount * inR.length) / Math.max(1, b.nights.length); src.set(k, v);
    }
    const byType = new Map<string, { n: number; rev: number }>();
    for (const b of bk.list) {
      if (!sold(b)) continue;
      const inR = b.nights.filter((x) => x.date >= a && x.date < z); if (!inR.length) continue;
      const v = byType.get(b.type) ?? { n: 0, rev: 0 }; v.n += inR.length; v.rev += inR.reduce((s, x) => s + x.base, 0); byType.set(b.type, v);
    }
    const lost = bk.list.filter((b) => (b.status === "Cancelled" || b.status === "No-show") && b.from < z && b.to > a);
    const pick = bk.list.filter((b) => b.created.slice(0, 10) > addDays(TODAY, -7) && b.created.slice(0, 10) <= TODAY && b.status !== "Cancelled");
    return { perDay, avail, n, rev, src: [...src.entries()].sort((x, y) => y[1].n - x[1].n), byType: [...byType.entries()].sort((x, y) => y[1].rev - x[1].rev), lost, pick };
  }, [bk.list, bk.units, days, a, z]);
  const occ = data.avail ? data.n / data.avail : 0;
  const adr = data.n ? data.rev / data.n : 0;
  const revpar = data.avail ? data.rev / data.avail : 0;
  const maxSrc = Math.max(1, ...data.src.map(([, v]) => v.n));
  const lostFees = data.lost.reduce((s, b) => s + (b.cancel?.keep ?? 0), 0);
  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Report period" className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {RANGES.map(([k, l]) => <button key={k} role="radio" aria-checked={r === k} onClick={() => setR(k)} className={clsx("h-10 shrink-0 rounded-full px-3.5 text-[14px] font-semibold", r === k ? "bg-hms-ink text-white" : "bg-white ring-1 ring-hms-line hover:ring-hms-ink")}>{l}</button>)}
        <span className="ml-auto self-center whitespace-nowrap text-[13px] text-hms-muted">{dm(a)} – {dm(addDays(z, -1))}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Tile k="Occupancy" v={pct(occ)} s={`${data.n} of ${data.avail} room-nights`} />
        <Tile k="ADR" v={tk(Math.round(adr))} s="Average price per sold night" />
        <Tile k="RevPAR" v={tk(Math.round(revpar))} s="Room revenue per available night" />
        <Tile k="Room revenue" v={tk(Math.round(data.rev))} s="Before VAT & service" />
      </div>
      <Box title="Occupancy by night" sub="Hover a bar for the numbers.">
        <div className="flex h-44 items-end gap-[2px]" role="list" aria-label="Occupancy by night">
          {data.perDay.map((x) => { const o = x.avail ? x.n / x.avail : 0; return (
            <div key={x.d} role="listitem" tabIndex={0} aria-label={`${dm(x.d)}: ${pct(o)}, ${x.n} of ${x.avail} rooms, ${tk(Math.round(x.rev))}`} title={`${dow(x.d)} ${dm(x.d)} · ${pct(o)} · ${x.n}/${x.avail} rooms · ${tk(Math.round(x.rev))}`} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end focus-visible:outline-2 focus-visible:outline-hms-ink">
              {data.perDay.length <= 14 && <span className="mb-1 text-center text-[11.5px] font-semibold tabular-nums text-[#3a414c]">{pct(o)}</span>}
              <div className="rounded-t-[4px] transition-opacity group-hover:opacity-80" style={{ height: `${Math.max(o * 88, 1.5)}%`, background: BAR }} />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0f1720] px-2 py-1 text-[12px] font-semibold text-white group-hover:block group-focus-visible:block">{pct(o)} · {x.n}/{x.avail}</span>
            </div>); })}
        </div>
        <div className="mt-1.5 flex gap-[2px] text-[11px] text-hms-muted">{data.perDay.map((x, i) => <span key={x.d} className="min-w-0 flex-1 truncate text-center">{data.perDay.length <= 14 || i % 5 === 0 ? x.d.slice(8, 10) : ""}</span>)}</div>
      </Box>
      <div className="grid gap-4 lg:grid-cols-2">
        <Box title="Where bookings come from" sub="Room-nights in this period">
          <ul className="space-y-2.5">{data.src.map(([k, v]) => (
            <li key={k}><div className="flex justify-between text-[13.5px]"><span className="font-semibold">{k}</span><span className="tabular-nums text-[#3a414c]">{v.n} nights · {tk(Math.round(v.rev))}</span></div>
              <div className="mt-1 h-2 rounded-full bg-[#eef0f3]"><div className="h-2 rounded-full" style={{ width: `${(v.n / maxSrc) * 100}%`, background: BAR }} /></div></li>))}
            {!data.src.length && <li className="text-[14px] text-hms-muted">No sold nights in this period.</li>}</ul>
        </Box>
        <Box title="By room type">
          <table className="w-full text-[13.5px]"><thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="pb-1.5 font-semibold">Room type</th><th className="text-right font-semibold">Nights</th><th className="text-right font-semibold">ADR</th><th className="text-right font-semibold">Revenue</th></tr></thead>
            <tbody className="divide-y divide-hms-line">{data.byType.map(([k, v]) => <tr key={k}><td className="py-1.5 font-semibold">{k}</td><td className="text-right tabular-nums">{v.n}</td><td className="text-right tabular-nums">{tk(Math.round(v.rev / Math.max(1, v.n)))}</td><td className="text-right tabular-nums">{tk(v.rev)}</td></tr>)}</tbody></table>
          {!data.byType.length && <p className="text-[14px] text-hms-muted">Nothing sold yet.</p>}
        </Box>
        <Box title="Cancellations & no-shows" sub="Stays overlapping this period">
          <p className="text-[14px]"><b className="text-[20px] tabular-nums">{data.lost.length}</b> lost · fees kept <b>{tk(lostFees)}</b></p>
          {mode === "details" && <ul className="mt-2 space-y-1 text-[13px] text-[#3a414c]">{data.lost.slice(0, 8).map((b) => <li key={b.code}>{b.code} · {b.status} · {dm(b.from)} · {channelLabel(b)}{b.cancel?.reason ? ` · ${b.cancel.reason}` : ""}</li>)}</ul>}
        </Box>
        <Box title="Pick-up · last 7 days" sub="New bookings made, by date booked">
          <p className="text-[14px]"><b className="text-[20px] tabular-nums">{data.pick.length}</b> booking{data.pick.length === 1 ? "" : "s"} · {data.pick.reduce((s, b) => s + b.nights.length, 0)} room-nights</p>
        </Box>
      </div>
      <p className="text-[13.5px]"><Link href="/hms/reports?r=occupancy" className="font-semibold text-hms-red underline underline-offset-2">All reports</Link> <span className="text-hms-muted">— sales, profit, payments, guests and more, with PDF / Excel export.</span></p>
      <p className="text-[12.5px] text-hms-muted">Occupancy counts rooms that are not out of order. Revenue here is the room price only — meals, services and fees are in Cashbox and their own modules.</p>
    </div>
  );
}
function Tile({ k, v, s }: { k: string; v: string; s: string }) {
  return <div className={clsx(card, "px-4 py-3")}><p className="text-[12.5px] font-semibold text-hms-muted">{k}</p><p className="text-[22px] font-bold tabular-nums">{v}</p><p className="text-[12px] text-hms-muted">{s}</p></div>;
}
function Box({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return <section className={clsx(card, "p-4 sm:p-5")}><h2 className="text-[15.5px] font-bold">{title}</h2>{sub && <p className="mb-3 text-[12.5px] text-hms-muted">{sub}</p>}{!sub && <div className="mb-3" />}{children}</section>;
}
