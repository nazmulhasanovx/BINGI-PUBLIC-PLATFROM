"use client";

import { Printer } from "lucide-react";
import type { Hotel } from "@/lib/types";
import type { GuestBooking } from "@/lib/store";
import { formatMoney } from "@/lib/data";
import { shortDate } from "@/components/booking/BookingProvider";
import { paidLabelFor } from "@/components/stay/StaySummary";
import { PAYMENT_STATUS } from "@/components/stay/Confirmation";

/**
 * Guest bill. Until check-out it is a booking bill (pro-forma);
 * the final tax invoice is issued by the hotel from HMS at check-out.
 */
export function InvoiceDoc({ hotel, b }: { hotel: Hotel; b: GuestBooking }) {
  const q = b.quote;
  const room = hotel.rooms.find((r) => r.slug === b.stay.roomSlug);
  const items = q.lines.filter((l) => l.kind !== "tax" && l.kind !== "discount");
  const discounts = q.lines.filter((l) => l.kind === "discount");
  const taxes = q.lines.filter((l) => l.kind === "tax");
  const paid = b.bookingStatus === "cancelled" ? 0 : b.payment.dueNow;
  const balance = b.bookingStatus === "cancelled" ? 0 : q.total - paid;
  const subtotal = q.subtotal ?? q.total - q.serviceCharge - q.vat;

  return (
    <div className="invoice-print">
      <div className="rounded-2xl border border-line bg-surface p-4 text-[14px] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="font-heading text-lg font-bold">{hotel.name}</p>
            <p className="text-[13px] text-muted">{hotel.address}</p>
            <p className="text-[13px] text-muted">{hotel.phone} · {hotel.email}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Booking bill</p>
            <p className="font-semibold">{b.id.replace("WBK", "BILL")}</p>
            <p className="text-[13px] text-muted">{new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>

        <div className="grid gap-3 border-b border-line py-4 sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Guest</p>
            <p className="font-semibold">{b.guest.name}</p>
            <p className="text-muted">{b.guest.phone}{b.guest.email ? ` · ${b.guest.email}` : ""}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Stay</p>
            <p className="font-semibold">{room?.name}</p>
            <p className="text-muted">{shortDate(b.stay.checkIn)} – {shortDate(b.stay.checkOut)} · {q.nights} night{q.nights > 1 ? "s" : ""} · ref {b.id}</p>
          </div>
        </div>

        <table className="mt-3 w-full text-left">
          <thead>
            <tr className="text-[12px] uppercase tracking-wider text-muted">
              <th className="py-2 font-semibold">Item</th>
              <th className="hidden py-2 text-right font-semibold sm:table-cell">Qty</th>
              <th className="hidden py-2 text-right font-semibold sm:table-cell">Rate</th>
              <th className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((l) => (
              <tr key={l.label}>
                <td className="py-2 pr-3">{l.label}</td>
                <td className="hidden py-2 text-right tabular-nums sm:table-cell">{l.qty ?? 1}</td>
                <td className="hidden py-2 text-right tabular-nums sm:table-cell">{formatMoney(l.unit ?? l.amount)}</td>
                <td className="py-2 text-right tabular-nums">{formatMoney(l.amount)}</td>
              </tr>
            ))}
            {discounts.map((l) => (
              <tr key={l.label} className="text-emerald-700">
                <td className="py-2 pr-3" colSpan={1}>{l.label}</td>
                <td className="hidden sm:table-cell" />
                <td className="hidden sm:table-cell" />
                <td className="py-2 text-right tabular-nums">−{formatMoney(Math.abs(l.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-3 max-w-xs space-y-1.5 border-t border-line pt-3">
          <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(subtotal)}</dd></div>
          {taxes.map((l) => (
            <div key={l.label} className="flex justify-between text-muted"><dt>{l.label}</dt><dd className="tabular-nums">{formatMoney(l.amount)}</dd></div>
          ))}
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{formatMoney(q.total)}</dd></div>
          <div className="flex justify-between"><dt>{paidLabelFor(b.payment.method, b.payment.provider)}</dt><dd className="tabular-nums">{formatMoney(paid)}</dd></div>
          <div className="flex justify-between rounded-lg bg-brand-soft px-2 py-1.5 font-semibold text-action"><dt>Balance due</dt><dd className="tabular-nums">{formatMoney(balance)}</dd></div>
        </dl>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[12px] text-muted">
          <span>Payment: {PAYMENT_STATUS[b.paymentStatus].label}{b.payment.reference ? ` · TrxID ${b.payment.reference}` : ""}</span>
          <span>Final tax invoice is issued at check-out.</span>
        </div>
      </div>
      <button onClick={() => { try { window.print(); } catch {} }} className="no-print mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line font-semibold hover:border-brand-ring">
        <Printer className="size-4" /> Print / save as PDF
      </button>
    </div>
  );
}
