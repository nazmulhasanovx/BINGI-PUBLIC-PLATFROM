"use client";
// Communication Center (live HMS: Dashboard, Delivery Policy, Notification Events, Credits, Purchase Credits,
// History, Delivery Reports). Six tabs here; Credits and Purchase are one tab. Automatic-message rules and texts are
// edited only here (D1). Prototype: nothing is really sent; WhatsApp is not connected.
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Check, Mail, MessageSquare, Pencil, Plus, RotateCcw, Search, Send } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { dmy, timeOf } from "@/lib/bookings/store";
import { fillMsg } from "@/lib/bookings/docs";
import { useSettings, type MsgRule } from "@/lib/settings/store";
import { CH_LABEL, PACKS, PLAN_CREDITS, PROFILES, RATE, messagingCost, smsParts, type Channel, type Msg, type Policy } from "@/lib/communication/store";
import { ledger, summary, useFinance } from "@/lib/finance/store";
import { useCommData } from "./data";
import { Sheet, btnLine, btnPrimary, input, lbl } from "../guests/ui";

type Tab = "overview" | "auto" | "policy" | "credits" | "history" | "report";
const TABS: [Tab, string][] = [["overview", "Overview"], ["auto", "Automatic messages"], ["policy", "Delivery"], ["credits", "Credits"], ["history", "History"], ["report", "Delivery report"]];
const card = "rounded-2xl border border-hms-line bg-white";
const sel = "h-10 rounded-lg border border-[#858c97] bg-white px-3 text-[14px] outline-none focus:border-hms-ink focus:ring-2 focus:ring-hms-blue/30";
const tk2 = (n: number) => `৳${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
const N = new Intl.NumberFormat("en-IN");
const PLACEHOLDERS = "{guest} {code} {hotel} {room} {from} {to} {nights} {total} {paid} {checkin} {link}";

function useData() {
  const c = useCommData();
  const set = useSettings(c.h);
  const fin = useFinance(c.h);
  const available = summary(ledger(c.h, c.bk.list, messagingCost(c.comm.st), fin.st.settlements), fin.st.settlements).available;
  return { ...c, set, available };
}
type Data = ReturnType<typeof useData>;

export function CommunicationPage() {
  const d = useData();
  const sp = useSearchParams();
  const router = useRouter();
  const tab: Tab = TABS.find(([k]) => k === sp.get("tab"))?.[0] ?? "overview";
  const go = (t: Tab) => router.replace(t === "overview" ? "/hms/communication" : `/hms/communication?tab=${t}`, { scroll: false });
  const [toast, setToast] = useState("");
  const say = (m: string) => { setToast(m); setTimeout(() => setToast((x) => (x === m ? "" : x)), 2600); };
  const failed = d.comm.st.log.filter((m) => m.status === "failed").length;
  return (
    <div className="h-full overflow-y-auto"><div className="hms-page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="text-[24px] font-bold tracking-[-0.01em]">Communication Center</h1><p className="text-[14.5px] text-hms-muted">Automatic emails and SMS to guests and your team, credits and delivery.</p></div>
        <span className="rounded-full bg-hms-amber-soft px-3 py-1 text-[12.5px] font-semibold text-hms-amber">Prototype · nothing is really sent</span>
      </div>
      <div role="tablist" aria-label="Communication" className="-mx-1 mt-4 flex gap-1 overflow-x-auto border-b border-hms-line px-1">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => go(k)} className={clsx("-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-[14.5px] font-semibold", tab === k ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}>{l}{k === "history" && failed > 0 && <span className="rounded-full bg-hms-coral-soft px-2 text-[12px] text-hms-accent-ink">{failed}</span>}</button>)}
      </div>
      <div className="mt-4">
        {tab === "overview" && <Overview d={d} go={go} />}
        {tab === "auto" && <Auto d={d} say={say} />}
        {tab === "policy" && <PolicyTab d={d} say={say} />}
        {tab === "credits" && <Credits d={d} say={say} />}
        {tab === "history" && <History d={d} say={say} />}
        {tab === "report" && <Report d={d} />}
      </div>
      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-[95] -translate-x-1/2 rounded-full bg-hms-ink px-4 py-2.5 text-[14px] font-medium text-white shadow-lg"><Check className="mr-1.5 inline size-4" aria-hidden />{toast}</div>}
    </div></div>
  );
}

function Bal({ ch, d }: { ch: Channel; d: Data }) {
  const c = d.comm.credits[ch];
  const low = c.left < (ch === "sms" ? 20 : 100);
  return (
    <div className={clsx(card, "p-4")}>
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-hms-muted">{ch === "sms" ? <MessageSquare className="size-4" aria-hidden /> : <Mail className="size-4" aria-hidden />}{CH_LABEL[ch]} credits</p>
      <p className={clsx("mt-1 text-[26px] font-bold tabular-nums", low && "text-hms-red")}>{N.format(c.left)}</p>
      <p className="text-[12.5px] text-hms-muted">{N.format(c.planLeft)}/{N.format(c.plan)} from plan this month · {N.format(c.boughtLeft)} bought</p>
      <div className="mt-2 h-2 rounded-full bg-hms-hover"><div className={clsx("h-2 rounded-full", low ? "bg-hms-red" : "bg-hms-ink")} style={{ width: `${Math.min(100, (c.planLeft / c.plan) * 100)}%` }} /></div>
    </div>
  );
}

function Overview({ d, go }: { d: Data; go: (t: Tab) => void }) {
  const today = d.comm.st.log.filter((m) => m.at.startsWith(TODAY));
  const failed = d.comm.st.log.filter((m) => m.status === "failed");
  const cost = d.comm.credits.sms.costMonth + d.comm.credits.email.costMonth;
  const on = d.set.st.messages.rules.filter((r) => r.email || r.sms).length;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Bal ch="email" d={d} />
        <Bal ch="sms" d={d} />
        <div className={clsx(card, "p-4")}><p className="text-[13px] font-medium text-hms-muted">Sent today</p><p className="mt-1 text-[26px] font-bold tabular-nums">{today.length}</p><p className="text-[12.5px] text-hms-muted">Email {today.filter((m) => m.channel === "email").length} · SMS {today.filter((m) => m.channel === "sms").length}</p></div>
        <div className={clsx(card, "p-4")}><p className="text-[13px] font-medium text-hms-muted">Cost this month</p><p className="mt-1 text-[26px] font-bold tabular-nums">{tk2(cost)}</p><p className="text-[12.5px] text-hms-muted">Taken from your <Link href="/hms/finance" className="underline underline-offset-2">BinGi balance</Link></p></div>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <button onClick={() => go("auto")} className={clsx(card, "p-4 text-left hover:bg-[#f8f9fb]")}><b className="block text-[15px]">{on} automatic messages on</b><span className="text-[13.5px] text-hms-muted">Booking, stay, payment and team alerts.</span></button>
        <button onClick={() => go("history")} className={clsx(card, "p-4 text-left hover:bg-[#f8f9fb]", failed.length && "border-hms-red/40")}><b className={clsx("flex items-center gap-1.5 text-[15px]", failed.length && "text-hms-red")}>{failed.length > 0 && <AlertTriangle className="size-4" aria-hidden />}{failed.length} failed</b><span className="text-[13.5px] text-hms-muted">{failed.length ? "Check the number or email and send again." : "Every message was delivered."}</span></button>
        <button onClick={() => go("credits")} className={clsx(card, "p-4 text-left hover:bg-[#f8f9fb]")}><b className="block text-[15px]">Buy credits</b><span className="text-[13.5px] text-hms-muted">For when the plan’s monthly credits run out.</span></button>
      </div>
    </>
  );
}

function Auto({ d, say }: { d: Data; say: (m: string) => void }) {
  const rules = d.set.st.messages.rules;
  const groups = [...new Set(rules.map((r) => r.group ?? "Other"))];
  const [edit, setEdit] = useState<MsgRule | null>(null);
  const toggle = (r: MsgRule, k: "email" | "sms", v: boolean) => { d.set.save((s) => { s.messages.rules = s.messages.rules.map((x) => (x.id === r.id ? { ...x, [k]: v } : x)); }, `${r.label}: ${k} ${v ? "on" : "off"}`); say(`${r.label} · ${CH_LABEL[k]} ${v ? "on" : "off"}`); };
  return (
    <>
      <p className="text-[14px] text-hms-muted">Turn each message on for email, SMS or both. Delivery order (email first, SMS fallback) is set in <b>Delivery</b>.</p>
      {groups.map((g) => (
        <section key={g} className={clsx(card, "mt-3")}>
          <h2 className="px-4 pt-3.5 text-[15px] font-bold">{g}</h2>
          <div className="hidden grid-cols-[1fr_70px_70px_90px_44px] gap-2 px-4 pt-2 text-[12.5px] font-semibold text-hms-muted sm:grid"><span>Message</span><span className="text-center">Email</span><span className="text-center">SMS</span><span className="text-center">WhatsApp</span><span /></div>
          <ul className="divide-y divide-hms-line">{rules.filter((r) => (r.group ?? "Other") === g).map((r) => (
            <li key={r.id} className="grid grid-cols-[1fr_auto] items-center gap-2 px-4 py-3 sm:grid-cols-[1fr_70px_70px_90px_44px]">
              <span className="min-w-0"><b className="block text-[14.5px]">{r.label} <span className="font-normal text-hms-muted">· to {r.to.toLowerCase()}</span></b><span className="text-[13px] text-hms-muted">{r.when}</span></span>
              <div className="col-span-2 flex items-center gap-4 sm:contents">
                {(["email", "sms"] as const).map((k) => <label key={k} className="flex items-center gap-2 sm:justify-center"><input type="checkbox" checked={r[k]} onChange={(e) => toggle(r, k, e.target.checked)} className="size-5 accent-[#b11c29]" aria-label={`${r.label} by ${CH_LABEL[k]}`} /><span className="text-[13px] sm:hidden">{CH_LABEL[k]}</span></label>)}
                <span className="text-[12.5px] text-hms-muted sm:text-center">Not connected</span>
                <button onClick={() => setEdit(r)} aria-label={`Edit text for ${r.label}`} className="ml-auto grid size-9 place-items-center rounded-lg hover:bg-hms-hover sm:ml-0"><Pencil className="size-4" aria-hidden /></button>
              </div>
            </li>
          ))}</ul>
        </section>
      ))}
      {edit && <TextSheet d={d} r={edit} onClose={() => setEdit(null)} saved={() => { say("Message text saved"); setEdit(null); }} />}
    </>
  );
}

/** Confirmation and pre-arrival texts live in Bookings settings (used by the booking page); the rest in Communication. */
function TextSheet({ d, r, onClose, saved }: { d: Data; r: MsgRule; onClose: () => void; saved: () => void }) {
  const bkKey = r.id === "confirm" ? "confirmMsg" : r.id === "prearrival" ? "preArrivalMsg" : null;
  const start = bkKey ? d.bk.settings[bkKey] : d.comm.templates[r.id] ?? "";
  const [t, setT] = useState(start);
  const sample = d.bk.list.find((b) => b.status === "Confirmed") ?? d.bk.list[0];
  const preview = sample ? fillMsg(t, d.h, sample, d.gmap.get(sample.guestId), d.bk.settings) : t;
  const parts = smsParts(preview);
  const save = () => { if (bkKey) d.bk.saveSettings({ ...d.bk.settings, [bkKey]: t.trim() }); else d.comm.saveTemplate(r.id, t.trim()); saved(); };
  return (
    <Sheet title={r.label} sub={r.when} onClose={onClose} wide footer={<><button onClick={onClose} className={btnLine}>Cancel</button><button disabled={!t.trim() || t === start} onClick={save} className={clsx(btnPrimary, "flex-1")}>Save text</button></>}>
      <label htmlFor="tpl" className={lbl}>Message</label>
      <textarea id="tpl" rows={5} value={t} onChange={(e) => setT(e.target.value)} className={clsx(input, "h-auto py-2")} />
      <p className="mt-1.5 text-[12.5px] text-hms-muted">Fills in by itself: {PLACEHOLDERS}</p>
      <h3 className="mt-4 text-[14px] font-bold">Preview{sample ? ` · ${sample.code}` : ""}</h3>
      <p className="mt-1 whitespace-pre-wrap rounded-xl bg-hms-canvas p-3 text-[14px]">{preview}</p>
      <p className={clsx("mt-1.5 text-[12.5px]", parts > 2 ? "font-semibold text-hms-amber" : "text-hms-muted")}>As SMS: {preview.length} characters · {parts} part{parts === 1 ? "" : "s"} ({tk2(parts * RATE.sms)} each send){parts > 2 ? " — shorten it to save credits" : ""}</p>
    </Sheet>
  );
}

function PolicyTab({ d, say }: { d: Data; say: (m: string) => void }) {
  const [p, setP] = useState<Policy>(d.comm.policy);
  const dirty = JSON.stringify(p) !== JSON.stringify(d.comm.policy);
  const bad = p.delay < 0 || p.delay > 120 || p.retries < 0 || p.retries > 5 || p.sender.length > 11 || (!!p.sender && !/^[A-Za-z0-9 ]+$/.test(p.sender));
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
      <section className={clsx(card, "p-4")}>
        <h2 className="text-[15px] font-bold">Delivery profile</h2>
        <div role="radiogroup" aria-label="Delivery profile" className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(PROFILES) as Policy["profile"][]).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={p.profile === k} onClick={() => setP({ ...p, ...PROFILES[k][2], profile: k })} className={clsx("rounded-xl border p-3 text-left", p.profile === k ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line hover:bg-hms-hover")}>
              <b className="block text-[14.5px]">{PROFILES[k][0]}</b><span className="text-[13px] text-hms-muted">{PROFILES[k][1]}</span>
            </button>
          ))}
        </div>
        <ul className="mt-4 divide-y divide-hms-line">
          {([["emailFirst", "Try email first", "SMS waits for the email attempt."], ["smsFallback", "SMS when email fails", "Or when the guest has no email."], ["smsConsent", "Only SMS guests who agreed", "Uses the guest’s marketing / SMS consent."]] as const).map(([k, t, s]) => (
            <li key={k} className="flex items-center gap-3 py-3"><span className="flex-1"><b className="block text-[14.5px]">{t}</b><span className="text-[13px] text-hms-muted">{s}</span></span><input type="checkbox" aria-label={t} checked={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.checked })} className="size-5 accent-[#b11c29]" /></li>
          ))}
        </ul>
      </section>
      <section className={clsx(card, "h-fit p-4")}>
        <label htmlFor="pd" className={lbl}>Wait before SMS (minutes)</label><input id="pd" inputMode="numeric" value={p.delay} onChange={(e) => setP({ ...p, delay: Number(e.target.value.replace(/\D/g, "") || 0) })} className={input} />
        <label htmlFor="pr" className={clsx(lbl, "mt-3")}>Retries</label><input id="pr" inputMode="numeric" value={p.retries} onChange={(e) => setP({ ...p, retries: Number(e.target.value.replace(/\D/g, "") || 0) })} className={input} />
        <label htmlFor="ps" className={clsx(lbl, "mt-3")}>SMS sender name (optional)</label><input id="ps" value={p.sender} onChange={(e) => setP({ ...p, sender: e.target.value })} placeholder={d.h.name.slice(0, 11)} className={input} />
        <p className="mt-1 text-[12.5px] text-hms-muted">Up to 11 letters or numbers. Needs approval from the SMS provider.</p>
        {bad && <p role="alert" className="mt-2 text-[13.5px] font-semibold text-hms-red">Wait 0–120 minutes, 0–5 retries, sender up to 11 letters or numbers.</p>}
        <button disabled={!dirty || bad} onClick={() => { d.comm.savePolicy(p); say("Delivery policy saved"); }} className={clsx(btnPrimary, "mt-4 w-full")}>Save policy</button>
      </section>
    </div>
  );
}

function Credits({ d, say }: { d: Data; say: (m: string) => void }) {
  const [buy, setBuy] = useState<{ ch: Channel; qty: number; price: number } | null>(null);
  const [err, setErr] = useState("");
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2"><Bal ch="email" d={d} /><Bal ch="sms" d={d} /></div>
      <p className="mt-3 text-[13.5px] text-hms-muted">Your plan gives {N.format(PLAN_CREDITS.email)} email and {N.format(PLAN_CREDITS.sms)} SMS credits every month. Each message costs {tk2(RATE.email)} (email) or {tk2(RATE.sms)} per SMS part. Demo prices — BinGi sets the real ones.</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {(["sms", "email"] as Channel[]).map((ch) => (
          <section key={ch} className={clsx(card, "p-4")}>
            <h2 className="text-[15px] font-bold">Buy {CH_LABEL[ch]} credits</h2>
            <ul className="mt-2 divide-y divide-hms-line">{PACKS[ch].map((p) => <li key={p.qty} className="flex items-center gap-3 py-2.5"><span className="flex-1 text-[14.5px]"><b>{N.format(p.qty)}</b> {CH_LABEL[ch]}</span><span className="tabular-nums">{tk2(p.price)}</span><button onClick={() => { setErr(""); setBuy({ ch, ...p }); }} className={clsx(btnLine, "h-9")}>Buy</button></li>)}</ul>
          </section>
        ))}
      </div>
      <section className={clsx(card, "mt-3")}>
        <h2 className="px-4 pt-3.5 text-[15px] font-bold">Bought</h2>
        {d.comm.st.purchases.length === 0 ? <p className="px-4 py-5 text-[14px] text-hms-muted">Nothing bought yet — the plan’s monthly credits are used first.</p> : <ul className="divide-y divide-hms-line">{d.comm.st.purchases.map((p) => <li key={p.id} className="flex justify-between px-4 py-2.5 text-[14px]"><span>{p.id} · {dmy(p.at.slice(0, 10))} · {N.format(p.qty)} {CH_LABEL[p.channel]}</span><b className="tabular-nums">{tk2(p.price)}</b></li>)}</ul>}
      </section>
      {buy && <Sheet title={`Buy ${N.format(buy.qty)} ${CH_LABEL[buy.ch]} credits`} onClose={() => setBuy(null)} footer={<><button onClick={() => setBuy(null)} className={btnLine}>Cancel</button><button onClick={() => { if (buy.price > d.available) return setErr(`Your BinGi balance is ${tk2(d.available)} — not enough`); d.comm.buy(buy.ch, buy.qty, buy.price); say(`${N.format(buy.qty)} ${CH_LABEL[buy.ch]} credits added`); setBuy(null); }} className={clsx(btnPrimary, "flex-1")}>Pay {tk2(buy.price)}</button></>}>
        <p className="text-[14.5px]">Paid from your BinGi balance ({tk2(d.available)} available). It shows in <Link href="/hms/finance?tab=ledger" className="font-semibold text-hms-red underline underline-offset-2">Finance</Link> as SMS &amp; email.</p>
        {err && <p role="alert" className="mt-3 text-[14px] font-semibold text-hms-red">{err}</p>}
      </Sheet>}
    </>
  );
}

function History({ d, say }: { d: Data; say: (m: string) => void }) {
  const [q, setQ] = useState("");
  const [ch, setCh] = useState<"" | Channel>("");
  const [st, setSt] = useState<"" | Msg["status"]>("");
  const [open, setOpen] = useState<Msg | null>(null);
  const [compose, setCompose] = useState(false);
  const s = q.trim().toLowerCase();
  const rows = d.comm.st.log.filter((m) => (!ch || m.channel === ch) && (!st || m.status === st) && (!s || [m.guest, m.to, m.booking ?? "", m.event].some((x) => x.toLowerCase().includes(s))));
  const TONE = { delivered: "bg-hms-green-soft text-hms-green", sent: "bg-hms-blue-soft text-hms-blue", failed: "bg-hms-coral-soft text-hms-accent-ink" } as const;
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <label className="relative min-w-[200px] flex-1"><span className="sr-only">Search messages</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-hms-muted" aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Guest, phone, email, booking" className={clsx(input, "h-10 pl-9")} /></label>
        <select aria-label="Channel" value={ch} onChange={(e) => setCh(e.target.value as Channel)} className={sel}><option value="">Email & SMS</option><option value="email">Email</option><option value="sms">SMS</option></select>
        <select aria-label="Status" value={st} onChange={(e) => setSt(e.target.value as Msg["status"])} className={sel}><option value="">All statuses</option><option value="delivered">Delivered</option><option value="sent">Sent</option><option value="failed">Failed</option></select>
        <button onClick={() => setCompose(true)} className={clsx(btnPrimary, "h-10")}><Plus className="size-4" aria-hidden />New message</button>
      </div>
      {rows.length === 0 ? <div className={clsx(card, "mt-3 p-8 text-center text-[15px] font-semibold")}>No messages match.</div> : (
        <ul className={clsx(card, "mt-3 divide-y divide-hms-line")}>{rows.slice(0, 200).map((m) => (
          <li key={m.id}><button onClick={() => setOpen(m)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f8f9fb]">
            {m.channel === "sms" ? <MessageSquare className="size-4 shrink-0 text-hms-muted" aria-label="SMS" /> : <Mail className="size-4 shrink-0 text-hms-muted" aria-label="Email" />}
            <span className="min-w-0 flex-1"><b className="block truncate text-[14.5px]">{m.guest} <span className="font-normal text-hms-muted">· {m.event}</span></b><span className="block truncate text-[13px] text-hms-muted">{m.to}{m.booking ? ` · ${m.booking}` : ""} · {dmy(m.at.slice(0, 10))} {timeOf(m.at)}</span></span>
            <span className={clsx("rounded-md px-2 py-0.5 text-[12.5px] font-semibold capitalize", TONE[m.status])}>{m.status}</span>
          </button></li>
        ))}</ul>
      )}
      {open && <Sheet title={`${CH_LABEL[open.channel]} to ${open.guest}`} sub={`${open.id} · ${open.event}`} onClose={() => setOpen(null)} footer={open.status === "failed" ? <button onClick={() => { const e = d.comm.retry(open.id); if (e) return say(e); say("Sent again"); setOpen(null); }} className={clsx(btnPrimary, "flex-1")}><RotateCcw className="size-4" aria-hidden />Send again</button> : <button onClick={() => setOpen(null)} className={clsx(btnLine, "flex-1")}>Close</button>}>
        <dl className="divide-y divide-hms-line text-[14.5px]">{([["To", open.to], ["Booking", open.booking ?? "—"], ["When", `${dmy(open.at.slice(0, 10))} · ${timeOf(open.at)}`], ["Status", open.status], ["Parts", String(open.parts)], ...(open.error ? [["Problem", open.error]] : [])] as [string, string][]).map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-hms-muted">{k}</dt><dd className="text-right font-medium capitalize">{v}</dd></div>)}</dl>
        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-hms-canvas p-3 text-[14px]">{open.text}</p>
        {open.booking && <Link href={`/hms/bookings/view?b=${open.booking}`} className="mt-3 inline-block text-[13.5px] font-semibold text-hms-red underline underline-offset-2">Open booking</Link>}
      </Sheet>}
      {compose && <Compose d={d} onClose={() => setCompose(false)} sent={() => { say("Message sent"); setCompose(false); }} />}
    </>
  );
}

function Compose({ d, onClose, sent }: { d: Data; onClose: () => void; sent: () => void }) {
  const open = d.bk.list.filter((b) => b.status === "Confirmed" || b.status === "Checked in");
  const [code, setCode] = useState(open[0]?.code ?? "");
  const [ch, setCh] = useState<Channel>("sms");
  const [t, setT] = useState("");
  const [err, setErr] = useState("");
  const b = d.bk.list.find((x) => x.code === code);
  const g = b ? d.gmap.get(b.guestId) : undefined;
  const to = ch === "sms" ? g?.phone ?? "" : g?.email ?? "";
  const text = b ? fillMsg(t, d.h, b, g, d.bk.settings) : t;
  const go = () => { setErr(""); if (!b) return setErr("Pick a booking"); if (!text.trim()) return setErr("Write a message"); if (!to) return setErr(`This guest has no ${ch === "sms" ? "phone number" : "email"}`); const e = d.comm.send({ channel: ch, to, guest: g?.name ?? "Guest", booking: b.code, event: "Sent by staff", text }); if (e) return setErr(e); sent(); };
  return (
    <Sheet title="New message" onClose={onClose} footer={<button onClick={go} className={clsx(btnPrimary, "flex-1")}><Send className="size-4" aria-hidden />Send {CH_LABEL[ch]}</button>}>
      <label htmlFor="cm-b" className={lbl}>Booking</label>
      <select id="cm-b" value={code} onChange={(e) => setCode(e.target.value)} className={input}>{open.map((x) => <option key={x.code} value={x.code}>{x.code} · {d.gmap.get(x.guestId)?.name ?? "Guest"}</option>)}</select>
      <p className={clsx(lbl, "mt-3")} id="cm-ch">Send by</p>
      <div role="radiogroup" aria-labelledby="cm-ch" className="grid grid-cols-2 gap-2">{(["sms", "email"] as Channel[]).map((k) => <button key={k} type="button" role="radio" aria-checked={ch === k} onClick={() => setCh(k)} className={clsx("h-11 rounded-lg border text-[14px] font-semibold", ch === k ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line")}>{CH_LABEL[k]} · {d.comm.credits[k].left} left</button>)}</div>
      <p className="mt-1.5 text-[13px] text-hms-muted">To: {to || "—"}</p>
      <label htmlFor="cm-t" className={clsx(lbl, "mt-3")}>Message</label>
      <textarea id="cm-t" rows={4} value={t} onChange={(e) => setT(e.target.value)} className={clsx(input, "h-auto py-2")} placeholder="Dear {guest}, …" />
      {ch === "sms" && t && <p className="mt-1 text-[12.5px] text-hms-muted">{text.length} characters · {smsParts(text)} part{smsParts(text) === 1 ? "" : "s"}</p>}
      {err && <p role="alert" className="mt-3 text-[14px] font-semibold text-hms-red">{err}</p>}
    </Sheet>
  );
}

function Report({ d }: { d: Data }) {
  const days = useMemo(() => [...new Set(d.comm.st.log.map((m) => m.at.slice(0, 10)))].sort().reverse().slice(0, 30), [d.comm.st.log]);
  const row = (day: string, ch: Channel) => { const xs = d.comm.st.log.filter((m) => m.at.startsWith(day) && m.channel === ch); return { n: xs.length, ok: xs.filter((m) => m.status !== "failed").length, f: xs.filter((m) => m.status === "failed").length }; };
  const all = d.comm.st.log, ok = all.filter((m) => m.status !== "failed").length;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={clsx(card, "p-4")}><p className="text-[13px] text-hms-muted">Messages</p><p className="mt-1 text-[22px] font-bold">{N.format(all.length)}</p></div>
        <div className={clsx(card, "p-4")}><p className="text-[13px] text-hms-muted">Delivered</p><p className="mt-1 text-[22px] font-bold">{all.length ? Math.round((ok / all.length) * 100) : 0}%</p></div>
        <div className={clsx(card, "p-4")}><p className="text-[13px] text-hms-muted">Failed</p><p className="mt-1 text-[22px] font-bold">{all.length - ok}</p></div>
        <div className={clsx(card, "p-4")}><p className="text-[13px] text-hms-muted">Cost this month</p><p className="mt-1 text-[22px] font-bold">{tk2(d.comm.credits.sms.costMonth + d.comm.credits.email.costMonth)}</p></div>
      </div>
      <section tabIndex={0} aria-label="Delivery by day" className={clsx(card, "mt-3 overflow-x-auto")}>
        <table className="w-full min-w-[520px] text-[14px]">
          <thead><tr className="border-b border-hms-line text-left text-[12.5px] text-hms-muted"><th className="px-4 py-2.5">Day</th><th className="px-3 text-right">Email sent</th><th className="px-3 text-right">Email failed</th><th className="px-3 text-right">SMS sent</th><th className="px-4 text-right">SMS failed</th></tr></thead>
          <tbody className="divide-y divide-hms-line">{days.map((day) => { const e = row(day, "email"), s = row(day, "sms"); return <tr key={day}><td className="px-4 py-2">{dmy(day)}</td><td className="px-3 text-right tabular-nums">{e.ok}</td><td className={clsx("px-3 text-right tabular-nums", e.f && "text-hms-red")}>{e.f}</td><td className="px-3 text-right tabular-nums">{s.ok}</td><td className={clsx("px-4 text-right tabular-nums", s.f && "text-hms-red")}>{s.f}</td></tr>; })}</tbody>
        </table>
        {days.length === 0 && <p className="p-6 text-center text-[14px] text-hms-muted">No messages yet.</p>}
      </section>
    </>
  );
}
