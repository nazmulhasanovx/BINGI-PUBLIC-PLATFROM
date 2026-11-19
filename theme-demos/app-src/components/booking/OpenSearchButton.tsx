"use client";

import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBooking } from "./BookingProvider";
import { T } from "@/lib/i18n";

/** Tablet/desktop with an inline search bar on the page → focus it. Otherwise open the sheet. */
export function OpenSearchButton({ label = "Book your stay" }: { label?: string }) {
  const { openSearch } = useBooking();
  const go = () => {
    const bar = document.getElementById("stay-search");
    const first = bar?.querySelector("button");
    if (bar && first && bar.offsetParent !== null) {
      first.click(); // opens the price calendar under the bar
      return;
    }
    openSearch();
  };
  return (
    <Button size="lg" onClick={go}>
      <CalendarDays className="size-5" /> <T>{label}</T>
    </Button>
  );
}
