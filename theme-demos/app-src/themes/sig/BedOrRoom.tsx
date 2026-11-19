"use client";
// COMMONS booking bar: "Bed (shared room)" vs "Private room" switch shows the right from-price, then the normal search.
import { useState } from "react";
import clsx from "clsx";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { SearchBar } from "@/components/booking/SearchBar";

export function BedOrRoom({ hotel, bedFrom, roomFrom }: { hotel: Hotel; bedFrom?: number; roomFrom?: number }) {
  const [kind, setKind] = useState<"bed" | "room">(bedFrom ? "bed" : "room");
  const from = kind === "bed" ? bedFrom : roomFrom;
  void hotel;
  return (
    <div className="mx-auto grid max-w-[1100px] border-2 border-[#0c0c14] bg-white shadow-[6px_6px_0_#0c0c14] lg:grid-cols-[170px_auto_1fr]">
      <p className="hidden items-center bg-[#D7F22B] px-5 font-[family-name:var(--font-heading)] text-[22px] uppercase leading-none text-[#0c0c14] lg:flex">Book your stay</p>
      <div role="radiogroup" aria-label="What are you booking?" className="flex items-center gap-4 border-b-2 border-[#0c0c14] px-4 py-3 lg:border-b-0 lg:border-r-2">
        {(["bed", "room"] as const).filter((k) => (k === "bed" ? bedFrom : roomFrom)).map((k) => (
          <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className="flex items-center gap-2 text-left">
            <span className={clsx("grid size-5 place-items-center rounded-full border-2 border-[#1F2BD8]")}>{kind === k && <span className="size-2.5 rounded-full bg-[#1F2BD8]" />}</span>
            <span><b className="block text-[14px] leading-tight">{k === "bed" ? "Bed" : "Private room"}</b><span className="text-[12px] text-muted">{k === "bed" ? "shared room" : "own space"}</span></span>
          </button>
        ))}
        {from ? <span className="ml-auto whitespace-nowrap bg-[#D7F22B] px-2 py-1 text-[12.5px] font-bold">from {formatMoney(from)}</span> : null}
      </div>
      <div className="min-w-0 p-1 [&_form]:!rounded-none [&_form]:!border-0 [&_form]:!shadow-none [&>button]:!rounded-none [&>button]:!shadow-none"><SearchBar /></div>
    </div>
  );
}
