import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { photo } from "../shared";
import { Amenities, Arrival, Dining, Experiences, Facts, Head, LuxHero, LuxPage, Mosaic, Offers, Quote, Reserve, Sec, roomHref } from "../lux/kit";

/**
 * ORBIT (Luxury Collection, rebuilt 2026-11-10) — sky towers and 6–7★ vertical hotels.
 * Midnight navy, thin sans display, silver rules and an altitude rail: rooms listed from the highest floor down.
 */
export function OrbitHome({ hotel }: { hotel: Hotel }) {
  return (
    <LuxPage
      hotel={hotel}
      master="orbit"
      parts={{
        hero: <LuxHero hotel={hotel} variant="split" eyebrow={`${hotel.area} · ${hotel.city}`} src={photo(hotel, /tower/, hotel.heroPhoto)} />,
        facts: <Facts hotel={hotel} />,
        signature: <Altitude hotel={hotel} />,
        amenities: <Amenities hotel={hotel} src={photo(hotel, /pool-2|pool/)} eyebrow="In the tower" title="A city of its own, in the sky" />,
        experiences: <Experiences hotel={hotel} cats={["activity", "spa", "celebration"]} eyebrow="Experiences" title="Above everything" />,
        dining: <Dining hotel={hotel} eyebrow="Dining" title="Breakfast with the whole city" />,
        gallery: <Mosaic hotel={hotel} eyebrow="Gallery" title="Glass, light, altitude" />,
        offers: <Offers hotel={hotel} />,
        reviews: <Quote hotel={hotel} />,
        arrival: <Arrival hotel={hotel} src={photo(hotel, /lobby|reception/)} eyebrow="Arrival" />,
        reserve: <Reserve hotel={hotel} src={photo(hotel, /sunset/)} title="Your floor is ready" />,
      }}
    />
  );
}

const floorOf = (specs?: string[]) => specs?.find((s) => /floor/i.test(s));
const topFloor = (specs?: string[]) => Number(floorOf(specs)?.match(/(\d+)(?!.*\d)/)?.[1] ?? 0);

/** Signature: altitude rail — rooms sorted from the highest floor down, a vertical rule with floor marks. */
function Altitude({ hotel }: { hotel: Hotel }) {
  const rooms = [...hotel.rooms].sort((a, b) => topFloor(b.specs) - topFloor(a.specs) || b.fromPrice - a.fromPrice);
  return (
    <Sec>
      <Container>
        <Reveal><Head hotel={hotel} k="signature.title" eyebrow="Rooms & suites" title="The higher you sleep, the quieter it gets" /></Reveal>
        <RevealGroup className="relative md:pl-40">
          <span aria-hidden className="absolute bottom-0 left-[7px] top-0 hidden w-px bg-gradient-to-b from-[color:var(--lux-accent)] to-transparent md:block" />
          {rooms.map((r) => {
            const floor = floorOf(r.specs);
            return (
              <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
                <RevealItem className="relative border-t border-line py-7 md:py-9">
                  {floor && <p className="lux-eyebrow mb-3 whitespace-nowrap !tracking-[0.16em] md:absolute md:-left-40 md:top-10 md:mb-0 md:w-36"><span aria-hidden className="mr-3 hidden size-[15px] -translate-y-px rounded-full border border-[color:var(--lux-accent)] bg-canvas align-middle md:inline-block" />{floor}</p>}
                  <Link href={roomHref(hotel, r)} className="lux-card group grid items-center gap-5 md:grid-cols-[280px_1fr_auto] md:gap-10">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--lux-r)]"><Image src={r.photos[0]} alt="" fill sizes="(max-width: 768px) 100vw, 280px" className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" /></div>
                    <div>
                      <h3 className="lux-display text-[28px] md:text-[36px]">{r.name}</h3>
                      <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-muted">{r.description}</p>
                      <p className="mt-2 text-[13.5px] text-muted">{r.sizeSqft ? `${r.sizeSqft} sq ft · ` : ""}{r.bed}{r.view ? ` · ${r.view}` : ""}</p>
                    </div>
                    <p className="flex items-center gap-3 text-[15px] md:flex-col md:items-end"><span><span className="text-muted"><T>From</T> </span><b className="tabular-nums">{formatMoney(r.fromPrice)}</b></span><ArrowUpRight className="size-5 text-[color:var(--lux-accent-ink)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></p>
                  </Link>
                </RevealItem>
              </SiteVisible>
            );
          })}
        </RevealGroup>
      </Container>
    </Sec>
  );
}
