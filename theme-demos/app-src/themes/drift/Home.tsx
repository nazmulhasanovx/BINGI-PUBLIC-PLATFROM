import type { Hotel } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { DraftText } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { photo } from "../shared";
import { Amenities, Arrival, Experiences, Eyebrow, Facts, Faq, Head, LuxHero, LuxPage, Mosaic, Quote, Reserve, RoomRows, Sec } from "../lux/kit";

/**
 * DRIFT (Luxury Collection, rebuilt 2026-11-10) — luxury houseboats and river cruises.
 * Ivory and river navy with teak accents, Cormorant, cabins like a ship's brochure and the voyage drawn as a river line.
 */
export function DriftHome({ hotel }: { hotel: Hotel }) {
  return (
    <LuxPage
      hotel={hotel}
      master="drift"
      parts={{
        hero: <LuxHero hotel={hotel} variant="framed" eyebrow={`${hotel.area} · ${hotel.city}`} />,
        facts: <Facts hotel={hotel} />,
        signature: <Voyage hotel={hotel} />,
        rooms: (
          <Sec>
            <Container>
              <Head hotel={hotel} k="rooms.title" eyebrow="Cabins" title="Six cabins, one boat" />
              <RoomRows hotel={hotel} />
            </Container>
          </Sec>
        ),
        amenities: <Amenities hotel={hotel} src={photo(hotel, /deck|boat-side/)} eyebrow="On board" title="A small ship, fully crewed" />,
        experiences: <Experiences hotel={hotel} eyebrow="Off the boat" title="Canoes, towers, villages" />,
        gallery: <Mosaic hotel={hotel} eyebrow="The haor" title="Water to the horizon" />,
        reviews: <Quote hotel={hotel} eyebrow="Passengers" />,
        faq: <Faq hotel={hotel} title="Before you board" />,
        arrival: <Arrival hotel={hotel} src={photo(hotel, /shore|boat-2/)} eyebrow="Boarding" />,
        reserve: <Reserve hotel={hotel} src={photo(hotel, /sunset/)} title="Your cabin is waiting on the water" eyebrow="Reserve a cabin" />,
      }}
    />
  );
}

/** Signature: the voyage as a river line — stops from Day plan, horizontal on desktop, vertical on phone. */
function Voyage({ hotel }: { hotel: Hotel }) {
  const stops = hotel.dayPlan ?? [];
  if (!stops.length) return null;
  return (
    <Sec>
      <Container>
        <Reveal className="mx-auto mb-10 max-w-[760px] text-center md:mb-16">
          <Eyebrow>The voyage</Eyebrow>
          <span aria-hidden className="lux-rule mx-auto mt-4" />
          <h2 className="lux-display mt-5 text-[34px] md:text-[48px] lg:text-[60px]"><DraftText slug={hotel.slug} k="signature.title" fallback="A day on the water" /></h2>
        </Reveal>
        <div className="relative">
          <svg aria-hidden viewBox="0 0 1200 80" preserveAspectRatio="none" className="absolute inset-x-0 top-[34px] hidden h-[80px] w-full lg:block">
            <path d="M0 40 C 150 0, 300 80, 450 40 S 750 0, 900 40 S 1100 80, 1200 40" fill="none" stroke="var(--lux-accent)" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
          </svg>
          <span aria-hidden className="absolute bottom-2 left-[11px] top-2 w-px border-l border-dashed border-[color:var(--lux-accent)] lg:hidden" />
          <Reveal>
            <ol className="relative grid gap-8 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))] lg:gap-6" style={{ ["--n" as string]: stops.length }}>
              {stops.map((d, i) => (
                <li key={d.time + i} className="relative pl-10 lg:pl-0 lg:text-center">
                  <span aria-hidden className="absolute left-0 top-1 grid size-[23px] place-items-center rounded-full border border-[color:var(--lux-accent)] bg-canvas lg:relative lg:left-auto lg:top-auto lg:mx-auto lg:mt-[62px] lg:size-[18px]"><span className="size-[7px] rounded-full bg-[color:var(--lux-accent)]" /></span>
                  <p className="lux-display text-[22px] tabular-nums text-[color:var(--lux-accent-ink)] lg:mt-6 lg:text-[28px]">{d.time}</p>
                  <h3 className="mt-1 text-[17px] font-semibold">{d.title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{d.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
        <p className="mt-10 text-center text-[13.5px] text-muted"><T>Times move with the water and the weather — your captain confirms each morning.</T></p>
      </Container>
    </Sec>
  );
}
