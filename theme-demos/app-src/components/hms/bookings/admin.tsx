"use client";
import Link from "next/link";
import clsx from "clsx";
import { type ReactNode } from "react";
import { CircleCheck, Lock, Moon, Printer } from "lucide-react";
import { formCHtml, registerHtml } from "@/lib/bookings/docs";
import { printHtml } from "../meals/print";
import { useProperty } from "../property";
import { TODAY } from "@/lib/rooms/store";
import { bill, dm, dmy, dueOf, policyFee, timeOf, tk } from "@/lib/bookings/store";
import { BookingsFrame, ChannelBadge, bMain, bSoft, card, useBk } from "./ui";

function Box({ title, sub, children, action }: { title: string; sub?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className={clsx(card, "p-4 sm:p-5")}>
      <div className="mb-3 flex items-start justify-between gap-3"><div><h2 className="text-[16px] font-bold">{title}</h2>{sub && <p className="text-[13px] text-hms-muted">{sub}</p>}</div>{action}</div>
      {children}
    </section>
  );
}

// ---------------- Day close (night audit) ----------------
export function DayClosePage() {
  return <BookingsFrame tab="close"><DayCloseBody /></BookingsFrame>;
}
function DayCloseBody() {
  const h = useProperty();
  const { bk, guests, toast, open } = useBk();
  const S = bk.settings;
  const L = bk.list;
  const notArrived = L.filter((b) => b.status === "Confirmed" && b.from <= TODAY);
  const overdue = L.filter((b) => b.status === "Checked in" && b.to <= TODAY);
  const owing = L.filter((b) => b.status === "Checked in" && dueOf(b) > 0);
  const arrivals = L.filter((b) => b.from === TODAY && (b.status === "Checked in" || b.status === "Checked out")).length;
  const departures = L.filter((b) => b.status === "Checked out" && (b.checkedOutAt ?? "").startsWith(TODAY)).length;
  const inHouse = L.filter((b) => b.status === "Checked in").length;
  const noShows = L.filter((b) => b.status === "No-show" && (b.cancel?.at ?? "").startsWith(TODAY)).length;
  // Tonight's room revenue: tonight's night of every stay in house (incl. VAT & service).
  const revenue = L.filter((b) => b.status === "Checked in" || b.status === "Checked out").reduce((s, b) => { const n = b.nights.find((x) => x.date === TODAY); return n ? s + bill({ nights: [n], tax: b.tax, discount: 0, mealPlan: b.mealPlan }).total : s; }, 0);
  const collected = L.reduce((s, b) => s + b.payments.filter((p) => p.at.startsWith(TODAY)).reduce((a, p) => a + p.amount, 0), 0);
  const closed = bk.audits.find((a) => a.date === TODAY);
  const open3 = notArrived.length + overdue.length;
  const noShow = (code: string) => { const b = L.find((x) => x.code === code)!; const fee = policyFee(b, "No-show", S); bk.cancel(code, "No-show", "Did not arrive", fee); toast(`${b.code} marked no-show${fee ? ` · fee ${tk(fee)}` : ""}`); };
  const name = (id: string) => guests.get(id)?.name ?? "Guest";
  return (
    <div className="space-y-4">
      <div className={clsx(card, "flex flex-wrap items-center gap-3 p-4 sm:p-5")}>
        <span className="grid size-11 place-items-center rounded-xl bg-[#eef0ff] text-[#3d4bd6]"><Moon className="size-5" /></span>
        <div className="min-w-0 flex-1"><h2 className="text-[17px] font-bold">Close {dmy(TODAY)}</h2><p className="text-[13.5px] text-hms-muted">{closed ? `Closed at ${timeOf(closed.at)} by ${closed.by}` : open3 ? `${open3} thing${open3 > 1 ? "s" : ""} to check first` : "Everything is checked — ready to close"}</p></div>
        {closed ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f5ec] px-3 py-1.5 text-[13.5px] font-semibold text-[#16693a]"><Lock className="size-4" />Day closed</span>
          : <button onClick={() => { bk.closeDay({ date: TODAY, arrivals, departures, noShows, inHouse, revenue, collected }); toast(`${dm(TODAY)} closed`); }} className={bMain}>Close the day</button>}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi k="Arrived" v={arrivals} /><Kpi k="Left" v={departures} /><Kpi k="In house" v={inHouse} /><Kpi k="No-shows" v={noShows} /><Kpi k="Room revenue" v={tk(revenue)} /><Kpi k="Collected" v={tk(collected)} />
      </div>
      <Box title="Not arrived" sub={`No-show fee: ${S.noShowFeePct}% of the first night`}>
        {notArrived.length ? <ul className="divide-y divide-hms-line">{notArrived.map((b) => (
          <li key={b.code} className="flex flex-wrap items-center gap-3 py-2.5">
            <button onClick={() => open(b.code)} className="min-w-0 flex-1 text-left"><b className="block text-[14px]">{name(b.guestId)}</b><span className="flex items-center gap-2 text-[12.5px] text-hms-muted">{b.code} · {b.unit ? `Room ${b.unit}` : "No room"} · {dm(b.from)}<ChannelBadge b={b} /></span></button>
            <button onClick={() => open(b.code, "checkin")} className={clsx(bSoft, "!h-9 px-3 text-[13.5px]")}>Check in</button>
            <button onClick={() => noShow(b.code)} aria-label={`Mark ${name(b.guestId)} no-show`} className="h-9 rounded-xl bg-[#fdecec] px-3 text-[13.5px] font-semibold text-[#b42318]">No-show · {tk(policyFee(b, "No-show", S))}</button>
          </li>))}</ul> : <Ok text="Everyone due today has arrived." />}
      </Box>
      <div className="grid gap-4 lg:grid-cols-2">
        <Box title="Check-out overdue">
          {overdue.length ? <ul className="divide-y divide-hms-line">{overdue.map((b) => <li key={b.code} className="flex items-center gap-3 py-2.5"><span className="min-w-0 flex-1"><b className="block text-[14px]">{name(b.guestId)}</b><span className="text-[12.5px] text-hms-muted">Room {b.unit} · due out {dm(b.to)}</span></span><button onClick={() => open(b.code, "checkout")} className={clsx(bSoft, "!h-9 px-3 text-[13.5px]")}>Check out</button></li>)}</ul> : <Ok text="No overdue check-outs." />}
        </Box>
        <Box title="In house with a balance" sub={owing.length ? `${tk(owing.reduce((s, b) => s + dueOf(b), 0))} still to collect` : undefined}>
          {owing.length ? <ul className="divide-y divide-hms-line">{owing.map((b) => <li key={b.code} className="flex items-center gap-3 py-2.5"><button onClick={() => open(b.code)} className="min-w-0 flex-1 text-left"><b className="block text-[14px]">{name(b.guestId)}</b><span className="text-[12.5px] text-hms-muted">Room {b.unit}</span></button><b className="tabular-nums text-[#b42318]">{tk(dueOf(b))}</b></li>)}</ul> : <Ok text="All in-house guests are paid up." />}
        </Box>
      </div>
      <Box title="Registers for tonight" sub="Daily guest register and foreign-guest list (Form-C) — print or save as PDF.">
        {(() => { const rows = L.filter((b) => b.status === "Checked in").sort((a, c) => a.unit.localeCompare(c.unit, undefined, { numeric: true })).map((b) => ({ b, g: guests.get(b.guestId) })); const foreign = rows.filter((r) => r.g && r.g.country !== "Bangladesh"); const missing = rows.filter((r) => !r.g?.idNo).length; return (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => printHtml(registerHtml(h, TODAY, rows))} className={clsx(bSoft, "!h-10")}><Printer className="size-4" />Guest register · {rows.length}</button>
            <button onClick={() => printHtml(formCHtml(h, TODAY, foreign))} className={clsx(bSoft, "!h-10")}><Printer className="size-4" />Form-C · {foreign.length} foreign</button>
            {missing > 0 && <span className="text-[13px] font-semibold text-[#a15c00]">{missing} guest{missing > 1 ? "s" : ""} without ID number</span>}
          </div>); })()}
      </Box>
      <Box title="Closed days">
        {bk.audits.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-[13.5px]"><thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="py-2 font-semibold">Date</th><th className="font-semibold">Arrived</th><th className="font-semibold">Left</th><th className="font-semibold">In house</th><th className="font-semibold">No-shows</th><th className="text-right font-semibold">Revenue</th><th className="text-right font-semibold">Collected</th></tr></thead>
          <tbody className="divide-y divide-hms-line">{bk.audits.map((a) => <tr key={a.date + a.at}><td className="py-2 font-semibold">{dm(a.date)}<span className="block text-[12px] font-normal text-hms-muted">{timeOf(a.at)} · {a.by}</span></td><td>{a.arrivals}</td><td>{a.departures}</td><td>{a.inHouse}</td><td>{a.noShows}</td><td className="text-right tabular-nums">{tk(a.revenue)}</td><td className="text-right tabular-nums">{tk(a.collected)}</td></tr>)}</tbody></table></div>
          : <p className="text-[14px] text-hms-muted">No day closed yet. <Link href="/hms/cashbox" className="font-semibold text-hms-red">Cash is closed in Cashbox</Link>.</p>}
      </Box>
    </div>
  );
}
function Kpi({ k, v }: { k: string; v: ReactNode }) {
  return <div className="rounded-xl bg-[#f7f8fa] px-3.5 py-3"><p className="text-[12.5px] font-semibold text-hms-muted">{k}</p><p className="text-[19px] font-bold tabular-nums">{v}</p></div>;
}
function Ok({ text }: { text: string }) {
  return <p className="flex items-center gap-2 py-1 text-[14px] text-[#16693a]"><CircleCheck className="size-4" />{text}</p>;
}
