import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Car, Coffee, Footprints, Gamepad2, Lock, Music, Navigation, ShieldCheck, Sparkles, Star, Users, Wifi, Shirt, Clock, IdCard } from "lucide-react";
import type { ReactNode } from "react";
import type { Hotel } from "@/lib/types";
import { formatMoney, showRating } from "@/lib/data";
import { SearchBar } from "@/components/booking/SearchBar";
import { HeroIn, PhotoIn, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { Reviews } from "@/components/sections/HomeSections";
import { DraftSections, DraftText, SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { PhoneHeroCard, mapsLink } from "../shared";

const ICONS: Record<string, typeof Wifi> = { wifi: Wifi, coffee: Coffee, lock: Lock, music: Music, games: Gamepad2, laundry: Shirt };

/**
 * BUNK (Starter plan) — hostels and backpacker stays.
 * Bold and friendly: price per bed up front, dorms vs privates made obvious, hostel life and the rules people actually ask about.
 */
export function BunkHome({ hotel }: { hotel: Hotel }) {
  return (
    <DraftSections
      slug={hotel.slug}
      master="bunk"
      items={[
        { id: "hero", node: <Hero hotel={hotel} /> },
        { id: "beds", node: <Beds hotel={hotel} /> },
        { id: "life", node: <Life hotel={hotel} /> },
        { id: "rules", node: <Rules hotel={hotel} /> },
        { id: "getting-here", node: <GettingHere hotel={hotel} /> },
        { id: "reviews", node: <Reviews hotel={hotel} /> },
      ]}
    />
  );
}

function Head({ label, title }: { label: string; title: ReactNode }) {
  return (
    <div className="mb-5 md:mb-10">
      <p className="inline-block -rotate-1 rounded-md bg-action px-2 py-0.5 text-[12px] font-bold uppercase tracking-[0.08em] text-on-action md:text-[13px]"><T>{label}</T></p>
      <h2 className="mt-3 text-[28px] font-extrabold leading-[1.05] tracking-[-0.025em] md:text-[48px]">{typeof title === "string" ? <T>{title}</T> : title}</h2>
    </div>
  );
}

/* ---------- Hero: bold type + photo collage ---------- */
function Hero({ hotel }: { hotel: Hotel }) {
  const bedFrom = Math.min(...hotel.rooms.filter((r) => r.kind === "dorm").map((r) => r.fromPrice));
  const side = hotel.gallery.slice(0, 2);
  return (
    <section>
      <PhoneHeroCard hotel={hotel} radius={22} />
      <Container className="pt-5 md:pt-12 lg:pt-16">
        <div className="grid gap-6 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-12">
          <HeroIn delay={0.05}>
            <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-action">Hostel · {hotel.area}, {hotel.city}</p>
            <h1 className="mt-3 text-[38px] font-extrabold leading-[0.98] tracking-[-0.035em] md:text-[64px] lg:text-[76px]"><DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} /></h1>
            <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-muted md:text-[18px]"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {Number.isFinite(bedFrom) && <span className="rotate-[-2deg] rounded-[14px] bg-ink px-4 py-2 text-[18px] font-extrabold text-surface">Beds from {formatMoney(bedFrom)}</span>}
              {showRating(hotel) && <span className="flex items-center gap-1.5 text-[15px]"><Star className="size-4 fill-brand text-brand" /> <b>{hotel.reviewScore}</b> <span className="text-muted">· {hotel.reviewCount} reviews</span></span>}
            </div>
          </HeroIn>
          <div className="relative hidden h-[460px] md:block lg:h-[520px]">
            <div className="absolute right-0 top-0 h-[78%] w-[72%] overflow-hidden rounded-[26px] rotate-[2deg] shadow-float">
              <PhotoIn className="absolute inset-0"><Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="460px" quality={85} className="object-cover" /></PhotoIn>
            </div>
            {side[0] && <div className="absolute bottom-0 left-0 h-[52%] w-[48%] -rotate-[3deg] overflow-hidden rounded-[22px] border-4 border-surface shadow-float"><Image src={side[0]} alt="" fill sizes="300px" className="object-cover" /></div>}
            {side[1] && <div className="absolute bottom-[6%] right-[6%] h-[34%] w-[34%] rotate-[4deg] overflow-hidden rounded-[18px] border-4 border-surface shadow-float"><Image src={side[1]} alt="" fill sizes="220px" className="object-cover" /></div>}
          </div>
        </div>
        <HeroIn delay={0.2} className="relative z-10 mx-auto mt-5 max-w-[1040px] md:mt-8"><SearchBar /></HeroIn>
      </Container>
    </section>
  );
}

/* ---------- Beds: dorms and privates ---------- */
function Beds({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  const groups = [
    { t: "Dorm beds", items: hotel.rooms.filter((r) => r.kind === "dorm") },
    { t: "Private rooms", items: hotel.rooms.filter((r) => r.kind !== "dorm") },
  ].filter((g) => g.items.length);
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal><Head label="Beds" title={<DraftText slug={hotel.slug} k="beds.title" fallback="Pick your bed" />} /></Reveal>
        <div className="space-y-8 md:space-y-12">
          {groups.map((g) => (
            <div key={g.t}>
              <p className="mb-3 text-[15px] font-bold md:text-[17px]"><T>{g.t}</T></p>
              <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((r) => (
                  <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}><RevealItem>
                    <Link href={`${base}/rooms/${r.slug}`} className="group block overflow-hidden rounded-[22px] border-2 border-ink/90 bg-surface transition-transform hover:-translate-y-0.5">
                      <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-ink/90"><Image src={r.photos[0]} alt={r.name} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" /></div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-[18px] font-extrabold leading-tight">{r.name}</h3>
                          <p className="shrink-0 text-right"><b className="text-[20px] tabular-nums">{formatMoney(r.fromPrice)}</b><span className="block text-[12.5px] text-muted"><T>{r.kind === "dorm" ? "/ bed / night" : "/ room / night"}</T></span></p>
                        </div>
                        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13.5px] text-muted">
                          <span className="flex items-center gap-1"><BedDouble className="size-4" /> {r.bed}</span>
                          <span className="flex items-center gap-1"><Users className="size-4" /> {r.kind === "dorm" ? `${r.bedrooms ?? r.units}-bed room` : `${r.maxAdults} guests`}</span>
                        </p>
                        {r.specs && <p className="mt-2 text-[13.5px]">{r.specs.join(" · ")}</p>}
                      </div>
                    </Link>
                  </RevealItem></SiteVisible>
                ))}
              </RevealGroup>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Hostel life ---------- */
function Life({ hotel }: { hotel: Hotel }) {
  const events = hotel.services.filter((s) => s.category === "activity");
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <div className="rounded-[28px] bg-brand-soft p-5 md:p-12">
          <Reveal><Head label="Hostel life" title={<DraftText slug={hotel.slug} k="copy.come-for-the-beach-stay-for-the-people" fallback="Come for the beach, stay for the people" />} /></Reveal>
          <RevealGroup className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {hotel.facilities.map((f) => {
              const Icon = ICONS[f.icon] ?? Sparkles;
              return (
                <RevealItem key={f.name} className="rounded-[18px] bg-surface p-4">
                  <Icon className="size-6 text-action" strokeWidth={2} />
                  <p className="mt-2 text-[15.5px] font-bold leading-snug">{f.name}</p>
                  <p className="mt-0.5 text-[13.5px] text-muted">{f.short}</p>
                </RevealItem>
              );
            })}
          </RevealGroup>
          {events.length > 0 && (
            <div className="mt-6 grid gap-3 md:grid-cols-2 [&>*]:min-w-0">
              {events.map((e) => (
                <SiteVisible key={e.id} slug={hotel.slug} kind="services" id={e.id}><div className="flex min-w-0 items-center gap-3 rounded-[18px] bg-surface p-3 sm:gap-4">
                  {e.photo && <span className="relative size-16 shrink-0 overflow-hidden rounded-[12px]"><Image src={e.photo} alt="" fill sizes="64px" className="object-cover" /></span>}
                  <div className="min-w-0 flex-1"><p className="truncate text-[15.5px] font-bold">{e.name}</p><p className="truncate text-[13.5px] text-muted">{e.short}</p></div>
                  <p className="shrink-0 pr-2 text-[15px] font-bold">{e.price ? formatMoney(e.price) : "Free"}</p>
                </div></SiteVisible>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

/* ---------- House rules ---------- */
function Rules({ hotel }: { hotel: Hotel }) {
  const icons = [Clock, Lock, IdCard, ShieldCheck];
  const rules = [{ title: `Check-in ${hotel.checkIn}`, text: `Check-out ${hotel.checkOut}` }, ...(hotel.houseRules ?? []), { title: "Cancellation", text: hotel.policies.cancellation }];
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal><Head label="House rules" title={<DraftText slug={hotel.slug} k="copy.simple-rules-good-sleep" fallback="Simple rules, good sleep" />} /></Reveal>
        <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((r, i) => {
            const Icon = icons[i % icons.length];
            return (
              <RevealItem key={r.title} className="flex gap-3 rounded-[18px] border-2 border-ink/90 p-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-action" />
                <div><p className="text-[15.5px] font-bold"><T>{r.title}</T></p><p className="mt-0.5 text-[14px] text-muted">{r.text}</p></div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Getting here ---------- */
function GettingHere({ hotel }: { hotel: Hotel }) {
  if (!hotel.nearby?.length) return null;
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal><Head label="Getting here" title={`${hotel.area}, ${hotel.city}`} /></Reveal>
        <p className="-mt-3 mb-5 text-[15px] text-muted md:-mt-6 md:mb-8">{hotel.address}</p>
        <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hotel.nearby.map((n) => (
            <RevealItem key={n.name} className="rounded-[18px] bg-surface p-4 shadow-card">
              <p className="flex items-center gap-1.5 text-[13px] font-bold uppercase text-action">{n.mode === "walk" ? <Footprints className="size-4" /> : <Car className="size-4" />} {n.time}</p>
              <p className="mt-1.5 text-[15.5px] font-bold leading-snug">{n.name}</p>
            </RevealItem>
          ))}
        </RevealGroup>
        <a href={mapsLink(hotel)} target="_blank" rel="noopener" className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-action px-6 text-[15px] font-bold text-on-action"><Navigation className="size-4" /> <T>Get directions</T> <ArrowRight className="size-4" /></a>
      </Container>
    </section>
  );
}
