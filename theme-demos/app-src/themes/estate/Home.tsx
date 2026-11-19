import Image from "next/image";
import { MessageCircle } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { DraftText } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { photo, waLink } from "../shared";
import { Amenities, Arrival, Dining, Experiences, Eyebrow, Faq, Head, LuxHero, LuxPage, Mosaic, Quote, Reserve, RoomRows, Sec } from "../lux/kit";

/**
 * ESTATE (Luxury Collection) — private villa estates and exclusive-use houses.
 * Stone and olive, Cormorant over Instrument Sans, the whole estate at a glance (sleeps, bedrooms, pools) and villas as large rows.
 */
export function EstateHome({ hotel }: { hotel: Hotel }) {
  return (
    <LuxPage
      hotel={hotel}
      master="estate"
      parts={{
        hero: <LuxHero hotel={hotel} variant="left" eyebrow={`${hotel.area} · ${hotel.city}`} />,
        signature: <WholeEstate hotel={hotel} />,
        rooms: (
          <Sec>
            <Container>
              <Head hotel={hotel} k="rooms.title" eyebrow="The villas" title="Book one, or book them all" />
              <RoomRows hotel={hotel} />
            </Container>
          </Sec>
        ),
        experiences: <Experiences hotel={hotel} eyebrow="Arranged for you" title="Dinners, celebrations, slow days" />,
        dining: <Dining hotel={hotel} eyebrow="The kitchen" title="A chef who cooks for you alone" />,
        amenities: <Amenities hotel={hotel} src={photo(hotel, /living-room/)} eyebrow="On the estate" title="Staffed like a house, private like a home" />,
        gallery: <Mosaic hotel={hotel} eyebrow="The estate" title="Light, stone, water, trees" />,
        reviews: <Quote hotel={hotel} />,
        faq: <Faq hotel={hotel} />,
        arrival: <Arrival hotel={hotel} src={photo(hotel, /infinity/)} eyebrow="Finding us" />,
        reserve: <Reserve hotel={hotel} src={photo(hotel, /villa-white/)} title="The gates open at two" />,
      }}
    />
  );
}

/** Signature: the whole estate at a glance — counts come from Rooms (units × bedrooms / guests). Exclusive use is an enquiry, not instant booking. */
function WholeEstate({ hotel }: { hotel: Hotel }) {
  const sleeps = hotel.rooms.reduce((n, r) => n + (r.maxAdults + r.maxChildren) * r.units, 0);
  const bedrooms = hotel.rooms.reduce((n, r) => n + (r.bedrooms ?? 1) * r.units, 0);
  const villas = hotel.rooms.reduce((n, r) => n + r.units, 0);
  const pools = hotel.rooms.filter((r) => r.amenities.some((a) => /pool/i.test(a))).length;
  const stats = [
    { v: villas, k: villas === 1 ? "villa" : "villas" },
    { v: bedrooms, k: "bedrooms" },
    { v: sleeps, k: "guests" },
    ...(pools ? [{ v: pools, k: pools === 1 ? "pool" : "pools" }] : []),
  ];
  return (
    <Sec>
      <Container>
        <div className="grid overflow-hidden rounded-[var(--lux-r)] bg-surface md:grid-cols-[1.1fr_1fr]">
          <Reveal className="relative min-h-[320px] md:min-h-[560px]"><Image src={photo(hotel, /living|pool-deck/)} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" /></Reveal>
          <Reveal delay={0.05} className="flex flex-col justify-center p-6 md:p-14">
            <Eyebrow>Exclusive use</Eyebrow>
            <span aria-hidden className="lux-rule mt-4" />
            <h2 className="lux-display mt-5 text-[34px] md:text-[52px]"><DraftText slug={hotel.slug} k="signature.title" fallback="The whole estate is yours" /></h2>
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line">
              {stats.map((s) => (
                <div key={s.k} className="bg-surface p-5">
                  <dt className="sr-only"><T>{s.k}</T></dt>
                  <dd><span className="lux-display block text-[44px] tabular-nums md:text-[56px]">{s.v}</span><span className="lux-eyebrow !text-muted" aria-hidden><T>{s.k}</T></span></dd>
                </div>
              ))}
            </dl>
            <ul className="mt-6 space-y-2 text-[15.5px]">
              {hotel.highlights.map((h) => <li key={h} className="flex gap-3"><span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-[color:var(--lux-accent)]" />{h}</li>)}
            </ul>
            <a href={waLink(hotel, `Hello ${hotel.name}, we'd like to book the whole estate. Dates: … Guests: …`)} target="_blank" rel="noopener" className="lux-btn mt-8 self-start"><MessageCircle className="size-4" aria-hidden /> <T>Ask for the whole estate</T></a>
            <p className="mt-3 text-[13px] text-muted"><T>Whole-estate stays are confirmed by our team, usually within a few hours.</T></p>
          </Reveal>
        </div>
      </Container>
    </Sec>
  );
}
