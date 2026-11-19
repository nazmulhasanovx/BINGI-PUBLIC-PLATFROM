// Small helpers shared by the newer master themes (COTTAGE, VILLA, FLAT, ESCAPE, BUNK).
// Each theme keeps its own layout; these only remove repeated plumbing.
import Image from "next/image";
import type { Hotel, RoomCategory } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { PhotoIn } from "@/components/motion/Reveal";
import { T } from "@/lib/i18n";

export const waLink = (h: Hotel, text: string) =>
  h.whatsapp ? `https://wa.me/${h.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}` : `tel:${h.phone.replace(/[^+\d]/g, "")}`;

export const telLink = (h: Hotel) => `tel:${h.phone.replace(/[^+\d]/g, "")}`;

export const mapsLink = (h: Hotel) => h.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${h.name}, ${h.address}`)}`;

/** Gallery photo whose file name matches, else a fallback. Keeps themes data-driven without new fields. */
export const photo = (h: Hotel, re: RegExp, fallback = h.heroPhoto) => h.gallery.find((g) => re.test(g)) ?? fallback;

/** Phone: the app-style photo card at the top of every home. */
export function PhoneHeroCard({ hotel, radius = 24 }: { hotel: Hotel; radius?: number }) {
  return (
    <div className="relative mx-3 mt-2 h-[clamp(250px,40svh,360px)] overflow-hidden md:hidden" style={{ borderRadius: radius }}>
      <PhotoIn className="absolute inset-0">
        <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" quality={85} className="object-cover" />
      </PhotoIn>
    </div>
  );
}

/** "From ৳X / night" (or "/ bed / night" for dorm beds). */
export function FromPrice({ room, className }: { room: RoomCategory; className?: string }) {
  return (
    <span className={className}>
      <span className="text-muted"><T>From</T> </span>
      <b className="tabular-nums">{formatMoney(room.fromPrice)}</b>
      <span className="text-muted"> <T>{room.kind === "dorm" ? "/ bed / night" : "/ night"}</T></span>
    </span>
  );
}

export const guests = (r: RoomCategory) => `${r.maxAdults + r.maxChildren} guests`;
