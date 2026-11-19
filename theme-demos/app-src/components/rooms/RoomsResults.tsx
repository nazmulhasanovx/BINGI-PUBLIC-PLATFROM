"use client";

import Image from "next/image";
import { useSiteView } from "@/lib/site";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { BedDouble, CalendarDays, Pencil, Ruler, Users } from "lucide-react";
import type { Hotel, RoomCategory } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { dateList, fits, nightlyRate, unitsLeft } from "@/lib/pricing";
import { shortDate, useBooking } from "@/components/booking/BookingProvider";
import { guestLabel } from "@/components/booking/SearchFields";
import { Reveal } from "@/components/motion/Reveal";

const KINDS: { id: "all" | RoomCategory["kind"]; label: string }[] = [
  { id: "all", label: "All" },
  { id: "room", label: "Rooms" },
  { id: "suite", label: "Suites" },
  { id: "villa", label: "Villas" },
  { id: "cottage", label: "Cottages" },
  { id: "apartment", label: "Apartments" },
  { id: "dorm", label: "Dorm beds" },
];

export function RoomsResults({ hotel }: { hotel: Hotel }) {
  const params = useSearchParams();
  const { setSearch, openSearch } = useBooking();
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("all");
  const [sort, setSort] = useState<"price" | "size">("price");

  // URL → shared search state (so header search, sheet and this page agree)
  const urlIn = params.get("in") ?? "";
  const urlOut = params.get("out") ?? "";
  const urlAdults = Number(params.get("adults") ?? 2) || 2;
  const urlChildren = Number(params.get("children") ?? 0) || 0;
  useEffect(() => {
    setSearch({ checkIn: urlIn, checkOut: urlOut, adults: urlAdults, children: urlChildren });
  }, [urlIn, urlOut, urlAdults, urlChildren, setSearch]);

  const siteDoc = useSiteView(hotel.slug);
  const dates = useMemo(() => dateList(urlIn, urlOut), [urlIn, urlOut]);
  const hasDates = dates.length > 0;
  const kinds = KINDS.filter((k) => k.id === "all" || hotel.rooms.some((r) => r.kind === k.id));

  const list = hotel.rooms
    .filter((r) => siteDoc?.rooms[r.id]?.visible !== false)
    .filter((r) => kind === "all" || r.kind === kind)
    .map((r) => {
      const left = unitsLeft(r, dates);
      const total = hasDates ? dates.reduce((s, d) => s + nightlyRate(r, d), 0) : 0;
      return { r, left, total, fit: fits(r, urlAdults, urlChildren) };
    })
    .sort((a, b) => {
      // available + fitting first
      const av = (x: typeof a) => (x.left > 0 && x.fit ? 0 : 1);
      if (av(a) !== av(b)) return av(a) - av(b);
      return sort === "price" ? a.r.fromPrice - b.r.fromPrice : (b.r.sizeSqft ?? 0) - (a.r.sizeSqft ?? 0);
    });
  const availableCount = list.filter((x) => x.left > 0 && x.fit).length;

  const q = new URLSearchParams(params.toString()).toString();

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-10 pt-1 sm:px-6 md:pb-20 md:pt-10">
      {/* stay summary */}
      <button
        onClick={openSearch}
        className="sticky top-[calc(var(--header-h)+8px)] z-20 flex w-full items-center gap-3 rounded-2xl border border-line bg-surface/95 p-3 text-left shadow-card backdrop-blur active:scale-[0.99] md:hidden"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-action"><CalendarDays className="size-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{hasDates ? `${shortDate(urlIn)} – ${shortDate(urlOut)}` : "Add dates for prices"}</span>
          <span className="block text-sm text-muted">{guestLabel(urlAdults, urlChildren)}</span>
        </span>
        <Pencil className="size-4 text-muted" />
      </button>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 md:mt-0">
        <h2 className="text-[17px] font-bold md:text-2xl">
          {hasDates ? `${availableCount} of ${hotel.rooms.length} available` : `${hotel.rooms.length} ways to stay`}
          {hasDates && <span className="ml-2 text-base font-medium text-muted">· {dates.length} night{dates.length > 1 ? "s" : ""}</span>}
        </h2>
        <label className="flex items-center gap-2 text-sm text-muted">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as "price" | "size")} className="h-10 rounded-full border border-line bg-surface px-3 font-semibold text-ink">
            <option value="price">Lowest price</option>
            <option value="size">Largest</option>
          </select>
        </label>
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Room type">
        {kinds.map((k) => (
          <button
            key={k.id}
            role="tab"
            aria-selected={kind === k.id}
            onClick={() => setKind(k.id)}
            className={clsx(
              "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
              kind === k.id ? "border-action bg-action text-on-action" : "border-line bg-surface text-ink hover:border-brand-ring",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      {!hasDates && (
        <p className="mt-4 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-ink">
          <button onClick={openSearch} className="font-semibold text-action underline underline-offset-2">Add your dates</button> for live prices.
        </p>
      )}

      <ul className="mt-5 grid gap-4 md:gap-5 lg:grid-cols-2">
        {list.map(({ r, left, total, fit }, i) => {
          const href = `/hotel/${hotel.slug}/rooms/${r.slug}${q ? `?${q}` : ""}`;
          const unavailable = hasDates && (left === 0 || !fit);
          return (
            <li key={r.id}>
              <Reveal delay={Math.min(i, 4) * 0.06} className="h-full">
              <Link
                href={href}
                className={clsx(
                  "group flex h-full flex-row overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-[box-shadow,border-color,transform] hover:border-brand-ring hover:shadow-float active:scale-[0.99]",
                  unavailable && "opacity-70",
                )}
              >
                <div className="relative w-[36%] shrink-0 sm:w-[44%]">
                  <Image src={r.photos[0]} alt={r.name} fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  {hasDates && left > 0 && left <= 2 && fit && (
                    <span className="absolute left-3 top-3 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-action">Only {left} left</span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4 md:p-5">
                  <h3 className="text-[16px] font-bold leading-snug sm:text-lg">{r.name}</h3>
                  <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted sm:mt-3 sm:gap-x-4 sm:text-[13px]">
                    <li className="flex items-center gap-1.5"><Users className="size-4" /> {r.maxAdults}{r.maxChildren ? `+${r.maxChildren}` : ""}</li>
                    <li className="flex items-center gap-1.5"><BedDouble className="size-4" /> {r.bed}</li>
                    {r.sizeSqft && <li className="flex items-center gap-1.5"><Ruler className="size-4" /> {r.sizeSqft} sq ft</li>}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                    {unavailable ? (
                      <p className="text-sm font-semibold text-muted">{!fit ? `Fits up to ${r.maxAdults} adults` : "Not available for these dates"}</p>
                    ) : hasDates ? (
                      <p>
                        <span className="block text-xs text-muted">{dates.length} night{dates.length > 1 ? "s" : ""}, before tax</span>
                        <span className="text-[17px] font-bold tabular-nums sm:text-xl">{formatMoney(total)}</span>
                      </p>
                    ) : (
                      <p>
                        <span className="block text-xs text-muted">from</span>
                        <span className="text-[17px] font-bold tabular-nums sm:text-xl">{formatMoney(r.fromPrice)}</span>
                        <span className="text-sm text-muted"> / night</span>
                      </p>
                    )}
                    <span className="inline-flex h-9 shrink-0 items-center rounded-full bg-brand-soft px-3.5 text-[13px] font-semibold text-action sm:h-10 sm:px-4 sm:text-sm transition-colors group-hover:bg-action group-hover:text-on-action">
                      {unavailable ? "View" : "Select"}
                    </span>
                  </div>
                </div>
              </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
