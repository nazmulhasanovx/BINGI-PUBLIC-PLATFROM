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
import { Amenities, Arrival, Experiences, Faq, Head, LuxHero, LuxPage, Mosaic, Quote, Reserve, RoomCards, Sec, Timeline, roomHref } from "../lux/kit";

/**
 * CANOPY (Luxury Collection, rebuilt 2026-11-10) — rainforest and treehouse retreats.
 * Deep green and brass, Cormorant, treehouses on a height scale read from Rooms › specs ("12 m up").
 */
export function CanopyHome({ hotel }: { hotel: Hotel }) {
  return (
    <LuxPage
      hotel={hotel}
      master="canopy"
      parts={{
        hero: <LuxHero hotel={hotel} variant="left" eyebrow={`${hotel.area} · ${hotel.city}`} />,
        signature: <Heights hotel={hotel} />,
        rooms: (
          <Sec>
            <Container>
              <Head hotel={hotel} k="rooms.title" eyebrow="Treehouses" title="Inside, it is all wood and light" />
              <RoomCards hotel={hotel} />
            </Container>
          </Sec>
        ),
        journey: <Timeline hotel={hotel} items={hotel.dayPlan} eyebrow="A forest day" title="From the first call to the last" k="journey.title" />,
        experiences: <Experiences hotel={hotel} eyebrow="Into the forest" title="Guided, quiet, unforgettable" />,
        amenities: <Amenities hotel={hotel} src={photo(hotel, /bridge|tree-4/)} eyebrow="The retreat" title="Built by hand, around the trees" />,
        gallery: <Mosaic hotel={hotel} eyebrow="The forest" title="Green in every direction" />,
        reviews: <Quote hotel={hotel} />,
        faq: <Faq hotel={hotel} />,
        arrival: <Arrival hotel={hotel} src={photo(hotel, /fog|forest/)} eyebrow="Getting here" />,
        reserve: <Reserve hotel={hotel} src={photo(hotel, /leaves|window/)} title="The canopy is waiting" />,
      }}
    />
  );
}

const height = (specs?: string[]) => Number(specs?.find((s) => /m up/i.test(s))?.match(/(\d+(?:\.\d+)?)/)?.[1] ?? 0);

/** Signature: height scale — treehouses sorted by how high they sit, each with a brass rule to scale. */
function Heights({ hotel }: { hotel: Hotel }) {
  const rooms = hotel.rooms.filter((r) => height(r.specs) > 0).sort((a, b) => height(b.specs) - height(a.specs));
  if (!rooms.length) return null;
  const max = height(rooms[0].specs);
  return (
    <Sec>
      <div className="relative overflow-hidden bg-[#13241A] py-16 text-[#EEF1E6] md:py-28">
        <div className="absolute inset-0 opacity-25"><Image src={photo(hotel, /forest|leaves/)} alt="" fill sizes="100vw" className="object-cover" /></div>
        <Container className="relative">
          <Reveal>
            <p className="lux-eyebrow !text-[#D9BE85]">How high you sleep</p>
            <span aria-hidden className="lux-rule mt-4 !bg-[#D9BE85]" />
            <h2 className="lux-display mt-5 max-w-[680px] text-[34px] text-[#EEF1E6] md:text-[60px]"><T>Up in the canopy</T></h2>
          </Reveal>
          <RevealGroup className="mt-10 divide-y divide-white/15 border-y border-white/15 md:mt-14">
            {rooms.map((r) => {
              const h = height(r.specs);
              return (
                <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
                  <RevealItem>
                    <Link href={roomHref(hotel, r)} className="group grid items-center gap-4 py-6 md:grid-cols-[140px_1fr_200px_auto] md:gap-8 md:py-8">
                      <p className="lux-display text-[48px] text-[#D9BE85] md:text-[64px]">{h}<span className="text-[22px] md:text-[26px]"> m</span></p>
                      <div>
                        <h3 className="lux-display text-[26px] text-[#EEF1E6] md:text-[34px]">{r.name}</h3>
                        <p className="mt-1.5 max-w-[520px] text-[15px] leading-relaxed text-[#EEF1E6]/75">{r.short}</p>
                        <div aria-hidden className="mt-4 h-px w-full max-w-[520px] bg-white/15"><div className="h-px bg-[#D9BE85]" style={{ width: `${Math.round((h / max) * 100)}%` }} /></div>
                      </div>
                      <div className="relative hidden aspect-[4/3] overflow-hidden rounded-[var(--lux-r)] md:block"><Image src={r.photos[0]} alt="" fill sizes="200px" className="object-cover" /></div>
                      <p className="flex items-center gap-2 text-[15px]"><span className="text-[#EEF1E6]/75"><T>From</T></span> <b className="tabular-nums">{formatMoney(r.fromPrice)}</b><ArrowUpRight className="size-5 text-[#D9BE85] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></p>
                    </Link>
                  </RevealItem>
                </SiteVisible>
              );
            })}
          </RevealGroup>
        </Container>
      </div>
    </Sec>
  );
}
