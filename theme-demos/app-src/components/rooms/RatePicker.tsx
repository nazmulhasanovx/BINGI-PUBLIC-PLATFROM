"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Check, ShieldCheck } from "lucide-react";
import type { Hotel, RoomCategory } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { dateList, fits, nightlyRate, quote, ratePlans, unitsLeft, type RatePlanId } from "@/lib/pricing";
import { useGuestState } from "@/lib/store";
import { useBooking } from "@/components/booking/BookingProvider";
import { DateTrigger, GuestSteppers } from "@/components/booking/SearchFields";
import { Calendar } from "@/components/booking/Calendar";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";

/** Sticky card on desktop, inline on phone + a sticky bottom CTA. */
export function RatePicker({ hotel, room }: { hotel: Hotel; room: RoomCategory }) {
  const router = useRouter();
  const params = useSearchParams();
  const { search, setSearch } = useBooking();
  const { setStay } = useGuestState(hotel.slug);
  const plans = ratePlans(hotel);
  const [plan, setPlan] = useState<RatePlanId>(plans[0].id);
  const [cal, setCal] = useState(false);
  const roomPrice = (iso: string) => (unitsLeft(room, [iso]) > 0 ? nightlyRate(room, iso) : null);

  const pIn = params.get("in") ?? "";
  const pOut = params.get("out") ?? "";
  const pA = Number(params.get("adults") ?? 0);
  const pC = Number(params.get("children") ?? 0);
  useEffect(() => {
    if (pIn) setSearch({ checkIn: pIn, checkOut: pOut, adults: pA || 2, children: pC });
  }, [pIn, pOut, pA, pC, setSearch]);

  const dates = useMemo(() => dateList(search.checkIn, search.checkOut), [search.checkIn, search.checkOut]);
  const left = unitsLeft(room, dates);
  const fit = fits(room, search.adults, search.children);
  const stay = { roomSlug: room.slug, plan, checkIn: search.checkIn, checkOut: search.checkOut, adults: search.adults, children: search.children };
  const q = dates.length ? quote(hotel, stay, []) : null;
  const canBook = dates.length > 0 && left > 0 && fit;

  const reserve = () => {
    if (!canBook) return;
    setStay(stay);
    router.push(`/hotel/${hotel.slug}/stay`);
  };

  const reason = !dates.length ? "Pick dates to continue" : !fit ? `This ${room.kind} fits up to ${room.maxAdults} adults${room.maxChildren ? ` and ${room.maxChildren} children` : ""}` : left === 0 ? "Not available for these dates — try other dates" : null;

  return (
    <>
      <div id="rates" className="rounded-[28px] border border-line bg-surface p-4 shadow-float md:p-5">
        <p className="text-sm text-muted">
          from <span className="text-2xl font-bold text-ink">{formatMoney(room.fromPrice)}</span> / night
        </p>
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-line p-1">
          <DateTrigger which="checkIn" compact onOpen={() => setCal(true)} />
          <DateTrigger which="checkOut" compact onOpen={() => setCal(true)} />
        </div>
        <details className="group mt-2 rounded-2xl border border-line px-4 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex h-12 cursor-pointer list-none items-center justify-between text-[15px] font-semibold">
            Guests <span className="font-medium text-muted">{search.adults} adult{search.adults > 1 ? "s" : ""}{search.children ? `, ${search.children} child` : ""}</span>
          </summary>
          <GuestSteppers />
        </details>

        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-semibold">Choose your rate</legend>
          <div className="space-y-2">
            {plans.map((p) => (
              <label
                key={p.id}
                className={clsx(
                  "flex cursor-pointer gap-3 rounded-2xl border p-3.5 transition-colors",
                  plan === p.id ? "border-action bg-brand-soft" : "border-line hover:border-brand-ring",
                )}
              >
                <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="sr-only" />
                <span className={clsx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2", plan === p.id ? "border-action bg-action" : "border-line")}>
                  {plan === p.id && <Check className="size-3 text-on-action" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-2 font-semibold">
                    {p.name}
                    <span className="shrink-0 tabular-nums">{p.perAdultPerNight ? `+${formatMoney(p.perAdultPerNight)}` : "Included"}</span>
                  </span>
                  {p.perAdultPerNight > 0 && <span className="mt-0.5 block text-[13px] text-muted">per adult / night</span>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {q && canBook && (
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px]">
            {q.lines.map((l) => (
              <div key={l.label} className={clsx("flex justify-between gap-3", l.kind === "discount" && "text-emerald-700", l.kind === "tax" && "text-muted")}>
                <dt>{l.label}</dt>
                <dd className="tabular-nums">{l.amount < 0 ? "−" : ""}{formatMoney(Math.abs(l.amount))}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(q.total)}</dd>
            </div>
          </dl>
        )}
        {reason && <p className="mt-4 rounded-xl bg-canvas px-3 py-2.5 text-sm text-muted">{reason}</p>}
        {canBook && left <= 2 && <p className="mt-3 text-sm font-semibold text-action">Only {left} left for these dates</p>}

        <Button size="lg" className="mt-4 hidden w-full md:flex" disabled={!canBook} onClick={reserve}>
          Reserve
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[13px] text-muted">
          <ShieldCheck className="size-4" /> No payment yet
        </p>
      </div>

      <Sheet open={cal} onClose={() => setCal(false)} title={`Dates · ${room.name}`}>
        <Calendar
          value={{ checkIn: search.checkIn, checkOut: search.checkOut }}
          onChange={(r) => {
            setSearch(r);
            if (r.checkIn && r.checkOut) setTimeout(() => setCal(false), 300);
          }}
          priceFor={roomPrice}
          onDone={() => setCal(false)}
        />
      </Sheet>

      {/* phone sticky CTA */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 pt-3 shadow-[0_-8px_24px_-18px_rgb(22_24_29/0.35)] md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            {q && canBook ? (
              <>
                <p className="text-xs text-muted">{q.nights} night{q.nights > 1 ? "s" : ""} · incl. tax</p>
                <p className="truncate text-lg font-bold tabular-nums">{formatMoney(q.total)}</p>
              </>
            ) : (
              <>
                <p className="text-xs text-muted">from</p>
                <p className="truncate text-lg font-bold">{formatMoney(room.fromPrice)} <span className="text-sm font-medium text-muted">/ night</span></p>
              </>
            )}
          </div>
          {canBook ? (
            <Button size="lg" onClick={reserve}>Reserve</Button>
          ) : (
            <Button size="lg" variant="outline" onClick={() => setCal(true)}>
              {dates.length ? "Change" : "Add dates"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
