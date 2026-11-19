import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, Flame, Flower2, Footprints, Languages, Leaf, MessageCircle, Navigation, Phone, Sparkles, Star, UtensilsCrossed, Wifi, Waves } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney, showRating } from "@/lib/data";
import { presetFor } from "@/lib/presets";
import { SearchBar } from "@/components/booking/SearchBar";
import { HeroIn, PhotoIn, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { Reviews } from "@/components/sections/HomeSections";
import { SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { DraftSections, DraftText } from "@/components/site-draft/Draft";
import type { ReactNode } from "react";

const ICONS: Record<string, typeof Leaf> = { leaf: Leaf, utensils: UtensilsCrossed, flower: Flower2, wifi: Wifi, car: Car, flame: Flame, waves: Waves };

/**
 * NEST (Starter plan) — small hotel, guest house, home.
 * One warm page: who you are, the few rooms you have, the host, how to get here. Serif headings.
 */
export function NestHome({ hotel }: { hotel: Hotel }) {
  const preset = presetFor(hotel.propertyType);
  return (
    <>
      <DraftSections
        slug={hotel.slug}
        master="nest"
        items={[
          { id: "hero", node: <NestHero hotel={hotel} /> },
          { id: "rooms", node: <NestRooms hotel={hotel} /> },
          { id: "host", node: preset.sections.host && hotel.host ? <Host hotel={hotel} /> : null },
          { id: "life", node: <LifeHere hotel={hotel} /> },
          { id: "extras", node: <Extras hotel={hotel} /> },
          { id: "getting-here", node: <GettingHere hotel={hotel} /> },
          { id: "reviews", node: <Reviews hotel={hotel} /> },
          { id: "book-band", node: <BookBand hotel={hotel} /> },
        ]}
      />
    </>
  );
}

function Title({ label, title, center }: { label: string; title: ReactNode; center?: boolean }) {
  return (
    <div className={center ? "mb-6 text-center md:mb-12" : "mb-5 md:mb-10"}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-action md:text-[13px]"><T>{label}</T></p>
      <h2 className="mt-1.5 font-heading text-[26px] leading-tight md:mt-2 md:text-[42px]">{typeof title === "string" ? <T>{title}</T> : title}</h2>
    </div>
  );
}

const wa = (h: Hotel, text: string) =>
  h.whatsapp ? `https://wa.me/${h.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}` : `tel:${h.phone.replace(/[^+\d]/g, "")}`;

/* ---------- Hero: centred serif title + postcard photo strip ---------- */
function NestHero({ hotel }: { hotel: Hotel }) {
  const side = hotel.gallery.slice(0, 2);
  return (
    <section>
      {/* phone: app photo card */}
      <div className="relative mx-3 mt-2 h-[clamp(250px,40svh,360px)] overflow-hidden rounded-[24px] md:hidden">
        <PhotoIn className="absolute inset-0">
          <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" quality={85} className="object-cover" />
        </PhotoIn>
      </div>

      <Container className="pt-5 md:pt-16 lg:pt-20">
        <HeroIn className="md:text-center" delay={0.05}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-action md:text-[13px]">
            {presetFor(hotel.propertyType).placeTitle} · {hotel.city}
          </p>
          <h1 className="mt-2 font-heading text-[32px] leading-[1.1] md:mx-auto md:mt-4 md:max-w-[820px] md:text-[56px] md:leading-[1.05] lg:text-[64px]">
            <DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} />
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted md:mx-auto md:mt-5 md:max-w-[560px] md:text-[18px]"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
          {showRating(hotel) && (
            <p className="mt-3 flex items-center gap-1.5 text-[14px] md:mt-4 md:justify-center md:text-[15px]">
              <Star className="size-4 fill-brand text-brand" /> <b>{hotel.reviewScore}</b> <span className="text-muted">· {hotel.reviewCount} reviews</span>
            </p>
          )}
        </HeroIn>
        <HeroIn delay={0.18} className="mx-auto mt-5 max-w-[1000px] md:mt-10">
          <SearchBar />
        </HeroIn>
      </Container>

      {/* desktop: postcard strip — big middle photo, two side photos */}
      <div className="mx-auto mt-14 hidden max-w-[1240px] grid-cols-[1fr_2.2fr_1fr] items-end gap-5 px-6 md:grid">
        {side[0] && (
          <Reveal className="relative aspect-[3/4] overflow-hidden rounded-[24px]">
            <Image src={side[0]} alt="" fill sizes="260px" className="object-cover" />
          </Reveal>
        )}
        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
          <PhotoIn className="absolute inset-0">
            <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="620px" quality={85} className="object-cover" />
          </PhotoIn>
        </div>
        {side[1] && (
          <Reveal delay={0.1} className="relative aspect-[3/4] overflow-hidden rounded-[24px]">
            <Image src={side[1]} alt="" fill sizes="260px" className="object-cover" />
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ---------- Rooms: few rooms, book straight from here ---------- */
function NestRooms({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  return (
    <section className="mt-12 md:mt-28">
      <Container>
        <Reveal>
          <Title label={presetFor(hotel.propertyType).unitsLabel} title={<DraftText slug={hotel.slug} k="rooms.title" fallback={hotel.rooms.length > 1 ? `${hotel.rooms.length} rooms, each a little different` : "Your room"} />} />
        </Reveal>
        <RevealGroup className="grid gap-5 sm:grid-cols-2 md:gap-6">
          {hotel.rooms.map((r) => (
            <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}><RevealItem>
              <article className="group overflow-hidden rounded-[24px] border border-line bg-surface">
                <Link href={`${base}/rooms/${r.slug}`} className="relative block aspect-[3/2] overflow-hidden">
                  <Image src={r.photos[0]} alt={r.name} fill sizes="(max-width: 640px) 100vw, 600px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                </Link>
                <div className="flex items-end justify-between gap-4 p-4 md:p-6">
                  <div className="min-w-0">
                    <h3 className="font-heading text-[20px] leading-tight md:text-[24px]">
                      <Link href={`${base}/rooms/${r.slug}`}>{r.name}</Link>
                    </h3>
                    <p className="mt-1 text-[14px] text-muted">{r.bed} · {r.maxAdults} adults{r.view ? ` · ${r.view} view` : ""}</p>
                    <p className="mt-2 text-[15px]">
                      <b className="tabular-nums">{formatMoney(r.fromPrice)}</b> <span className="text-muted"><T>/ night</T></span>
                    </p>
                  </div>
                  <Link href={`${base}/rooms/${r.slug}`} className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-action px-5 text-[15px] font-semibold text-on-action transition-transform active:scale-[0.97]">
                    <T>Book</T>
                  </Link>
                </div>
              </article>
            </RevealItem></SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Host (guest house / home presets) ---------- */
function Host({ hotel }: { hotel: Hotel }) {
  const h = hotel.host!;
  const initials = h.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <section className="mt-12 md:mt-28">
      <Container>
        <Reveal className="mx-auto max-w-[860px] rounded-[28px] bg-brand-soft px-5 py-8 text-center md:px-14 md:py-14">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-action font-heading text-[24px] text-on-action md:size-20 md:text-[30px]">{initials}</span>
          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-action md:text-[13px]"><T>{h.role}</T></p>
          <h2 className="mt-1 font-heading text-[24px] md:text-[34px]">{h.name}</h2>
          <p className="mx-auto mt-4 max-w-[600px] font-heading text-[18px] leading-relaxed md:text-[22px]">“{h.note}”</p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[14px] text-muted">
            <span>Hosting since {h.since}</span>
            <span className="flex items-center gap-1.5"><Languages className="size-4" /> {h.languages.join(" · ")}</span>
          </p>
          <a href={wa(hotel, `Hello ${h.name.split(" ")[0]}, I have a question about staying at ${hotel.name}.`)} target="_blank" rel="noopener" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-surface px-6 text-[15px] font-semibold shadow-card transition-transform active:scale-[0.98]">
            <MessageCircle className="size-[18px] text-action" /> <T>Message the host</T>
          </a>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- Life here: one photo + what you get ---------- */
function LifeHere({ hotel }: { hotel: Hotel }) {
  const photo = hotel.gallery.find((g) => /veranda|garden|terrace/.test(g)) ?? hotel.gallery[0];
  return (
    <section className="mt-12 md:mt-28">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-16">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[24px] md:aspect-[5/4]">
            <Image src={photo} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
          </Reveal>
          <Reveal delay={0.1}>
            <Title label="Life here" title={<DraftText slug={hotel.slug} k="copy.simple-slow-and-comfortable" fallback="Simple, slow and comfortable" />} />
            <ul className="grid grid-cols-2 gap-x-5 gap-y-5 md:gap-y-6">
              {hotel.facilities.map((f) => {
                const Icon = ICONS[f.icon] ?? Sparkles;
                return (
                  <li key={f.name} className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-action"><Icon className="size-[18px]" /></span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold leading-snug">{f.name}</span>
                      <span className="block text-[13px] text-muted md:text-[14px]">{f.short}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Extras: meals, walks, pickup — add while booking ---------- */
function Extras({ hotel }: { hotel: Hotel }) {
  const items = hotel.services.filter((s) => s.addToStay);
  if (!items.length) return null;
  return (
    <section className="mt-12 md:mt-28">
      <Container>
        <Reveal>
          <Title label="Add to your stay" title={<DraftText slug={hotel.slug} k="copy.meals-walks-and-pickup" fallback="Meals, walks and pickup" />} />
        </Reveal>
        <RevealGroup className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {items.map((s) => (
            <SiteVisible key={s.id} slug={hotel.slug} kind="services" id={s.id}><RevealItem className="w-[70%] shrink-0 snap-start sm:w-auto">
              <div className="h-full overflow-hidden rounded-[24px] border border-line bg-surface">
                {s.photo ? (
                  <div className="relative aspect-[4/3]">
                    <Image src={s.photo} alt="" fill sizes="(max-width: 640px) 70vw, 300px" className="object-cover" />
                  </div>
                ) : (
                  <div className="grid aspect-[4/3] place-items-center bg-brand-soft text-action">
                    {s.category === "transfer" ? <Car className="size-8" strokeWidth={1.5} /> : <UtensilsCrossed className="size-8" strokeWidth={1.5} />}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-[16px] font-semibold leading-snug">{s.name}</h3>
                  <p className="mt-1 text-[14px] text-muted">{s.short}</p>
                  <p className="mt-2 text-[15px]"><b className="tabular-nums">{formatMoney(s.price)}</b> <span className="text-muted">{s.unit}</span></p>
                </div>
              </div>
            </RevealItem></SiteVisible>
          ))}
        </RevealGroup>
        <p className="mt-4 text-[14px] text-muted"><T>Add these when you book, or ask the host.</T></p>
      </Container>
    </section>
  );
}

/* ---------- Getting here ---------- */
function GettingHere({ hotel }: { hotel: Hotel }) {
  if (!hotel.nearby?.length) return null;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${hotel.address}`)}`;
  return (
    <section className="mt-12 md:mt-28">
      <Container>
        <Reveal className="grid gap-6 rounded-[28px] border border-line bg-surface p-5 md:grid-cols-[1fr_1.2fr] md:gap-12 md:p-10">
          <div>
            <Title label="Getting here" title={hotel.city} />
            <p className="-mt-3 text-[15px] text-muted md:-mt-6">{hotel.address}</p>
            <a href={maps} target="_blank" rel="noopener" className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-action px-6 text-[15px] font-semibold text-on-action transition-transform active:scale-[0.98]">
              <Navigation className="size-4" /> <T>Get directions</T>
            </a>
          </div>
          <ul className="divide-y divide-line">
            {hotel.nearby.map((n) => (
              <li key={n.name} className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 md:py-4">
                <span className="flex items-center gap-3 text-[15px] md:text-[16px]">
                  {n.mode === "walk" ? <Footprints className="size-[18px] text-muted" /> : <Car className="size-[18px] text-muted" />}
                  {n.name}
                </span>
                <span className="shrink-0 text-[15px] font-semibold tabular-nums">{n.time}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- Book band: last thing on the page ---------- */
function BookBand({ hotel }: { hotel: Hotel }) {
  return (
    <section className="mb-12 mt-12 md:mb-24 md:mt-24">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[28px] bg-action px-5 py-10 text-center text-on-action md:px-12 md:py-16">
          <h2 className="font-heading text-[28px] leading-tight md:text-[44px]"><DraftText slug={hotel.slug} k="copy.book-your-stay" fallback="Book your stay" /></h2>
          <p className="mx-auto mt-2 max-w-[460px] text-[15px] opacity-85 md:text-[17px]">
            Check-in {hotel.checkIn} · Check-out {hotel.checkOut}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Link href={`/hotel/${hotel.slug}/rooms`} className="inline-flex h-12 items-center gap-2 rounded-full bg-surface px-6 text-[15px] font-semibold text-ink transition-transform active:scale-[0.98]">
              <T>See rooms & prices</T> <ArrowRight className="size-4" />
            </Link>
            <a href={`tel:${hotel.phone.replace(/[^+\d]/g, "")}`} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 text-[15px] font-semibold transition-colors hover:bg-white/10">
              <Phone className="size-4" /> {hotel.phone}
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
