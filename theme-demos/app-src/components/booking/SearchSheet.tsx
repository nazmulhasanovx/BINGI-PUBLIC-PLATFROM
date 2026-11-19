"use client";

import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";
import { nights, shortDate, useBooking } from "./BookingProvider";
import { GuestSteppers } from "./SearchFields";
import { Calendar } from "./Calendar";
import { useT } from "@/lib/i18n";

export function SearchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { search, setSearch, submit, priceFor } = useBooking();
  const n = nights(search);
  const t = useT();
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t("Your stay")}
      footer={
        <Button size="lg" className="w-full" onClick={submit}>
          <Search className="size-5" /> {n ? `${t("See rooms")} · ${n} night${n > 1 ? "s" : ""}` : t("See rooms")}
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-canvas p-3 text-[14px]">
        <p><span className="block text-xs font-semibold text-muted">Check-in</span><b>{search.checkIn ? shortDate(search.checkIn) : "—"}</b></p>
        <p><span className="block text-xs font-semibold text-muted">Check-out</span><b>{search.checkOut ? shortDate(search.checkOut) : "—"}</b></p>
      </div>
      <div className="mt-3">
        <Calendar months={1} value={{ checkIn: search.checkIn, checkOut: search.checkOut }} onChange={setSearch} priceFor={priceFor} />
      </div>
      <div className="mt-4 rounded-3xl border border-line px-4">
        <GuestSteppers />
      </div>
    </Sheet>
  );
}
