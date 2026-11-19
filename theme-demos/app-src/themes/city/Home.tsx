import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Car, ConciergeBell, Dumbbell, Footprints, Navigation, Presentation, Sparkles, Star, Waves, Wifi } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney, showRating, visibleOffers } from "@/lib/data";
import { presetFor } from "@/lib/presets";
import { SearchBar } from "@/components/booking/SearchBar";
import { HeroIn, PhotoIn, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container, MobileMore } from "@/components/ui/Section";
import { QuickLinks, Reviews } from "@/components/sections/HomeSections";
import { SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { DraftSections, DraftText } from "@/components/site-draft/Draft";
import type { ReactNode } from "react";

const ICONS: Record<string, typeof Waves> = { waves: Waves, presentation: Presentation, dumbbell: Dumbbell, wifi: Wifi, car: Car, concierge: ConciergeBell };

/**
 * CITY (Business plan) — calm, editorial, practical.
 * Big type, one wide photo, a docked booking bar, few elements per screen. No pills/badges.
 */
export function CityHome({ hotel }: { hotel: Hotel }) {
  const preset = presetFor(hotel.propertyType);
  return (
    <>
      <DraftSections
        slug={hotel.slug}
        master="city"
        items={[
          { id: "hero", node: <CityHero hotel={hotel} /> },
          { id: "quick-links", node: <QuickLinks hotel={hotel} /> },
          { id: "facts", node: <FactStrip hotel={hotel} /> },
          { id: "rooms", node: <CityRooms hotel={hotel} /> },
          { id: "work-stay", node: <WorkAndStay hotel={hotel} meetings={preset.sections.meetings} /> },
          { id: "location", node: <Nearby hotel={hotel} /> },
          { id: "offers", node: <CityOffers hotel={hotel} /> },
          { id: "reviews", node: <Reviews hotel={hotel} /> },
        ]}
      />
      <div className="h-12 md:h-24" />
    </>
  );
}

/** Section title used across CITY: small label + large headline + optional link. */
function Head({ label, title, href, link }: { label: string; title: ReactNode; href?: string; link?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-6 md:mb-10">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted md:text-[13px]"><T>{label}</T></p>
        <h2 className="mt-1.5 text-[24px] font-semibold leading-tight tracking-[-0.01em] md:mt-2 md:text-[40px]">{typeof title === "string" ? <T>{title}</T> : title}</h2>
      </div>
      {href && link && (
        <Link href={href} className="group hidden shrink-0 items-center gap-1.5 border-b border-ink/20 pb-0.5 text-[15px] font-semibold transition-colors hover:border-ink sm:flex">
          <T>{link}</T> <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/* ---------- Hero ---------- */
function CityHero({ hotel }: { hotel: Hotel }) {
  const near = hotel.nearby?.[0];
  return (
    <section className="relative">
      {/* phone: app photo card first */}
      <div className="relative mx-3 mt-2 h-[clamp(250px,40svh,360px)] overflow-hidden rounded-[18px] md:hidden">
        <PhotoIn className="absolute inset-0">
          <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" quality={85} className="object-cover" />
        </PhotoIn>
      </div>

      <Container className="pt-5 md:pt-14 lg:pt-20">
        <HeroIn className="grid gap-4 md:grid-cols-[1.5fr_1fr] md:items-end md:gap-12" delay={0.05}>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-action md:text-[13px]">
              {hotel.area} · {hotel.city}
            </p>
            <h1 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] md:mt-4 md:text-[54px] md:leading-[1.03] lg:text-[66px]">
              <DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} />
            </h1>
          </div>
          <div className="md:pb-2">
            <p className="hidden max-w-[400px] text-[17px] leading-relaxed text-muted md:block"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] md:mt-6 md:text-[15px]">
              {showRating(hotel) && (
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-ink" /> <b>{hotel.reviewScore}</b>
                  <span className="text-muted">· {hotel.reviewCount} reviews</span>
                </span>
              )}
              {near && (
                <span className="flex items-center gap-1.5 text-muted">
                  {near.mode === "walk" ? <Footprints className="size-4" /> : <Car className="size-4" />} {near.time} to {near.name}
                </span>
              )}
            </div>
          </div>
        </HeroIn>
      </Container>

      {/* desktop: one wide photo with the booking bar docked on its bottom edge */}
      <div className="mx-auto hidden max-w-[1240px] px-6 md:mt-10 md:block lg:mt-14">
        <div className="relative aspect-[16/8] overflow-hidden rounded-[20px] lg:aspect-[21/9]">
          <PhotoIn className="absolute inset-0">
            <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="1240px" quality={85} className="object-cover" />
          </PhotoIn>
        </div>
      </div>
      <Container className="relative z-10 mt-4 md:-mt-11">
        <HeroIn delay={0.2} className="mx-auto max-w-[1040px]">
          <SearchBar />
        </HeroIn>
      </Container>
    </section>
  );
}

/* ---------- Facts: one calm row, no cards ---------- */
function FactStrip({ hotel }: { hotel: Hotel }) {
  const near = hotel.nearby?.[0];
  const facts = [
    ...(near ? [{ icon: near.mode === "walk" ? Footprints : Car, name: `${near.time} to the beach`, short: near.name }] : []),
    ...hotel.facilities.map((f) => ({ icon: ICONS[f.icon] ?? Sparkles, name: f.name, short: f.short })),
  ].slice(0, 4);
  return (
    <Container className="mt-10 md:mt-20">
      <RevealGroup className="grid grid-cols-2 gap-x-5 gap-y-6 border-y border-line py-6 md:grid-cols-4 md:py-9">
        {facts.map((f) => (
          <RevealItem key={f.name} className="flex gap-3 md:border-l md:border-line md:pl-6 md:first:border-l-0 md:first:pl-0">
            <f.icon className="mt-0.5 size-5 shrink-0 text-action" strokeWidth={1.75} />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-snug md:text-[16px]">{f.name}</p>
              <p className="mt-0.5 text-[13px] text-muted md:text-[14px]">{f.short}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Container>
  );
}

/* ---------- Rooms: tall photos, no borders ---------- */
function CityRooms({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  return (
    <section className="mt-12 md:mt-28">
      <Container>
        <Reveal>
          <Head label={presetFor(hotel.propertyType).unitsLabel} title={<DraftText slug={hotel.slug} k="rooms.title" fallback="Choose your room" />} href={`${base}/rooms`} link="All rooms" />
        </Reveal>
      </Container>
      <RevealGroup className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 sm:px-6 md:mx-auto md:grid md:max-w-[1240px] md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-4">
        {hotel.rooms.map((r) => (
          <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}><RevealItem className="w-[78%] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none">
            <Link href={`${base}/rooms/${r.slug}`} className="group block">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[16px] bg-line md:aspect-[4/5]">
                <Image src={r.photos[0]} alt={r.name} fill sizes="(max-width: 768px) 78vw, 300px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              </div>
              <h3 className="mt-4 text-[17px] font-semibold leading-snug md:text-[18px]">{r.name}</h3>
              <p className="mt-1 text-[14px] text-muted">
                {r.bed}{r.view ? ` · ${r.view} view` : ""}
              </p>
              <p className="mt-2 flex items-baseline justify-between gap-2 text-[15px]">
                <span>
                  <span className="text-muted"><T>From</T> </span>
                  <b className="tabular-nums">{formatMoney(r.fromPrice)}</b>
                  <span className="text-muted"> <T>/ night</T></span>
                </span>
                <ArrowUpRight className="size-[18px] text-muted transition-colors group-hover:text-action" />
              </p>
            </Link>
          </RevealItem></SiteVisible>
        ))}
      </RevealGroup>
      <Container>
        <MobileMore href={`${base}/rooms`} label={`See all ${hotel.rooms.length} rooms`} />
      </Container>
    </section>
  );
}

/* ---------- Work & stay: two editorial tiles ---------- */
function WorkAndStay({ hotel, meetings }: { hotel: Hotel; meetings?: boolean }) {
  const meet = hotel.services.find((s) => /meeting/i.test(s.name));
  const meetPhoto = meet?.photo ?? hotel.gallery.find((g) => /meeting|conference/.test(g));
  const pool = hotel.facilities.find((f) => f.icon === "waves");
  const poolPhoto = hotel.gallery.find((g) => /rooftop|pool/.test(g));
  const wa = hotel.whatsapp ? `https://wa.me/${hotel.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hello, I'd like a quote for a meeting room.")}` : `tel:${hotel.phone.replace(/[^+\d]/g, "")}`;

  const tiles = [
    meetings && meetPhoto && { label: "Work", title: "Meeting rooms for 6 to 60", sub: meet ? `From ${formatMoney(meet.price)} ${meet.unit} · projector, Wi-Fi, tea` : "Projector, Wi-Fi, tea", photo: meetPhoto, href: wa, cta: "Ask for a quote", external: true },
    pool && poolPhoto && { label: "Unwind", title: pool.name, sub: pool.short, photo: poolPhoto, href: `/hotel/${hotel.slug}/explore`, cta: "Explore the hotel", external: false },
  ].filter(Boolean) as { label: string; title: string; sub: string; photo: string; href: string; cta: string; external: boolean }[];
  if (!tiles.length) return null;

  return (
    <section className="mt-12 md:mt-28">
      <Container>
        <RevealGroup className={`grid gap-8 md:gap-6 ${tiles.length > 1 ? "md:grid-cols-2" : ""}`}>
          {tiles.map((t) => (
            <RevealItem key={t.title}>
              <a href={t.href} {...(t.external ? { target: "_blank", rel: "noopener" } : {})} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] md:aspect-[5/4] lg:aspect-[4/3]">
                  <Image src={t.photo} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                </div>
                <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted md:text-[13px]"><T>{t.label}</T></p>
                <h3 className="mt-1.5 text-[22px] font-semibold leading-tight md:text-[28px]">{t.title}</h3>
                <p className="mt-1.5 text-[15px] text-muted">{t.sub}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 border-b border-ink/20 pb-0.5 text-[15px] font-semibold transition-colors group-hover:border-ink">
                  <T>{t.cta}</T> <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Location: travel times + directions ---------- */
function Nearby({ hotel }: { hotel: Hotel }) {
  if (!hotel.nearby?.length) return null;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${hotel.address}`)}`;
  const photo = hotel.gallery.find((g) => /beach/.test(g)) ?? hotel.pagePhotos.explore ?? hotel.gallery[0];
  return (
    <section className="mt-12 md:mt-28">
      <Container>
        <div className="grid gap-6 md:grid-cols-[1fr_1.15fr] md:items-center md:gap-16">
          <Reveal>
            <Head label="Location" title={`${hotel.area}, ${hotel.city}`} />
            <p className="-mt-2 mb-4 text-[15px] text-muted md:-mt-5 md:mb-6">{hotel.address}</p>
            <ul className="divide-y divide-line border-y border-line">
              {hotel.nearby.map((n) => (
                <li key={n.name} className="flex items-center justify-between gap-3 py-3.5 md:py-4">
                  <span className="flex items-center gap-3 text-[15px] md:text-[16px]">
                    {n.mode === "walk" ? <Footprints className="size-[18px] text-muted" strokeWidth={1.75} /> : <Car className="size-[18px] text-muted" strokeWidth={1.75} />}
                    {n.name}
                  </span>
                  <span className="text-[15px] font-semibold tabular-nums">{n.time}</span>
                </li>
              ))}
            </ul>
            <a href={maps} target="_blank" rel="noopener" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-action px-6 text-[15px] font-semibold text-on-action transition-transform active:scale-[0.98]">
              <Navigation className="size-4" /> <T>Get directions</T>
            </a>
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/3] overflow-hidden rounded-[16px] md:aspect-[5/4]">
            <Image src={photo} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Offers: photo on top, value as text ---------- */
function CityOffers({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  const offers = visibleOffers(hotel).slice(0, 2);
  if (!offers.length) return null;
  return (
    <section className="mt-12 md:mt-28">
      <Container>
        <Reveal>
          <Head label="Direct booking" title={<DraftText slug={hotel.slug} k="copy.book-direct-pay-less" fallback="Book direct, pay less" />} href={`${base}/offers`} link="All offers" />
        </Reveal>
        <RevealGroup className="grid gap-8 md:grid-cols-2 md:gap-6">
          {offers.map((o) => (
            <SiteVisible key={o.id} slug={hotel.slug} kind="offers" id={o.id}><RevealItem>
              <Link href={`${base}/offers`} className="group block">
                {o.photo && (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[16px]">
                    <Image src={o.photo} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                  </div>
                )}
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[20px] font-semibold leading-tight md:text-[22px]">{o.title}</h3>
                    <p className="mt-1 text-[15px] text-muted">{o.short}</p>
                  </div>
                  <p className="shrink-0 text-[20px] font-semibold text-action md:text-[22px]">{o.value}</p>
                </div>
              </Link>
            </RevealItem></SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
