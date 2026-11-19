"use client";
// Policy lines on the public site that follow the HMS rules (see src/lib/site-rules.ts).
import { DraftText } from "@/components/site-draft/Draft";
import { useSiteRules } from "@/lib/site-rules";
import type { Hotel } from "@/lib/types";

/** Website Management wording wins; otherwise the wording made from HMS Booking policies. */
export function CancelPolicy({ hotel }: { hotel: Hotel }) {
  const r = useSiteRules(hotel);
  return <DraftText slug={hotel.slug} k="policy.cancellation" fallback={r.cancel} />;
}
export function AcceptedPayments({ hotel }: { hotel: Hotel }) {
  const r = useSiteRules(hotel);
  const pay = r.methods.map((p) => (p.kind === "pay-at-property" ? "Pay at the hotel (cash or card)" : p.kind === "mfs-manual" ? `${p.provider} (send money)` : p.kind === "advance" ? `${p.percent}% advance` : p.gatewayApproved ? "Card / online" : null)).filter(Boolean);
  return <>Accepted: {pay.join(" · ")}.</>;
}
/** Short line for the home facts strip: follows HMS Booking policies once saved. */
export function CancelShort({ hotel, fallback }: { hotel: Hotel; fallback: string }) {
  const r = useSiteRules(hotel);
  if (r.freeDays === null) return <>{fallback}</>;
  return <>Up to {r.freeDays === 1 ? "24 hours" : `${r.freeDays} days`} before arrival</>;
}
