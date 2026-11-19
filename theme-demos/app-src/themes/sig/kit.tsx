// Signature Collection — small shared pieces. Each theme's Home owns its layout (1:1 with Nazmul's designs).
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";
import { ArrowRight, ArrowUpRight, BedDouble, MessageCircle, Navigation, Phone, Users } from "lucide-react";
import { mapsLink, telLink, waLink } from "../shared";
import type { Hotel, RoomCategory } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { SearchBar } from "@/components/booking/SearchBar";
import { HeroIn, PhotoIn, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { DraftText, SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";

export const href = (h: Hotel, p = "") => `/hotel/${h.slug}${p}`;
export const roomLink = (h: Hotel, r: RoomCategory) => href(h, `/rooms/${r.slug}`);
export const price = (n: number) => (n > 0 ? formatMoney(n) : "Free");

export function W({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("mx-auto w-full max-w-[1240px] px-4 sm:px-6", className)}>{children}</div>;
}

export function Kick({ children, className, rule = true }: { children: string; className?: string; rule?: boolean }) {
  return (
    <p className={clsx("sig-caps flex items-center gap-3 text-[color:var(--lux-accent-ink)]", className)}>
      <T>{children}</T>{rule && <span aria-hidden className="h-px w-10 bg-current" />}
    </p>
  );
}

/** Display heading, editable from Website Management. */
export function H({ hotel, k, fallback, as = "h2", className }: { hotel: Hotel; k: string; fallback: string; as?: "h1" | "h2"; className?: string }) {
  const Tag = as;
  return <Tag className={clsx("lux-display", className)}><DraftText slug={hotel.slug} k={k} fallback={fallback} /></Tag>;
}

export function Book({ className }: { className?: string }) {
  return <HeroIn delay={0.15} className={clsx("relative z-10 mx-auto max-w-[1040px] text-ink [&>*]:shadow-[0_24px_60px_-30px_rgb(0_0_0/0.45)]", className)}><SearchBar /></HeroIn>;
}

export function Photo({ src, className, sizes = "(max-width: 768px) 100vw, 600px", priority, alt = "" }: { src: string; className?: string; sizes?: string; priority?: boolean; alt?: string }) {
  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {priority ? <PhotoIn className="absolute inset-0"><Image src={src} alt={alt} fill priority fetchPriority="high" sizes={sizes} className="object-cover" /></PhotoIn> : <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />}
    </div>
  );
}

export function Btn({ to, children, ghost, light, className }: { to: string; children: ReactNode; ghost?: boolean; light?: boolean; className?: string }) {
  return <Link href={to} className={clsx(ghost ? "lux-btn-ghost" : "lux-btn", light && "lux-btn-ghost-light", "!h-11 !text-[12.5px] uppercase tracking-[0.14em]", className)}>{children} <ArrowRight className="size-4" aria-hidden /></Link>;
}

/** Room cards in four looks; every theme picks one. */
export function Rooms({ hotel, look, cols = 3 }: { hotel: Hotel; look: "card" | "arch" | "boxed" | "plain"; cols?: 2 | 3 }) {
  return (
    <RevealGroup className={clsx("grid gap-5 sm:grid-cols-2", cols === 3 && "lg:grid-cols-3")}>
      {hotel.rooms.map((r) => (
        <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
          <RevealItem className="h-full">
            <Link href={roomLink(hotel, r)} className={clsx("group flex h-full flex-col", look === "card" && "overflow-hidden rounded-[var(--lux-r)] bg-surface shadow-[0_10px_30px_-18px_rgb(0_0_0/0.35)]", look === "boxed" && "overflow-hidden rounded-[var(--lux-r)] border-2 border-[color:var(--lux-accent)]/25 bg-surface")}>
              <div className={clsx("relative aspect-[16/11] overflow-hidden", look === "arch" && "lux-arch", look === "plain" && "rounded-[var(--lux-r)]")}>
                <Image src={r.photos[0]} alt="" fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              </div>
              <div className={clsx("flex flex-1 flex-col", look === "card" || look === "boxed" ? "p-5" : "pt-4")}>
                <h3 className={clsx(look === "arch" ? "sig-caps !text-[13px] !tracking-[0.18em] text-ink" : "lux-display text-[24px]")}>{r.name}</h3>
                <p className="mt-1.5 text-[14.5px] text-muted">{r.short}</p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                  <span className="inline-flex items-center gap-1.5"><BedDouble className="size-4" aria-hidden /> {r.bed}</span>
                  <span className="inline-flex items-center gap-1.5"><Users className="size-4" aria-hidden /> Up to {r.maxAdults + r.maxChildren}</span>
                </p>
                <p className="mt-auto flex items-center justify-between gap-3 pt-4 text-[14.5px]"><span><span className="text-muted"><T>From</T></span> <b className="tabular-nums">{formatMoney(r.fromPrice)}</b><span className="text-muted"> / {r.kind === "dorm" ? "bed" : "night"}</span></span><ArrowUpRight className="size-[18px] text-[color:var(--lux-accent-ink)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></p>
              </div>
            </Link>
          </RevealItem>
        </SiteVisible>
      ))}
    </RevealGroup>
  );
}

/** Three experience tiles (title over photo or below). */
export function Tiles({ hotel, over, limit = 3, cats }: { hotel: Hotel; over?: boolean; limit?: number; cats?: Hotel["services"][number]["category"][] }) {
  const items = hotel.services.filter((s) => s.photo && (!cats || cats.includes(s.category))).slice(0, limit);
  return (
    <RevealGroup className={clsx("grid gap-4 sm:grid-cols-2", items.length >= 3 && "lg:grid-cols-3")}>
      {items.map((s) => (
        <SiteVisible key={s.id} slug={hotel.slug} kind="services" id={s.id}>
          <RevealItem>
            <Link href={href(hotel, "/experiences")} className="group block">
              <div className="relative aspect-[16/11] overflow-hidden rounded-[var(--lux-r)]">
                <Image src={s.photo!} alt="" fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                {over && <><div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><p className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[17px] font-bold text-white">{s.name}<ArrowRight className="size-5" aria-hidden /></p></>}
              </div>
              {!over && <div className="mt-3"><h3 className="sig-caps !text-[13px] text-ink">{s.name}</h3><p className="mt-1 text-[13.5px] text-muted">{s.short}</p></div>}
            </Link>
          </RevealItem>
        </SiteVisible>
      ))}
    </RevealGroup>
  );
}

export function Sec({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={clsx("py-14 md:py-24", className)}><Reveal>{children}</Reveal></section>;
}

/** Call · WhatsApp · Directions — every home ends with a direct line to the property. */
export function Contact({ hotel, light, className }: { hotel: Hotel; light?: boolean; className?: string }) {
  const c = clsx("inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13.5px] font-semibold", light ? "border-white/50 text-white hover:bg-white/10" : "border-line text-ink hover:border-[color:var(--lux-accent)]");
  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      <a href={telLink(hotel)} className={c}><Phone className="size-4" aria-hidden /> {hotel.phone}</a>
      {hotel.whatsapp && <a href={waLink(hotel, `Hello ${hotel.name}, I'd like to book a stay.`)} target="_blank" rel="noopener" className={c}><MessageCircle className="size-4" aria-hidden /> WhatsApp</a>}
      <a href={mapsLink(hotel)} target="_blank" rel="noopener" className={c}><Navigation className="size-4" aria-hidden /> Directions</a>
    </div>
  );
}
