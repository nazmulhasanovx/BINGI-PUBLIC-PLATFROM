import Image from "next/image";
import type { Hotel } from "@/lib/types";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { T } from "@/lib/i18n";
import { photo } from "../shared";
import { Amenities, Arrival, Dining, Facts, Head, LuxHero, LuxPage, Offers, Quote, Reserve, RoomRows, Sec } from "../lux/kit";

/**
 * MAISON (Luxury Collection) — grand classic city hotels.
 * Cream and black, Didone headlines, centred symmetry, suites numbered I–IV like a printed brochure.
 */
export function MaisonHome({ hotel }: { hotel: Hotel }) {
  return (
    <LuxPage
      hotel={hotel}
      master="maison"
      parts={{
        hero: <LuxHero hotel={hotel} variant="center" eyebrow={`${hotel.area} · ${hotel.city}`} />,
        facts: <Facts hotel={hotel} />,
        rooms: (
          <Sec>
            <Container>
              <Head hotel={hotel} k="rooms.title" eyebrow="Rooms & suites" title="Rooms with good manners" center />
              <RoomRows hotel={hotel} numbered />
            </Container>
          </Sec>
        ),
        signature: <Salons hotel={hotel} />,
        dining: <Dining hotel={hotel} eyebrow="Dining & bars" title="Tea at three, martinis at eleven" />,
        amenities: <Amenities hotel={hotel} src={photo(hotel, /columns|windows/)} eyebrow="The house" title="Everything arranged, nothing announced" />,
        offers: <Offers hotel={hotel} />,
        reviews: <Quote hotel={hotel} />,
        arrival: <Arrival hotel={hotel} src={photo(hotel, /columns/)} eyebrow="The address" />,
        reserve: <Reserve hotel={hotel} src={photo(hotel, /chandelier/)} title="We have kept a room for you" />,
      }}
    />
  );
}

/** Signature: the public rooms in a symmetrical three-photo spread with captions. */
function Salons({ hotel }: { hotel: Hotel }) {
  const spread = [
    { src: photo(hotel, /ceiling/), cap: "The painted ceiling" },
    { src: photo(hotel, /salon/), cap: "The Salon" },
    { src: photo(hotel, /chandelier/), cap: "The grand staircase" },
  ];
  return (
    <Sec>
      <Container>
        <Reveal><Head hotel={hotel} k="signature.title" eyebrow="The public rooms" title="A house made for gathering" center /></Reveal>
        <RevealGroup className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1.3fr_1fr] md:items-center md:gap-6">
          {spread.map((s, i) => (
            <RevealItem key={s.cap} className={i === 1 ? "order-first col-span-2 md:order-none md:col-span-1" : ""}>
              <figure>
                <div className={`relative overflow-hidden ${i === 1 ? "aspect-[4/5]" : "aspect-[3/4]"}`}><Image src={s.src} alt="" fill sizes="(max-width: 768px) 50vw, 460px" className="object-cover" /></div>
                <figcaption className="mt-3 text-center font-heading text-[16px] italic text-muted md:text-[18px]"><T>{s.cap}</T></figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Sec>
  );
}
