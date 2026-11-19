"use client";
// The public website reads the same rules the HMS keeps (one home per setting):
//  • cancellation wording ← HMS Settings › Booking policies (free-cancel days, fee %), once the hotel has saved them
//  • payment options on checkout ← HMS Settings › Guest payments ("show on website" + account number)
// Before the hotel saves anything in the HMS, the hotel's published text and methods are used unchanged.
// Prototype: both live in this browser's storage. Production: the booking engine API returns them.
import { useEffect, useState } from "react";
import type { Hotel, PaymentMethod } from "./types";

type BkRules = { freeCancelDays: number; cancelFeePct: number };
type PayRow = { id: string; name: string; kind: string; account: string; enabled: boolean; onWebsite: boolean };

function read<T>(key: string): T | null { try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : null; } catch { return null; } }

export function cancelText(r: BkRules) {
  const when = r.freeCancelDays === 1 ? "24 hours" : `${r.freeCancelDays} days`;
  return `Free cancellation up to ${when} before check-in. After that, ${r.cancelFeePct}% of the first night is charged.`;
}

/** Filter the hotel's checkout methods by HMS Guest payments; use the HMS account number when one is saved. */
export function methodsFrom(h: Hotel, rows: PayRow[] | undefined, pol?: { websitePay?: "full" | "advance" | "hotel"; advancePct?: number }): PaymentMethod[] {
  const base = byRows(h, rows);
  if (!pol?.websitePay) return base;
  // HMS Settings › Booking policies › "Website bookings pay"
  const hasMfs = base.some((m) => m.kind === "mfs-manual");
  if (pol.websitePay === "hotel") { const at = base.filter((m) => m.kind === "pay-at-property"); return at.length ? at : base; }
  if (pol.websitePay === "full") { const out = base.filter((m) => m.kind === "mfs-manual" || m.kind === "card-online"); return out.length ? out : base; }
  const pct = Math.min(100, Math.max(1, pol.advancePct ?? 30));
  const out = base.filter((m) => m.kind !== "pay-at-property" && m.kind !== "advance");
  return hasMfs ? [{ kind: "advance", percent: pct }, ...out] : base;
}
function byRows(h: Hotel, rows: PayRow[] | undefined): PaymentMethod[] {
  if (!rows) return h.payments;
  const on = (id: string) => rows.find((r) => r.id === id);
  const cash = on("cash");
  return h.payments.flatMap((m): PaymentMethod[] => {
    if (m.kind === "pay-at-property") return cash && !cash.enabled ? [] : [m];
    if (m.kind === "mfs-manual") { const r = on(m.provider.toLowerCase()); if (r && (!r.enabled || !r.onWebsite)) return []; return [{ ...m, number: r?.account.trim() || m.number }]; }
    if (m.kind === "advance") { const any = h.payments.some((x) => x.kind === "mfs-manual" && (() => { const r = on(x.provider.toLowerCase()); return !r || (r.enabled && r.onWebsite); })()); return any ? [m] : []; }
    if (m.kind === "card-online") { const r = on("gw"); return r && !r.enabled ? [{ ...m, gatewayApproved: false }] : [m]; }
    return [m];
  });
}

export function useSiteRules(h: Hotel) {
  const [v, setV] = useState<{ cancel: string; methods: PaymentMethod[]; freeDays: number | null }>({ cancel: h.policies.cancellation, methods: h.payments, freeDays: null });
  useEffect(() => {
    const load = () => {
      const bk = read<{ settings?: BkRules }>(`bingi-bookings-v1-${h.slug}`);
      const st = read<{ payments?: PayRow[]; policy?: { websitePay?: "full" | "advance" | "hotel"; advancePct?: number } }>(`bingi.settings.v1.${h.slug}`);
      setV({ cancel: bk?.settings ? cancelText(bk.settings) : h.policies.cancellation, methods: methodsFrom(h, st?.payments, st?.policy), freeDays: bk?.settings ? bk.settings.freeCancelDays : null });
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, [h]);
  return v;
}
