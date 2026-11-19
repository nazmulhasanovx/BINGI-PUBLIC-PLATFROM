"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarPlus, CheckCircle2, Clock, MessageCircle } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { useGuestState, type GuestBooking } from "@/lib/store";
import { PriceLines, StayHeader, paidLabelFor } from "./StaySummary";
import { ButtonLink } from "@/components/ui/Button";

export const BOOKING_STATUS: Record<GuestBooking["bookingStatus"], { label: string; cls: string }> = {
  pending: { label: "Waiting for confirmation", cls: "bg-amber-50 text-amber-800" },
  confirmed: { label: "Confirmed", cls: "bg-emerald-50 text-emerald-800" },
  cancelled: { label: "Cancelled", cls: "bg-line text-muted" },
};
export const PAYMENT_STATUS: Record<GuestBooking["paymentStatus"], { label: string; cls: string }> = {
  unpaid: { label: "Unpaid", cls: "bg-line text-muted" },
  "pay-at-hotel": { label: "Pay on arrival", cls: "bg-sky-50 text-sky-800" },
  "advance-submitted": { label: "Payment sent · being checked", cls: "bg-amber-50 text-amber-800" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-800" },
};

export function icsFor(hotel: Hotel, b: GuestBooking) {
  const d = (iso: string) => iso.replace(/-/g, "");
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//BinGi//Hotel Website//EN", "BEGIN:VEVENT",
    `UID:${b.id}@bingi.app`, `DTSTART;VALUE=DATE:${d(b.stay.checkIn)}`, `DTEND;VALUE=DATE:${d(b.stay.checkOut)}`,
    `SUMMARY:Stay at ${hotel.name}`, `LOCATION:${hotel.address}`, `DESCRIPTION:Booking ${b.id}. Check-in ${hotel.checkIn}.`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

export function Confirmation({ hotel }: { hotel: Hotel }) {
  const params = useSearchParams();
  const { bookings, ready } = useGuestState(hotel.slug);
  const base = `/hotel/${hotel.slug}`;
  const b = bookings.find((x) => x.id === params.get("id"));

  if (!ready) return <ListSkeleton rows={1} />;
  if (!b)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Booking not found on this device</h1>
        <p className="mt-2 text-muted">Sign in to My Trip with the mobile number you booked with.</p>
        <ButtonLink href={`${base}/my-trip`} className="mt-6">Open My Trip</ButtonLink>
      </div>
    );

  const wa = hotel.whatsapp ? `https://wa.me/${hotel.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, my booking reference is ${b.id}.`)}` : null;

  return (
    <div className="mx-auto max-w-[760px] px-4 pb-20 pt-8 sm:px-6 md:pt-14">
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-soft text-action"><CheckCircle2 className="size-8" /></span>
        <h1 className="mt-4 text-[28px] font-bold md:text-4xl">Booking request sent</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          {hotel.name} will confirm by SMS to {b.guest.phone}. Keep your reference handy.
        </p>
        <p className="mt-5 inline-flex flex-col items-center rounded-2xl border border-dashed border-brand-ring bg-surface px-6 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Booking reference</span>
          <span className="font-heading text-2xl font-bold tracking-wide">{b.id}</span>
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <span className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${BOOKING_STATUS[b.bookingStatus].cls}`}>Booking: {BOOKING_STATUS[b.bookingStatus].label}</span>
        <span className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${PAYMENT_STATUS[b.paymentStatus].cls}`}>Payment: {PAYMENT_STATUS[b.paymentStatus].label}</span>
      </div>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-5 shadow-card">
        <StayHeader hotel={hotel} stay={b.stay} />
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-canvas px-4 py-3 text-[14px]">
          <Clock className="size-4 text-muted" /> Check-in from {hotel.checkIn} · check-out by {hotel.checkOut}
        </p>
        <div className="mt-4 border-t border-line pt-4">
          <PriceLines q={b.quote} dueNow={b.payment.dueNow} paidLabel={paidLabelFor(b.payment.method, b.payment.provider)} />
        </div>
        {b.payment.reference && <p className="mt-3 text-[13px] text-muted">Transaction ID: <b className="text-ink">{b.payment.reference}</b></p>}
      </section>

      <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
        <a href={icsFor(hotel, b)} download={`${b.id}.ics`} className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface font-semibold hover:border-brand-ring">
          <CalendarPlus className="size-[18px]" /> Add to calendar
        </a>
        {wa && (
          <a href={wa} className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface font-semibold hover:border-brand-ring">
            <MessageCircle className="size-[18px]" /> WhatsApp hotel
          </a>
        )}
        <Link href={`${base}/my-trip`} className="flex h-12 items-center justify-center rounded-full bg-action font-semibold text-on-action">Go to My Trip</Link>
      </div>
      <p className="mt-6 text-center text-[12px] text-muted">Preview build: this booking is saved in this browser only and is not sent to a hotel. Total {formatMoney(b.quote.total)}.</p>
    </div>
  );
}
