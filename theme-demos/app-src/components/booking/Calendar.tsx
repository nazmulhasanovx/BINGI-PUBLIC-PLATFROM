"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { localISO } from "@/lib/pricing";

export interface Range {
  checkIn: string;
  checkOut: string;
}

const WD = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function compactPrice(v: number) {
  if (v >= 1000) {
    const k = v / 1000;
    return `${k >= 100 ? Math.round(k) : Math.round(k * 10) / 10}k`;
  }
  return String(v);
}

function monthStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/**
 * Range calendar with a nightly price under every date.
 * priceFor(iso) → number (from price for that night) | null (sold out) | undefined (no data).
 * A stay can't include a sold-out night; check-out may fall on one.
 */
export function Calendar({
  value,
  onChange,
  priceFor,
  months = 2,
  onDone,
}: {
  value: Range;
  onChange: (r: Range) => void;
  priceFor: (iso: string) => number | null | undefined;
  months?: 1 | 2;
  onDone?: () => void;
}) {
  const [today] = useState(() => localISO(new Date()));
  const [view, setView] = useState(() => monthStart(value.checkIn ? new Date(value.checkIn + "T00:00:00") : new Date()));
  const [hover, setHover] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const minMonth = monthStart(new Date());
  const maxMonth = addMonths(minMonth, 12);

  const pick = (iso: string) => {
    setMsg("");
    const { checkIn, checkOut } = value;
    if (!checkIn || checkOut || iso <= checkIn) {
      if (priceFor(iso) === null) return setMsg("That night is sold out — pick another check-in date.");
      onChange({ checkIn: iso, checkOut: "" });
      return;
    }
    // validate every night between check-in and the chosen check-out
    const d = new Date(checkIn + "T00:00:00");
    while (localISO(d) < iso) {
      if (priceFor(localISO(d)) === null) {
        setMsg("A night in this range is sold out. Choose a shorter stay or other dates.");
        return;
      }
      d.setDate(d.getDate() + 1);
    }
    onChange({ checkIn, checkOut: iso });
  };

  const end = value.checkOut || (value.checkIn && hover && hover > value.checkIn ? hover : "");
  const nights = value.checkIn && value.checkOut ? Math.round((+new Date(value.checkOut) - +new Date(value.checkIn)) / 86400000) : 0;

  return (
    <div className="select-none">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={view <= minMonth}
          onClick={() => setView((v) => addMonths(v, -1))}
          className="grid size-10 place-items-center rounded-full hover:bg-canvas disabled:opacity-25"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-[15px] font-semibold text-muted">
          {value.checkIn ? (nights ? `${nights} night${nights > 1 ? "s" : ""}` : "Now pick check-out") : "Pick check-in"}
        </p>
        <button
          type="button"
          aria-label="Next month"
          disabled={addMonths(view, months - 1) >= maxMonth}
          onClick={() => setView((v) => addMonths(v, 1))}
          className="grid size-10 place-items-center rounded-full hover:bg-canvas disabled:opacity-25"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className={clsx("mt-2 grid gap-6", months === 2 && "md:grid-cols-2 md:gap-8")}>
        {Array.from({ length: months }).map((_, k) => {
          const m = addMonths(view, k);
          const first = m.getDay();
          const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
          const cells: (string | null)[] = [...Array(first).fill(null)];
          for (let d = 1; d <= days; d++) cells.push(localISO(new Date(m.getFullYear(), m.getMonth(), d)));
          return (
            <div key={k} className={clsx(k === 1 && "hidden md:block")}>
              <p className="mb-2 text-center text-[16px] font-bold">{m.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
              <div className="grid grid-cols-7 text-center text-[12px] font-semibold text-muted">
                {WD.map((w) => (
                  <span key={w} className="py-1.5">{w}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1" role="grid" onMouseLeave={() => setHover(null)}>
                {cells.map((iso, i) => {
                  if (!iso) return <span key={`e${i}`} />;
                  const past = iso < today;
                  const p = past ? undefined : priceFor(iso);
                  const sold = p === null;
                  const isStart = iso === value.checkIn;
                  const isEnd = iso === end && !!end;
                  const inRange = !!value.checkIn && !!end && iso > value.checkIn && iso < end;
                  const day = Number(iso.slice(8));
                  return (
                    <div key={iso} className={clsx("relative", (inRange || (isStart && end) || (isEnd && value.checkIn)) && "bg-brand-soft", isStart && end && "rounded-l-2xl", isEnd && "rounded-r-2xl")}>
                      <button
                        type="button"
                        disabled={past}
                        onClick={() => pick(iso)}
                        onMouseEnter={() => setHover(iso)}
                        aria-label={`${iso}${typeof p === "number" ? `, from ${p} taka` : sold ? ", sold out" : ""}`}
                        aria-pressed={isStart || isEnd}
                        className={clsx(
                          "relative flex h-14 w-full flex-col items-center justify-center rounded-2xl transition-colors md:h-[60px]",
                          past && "cursor-default text-line",
                          !past && !isStart && !isEnd && "hover:bg-canvas",
                          (isStart || isEnd) && "bg-action text-on-action shadow-[0_6px_16px_-8px_var(--action)]",
                          sold && !isStart && !isEnd && "text-muted",
                        )}
                      >
                        <span className={clsx("text-[15px] font-semibold leading-none", sold && "line-through decoration-1")}>{day}</span>
                        {!past && (
                          <span className={clsx("mt-1 text-[10.5px] leading-none tabular-nums md:text-[11px]", isStart || isEnd ? "text-on-action/90" : sold ? "text-muted" : "text-emerald-700")}>
                            {sold ? "full" : typeof p === "number" ? `৳${compactPrice(p)}` : ""}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {msg && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-800">{msg}</p>}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <p className="text-[12px] text-muted">Prices per night, before tax</p>
        <div className="flex gap-2">
          {(value.checkIn || value.checkOut) && (
            <button type="button" onClick={() => onChange({ checkIn: "", checkOut: "" })} className="h-10 rounded-full px-4 text-sm font-semibold text-muted hover:bg-canvas">
              Clear
            </button>
          )}
          {onDone && (
            <button type="button" onClick={onDone} disabled={!!value.checkIn && !value.checkOut} className="h-10 rounded-full bg-action px-5 text-sm font-semibold text-on-action disabled:opacity-40">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
