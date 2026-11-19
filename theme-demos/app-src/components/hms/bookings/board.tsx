"use client";
import Link from "next/link";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, LogIn, LogOut, Minus, Plus, UserRound, Users, Wrench } from "lucide-react";
import { TODAY, oooOn, taxOf, type Unit } from "@/lib/rooms/store";
import { addDays } from "@/lib/bookings/demo";
import { bill, dm, dueOf, holds, overlaps, paidOf, tk, totalOf, useBookings, type Booking, type PayMethod } from "@/lib/bookings/store";
import { phoneKey, useGuests } from "@/lib/guests/store";
import { useRates } from "@/lib/rates/store";
import { postCash } from "@/lib/cashbox/store";
import { useProperty } from "../property";
import { useCashboxData } from "../cashbox/pages";
import { useHousekeeping } from "@/lib/housekeeping/store";
import { input, lbl } from "../guests/ui";
import { BookingsFrame, ChannelBadge, PayPill, StatusPill, Toast, bMain, bSoft, card, useBk } from "./ui";

// ---------------- Room board: every room at a glance ----------------
export function BoardPage() { return <BookingsFrame tab="board"><Board /></BookingsFrame>; }

type RState = "free" | "arriving" | "inhouse" | "leaving" | "ooo";
const RS: Record<RState, [string, string]> = {
  free: ["Free", "border-[#cfe9da] bg-white"],
  arriving: ["Arriving", "border-[#bcd0f7] bg-[#f3f7ff]"],
  inhouse: ["In house", "border-[#a7dcbc] bg-[#effaf3]"],
  leaving: ["Leaving", "border-[#f5c9ad] bg-[#fff6f0]"],
  ooo: ["Out of order", "border-[#ecd29a] bg-[#fffaf0]"],
};
const DOT: Record<RState, string> = { free: "bg-[#22a35a]", arriving: "bg-[#2563eb]", inhouse: "bg-[#16693a]", leaving: "bg-[#ea580c]", ooo: "bg-[#d4a017]" };

function Board() {
  const { bk, guests, open } = useBk();
  const hk = useHousekeeping(useProperty());
  const router = useRouter();
  const [f, setF] = useState<RState | "all">("all");
  const stateOf = (u: Unit): { s: RState; b?: Booking } => {
    if (oooOn(u, TODAY, addDays(TODAY, 1))) return { s: "ooo" };
    const here = bk.list.filter((b) => b.unit === u.code && holds(b));
    const ins = here.find((b) => b.status === "Checked in");
    if (ins) return { s: ins.to <= TODAY ? "leaving" : "inhouse", b: ins };
    const arr = here.find((b) => b.status === "Confirmed" && b.from <= TODAY && overlaps(b, TODAY, addDays(TODAY, 1)));
    if (arr) return { s: "arriving", b: arr };
    return { s: "free" };
  };
  const groups = useMemo(() => {
    const m = new Map<string, Unit[]>();
    for (const u of bk.units) m.set(u.category, [...(m.get(u.category) ?? []), u]);
    return [...m.entries()].map(([c, us]) => ({ id: c, name: bk.cats.get(c)?.name ?? "Rooms", units: us.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })) }));
  }, [bk.units, bk.cats]);
  const all = bk.units.map(stateOf);
  const count = (s: RState) => all.filter((x) => x.s === s).length;
  const next = (u: Unit) => bk.list.filter((b) => b.unit === u.code && b.status === "Confirmed" && b.from > TODAY).sort((a, b) => a.from.localeCompare(b.from))[0];
  return (
    <>
      <div role="radiogroup" aria-label="Show rooms" className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {(["all", "free", "arriving", "inhouse", "leaving", "ooo"] as const).map((k) => (
          <button key={k} role="radio" aria-checked={f === k} onClick={() => setF(k)} className={clsx("inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-[14px] font-semibold transition-colors", f === k ? "bg-hms-ink text-white" : "bg-white ring-1 ring-hms-line hover:ring-hms-ink")}>
            {k !== "all" && <span className={clsx("size-2 rounded-full", DOT[k])} />}{k === "all" ? "All rooms" : RS[k][0]}<span className="tabular-nums opacity-70">{k === "all" ? bk.units.length : count(k)}</span>
          </button>
        ))}
      </div>
      {groups.map((g) => {
        const us = g.units.filter((u) => f === "all" || stateOf(u).s === f);
        if (!us.length) return null;
        return (
          <section key={g.id} aria-label={g.name} className="mt-5">
            <h2 className="mb-2 text-[14.5px] font-bold">{g.name} <span className="font-normal text-hms-muted">· {us.length}</span></h2>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
              {us.map((u) => {
                const { s, b } = stateOf(u);
                const nb = s === "free" ? next(u) : undefined;
                const due = b ? dueOf(b) : 0;
                return (
                  <li key={u.code}>
                    <button onClick={() => (b ? open(b.code) : s === "free" ? router.push(`/hms/bookings/walkin?room=${u.code}`) : undefined)} disabled={s === "ooo"}
                      aria-label={`Room ${u.code}, ${RS[s][0]}${b ? `, ${guests.get(b.guestId)?.name ?? "Guest"}` : ""}`}
                      className={clsx("flex h-[112px] w-full flex-col rounded-2xl border p-3 text-left transition hover:shadow-[0_2px_10px_rgb(0_0_0/0.06)] disabled:hover:shadow-none", RS[s][1])}>
                      <span className="flex w-full items-center gap-2"><b className="text-[18px] tabular-nums">{u.code}</b><span className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3a414c]"><span className={clsx("size-2 rounded-full", DOT[s])} />{RS[s][0]}</span></span>
                      {b ? <>
                        <span className="mt-1 truncate text-[14px] font-semibold">{guests.get(b.guestId)?.name ?? "Guest"}</span>
                        <span className="text-[12.5px] text-hms-muted">{s === "arriving" ? (hk.isReady(u.code) ? `${b.nights.length} night${b.nights.length > 1 ? "s" : ""} · room ready` : <b className="text-[#b42318]">Room {hk.stateOf(u.code).toLowerCase()}</b>) : `Until ${dm(b.to)}`}</span>
                        <span className="mt-auto text-[12.5px] font-semibold">{due > 0 ? <span className="text-[#b42318]">{tk(due)} due</span> : <span className="text-[#16693a]">Paid</span>}</span>
                      </> : s === "ooo" ? <span className="mt-1 flex items-center gap-1.5 text-[13px] text-[#8a4b00]"><Wrench className="size-3.5" />{u.ooo?.reason}</span>
                        : <><span className={clsx("mt-1 text-[13px] font-semibold", hk.isReady(u.code) ? "text-[#16693a]" : "text-[#b42318]")}>{hk.isReady(u.code) ? "Ready to sell" : `${hk.stateOf(u.code)} — needs cleaning`}</span><span className="mt-auto text-[12.5px] text-hms-muted">{nb ? `Next: ${dm(nb.from)}` : "No upcoming booking"}</span></>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="mt-4 text-[12.5px] text-hms-muted">Tap a free room to check in a walk-in. Cleaning status comes from <Link href="/hms/housekeeping" className="font-semibold text-hms-red">Housekeeping</Link>.</p>
    </>
  );
}

// ---------------- Quick walk-in: one screen, then the check-in panel ----------------
export function WalkInPage() {
  const h = useProperty();
  const sp = useSearchParams();
  const router = useRouter();
  const bk = useBookings(h);
  const g = useGuests(h);
  const rates = useRates(h);
  const cbx = useCashboxData();
  const [room, setRoom] = useState(sp.get("room") ?? "");
  const [nights, setNights] = useState(1);
  const [adults, setAdults] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [adv, setAdv] = useState("");
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [err, setErr] = useState("");
  const to = addDays(TODAY, nights);
  const free = bk.freeUnits(TODAY, to);
  const u = free.find((x) => x.code === room);
  const cat = u ? bk.cats.get(u.category) : undefined;
  const nightsArr = u ? Array.from({ length: nights }, (_, i) => { const d = addDays(TODAY, i); const p = rates.unitPrice(u, d); return { date: d, base: rates.deal(u.category, d, p.price, u.id)?.price ?? p.price }; }) : [];
  const total = cat ? bill({ nights: nightsArr, tax: taxOf(cat), discount: 0 }).total : 0;
  const found = phoneKey(phone).length >= 8 ? g.findByPhone(phone) : undefined;
  const groups = new Map<string, Unit[]>(); for (const x of free) groups.set(x.category, [...(groups.get(x.category) ?? []), x]);
  const go = () => {
    setErr("");
    if (!u || !cat) return setErr("Pick a free room");
    if (phoneKey(phone).length < 8) return setErr("Enter the guest's phone number");
    if (!found && name.trim().length < 2) return setErr("Enter the guest's name");
    if (adults > cat.maxAdults) return setErr(`${cat.name} takes up to ${cat.maxAdults} adults`);
    const a = Math.min(Number(adv) || 0, total);
    if (found?.blocked) return setErr(`${found.name} is blocked — check Guests first`);
    let gid = found?.id;
    if (!gid) { gid = g.nextId(); g.saveGuest({ id: gid, name: name.trim(), phone: phone.trim(), email: "", country: "Bangladesh", address: "", idType: "NID", idNo: "", prefs: [], vip: false, verified: false, notes: "", marketing: false, created: TODAY }); }
    const r = bk.create([{ guestId: gid, unit: u.code, categoryId: u.category, type: cat.name, from: TODAY, to, adults, children: 0, channel: "Walk-in", nights: nightsArr, tax: taxOf(cat), discount: 0, note: "", advance: a > 0 ? { amount: a, method } : undefined }]);
    if (!r.ok) return setErr(r.error);
    if (a > 0 && method === "Cash") postCash(h, cbx.refs, "front-desk", { amount: a, source: "booking", ref: r.codes[0], party: found?.name ?? name.trim() });
    router.push(`/hms/bookings/view?b=${r.codes[0]}&do=checkin&made=${encodeURIComponent(`${r.codes[0]} booked — add the ID to check in`)}`);
  };
  return (
    <div className="h-full overflow-y-auto"><div className="hms-page max-w-[860px]">
      <Link href="/hms/bookings" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-hms-muted hover:text-hms-ink"><ArrowLeft className="size-4" />Bookings</Link>
      <h1 className="mt-2 text-[24px] font-bold">Walk-in</h1>
      <p className="text-[14px] text-hms-muted">Guest at the desk now. Pick a room, add name and phone — ID comes on the next screen.</p>
      <section className={clsx(card, "mt-4 p-4 sm:p-5")}>
        <div className="flex flex-wrap gap-6">
          <Step label="Nights" v={nights} set={setNights} min={1} max={30} />
          <Step label="Adults" v={adults} set={setAdults} min={1} max={8} />
          <p className="self-end pb-2 text-[14px] text-[#4d5664]">Today {dm(TODAY)} → {dm(to)}</p>
        </div>
        <h2 className="mt-5 text-[14.5px] font-bold">Free room <span className="font-normal text-hms-muted">· {free.length} free for {nights} night{nights > 1 ? "s" : ""}</span></h2>
        {free.length === 0 ? <p className="mt-2 rounded-xl bg-[#fdecec] px-4 py-3 text-[14px] text-[#b42318]">No room is free for these nights.</p> : [...groups.entries()].map(([c, us]) => (
          <div key={c} className="mt-3">
            <p className="mb-1.5 text-[13px] font-semibold">{bk.cats.get(c)?.name}</p>
            <div role="radiogroup" aria-label={bk.cats.get(c)?.name} className="flex flex-wrap gap-1.5">
              {us.map((x) => <button key={x.code} role="radio" aria-checked={room === x.code} onClick={() => setRoom(x.code)} className={clsx("h-11 min-w-16 rounded-lg px-3 text-[15px] font-semibold transition-colors", room === x.code ? "bg-hms-red text-white" : "bg-white ring-1 ring-hms-line hover:ring-hms-ink")}>{x.code}</button>)}
            </div>
          </div>
        ))}
      </section>
      <section className={clsx(card, "mt-4 grid gap-4 p-4 sm:grid-cols-2 sm:p-5")}>
        <div><label htmlFor="wi-ph" className={lbl}>Phone</label><input id="wi-ph" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXX-XXXXXX" className={input} />
          {found && <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#16693a]"><UserRound className="size-4" />Saved guest: {found.name}</p>}</div>
        {!found && <div><label htmlFor="wi-nm" className={lbl}>Full name</label><input id="wi-nm" value={name} onChange={(e) => setName(e.target.value)} className={input} /></div>}
        <div><label htmlFor="wi-ad" className={lbl}>Take now (optional)</label><input id="wi-ad" inputMode="numeric" value={adv} onChange={(e) => setAdv(e.target.value.replace(/\D/g, ""))} placeholder="৳ 0" className={input} /></div>
        <div><span className={lbl}>Method</span><div role="radiogroup" aria-label="Payment method" className="flex gap-1.5">{(["Cash", "bKash", "Card", "Bank"] as PayMethod[]).map((m) => <button key={m} role="radio" aria-checked={method === m} onClick={() => setMethod(m)} className={clsx("h-11 flex-1 rounded-lg text-[14px] font-semibold", method === m ? "bg-hms-ink text-white" : "bg-[#eef0f3]")}>{m}</button>)}</div></div>
      </section>
      <div className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-hms-line bg-white/95 p-3 backdrop-blur">
        <div className="min-w-0 flex-1"><p className="text-[13px] text-hms-muted">{u ? `Room ${u.code} · ${cat?.name}` : "Pick a room"}</p><p className="text-[19px] font-bold tabular-nums">{tk(total)} <span className="text-[12.5px] font-normal text-hms-muted">incl. VAT</span></p></div>
        {err && <p role="alert" className="w-full rounded-lg bg-[#fdecec] px-3 py-2 text-[13.5px] font-medium text-[#b42318] sm:order-first">{err}</p>}
        <button onClick={go} className={bMain}><LogIn className="size-4" />Book &amp; check in</button>
      </div>
    </div></div>
  );
}
function Step({ label, v, set, min, max }: { label: string; v: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <div><span className={lbl}>{label}</span>
      <div className="flex items-center gap-1" role="group" aria-label={label}>
        <button onClick={() => set(Math.max(min, v - 1))} aria-label={`Fewer ${label.toLowerCase()}`} className="grid size-11 place-items-center rounded-lg bg-[#eef0f3]"><Minus className="size-4" /></button>
        <span className="w-10 text-center text-[17px] font-bold tabular-nums">{v}</span>
        <button onClick={() => set(Math.min(max, v + 1))} aria-label={`More ${label.toLowerCase()}`} className="grid size-11 place-items-center rounded-lg bg-[#eef0f3]"><Plus className="size-4" /></button>
      </div>
    </div>
  );
}

// ---------------- Group booking: all rooms of one group together ----------------
export function GroupPage() {
  const h = useProperty();
  const sp = useSearchParams();
  const router = useRouter();
  const bk = useBookings(h);
  const g = useGuests(h);
  const cbx = useCashboxData();
  const gid = sp.get("g") ?? "";
  const rows = bk.list.filter((b) => b.group === gid).sort((a, b) => a.unit.localeCompare(b.unit, undefined, { numeric: true }));
  const [amt, setAmt] = useState("");
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [toast, setToast] = useState("");
  const [err, setErr] = useState("");
  const name = (id: string) => g.rows.find((r) => r.id === id)?.name ?? "Guest";
  const total = rows.reduce((s, b) => s + totalOf(b), 0), paid = rows.reduce((s, b) => s + paidOf(b), 0), due = rows.reduce((s, b) => s + dueOf(b), 0);
  const lead = rows[0];
  const payAll = () => {
    setErr("");
    let left = Math.min(Number(amt) || 0, due);
    if (left <= 0) return setErr("Enter an amount");
    if (method === "Cash") { const e = postCash(h, cbx.refs, "front-desk", { amount: left, source: "booking", ref: gid, party: lead ? name(lead.guestId) : undefined }); if (e) return setErr(e); }
    const n0 = left;
    for (const b of rows) { const d = dueOf(b); if (d <= 0 || left <= 0) continue; const x = Math.min(d, left); bk.pay(b.code, x, method, `Group payment ${gid}`); left -= x; }
    setAmt(""); setToast(`${tk(n0)} shared across ${rows.length} rooms`); setTimeout(() => setToast(""), 2600);
  };
  if (!bk.ready) return <p role="status" className="p-8 text-[14px] text-hms-muted">Loading…</p>;
  return (
    <div className="h-full overflow-y-auto"><div className="hms-page max-w-[1100px]">
      <Link href="/hms/bookings" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-hms-muted hover:text-hms-ink"><ArrowLeft className="size-4" />All bookings</Link>
      {!rows.length ? <p className="mt-6 text-[15px] text-hms-muted">Group not found.</p> : <>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-hms-coral-soft text-hms-red"><Users className="size-5" /></span>
          <div className="min-w-0 flex-1"><h1 className="text-[22px] font-bold">{lead ? name(lead.guestId) : "Group"} · {rows.length} rooms</h1><p className="flex items-center gap-2 text-[13.5px] text-hms-muted">{gid} · {dm(lead.from)} → {dm(lead.to)}<ChannelBadge b={lead} /></p></div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2"><Kp k="Total" v={tk(total)} /><Kp k="Paid" v={tk(paid)} /><Kp k="Balance" v={tk(due)} tone={due > 0 ? "text-[#b42318]" : "text-[#16693a]"} /></div>
        <section className={clsx(card, "mt-4 overflow-hidden")}>
          <ul className="divide-y divide-hms-line">
            {rows.map((b) => (
              <li key={b.code} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="grid h-11 w-14 place-items-center rounded-xl bg-[#f1f3f6] text-[16px] font-bold">{b.unit || "—"}</span>
                <button onClick={() => router.push(`/hms/bookings/view?b=${b.code}&from=${encodeURIComponent(`/hms/bookings/group?g=${gid}`)}`)} className="min-w-0 flex-1 text-left"><b className="block text-[14.5px]">{name(b.guestId)}</b><span className="text-[12.5px] text-hms-muted">{b.code} · {b.type} · {b.adults + b.children} guest{b.adults + b.children > 1 ? "s" : ""}</span></button>
                <StatusPill s={b.status} /><PayPill b={b} />
                <b className="w-24 text-right tabular-nums">{tk(totalOf(b))}</b>
                {b.status === "Confirmed" && b.from <= TODAY && <button onClick={() => router.push(`/hms/bookings/view?b=${b.code}&do=checkin`)} aria-label={`Check in room ${b.unit}`} className={clsx(bSoft, "!h-9 px-3 text-[13.5px]")}><LogIn className="size-4" />Check in</button>}
                {b.status === "Checked in" && b.to <= TODAY && <button onClick={() => router.push(`/hms/bookings/view?b=${b.code}&do=checkout`)} aria-label={`Check out room ${b.unit}`} className={clsx(bSoft, "!h-9 px-3 text-[13.5px]")}><LogOut className="size-4" />Check out</button>}
              </li>
            ))}
          </ul>
        </section>
        {due > 0 && <section className={clsx(card, "mt-4 flex flex-wrap items-end gap-3 p-4")}>
          <div><label htmlFor="gp-a" className={lbl}>Group payment</label><input id="gp-a" inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} placeholder={`৳ up to ${tk(due)}`} className={clsx(input, "w-44")} /></div>
          <button onClick={() => setAmt(String(due))} className={clsx(bSoft, "!h-11")}>Full · {tk(due)}</button>
          <div role="radiogroup" aria-label="Payment method" className="flex gap-1.5">{(["Cash", "bKash", "Card", "Bank"] as PayMethod[]).map((m) => <button key={m} role="radio" aria-checked={method === m} onClick={() => setMethod(m)} className={clsx("h-11 rounded-lg px-3 text-[14px] font-semibold", method === m ? "bg-hms-ink text-white" : "bg-[#eef0f3]")}>{m}</button>)}</div>
          <button onClick={payAll} className={bMain}>Take payment</button>
          <p className="w-full text-[12.5px] text-hms-muted">Shared across the rooms that still owe, in room order.</p>
          {err && <p role="alert" className="w-full rounded-lg bg-[#fdecec] px-3 py-2 text-[13.5px] font-medium text-[#b42318]">{err}</p>}
        </section>}
      </>}
      {toast && <Toast text={toast} />}
    </div></div>
  );
}
function Kp({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return <div className={clsx(card, "px-4 py-3")}><p className="text-[12.5px] font-semibold text-hms-muted">{k}</p><p className={clsx("text-[19px] font-bold tabular-nums", tone)}>{v}</p></div>;
}
