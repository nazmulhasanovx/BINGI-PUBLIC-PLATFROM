"use client";
// Shared Rooms engine for theme-owned Rooms pages: URL ↔ search state, availability, totals and the small
// pieces every layout needs (price, dates button, status line). Each theme only decides the layout.
import { Suspense, useEffect, useMemo, type ComponentType } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { CalendarDays } from "lucide-react";
import type { Hotel, RoomCategory } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { dateList, fits, nightlyRate, unitsLeft } from "@/lib/pricing";
import { shortDate, useBooking } from "@/components/booking/BookingProvider";
import { guestLabel } from "@/components/booking/SearchFields";
import { SearchBar } from "@/components/booking/SearchBar";
import { useSiteView } from "@/lib/site";

export type Item = { r: RoomCategory; left: number; total: number; fit: boolean; off: boolean; low: boolean };
export type Stay = ReturnType<typeof useStay>;

export function useStay(hotel: Hotel) {
  const params = useSearchParams();
  const { setSearch, openSearch } = useBooking();
  const urlIn = params.get("in") ?? "", urlOut = params.get("out") ?? "";
  const adults = Number(params.get("adults") ?? 2) || 2, children = Number(params.get("children") ?? 0) || 0;
  useEffect(() => { setSearch({ checkIn: urlIn, checkOut: urlOut, adults, children }); }, [urlIn, urlOut, adults, children, setSearch]);
  const doc = useSiteView(hotel.slug);
  const dates = useMemo(() => dateList(urlIn, urlOut), [urlIn, urlOut]);
  const has = dates.length > 0;
  const q = params.toString();
  const items: Item[] = hotel.rooms.filter((r) => doc?.rooms[r.id]?.visible !== false).map((r) => {
    const left = unitsLeft(r, dates), fit = fits(r, adults, children);
    return { r, left, fit, total: has ? dates.reduce((s, d) => s + nightlyRate(r, d), 0) : 0, off: has && (left === 0 || !fit), low: has && fit && left > 0 && left <= 2 };
  });
  const link = (r: RoomCategory) => `/hotel/${hotel.slug}/rooms/${r.slug}${q ? `?${q}` : ""}`;
  const free = items.filter((x) => !x.off).length;
  return { hotel, items, has, nights: dates.length, urlIn, urlOut, adults, children, openSearch, link, free };
}

/** Renders the theme layout inside Suspense (useSearchParams needs it during static render). */
export function StayPage({ hotel, Layout }: { hotel: Hotel; Layout: ComponentType<{ s: Stay }> }) {
  return <Suspense fallback={<div className="min-h-[60svh]" />}><Run hotel={hotel} Layout={Layout} /></Suspense>;
}
function Run({ hotel, Layout }: { hotel: Hotel; Layout: ComponentType<{ s: Stay }> }) {
  const s = useStay(hotel);
  return <Layout s={s} />;
}

const n = (k: number) => `${k} night${k > 1 ? "s" : ""}`;
export const unitWord = (r: RoomCategory) => (r.kind === "dorm" ? "bed" : "night");

/** Price block: "from X / night" without dates, "N nights · X" with dates, or the reason it can't be booked. */
export function Price({ s, x, className, big = "text-[22px]", light }: { s: Stay; x: Item; className?: string; big?: string; light?: boolean }) {
  const mute = light ? "text-white/80" : "text-muted";
  if (x.off) return <p className={clsx("font-semibold", mute, className)}>{!x.fit ? `Fits up to ${x.r.maxAdults} adults` : "Sold out for these dates"}</p>;
  if (s.has) return <p className={className}><span className={clsx("block text-[12.5px]", mute)}>{n(s.nights)}, before tax</span><b className={clsx(big, "tabular-nums")}>{formatMoney(x.total)}</b></p>;
  return <p className={className}><span className={clsx("block text-[12.5px]", mute)}>from</span><b className={clsx(big, "tabular-nums")}>{formatMoney(x.r.fromPrice)}</b><span className={mute}> / {x.r.kind === "dorm" ? "bed" : "night"}</span></p>;
}

/** One-line summary of the search; tapping "add your dates" opens the shared search sheet. */
export function Status({ s, className, light }: { s: Stay; className?: string; light?: boolean }) {
  return (
    <p className={clsx("text-[15px]", light ? "text-white/85" : "text-muted", className)}>
      {s.has ? `${s.free} of ${s.items.length} available · ${n(s.nights)} · ${guestLabel(s.adults, s.children)}`
        : <>Prices shown are from-prices — <button onClick={s.openSearch} className={clsx("font-semibold underline underline-offset-2", light ? "text-white" : "text-action")}>add your dates</button> for live prices.</>}
    </p>
  );
}

/** Search: full bar on desktop, compact dates button on phones. */
export function Search({ s, className, barClass }: { s: Stay; className?: string; barClass?: string }) {
  return (
    <div className={className}>
      <div className={clsx("hidden md:block", barClass)}><SearchBar /></div>
      <button onClick={s.openSearch} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left text-ink md:hidden">
        <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-action"><CalendarDays className="size-5" aria-hidden /></span>
        <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{s.has ? `${shortDate(s.urlIn)} – ${shortDate(s.urlOut)}` : "Add dates for prices"}</span><span className="block text-sm text-muted">{guestLabel(s.adults, s.children)}</span></span>
      </button>
    </div>
  );
}

/** Small "only N left" flag. */
export function Low({ x, className }: { x: Item; className?: string }) {
  return x.low ? <span className={clsx("rounded-full bg-ink px-2.5 py-1 text-[12px] font-semibold text-canvas", className)}>Only {x.left} left</span> : null;
}

export const sleeps = (r: RoomCategory) => `${r.maxAdults} adult${r.maxAdults > 1 ? "s" : ""}${r.maxChildren ? ` + ${r.maxChildren} child` : ""}`;
export const size = (r: RoomCategory) => (r.sizeSqft ? `${r.sizeSqft.toLocaleString()} ft²` : null);
