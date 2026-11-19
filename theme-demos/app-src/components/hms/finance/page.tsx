"use client";
// Finance — the hotel's account with BinGi (live HMS: Overview, Statement, Commissions, Subscription invoices,
// Ledger, Settlements, Refunds). Simplified to four tabs: Commissions and Refunds are ledger filters, and
// subscription invoices live only in Settings › Billing (D3). Rules: src/lib/finance/store.ts.
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronRight, Info, Printer, Search } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { dmy } from "@/lib/bookings/store";
import { useSettings } from "@/lib/settings/store";
import { messagingCost } from "@/lib/communication/store";
import { GATEWAY_PCT, KIND_LABEL, feesOf, ledger, summary, useFinance, type Entry, type Kind } from "@/lib/finance/store";
import { useCommData } from "../communication/data";
import { printHtml } from "../meals/print";
import { Sheet, btnLine, btnPrimary, input, lbl } from "../guests/ui";

type Tab = "overview" | "ledger" | "settlements" | "statement";
const TABS: [Tab, string][] = [["overview", "Overview"], ["ledger", "Ledger"], ["settlements", "Payouts"], ["statement", "Statement"]];
const card = "rounded-2xl border border-hms-line bg-white";
const sel = "h-10 rounded-lg border border-[#858c97] bg-white px-3 text-[14px] outline-none focus:border-hms-ink focus:ring-2 focus:ring-hms-blue/30";
/** Taka with paisa, like the live HMS (fees are small). */
const tk2 = (n: number) => `${n < 0 ? "−" : ""}৳${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n))}`;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function useData() {
  const { h, bk, comm } = useCommData();
  const fin = useFinance(h);
  const entries = useMemo(() => ledger(h, bk.list, messagingCost(comm.st), fin.st.settlements), [h, bk.list, comm.st, fin.st.settlements]);
  const sum = summary(entries, fin.st.settlements);
  return { h, fin, entries, sum };
}
type Data = ReturnType<typeof useData>;

export function FinancePage() {
  const d = useData();
  const sp = useSearchParams();
  const router = useRouter();
  const tab: Tab = TABS.find(([k]) => k === sp.get("tab"))?.[0] ?? "overview";
  const go = (t: Tab) => router.replace(t === "overview" ? "/hms/finance" : `/hms/finance?tab=${t}`, { scroll: false });
  return (
    <div className="h-full overflow-y-auto"><div className="hms-page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="text-[24px] font-bold tracking-[-0.01em]">Finance</h1><p className="text-[14.5px] text-hms-muted">Money guests paid online through BinGi, fees, and payouts to you.</p></div>
        <Link href="/hms/settings/billing" className={clsx(btnLine, "h-10")}>Subscription invoices<ChevronRight className="size-4" aria-hidden /></Link>
      </div>
      <div role="tablist" aria-label="Finance" className="-mx-1 mt-4 flex gap-1 overflow-x-auto border-b border-hms-line px-1">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => go(k)} className={clsx("-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-[14.5px] font-semibold", tab === k ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}>{l}{k === "settlements" && d.fin.st.settlements.some((s) => s.status === "requested") && <span className="rounded-full bg-hms-amber-soft px-2 text-[12px] text-hms-amber">1</span>}</button>)}
      </div>
      <div className="mt-4">
        {tab === "overview" && <Overview d={d} go={go} />}
        {tab === "ledger" && <Ledger d={d} />}
        {tab === "settlements" && <Payouts d={d} />}
        {tab === "statement" && <Statement d={d} />}
      </div>
    </div></div>
  );
}

function Kpi({ label, value, sub, big }: { label: string; value: string; sub?: string; big?: boolean }) {
  return <div className={clsx(card, "p-4", big && "border-hms-ink/20")}><p className="text-[13px] font-medium text-hms-muted">{label}</p><p className={clsx("mt-1 font-bold tabular-nums", big ? "text-[28px]" : "text-[20px]")}>{value}</p>{sub && <p className="mt-0.5 text-[12.5px] text-hms-muted">{sub}</p>}</div>;
}

function Overview({ d, go }: { d: Data; go: (t: Tab) => void }) {
  const s = d.sum;
  const [mkt, web, walk] = feesOf(d.h);
  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[1.2fr_2fr]">
        <div className={clsx(card, "flex flex-col p-5")}>
          <p className="text-[13px] font-medium text-hms-muted">Available balance</p>
          <p className="mt-1 text-[32px] font-bold tabular-nums">{tk2(s.available)}</p>
          <p className="text-[13px] text-hms-muted">Ready to request as a payout{s.reserved ? ` · ${tk2(s.reserved)} waiting payout` : ""}</p>
          <button onClick={() => go("settlements")} disabled={s.available <= 0} className={clsx(btnPrimary, "mt-4 self-start")}>Request payout</button>
          {s.owed > 0 && <p className="mt-3 rounded-xl bg-hms-amber-soft p-3 text-[13.5px] text-hms-amber">Fees are more than online money: {tk2(s.owed)} is added to your next invoice.</p>}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Kpi label="Paid online" value={tk2(s.collected)} sub="Website & marketplace" />
          <Kpi label="BinGi booking fees" value={tk2(s.fees)} />
          <Kpi label="Gateway fees" value={tk2(s.gateway)} sub={`Demo rate ${GATEWAY_PCT}%`} />
          <Kpi label="SMS & email" value={tk2(s.messaging)} sub="Credit packs" />
          <Kpi label="Online refunds" value={tk2(s.refunds)} />
          <Kpi label="Paid out to you" value={tk2(s.paid)} />
        </div>
      </div>
      <section className={clsx(card, "mt-3 p-4")}>
        <h2 className="flex items-center gap-2 text-[15px] font-bold"><Info className="size-4 text-hms-muted" aria-hidden />How it works</h2>
        <ul className="mt-2 grid gap-2 text-[14px] sm:grid-cols-3">
          <li><b>Online money comes here.</b> <span className="text-hms-muted">Cash and card at the hotel stay with you (see Payments and Cashbox).</span></li>
          <li><b>Fees come off.</b> <span className="text-hms-muted">Your plan: marketplace {mkt}% · website {web}% · walk-in {walk}% of the room bill, plus gateway and SMS / email.</span></li>
          <li><b>You ask for a payout.</b> <span className="text-hms-muted">BinGi sends it to your bKash or bank. A requested payout is held until it is paid.</span></li>
        </ul>
      </section>
      <section className={clsx(card, "mt-3")}>
        <div className="flex items-center justify-between px-4 pt-4"><h2 className="text-[15px] font-bold">Latest activity</h2><button onClick={() => go("ledger")} className="text-[13.5px] font-semibold text-hms-red underline underline-offset-2">See ledger</button></div>
        <Rows rows={d.entries.slice(0, 6)} />
      </section>
    </>
  );
}

function Rows({ rows }: { rows: Entry[] }) {
  if (!rows.length) return <p className="p-6 text-center text-[14.5px] text-hms-muted">Nothing here yet.</p>;
  return (
    <ul className="divide-y divide-hms-line">
      {rows.map((e) => (
        <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
          <span className="min-w-0 flex-1"><b className="block truncate text-[14px]">{KIND_LABEL[e.kind]} · {e.ref}</b><span className="block truncate text-[12.5px] text-hms-muted">{dmy(e.date)} · {e.text}</span></span>
          <b className={clsx("tabular-nums", e.amount < 0 ? "text-hms-red" : "text-hms-green")}>{tk2(e.amount)}</b>
        </li>
      ))}
    </ul>
  );
}

function Ledger({ d }: { d: Data }) {
  const [k, setK] = useState<"" | Kind>("");
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const rows = d.entries.filter((e) => (!k || e.kind === k) && (!s || [e.ref, e.text].some((x) => x.toLowerCase().includes(s))));
  const total = rows.reduce((t, e) => t + e.amount, 0);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search ledger</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-hms-muted" aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Booking or reference" className={clsx(input, "h-10 pl-9")} /></label>
        <select aria-label="Type" value={k} onChange={(e) => setK(e.target.value as Kind)} className={sel}><option value="">All types</option>{(Object.keys(KIND_LABEL) as Kind[]).map((x) => <option key={x} value={x}>{KIND_LABEL[x]}</option>)}</select>
      </div>
      <p className="mt-2 text-[13.5px] text-hms-muted">{rows.length} entr{rows.length === 1 ? "y" : "ies"} · net {tk2(total)}</p>
      <div className={clsx(card, "mt-2")}><Rows rows={rows} /></div>
    </>
  );
}

function Payouts({ d }: { d: Data }) {
  const { st: set } = useSettings(d.h);
  const accounts = set.payments.filter((p) => p.enabled && p.kind !== "cash" && p.account.trim());
  const first = d.entries.at(-1)?.date ?? TODAY;
  const [from, setFrom] = useState(first);
  const [to, setTo] = useState(TODAY);
  const [acc, setAcc] = useState(accounts[0] ? `${accounts[0].name} · ${accounts[0].account}` : "");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [cancel, setCancel] = useState<string | null>(null);
  const open = d.fin.st.settlements.find((s) => s.status === "requested");
  const submit = () => {
    setErr(""); setOk("");
    if (d.sum.available <= 0) return setErr("No balance to pay out");
    if (open) return setErr(`${open.id} is still waiting — one request at a time`);
    if (!from || !to || from > to) return setErr("Check the dates");
    if (to > TODAY) return setErr("End date can't be in the future");
    if (!acc) return setErr("Pick where BinGi should send the money");
    d.fin.request({ from, to, amount: d.sum.available, account: acc, note: note.trim() || undefined });
    setOk(`Payout of ${tk2(d.sum.available)} requested`); setNote("");
  };
  const TONE = { requested: "bg-hms-amber-soft text-hms-amber", paid: "bg-hms-green-soft text-hms-green", cancelled: "bg-hms-hover text-hms-muted" } as const;
  return (
    <div className="grid gap-3 lg:grid-cols-[380px_1fr]">
      <section className={clsx(card, "h-fit p-4")}>
        <h2 className="text-[15px] font-bold">Request payout</h2>
        <p className="mt-1 text-[24px] font-bold tabular-nums">{tk2(d.sum.available)}<span className="ml-1.5 text-[13px] font-medium text-hms-muted">available</span></p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div><label htmlFor="po-from" className={lbl}>From</label><input id="po-from" type="date" value={from} max={TODAY} onChange={(e) => setFrom(e.target.value)} className={input} /></div>
          <div><label htmlFor="po-to" className={lbl}>To</label><input id="po-to" type="date" value={to} max={TODAY} onChange={(e) => setTo(e.target.value)} className={input} /></div>
        </div>
        <label htmlFor="po-acc" className={clsx(lbl, "mt-3")}>Send to</label>
        {accounts.length ? <select id="po-acc" value={acc} onChange={(e) => setAcc(e.target.value)} className={input}>{accounts.map((a) => <option key={a.id}>{a.name} · {a.account}</option>)}</select>
          : <p id="po-acc" className="rounded-xl bg-hms-canvas p-3 text-[13.5px]">No payout account yet. Add your bKash or bank number in <Link href="/hms/settings/payments" className="font-semibold text-hms-red underline underline-offset-2">Settings › Guest payments</Link>.</p>}
        <label htmlFor="po-note" className={clsx(lbl, "mt-3")}>Note (optional)</label><input id="po-note" value={note} onChange={(e) => setNote(e.target.value)} className={input} />
        {err && <p role="alert" className="mt-3 text-[14px] font-semibold text-hms-red">{err}</p>}
        {ok && <p role="status" className="mt-3 flex items-center gap-1.5 text-[14px] font-semibold text-hms-green"><Check className="size-4" aria-hidden />{ok}</p>}
        <button onClick={submit} disabled={!accounts.length || d.sum.available <= 0} className={clsx(btnPrimary, "mt-3 w-full")}>Request payout</button>
        <p className="mt-2 text-[12.5px] text-hms-muted">BinGi (Super Admin) pays it. Prototype: requests stay “Requested”.</p>
      </section>
      <section className={card}>
        <h2 className="px-4 pt-4 text-[15px] font-bold">Payouts</h2>
        {d.fin.st.settlements.length === 0 ? <p className="p-6 text-center text-[14.5px] text-hms-muted">No payouts yet.</p> : (
          <ul className="mt-2 divide-y divide-hms-line">
            {d.fin.st.settlements.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1"><b className="block text-[14.5px]">{s.id}</b><span className="text-[13px] text-hms-muted">{dmy(s.from)} – {dmy(s.to)} · {s.account}{s.note ? ` · ${s.note}` : ""}</span></span>
                <b className="tabular-nums">{tk2(s.amount)}</b>
                <span className={clsx("rounded-md px-2 py-0.5 text-[12.5px] font-semibold capitalize", TONE[s.status])}>{s.status}</span>
                {s.status === "requested" && <button onClick={() => setCancel(s.id)} className={clsx(btnLine, "h-9")}>Cancel</button>}
              </li>
            ))}
          </ul>
        )}
      </section>
      {cancel && <Sheet title="Cancel this payout request?" sub={cancel} onClose={() => setCancel(null)} footer={<><button onClick={() => setCancel(null)} className={btnLine}>Keep it</button><button onClick={() => { d.fin.cancel(cancel); setCancel(null); }} className={clsx(btnPrimary, "flex-1")}>Cancel request</button></>}>
        <p className="text-[14.5px]">The amount goes back to your available balance.</p>
      </Sheet>}
    </div>
  );
}

function Statement({ d }: { d: Data }) {
  const months = [...new Set(d.entries.map((e) => e.date.slice(0, 7)))].sort().reverse();
  const [m, setM] = useState(months[0] ?? TODAY.slice(0, 7));
  const rows = d.entries.filter((e) => e.date.startsWith(m));
  const by = (k: Kind) => rows.filter((e) => e.kind === k).reduce((s, e) => s + e.amount, 0);
  const lines: [string, number][] = (Object.keys(KIND_LABEL) as Kind[]).map((k) => [KIND_LABEL[k], by(k)]);
  const net = rows.reduce((s, e) => s + e.amount, 0);
  const label = (x: string) => new Date(`${x}-01T00:00:00Z`).toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const print = () => printHtml(`<!doctype html><html><head><meta charset="utf-8"><title>Statement</title><style>body{font:13px system-ui;margin:28px;max-width:640px}td{padding:5px 0;border-bottom:1px solid #eee}td.n{text-align:right}</style></head><body><h2>${esc(d.h.name)} · BinGi statement</h2><p>${label(m)}</p><table style="width:100%">${lines.map(([k, v]) => `<tr><td>${k}</td><td class="n">${tk2(v)}</td></tr>`).join("")}<tr><td><b>Net for the month</b></td><td class="n"><b>${tk2(net)}</b></td></tr></table><h3>Entries</h3><table style="width:100%">${rows.map((e) => `<tr><td>${e.date}</td><td>${KIND_LABEL[e.kind]} · ${esc(e.ref)}</td><td class="n">${tk2(e.amount)}</td></tr>`).join("")}</table></body></html>`);
  return (
    <section className={clsx(card, "p-4")}>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="st-m" className="sr-only">Month</label>
        <select id="st-m" value={m} onChange={(e) => setM(e.target.value)} className={sel}>{(months.length ? months : [m]).map((x) => <option key={x} value={x}>{label(x)}</option>)}</select>
        <button onClick={print} className={clsx(btnLine, "ml-auto h-10")}><Printer className="size-4" aria-hidden />Print statement</button>
      </div>
      <dl className="mt-3 divide-y divide-hms-line text-[14.5px]">
        {lines.map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><dt className="text-hms-muted">{k}</dt><dd className={clsx("font-medium tabular-nums", v < 0 && "text-hms-red")}>{tk2(v)}</dd></div>)}
        <div className="flex justify-between py-3 text-[16px] font-bold"><dt>Net for the month</dt><dd className="tabular-nums">{tk2(net)}</dd></div>
      </dl>
    </section>
  );
}
