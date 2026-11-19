import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, MapPin, Users } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { LuxPage } from "../lux/kit";
import { photo } from "../shared";
import { facIcon } from "../paid-shared";
import { Contact, Book, H, Tiles, W, href, roomLink } from "./kit";

const Swoosh = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 200 14" className={`h-3 w-40 text-[color:var(--lux-accent)] ${className}`}><path d="M2 10 C 60 2, 140 2, 198 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
);
const blob = "[border-radius:58%_42%_55%_45%/48%_52%_48%_52%]";

/**
 * WAYPOINT (Signature · motel / highway inn) — design 05. Alfa Slab One + Nunito Sans, sunset orange and roast brown.
 * Signature: the road-trip flow (Rest → Refuel → Explore) on a dashed route; parking and 24-hour check-in up front.
 */
export function WaypointHome({ hotel }: { hotel: Hotel }) {
  const room = hotel.rooms[0];
  const cafe = hotel.outlets[0];
  const scenic = hotel.services.find((s) => s.photo);
  const flow = [
    { t: "Rest", s: room ? `${room.short}` : "Clean, comfy rooms and a quiet night's sleep.", src: room?.photos[0] ?? hotel.heroPhoto },
    { t: "Refuel", s: cafe ? `${cafe.short}` : "Coffee and quick bites.", src: cafe?.photo ?? photo(hotel, /cup|tea/) },
    { t: "Explore", s: scenic ? scenic.short : "Scenic drives and small towns.", src: scenic?.photo ?? photo(hotel, /path|hills/) },
  ];
  return (
    <LuxPage
      hotel={hotel}
      master="waypoint"
      parts={{
        hero: (
          <section className="relative overflow-hidden">
            <div className="relative min-h-[560px] md:min-h-[600px]">
              <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#f7efe3] via-[#f7efe3]/80 to-transparent md:via-[#f7efe3]/60" />
              <W className="relative pb-40 pt-12 md:pt-20">
                <H hotel={hotel} k="hero.title" fallback={hotel.tagline} as="h1" className="max-w-[560px] text-[54px] leading-[0.98] md:text-[84px]" />
                <Swoosh className="mt-3" />
                <p className="mt-5 max-w-[340px] text-[18px] font-semibold">{hotel.intro.split(" — ")[0]}.</p>
              </W>
              <W className="absolute inset-x-0 bottom-6"><Book /></W>
            </div>
          </section>
        ),
        signature: (
          <section className="py-14 md:py-20">
            <W className="grid items-center gap-10 md:grid-cols-[230px_1fr]">
              <Reveal><H hotel={hotel} k="signature.title" fallback={`The ${hotel.logoText} Road-Trip Flow`} className="text-[38px] leading-[1.02] md:text-[44px]" /><Swoosh className="mt-2" /></Reveal>
              <div className="relative">
                <svg aria-hidden viewBox="0 0 1000 120" preserveAspectRatio="none" className="absolute inset-x-0 top-[22%] hidden h-24 w-full md:block"><path d="M150 80 C 280 10, 380 120, 500 60 S 760 10, 860 70" fill="none" stroke="var(--lux-accent)" strokeWidth="3" strokeDasharray="10 10" /></svg>
                <ol className="relative grid gap-8 md:grid-cols-3 md:gap-10">
                  {flow.map((f, i) => (
                    <li key={f.t} className="text-left">
                      <div className={`relative mx-auto aspect-[4/3] w-[86%] overflow-hidden ${blob}`}><Image src={f.src} alt="" fill sizes="(max-width: 768px) 90vw, 320px" className="object-cover" /></div>
                      {i < 2 && <MapPin aria-hidden className="absolute hidden size-7 fill-[color:var(--lux-accent)] text-[#f7efe3] md:block" style={{ left: `${(i + 1) * 33.3 - 2}%`, top: "38%" }} />}
                      <h3 className="lux-display mt-4 text-[32px] text-[color:var(--lux-accent-ink)]">{f.t}</h3>
                      <p className="mt-1 text-[15px] text-muted">{f.s}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </W>
          </section>
        ),
        rooms: (
          <section className="bg-[#3a2117] py-14 text-[#fbf1e4] md:py-20">
            <W>
              <Reveal className="grid gap-4 md:grid-cols-[auto_1fr] md:items-end md:gap-10">
                <div><p className="sig-caps text-[#f3c8a8]">Accommodations</p><H hotel={hotel} k="rooms.title" fallback="Stay Your Way" className="mt-2 text-[44px] text-[#fbf1e4] md:text-[54px]" /></div>
                <p className="border-[#f3c8a8]/40 text-[16px] text-[#fbf1e4]/85 md:border-l md:pl-10">Simple, stylish rooms for every kind of trip — a solo escape, a weekend for two or a road trip with friends.</p>
              </Reveal>
              <RevealGroup className="mt-10 grid gap-5 md:grid-cols-3">
                {hotel.rooms.map((r) => (
                  <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
                    <RevealItem className="h-full">
                      <div className="flex h-full flex-col overflow-hidden rounded-[16px] bg-[#fff9f0] text-[#3a2117]">
                        <div className="relative aspect-[16/10]"><Image src={r.photos[0]} alt="" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" /></div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="text-[22px] font-extrabold">{r.name}</h3>
                          <p className="mt-1 text-[14.5px] text-[#6b4e3f]">{r.short}</p>
                          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5 text-[13.5px]">
                            <span className="flex gap-4"><span className="flex items-center gap-1.5"><BedDouble className="size-4" aria-hidden />{r.bed}</span><span className="flex items-center gap-1.5"><Users className="size-4" aria-hidden />Up to {r.maxAdults + r.maxChildren}</span></span>
                            <Link href={roomLink(hotel, r)} className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-[#C9501C] px-4 font-bold text-[#a94215]">{formatMoney(r.fromPrice)} <ArrowRight className="size-4" aria-hidden /><span className="sr-only">{r.name}</span></Link>
                          </div>
                        </div>
                      </div>
                    </RevealItem>
                  </SiteVisible>
                ))}
              </RevealGroup>
            </W>
          </section>
        ),
        amenities: (
          <section className="py-14 md:py-20">
            <W className="grid items-center gap-10 md:grid-cols-2">
              <Reveal className="relative">
                <div className={`relative aspect-[16/10] overflow-hidden ${blob}`}><Image src={photo(hotel, /sign|entrance/)} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" /></div>
                <p className="absolute -top-4 right-2 rotate-6 rounded-[8px] bg-[#C9501C] px-4 py-2 font-[family-name:var(--font-heading)] text-[22px] leading-none text-white shadow-lg">EASY<br />PARKING →</p>
              </Reveal>
              <Reveal>
                <p className="sig-caps text-[color:var(--lux-accent-ink)]">A smooth stop</p>
                <H hotel={hotel} k="amenities.title" fallback="Arrive, Park, Unwind" className="mt-2 text-[40px] md:text-[48px]" />
                <p className="mt-2 text-[16px] text-muted">Road-trip friendly from the moment you pull in. Check-in: {hotel.checkIn}.</p>
                <ul className="mt-6 grid grid-cols-3 gap-y-5 sm:grid-cols-5 sm:divide-x sm:divide-line">
                  {hotel.facilities.slice(0, 5).map((f) => { const I = facIcon(f.icon); return <li key={f.name} className="flex flex-col items-center gap-2 px-2 text-center text-[13px] font-semibold"><I className="size-7" strokeWidth={1.5} aria-hidden />{f.name}</li>; })}
                </ul>
              </Reveal>
            </W>
          </section>
        ),
        experiences: (
          <section className="pb-14 md:pb-20">
            <W className="grid gap-8 lg:grid-cols-[240px_1fr]">
              <Reveal><p className="sig-caps text-[color:var(--lux-accent-ink)]">Nearby discoveries</p><H hotel={hotel} k="experiences.title" fallback="Make the Most of the Stop" className="mt-2 text-[38px] md:text-[44px]" /><Swoosh /></Reveal>
              <Tiles hotel={hotel} over />
            </W>
          </section>
        ),
        reserve: (
          <section className="bg-gradient-to-r from-[#d65a1f] via-[#e57a2e] to-[#d65a1f] text-white">
            <W className="flex flex-col items-center gap-6 py-12 md:flex-row md:justify-between">
              <div className="flex items-center gap-6">
                <span aria-hidden className="grid size-24 shrink-0 place-items-center bg-[#fff3e2] text-center font-[family-name:var(--font-heading)] text-[16px] leading-tight text-[#3a2117] [clip-path:polygon(50%_0,100%_15%,100%_70%,50%_100%,0_70%,0_15%)]">{hotel.logoText.toUpperCase()}</span>
                <H hotel={hotel} k="reserve.title" fallback="Ready for Your Next Stop?" className="text-[34px] text-white md:text-[44px]" />
              </div>
              <Link href={href(hotel, "/rooms")} className="inline-flex h-12 items-center gap-2 rounded-[12px] bg-[#fff9f0] px-6 text-[15px] font-extrabold text-[#a94215]"><T>Check availability</T> <ArrowRight className="size-4" aria-hidden /></Link>
            </W>
            <W className="pb-10"><Contact hotel={hotel} light /></W>
          </section>
        ),
      }}
    />
  );
}
