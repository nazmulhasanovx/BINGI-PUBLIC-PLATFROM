"use client";
// RESIDE booking bar with a Nightly / Monthly switch. Monthly shows an estimate and sends guests to the long-stay page.
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { SearchBar } from "@/components/booking/SearchBar";

export function StayMode({ hotel, monthlyFrom, pct }: { hotel: Hotel; monthlyFrom: number; pct: number }) {
  const [mode, setMode] = useState<"night" | "month">("night");
  return (
    <div className="mx-auto max-w-[1040px] rounded-[6px] bg-surface p-3 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.45)] md:flex md:items-center md:gap-3">
      <div role="radiogroup" aria-label="Stay length" className="mb-3 inline-flex shrink-0 overflow-hidden rounded-[4px] border border-line md:mb-0">
        {(["night", "month"] as const).map((m) => (
          <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={clsx("h-11 px-4 text-[14px] font-semibold", mode === m ? "bg-[#1e1b18] text-white" : "text-ink hover:bg-canvas")}>{m === "night" ? "Nightly" : "Monthly"}</button>
        ))}
      </div>
      {mode === "night" ? (
        <div className="min-w-0 flex-1 [&_form]:!border-0 [&_form]:!shadow-none [&>button]:!shadow-none"><SearchBar /></div>
      ) : (
        <div className="flex flex-1 flex-wrap items-center justify-between gap-3 px-2">
          <p className="text-[15px]">Monthly from about <b className="tabular-nums">{formatMoney(monthlyFrom)}</b> <span className="text-muted">/ month · estimate{pct ? ` · ${pct}% long-stay rate` : ""}</span></p>
          <Link href={`/hotel/${hotel.slug}/long-stay`} className="lux-btn !h-11">Get a monthly quote <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
      )}
    </div>
  );
}
