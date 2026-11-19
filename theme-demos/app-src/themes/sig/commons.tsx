import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { LuxPage } from "../lux/kit";
import { photo } from "../shared";
import { BedOrRoom } from "./BedOrRoom";
import { Contact, H, W, href, price, roomLink } from "./kit";

const LIME = "#D7F22B";
const Sticker = ({ children, className = "" }: { children: string; className?: string }) => (
  <span className={`inline-block -rotate-3 bg-[#D7F22B] px-3 py-1 font-[family-name:var(--font-heading)] text-[15px] uppercase text-[#0c0c14] shadow-[3px_3px_0_#0c0c14] ${className}`}><T>{children}</T></span>
);

/**
 * COMMONS (Signature · social hostel) — design 08. Archivo Black + Space Grotesk + Permanent Marker, electric blue and lime.
 * Stickers, tilted photos, a Bed / Private switch with real prices and this week's free events.
 */
export function CommonsHome({ hotel }: { hotel: Hotel }) {
  const events = hotel.services.filter((s) => s.category === "activity");
  const dorm = hotel.rooms.find((r) => r.kind === "dorm");
  const priv = hotel.rooms.find((r) => r.kind !== "dorm");
  return (
    <LuxPage
      hotel={hotel}
      master="commons"
      parts={{
        hero: (
          <section className="relative">
            <div className="relative min-h-[600px] overflow-hidden md:min-h-[620px]">
              <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-[#1F2BD8]/25" />
              <div aria-hidden className="absolute -left-20 -top-24 h-64 w-[420px] -rotate-12 bg-[#1F2BD8]" />
              <W className="relative pb-44 pt-16 md:pt-24">
                <div className="inline-block -rotate-2 bg-white px-5 py-4 shadow-[6px_6px_0_#0c0c14] md:px-8 md:py-6">
                  <H hotel={hotel} k="hero.title" fallback={hotel.tagline} as="h1" className="max-w-[560px] text-[40px] uppercase md:text-[64px]" />
                </div>
                <p className="mt-4 inline-block max-w-[420px] -rotate-1 bg-white px-4 py-2 text-[14px] font-bold uppercase shadow-[4px_4px_0_#0c0c14]">{hotel.intro.split(" — ")[0]}.</p>
              </W>
              <W className="absolute inset-x-0 bottom-5"><BedOrRoom hotel={hotel} bedFrom={dorm?.fromPrice} roomFrom={priv?.fromPrice} /></W>
            </div>
          </section>
        ),
        gallery: (
          <section className="py-14 md:py-20">
            <W className="grid items-center gap-8 lg:grid-cols-[320px_1fr]">
              <Reveal>
                <H hotel={hotel} k="gallery.title" fallback="Social spaces for real connections." className="text-[38px] uppercase md:text-[46px] lg:text-[36px] relative z-10" />
                <svg aria-hidden viewBox="0 0 200 16" className="mt-2 h-4 w-40"><path d="M2 10 C 60 2, 120 14, 198 6" fill="none" stroke={LIME} strokeWidth="6" strokeLinecap="round" /></svg>
              </Reveal>
              <RevealGroup className="grid grid-cols-3 gap-2 md:gap-3">
                {hotel.facilities.slice(0, 3).map((f, i) => (
                  <RevealItem key={f.name} className="relative aspect-[3/4] overflow-hidden md:aspect-[4/5] [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)]">
                    <Image src={hotel.gallery[i] ?? hotel.heroPhoto} alt="" fill sizes="(max-width: 768px) 33vw, 320px" className="object-cover" />
                    <Sticker className="absolute bottom-3 left-3 !text-[11px] md:!text-[14px]">{f.name}</Sticker>
                  </RevealItem>
                ))}
              </RevealGroup>
            </W>
          </section>
        ),
        rooms: (
          <section className="relative pb-14 md:pb-20">
            <div aria-hidden className="absolute bottom-0 left-0 h-1/2 w-1/4 bg-[#D7F22B] [clip-path:polygon(0_20%,100%_0,60%_100%,0_100%)]" />
            <W className="relative grid gap-8 lg:grid-cols-[260px_1fr]">
              <Reveal>
                <h2 className="lux-display text-[52px] uppercase md:text-[64px]">Ways to <span className="sig-marker text-[color:var(--lux-accent-ink)]">stay</span></h2>
                <p className="mt-4 text-[15px] font-bold uppercase">Comfortable, flexible and made for travellers like you.</p>
              </Reveal>
              <RevealGroup className="grid gap-4 sm:grid-cols-3">
                {hotel.rooms.map((r) => (
                  <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
                    <RevealItem>
                      <Link href={roomLink(hotel, r)} className="group block border-2 border-[#0c0c14] bg-white shadow-[5px_5px_0_#0c0c14] transition-transform hover:-translate-y-1">
                        <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-[#0c0c14]"><Image src={r.photos[0]} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover" /></div>
                        <div className="flex items-end justify-between gap-3 p-4">
                          <span><b className="lux-display block text-[20px] uppercase">{r.name}</b><span className="mt-1 block text-[12.5px] font-bold uppercase text-muted">{r.short}</span><span className="mt-1 block text-[14px] font-bold">{formatMoney(r.fromPrice)} / {r.kind === "dorm" ? "bed" : "night"}</span></span>
                          <span className="grid size-9 shrink-0 place-items-center bg-[#D7F22B]"><ArrowUpRight className="size-5" aria-hidden /></span>
                        </div>
                      </Link>
                    </RevealItem>
                  </SiteVisible>
                ))}
              </RevealGroup>
            </W>
          </section>
        ),
        experiences: (
          <section className="bg-[#1F2BD8] py-14 text-white md:py-20">
            <W className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1.2fr]">
              <Reveal>
                <H hotel={hotel} k="experiences.title" fallback="Community experiences" className="text-[40px] uppercase text-white md:text-[54px]" />
                <p className="mt-3 max-w-[360px] text-[15px] font-bold uppercase text-white/90">Meet people, share interests and experience the city together.</p>
              </Reveal>
              <p aria-hidden className="sig-marker hidden rotate-[-6deg] bg-[#D7F22B] px-5 py-4 text-[26px] leading-tight text-[#0c0c14] shadow-[5px_5px_0_#0c0c14] lg:block">Explore<br />Create<br />Share<br />Connect</p>
              <ul className="grid gap-3">
                {events.map((e) => (
                  <li key={e.id} className="flex items-center gap-4 border-2 border-white/80 bg-[#1822AE] p-3">
                    {e.photo && <span className="relative size-16 shrink-0 overflow-hidden"><Image src={e.photo} alt="" fill sizes="64px" className="object-cover" /></span>}
                    <span className="min-w-0 flex-1"><b className="block text-[16px]">{e.name}</b><span className="text-[13.5px] text-white/80">{e.short}</span></span>
                    <span className="shrink-0 bg-[#D7F22B] px-2.5 py-1 text-[12px] font-bold uppercase text-[#0c0c14]">{price(e.price)}</span>
                  </li>
                ))}
              </ul>
            </W>
          </section>
        ),
        arrival: (
          <section className="py-14 md:py-20">
            <W className="grid items-center gap-8 lg:grid-cols-[1fr_1.4fr]">
              <Reveal>
                <h2 className="lux-display text-[44px] uppercase md:text-[56px]">City <span className="italic text-transparent [-webkit-text-stroke:2px_#0c0c14]">discoveries</span></h2>
                <p className="mt-4 text-[15px] font-bold uppercase">Local spots, hidden gems and easy adventures around {hotel.area}.</p>
                <ul className="mt-5 space-y-2">{(hotel.nearby ?? []).map((n) => <li key={n.name} className="flex items-center gap-2 text-[15px]"><MapPin className="size-4 text-[color:var(--lux-accent-ink)]" aria-hidden /><b>{n.name}</b><span className="text-muted">· {n.time} {n.mode}</span></li>)}</ul>
              </Reveal>
              <div className="grid grid-cols-3 gap-2">
                {[hotel.gallery[3], hotel.gallery[4], photo(hotel, /campfire|common/)].filter(Boolean).map((g, i) => (
                  <div key={`${g}-${i}`} className="relative aspect-[3/4] overflow-hidden [clip-path:polygon(0_4%,100%_0,100%_96%,0_100%)]">
                    <Image src={g!} alt="" fill sizes="(max-width: 768px) 33vw, 260px" className="object-cover" />
                    <Sticker className="absolute bottom-3 left-2 !text-[11px]">{["Cafés & culture", "Art & creative", "Parks & outdoors"][i]}</Sticker>
                  </div>
                ))}
              </div>
            </W>
          </section>
        ),
        reserve: (
          <section className="bg-[#1F2BD8] text-white">
            <W className="flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center">
              <h2 className="lux-display text-[40px] uppercase leading-[0.95] text-white md:text-[64px]">Come for a bed.<br />Stay for the <span className="italic text-transparent [-webkit-text-stroke:2px_#fff]">people.</span></h2>
              <Link href={href(hotel, "/rooms")} className="inline-flex h-14 shrink-0 items-center gap-2 bg-[#D7F22B] px-7 font-[family-name:var(--font-heading)] text-[18px] uppercase text-[#0c0c14] shadow-[5px_5px_0_#0c0c14]"><T>Book your stay</T> <ArrowUpRight className="size-5" aria-hidden /></Link>
            </W>
            <W className="pb-10"><Contact hotel={hotel} light /></W>
          </section>
        ),
      }}
    />
  );
}
