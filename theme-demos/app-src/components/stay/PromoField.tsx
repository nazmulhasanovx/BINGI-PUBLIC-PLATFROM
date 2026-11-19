"use client";

import { useState } from "react";
import { Check, Tag, X } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { checkPromo } from "@/lib/pricing";

/** Promo code (HMS coupons). Only one discount per booking — a code replaces the automatic offer only if it is better. */
export function PromoField({ hotel, nights, applied, entered, onApply }: { hotel: Hotel; nights: number; applied?: string; entered?: string; onApply: (code?: string) => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);

  if (applied)
    return (
      <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5 text-[14px] font-semibold text-emerald-800">
        <span className="flex items-center gap-2"><Check className="size-4" /> {applied} applied</span>
        <button onClick={() => onApply(undefined)} aria-label="Remove code" className="grid size-8 place-items-center rounded-full hover:bg-emerald-100"><X className="size-4" /></button>
      </div>
    );

  const submit = () => {
    const r = checkPromo(hotel, code, nights);
    if (!r.ok) return setErr(r.reason);
    setErr("");
    onApply(r.code);
  };

  return (
    <div className="mt-4">
      {entered && !applied && <p className="mb-2 text-[13px] text-muted">Code {entered} is lower than your current offer.</p>}
      {open ? (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-2">
          <input autoFocus value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(""); }} placeholder="Promo code" aria-label="Promo code" className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-[16px] uppercase outline-none focus:border-action" />
          <button type="submit" disabled={!code.trim()} className="h-11 rounded-xl border border-brand-ring px-4 text-sm font-semibold text-action disabled:opacity-40">Apply</button>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="flex h-10 items-center gap-2 text-sm font-semibold text-action"><Tag className="size-4" /> Have a promo code?</button>
      )}
      {err && <p className="mt-1.5 text-[13px] text-red-700">{err}</p>}
    </div>
  );
}
