"use client";

import { CalendarDays, Minus, Plus, Users } from "lucide-react";
import clsx from "clsx";
import { shortDate, useBooking } from "./BookingProvider";
import { useT } from "@/lib/i18n";

/** Check-in / check-out display cell. Opens the price calendar. */
export function DateTrigger({ which, compact, onOpen, active }: { which: "checkIn" | "checkOut"; compact?: boolean; onOpen: () => void; active?: boolean }) {
  const { search } = useBooking();
  const t = useT();
  const value = search[which];
  const label = t(which === "checkIn" ? "Check-in" : "Check-out");
  return (
    <button
      type="button"
      onClick={onOpen}
      className={clsx("flex w-full min-w-0 items-center gap-3 rounded-2xl text-left transition-colors", compact ? "px-3 py-2.5" : "px-4 py-3", active ? "bg-brand-soft" : "hover:bg-canvas")}
    >
      <CalendarDays className={clsx("size-5 shrink-0", active ? "text-action" : "text-muted")} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-muted">{label}</span>
        <span className={clsx("block truncate text-[15px] font-semibold", value ? "text-ink" : "text-muted")}>{value ? shortDate(value) : t("Add date")}</span>
      </span>
    </button>
  );
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const t = useT();
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-semibold">{t(label)}</p>
        <p className="text-sm text-muted">{t(hint)}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid size-11 place-items-center rounded-full border border-line text-ink disabled:opacity-30 hover:border-brand-ring">
          <Minus className="size-4" />
        </button>
        <span className="w-6 text-center text-lg font-semibold tabular-nums" aria-live="polite">{value}</span>
        <button type="button" aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid size-11 place-items-center rounded-full border border-line text-ink disabled:opacity-30 hover:border-brand-ring">
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function GuestSteppers() {
  const { search, setSearch, maxAdults, maxChildren } = useBooking();
  return (
    <div className="divide-y divide-line">
      <Stepper label="Adults" hint="Age 13+" value={search.adults} min={1} max={maxAdults} onChange={(v) => setSearch({ adults: v })} />
      <Stepper label="Children" hint="Age 0–12" value={search.children} min={0} max={maxChildren} onChange={(v) => setSearch({ children: v })} />
    </div>
  );
}

export function guestLabel(adults: number, children: number) {
  return `${adults} adult${adults > 1 ? "s" : ""}${children ? `, ${children} child${children > 1 ? "ren" : ""}` : ""}`;
}

export function GuestIcon() {
  return <Users className="size-5 shrink-0 text-muted" />;
}
