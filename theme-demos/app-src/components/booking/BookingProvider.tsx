"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SearchSheet } from "./SearchSheet";
import type { Hotel } from "@/lib/types";
import { fits, nightlyRate, unitsLeft } from "@/lib/pricing";

export interface StaySearch {
  checkIn: string; // yyyy-mm-dd
  checkOut: string;
  adults: number;
  children: number;
}

interface Ctx {
  slug: string;
  search: StaySearch;
  setSearch: (s: Partial<StaySearch>) => void;
  openSearch: () => void;
  submit: () => void;
  maxAdults: number;
  maxChildren: number;
  /** Lowest nightly price that night for the current guests; null = nothing free. */
  priceFor: (iso: string) => number | null;
}

const BookingCtx = createContext<Ctx | null>(null);

export function useBooking() {
  const c = useContext(BookingCtx);
  if (!c) throw new Error("useBooking outside BookingProvider");
  return c;
}

export function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toISO(d);
}
export function toISO(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
export function nights(s: StaySearch) {
  if (!s.checkIn || !s.checkOut) return 0;
  return Math.max(0, Math.round((+new Date(s.checkOut) - +new Date(s.checkIn)) / 86400000));
}
export function shortDate(iso: string) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function BookingProvider({
  hotel,
  children,
}: {
  hotel: Hotel;
  children: ReactNode;
}) {
  const slug = hotel.slug;
  const maxAdults = Math.max(...hotel.rooms.map((r) => r.maxAdults)) * 2;
  const maxChildren = Math.max(...hotel.rooms.map((r) => r.maxChildren)) * 2;
  const router = useRouter();
  const [search, setState] = useState<StaySearch>({ checkIn: "", checkOut: "", adults: 2, children: 0 });
  const [open, setOpen] = useState(false);

  const setSearch = useCallback((s: Partial<StaySearch>) => {
    setState((prev) => {
      const next = { ...prev, ...s };
      if (next.checkIn && next.checkOut && next.checkOut <= next.checkIn) next.checkOut = "";
      return next;
    });
  }, []);

  const submit = useCallback(() => {
    const q = new URLSearchParams();
    if (search.checkIn) {
      q.set("in", search.checkIn);
      q.set("out", search.checkOut || addDays(search.checkIn, 1));
    }
    q.set("adults", String(search.adults));
    if (search.children) q.set("children", String(search.children));
    setOpen(false);
    router.push(`/hotel/${slug}/rooms?${q.toString()}`);
  }, [router, search, slug]);

  const priceFor = useCallback(
    (iso: string) => {
      const free = hotel.rooms.filter((r) => fits(r, search.adults, search.children) && unitsLeft(r, [iso]) > 0);
      return free.length ? Math.min(...free.map((r) => nightlyRate(r, iso))) : null;
    },
    [hotel.rooms, search.adults, search.children],
  );

  const value = useMemo<Ctx>(
    () => ({ slug, search, setSearch, openSearch: () => setOpen(true), submit, maxAdults, maxChildren, priceFor }),
    [slug, search, setSearch, submit, maxAdults, maxChildren, priceFor],
  );

  return (
    <BookingCtx.Provider value={value}>
      {children}
      <SearchSheet open={open} onClose={() => setOpen(false)} />
    </BookingCtx.Provider>
  );
}
