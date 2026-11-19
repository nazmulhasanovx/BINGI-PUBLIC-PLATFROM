import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BatteryCharging, Car, ChevronDown, Footprints, KeyRound, Laptop, Navigation, ShieldCheck, Sparkles, Star, Utensils, WashingMachine, Wifi, Ruler, BedDouble, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { Hotel, RoomCategory } from "@/lib/types";
import { formatMoney, showRating } from "@/lib/data";
import { SearchBar } from "@/components/booking/SearchBar";
import { HeroIn, PhotoIn, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { Reviews } from "@/components/sections/HomeSections";
import { DraftSections, DraftText, SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { PhoneHeroCard, mapsLink, photo } from "../shared";

const ICONS: Record<string, typeof Wifi> = { wifi: Wifi, utensils: Utensils, washer: WashingMachine, power: BatteryCharging, shield: ShieldCheck, laptop: Laptop, car: Car, key: KeyRound };

/** Long-stay discount (%) from HMS promo codes: the best code a stay of `nights` qualifies for. */
function longStay(h: Hotel, nights: number) {
  return h.promoCodes.filter((c) => (c.minNights ?? 0) <= nights && (c.minNights ?? 0) >= 7).sort((a, b) => b.percent - a.percent)[0];
}
const monthly = (h: Hotel, r: RoomCategory) => Math.round((r.fromPrice * 30 * (100 - (longStay(h, 30)?.percent ?? 0))) / 100);

/**
 * FLAT (Business plan) — flats and serviced apartments.
 * Long-stay guests compare: price per night vs per month, size, kitchen, internet, power backup, the area. Practical, no fluff.
 */
export function FlatHome({ hotel }: { hotel: Hotel }) {
  return (
    <DraftSections
      slug={hotel.slug}
      master="flat"
      items={[
        { id: "hero", node: <Hero hotel={hotel} /> },
        { id: "apartments", node: <Apartments hotel={hotel} /> },
        { id: "long-stay", node: <LongStay hotel={hotel} /> },
        { id: "amenities", node: <Amenities hotel={hotel} /> },
        { id: "neighbourhood", node: <Neighbourhood hotel={hotel} /> },
        { id: "reviews", node: <Reviews hotel={hotel} /> },
        { id: "faq", node: <Faq hotel={hotel} /> },
      ]}
    />
  );
}

function Head({ label, title, right }: { label: string; title: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-6 md:mb-10">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-action md:text-[13px]"><T>{label}</T></p>
        <h2 className="mt-1.5 text-[24px] font-semibold leading-tight tracking-[-0.015em] md:text-[40px]">{typeof title === "string" ? <T>{title}</T> : title}</h2>
      </div>
      {right}
    </div>
  );
}

/* ---------- Hero: split, with night / month price ---------- */
function Hero({ hotel }: { hotel: Hotel }) {
  const cheapest = [...hotel.rooms].sort((a, b) => a.fromPrice - b.fromPrice)[0];
  return (
    <section>
      <PhoneHeroCard hotel={hotel} radius={14} />
      <Container className="pt-5 md:pt-12 lg:pt-16">
        <div className="grid gap-6 md:grid-cols-[1fr_1.15fr] md:gap-12">
          <HeroIn delay={0.05} className="flex flex-col justify-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-action md:text-[13px]">Serviced apartments · {hotel.area}, {hotel.city}</p>
            <h1 className="mt-3 text-[32px] font-semibold leading-[1.06] tracking-[-0.025em] md:text-[54px] lg:text-[62px]"><DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} /></h1>
            <p className="mt-4 max-w-[480px] text-[15px] leading-relaxed text-muted md:text-[18px]"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
            {cheapest && (
              <div className="mt-6 grid max-w-[440px] grid-cols-2 divide-x divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
                <div className="p-4"><p className="text-[13px] text-muted"><T>From / night</T></p><p className="mt-1 text-[22px] font-semibold tabular-nums">{formatMoney(cheapest.fromPrice)}</p></div>
                <div className="p-4"><p className="text-[13px] text-muted"><T>About / month</T></p><p className="mt-1 text-[22px] font-semibold tabular-nums">{formatMoney(monthly(hotel, cheapest))}</p></div>
              </div>
            )}
            {showRating(hotel) && <p className="mt-4 flex items-center gap-1.5 text-[14px] md:text-[15px]"><Star className="size-4 fill-ink" /> <b>{hotel.reviewScore}</b> <span className="text-muted">· {hotel.reviewCount} reviews</span></p>}
          </HeroIn>
          <div className="relative hidden aspect-[5/4] overflow-hidden rounded-[14px] md:block">
            <PhotoIn className="absolute inset-0"><Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="(max-width: 1240px) 55vw, 660px" quality={85} className="object-cover" /></PhotoIn>
          </div>
        </div>
        <HeroIn delay={0.2} className="relative z-10 mx-auto mt-5 max-w-[1040px] md:mt-8"><SearchBar /></HeroIn>
      </Container>
    </section>
  );
}

/* ---------- Apartments: practical cards ---------- */
function Apartments({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  return (
    <section className="mt-12 md:mt-24">
      <Container>
        <Reveal><Head label="Apartments" title={<DraftText slug={hotel.slug} k="apartments.title" fallback="Find your flat" />} right={<Link href={`${base}/rooms`} className="hidden items-center gap-1.5 text-[15px] font-semibold text-action sm:flex"><T>Compare all</T> <ArrowRight className="size-4" /></Link>} /></Reveal>
        <RevealGroup className={`grid gap-5 md:grid-cols-2 ${hotel.rooms.length % 4 === 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {hotel.rooms.map((r) => (
            <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}><RevealItem className="h-full">
              <Link href={`${base}/rooms/${r.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-surface transition-shadow hover:shadow-card">
                <div className="relative aspect-[16/10] overflow-hidden"><Image src={r.photos[0]} alt={r.name} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></div>
                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <h3 className="text-[18px] font-semibold leading-snug">{r.name}</h3>
                  <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[13.5px] text-muted">
                    <li className="flex items-center gap-1.5"><BedDouble className="size-4" /> {r.bedrooms ? `${r.bedrooms} bedroom${r.bedrooms > 1 ? "s" : ""}` : "Studio"}</li>
                    <li className="flex items-center gap-1.5"><Users className="size-4" /> {r.maxAdults + r.maxChildren} guests</li>
                    {r.sizeSqft && <li className="flex items-center gap-1.5"><Ruler className="size-4" /> {r.sizeSqft} sq ft</li>}
                  </ul>
                  {r.specs && <p className="mt-2 text-[13.5px]">{r.specs.join(" · ")}</p>}
                  <div className="mt-auto grid grid-cols-2 gap-3 border-t border-line pt-4 text-[14px]">
                    <p><span className="block text-muted"><T>Per night</T></span><b className="text-[17px] tabular-nums">{formatMoney(r.fromPrice)}</b></p>
                    <p><span className="block text-muted"><T>About / month</T></span><b className="text-[17px] tabular-nums">{formatMoney(monthly(hotel, r))}</b></p>
                  </div>
                </div>
              </Link>
            </RevealItem></SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Long-stay prices (real promo codes, the engine applies them) ---------- */
function LongStay({ hotel }: { hotel: Hotel }) {
  const codes = hotel.promoCodes.filter((c) => (c.minNights ?? 0) >= 7).sort((a, b) => (a.minNights ?? 0) - (b.minNights ?? 0));
  if (!codes.length) return null;
  return (
    <section className="mt-12 md:mt-24">
      <Container>
        <Reveal className="rounded-[14px] bg-brand-soft p-5 md:p-10">
          <Head label="Long stays" title={<DraftText slug={hotel.slug} k="copy.stay-longer-pay-less" fallback="Stay longer, pay less" />} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[{ minNights: 1, percent: 0, code: "", label: "Short stay" }, ...codes].map((c) => (
              <div key={c.label} className="rounded-[12px] bg-surface p-4 md:p-5">
                <p className="text-[14px] text-muted">{c.minNights === 1 ? "1–6 nights" : `${c.minNights}+ nights`}</p>
                <p className="mt-1 text-[26px] font-semibold">{c.percent ? `${c.percent}% off` : "Nightly rate"}</p>
                <p className="mt-1 text-[14px] text-muted">{c.code ? <>Use code <b className="font-mono text-ink">{c.code}</b> at checkout</> : "No code needed"}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13.5px] text-muted">Monthly price on this page = 30 nights with the best long-stay code. Final total, including any tax, is shown at checkout.</p>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- Every flat has ---------- */
function Amenities({ hotel }: { hotel: Hotel }) {
  return (
    <section className="mt-12 md:mt-24">
      <Container>
        <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-center md:gap-14">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[14px]"><Image src={photo(hotel, /work|kitchen/)} alt="" fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" /></Reveal>
          <div>
            <Reveal><Head label="Every flat has" title={<DraftText slug={hotel.slug} k="copy.live-and-work-like-at-home" fallback="Live and work like at home" />} /></Reveal>
            <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-5">
              {hotel.facilities.map((f) => {
                const Icon = ICONS[f.icon] ?? Sparkles;
                return (
                  <RevealItem key={f.name} className="flex gap-3">
                    <Icon className="mt-0.5 size-5 shrink-0 text-action" strokeWidth={1.75} />
                    <div><p className="text-[15px] font-semibold leading-snug">{f.name}</p><p className="mt-0.5 text-[13.5px] text-muted">{f.short}</p></div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Neighbourhood ---------- */
function Neighbourhood({ hotel }: { hotel: Hotel }) {
  if (!hotel.nearby?.length) return null;
  return (
    <section className="mt-12 md:mt-24">
      <Container>
        <Reveal><Head label="Neighbourhood" title={`Around ${hotel.area}`} /></Reveal>
        <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hotel.nearby.map((n) => (
            <RevealItem key={n.name} className="rounded-[12px] border border-line bg-surface p-4">
              <p className="flex items-center gap-2 text-[13px] text-muted">{n.mode === "walk" ? <Footprints className="size-4" /> : <Car className="size-4" />} {n.mode === "walk" ? "Walk" : "Drive"}</p>
              <p className="mt-2 text-[24px] font-semibold tabular-nums">{n.time}</p>
              <p className="mt-0.5 text-[15px]">{n.name}</p>
            </RevealItem>
          ))}
        </RevealGroup>
        <a href={mapsLink(hotel)} target="_blank" rel="noopener" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[15px] font-semibold"><Navigation className="size-4 text-action" /> {hotel.address}</a>
      </Container>
    </section>
  );
}

/* ---------- Questions ---------- */
function Faq({ hotel }: { hotel: Hotel }) {
  const qa = [{ q: "Check-in and check-out", a: `Check-in ${hotel.checkIn}, check-out ${hotel.checkOut}.` }, { q: "Cancellation", a: hotel.policies.cancellation }, ...(hotel.faq ?? [])];
  return (
    <section className="mb-12 mt-12 md:mb-24 md:mt-24">
      <Container className="max-w-[900px]">
        <Reveal><Head label="Questions" title={<DraftText slug={hotel.slug} k="copy.before-you-book" fallback="Before you book" />} /></Reveal>
        <div className="divide-y divide-line border-y border-line">
          {qa.map((x) => (
            <details key={x.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold md:text-[17px]"><T>{x.q}</T><ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" /></summary>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{x.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
