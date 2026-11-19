"use client";
// Reports workspace (live HMS: shared filters, 11 report tabs, PDF / Excel / Print, table view + CSV per section).
// One shared date range for every report; reports are grouped and only shown when the plan includes the module.
// Numbers come from src/lib/reports/build.ts, which reads every module and stores nothing.
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { TODAY, useRooms } from "@/lib/rooms/store";
import { dmy, useBookings } from "@/lib/bookings/store";
import { useGuestNames } from "@/lib/guests/store";
import { useServices } from "@/lib/services/store";
import { useInventory } from "@/lib/inventory/store";
import { useHrm } from "@/lib/hrm/store";
import { can } from "@/lib/plan";
import { REPORTS, build, type Fmt, type Report, type Table } from "@/lib/reports/build";
import { useProperty } from "../property";
import { usePaymentRows } from "../payments/page";
import { useSpentRows } from "../expenses/page";
import { useRestaurant } from "../meals/shared";
import { printHtml } from "../meals/print";
import { btnLine, input } from "../guests/ui";

type Preset = "today" | "yesterday" | "7" | "30" | "month" | "last" | "custom";
const PRESETS: [Preset, string][] = [["today", "Today"], ["yesterday", "Yesterday"], ["7", "Last 7 days"], ["30", "Last 30 days"], ["month", "This month"], ["last", "Last month"], ["custom", "Custom"]];
const add = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
function span(p: Preset, from: string, to: string): [string, string] {
  if (p === "today") return [TODAY, TODAY];
  if (p === "yesterday") return [add(TODAY, -1), add(TODAY, -1)];
  if (p === "7") return [add(TODAY, -6), TODAY];
  if (p === "30") return [add(TODAY, -29), TODAY];
  if (p === "month") return [`${TODAY.slice(0, 7)}-01`, TODAY];
  if (p === "last") { const e = add(`${TODAY.slice(0, 7)}-01`, -1); return [`${e.slice(0, 7)}-01`, e]; }
  return [from, to];
}
const card = "rounded-2xl border border-hms-line bg-white";
const N = new Intl.NumberFormat("en-IN");
export const fmtV = (v: number | string, f?: Fmt) => typeof v === "string" ? v : f === "money" ? `৳${N.format(Math.round(v))}` : f === "pct" ? `${Math.round(v * 100)}%` : N.format(Math.round(v * 10) / 10);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const csvOf = (t: Table) => [t.cols.map((c) => c.label), ...t.rows.map((r) => t.cols.map((c) => r[c.k] ?? ""))].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
const download = (name: string, data: string, type: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; a.click(); };
const totalOf = (t: Table, k: string) => t.rows.reduce((s, r) => s + (typeof r[k] === "number" ? (r[k] as number) : 0), 0);

function useData(from: string, to: string) {
  const h = useProperty();
  const bk = useBookings(h);
  const { st: rooms } = useRooms(h);
  const guests = useGuestNames(h);
  const pays = usePaymentRows();
  const spent = useSpentRows();
  const rest = useRestaurant();
  const svc = useServices(h);
  const inv = useInventory(h);
  const hrm = useHrm();
  const input = useMemo(() => ({
    from, to, today: TODAY, bookings: bk.list, units: rooms.units, guests, pays, spent: can(h, "expenses") ? spent : spent.filter((x) => x.src === "petty"),
    meals: can(h, "restaurant") ? rest.m.st.orders : undefined, services: can(h, "services") ? svc.st.orders : undefined, serviceName: (id: string) => svc.st.services.find((s) => s.id === id)?.name ?? "Service",
    items: can(h, "inventory") ? inv.items : undefined, payroll: can(h, "hrm") ? hrm.st.runs : undefined,
  }), [from, to, bk.list, rooms.units, guests, pays, spent, h, rest.m.st.orders, svc.st.orders, svc.st.services, inv.items, hrm.st.runs]);
  return { h, input };
}

export function ReportsWorkspace() {
  const sp = useSearchParams();
  const router = useRouter();
  const h = useProperty();
  const list = REPORTS.filter((r) => !r.need || can(h, r.need));
  const id = list.find((r) => r.id === sp.get("r"))?.id ?? "daily";
  const [p, setP] = useState<Preset>("month");
  const [cf, setCf] = useState(add(TODAY, -6));
  const [ct, setCt] = useState(TODAY);
  const [a, z] = span(p, cf, ct);
  const bad = p === "custom" && (!cf || !ct || cf > ct || ct > TODAY);
  const { input } = useData(a, z);
  const rep = build(id, input);
  const pick = (r: string) => router.replace(`/hms/reports?r=${r}`, { scroll: false });
  const groups = [...new Set(list.map((r) => r.group))];
  const title = `${h.name} · ${rep.label} · ${dmy(a)}${a !== z ? ` – ${dmy(z)}` : ""}`;

  const html = (forExcel = false) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(rep.label)}</title><style>body{font:13px system-ui;margin:24px}h1{font-size:18px}h2{font-size:15px;margin-top:22px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:5px 6px;text-align:left}td.n,th.n{text-align:right}.k{display:inline-block;margin:0 18px 8px 0}.k b{display:block;font-size:16px}</style></head><body>
    <h1>${esc(title)}</h1>${forExcel ? "" : `<div>${rep.kpis.map((k) => `<span class="k">${esc(k.label)}<b>${fmtV(k.value, k.fmt)}</b></span>`).join("")}</div>`}
    ${forExcel ? `<table>${rep.kpis.map((k) => `<tr><td>${esc(k.label)}</td><td class="n">${typeof k.value === "number" && k.fmt !== "pct" ? Math.round(k.value) : fmtV(k.value, k.fmt)}</td></tr>`).join("")}</table>` : ""}
    ${rep.tables.map((t) => `<h2>${esc(t.title)}</h2><table><tr>${t.cols.map((c) => `<th class="${c.fmt && c.fmt !== "text" ? "n" : ""}">${esc(c.label)}</th>`).join("")}</tr>${t.rows.map((r) => `<tr>${t.cols.map((c) => `<td class="${c.fmt && c.fmt !== "text" ? "n" : ""}">${forExcel && typeof r[c.k] === "number" && c.fmt !== "pct" ? Math.round(r[c.k] as number) : esc(fmtV(r[c.k] ?? "", c.fmt))}</td>`).join("")}</tr>`).join("")}${t.total ? `<tr>${t.cols.map((c, i) => `<td class="n"><b>${i === 0 ? "Total" : c.fmt === "money" || c.fmt === "int" ? (forExcel ? Math.round(totalOf(t, c.k)) : fmtV(totalOf(t, c.k), c.fmt)) : ""}</b></td>`).join("")}</tr>` : ""}</table>`).join("")}
    ${rep.note ? `<p style="color:#555">${esc(rep.note)}</p>` : ""}</body></html>`;

  return (
    <div className="h-full overflow-y-auto"><div className="hms-page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="text-[24px] font-bold tracking-[-0.01em]">Reports</h1><p className="text-[14.5px] text-hms-muted">One date range for every report. Export what you see.</p></div>
        <div className="flex gap-2">
          <button onClick={() => printHtml(html())} className={clsx(btnLine, "h-10")} aria-label="PDF (print and save as PDF)"><FileText className="size-4" aria-hidden /><span>PDF</span></button>
          <button onClick={() => download(`${rep.id}-${a}-${z}.xls`, html(true), "application/vnd.ms-excel")} className={clsx(btnLine, "h-10")} aria-label="Excel"><FileSpreadsheet className="size-4" aria-hidden /><span>Excel</span></button>
          <button onClick={() => printHtml(html())} className={clsx(btnLine, "h-10")} aria-label="Print"><Printer className="size-4" aria-hidden /><span>Print</span></button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Date range">
          {PRESETS.map(([k, l]) => <button key={k} aria-pressed={p === k} onClick={() => setP(k)} className={clsx("h-9 shrink-0 rounded-full border px-3.5 text-[13.5px] font-medium", p === k ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line bg-white hover:bg-hms-hover")}>{l}</button>)}
        </div>
        {p === "custom" && <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="rf">From</label><input id="rf" type="date" max={TODAY} value={cf} onChange={(e) => setCf(e.target.value)} className={clsx(input, "h-9 w-[160px]")} />
          <span className="text-hms-muted">–</span>
          <label className="sr-only" htmlFor="rt">To</label><input id="rt" type="date" max={TODAY} value={ct} onChange={(e) => setCt(e.target.value)} className={clsx(input, "h-9 w-[160px]")} />
        </div>}
        <span className="ml-auto text-[13px] text-hms-muted">{dmy(a)}{a !== z ? ` – ${dmy(z)}` : ""}</span>
      </div>
      {bad && <p role="alert" className="mt-2 text-[14px] font-semibold text-hms-red">Pick a start date on or before the end date, and not after today.</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Reports" className="hidden lg:block">
          {groups.map((g) => <div key={g} className="mb-3"><p className="px-2 pb-1 text-[12px] font-semibold uppercase tracking-wide text-hms-muted">{g}</p>
            {list.filter((r) => r.group === g).map((r) => <button key={r.id} aria-current={r.id === id ? "page" : undefined} onClick={() => pick(r.id)} className={clsx("block w-full rounded-lg px-2.5 py-2 text-left text-[14px]", r.id === id ? "bg-white font-semibold shadow-sm ring-1 ring-hms-line" : "hover:bg-hms-hover")}>{r.label}</button>)}</div>)}
        </nav>
        <div className="min-w-0">
          <label htmlFor="rep" className="sr-only">Report</label>
          <select id="rep" value={id} onChange={(e) => pick(e.target.value)} className={clsx(input, "mb-3 font-semibold lg:hidden")}>{groups.map((g) => <optgroup key={g} label={g}>{list.filter((r) => r.group === g).map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</optgroup>)}</select>
          {!bad && <ReportView rep={rep} key={`${rep.id}`} />}
        </div>
      </div>
    </div></div>
  );
}

function ReportView({ rep }: { rep: Report }) {
  return (
    <div className="space-y-3">
      <h2 className="text-[18px] font-bold">{rep.label}</h2>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {rep.kpis.map((k) => <div key={k.label} className={clsx(card, "p-4")}><p className="text-[13px] font-medium text-hms-muted">{k.label}</p><p className={clsx("mt-1 text-[20px] font-bold tabular-nums", k.fmt === "money" && k.value < 0 && "text-hms-red")}>{fmtV(k.value, k.fmt)}</p>{k.sub && <p className="mt-0.5 text-[12.5px] text-hms-muted">{k.sub}</p>}</div>)}
      </div>
      {rep.chart && rep.chart.points.length > 1 && <Bars c={rep.chart} />}
      {rep.tables.map((t) => <TableView key={t.title} t={t} />)}
      {rep.note && <p className="text-[12.5px] text-hms-muted">{rep.note}</p>}
    </div>
  );
}

function Bars({ c }: { c: NonNullable<Report["chart"]> }) {
  const [hv, setHv] = useState<number | null>(null);
  const max = Math.max(c.fmt === "pct" ? 1 : 1, ...c.points.map((p) => p.v));
  return (
    <section className={clsx(card, "p-4")}>
      <h3 className="text-[15px] font-bold">{c.title}</h3>
      <div className="relative mt-3 flex h-40 items-end gap-[2px]" onMouseLeave={() => setHv(null)} role="img" aria-label={`${c.title}: ${c.points.length} days`}>
        {c.points.map((p, i) => <div key={p.label} className="flex h-full min-w-0 flex-1 items-end justify-center" onMouseEnter={() => setHv(i)}><div className="w-full max-w-[36px] rounded-t-[4px]" style={{ height: `${Math.max(0, (p.v / max) * 100)}%`, minHeight: p.v > 0 ? 2 : 0, background: hv === i ? "#8e1621" : "#b11c29", opacity: hv === null || hv === i ? 1 : 0.55 }} /></div>)}
        {hv !== null && <div className="pointer-events-none absolute -top-2 rounded-lg border border-hms-line bg-white px-2.5 py-1.5 text-[12.5px] shadow-md" style={{ left: `min(${(hv / c.points.length) * 100}%, calc(100% - 120px))` }}><b className="block">{fmtV(c.points[hv].v, c.fmt)}</b><span className="text-hms-muted">{dmy(c.points[hv].label)}</span></div>}
      </div>
      <div className="mt-1 flex justify-between text-[11.5px] text-hms-muted"><span>{dmy(c.points[0].label)}</span><span>{dmy(c.points.at(-1)!.label)}</span></div>
    </section>
  );
}

function TableView({ t }: { t: Table }) {
  const [sort, setSort] = useState<{ k: string; up: boolean } | null>(null);
  const [all, setAll] = useState(false);
  const rows = useMemo(() => !sort ? t.rows : [...t.rows].sort((x, y) => { const a = x[sort.k], b = y[sort.k]; const r = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b)); return sort.up ? r : -r; }), [t.rows, sort]);
  const shown = all ? rows : rows.slice(0, 50);
  const num = (f?: Fmt) => f === "money" || f === "int" || f === "pct";
  return (
    <section className={card}>
      <div className="flex items-center gap-2 px-4 pt-3.5">
        <h3 className="min-w-0 flex-1 text-[15px] font-bold">{t.title} <span className="font-normal text-hms-muted">· {t.rows.length} row{t.rows.length === 1 ? "" : "s"}</span></h3>
        <button onClick={() => download(`${t.title.toLowerCase().replace(/\W+/g, "-")}.csv`, csvOf(t), "text/csv")} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] font-semibold text-hms-muted hover:bg-hms-hover" aria-label={`Download ${t.title} as CSV`}><Download className="size-3.5" aria-hidden />CSV</button>
      </div>
      {t.rows.length === 0 ? <p className="px-4 py-6 text-[14px] text-hms-muted">{t.empty ?? "Nothing in this period."}</p> : (
        <div tabIndex={0} role="region" aria-label={t.title} className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[480px] text-[14px]">
            <thead><tr className="border-b border-hms-line text-[12.5px] text-hms-muted">{t.cols.map((c) => (
              <th key={c.k} aria-sort={sort?.k === c.k ? (sort.up ? "ascending" : "descending") : undefined} className={clsx("px-4 py-2 font-semibold", num(c.fmt) ? "text-right" : "text-left")}>
                <button onClick={() => setSort((s) => (s?.k === c.k ? { k: c.k, up: !s.up } : { k: c.k, up: !num(c.fmt) }))} className="inline-flex items-center gap-1 hover:text-hms-ink">{c.label}{sort?.k === c.k && (sort.up ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />)}</button>
              </th>))}</tr></thead>
            <tbody className="divide-y divide-hms-line">{shown.map((r, i) => <tr key={i}>{t.cols.map((c) => <td key={c.k} className={clsx("px-4 py-2", num(c.fmt) && "text-right tabular-nums", typeof r[c.k] === "number" && (r[c.k] as number) < 0 && c.fmt === "money" && "text-hms-red")}>{fmtV(r[c.k] ?? "", c.fmt)}</td>)}</tr>)}</tbody>
            {t.total && <tfoot><tr className="border-t-2 border-hms-line font-bold">{t.cols.map((c, i) => <td key={c.k} className={clsx("px-4 py-2", num(c.fmt) && "text-right tabular-nums")}>{i === 0 ? "Total" : c.fmt === "money" || c.fmt === "int" ? fmtV(totalOf(t, c.k), c.fmt) : ""}</td>)}</tr></tfoot>}
          </table>
          {rows.length > 50 && <button onClick={() => setAll(!all)} className="m-3 text-[13.5px] font-semibold text-hms-red underline underline-offset-2">{all ? "Show first 50" : `Show all ${rows.length}`}</button>}
        </div>
      )}
    </section>
  );
}
