import Image from "next/image";
import Link from "next/link";
import { BedDouble, CalendarDays, Users } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { LuxPage } from "../lux/kit";
import { photo } from "../shared";
import { Contact, Book, H, Tiles, W, href, roomLink } from "./kit";

/** Jagged "torn paper" edge on one side (CSS clip-path). */
const torn = (side: "l" | "r" | "b") => {
  const n = 18;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = (i / n) * 100, j = i % 2 ? 2.2 : 0;
    return side === "l" ? `${j}% ${t}%` : side === "r" ? `${100 - j}% ${100 - t}%` : `${100 - t}% ${100 - j}%`;
  });
  return side === "l" ? `polygon(${pts.join(",")},100% 100%,100% 0)` : side === "r" ? `polygon(0 0,${pts.join(",")},0 100%)` : `polygon(0 0,100% 0,${pts.join(",")})`;
};
const Satisfy = ({ children, className = "" }: { children: string; className?: string }) => <p className={`sig-satisfy text-[32px] leading-none text-[color:var(--lux-accent-ink)] md:text-[38px] ${className}`}><T>{children}</T></p>;

/**
 * ROOTS (Signature · homestay) — design 09. Libre Baskerville + Nunito Sans with Satisfy script, deep red and leaf green on paper.
 * Torn-paper edges, the hosts first, home-cooked food, village life and polaroid memories.
 */
export function RootsHome({ hotel }: { hotel: Hotel }) {
  const food = hotel.services.find((s) => s.category === "dining");
  return (
    <LuxPage
      hotel={hotel}
      master="roots"
      parts={{
        hero: (
          <section className="relative">
            <div className="relative min-h-[540px] md:min-h-[580px]" style={{ clipPath: torn("b") }}>
              <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
              <W className="relative pb-40 pt-16 text-white md:pt-24">
                <H hotel={hotel} k="hero.title" fallback={hotel.tagline} as="h1" className="max-w-[560px] text-[44px] leading-[1.08] text-white md:text-[60px]" />
                <svg aria-hidden viewBox="0 0 200 12" className="mt-2 h-3 w-48"><path d="M2 8 C 60 2, 140 3, 198 9" fill="none" stroke="#c0392b" strokeWidth="3" strokeLinecap="round" /></svg>
              </W>
            </div>
            <W className="-mt-36 pb-4"><Book /></W>
          </section>
        ),
        story: (
          <section className="py-12 md:py-16">
            <div className="grid items-center gap-6 md:grid-cols-[0.9fr_1.4fr]">
              <Reveal className="px-5 md:pl-[max(24px,calc((100vw-1240px)/2+24px))]">
                <Satisfy>Meet</Satisfy>
                <H hotel={hotel} k="story.title" fallback="Our Hosts" className="text-[40px] md:text-[48px]" />
                <p className="mt-3 max-w-[420px] text-[16px] leading-relaxed text-muted">{hotel.host?.note ?? hotel.intro}</p>
                {hotel.host && <p className="mt-4 text-[14.5px]"><b>{hotel.host.name}</b> · <T>hosting since</T> {hotel.host.since}<span className="mt-2 flex flex-wrap gap-2">{hotel.host.languages.map((l) => <span key={l} className="rounded-full bg-surface px-3 py-1 text-[12.5px] font-semibold">{l}</span>)}</span></p>}
              </Reveal>
              <Reveal className="relative min-h-[300px] md:min-h-[400px]" style={{ clipPath: torn("l") }}><Image src={photo(hotel, /veranda|bungalow/)} alt="" fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" /></Reveal>
            </div>
          </section>
        ),
        rooms: (
          <section className="py-12 md:py-16">
            <W className="grid gap-8 lg:grid-cols-[260px_1fr]">
              <Reveal><H hotel={hotel} k="rooms.title" fallback="Our Rooms" className="text-[40px] text-[color:var(--lux-accent-ink)] md:text-[46px]" /><p className="mt-3 text-[16px] text-muted">Cozy, airy and rooted in home comfort — each room is a calm space to rest, read and feel at ease.</p></Reveal>
              <RevealGroup className="grid gap-5 sm:grid-cols-3">
                {hotel.rooms.map((r) => (
                  <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
                    <RevealItem>
                      <Link href={roomLink(hotel, r)} className="group block overflow-hidden rounded-[10px] bg-surface shadow-[0_14px_30px_-20px_rgb(0_0_0/0.35)]">
                        <div className="relative aspect-[4/3] overflow-hidden"><Image src={r.photos[0]} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                        <div className="p-4"><h3 className="lux-display text-[21px]">{r.name}</h3><p className="mt-1 text-[14px] text-muted">{r.short}</p><p className="mt-3 flex gap-4 text-[13px] text-muted"><span className="flex items-center gap-1.5"><BedDouble className="size-4" aria-hidden />{r.bed}</span><span className="flex items-center gap-1.5"><Users className="size-4" aria-hidden />Up to {r.maxAdults + r.maxChildren}</span></p></div>
                      </Link>
                    </RevealItem>
                  </SiteVisible>
                ))}
              </RevealGroup>
            </W>
          </section>
        ),
        dining: food ? (
          <section className="grid md:grid-cols-[1.1fr_1fr]">
            <div className="relative min-h-[280px] md:min-h-[360px]"><Image src={food.photo ?? photo(hotel, /dish/)} alt="" fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" /></div>
            <div className="flex flex-col justify-center bg-[#8E2C22] px-6 py-12 text-white md:-ml-10 md:px-16" style={{ clipPath: torn("l") }}>
              <H hotel={hotel} k="dining.title" fallback="Home-cooked Food" className="text-[38px] text-white md:text-[48px]" />
              <p className="mt-3 max-w-[420px] text-[16px] text-white/90">{food.short} Simple, seasonal and full of home flavours.</p>
            </div>
          </section>
        ) : null,
        experiences: (
          <section className="py-12 md:py-16">
            <W className="grid gap-8 lg:grid-cols-[260px_1fr]">
              <Reveal><H hotel={hotel} k="experiences.title" fallback="Local Life & Experiences" className="text-[36px] md:text-[42px]" /><p className="mt-3 text-[16px] text-muted">Slow down and explore the warmth, work and wonder of local life.</p></Reveal>
              <Tiles hotel={hotel} cats={["activity"]} />
            </W>
          </section>
        ),
        gallery: (
          <section className="py-12 md:py-16">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_1fr]">
              <Reveal className="relative min-h-[300px] md:min-h-[380px]" style={{ clipPath: torn("r") }}><Image src={photo(hotel, /bungalow|tea-garden/)} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></Reveal>
              <Reveal className="relative px-5 md:pr-[max(24px,calc((100vw-1240px)/2+24px))]">
                <Satisfy>Our Story</Satisfy>
                <H hotel={hotel} k="gallery.title" fallback={`Life at ${hotel.logoText}`} className="text-[38px] md:text-[46px]" />
                <p className="mt-3 max-w-[420px] text-[16px] text-muted">{hotel.intro}</p>
                <div className="mt-6 flex gap-4">
                  {hotel.gallery.slice(0, 2).map((g, i) => <div key={g} className={`relative aspect-square w-36 bg-white p-2 pb-7 shadow-lg md:w-44 ${i ? "rotate-3" : "-rotate-3"}`}><div className="relative h-full w-full"><Image src={g} alt="" fill sizes="176px" className="object-cover" /></div></div>)}
                </div>
              </Reveal>
            </div>
          </section>
        ),
        reserve: (
          <section className="bg-[#2f4a2a] py-14 text-center text-white">
            <W>
              <H hotel={hotel} k="reserve.title" fallback={`You're Welcome at ${hotel.logoText}`} className="text-[38px] text-white md:text-[52px]" />
              <p className="mt-3 text-[16px] text-white/85">Come for the calm, stay for the warmth, and take home a little more of Bangladesh.</p>
              <Link href={href(hotel, "/rooms")} className="mt-6 inline-flex h-12 items-center gap-2 rounded-[6px] border-2 border-white/80 bg-[#8E2C22] px-6 font-bold"><CalendarDays className="size-4" aria-hidden /><T>Book Your Stay</T></Link>
              <Contact hotel={hotel} light className="mt-6 justify-center" />
            </W>
          </section>
        ),
      }}
    />
  );
}
