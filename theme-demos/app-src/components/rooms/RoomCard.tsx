import Image from "next/image";
import Link from "next/link";
import { BedDouble, Ruler, Users } from "lucide-react";
import type { RoomCategory } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { T } from "@/lib/i18n";

const kindLabel: Record<RoomCategory["kind"], string> = { room: "Room", suite: "Suite", villa: "Villa", cottage: "Cottage", apartment: "Apartment", dorm: "Dorm bed" };

/** Whole card opens the room page; one CTA. Vertical on phone, horizontal from lg in wide layouts. */
export function RoomCard({ room, href, layout = "auto" }: { room: RoomCategory; href: string; layout?: "auto" | "vertical" }) {
  const horizontal = layout === "auto";
  return (
    <Link
      href={href}
      className={
        "group flex h-full overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand-ring hover:shadow-float " +
        (horizontal ? "flex-col xl:flex-row" : "flex-col")
      }
    >
      <div className={"relative overflow-hidden " + (horizontal ? "aspect-[16/10] xl:aspect-auto xl:w-[46%]" : "aspect-[16/10]")}>
        <Image
          src={room.photos[0]}
          alt={room.name}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 360px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">{kindLabel[room.kind]}</span>
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="text-lg font-bold leading-snug">{room.name}</h3>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted">
          <li className="flex items-center gap-1.5"><Users className="size-4" /> {room.maxAdults} adults</li>
          <li className="flex items-center gap-1.5"><BedDouble className="size-4" /> {room.bed}</li>
          {room.sizeSqft && <li className="flex items-center gap-1.5"><Ruler className="size-4" /> {room.sizeSqft} sq ft</li>}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p>
            <span className="block text-xs text-muted"><T>from</T></span>
            <span className="text-xl font-bold tabular-nums">{formatMoney(room.fromPrice)}</span>
            <span className="text-sm text-muted"> <T>{room.kind === "dorm" ? "/ bed / night" : "/ night"}</T></span>
          </p>
          <span className="inline-flex h-10 items-center rounded-full bg-brand-soft px-4 text-sm font-semibold text-action transition-colors group-hover:bg-action group-hover:text-on-action">
            <T>Select</T>
          </span>
        </div>
      </div>
    </Link>
  );
}
