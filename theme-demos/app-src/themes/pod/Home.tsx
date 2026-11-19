import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Car, ChevronDown, Footprints, Navigation, Plane, Star, Users } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney, showRating } from "@/lib/data";
import { SearchBar } from "@/components/booking/SearchBar";
import { HeroIn, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { Reviews } from "@/components/sections/HomeSections";
import { DraftSections, DraftText, SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { FxScope } from "@/fx/fx";
import { NeonField, Tilt } from "@/fx/effects";
import { mapsLink } from "../shared";
import { facIcon } from "../paid-shared";
import { CapsuleWall } from "./CapsuleWall";

/**
 * POD (paid · Tier B) — capsule hotels and pod hostels.
 * Dark neon field (FX3), a capsule wall built from the real bed setup (FX4), depth cards (FX1).
 */
export function PodHome({ hotel }: { hotel: Hotel }) {
  return (
    <FxScope slug={hotel.slug} theme="pod">
      <DraftSections
        slug={hotel.slug}
        master="pod"
        items={[
          { id: "hero", node: <Hero hotel={hotel} /> },
          { id: "wall", node: <Wall hotel={hotel} /> },
          { id: "stays", node: <Stays hotel={hotel} /> },
          { id: "facilities", node: <Facilities hotel={hotel} /> },
          { id: "rules", node: <Rules hotel={hotel} /> },
          { id: "getting-here", node: <GettingHere hotel={hotel} /> },
          { id: "reviews", node: <div className="pb-14 md:pb-20"><Reviews hotel={hotel} /></div> },
        ]}
      />
    </FxScope>
  );
}

function Head({ label, title, light }: { label: string; title: React.ReactNode; light?: boolean }) {
  return (
    <div className="mb-6 md:mb-10">
      <p className={`font-mono text-[12.5px] font-semibold uppercase tracking-[0.2em] md:text-[13px] ${light ? "text-[#67e8f9]" : "text-action"}`}>{"// "}<T>{label}</T></p>
      <h2 className={`mt-2 text-[30px] font-extrabold leading-[1.04] tracking-[-0.03em] md:text-[54px] ${light ? "text-white" : ""}`}>{typeof title === "string" ? <T>{title}</T> : title}</h2>
    </div>
  );
}

/* ---------- Hero: neon field + capsule-framed photo ---------- */
function Hero({ hotel }: { hotel: Hotel }) {
  const podFrom = Math.min(...hotel.rooms.filter((r) => r.kind === "dorm").map((r) => r.fromPrice));
  const airport = hotel.nearby?.find((n) => /airport/i.test(n.name));
  return (
    <section className="relative overflow-hidden bg-[#06070d] text-white">
      <NeonField />
      <Container className="relative pb-10 pt-8 md:pb-16 md:pt-16">
        <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12">
          <HeroIn delay={0.05}>
            <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.2em] text-[#67e8f9]">{hotel.type} · {hotel.area}, {hotel.city}</p>
            <h1 className="mt-3 bg-[linear-gradient(90deg,#fff,#e9d5ff_55%,#a5f3fc)] bg-clip-text text-[40px] font-extrabold leading-[0.98] tracking-[-0.035em] text-transparent md:text-[74px]"><DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} /></h1>
            <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-white/80 md:text-[18px]"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {Number.isFinite(podFrom) && <span className="rounded-[12px] border border-[#67e8f9]/60 px-4 py-2 text-[16px] font-bold shadow-[0_0_24px_-8px_#22d3ee]">Pods from {formatMoney(podFrom)}</span>}
              {airport && <span className="flex items-center gap-1.5 text-[15px] text-white/85"><Plane className="size-4" /> {airport.time} · {airport.name}</span>}
              {showRating(hotel) && <span className="flex items-center gap-1.5 text-[15px] text-white/85"><Star className="size-4 fill-[#fbbf24] text-[#fbbf24]" /> <b className="text-white">{hotel.reviewScore}</b> · {hotel.reviewCount}</span>}
            </div>
          </HeroIn>
          <HeroIn delay={0.12} className="relative mx-auto w-full max-w-[420px]">
            <Tilt max={8} className="rounded-[220px]">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[220px] border border-white/20 shadow-[0_0_80px_-20px_#a855f7]">
                <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="(max-width: 768px) 90vw, 420px" quality={85} className="object-cover" />
                <div aria-hidden className="absolute inset-0 rounded-[220px] ring-1 ring-inset ring-white/25" />
              </div>
            </Tilt>
          </HeroIn>
        </div>
        <HeroIn delay={0.2} className="relative z-10 mx-auto mt-8 max-w-[1040px] text-ink"><SearchBar /></HeroIn>
      </Container>
    </section>
  );
}

/* ---------- Capsule wall ---------- */
function Wall({ hotel }: { hotel: Hotel }) {
  if (!hotel.rooms.some((r) => r.kind === "dorm")) return null;
  return (
    <section className="relative overflow-hidden bg-[#0b0a1a] py-14 text-white md:py-24">
      <Container className="relative">
        <Reveal><Head light label="Pods" title={<DraftText slug={hotel.slug} k="wall.title" fallback="Pick your pod type" />} /></Reveal>
        <CapsuleWall hotel={hotel} />
      </Container>
    </section>
  );
}

/* ---------- All stays ---------- */
function Stays({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  return (
    <section className="mt-16 md:mt-24">
      <Container>
        <Reveal><Head label="Stays" title={<DraftText slug={hotel.slug} k="stays.title" fallback="Pods and private rooms" />} /></Reveal>
        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hotel.rooms.map((r) => (
            <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
              <RevealItem>
                <Tilt className="rounded-[22px]">
                  <Link href={`${base}/rooms/${r.slug}`} className="group block overflow-hidden rounded-[22px] border border-line bg-surface shadow-card">
                    <div className="relative aspect-[16/10] overflow-hidden"><Image src={r.photos[0]} alt={r.name} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" /></div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[19px] font-bold leading-tight">{r.name}</h3>
                        <p className="shrink-0 text-right"><b className="text-[19px] tabular-nums">{formatMoney(r.fromPrice)}</b><span className="block text-[12px] text-muted"><T>/ night</T></span></p>
                      </div>
                      <p className="mt-1 text-[14px] text-muted">{r.short}</p>
                      <p className="mt-3 flex flex-wrap gap-x-3 text-[13.5px] text-muted"><span className="flex items-center gap-1"><BedDouble className="size-4" /> {r.bed}</span><span className="flex items-center gap-1"><Users className="size-4" /> {r.maxAdults}</span></p>
                    </div>
                  </Link>
                </Tilt>
              </RevealItem>
            </SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Facilities ---------- */
function Facilities({ hotel }: { hotel: Hotel }) {
  return (
    <section className="mt-16 md:mt-24">
      <Container>
        <Reveal><Head label="Inside" title={<DraftText slug={hotel.slug} k="facilities.title" fallback="Built for short, good sleep" />} /></Reveal>
        <RevealGroup className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {hotel.facilities.map((f) => {
            const Icon = facIcon(f.icon);
            return (
              <RevealItem key={f.name} className="rounded-[18px] bg-[#0b0a1a] p-4 text-white md:p-5">
                <Icon className="size-6 text-[#67e8f9]" />
                <p className="mt-2 text-[15.5px] font-bold">{f.name}</p>
                <p className="mt-0.5 text-[13.5px] text-white/75">{f.short}</p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Rules + questions ---------- */
function Rules({ hotel }: { hotel: Hotel }) {
  const qa = [{ q: `Check-in: ${hotel.checkIn}`, a: `Check-out: ${hotel.checkOut}.` }, ...(hotel.houseRules ?? []).map((r) => ({ q: r.title, a: r.text })), ...(hotel.faq ?? []), { q: "Cancellation", a: hotel.policies.cancellation }];
  return (
    <section className="mt-16 md:mt-24">
      <Container className="max-w-[900px]">
        <Reveal><Head label="Good to know" title={<DraftText slug={hotel.slug} k="copy.rules-and-questions" fallback="Rules and questions" />} /></Reveal>
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

/* ---------- Getting here ---------- */
function GettingHere({ hotel }: { hotel: Hotel }) {
  if (!hotel.nearby?.length) return null;
  return (
    <section className="mt-16 md:mt-24">
      <Container>
        <Reveal><Head label="Getting here" title={`${hotel.area}, ${hotel.city}`} /></Reveal>
        <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hotel.nearby.map((n) => (
            <RevealItem key={n.name} className="rounded-[18px] border border-line bg-surface p-4">
              <p className="flex items-center gap-1.5 font-mono text-[13px] font-semibold uppercase text-action">{n.mode === "walk" ? <Footprints className="size-4" /> : <Car className="size-4" />} {n.time}</p>
              <p className="mt-1.5 text-[15.5px] font-bold leading-snug">{n.name}</p>
            </RevealItem>
          ))}
        </RevealGroup>
        <a href={mapsLink(hotel)} target="_blank" rel="noopener" className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-action px-6 text-[15px] font-bold text-on-action"><Navigation className="size-4" /> <T>Get directions</T> <ArrowRight className="size-4" /></a>
      </Container>
    </section>
  );
}
