"use client";
// Guest-facing online pre-check-in for a booking made at the hotel (link sent by the hotel from BinGi HMS).
// Prototype: the answer is saved in this browser's demo data; in production it posts to the HMS booking API.
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheck, Lock } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { dmy, useBookings } from "@/lib/bookings/store";
import { phoneKey, useGuestNames, validId, type IdType } from "@/lib/guests/store";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

const input = "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-[16px] outline-none focus:border-action";

export function PreCheckin({ hotel }: { hotel: Hotel }) {
  const sp = useSearchParams();
  const code = sp.get("b") ?? "";
  const bk = useBookings(hotel);
  const guests = useGuestNames(hotel);
  const b = bk.list.find((x) => x.code === code);
  const g = b ? guests.get(b.guestId) : undefined;
  const [phone, setPhone] = useState("");
  const [ok, setOk] = useState(false);
  const [idType, setIdType] = useState<IdType>("NID");
  const [idNo, setIdNo] = useState("");
  const [eta, setEta] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  if (!bk.ready) return <div className="mx-auto max-w-[640px] px-4 py-10"><ListSkeleton rows={2} /></div>;
  const shell = (body: React.ReactNode) => <div className="mx-auto max-w-[640px] px-4 pb-24 pt-8 sm:px-6"><p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-action">{hotel.name}</p><h1 className="mt-1 text-[28px] font-bold">Online check-in</h1>{body}</div>;
  if (!b || b.status === "Cancelled" || b.status === "No-show") return shell(<p className="mt-6 rounded-2xl border border-line bg-surface p-5 text-muted">We couldn&apos;t find an open booking for this link. Please contact the hotel.</p>);
  if (done || b.precheck) return shell(
    <div className="mt-6 rounded-3xl border border-line bg-surface p-6 text-center">
      <CircleCheck className="mx-auto size-10 text-[#16a34a]" />
      <p className="mt-3 text-[18px] font-bold">You&apos;re pre-checked in</p>
      <p className="mt-1 text-muted">Booking {b.code} · {dmy(b.from)} → {dmy(b.to)}. Show your {b.precheck?.idType ?? idType} at the front desk to collect your key.</p>
    </div>);
  if (b.status !== "Confirmed") return shell(<p className="mt-6 rounded-2xl border border-line bg-surface p-5 text-muted">This booking is already {b.status === "Checked in" ? "checked in" : "closed"}.</p>);
  const verify = () => { setErr(""); if (g && phoneKey(phone).slice(-4) === phoneKey(g.phone).slice(-4) && phoneKey(phone).length >= 4) setOk(true); else setErr("That doesn't match the phone number on the booking."); };
  const submit = () => {
    setErr("");
    if (!idNo.trim()) return setErr("Enter your ID number");
    if (!validId(idType, idNo.trim())) return setErr(`That ${idType} number doesn't look right`);
    bk.precheckIn(b.code, { eta: eta || undefined, idType, idNo: idNo.trim(), note: note.trim() || undefined });
    setDone(true);
  };
  return shell(<>
    <p className="mt-1 text-muted">Booking {b.code} · {dmy(b.from)} → {dmy(b.to)} · {b.type}</p>
    {!ok ? (
      <section className="mt-6 rounded-3xl border border-line bg-surface p-5">
        <p className="flex items-center gap-2 font-semibold"><Lock className="size-4" />Confirm it&apos;s you</p>
        <label htmlFor="pc-ph" className="mt-3 block text-[14px] font-semibold">Last 4 digits of your phone</label>
        <input id="pc-ph" inputMode="numeric" maxLength={4} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} className={input} />
        {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
        <Button className="mt-4 w-full" onClick={verify}>Continue</Button>
      </section>
    ) : (
      <section className="mt-6 space-y-4 rounded-3xl border border-line bg-surface p-5">
        <p className="font-semibold">Hi {g?.name?.split(" ")[0]}, a few details to speed up your arrival</p>
        <div className="grid grid-cols-[130px_1fr] gap-2">
          <select aria-label="ID type" value={idType} onChange={(e) => setIdType(e.target.value as IdType)} className={input}><option>NID</option><option>Passport</option><option>Driving licence</option></select>
          <input aria-label="ID number" value={idNo} onChange={(e) => setIdNo(e.target.value)} placeholder="ID number" className={input} />
        </div>
        <div><label htmlFor="pc-eta" className="block text-[14px] font-semibold">Arrival time</label><input id="pc-eta" type="time" value={eta} onChange={(e) => setEta(e.target.value)} className={input} /></div>
        <div><label htmlFor="pc-note" className="block text-[14px] font-semibold">Anything we should know? (optional)</label><textarea id="pc-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={`${input} h-auto py-3`} /></div>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <Button className="w-full" onClick={submit}>Finish pre-check-in</Button>
        <p className="text-[12.5px] text-muted">Payment is taken at the hotel. Your ID is checked again at the desk.</p>
      </section>
    )}
  </>);
}
