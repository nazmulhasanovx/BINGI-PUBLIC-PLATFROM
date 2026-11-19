import { MapPin, Phone, Star } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { LangToggle } from "@/lib/i18n";

/** Desktop only: small info line above the header. */
export function TopBar({ hotel }: { hotel: Hotel }) {
  return (
    <div className="hidden border-b border-line bg-surface lg:block">
      <div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between px-6 text-[13px] text-muted">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5" /> {hotel.area}, {hotel.city}
        </span>
        <span className="flex items-center gap-3">
          {!!hotel.stars && (
            <span className="flex items-center gap-0.5 text-brand" role="img" aria-label={`${hotel.stars} star`}>
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} className="size-3 fill-current" />
              ))}
            </span>
          )}
          <span className="text-ink">{hotel.type}</span>
        </span>
        <span className="flex items-center gap-3">
          <a href={`tel:${hotel.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-1.5 hover:text-ink">
            <Phone className="size-3.5" /> {hotel.phone}
          </a>
          <LangToggle />
        </span>
      </div>
    </div>
  );
}
