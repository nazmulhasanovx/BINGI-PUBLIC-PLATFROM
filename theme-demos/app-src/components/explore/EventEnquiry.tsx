"use client";

import { useState } from "react";
import clsx from "clsx";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TYPES = ["Wedding / holud", "Birthday / anniversary", "Corporate meeting", "Conference", "Group stay", "Other"];
const field = "mt-1.5 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-[16px] outline-none focus:border-action";

/** Events & Banquet enquiry (Ultra). Goes to HMS Events module when live — planned. */
export function EventEnquiry({ hotelName }: { hotelName: string }) {
  const [f, setF] = useState({ type: TYPES[0], date: "", guests: "", name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [tried, setTried] = useState(false);
  const ok = f.name.trim().length > 1 && f.phone.replace(/\D/g, "").length >= 10 && Number(f.guests) > 0;
  if (sent)
    return (
      <div className="rounded-3xl border border-line bg-surface p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
        <h2 className="mt-3 text-2xl font-bold">Enquiry sent</h2>
        <p className="mt-2 text-muted">{hotelName}’s events team will call {f.phone} within one working day.</p>
        <p className="mt-4 text-[13px] text-muted">Preview build: enquiry not sent to a hotel.</p>
      </div>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (ok) setSent(true);
      }}
      className="rounded-3xl border border-line bg-surface p-5 shadow-card md:p-7"
      noValidate
    >
      <fieldset>
        <legend className="text-sm font-semibold">What are you planning?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button type="button" key={t} onClick={() => setF({ ...f, type: t })} className={clsx("h-10 rounded-full border px-4 text-sm font-semibold", f.type === t ? "border-action bg-action text-on-action" : "border-line hover:border-brand-ring")}>
              {t}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">Date (approx.)<input type="date" className={field} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
        <label className="block text-sm font-semibold">Guests<input inputMode="numeric" className={clsx(field, tried && !(Number(f.guests) > 0) && "border-red-400")} placeholder="e.g. 120" value={f.guests} onChange={(e) => setF({ ...f, guests: e.target.value.replace(/\D/g, "") })} /></label>
        <label className="block text-sm font-semibold">Your name<input className={clsx(field, tried && f.name.trim().length < 2 && "border-red-400")} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="block text-sm font-semibold">Mobile<input className={clsx(field, tried && f.phone.replace(/\D/g, "").length < 10 && "border-red-400")} inputMode="tel" autoComplete="tel" placeholder="01XXX-XXXXXX" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <label className="block text-sm font-semibold sm:col-span-2">Email <span className="font-normal text-muted">(optional)</span><input type="email" className={field} autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className="block text-sm font-semibold sm:col-span-2">Anything else? <span className="font-normal text-muted">(optional)</span><textarea rows={4} className="mt-1.5 w-full rounded-2xl border border-line bg-surface p-4 text-[16px] outline-none focus:border-action" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Rooms needed, food, decoration, budget…" /></label>
      </div>
      {tried && !ok && <p className="mt-3 text-sm text-red-700">Please fill in guests, name and mobile.</p>}
      <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto">Send enquiry</Button>
    </form>
  );
}
