import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Car, Footprints, Navigation, Sailboat, Sparkles, Star, Sun, UtensilsCrossed, Waves, Flower2, Wifi } from "lucide-react";
import type { ReactNode } from "react";
import type { Hotel } from "@/lib/types";
import { formatMoney, showRating, visibleOffers } from "@/lib/data";
import { SearchBar } from "@/components/booking/SearchBar";
import { HeroIn, PhotoIn, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { Reviews } from "@/components/sections/HomeSections";
import { DraftSections, DraftText, SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { FromPrice, PhoneHeroCard, guests, mapsLink, photo } from "../shared";

const ICONS: Record<string, typeof Waves> = { waves: Waves, utensils: UtensilsCrossed, spa: Flower2, sun: Sun, boat: Sailboat, wifi: Wifi };

/**
 * ESCAPE (Business plan) — beach, island and nature resorts below the GRAND tier.
 * Sunny and relaxed: one big photo, stays in a swipe row, the days told through activities, and an honest "how to get here".
 */
export function EscapeHome({ hotel }: { hotel: Hotel }) {
  return (
    <DraftSections
      slug={hotel.slug}
      master="escape"
      items={[
        { id: "hero", node: <Hero hotel={hotel} /> },
        { id: "stays", node: <Stays hotel={hotel} /> },
        { id: "days", node: <Days hotel={hotel} /> },
        { id: "unwind", node: <Unwind hotel={hotel} /> },
        { id: "offers", node: <Offers hotel={hotel} /> },
        { id: "getting-here", node: <GettingHere hotel={hotel} /> },
        { id: "reviews", node: <Reviews hotel={hotel} /> },
      ]}
    />
  );
}

function Head({ label, title, center }: { label: string; title: ReactNode; center?: boolean }) {
  return (
    <div className={center ? "mb-6 text-center md:mb-12" : "mb-5 md:mb-10"}>
      <p className="text-[13px] font-semibold text-action md:text-[14px]"><T>{label}</T></p>
      <h2 className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[44px]">{typeof title === "string" ? <T>{title}</T> : title}</h2>
    </div>
  );
}

/* ---------- Hero: full-bleed, centred, floating booking bar ---------- */
function Hero({ hotel }: { hotel: Hotel }) {
  return (
    <section>
      <PhoneHeroCard hotel={hotel} radius={26} />
      <div className="relative mx-auto hidden h-[min(88svh,860px)] min-h-[580px] max-w-[1440px] overflow-hidden md:block md:rounded-b-[36px]">
        <PhotoIn className="absolute inset-0"><Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" quality={85} className="object-cover" /></PhotoIn>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/50" />
        <Container className="relative flex h-full flex-col items-center justify-center pb-24 text-center text-white">
          <HeroIn delay={0.05}>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-[14px] font-medium backdrop-blur"><Sun className="size-4" /> {hotel.area}, {hotel.city}</p>
            <h1 className="mx-auto mt-5 max-w-[920px] text-[60px] font-bold leading-[1.0] tracking-[-0.03em] lg:text-[80px]"><DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} /></h1>
            <p className="mx-auto mt-5 max-w-[580px] text-[18px] leading-relaxed opacity-95"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
            {showRating(hotel) && <p className="mt-4 flex items-center justify-center gap-1.5 text-[15px]"><Star className="size-4 fill-white" /> <b>{hotel.reviewScore}</b> <span className="opacity-85">· {hotel.reviewCount} reviews</span></p>}
          </HeroIn>
        </Container>
      </div>
      <Container className="pt-5 md:hidden">
        <HeroIn delay={0.05}>
          <p className="text-[13px] font-semibold text-action">{hotel.area}, {hotel.city}</p>
          <h1 className="mt-1.5 text-[32px] font-bold leading-[1.05] tracking-[-0.02em]"><DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} /></h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
        </HeroIn>
      </Container>
      <Container className="relative z-10 mt-4 md:-mt-14">
        <HeroIn delay={0.2} className="mx-auto max-w-[1040px] md:rounded-[26px] md:shadow-[0_20px_50px_-20px_rgb(0_0_0/0.4)]"><SearchBar /></HeroIn>
      </Container>
    </section>
  );
}

/* ---------- Stays: swipe row ---------- */
function Stays({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  return (
    <section className="mt-14 md:mt-28">
      <Container><Reveal><Head label="Stays" title={<DraftText slug={hotel.slug} k="stays.title" fallback="Where you'll sleep" />} /></Reveal></Container>
      <RevealGroup className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:px-6 md:mx-auto md:max-w-[1240px] md:gap-6">
        {hotel.rooms.map((r) => (
          <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}><RevealItem className="w-[82%] max-w-[380px] shrink-0 snap-start md:w-[380px]">
            <Link href={`${base}/rooms/${r.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[26px]">
                <Image src={r.photos[0]} alt={r.name} fill sizes="380px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16 text-white">
                  <h3 className="text-[22px] font-bold leading-tight">{r.name}</h3>
                  <p className="mt-1 text-[14px] opacity-90">{guests(r)} · {r.bed}{r.view ? ` · ${r.view}` : ""}</p>
                </div>
              </div>
              <p className="mt-3 flex items-center justify-between px-1 text-[15px]"><FromPrice room={r} /><ArrowUpRight className="size-[18px] text-muted group-hover:text-action" /></p>
            </Link>
          </RevealItem></SiteVisible>
        ))}
      </RevealGroup>
    </section>
  );
}

/* ---------- Your days: activities from HMS services ---------- */
function Days({ hotel }: { hotel: Hotel }) {
  const acts = hotel.services.filter((s) => s.category === "activity" || s.category === "spa");
  if (!acts.length) return null;
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal><Head label="Your days" title={<DraftText slug={hotel.slug} k="copy.sun-sea-and-slow-afternoons" fallback="Sun, sea and slow afternoons" />} center /></Reveal>
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {acts.map((s) => (
            <SiteVisible key={s.id} slug={hotel.slug} kind="services" id={s.id}><RevealItem className="overflow-hidden rounded-[26px] bg-surface shadow-card">
              {s.photo && <div className="relative aspect-[16/11]"><Image src={s.photo} alt="" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" /></div>}
              <div className="p-5">
                <h3 className="text-[19px] font-bold">{s.name}</h3>
                <p className="mt-1 text-[15px] text-muted">{s.short}</p>
                <p className="mt-3 text-[15px]"><b>{formatMoney(s.price)}</b> <span className="text-muted">{s.unit}</span>{s.addToStay && <span className="ml-2 rounded-full bg-brand-soft px-2.5 py-0.5 text-[12.5px] font-semibold text-action"><T>Add to stay</T></span>}</p>
              </div>
            </RevealItem></SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Eat & unwind: facilities over one photo ---------- */
function Unwind({ hotel }: { hotel: Hotel }) {
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[30px]">
          <div className="relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9]"><Image src={photo(hotel, /infinity|pool/)} alt="" fill sizes="(max-width: 1240px) 100vw, 1240px" className="object-cover" /></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-5 text-white md:justify-center md:p-14">
            <p className="text-[13px] font-semibold opacity-85"><T>Eat & unwind</T></p>
            <h2 className="mt-1 max-w-[460px] text-[28px] font-bold leading-tight md:text-[44px]"><DraftText slug={hotel.slug} k="copy.everything-s-a-few-steps-away" fallback={"Everything's a few steps away"} /></h2>
            <ul className="mt-5 grid max-w-[520px] gap-3 sm:grid-cols-2">
              {hotel.facilities.slice(0, 6).map((f) => {
                const Icon = ICONS[f.icon] ?? Sparkles;
                return <li key={f.name} className="flex gap-2.5"><Icon className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} /><span><b className="block text-[15px]">{f.name}</b><span className="text-[13.5px] opacity-85">{f.short}</span></span></li>;
              })}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- Offers ---------- */
function Offers({ hotel }: { hotel: Hotel }) {
  const offers = visibleOffers(hotel).slice(0, 3);
  if (!offers.length) return null;
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal><Head label="Book direct" title={<DraftText slug={hotel.slug} k="copy.better-prices-here-than-anywhere-else" fallback="Better prices here than anywhere else" />} /></Reveal>
        <RevealGroup className={`grid gap-4 md:gap-6 ${offers.length === 1 ? "md:grid-cols-2" : offers.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {offers.map((o) => (
            <SiteVisible key={o.id} slug={hotel.slug} kind="offers" id={o.id}><RevealItem>
              <Link href={`/hotel/${hotel.slug}/offers`} className="group flex h-full flex-col rounded-[26px] bg-brand-soft p-6">
                <p className="text-[34px] font-bold leading-none text-action">{o.value}</p>
                <h3 className="mt-3 text-[19px] font-bold">{o.title}</h3>
                <p className="mt-1 text-[15px] text-muted">{o.conditions}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[15px] font-semibold text-action"><T>See offer</T> <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            </RevealItem></SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Getting here ---------- */
function GettingHere({ hotel }: { hotel: Hotel }) {
  if (!hotel.nearby?.length) return null;
  const transfer = hotel.services.find((s) => s.category === "transfer");
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-14">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[30px]"><Image src={photo(hotel, /beach|palms/)} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" /></Reveal>
          <Reveal delay={0.1}>
            <Head label="Getting here" title={`${hotel.area}, ${hotel.city}`} />
            <ul className="divide-y divide-line border-y border-line">
              {hotel.nearby.map((n) => (
                <li key={n.name} className="flex items-center justify-between gap-3 py-3.5">
                  <span className="flex items-center gap-3 text-[15px] md:text-[16px]">{n.mode === "walk" ? <Footprints className="size-[18px] text-muted" /> : <Car className="size-[18px] text-muted" />}{n.name}</span>
                  <span className="shrink-0 font-semibold tabular-nums">{n.time}</span>
                </li>
              ))}
            </ul>
            {transfer && <SiteVisible slug={hotel.slug} kind="services" id={transfer.id}><p className="mt-4 rounded-[18px] bg-brand-soft p-4 text-[15px]"><b>{transfer.name}</b> — {transfer.short} <span className="whitespace-nowrap font-semibold">{formatMoney(transfer.price)} {transfer.unit}</span></p></SiteVisible>}
            <a href={mapsLink(hotel)} target="_blank" rel="noopener" className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-action px-6 text-[15px] font-semibold text-on-action"><Navigation className="size-4" /> <T>Get directions</T></a>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
