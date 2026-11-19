"use client";
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { BellRing, Plus } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { addDays } from "@/lib/bookings/demo";
import { dm, nightsBetween, timeOf } from "@/lib/bookings/store";
import { input, lbl } from "../guests/ui";
import { BookingsFrame, bMain, bSoft, card, useBk } from "./ui";

export function WaitlistPage() { return <BookingsFrame tab="waitlist"><Waitlist /></BookingsFrame>; }

/** Guests who asked for dates that were full — shows when a matching room frees up. */
function Waitlist() {
  const { bk, toast, mode } = useBk();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [from, setFrom] = useState(TODAY); const [to, setTo] = useState(addDays(TODAY, 1));
  const [category, setCategory] = useState(""); const [adults, setAdults] = useState(2); const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const freeFor = (f: string, t: string, c?: string) => (f < TODAY ? [] : bk.freeUnits(f, t).filter((u) => !c || u.category === c));
  const openList = bk.waitlist.filter((w) => !w.done);
  const closed = bk.waitlist.filter((w) => w.done);
  const add = () => {
    setErr("");
    if (name.trim().length < 2) return setErr("Enter the guest's name");
    if (phone.replace(/\D/g, "").length < 8) return setErr("Enter a phone number");
    if (to <= from || from < TODAY) return setErr("Check the dates");
    bk.addWait({ name: name.trim(), phone: phone.trim(), from, to, category: category || undefined, adults, note: note.trim() });
    toast(`${name.trim()} added to the waitlist`); setAdding(false); setName(""); setPhone(""); setNote("");
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex-1 text-[14px] text-[#4d5664]">Full dates? Save the guest here — a green badge shows the moment a room is free.</p>
        <button onClick={() => setAdding(!adding)} className={bMain}><Plus className="size-4" />Add to waitlist</button>
      </div>
      {adding && <section className={clsx(card, "grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4")} aria-label="Add to waitlist">
        <div><label htmlFor="wl-n" className={lbl}>Name</label><input id="wl-n" value={name} onChange={(e) => setName(e.target.value)} className={input} /></div>
        <div><label htmlFor="wl-p" className={lbl}>Phone</label><input id="wl-p" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} /></div>
        <div><label htmlFor="wl-f" className={lbl}>Check-in</label><input id="wl-f" type="date" min={TODAY} value={from} onChange={(e) => { setFrom(e.target.value); if (e.target.value >= to) setTo(addDays(e.target.value, 1)); }} className={input} /></div>
        <div><label htmlFor="wl-t" className={lbl}>Check-out</label><input id="wl-t" type="date" min={addDays(from, 1)} value={to} onChange={(e) => setTo(e.target.value)} className={input} /></div>
        <div><label htmlFor="wl-c" className={lbl}>Room type</label><select id="wl-c" value={category} onChange={(e) => setCategory(e.target.value)} className={input}><option value="">Any room</option>{[...bk.cats.values()].map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label htmlFor="wl-a" className={lbl}>Adults</label><input id="wl-a" type="number" min={1} max={8} value={adults} onChange={(e) => setAdults(Math.max(1, Math.min(8, Number(e.target.value) || 1)))} className={input} /></div>
        <div className="sm:col-span-2"><label htmlFor="wl-no" className={lbl}>Note</label><input id="wl-no" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. prefers sea view" className={input} /></div>
        {err && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 text-[13.5px] font-medium text-[#b42318] sm:col-span-2 lg:col-span-4">{err}</p>}
        <div className="flex gap-2 sm:col-span-2 lg:col-span-4"><button onClick={add} className={bMain}>Save</button><button onClick={() => setAdding(false)} className={bSoft}>Cancel</button></div>
        <p className="text-[12.5px] text-hms-muted sm:col-span-2 lg:col-span-4">Right now: {freeFor(from, to, category || undefined).length} room(s) free for these dates.</p>
      </section>}
      <section className={clsx(card, "overflow-hidden")} aria-label="Waiting guests">
        {openList.length === 0 ? <p className="px-6 py-14 text-center text-[15px] text-hms-muted">No one is waiting.</p> : (
          <ul className="divide-y divide-hms-line">
            {openList.map((w) => {
              const free = freeFor(w.from, w.to, w.category);
              const past = w.from < TODAY;
              const q = new URLSearchParams({ from: w.from, to: w.to, phone: w.phone, name: w.name, adults: String(w.adults), ...(free[0] ? { room: free[0].code } : {}) });
              return (
                <li key={w.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2"><b className="text-[15px]">{w.name}</b><span className="text-[13px] text-hms-muted">{w.phone}</span>
                      {past ? <span className="rounded bg-[#eef0f3] px-1.5 text-[11.5px] font-bold text-[#4d5664]">Dates passed</span>
                        : free.length ? <span className="inline-flex items-center gap-1 rounded bg-[#e5f5ec] px-1.5 text-[11.5px] font-bold text-[#16693a]"><BellRing className="size-3" />{free.length} room{free.length > 1 ? "s" : ""} free now</span>
                        : <span className="rounded bg-[#fdf3d9] px-1.5 text-[11.5px] font-bold text-[#7a4a0b]">Still full</span>}</p>
                    <p className="text-[13.5px] text-[#3a414c]">{dm(w.from)} → {dm(w.to)} · {nightsBetween(w.from, w.to)} night{nightsBetween(w.from, w.to) > 1 ? "s" : ""} · {w.category ? bk.cats.get(w.category)?.name : "Any room"} · {w.adults} adult{w.adults > 1 ? "s" : ""}{w.note ? ` · ${w.note}` : ""}</p>
                    {mode === "details" && <p className="text-[12px] text-hms-muted">Added {dm(w.at.slice(0, 10))} {timeOf(w.at)}</p>}
                  </div>
                  {free.length > 0 && !past && <Link href={`/hms/bookings/new?${q}`} onClick={() => bk.closeWait(w.id, "Moved to a booking")} aria-label={`Book ${w.name}`} className={clsx(bMain, "!h-10")}>Book now</Link>}
                  <button onClick={() => { bk.closeWait(w.id, "Not needed"); toast(`${w.name} removed from the waitlist`); }} aria-label={`Remove ${w.name}`} className={clsx(bSoft, "!h-10")}>Remove</button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      {closed.length > 0 && <button onClick={() => setShowClosed(!showClosed)} className="text-[13.5px] font-semibold text-hms-muted hover:text-hms-ink">{showClosed ? "Hide" : "Show"} closed ({closed.length})</button>}
      {showClosed && <ul className="space-y-1 text-[13.5px] text-[#4d5664]">{closed.map((w) => <li key={w.id}>{w.name} · {dm(w.from)} → {dm(w.to)} · {w.done}</li>)}</ul>}
    </div>
  );
}
