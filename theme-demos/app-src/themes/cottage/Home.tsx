import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, Coffee, Flame, Footprints, Languages, MessageCircle, Moon, Mountain, Navigation, Phone, Star, Sun, Sunrise, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { Hotel } from "@/lib/types";
import { formatMoney, showRating } from "@/lib/data";
import { presetFor } from "@/lib/presets";
import { SearchBar } from "@/components/booking/SearchBar";
import { HeroIn, PhotoIn, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { Reviews } from "@/components/sections/HomeSections";
import { DraftSections, DraftText, SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { FromPrice, PhoneHeroCard, guests, mapsLink, photo, telLink, waLink } from "../shared";

/**
 * COTTAGE (Starter plan) — cottages, eco-lodges, hill and village stays.
 * Earthy and slow: each cottage gets a full row, the day is told morning → night, and the way up the hill is clear.
 */
export function CottageHome({ hotel }: { hotel: Hotel }) {
  return (
    <DraftSections
      slug={hotel.slug}
      master="cottage"
      items={[
        { id: "hero", node: <Hero hotel={hotel} /> },
        { id: "cottages", node: <Cottages hotel={hotel} /> },
        { id: "day", node: <ADayHere hotel={hotel} /> },
        { id: "host", node: hotel.host ? <Host hotel={hotel} /> : null },
        { id: "getting-here", node: <GettingHere hotel={hotel} /> },
        { id: "reviews", node: <Reviews hotel={hotel} /> },
        { id: "book-band", node: <BookBand hotel={hotel} /> },
      ]}
    />
  );
}

function Title({ label, title, center }: { label: string; title: ReactNode; center?: boolean }) {
  return (
    <div className={center ? "mb-6 text-center md:mb-12" : "mb-5 md:mb-10"}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action md:text-[13px]"><T>{label}</T></p>
      <h2 className="mt-1.5 font-heading text-[26px] leading-tight md:mt-2 md:text-[44px]">{typeof title === "string" ? <T>{title}</T> : title}</h2>
    </div>
  );
}

/* ---------- Hero: photo with a soft arch, title beside it ---------- */
function Hero({ hotel }: { hotel: Hotel }) {
  const nearest = hotel.nearby?.[0];
  return (
    <section>
      <PhoneHeroCard hotel={hotel} radius={28} />
      <Container className="pt-5 md:pt-12 lg:pt-16">
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-14">
          <HeroIn delay={0.05}>
            <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-action md:text-[13px]">
              <Mountain className="size-4" /> {presetFor(hotel.propertyType).placeTitle} · {hotel.city}
            </p>
            <h1 className="mt-3 font-heading text-[34px] leading-[1.06] md:text-[58px] lg:text-[68px]">
              <DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} />
            </h1>
            <p className="mt-4 max-w-[480px] text-[15px] leading-relaxed text-muted md:text-[18px]"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[14px] md:text-[15px]">
              {showRating(hotel) && (
                <span className="flex items-center gap-1.5"><Star className="size-4 fill-brand text-brand" /> <b>{hotel.reviewScore}</b> <span className="text-muted">· {hotel.reviewCount} reviews</span></span>
              )}
              <span className="text-muted">{hotel.rooms.reduce((n, r) => n + r.units, 0)} cottages</span>
              {nearest && <span className="flex items-center gap-1.5 text-muted">{nearest.mode === "walk" ? <Footprints className="size-4" /> : <Car className="size-4" />} {nearest.time} to {nearest.name}</span>}
            </div>
          </HeroIn>
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[32px] md:block lg:aspect-[5/6]">
            <PhotoIn className="absolute inset-0">
              <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="(max-width: 1240px) 55vw, 640px" quality={85} className="object-cover" />
            </PhotoIn>
          </div>
        </div>
        <HeroIn delay={0.2} className="relative z-10 mx-auto mt-5 max-w-[1040px] md:-mt-10">
          <SearchBar />
        </HeroIn>
      </Container>
    </section>
  );
}

/* ---------- Cottages: one generous row each, alternating sides ---------- */
function Cottages({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal><Title label={presetFor(hotel.propertyType).unitsLabel} title={<DraftText slug={hotel.slug} k="cottages.title" fallback="Each cottage has its own corner of the hill" />} /></Reveal>
        <div className="space-y-10 md:space-y-20">
          {hotel.rooms.map((r, i) => (
            <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
              <Reveal className={`grid gap-4 md:grid-cols-2 md:items-center md:gap-14 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <Link href={`${base}/rooms/${r.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-[28px]">
                  <Image src={r.photos[0]} alt={r.name} fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                </Link>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">{r.view ? `${r.view} view` : "Cottage"}</p>
                  <h3 className="mt-1.5 font-heading text-[26px] leading-tight md:text-[38px]">{r.name}</h3>
                  <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-muted md:text-[17px]">{r.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {[guests(r), r.bed, ...r.amenities.slice(0, 3)].map((a) => (
                      <li key={a} className="rounded-full border border-line px-3 py-1 text-[13px]">{a}</li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <FromPrice room={r} className="text-[16px]" />
                    <Link href={`${base}/rooms/${r.slug}`} className="inline-flex h-11 items-center gap-1.5 rounded-full bg-action px-5 text-[15px] font-semibold text-on-action transition-transform active:scale-[0.97]">
                      <T>Book this cottage</T> <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </SiteVisible>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- A day here: morning → night, from HMS services and facilities ---------- */
function ADayHere({ hotel }: { hotel: Hotel }) {
  const meal = hotel.services.find((s) => s.category === "stay");
  const walk = hotel.services.find((s) => s.category === "activity");
  const fire = hotel.facilities.find((f) => f.icon === "flame");
  const dinner = hotel.services.filter((s) => s.category === "stay")[1];
  const steps = [
    { icon: Sunrise, time: "Morning", title: meal?.name, text: meal?.short, price: meal && `${formatMoney(meal.price)} ${meal.unit}`, add: meal?.addToStay, sid: meal?.id },
    { icon: Sun, time: "Afternoon", title: walk?.name, text: walk?.short, price: walk && `${formatMoney(walk.price)} ${walk.unit}`, add: walk?.addToStay, sid: walk?.id },
    { icon: Coffee, time: "Evening", title: dinner?.name, text: dinner?.short, price: dinner && `${formatMoney(dinner.price)} ${dinner.unit}`, add: dinner?.addToStay, sid: dinner?.id },
    { icon: fire ? Flame : Moon, time: "Night", title: fire?.name, text: fire?.short, price: undefined, add: false, sid: undefined as string | undefined },
  ].filter((s) => s.title);
  if (steps.length < 2) return null;
  const pic = photo(hotel, /bonfire|fire/);
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <div className="grid gap-8 rounded-[32px] bg-brand-soft p-5 md:grid-cols-[1fr_1fr] md:gap-14 md:p-12">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[24px] md:aspect-auto">
            <Image src={pic} alt="" fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
          </Reveal>
          <div>
            <Reveal><Title label="A day here" title={<DraftText slug={hotel.slug} k="copy.slow-days-warm-evenings" fallback="Slow days, warm evenings" />} /></Reveal>
            <RevealGroup className="relative space-y-6 border-l border-action/30 pl-6">
              {steps.map((s) => (
                <SiteVisible key={s.time} slug={hotel.slug} kind="services" id={s.sid ?? "-"}><RevealItem className="relative">
                  <span className="absolute -left-[37px] top-0 grid size-6 place-items-center rounded-full bg-action text-on-action"><s.icon className="size-3.5" /></span>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-action"><T>{s.time}</T></p>
                  <p className="mt-0.5 font-heading text-[20px] leading-tight md:text-[24px]">{s.title}</p>
                  {s.text && <p className="mt-1 text-[15px] text-muted">{s.text}</p>}
                  {s.price && <p className="mt-1 text-[14px] font-semibold">{s.price}{s.add && <> · <span className="font-normal text-muted"><T>add when you book</T></span></>}</p>}
                </RevealItem></SiteVisible>
              ))}
            </RevealGroup>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Host ---------- */
function Host({ hotel }: { hotel: Hotel }) {
  const h = hotel.host!;
  const initials = h.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal className="mx-auto grid max-w-[980px] items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <span className="grid size-20 place-items-center rounded-full bg-action font-heading text-[30px] text-on-action md:size-28 md:text-[40px]">{initials}</span>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-action"><T>{h.role}</T> · {h.name}</p>
            <p className="mt-2 font-heading text-[20px] leading-relaxed md:text-[26px]">“{h.note}”</p>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-muted">
              <span>Hosting since {h.since}</span>
              <span className="flex items-center gap-1.5"><Languages className="size-4" /> {h.languages.join(" · ")}</span>
            </p>
            <a href={waLink(hotel, `Hello ${h.name.split(" ")[0]}, I have a question about ${hotel.name}.`)} target="_blank" rel="noopener" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[15px] font-semibold transition-transform active:scale-[0.98]">
              <MessageCircle className="size-[18px] text-action" /> <T>Message the host</T>
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- Getting here: road notes matter for hill stays ---------- */
function GettingHere({ hotel }: { hotel: Hotel }) {
  if (!hotel.nearby?.length) return null;
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-start md:gap-14">
          <Reveal>
            <Title label="Getting here" title={`${hotel.area}, ${hotel.city}`} />
            <p className="-mt-3 text-[15px] text-muted md:-mt-6">{hotel.address}</p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {hotel.nearby.map((n) => (
                <li key={n.name} className="flex items-center justify-between gap-3 py-3.5">
                  <span className="flex items-center gap-3 text-[15px] md:text-[16px]">{n.mode === "walk" ? <Footprints className="size-[18px] text-muted" /> : <Car className="size-[18px] text-muted" />}{n.name}</span>
                  <span className="shrink-0 text-[15px] font-semibold tabular-nums">{n.time}</span>
                </li>
              ))}
            </ul>
            <a href={mapsLink(hotel)} target="_blank" rel="noopener" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-action px-6 text-[15px] font-semibold text-on-action transition-transform active:scale-[0.98]">
              <Navigation className="size-4" /> <T>Get directions</T>
            </a>
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/3] overflow-hidden rounded-[28px] md:aspect-[4/5]">
            <Image src={photo(hotel, /path|aerial/)} alt="" fill sizes="(max-width: 768px) 100vw, 520px" className="object-cover" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Book band ---------- */
function BookBand({ hotel }: { hotel: Hotel }) {
  const cheapest = Math.min(...hotel.rooms.map((r) => r.fromPrice));
  return (
    <section className="mb-12 mt-14 md:mb-24 md:mt-24">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[32px] px-5 py-12 text-center text-white md:px-12 md:py-20">
          <Image src={photo(hotel, /aerial|cabin-a/)} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative">
            <h2 className="font-heading text-[30px] leading-tight md:text-[48px]"><DraftText slug={hotel.slug} k="copy.come-stay-a-while" fallback="Come stay a while" /></h2>
            <p className="mx-auto mt-2 max-w-[460px] text-[15px] opacity-90 md:text-[17px]">From {formatMoney(cheapest)} a night · Check-in {hotel.checkIn}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link href={`/hotel/${hotel.slug}/rooms`} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-[#1d1d1f] transition-transform active:scale-[0.98]">
                <Users className="size-4" /> <T>See cottages & prices</T>
              </Link>
              <a href={telLink(hotel)} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/50 px-6 text-[15px] font-semibold transition-colors hover:bg-white/10">
                <Phone className="size-4" /> {hotel.phone}
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
