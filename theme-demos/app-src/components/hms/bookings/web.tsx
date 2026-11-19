"use client";
import clsx from "clsx";
import { useState } from "react";
import { Check, Globe, X as XIcon } from "lucide-react";
import { TODAY, taxOf } from "@/lib/rooms/store";
import { addDays } from "@/lib/bookings/demo";
import { dm, nightsBetween, tk, type Night } from "@/lib/bookings/store";
import { useGuestState, type GuestBooking } from "@/lib/store";
import { useProperty } from "../property";
import { bMain, bSoft, card, useBk } from "./ui";

/** Requests made on the hotel's own website (BinGi booking engine) — waiting for the hotel to accept. */
export function WebRequests() {
  const h = useProperty();
  const gs = useGuestState(h.slug);
  const pending = gs.bookings.filter((b) => b.bookingStatus === "pending");
  if (!gs.ready || !pending.length) return null;
  return (
    <section aria-label="Website requests" className={clsx(card, "mt-4 overflow-hidden border-[#c3d5fa]")}>
      <h2 className="flex items-center gap-2 bg-[#f3f7ff] px-4 py-2.5 text-[14.5px] font-bold text-[#1e3a8a]"><Globe className="size-4" />{pending.length} new from your website</h2>
      <ul className="divide-y divide-hms-line">{pending.map((w) => <Req key={w.id} w={w} setStatus={gs.setStatus} />)}</ul>
    </section>
  );
}

function Req({ w, setStatus }: { w: GuestBooking; setStatus: ReturnType<typeof useGuestState>["setStatus"] }) {
  const h = useProperty();
  const { bk, g, toast, open } = useBk();
  const r = h.rooms.find((x) => x.slug === w.stay.roomSlug);
  const catId = r ? `cat-${r.id}` : "";
  const cat = bk.cats.get(catId);
  const from = w.stay.checkIn, to = w.stay.checkOut;
  const n = Math.max(1, nightsBetween(from, to));
  const free = cat ? bk.freeUnits(from, to).filter((u) => u.category === catId) : [];
  const [unit, setUnit] = useState(free[0]?.code ?? "");
  const [paidOk, setPaidOk] = useState(false);
  const [err, setErr] = useState("");
  const adv = w.paymentStatus === "advance-submitted" ? w.payment.dueNow : 0;
  const accept = () => {
    setErr("");
    if (!cat) return setErr("This room type is not set up in Rooms — add it first");
    if (from < TODAY) return setErr("Check-in date has passed — decline or call the guest");
    let gid = g.findByPhone(w.guest.phone)?.id;
    if (!gid) { gid = g.nextId(); g.saveGuest({ id: gid, name: w.guest.name, phone: w.guest.phone, email: w.guest.email ?? "", country: "Bangladesh", address: "", idType: "NID", idNo: "", prefs: [], vip: false, verified: false, notes: "", marketing: !!w.guest.email, created: TODAY }); }
    const per = Math.round(w.quote.roomTotal / n);
    const nights: Night[] = Array.from({ length: n }, (_, i) => ({ date: addDays(from, i), base: per }));
    const res = bk.create([{ guestId: gid, unit, categoryId: catId, type: cat.name, from, to, adults: w.stay.adults, children: w.stay.children, channel: "Website", channelRef: w.id, nights, tax: taxOf(cat), discount: Math.min(w.quote.discount, per * n), note: [w.stay.plan === "breakfast" ? "Website plan: with breakfast" : "", w.guest.request ?? ""].filter(Boolean).join(" · "), eta: w.guest.arrival || undefined }]);
    if (!res.ok) return setErr(res.error);
    const code = res.codes[0];
    if (w.quote.extrasTotal > 0) bk.addCharge(code, "Website extras", w.quote.extrasTotal);
    if (adv > 0 && paidOk) bk.pay(code, adv, "bKash", `Website advance · ${w.payment.provider ?? "MFS"}${w.payment.reference ? ` ref ${w.payment.reference}` : ""}`);
    setStatus(w.id, "confirmed", adv > 0 && paidOk ? "paid" : undefined, code);
    toast(`${w.guest.name} accepted · ${code}${unit ? ` · Room ${unit}` : ""}`);
    open(code);
  };
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
        <div className="min-w-0 flex-1">
          <b className="text-[15px]">{w.guest.name}</b> <span className="text-[13px] text-hms-muted">· {w.guest.phone} · {w.id}</span>
          <p className="text-[13.5px] text-[#3a414c]">{r?.name ?? w.stay.roomSlug} · {dm(from)} → {dm(to)} · {n} night{n > 1 ? "s" : ""} · {w.stay.adults + w.stay.children} guest{w.stay.adults + w.stay.children > 1 ? "s" : ""}{w.stay.plan === "breakfast" ? " · with breakfast" : ""}</p>
          {w.guest.request && <p className="text-[13px] text-hms-muted">“{w.guest.request}”</p>}
        </div>
        <div className="text-right"><b className="text-[16px] tabular-nums">{tk(w.quote.total)}</b><p className="text-[12.5px] text-hms-muted">{w.paymentStatus === "pay-at-hotel" ? "Pays at the hotel" : w.paymentStatus === "advance-submitted" ? `${tk(adv)} sent by ${w.payment.provider ?? "MFS"} — check it` : w.paymentStatus}</p></div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select aria-label={`Room for ${w.guest.name}`} value={unit} onChange={(e) => setUnit(e.target.value)} className="h-10 rounded-lg border border-hms-line bg-white px-2 text-[14px]">
          <option value="">{free.length ? "Assign later" : "No room free — assign later"}</option>
          {free.map((u) => <option key={u.code} value={u.code}>Room {u.code}</option>)}
        </select>
        {adv > 0 && <label className="flex items-center gap-2 text-[13.5px]"><input type="checkbox" checked={paidOk} onChange={(e) => setPaidOk(e.target.checked)} className="size-4 accent-[#b11c29]" />I checked the {tk(adv)} payment{w.payment.reference ? ` (ref ${w.payment.reference})` : ""}</label>}
        <span className="flex-1" />
        <button onClick={() => { setStatus(w.id, "cancelled"); toast(`${w.guest.name}'s request declined`); }} className={clsx(bSoft, "!h-10")}><XIcon className="size-4" />Decline</button>
        <button onClick={accept} className={clsx(bMain, "!h-10")}><Check className="size-4" />Accept</button>
      </div>
      {err && <p role="alert" className="mt-2 rounded-lg bg-[#fdecec] px-3 py-2 text-[13px] font-medium text-[#b42318]">{err}</p>}
      <p className="mt-1.5 text-[12px] text-hms-muted">Price from the website quote; VAT &amp; service follow this room type. No message is sent automatically in this prototype — use Documents &amp; messages.</p>
    </li>
  );
}
