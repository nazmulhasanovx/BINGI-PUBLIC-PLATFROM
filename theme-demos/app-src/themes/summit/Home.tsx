import Image from "next/image";
import type { Hotel } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { DraftText } from "@/components/site-draft/Draft";
import { photo } from "../shared";
import { Amenities, Arrival, Dining, Experiences, Facts, Head, LuxHero, LuxPage, Mosaic, Quote, Reserve, RoomRows, Sec } from "../lux/kit";

/**
 * SUMMIT (Luxury Collection) — hill and mountain lodges.
 * Slate and warm timber, Fraunces, layered ridge silhouettes over the hero, and the evening by the fire.
 */
export function SummitHome({ hotel }: { hotel: Hotel }) {
  return (
    <LuxPage
      hotel={hotel}
      master="summit"
      parts={{
        hero: <LuxHero hotel={hotel} variant="center" eyebrow={`${hotel.area} · ${hotel.highlights[0] ?? hotel.city}`}><Ridges /></LuxHero>,
        facts: <Facts hotel={hotel} />,
        rooms: (
          <Sec>
            <Container>
              <Head hotel={hotel} k="rooms.title" eyebrow="Lodges & rooms" title="Timber, glass and a view to the edge" />
              <RoomRows hotel={hotel} />
            </Container>
          </Sec>
        ),
        signature: <Fireside hotel={hotel} />,
        experiences: <Experiences hotel={hotel} eyebrow="On the ridge" title="Walk, sweat, eat, sleep" />,
        dining: <Dining hotel={hotel} eyebrow="Dinner" title="One long table" />,
        amenities: <Amenities hotel={hotel} src={photo(hotel, /aframe|lodge/)} eyebrow="The lodge" title="Warm inside, wild outside" />,
        gallery: <Mosaic hotel={hotel} eyebrow="The ridge" title="Above the weather" />,
        reviews: <Quote hotel={hotel} />,
        arrival: <Arrival hotel={hotel} src={photo(hotel, /path/)} eyebrow="The road up" />,
        reserve: <Reserve hotel={hotel} src={photo(hotel, /aerial|tea-hills/)} title="The clouds are expected tomorrow" />,
      }}
    />
  );
}

/** Three layered ridge silhouettes fading into the page canvas. */
function Ridges() {
  return (
    <svg aria-hidden viewBox="0 0 1440 220" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-[160px] w-full text-[color:var(--canvas)] md:h-[220px]">
      <path d="M0 120 L120 80 L260 130 L400 60 L560 120 L700 70 L860 130 L1010 50 L1160 120 L1300 80 L1440 110 L1440 220 L0 220Z" fill="currentColor" opacity="0.18" />
      <path d="M0 160 L160 110 L330 165 L480 105 L650 160 L820 115 L980 170 L1150 110 L1300 160 L1440 130 L1440 220 L0 220Z" fill="currentColor" opacity="0.35" />
      <path d="M0 200 L200 160 L380 205 L560 170 L760 210 L940 168 L1120 205 L1300 175 L1440 195 L1440 220 L0 220Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/** Signature: the evening by the fire — warm dark band, photo and the evening hours (Day plan). */
function Fireside({ hotel }: { hotel: Hotel }) {
  const items = hotel.dayPlan ?? [];
  if (!items.length) return null;
  return (
    <Sec>
      <div className="bg-[#1d1713] py-16 text-[#f3ebe1] md:py-28">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-16">
            <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[var(--lux-r)] md:aspect-[5/6]"><Image src={photo(hotel, /fire-pit|bonfire/)} alt="" fill sizes="(max-width: 768px) 100vw, 620px" className="object-cover" /></Reveal>
            <Reveal delay={0.05}>
              <p className="lux-eyebrow !text-[#e2b98c]">Fireside</p>
              <span aria-hidden className="lux-rule mt-4 !bg-[#e2b98c]" />
              <h2 className="lux-display mt-5 text-[34px] text-[#f3ebe1] md:text-[56px]"><DraftText slug={hotel.slug} k="signature.title" fallback="When the light goes" /></h2>
              <ol className="mt-8 divide-y divide-white/15 border-y border-white/15">
                {items.map((d) => (
                  <li key={d.time + d.title} className="grid grid-cols-[76px_1fr] gap-4 py-5">
                    <p className="lux-display text-[22px] tabular-nums text-[#e2b98c]">{d.time}</p>
                    <div><h3 className="text-[17px] font-semibold">{d.title}</h3><p className="mt-1 text-[15px] leading-relaxed text-[#f3ebe1]/75">{d.text}</p></div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </Container>
      </div>
    </Sec>
  );
}
