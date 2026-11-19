"use client";
// Shown on the public site when Website Management › Online On/Off has paused website booking.
import { PhoneCall } from "lucide-react";
import { useOnline } from "@/lib/site";
import type { Hotel } from "@/lib/types";

export function useBookingPaused(slug: string) { const o = useOnline(slug); return o ? !o.booking : false; }

export function BookingPausedBar({ hotel }: { hotel: Hotel }) {
  if (!useBookingPaused(hotel.slug)) return null;
  return (
    <div role="status" className="relative z-[60] bg-[#0f1720] px-4 py-2 text-center text-[14px] text-white">
      Online booking is paused right now.{hotel.phone ? <> Call <a href={`tel:${hotel.phone.replace(/\s/g, "")}`} className="whitespace-nowrap font-semibold underline underline-offset-2">{hotel.phone}</a> to book.</> : " Please contact the hotel to book."}
    </div>
  );
}

export function BookingPausedCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="mx-auto my-16 max-w-[520px] rounded-[20px] border border-line bg-surface p-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft"><PhoneCall className="size-5" aria-hidden /></span>
      <h1 className="mt-4 text-[22px] font-semibold">Online booking is paused</h1>
      <p className="mt-2 text-[15px] text-muted">{hotel.name} is not taking new bookings online right now. Your existing booking is not affected.</p>
      {hotel.phone && <a href={`tel:${hotel.phone.replace(/\s/g, "")}`} className="mt-5 inline-flex h-11 items-center rounded-full bg-action px-6 text-[15px] font-semibold text-on-action">Call {hotel.phone}</a>}
    </div>
  );
}
