import Image from "next/image";
import type { Hotel } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { T } from "@/lib/i18n";
import { photo } from "../shared";
import { Amenities, Arrival, Dining, Head, LuxHero, LuxPage, Mosaic, Offers, Quote, Reserve, RoomCards, Sec, Timeline } from "../lux/kit";

/**
 * NOIR (Luxury Collection) — rooftop and night luxury hotels.
 * Black and champagne, Playfair italics, a slow light sweep over the hero, the evening told hour by hour.
 */
export function NoirHome({ hotel }: { hotel: Hotel }) {
  return (
    <LuxPage
      hotel={hotel}
      master="noir"
      parts={{
        hero: (
          <LuxHero hotel={hotel} variant="left" eyebrow={`${hotel.area} · ${hotel.city}`}>
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0b1530]/45 mix-blend-multiply" />
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen">
              <div className="lux-sweep absolute -inset-y-10 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-[#C9A96E]/15 to-transparent" />
            </div>
          </LuxHero>
        ),
        rooms: (
          <Sec>
            <Container>
              <Head hotel={hotel} k="rooms.title" eyebrow="Rooms & suites" title="Dark rooms, deep sleep" />
              <RoomCards hotel={hotel} />
            </Container>
          </Sec>
        ),
        signature: <Rooftop hotel={hotel} />,
        journey: <Timeline hotel={hotel} items={hotel.dayPlan} eyebrow="After dark" title="An evening at Obsidian" k="journey.title" />,
        dining: <Dining hotel={hotel} eyebrow="Eat & drink" title="Charcoal, cocktails, late" />,
        amenities: <Amenities hotel={hotel} src={photo(hotel, /lounge/)} eyebrow="The hotel" title="Made for the night owl" />,
        gallery: <Mosaic hotel={hotel} eyebrow="Gallery" title="Lights, glass, water" />,
        offers: <Offers hotel={hotel} />,
        reviews: <Quote hotel={hotel} />,
        arrival: <Arrival hotel={hotel} src={photo(hotel, /sunset/)} eyebrow="Find us" />,
        reserve: <Reserve hotel={hotel} src={photo(hotel, /pool-2|pool/)} title="Tonight, the city is yours" />,
      }}
    />
  );
}

/** Signature: the rooftop — one big night photo, venues and hours over it. */
function Rooftop({ hotel }: { hotel: Hotel }) {
  const venues = hotel.outlets.filter((o) => o.kind === "bar" || /roof/i.test(o.location));
  const list = [...venues, ...hotel.outlets.filter((o) => !venues.includes(o))].slice(0, 3);
  if (!list.length) return null;
  return (
    <Sec>
      <Reveal className="relative overflow-hidden">
        <div className="relative h-[86svh] min-h-[560px] max-h-[900px]">
          <Image src={photo(hotel, /night/)} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-black/40 to-black/20" />
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen"><div className="lux-sweep absolute -inset-y-10 left-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-[#C9A96E]/10 to-transparent" /></div>
          <Container className="absolute inset-x-0 bottom-0 pb-12 text-white md:pb-20">
            <p className="lux-eyebrow">The rooftop</p>
            <h2 className="lux-display mt-4 max-w-[720px] text-[40px] italic text-white md:text-[76px]"><T>Twenty-two floors up</T></h2>
            <ul className="mt-8 grid max-w-[1100px] gap-px overflow-hidden border border-white/15 bg-white/15 sm:grid-cols-3">
              {list.map((o) => (
                <li key={o.id} className="bg-black/55 p-5 backdrop-blur md:p-6">
                  <h3 className="lux-display text-[26px] text-white">{o.name}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/80">{o.short}</p>
                  <p className="mt-3 text-[13px] font-semibold tracking-[0.08em] text-[#DCC08A] tabular-nums">{o.hours} · {o.location}</p>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      </Reveal>
    </Sec>
  );
}
