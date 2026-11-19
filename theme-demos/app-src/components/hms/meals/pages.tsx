"use client";
// Restaurant & Bar — Overview, Orders, Kitchen, Reports, Settings. POS in pos.tsx; Menu and Tables & QR in setup.tsx.
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { BellRing, ChefHat, Clock, Pause, Search, Wallet } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { METHOD_LABEL, SERVICE_LABEL, SOURCE_LABEL, addDays, bill, tk, type Order, type Service, type Settings, type Status } from "@/lib/meals/seed";
import { ageOf } from "@/lib/meals/store";
import { btnLine, btnPrimary, input, lbl } from "../guests/ui";
import { MealsFrame } from "./frame";
import { OrderSheet, PayChip, PaySheet, SERVICE_ICON, StatusChip, useRestaurant, useToast, type Restaurant } from "./shared";

const card = "rounded-2xl border border-hms-line bg-white";

/** Order + payment sheets used by several screens. */
function useSheets(r: Restaurant, show: (m: string) => void) {
  const [open, setOpen] = useState<string | null>(null);
  const [pay, setPay] = useState<string | null>(null);
  const node = <>
    {open && !pay && <OrderSheet r={r} id={open} onClose={() => setOpen(null)} onDone={(m) => { show(m); setOpen(null); }} onPay={() => setPay(open)} />}
    {pay && <PaySheet r={r} id={pay} onClose={() => setPay(null)} onDone={(m) => { show(m); setPay(null); setOpen(null); }} />}
  </>;
  return { open: setOpen, pay: setPay, node };
}
function Loading() { return <p role="status" className="p-8 text-[14px] text-hms-muted">Loading…</p>; }

// =================== Overview ===================
export function OverviewPage() {
  const r = useRestaurant();
  const [toast, show] = useToast();
  const sh = useSheets(r, show);
  if (!r.m.ready) return <MealsFrame tab="overview"><Loading /></MealsFrame>;
  const today = r.m.st.orders.filter((o) => o.at.slice(0, 10) === TODAY && o.outlet !== "__");
  const accepted = today.filter((o) => !["approval", "cancelled", "declined"].includes(o.status));
  const value = accepted.reduce((s, o) => s + bill(o).total, 0);
  const collected = accepted.filter((o) => o.pay !== "unpaid").reduce((s, o) => s + bill(o).total, 0);
  const waiting = today.filter((o) => o.status === "approval");
  const ready = today.filter((o) => o.status === "ready");
  const kq = (s: Status) => today.filter((o) => o.status === s).length;
  const simulate = () => {
    const t = r.m.st.places.find((p) => p.kind === "table" && p.accepting && p.visible);
    const it = r.m.st.items.filter((i) => i.available && i.qr).slice(0, 2);
    r.m.create({ outlet: r.outlet, source: "table_qr", service: "dinein", place: t?.id, lines: it.map((i) => ({ item: i.id, name: i.name, price: i.price, qty: 1 })) });
    show(`New QR order from table ${t?.name ?? ""}`);
  };
  return (
    <MealsFrame tab="overview" toast={toast} outlets={r.m.outlets}>
      {r.m.st.settings.paused && <p className="mb-4 flex items-center gap-2 rounded-xl border border-[#f1dfb8] bg-[#fffaf0] px-4 py-2.5 text-[14px] text-[#7a4a0b]"><Pause className="size-4" aria-hidden />New orders are paused. <Link href="/hms/meals/settings" className="font-semibold underline">Settings</Link></p>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi l="Today's orders" v={tk(value)} s={`${accepted.length} accepted`} />
        <Kpi l="Collected" v={tk(collected)} s="Paid or charged to a room" tone="text-[#1c7d45]" />
        <Kpi l="Not paid yet" v={tk(value - collected)} s={`${accepted.filter((o) => o.pay === "unpaid").length} orders`} tone={value - collected ? "text-[#b11c29]" : undefined} />
        <Kpi l="Needs approval" v={String(waiting.length)} s="QR orders to check" tone={waiting.length ? "text-[#8a5300]" : undefined} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className={clsx(card, "p-5")} aria-labelledby="ap">
          <div className="flex items-center justify-between gap-2"><h2 id="ap" className="flex items-center gap-2 text-[16px] font-bold"><BellRing className="size-4 text-[#8a5300]" aria-hidden />Needs approval <span className="text-hms-muted">{waiting.length}</span></h2><button onClick={simulate} className="text-[12.5px] font-semibold text-hms-muted underline">Prototype: new QR order</button></div>
          {waiting.length ? <ul className="mt-3 space-y-2">{waiting.map((o) => (
            <li key={o.id} className="rounded-xl border border-[#f1dfb8] bg-[#fffaf0] p-3">
              <p className="flex justify-between gap-2 text-[14px]"><b>{r.placeName(o)} · {o.no}</b><span className="tabular-nums">{tk(bill(o).total)}</span></p>
              <p className="truncate text-[13px] text-hms-muted">{o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</p>
              <div className="mt-2 flex gap-2"><button onClick={() => sh.open(o.id)} className={clsx(btnLine, "h-9 flex-1 px-3")}>Check</button><button onClick={() => { r.m.setStatus(o.id, "queued"); show(`${o.no} sent to the kitchen`); }} className={clsx(btnPrimary, "h-9 flex-1 px-3")}>Approve</button></div>
            </li>))}</ul> : <p className="mt-3 text-[14px] text-hms-muted">No orders waiting.</p>}
        </section>
        <section className={clsx(card, "p-5")} aria-labelledby="rd">
          <h2 id="rd" className="text-[16px] font-bold">Ready to serve <span className="text-hms-muted">{ready.length}</span></h2>
          {ready.length ? <ul className="mt-3 space-y-2">{ready.map((o) => (
            <li key={o.id} className="flex items-center gap-3 rounded-xl border border-hms-line p-3"><div className="min-w-0 flex-1"><b className="block text-[14px]">{r.placeName(o)}</b><span className="text-[12.5px] text-hms-muted">{o.no} · {ageOf(o)} min</span></div><button onClick={() => { r.m.setStatus(o.id, "served"); show(`${o.no} served`); }} className={clsx(btnPrimary, "h-9 px-3")}>Served</button></li>
          ))}</ul> : <p className="mt-3 text-[14px] text-hms-muted">Nothing waiting at the pass.</p>}
        </section>
        <section className={clsx(card, "p-5")} aria-labelledby="kt">
          <div className="flex items-center justify-between"><h2 id="kt" className="text-[16px] font-bold">Kitchen now</h2><Link href="/hms/meals/kitchen" className="text-[13.5px] font-semibold text-hms-red">Open</Link></div>
          <dl className="mt-3 grid grid-cols-3 gap-2">{([["queued", "Queued"], ["preparing", "Preparing"], ["ready", "Ready"]] as const).map(([k, l]) => <div key={k} className="rounded-xl bg-[#f4f6f8] px-3 py-2.5"><dt className="text-[12.5px] text-hms-muted">{l}</dt><dd className="text-[22px] font-bold tabular-nums">{kq(k)}</dd></div>)}</dl>
          <Link href="/hms/meals/cashbox" className="mt-3 flex items-center gap-2 rounded-xl border border-hms-line px-3 py-2.5 text-[13.5px] hover:bg-hms-hover"><Wallet className="size-4 text-hms-muted" aria-hidden /><span className="flex-1">Restaurant cashbox</span><span className="font-semibold text-hms-red">Open</span></Link>
        </section>
      </div>
      <section className={clsx(card, "mt-4 overflow-hidden")} aria-label="Recent orders">
        <div className="flex items-center justify-between px-5 py-4"><h2 className="text-[17px] font-bold">Recent orders</h2><Link href="/hms/meals/orders" className="text-[14px] font-semibold text-hms-red">View all</Link></div>
        <OrderTable r={r} list={[...today].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6)} onOpen={sh.open} onPay={sh.pay} />
      </section>
      {sh.node}
    </MealsFrame>
  );
}
function Kpi({ l, v, s, tone }: { l: string; v: string; s?: string; tone?: string }) {
  return <div className={clsx(card, "px-4 py-3")}><p className="text-[13px] text-hms-muted">{l}</p><p className={clsx("text-[22px] font-bold tabular-nums", tone)}>{v}</p>{s && <p className="text-[12.5px] text-hms-muted">{s}</p>}</div>;
}

// =================== Orders ===================
function OrderTable({ r, list, onOpen, onPay }: { r: Restaurant; list: Order[]; onOpen: (id: string) => void; onPay: (id: string) => void }) {
  if (!list.length) return <p className="border-t border-hms-line px-6 py-12 text-center text-[14.5px] text-hms-muted">No orders here.</p>;
  const act = (o: Order) => o.status === "approval" ? <button onClick={() => onOpen(o.id)} className={clsx(btnPrimary, "h-9 px-3")}>Check</button>
    : o.status === "ready" ? <button onClick={() => { r.m.setStatus(o.id, "served"); }} className={clsx(btnPrimary, "h-9 px-3")}>Served</button>
    : o.pay === "unpaid" && o.status === "served" ? <button onClick={() => onPay(o.id)} className={clsx(btnPrimary, "h-9 px-3")}>Take payment</button>
    : <button onClick={() => onOpen(o.id)} className={clsx(btnLine, "h-9 px-3")}>View</button>;
  return (
    <>
      <div className="hidden overflow-x-auto border-t border-hms-line md:block">
        <table className="w-full text-[14px]">
          <thead><tr className="bg-[#f7f8fa] text-left text-[12.5px] font-semibold text-hms-muted"><th className="px-5 py-2.5">Order</th><th className="px-3 py-2.5">From</th><th className="px-3 py-2.5">Where</th><th className="px-3 py-2.5">Items</th><th className="px-3 py-2.5 text-right">Total</th><th className="px-3 py-2.5">Payment</th><th className="px-3 py-2.5">Status</th><th className="px-5 py-2.5 text-right"><span className="sr-only">Action</span></th></tr></thead>
          <tbody>{list.map((o) => { const Icon = SERVICE_ICON[o.service]; return (
            <tr key={o.id} className="border-t border-hms-line/70">
              <td className="whitespace-nowrap px-5 py-3"><button onClick={() => onOpen(o.id)} className="font-mono text-[13px] font-semibold hover:underline">{o.no}</button><span className="block text-[12.5px] text-hms-muted">{o.at.slice(0, 10) === TODAY ? "" : `${o.at.slice(5, 10)} · `}{o.at.slice(11, 16)}</span></td>
              <td className="px-3 py-3 text-[13px]">{SOURCE_LABEL[o.source]}<span className="block text-hms-muted">{SERVICE_LABEL[o.service]}</span></td>
              <td className="px-3 py-3"><span className="flex items-center gap-1.5"><Icon className="size-4 text-hms-muted" aria-hidden />{r.placeName(o)}</span>{o.guest && <span className="block text-[12.5px] text-hms-muted">{o.guest}</span>}</td>
              <td className="max-w-[260px] px-3 py-3 text-[13px]"><span className="line-clamp-2">{o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</span></td>
              <td className="whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums">{tk(bill(o).total)}</td>
              <td className="px-3 py-3"><PayChip o={o} /></td>
              <td className="px-3 py-3"><StatusChip s={o.status} /></td>
              <td className="px-5 py-3 text-right">{act(o)}</td>
            </tr>
          ); })}</tbody>
        </table>
      </div>
      <ul className="divide-y divide-hms-line border-t border-hms-line md:hidden">{list.map((o) => (
        <li key={o.id} className="px-4 py-3">
          <div className="flex items-start justify-between gap-2"><button onClick={() => onOpen(o.id)} className="min-w-0 text-left"><b className="block text-[14.5px]">{r.placeName(o)} · <span className="font-mono text-[13px]">{o.no}</span></b><span className="line-clamp-1 text-[12.5px] text-hms-muted">{o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</span></button><b className="tabular-nums">{tk(bill(o).total)}</b></div>
          <div className="mt-2 flex flex-wrap items-center gap-2"><StatusChip s={o.status} /><PayChip o={o} /><span className="ml-auto">{act(o)}</span></div>
        </li>
      ))}</ul>
    </>
  );
}

type OFilter = "all" | "approval" | "kitchen" | "ready" | "unpaid" | "served" | "cancelled";
export function OrdersPage() {
  const r = useRestaurant();
  const [toast, show] = useToast();
  const sh = useSheets(r, show);
  const [f, setF] = useState<OFilter>("all");
  const [q, setQ] = useState("");
  const [svc, setSvc] = useState<Service | "all">("all");
  const [day, setDay] = useState<"today" | "7d">("today");
  if (!r.m.ready) return <MealsFrame tab="orders"><Loading /></MealsFrame>;
  const from = day === "today" ? TODAY : addDays(TODAY, -6);
  const base = r.m.st.orders.filter((o) => o.at.slice(0, 10) >= from);
  const match = (o: Order, k: OFilter) => k === "all" ? true : k === "approval" ? o.status === "approval" : k === "kitchen" ? o.status === "queued" || o.status === "preparing" : k === "ready" ? o.status === "ready" : k === "unpaid" ? o.pay === "unpaid" && !["approval", "cancelled", "declined"].includes(o.status) : k === "served" ? o.status === "served" : o.status === "cancelled" || o.status === "declined";
  const list = base.filter((o) => match(o, f) && (svc === "all" || o.service === svc) && (!q || `${o.no} ${r.placeName(o)} ${o.guest ?? ""} ${o.lines.map((l) => l.name).join(" ")}`.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.at.localeCompare(a.at));
  const chips: [OFilter, string][] = [["all", "All"], ["approval", "Needs approval"], ["kitchen", "In kitchen"], ["ready", "Ready"], ["unpaid", "Not paid"], ["served", "Served"], ["cancelled", "Cancelled"]];
  return (
    <MealsFrame tab="orders" toast={toast} outlets={r.m.outlets}>
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#858c97] bg-white px-3"><Search className="size-4 text-hms-muted" aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, table, room, guest, dish" aria-label="Search orders" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" /></label>
        <select aria-label="Service type" value={svc} onChange={(e) => setSvc(e.target.value as Service | "all")} className="h-11 w-auto rounded-lg border border-[#858c97] bg-white px-3 text-[15px] outline-none focus:border-hms-ink"><option value="all">All service types</option>{(Object.keys(SERVICE_LABEL) as Service[]).map((s) => <option key={s} value={s}>{SERVICE_LABEL[s]}</option>)}</select>
        <div role="radiogroup" aria-label="Period" className="flex rounded-lg bg-[#e9edf2] p-1">{([["today", "Today"], ["7d", "Last 7 days"]] as const).map(([v, l]) => <button key={v} role="radio" aria-checked={day === v} onClick={() => setDay(v)} className={clsx("h-9 rounded-md px-3 text-[13.5px] font-semibold", day === v ? "bg-white shadow-sm" : "text-[#4d5664]")}>{l}</button>)}</div>
      </div>
      <div role="tablist" aria-label="Order status" className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
        {chips.map(([k, l]) => { const n = base.filter((o) => match(o, k)).length; return <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)} className={clsx("h-9 shrink-0 rounded-full border px-3.5 text-[13.5px] font-semibold", f === k ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line bg-white hover:bg-hms-hover")}>{l} <span className="tabular-nums opacity-70">{n}</span></button>; })}
      </div>
      <section className={clsx(card, "mt-4 overflow-hidden")} aria-label="Orders"><OrderTable r={r} list={list} onOpen={sh.open} onPay={sh.pay} /></section>
      {sh.node}
    </MealsFrame>
  );
}

// =================== Kitchen ===================
export function KitchenPage() {
  const r = useRestaurant();
  const [toast, show] = useToast();
  if (!r.m.ready) return <MealsFrame tab="kitchen"><Loading /></MealsFrame>;
  const today = r.m.st.orders.filter((o) => o.at.slice(0, 10) === TODAY).sort((a, b) => a.at.localeCompare(b.at));
  const cols: [Status, string, string, string, Status | null, string][] = [
    ["queued", "Queued", "bg-[#fff8ec] border-[#f3e3bd]", "Start", "preparing", "Started"],
    ["preparing", "Preparing", "bg-[#f1f5ff] border-[#d8e3fb]", "Ready", "ready", "Ready for pickup"],
    ["ready", "Ready", "bg-[#effaf3] border-[#cfe7da]", "Served", "served", "Served"],
  ];
  const prepOf = (o: Order) => Math.max(...o.lines.map((l) => r.m.st.items.find((i) => i.id === l.item)?.prep ?? 10));
  return (
    <MealsFrame tab="kitchen" toast={toast} outlets={r.m.outlets} wide>
      <p className="mb-3 text-[13.5px] text-hms-muted">Oldest first. A ticket turns red when it takes longer than its dishes&apos; prep time. {today.filter((o) => o.status === "approval").length > 0 && <Link href="/hms/meals/orders" className="font-semibold text-[#8a5300] underline">{today.filter((o) => o.status === "approval").length} waiting for approval</Link>}</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {cols.map(([s, l, tone, btn, to, msg]) => { const list = today.filter((o) => o.status === s); return (
          <section key={s} className={clsx("min-h-[300px] rounded-2xl border p-3", tone)} aria-label={l}>
            <h2 className="mb-3 flex items-center gap-2 px-1 text-[16px] font-bold">{l}<span className="rounded-full bg-white px-2 text-[13px] tabular-nums">{list.length}</span></h2>
            {list.length ? <ul className="space-y-2.5">{list.map((o) => { const age = ageOf(o), late = age > prepOf(o) + 5; const Icon = SERVICE_ICON[o.service]; return (
              <li key={o.id} className={clsx("rounded-xl border bg-white p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)]", late ? "border-[#f3c4c0]" : "border-white")}>
                <div className="flex items-center gap-2"><Icon className="size-4 text-hms-muted" aria-hidden /><b className="flex-1 text-[15px]">{r.placeName(o)}</b><span className={clsx("flex items-center gap-1 text-[13px] font-semibold tabular-nums", late ? "text-[#b11c29]" : "text-hms-muted")}><Clock className="size-3.5" aria-hidden />{age} min</span></div>
                <p className="text-[12.5px] text-hms-muted">{o.no} · {SERVICE_LABEL[o.service]}</p>
                {(o.round ?? 1) > 1 && <p className="mt-2 rounded-md bg-[#fff1e6] px-2 py-1 text-[12.5px] font-semibold text-[#a4500f]">Added items · round {o.round}{o.lines.some((l) => (l.round ?? 1) < (o.round ?? 1)) ? ` · ${o.lines.filter((l) => (l.round ?? 1) < (o.round ?? 1)).reduce((a, l) => a + l.qty, 0)} earlier items already served` : ""}</p>}
                <ul className="mt-2 space-y-1 text-[14px]">{o.lines.filter((ln) => (ln.round ?? 1) === (o.round ?? 1)).map((ln, i) => <li key={i}><b className="tabular-nums">{ln.qty}×</b> {ln.name}{ln.note && <span className="block pl-5 text-[12.5px] font-semibold text-[#a4500f]">{ln.note}</span>}</li>)}</ul>
                {to && <button onClick={() => { r.m.setStatus(o.id, to); show(`${o.no}: ${msg.toLowerCase()}`); }} className={clsx(s === "ready" ? btnPrimary : btnLine, "mt-3 h-10 w-full")}>{btn}</button>}
              </li>
            ); })}</ul> : <p className="px-1 py-8 text-center text-[14px] text-hms-muted">No {l.toLowerCase()} orders.</p>}
          </section>
        ); })}
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12.5px] text-hms-muted"><ChefHat className="size-4" aria-hidden />Kitchen ticket printing is set in the live HMS (Settings → Printing).</p>
    </MealsFrame>
  );
}

// =================== Reports ===================
export function ReportsPage() {
  const r = useRestaurant();
  const [day, setDay] = useState<"today" | "7d">("7d");
  if (!r.m.ready) return <MealsFrame tab="reports"><Loading /></MealsFrame>;
  const from = day === "today" ? TODAY : addDays(TODAY, -6);
  const os = r.m.st.orders.filter((o) => o.at.slice(0, 10) >= from);
  const acc = os.filter((o) => !["approval", "cancelled", "declined"].includes(o.status));
  const sum = (l: Order[]) => l.reduce((s, o) => s + bill(o).total, 0);
  const paid = acc.filter((o) => o.pay !== "unpaid");
  const paidBy = (m: string) => paid.reduce((s, o) => s + (o.payments?.length ? o.payments.filter((p) => p.method === m).reduce((a, p) => a + p.amount, 0) : o.method === m ? bill(o).total : 0), 0);
  const byMethod = (["cash", "card", "bkash", "room"] as const).map((m) => [METHOD_LABEL[m], paidBy(m)] as [string, number]);
  const items = new Map<string, { n: number; v: number }>();
  for (const o of acc) for (const l of o.lines) { const x = items.get(l.name) ?? { n: 0, v: 0 }; x.n += l.qty; x.v += l.qty * l.price; items.set(l.name, x); }
  const top = [...items.entries()].sort((a, b) => b[1].v - a[1].v).slice(0, 6);
  const bySvc = (Object.keys(SERVICE_LABEL) as Service[]).map((s) => [SERVICE_LABEL[s], sum(acc.filter((o) => o.service === s))] as [string, number]).filter((x) => x[1] > 0);
  const days = Array.from({ length: day === "today" ? 1 : 7 }, (_, i) => addDays(TODAY, -(day === "today" ? 0 : 6) + i));
  const perDay = days.map((d) => [d, sum(acc.filter((o) => o.at.slice(0, 10) === d))] as [string, number]);
  const maxDay = Math.max(1, ...perDay.map((x) => x[1]));
  return (
    <MealsFrame tab="reports" outlets={r.m.outlets}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[18px] font-bold">Sales &amp; orders</h2>
        <div role="radiogroup" aria-label="Period" className="flex rounded-lg bg-[#e9edf2] p-1">{([["today", "Today"], ["7d", "Last 7 days"]] as const).map(([v, l]) => <button key={v} role="radio" aria-checked={day === v} onClick={() => setDay(v)} className={clsx("h-9 rounded-md px-3 text-[13.5px] font-semibold", day === v ? "bg-white shadow-sm" : "text-[#4d5664]")}>{l}</button>)}</div></div>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi l="Accepted orders" v={tk(sum(acc))} s={`${acc.length} orders · avg ${tk(acc.length ? sum(acc) / acc.length : 0)}`} />
        <Kpi l="Collected" v={tk(sum(paid))} s="Cash, card, bKash, room bills" tone="text-[#1c7d45]" />
        <Kpi l="Not paid yet" v={tk(sum(acc) - sum(paid))} tone={sum(acc) - sum(paid) ? "text-[#b11c29]" : undefined} />
        <Kpi l="Cancelled / declined" v={String(os.filter((o) => o.status === "cancelled" || o.status === "declined").length)} s={`${os.filter((o) => o.status === "approval").length} still waiting approval`} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className={clsx(card, "p-5 lg:col-span-2")} aria-label="Sales by day">
          <h3 className="text-[16px] font-bold">Sales by day</h3>
          <ul className="mt-4 flex h-[180px] items-end gap-2">{perDay.map(([d, v]) => <li key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><span className="text-[11.5px] font-semibold tabular-nums">{v ? tk(v) : ""}</span><span className="w-full max-w-[56px] rounded-t-md bg-[#b11c29]" style={{ height: `${Math.max(2, (v / maxDay) * 140)}px` }} /><span className="text-[12px] text-hms-muted">{d === TODAY ? "Today" : `${Number(d.slice(8))}/${Number(d.slice(5, 7))}`}</span></li>)}</ul>
        </section>
        <Bars title="Collections" rows={byMethod} />
        <section className={clsx(card, "p-5 lg:col-span-2")} aria-label="Top dishes">
          <h3 className="text-[16px] font-bold">Top dishes</h3>
          <table className="mt-2 w-full text-[14px]"><thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="py-2 font-semibold">Dish</th><th className="py-2 text-right font-semibold">Sold</th><th className="py-2 text-right font-semibold">Sales</th></tr></thead>
            <tbody>{top.map(([n, x]) => <tr key={n} className="border-t border-hms-line/70"><td className="py-2">{n}</td><td className="py-2 text-right tabular-nums">{x.n}</td><td className="py-2 text-right tabular-nums">{tk(x.v)}</td></tr>)}</tbody></table>
          <p className="mt-2 text-[12.5px] text-hms-muted">Before service charge and VAT. Margin needs dish costs (Inventory recipes).</p>
        </section>
        <Bars title="By service type" rows={bySvc} />
      </div>
    </MealsFrame>
  );
}
function Bars({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((x) => x[1]));
  return (
    <section className={clsx(card, "p-5")} aria-label={title}>
      <h3 className="text-[16px] font-bold">{title}</h3>
      <ul className="mt-3 space-y-3">{rows.map(([l, v]) => <li key={l}><div className="flex justify-between text-[14px]"><span>{l}</span><b className="tabular-nums">{tk(v)}</b></div><div className="mt-1 h-2 rounded-full bg-[#eef0f3]"><div className="h-2 rounded-full bg-[#b11c29]" style={{ width: `${v ? Math.max(4, (v / max) * 100) : 0}%` }} /></div></li>)}</ul>
    </section>
  );
}

// =================== Settings ===================
export function SettingsPage() {
  const r = useRestaurant();
  const [toast, show] = useToast();
  if (!r.m.ready) return <MealsFrame tab="settings"><Loading /></MealsFrame>;
  return <MealsFrame tab="settings" toast={toast} outlets={r.m.outlets}><SettingsForm key={JSON.stringify(r.m.st.settings)} r={r} onDone={show} /></MealsFrame>;
}
function Toggle({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub: string }) {
  return <label className="flex items-center justify-between gap-4 py-3"><span><b className="block text-[14.5px]">{label}</b><span className="text-[13px] text-hms-muted">{sub}</span></span><input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-[#b11c29]" /></label>;
}
function SettingsForm({ r, onDone }: { r: Restaurant; onDone: (m: string) => void }) {
  const [s, setS] = useState<Settings>(r.m.st.settings);
  const dirty = JSON.stringify(s) !== JSON.stringify(r.m.st.settings);
  const bad = !(s.sc >= 0 && s.sc <= 30 && s.vat >= 0 && s.vat <= 30) || !Object.values(s.services).some(Boolean);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <section className={clsx(card, "p-5")} aria-labelledby="st-svc">
          <h2 id="st-svc" className="text-[16px] font-bold">Service types</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(SERVICE_LABEL) as Service[]).map((k) => { const Icon = SERVICE_ICON[k]; const on = s.services[k]; return <button key={k} type="button" aria-pressed={on} onClick={() => setS({ ...s, services: { ...s.services, [k]: !on } })} className={clsx("flex flex-col items-start gap-1 rounded-xl border p-3 text-left", on ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line text-hms-muted")}><Icon className="size-5" aria-hidden /><b className="text-[14px]">{SERVICE_LABEL[k]}</b><span className="text-[12.5px]">{on ? "Taking orders" : "Off"}</span></button>; })}</div>
          {!Object.values(s.services).some(Boolean) && <p className="mt-2 text-[13px] font-medium text-[#c81e1e]">Keep at least one on</p>}
        </section>
        <section className={clsx(card, "divide-y divide-hms-line px-5 py-2")} aria-label="Orders">
          <Toggle on={s.qrApproval} onChange={(v) => setS({ ...s, qrApproval: v })} label="Check QR orders before the kitchen" sub="Table and room QR orders wait in “Needs approval”." />
          <Toggle on={s.posApproval} onChange={(v) => setS({ ...s, posApproval: v })} label="Check staff POS orders too" sub="Off = POS orders go straight to the kitchen." />
          <Toggle on={s.paused} onChange={(v) => setS({ ...s, paused: v })} label="Pause new orders" sub="Guests can't order by QR. Orders already placed continue." />
        </section>
        <section className={clsx(card, "p-5")} aria-labelledby="st-ch">
          <h2 id="st-ch" className="text-[16px] font-bold">Charges and hours</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <div><label htmlFor="st-sc" className={lbl}>Service charge %</label><input id="st-sc" inputMode="numeric" value={s.sc} onChange={(e) => setS({ ...s, sc: Number(e.target.value.replace(/\D/g, "")) || 0 })} className={input} /></div>
            <div><label htmlFor="st-vat" className={lbl}>VAT %</label><input id="st-vat" inputMode="numeric" value={s.vat} onChange={(e) => setS({ ...s, vat: Number(e.target.value.replace(/\D/g, "")) || 0 })} className={input} /></div>
            <div><label htmlFor="st-op" className={lbl}>Opens</label><input id="st-op" type="time" value={s.opens} onChange={(e) => setS({ ...s, opens: e.target.value })} className={input} /></div>
            <div><label htmlFor="st-cl" className={lbl}>Closes</label><input id="st-cl" type="time" value={s.closes} onChange={(e) => setS({ ...s, closes: e.target.value })} className={input} /></div>
          </div>
          {bad && (s.sc > 30 || s.vat > 30) && <p className="mt-2 text-[13px] font-medium text-[#c81e1e]">Service charge and VAT must be 0–30%</p>}
          <p className="mt-2 text-[12.5px] text-hms-muted">VAT is on food + service charge. New orders use these; old bills keep theirs.</p>
        </section>
        <div className="flex justify-end gap-2"><button disabled={!dirty} onClick={() => location.reload()} className={btnLine}>Discard</button><button disabled={!dirty || bad} onClick={() => { r.m.saveSettings(s); onDone("Restaurant settings saved"); }} className={btnPrimary}>Save changes</button></div>
      </div>
      <aside className="space-y-3">
        <Link href="/hms/meals/cash-settings" className={clsx(card, "flex items-center gap-3 p-4 hover:bg-hms-hover")}><Wallet className="size-5 text-hms-muted" aria-hidden /><span className="flex-1"><b className="block text-[14.5px]">Cash settings</b><span className="text-[13px] text-hms-muted">Separate restaurant cashbox or the main one</span></span></Link>
        <div className={clsx(card, "p-4 text-[13px] text-hms-muted")}><b className="block text-[14px] text-hms-ink">In the live HMS</b>Printing, QR appearance, payment methods and branding are set in Meal Management → Settings and are not repeated here.</div>
      </aside>
    </div>
  );
}
