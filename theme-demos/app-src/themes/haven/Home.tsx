import type { Hotel } from "@/lib/types";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { DraftText } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { photo } from "../shared";
import { Amenities, Arrival, Dining, Experiences, Eyebrow, Head, LuxHero, LuxPage, Mosaic, Quote, Reserve, RoomCards, Sec, Timeline } from "../lux/kit";

/**
 * HAVEN (Luxury Collection) — wellness and spa retreats.
 * Sage and sand, soft rounded frames, light Fraunces, a breathing circle and the rituals of the day.
 */
export function HavenHome({ hotel }: { hotel: Hotel }) {
  return (
    <LuxPage
      hotel={hotel}
      master="haven"
      parts={{
        hero: <LuxHero hotel={hotel} variant="framed" eyebrow={`${hotel.area} · ${hotel.city}`} />,
        signature: <Breathe hotel={hotel} />,
        journey: <Timeline hotel={hotel} items={hotel.dayPlan} eyebrow="Rituals" title="The shape of a day" k="journey.title" center />,
        rooms: (
          <Sec>
            <Container>
              <Head hotel={hotel} k="rooms.title" eyebrow="Villas" title="Places to rest" center />
              <RoomCards hotel={hotel} aspect="aspect-[4/5]" />
            </Container>
          </Sec>
        ),
        experiences: <Experiences hotel={hotel} cats={["spa", "activity"]} eyebrow="Treatments & practice" title="Care, not a menu" />,
        dining: <Dining hotel={hotel} eyebrow="Nourish" title="Cooked from the garden" />,
        amenities: <Amenities hotel={hotel} src={photo(hotel, /plunge|pool-trees/)} eyebrow="The retreat" title="Everything here is slow on purpose" />,
        gallery: <Mosaic hotel={hotel} eyebrow="The retreat" title="Water, stone, green" />,
        reviews: <Quote hotel={hotel} eyebrow="In their words" />,
        arrival: <Arrival hotel={hotel} src={photo(hotel, /garden/)} eyebrow="Getting here" />,
        reserve: <Reserve hotel={hotel} src={photo(hotel, /pool-jungle|pool/)} title="Begin your retreat" />,
      }}
    />
  );
}

/** Signature: breathing circle (pauses for reduced motion) with the retreat's three promises (Highlights). */
function Breathe({ hotel }: { hotel: Hotel }) {
  return (
    <Sec>
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
          <Reveal className="relative mx-auto grid aspect-square w-full max-w-[420px] place-items-center">
            <span aria-hidden className="lux-breathe absolute inset-0 rounded-full bg-[color:var(--lux-accent)]/25" />
            <span aria-hidden className="lux-breathe absolute inset-[14%] rounded-full bg-[color:var(--lux-accent)]/30 [animation-delay:-1.5s]" />
            <span aria-hidden className="absolute inset-[30%] rounded-full bg-surface shadow-[0_20px_60px_-30px_rgb(30_42_34/0.5)]" />
            <p className="relative text-center"><span className="lux-display block text-[30px] md:text-[38px]"><T>Breathe in</T></span><span className="mt-1 block text-[13px] text-muted"><T>four · hold · out for six</T></span></p>
          </Reveal>
          <Reveal delay={0.05}>
            <Eyebrow>Our promise</Eyebrow>
            <span aria-hidden className="lux-rule mt-4" />
            <h2 className="lux-display mt-5 text-[34px] md:text-[58px]"><DraftText slug={hotel.slug} k="signature.title" fallback="Rest is the whole point" /></h2>
            <RevealGroup className="mt-8 space-y-4">
              {hotel.highlights.map((h, i) => (
                <RevealItem key={h} className="flex items-start gap-5 rounded-[var(--lux-r)] bg-surface p-5 md:p-6">
                  <span className="lux-display grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--lux-accent)]/20 text-[20px] text-[color:var(--lux-accent-ink)]">{i + 1}</span>
                  <p className="pt-1.5 text-[17px] leading-relaxed md:text-[19px]">{h}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </Reveal>
        </div>
      </Container>
    </Sec>
  );
}
