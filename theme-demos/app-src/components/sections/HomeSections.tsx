import { presetFor } from "@/lib/presets";
import { CancelShort } from "@/components/site/SiteRules";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Clock, MapPin, MessageCircle, Navigation, Phone, Quote, ShieldCheck, Sparkles, Star, Tag, UtensilsCrossed, Wallet } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { availablePages, formatMoney, showRating, visibleOffers } from "@/lib/data";
import { Container, MobileMore, SectionHead } from "@/components/ui/Section";
import { RoomCard } from "@/components/rooms/RoomCard";
import { ButtonLink } from "@/components/ui/Button";
import { SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

/* ---------- 1. Real facts instead of a generic trust strip ---------- */
export function FactsStrip({ hotel }: { hotel: Hotel }) {
  const payAtHotel = hotel.payments.some((p) => p.kind === "pay-at-property");
  const freeCancel = /free cancellation/i.test(hotel.policies.cancellation);
  const cancelHours = hotel.policies.cancellation.match(/(\d+)\s*hours/)?.[1];
  const facts = [
    showRating(hotel) && { icon: Star, title: `${hotel.reviewScore} / 5 guest rating`, sub: `${hotel.reviewCount} verified reviews` },
    { icon: Clock, title: `Check-in ${hotel.checkIn}`, sub: `Check-out ${hotel.checkOut}` },
    freeCancel && { icon: ShieldCheck, title: "Free cancellation", sub: <CancelShort hotel={hotel} fallback={cancelHours ? `Up to ${cancelHours} hours before arrival` : "See policy"} /> },
    payAtHotel && { icon: Wallet, title: "Pay on arrival", sub: "No prepayment needed" },
  ].filter(Boolean) as { icon: typeof Star; title: string; sub: string }[];

  return (
    <Reveal delay={0.45} className="mx-auto mt-5 max-w-[1240px] md:mt-12 md:px-6">
      {/* phone: one swipe row of compact chips · tablet: 2×2 · desktop: 4 in a row */}
      <ul tabIndex={0} aria-label="Key facts" className="no-scrollbar flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:px-0 lg:grid-cols-4">
        {facts.map((f) => (
          <li key={f.title} className="flex shrink-0 snap-start items-center gap-3 rounded-2xl border border-line bg-surface p-3 pr-4 md:p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-action md:size-11">
              <f.icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block whitespace-nowrap text-[14px] font-semibold leading-tight md:whitespace-normal md:text-[15px]"><T>{f.title}</T></span>
              <span className="mt-0.5 block whitespace-nowrap text-[12px] text-muted md:whitespace-normal md:text-[13px]">{f.sub}</span>
            </span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/* ---------- 1b. Phone quick links (app-style tiles) ---------- */
export function QuickLinks({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  const items = [
    { href: `${base}/rooms`, label: "Rooms", icon: BedDouble },
    availablePages(hotel).dining && { href: `${base}/dining`, label: "Dining", icon: UtensilsCrossed },
    { href: `${base}/experiences`, label: "Experiences", icon: Sparkles },
    visibleOffers(hotel).length > 0 && { href: `${base}/offers`, label: "Offers", icon: Tag },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Star }[];
  return (
    <nav aria-label="Quick links" className="mt-5 grid grid-cols-4 gap-2 px-4 md:hidden">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className="flex flex-col items-center gap-1.5 rounded-2xl py-2 active:scale-95 active:bg-canvas">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-action"><i.icon className="size-[22px]" /></span>
          <span className="text-[12px] font-semibold"><T>{i.label}</T></span>
        </Link>
      ))}
    </nav>
  );
}

/* ---------- 2. Featured stays ---------- */
export function FeaturedStays({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  const rooms = hotel.rooms.filter((r) => r.featured).slice(0, 3);
  const list = rooms.length ? rooms : hotel.rooms.slice(0, 3);
  return (
    <section className="mt-9 md:mt-24">
      <Container>
        <Reveal>
          <SectionHead slug={hotel.slug} title={presetFor(hotel.propertyType).unitsLabel} link={{ href: `${base}/rooms`, label: "All rooms" }} />
        </Reveal>
      </Container>
      {/* phone: swipe row; tablet: 2-up; desktop: 3-up */}
      <RevealGroup className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:px-6 md:mx-auto md:grid md:max-w-[1240px] md:grid-cols-2 md:gap-5 md:overflow-visible lg:grid-cols-3">
        {list.map((r) => (
          <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}><RevealItem className="w-[82%] max-w-[340px] shrink-0 snap-start md:w-auto md:max-w-none">
            <RoomCard room={r} href={`${base}/rooms/${r.slug}`} layout="vertical" />
          </RevealItem></SiteVisible>
        ))}
      </RevealGroup>
      <Container>
        <MobileMore href={`${base}/rooms`} label={`See all ${hotel.rooms.length} rooms`} />
      </Container>
    </section>
  );
}

/* ---------- 3. Dining + experiences teaser ---------- */
export function DineAndDo({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  const outlet = availablePages(hotel).dining ? hotel.outlets.find((o) => o.photo) : undefined;
  const exps = hotel.services.filter((s) => s.photo).slice(0, 3);
  if (!outlet && !exps.length) return null;
  return (
    <section className="mt-9 md:mt-24">
      <Container>
        <Reveal>
          <SectionHead slug={hotel.slug} title="Eat well, slow down" />
        </Reveal>
        <RevealGroup className="grid gap-4 md:gap-5 lg:grid-cols-[1.25fr_1fr]">
          <RevealItem>
          {outlet && (
            <article className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card md:flex lg:flex-col">
              <div className="relative aspect-[16/10] md:aspect-auto md:w-1/2 lg:aspect-[16/8] lg:w-full">
                <Image src={outlet.photo!} alt={outlet.name} fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h3 className="text-2xl font-bold">{outlet.name}</h3>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-muted">
                  <span className="flex items-center gap-1.5"><Clock className="size-4" /> {outlet.hours}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {outlet.location}</span>
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5 md:mt-auto md:pt-5">
                  <ButtonLink href={`${base}/dining`}><T>View menu</T></ButtonLink>
                  {outlet.tableRequest && <ButtonLink href={`${base}/dining#table`} variant="outline"><T>Request a table</T></ButtonLink>}
                </div>
              </div>
            </article>
          )}
          </RevealItem>
          <RevealItem>
          <div className="h-full rounded-3xl border border-line bg-surface p-2 shadow-card">
            <p className="px-3 pb-1 pt-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-action">Experiences</p>
            <ul>
              {exps.map((s) => (
                <SiteVisible key={s.id} slug={hotel.slug} kind="services" id={s.id}><li>
                  <Link href={`${base}/experiences`} className="group flex items-center gap-4 rounded-2xl p-3 hover:bg-canvas">
                    <span className="relative size-[72px] shrink-0 overflow-hidden rounded-2xl md:size-20">
                      <Image src={s.photo!} alt="" fill sizes="80px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="mt-1 block text-[14px] font-semibold">
                        {formatMoney(s.price)} <span className="font-normal text-muted">{s.unit}</span>
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-action" />
                  </Link>
                </li></SiteVisible>
              ))}
            </ul>
            <Link href={`${base}/experiences`} className="m-1 mt-0 flex h-12 items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-action hover:bg-brand-soft">
              <T>All experiences</T> <ArrowRight className="size-4" />
            </Link>
          </div>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- 4. Offers (discounts only until Packages is live) ---------- */
export function OffersTeaser({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  const offers = visibleOffers(hotel).slice(0, 2);
  if (!offers.length) return null;
  return (
    <section className="mt-9 md:mt-24">
      <Container>
        <Reveal>
          <SectionHead slug={hotel.slug} title="Book direct, pay less" link={{ href: `${base}/offers`, label: "All offers" }} />
        </Reveal>
        <RevealGroup className="grid gap-4 md:grid-cols-2 md:gap-5">
          {offers.map((o) => (
            <SiteVisible key={o.id} slug={hotel.slug} kind="offers" id={o.id}><RevealItem>
            <Link href={`${base}/offers`} className="group flex overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-shadow hover:shadow-float">
              {o.photo && (
                <span className="relative w-[38%] shrink-0 sm:w-[42%]">
                  <Image src={o.photo} alt="" fill sizes="(max-width: 768px) 40vw, 260px" className="object-cover" />
                </span>
              )}
              <span className="flex flex-1 flex-col p-4 sm:p-5">
                <span className="w-fit rounded-full bg-action px-3 py-1 text-[13px] font-bold text-on-action">{o.value}</span>
                <span className="mt-3 text-lg font-bold leading-snug">{o.title}</span>
                <span className="mt-1 text-[14px] text-muted">{o.short}</span>
              </span>
            </Link>
            </RevealItem></SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- 5. Reviews (real only, hidden under 5) ---------- */
export function Reviews({ hotel }: { hotel: Hotel }) {
  if (!showRating(hotel) || !hotel.reviews.length) return null;
  return (
    <section className="mt-9 md:mt-24">
      <Container>
        <Reveal className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-10">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-action"><T>Guest reviews</T></p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-5xl font-bold">{hotel.reviewScore}</span>
              <span className="text-lg text-muted">/ 5</span>
            </p>
            <p className="mt-1 text-[15px] text-muted">{hotel.reviewCount} reviews</p>
          </div>
          <div tabIndex={0} role="region" aria-label="Guest reviews" className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
            {hotel.reviews.map((r) => (
              <SiteVisible key={r.id} slug={hotel.slug} kind="reviews" id={r.id}><figure className="flex w-[82%] max-w-[340px] shrink-0 snap-start flex-col rounded-3xl border border-line bg-surface p-5 md:w-auto md:max-w-none">
                <Quote className="size-6 text-brand" />
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">{r.text}</blockquote>
                <figcaption className="mt-4 flex items-center justify-between text-[13px]">
                  <span>
                    <span className="block font-semibold">{r.name}</span>
                    <span className="text-muted">{r.from} · {r.stayed}</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold"><Star className="size-4 fill-brand text-brand" /> {r.score}</span>
                </figcaption>
              </figure></SiteVisible>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- 6. Location & contact ---------- */
export function LocationBlock({ hotel }: { hotel: Hotel }) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${hotel.address}`)}`;
  const tel = `tel:${hotel.phone.replace(/[^+\d]/g, "")}`;
  return (
    <section className="mb-10 mt-9 md:mb-24 md:mt-24">
      <Container>
        <Reveal className="overflow-hidden rounded-[32px] border border-line bg-surface shadow-card lg:grid lg:grid-cols-[1fr_1.1fr]">
          <div className="p-6 md:p-10">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-action"><T>Find us</T></p>
            <h2 className="mt-2 text-2xl font-bold md:text-[32px]">{hotel.area}</h2>
            <p className="mt-3 flex gap-2 text-[15px] text-muted"><MapPin className="mt-0.5 size-[18px] shrink-0" /> {hotel.address}</p>
            <dl className="mt-6 grid grid-cols-2 gap-3 text-[14px]">
              <div className="rounded-2xl bg-canvas p-3.5"><dt className="text-muted">Check-in</dt><dd className="mt-0.5 font-semibold">{hotel.checkIn}</dd></div>
              <div className="rounded-2xl bg-canvas p-3.5"><dt className="text-muted">Check-out</dt><dd className="mt-0.5 font-semibold">{hotel.checkOut}</dd></div>
            </dl>
            <div className="mt-6 grid gap-2.5 sm:flex sm:flex-wrap">
              <ButtonLink href={maps} variant="primary"><Navigation className="size-4" /> <T>Get directions</T></ButtonLink>
              <ButtonLink href={tel} variant="outline"><Phone className="size-4" /> <T>Call</T></ButtonLink>
              {hotel.whatsapp && (
                <ButtonLink href={`https://wa.me/${hotel.whatsapp.replace(/\D/g, "")}`} variant="outline"><MessageCircle className="size-4" /> WhatsApp</ButtonLink>
              )}
            </div>
          </div>
          {/* Map slot: real map embed comes from the hotel's coordinates (B5). Until then, a calm placeholder that links to Google Maps. */}
          <a href={maps} className="relative block min-h-[220px] overflow-hidden bg-brand-soft lg:min-h-full" aria-label="Open in Google Maps">
            <svg className="absolute inset-0 size-full text-brand-ring" aria-hidden>
              <defs>
                <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
                  <path d="M36 0H0V36" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <path d="M-20 160 C 120 120, 220 220, 380 150 S 640 120, 900 190" fill="none" stroke="currentColor" strokeWidth="14" opacity="0.6" />
            </svg>
            <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
              <span className="grid size-14 place-items-center rounded-full bg-action text-on-action shadow-float"><MapPin className="size-6" /></span>
              <span className="rounded-full bg-surface px-3 py-1.5 text-[13px] font-semibold shadow-card">Open in Google Maps</span>
            </span>
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
