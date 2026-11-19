"use client";
// Payments — same frame as the live HMS Payments (KPIs, revenue trend, transactions with Gateway / Transaction,
// Export) plus: source filter (rooms / restaurant / services), "To collect" and "Refunds due" worklists.
// Read-only: every row lives in its own module (src/lib/payments/ledger.ts). Taking money / refunding opens the booking.
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Download, Printer, Search, ShieldCheck, Wallet } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { dmy, timeOf, tk, useBookings } from "@/lib/bookings/store";
import { useGuestNames } from "@/lib/guests/store";
import { receiptHtml } from "@/lib/bookings/docs";
import { useServices } from "@/lib/services/store";
import { can } from "@/lib/plan";
import { addDays } from "@/lib/cashbox/store";
import { METHODS, SOURCE_LABEL, URGENCY, ledger, refundsDue, sums, toCollect, type Method, type Row, type Source } from "@/lib/payments/ledger";
import { useProperty } from "../property";
import { useRestaurant } from "../meals/shared";
import { printHtml } from "../meals/print";
import { Sheet, btnLine, btnPrimary, input } from "../guests/ui";

type Tab = "all" | "collect" | "refunds";
type Period = "today" | "7" | "30" | "90" | "all";
const PERIODS: [Period, string][] = [["today", "Today"], ["7", "7 days"], ["30", "30 days"], ["90", "90 days"], ["all", "All"]];
const card = "rounded-2xl border border-hms-line bg-white";
const sel = "h-10 rounded-lg border border-[#858c97] bg-white px-3 text-[14px] outline-none focus:border-hms-ink focus:ring-2 focus:ring-hms-blue/30";
const since = (p: Period) => (p === "all" ? "0000" : p === "today" ? TODAY : addDays(TODAY, -(Number(p) - 1)));
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Every guest payment row for the current property (shared with Expenses › Overview and Reports). */
export function usePaymentRows() {
  const h = useProperty();
  const bk = useBookings(h);
  const gmap = useGuestNames(h);
  const rest = useRestaurant();
  const svc = useServices(h);
  return useMemo(() => ledger({
    bookings: bk.list, guestName: (id) => gmap.get(id)?.name ?? "Guest",
    meals: can(h, "restaurant") ? rest.m.st.orders : [],
    services: can(h, "services") ? svc.st.orders : [], serviceName: (id) => svc.st.services.find((s) => s.id === id)?.name ?? "Service",
  }), [bk.list, gmap, h, rest.m.st.orders, svc.st.orders, svc.st.services]);
}

export function PaymentsPage() {
  const h = useProperty();
  const sp = useSearchParams();
  const bk = useBookings(h);
  const gmap = useGuestNames(h);
  const [tab, setTab] = useState<Tab>((["all", "collect", "refunds"] as Tab[]).find((t) => t === sp.get("tab")) ?? "all");
  const [period, setPeriod] = useState<Period>("30");
  const [q, setQ] = useState("");
  const [src, setSrc] = useState<"" | Source>("");
  const [meth, setMeth] = useState<"" | Method>("");
  const [kind, setKind] = useState<"" | Row["kind"]>("");
  const [open, setOpen] = useState<Row | null>(null);

  const rows = usePaymentRows();
  const inPeriod = useMemo(() => rows.filter((r) => r.at.slice(0, 10) >= since(period) && r.at.slice(0, 10) <= TODAY), [rows, period]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return inPeriod.filter((r) => (!src || r.source === src) && (!meth || r.method === meth) && (!kind || r.kind === kind)
      && (!s || [r.ref, r.guest, r.gateway ?? "", r.note ?? ""].some((x) => x.toLowerCase().includes(s))));
  }, [inPeriod, q, src, meth, kind]);
  const t = sums(inPeriod);
  const collect = useMemo(() => toCollect(bk.list, TODAY), [bk.list]);
  const refunds = useMemo(() => refundsDue(bk.list), [bk.list]);
  const dueTotal = collect.reduce((s, x) => s + x.due, 0);
  const filtered = !!(q || src || meth || kind);

  const exportCsv = () => {
    const head = ["Payment ID", "Booking / order", "Guest", "Source", "Type", "Method", "Gateway / reference", "Date", "Time", "Amount", "By"];
    const lines = shown.map((r) => [r.id, r.ref, r.guest, SOURCE_LABEL[r.source], r.kind, r.method, r.gateway ?? "", r.at.slice(0, 10), r.at.slice(11, 16), r.amount, r.by]);
    const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `payments-${h.slug}-${TODAY}.csv`; a.click();
  };
  const printList = () => printHtml(`<!doctype html><html><head><meta charset="utf-8"><title>Payments</title><style>body{font:13px system-ui;margin:24px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:6px;text-align:left}td.n{text-align:right}</style></head><body>
    <h2>${esc(h.name)} · Payments</h2><p>${PERIODS.find((p) => p[0] === period)![1]} · Collected ${tk(t.collected)} · Refunded ${tk(t.refunded)} · Net ${tk(t.net)}</p>
    <table><tr><th>Date</th><th>Ref</th><th>Guest</th><th>Source</th><th>Method</th><th>Amount</th></tr>${shown.map((r) => `<tr><td>${r.at.slice(0, 10)} ${r.at.slice(11, 16)}</td><td>${esc(r.ref)}</td><td>${esc(r.guest)}</td><td>${SOURCE_LABEL[r.source]}</td><td>${r.method}</td><td class="n">${r.amount < 0 ? "−" : ""}${tk(Math.abs(r.amount))}</td></tr>`).join("")}</table></body></html>`);

  return (
    <div className="h-full overflow-y-auto"><div className="hms-page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold tracking-[-0.01em]">Payments</h1>
          <p className="text-[14.5px] text-hms-muted">Every payment and refund from bookings{can(h, "restaurant") ? ", restaurant" : ""}{can(h, "services") ? " and services" : ""}.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={printList} aria-label="Print" className={clsx(btnLine, "h-10")}><Printer className="size-4" aria-hidden /><span className="hidden sm:inline">Print</span></button>
          <button onClick={exportCsv} className={clsx(btnPrimary, "h-10")}><Download className="size-4" aria-hidden />Export</button>
        </div>
      </div>

      <div className="-mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Period">
        {PERIODS.map(([p, l]) => <button key={p} aria-pressed={period === p} onClick={() => setPeriod(p)} className={clsx("h-9 shrink-0 rounded-full border px-3.5 text-[13.5px] font-medium", period === p ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line bg-white hover:bg-hms-hover")}>{l}</button>)}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Collected" value={tk(t.collected)} sub={`${t.count} payment${t.count === 1 ? "" : "s"} · avg ${tk(t.avg)}`} />
        <Kpi label="Refunded" value={tk(t.refunded)} sub="Given back to guests" />
        <Kpi label="Net received" value={tk(t.net)} sub="Collected − refunded" strong />
        <Kpi label="Balance due" value={tk(dueTotal)} sub={`${collect.length} booking${collect.length === 1 ? "" : "s"} owe money`} tone={dueTotal > 0 ? "red" : undefined} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_300px]">
        <section className={clsx(card, "p-4")}>
          <h2 className="text-[15px] font-bold">Net received by day</h2>
          <Trend rows={inPeriod} from={period === "all" ? addDays(TODAY, -29) : since(period)} />
        </section>
        <section className={clsx(card, "p-4")}>
          <h2 className="text-[15px] font-bold">By method</h2>
          <ul className="mt-2 divide-y divide-hms-line">
            {METHODS.map((m) => <li key={m} className="flex items-center justify-between py-2 text-[14px]"><span>{m}</span><b className="tabular-nums">{tk(t.byMethod[m])}</b></li>)}
          </ul>
          <Link href="/hms/cashbox" className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-hms-red underline underline-offset-2"><Wallet className="size-4" aria-hidden />Cash is counted in Cashbox</Link>
        </section>
      </div>

      <div role="tablist" aria-label="Payments" className="mt-5 flex gap-1 border-b border-hms-line">
        {([["all", "Transactions", shown.length], ["collect", "To collect", collect.length], ["refunds", "Refunds due", refunds.length]] as [Tab, string, number][]).map(([k, l, n]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={clsx("-mb-px flex h-11 items-center gap-2 border-b-2 px-3 text-[14.5px] font-semibold", tab === k ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}>
            {l}<span className={clsx("rounded-full px-2 text-[12px]", k !== "all" && n ? "bg-hms-coral-soft text-hms-accent-ink" : "bg-hms-hover text-hms-muted")}>{n}</span>
          </button>
        ))}
      </div>

      {tab === "all" && (
        <section className="mt-3">
          <div className="flex flex-wrap gap-2">
            <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search payments</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-hms-muted" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Booking, guest, reference" className={clsx(input, "h-10 pl-9")} /></label>
            <select aria-label="Source" value={src} onChange={(e) => setSrc(e.target.value as Source | "")} className={sel}>
              <option value="">All sources</option>{(["booking", ...(can(h, "restaurant") ? ["restaurant"] : []), ...(can(h, "services") ? ["service"] : [])] as Source[]).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
            </select>
            <select aria-label="Method" value={meth} onChange={(e) => setMeth(e.target.value as Method | "")} className={sel}><option value="">All methods</option>{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
            <select aria-label="Type" value={kind} onChange={(e) => setKind(e.target.value as Row["kind"] | "")} className={sel}><option value="">All types</option><option value="payment">Payments</option><option value="refund">Refunds</option><option value="deposit">Deposits</option></select>
            {filtered && <button onClick={() => { setQ(""); setSrc(""); setMeth(""); setKind(""); }} className={clsx(btnLine, "h-10")}>Clear</button>}
          </div>
          {shown.length === 0 ? (
            <div className={clsx(card, "mt-3 p-8 text-center")}><p className="text-[15px] font-semibold">{filtered ? "No payments match" : "No payments in this period"}</p><p className="mt-1 text-[14px] text-hms-muted">{filtered ? "Change the filters or clear them." : "Pick a longer period."}</p></div>
          ) : (
            <div className={clsx(card, "mt-3 overflow-hidden")}>
              <table className="hidden w-full text-[14px] lg:table">
                <thead className="bg-[#f8f9fb] text-left text-[12.5px] uppercase tracking-wide text-hms-muted"><tr><th className="px-4 py-2.5">Date</th><th className="px-3">Booking / order</th><th className="px-3">Guest</th><th className="px-3">Source</th><th className="px-3">Method</th><th className="hidden px-3 xl:table-cell">Gateway / reference</th><th className="px-4 text-right">Amount</th></tr></thead>
                <tbody className="divide-y divide-hms-line">
                  {shown.map((r) => (
                    <tr key={r.id} className="cursor-pointer hover:bg-[#f8f9fb]" onClick={() => setOpen(r)}>
                      <td className="whitespace-nowrap px-4 py-2.5">{dmy(r.at.slice(0, 10))}<span className="block text-[12.5px] text-hms-muted">{timeOf(r.at)}</span></td>
                      <td className="px-3"><button onClick={(e) => { e.stopPropagation(); setOpen(r); }} className="font-semibold underline-offset-2 hover:underline">{r.ref}</button></td>
                      <td className="max-w-[180px] truncate px-3">{r.guest}</td>
                      <td className="px-3 text-hms-muted">{SOURCE_LABEL[r.source]}</td>
                      <td className="px-3">{r.method}</td>
                      <td className="hidden max-w-[200px] truncate px-3 text-hms-muted xl:table-cell">{r.gateway ?? (r.kind === "deposit" ? r.note : "—")}</td>
                      <td className="whitespace-nowrap px-4 text-right"><Amount r={r} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="divide-y divide-hms-line lg:hidden">
                {shown.map((r) => (
                  <li key={r.id}><button onClick={() => setOpen(r)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <span className="min-w-0 flex-1"><b className="block truncate text-[14.5px]">{r.guest}</b><span className="block truncate text-[13px] text-hms-muted">{r.ref} · {SOURCE_LABEL[r.source]} · {r.method}</span><span className="block text-[12.5px] text-hms-muted">{dmy(r.at.slice(0, 10))} · {timeOf(r.at)}</span></span>
                    <Amount r={r} />
                  </button></li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {tab === "collect" && (
        <section className="mt-3">
          {collect.length === 0 ? <Empty text="Every booking is paid." /> : (
            <ul className={clsx(card, "divide-y divide-hms-line")}>
              {collect.map(({ b, due, total, rank }) => (
                <li key={b.code} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[14.5px]">{gmap.get(b.guestId)?.name ?? "Guest"} <span className="font-normal text-hms-muted">· {b.code}{b.unit ? ` · Room ${b.unit}` : ""}</span></b>
                    <span className="text-[13px] text-hms-muted"><span className={clsx("mr-1.5 rounded px-1.5 py-0.5 text-[12px] font-semibold", rank <= 1 ? "bg-hms-coral-soft text-hms-accent-ink" : "bg-hms-hover text-hms-muted")}>{URGENCY[rank]}</span>{dmy(b.from)} → {dmy(b.to)} · bill {tk(total)}</span>
                  </span>
                  <b className="tabular-nums text-hms-red">{tk(due)}</b>
                  <Link href={`/hms/bookings/view?b=${b.code}&do=pay&from=${encodeURIComponent("/hms/payments?tab=collect")}`} className={clsx(btnPrimary, "h-9")}>Take payment</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "refunds" && (
        <section className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 text-[13.5px] text-hms-muted"><ShieldCheck className="size-4" aria-hidden />Refunds are made from the booking, so the bill, receipt and Cashbox stay in step.</p>
          {refunds.length === 0 ? <Empty text="No refunds waiting." /> : (
            <ul className={clsx(card, "divide-y divide-hms-line")}>
              {refunds.map(({ b, amount }) => (
                <li key={b.code} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1"><b className="block truncate text-[14.5px]">{gmap.get(b.guestId)?.name ?? "Guest"} <span className="font-normal text-hms-muted">· {b.code}</span></b><span className="text-[13px] text-hms-muted">{b.status}{b.cancel ? ` · ${b.cancel.reason}` : ""}</span></span>
                  <b className="tabular-nums">{tk(amount)}</b>
                  <Link href={`/hms/bookings/view?b=${b.code}&do=pay&from=${encodeURIComponent("/hms/payments?tab=refunds")}`} className={clsx(btnLine, "h-9")}>Refund</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {open && <Detail r={open} onClose={() => setOpen(null)} bk={bk} gmap={gmap} />}
    </div></div>
  );
}

function Kpi({ label, value, sub, strong, tone }: { label: string; value: string; sub: string; strong?: boolean; tone?: "red" }) {
  return <div className={clsx(card, "p-4")}><p className="text-[13px] font-medium text-hms-muted">{label}</p><p className={clsx("mt-1 text-[22px] font-bold tabular-nums", tone === "red" && "text-hms-red", strong && "text-hms-ink")}>{value}</p><p className="mt-0.5 text-[12.5px] text-hms-muted">{sub}</p></div>;
}
function Amount({ r }: { r: Row }) {
  const out = r.amount < 0;
  return <span className={clsx("inline-flex items-center gap-1 font-semibold tabular-nums", r.kind === "deposit" ? "text-hms-muted" : out ? "text-hms-red" : "text-hms-green")}>
    {out ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownLeft className="size-3.5" aria-hidden />}{out ? "−" : ""}{tk(Math.abs(r.amount))}
    <span className="sr-only">{r.kind === "deposit" ? " (deposit)" : out ? " (refund)" : ""}</span>
  </span>;
}
function Empty({ text }: { text: string }) { return <div className={clsx(card, "p-8 text-center text-[15px] font-semibold")}>{text}</div>; }

/** One series (net received per day), bars from the baseline, hover tooltip. */
function Trend({ rows, from }: { rows: Row[]; from: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const days: { d: string; v: number }[] = [];
  for (let d = from; d <= TODAY; d = addDays(d, 1)) days.push({ d, v: rows.filter((r) => r.kind !== "deposit" && r.at.slice(0, 10) === d).reduce((s, r) => s + r.amount, 0) });
  const max = Math.max(1, ...days.map((x) => x.v));
  const W = 640, H = 150, gap = 2, bw = Math.max(2, W / days.length - gap);
  return (
    <div className="relative mt-2">
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="h-[170px] w-full" role="img" aria-label={`Net received per day from ${dmy(from)} to ${dmy(TODAY)}`} onMouseLeave={() => setHover(null)}>
        <line x1="0" x2={W} y1={H} y2={H} stroke="#e3e7ec" />
        {days.map((x, i) => {
          const hgt = Math.max(0, (x.v / max) * (H - 8)), xx = i * (bw + gap);
          return <g key={x.d} onMouseEnter={() => setHover(i)}>
            <rect x={xx} y={0} width={bw + gap} height={H} fill="transparent" />
            <rect x={xx} y={H - hgt} width={bw} height={hgt} rx={Math.min(4, bw / 2)} fill={hover === i ? "#8e1621" : "#b11c29"} opacity={hover === null || hover === i ? 1 : 0.55} />
          </g>;
        })}
        <text x="0" y={H + 14} fontSize="11" fill="#4d5664">{dmy(from)}</text>
        <text x={W} y={H + 14} fontSize="11" fill="#4d5664" textAnchor="end">{dmy(TODAY)}</text>
      </svg>
      {hover !== null && <div className="pointer-events-none absolute top-0 rounded-lg border border-hms-line bg-white px-2.5 py-1.5 text-[12.5px] shadow-md" style={{ left: `min(calc(${((hover + 0.5) / days.length) * 100}% ), calc(100% - 130px))` }}><b className="block">{tk(days[hover].v)}</b><span className="text-hms-muted">{dmy(days[hover].d)}</span></div>}
    </div>
  );
}

function Detail({ r, onClose, bk, gmap }: { r: Row; onClose: () => void; bk: ReturnType<typeof useBookings>; gmap: ReturnType<typeof useGuestNames> }) {
  const h = useProperty();
  const b = r.booking ? bk.list.find((x) => x.code === r.booking) : undefined;
  const pay = b?.payments.find((p) => r.id === `b-${b.code}-${p.id}`);
  const href = r.source === "booking" && b ? `/hms/bookings/view?b=${b.code}` : r.source === "restaurant" ? "/hms/meals/orders" : "/hms/other-services/orders";
  const simple = () => printHtml(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt</title><style>body{font:14px system-ui;margin:32px;max-width:420px}td{padding:4px 0}td.n{text-align:right}</style></head><body><h2>${esc(h.name)}</h2><p>${r.amount < 0 ? "Refund receipt" : "Money receipt"} · ${esc(r.ref)}</p><table style="width:100%"><tr><td>Guest</td><td class="n">${esc(r.guest)}</td></tr><tr><td>For</td><td class="n">${SOURCE_LABEL[r.source]}${r.note ? ` · ${esc(r.note)}` : ""}</td></tr><tr><td>Method</td><td class="n">${r.method}</td></tr><tr><td>Date</td><td class="n">${r.at.slice(0, 10)} ${r.at.slice(11, 16)}</td></tr><tr><td><b>Amount</b></td><td class="n"><b>${tk(Math.abs(r.amount))}</b></td></tr></table></body></html>`);
  const rows: [string, string][] = [["Type", r.kind === "deposit" ? "Security deposit" : r.kind === "refund" ? "Refund" : "Payment"], ["Source", SOURCE_LABEL[r.source]], ["Booking / order", r.ref], ["Guest", r.guest], ["Method", r.method], ["Gateway / reference", r.gateway ?? "—"], ["Date", `${dmy(r.at.slice(0, 10))} · ${timeOf(r.at)}`], ["Taken by", r.by], ...(r.note && !r.gateway ? [["Note", r.note] as [string, string]] : [])];
  return (
    <Sheet title={`${r.amount < 0 ? "−" : ""}${tk(Math.abs(r.amount))}`} sub={`${r.kind === "refund" ? "Refund" : r.kind === "deposit" ? "Deposit" : "Payment"} · ${r.ref}`} onClose={onClose}
      footer={<>
        <button onClick={() => (b && pay ? printHtml(receiptHtml(h, b, gmap.get(b.guestId), pay)) : simple())} className={clsx(btnLine, "flex-1")} disabled={r.kind === "deposit"}><Printer className="size-4" aria-hidden />Print receipt</button>
        <Link href={href} className={clsx(btnPrimary, "flex-1")}>{r.source === "booking" ? "Open booking" : "Open orders"}</Link>
      </>}>
      <dl className="divide-y divide-hms-line text-[14.5px]">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-hms-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
      {r.method === "Cash" && r.kind !== "deposit" && <p className="mt-4 rounded-xl bg-hms-canvas p-3 text-[13.5px] text-hms-muted">Cash goes to the Cashbox drawer that was open when it was taken. <Link href="/hms/cashbox/movements" className="font-semibold text-hms-red underline underline-offset-2">See cash movements</Link></p>}
      {r.gateway && <p className="mt-4 rounded-xl bg-hms-canvas p-3 text-[13.5px] text-hms-muted">Checked by staff against the gateway / MFS reference. Prototype: no live gateway connection here.</p>}
    </Sheet>
  );
}
