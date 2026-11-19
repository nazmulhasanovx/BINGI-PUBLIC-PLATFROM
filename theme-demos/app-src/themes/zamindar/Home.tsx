import Image from "next/image";
import Link from "next/link";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { photo } from "../shared";
import { Amenities, Arrival, Dining, Experiences, Faq, Head, LuxHero, LuxPage, Mosaic, Quote, Reserve, Sec, roomHref } from "../lux/kit";

/**
 * ZAMINDAR (Luxury Collection) — heritage palaces and rajbaris.
 * Ivory paper, maroon ink, antique gold rules, arched photo frames and the house told chapter by chapter.
 */
export function ZamindarHome({ hotel }: { hotel: Hotel }) {
  return (
    <LuxPage
      hotel={hotel}
      master="zamindar"
      parts={{
        hero: <LuxHero hotel={hotel} variant="framed" eyebrow={`${hotel.area} · ${hotel.highlights[0] ?? hotel.city}`} />,
        story: <Story hotel={hotel} />,
        rooms: <Suites hotel={hotel} />,
        amenities: <Amenities hotel={hotel} src={photo(hotel, /garden/)} eyebrow="Within the walls" title="The house, as it was meant to be lived in" />,
        dining: <Dining hotel={hotel} eyebrow="The kitchen" title="Recipes kept by the family" />,
        experiences: <Experiences hotel={hotel} eyebrow="Days at the Rajbari" title="Slow afternoons, long evenings" />,
        gallery: <Mosaic hotel={hotel} eyebrow="Details" title="Carved, painted, restored by hand" />,
        reviews: <Quote hotel={hotel} eyebrow="Guests of the house" />,
        faq: <Faq hotel={hotel} />,
        arrival: <Arrival hotel={hotel} src={photo(hotel, /domes/)} eyebrow="Finding the house" />,
        reserve: <Reserve hotel={hotel} src={photo(hotel, /arch|atrium/)} title="The doors are open" eyebrow="Stay at the house" />,
      }}
    />
  );
}

/** Signature: the house through time — chapters with large years, an arched photo beside. */
function Story({ hotel }: { hotel: Hotel }) {
  if (!hotel.story?.length) return null;
  return (
    <Sec>
      <Container>
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
          <Reveal className="md:sticky md:top-28 md:self-start">
            <Head hotel={hotel} k="story.title" eyebrow="The story" title="The house through time" className="!mb-8" />
            <div className="lux-arch relative mx-auto aspect-[3/4] max-w-[420px] overflow-hidden border border-[color:var(--lux-accent)] p-2 md:mx-0">
              <div className="lux-arch relative h-full w-full overflow-hidden"><Image src={photo(hotel, /arch|domes/)} alt="" fill sizes="420px" className="object-cover" /></div>
            </div>
          </Reveal>
          <Reveal>
            <ol>
              {hotel.story.map((c, i) => (
                <li key={c.time} className="grid grid-cols-[72px_1fr] gap-5 border-t border-[color:var(--lux-accent)]/50 py-7 md:grid-cols-[150px_1fr] md:gap-8 md:py-10">
                  <p className="lux-display text-[30px] text-[color:var(--lux-accent-ink)] md:text-[52px]">{c.time}</p>
                  <div>
                    <p className="lux-eyebrow !text-muted"><T>Chapter</T> {["I", "II", "III", "IV", "V", "VI", "VII"][i]}</p>
                    <h3 className="lux-display mt-2 text-[24px] md:text-[32px]">{c.title}</h3>
                    <p className="mt-2 text-[15.5px] leading-relaxed text-muted md:text-[17px]">{c.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </Sec>
  );
}

/** Suites in arched frames. */
function Suites({ hotel }: { hotel: Hotel }) {
  return (
    <Sec>
      <Container>
        <Reveal><Head hotel={hotel} k="rooms.title" eyebrow="Suites & rooms" title="Fourteen rooms, no two alike" center /></Reveal>
        <RevealGroup className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {hotel.rooms.map((r) => (
            <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
              <RevealItem className="text-center">
                <Link href={roomHref(hotel, r)} className="group block">
                  <div className="lux-arch relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden border border-[color:var(--lux-accent)] p-1.5">
                    <div className="lux-arch relative h-full w-full overflow-hidden"><Image src={r.photos[0]} alt="" fill sizes="(max-width: 640px) 90vw, 300px" className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" /></div>
                  </div>
                  <h3 className="lux-display mt-6 text-[28px]">{r.name}</h3>
                  <p className="mx-auto mt-2 max-w-[280px] text-[15px] leading-relaxed text-muted">{r.short}</p>
                  <p className="mt-3 text-[14.5px]"><span className="text-muted"><T>From</T> </span><b className="tabular-nums">{formatMoney(r.fromPrice)}</b><span className="text-muted"> <T>/ night</T></span></p>
                  <span className="lux-link mt-4"><T>View suite</T></span>
                </Link>
              </RevealItem>
            </SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </Sec>
  );
}
