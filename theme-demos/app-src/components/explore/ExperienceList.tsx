"use client";
import { useSiteView } from "@/lib/site";

import Image from "next/image";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Hotel, ServiceItem } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { useGuestState } from "@/lib/store";
import { useBooking } from "@/components/booking/BookingProvider";
import { useToast } from "@/components/ui/Toast";
import { Chips } from "./Chips";
import { Reveal } from "@/components/motion/Reveal";

const CAT: Record<ServiceItem["category"], string> = {
  spa: "Spa & wellness",
  transfer: "Transfers",
  dining: "Dining",
  celebration: "Celebrations",
  activity: "Activities",
  stay: "Stay",
};

/** "Add to stay" works only when a room is already selected — extras always belong to a stay. */
export function ExperienceList({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  const { cart, setExtra } = useGuestState(hotel.slug);
  const { openSearch } = useBooking();
  const toast = useToast();
  const doc = useSiteView(hotel.slug);
  const list = hotel.services.filter((s) => s.photo && doc?.services[s.id]?.visible !== false);
  const cats = Array.from(new Set(list.map((s) => s.category)));
  const [cat, setCat] = useState<string>("all");

  const add = (s: ServiceItem) => {
    if (!cart.stay) {
      toast.show({ text: "Pick your dates and a room first — extras are added to a stay.", tone: "info" });
      openSearch();
      return;
    }
    const n = cart.extras.find((e) => e.serviceId === s.id)?.qty ?? 0;
    setExtra(s.id, n + 1);
    toast.show({ text: `${s.name} added to your stay`, action: { href: `${base}/stay`, label: "View stay" } });
  };

  return (
    <>
      <Chips label="Category" items={[{ id: "all", label: "All" }, ...cats.map((c) => ({ id: c, label: CAT[c] }))]} value={cat} onChange={setCat} />
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {list
          .filter((s) => cat === "all" || s.category === cat)
          .map((s, i) => {
            const inStay = cart.extras.some((e) => e.serviceId === s.id);
            return (
              <li key={s.id}>
              <Reveal delay={Math.min(i, 5) * 0.06} className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
                <div className="relative aspect-[16/10]">
                  <Image src={s.photo!} alt={s.name} fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold">{CAT[s.category]}</span>
                </div>
                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <h3 className="text-lg font-bold">{s.name}</h3>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <p>
                      <span className="text-xl font-bold tabular-nums">{formatMoney(s.price)}</span>
                      <span className="text-sm text-muted"> {s.unit}</span>
                    </p>
                    <button
                      onClick={() => add(s)}
                      className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${inStay ? "bg-action text-on-action" : "bg-brand-soft text-action hover:bg-brand-soft-2"}`}
                    >
                      {inStay ? <Check className="size-4" /> : <Plus className="size-4" />} {inStay ? "In your stay" : "Add to stay"}
                    </button>
                  </div>
                </div>
              </Reveal>
              </li>
            );
          })}
      </ul>
      {toast.node}
    </>
  );
}
