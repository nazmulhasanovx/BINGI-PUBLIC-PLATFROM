// BinGi Luxury Collection — shared building blocks (plan: claude/design/Luxury_Collection_10_Themes_Plan_2026-11-10.md).
// Every luxury theme composes these with its own layout + one signature section. Look (canvas, ink, accent,
// heading font, radius) comes from `[data-master="<id>"]` tokens in globals.css, so the blocks stay theme-neutral.
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";
import { ArrowRight, ArrowUpRight, Car, Footprints, MessageCircle, Navigation, Phone, Star } from "lucide-react";
import type { Hotel, RoomCategory } from "@/lib/types";
import { formatMoney, showRating, visibleOffers } from "@/lib/data";
import { SearchBar } from "@/components/booking/SearchBar";
import { HeroIn, PhotoIn, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { DraftText, SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { mapsLink, photo, telLink, waLink } from "../shared";
import { facIcon } from "../paid-shared";

export const roomHref = (h: Hotel, r: RoomCategory) => `/hotel/${h.slug}/rooms/${r.slug}`;
export const roomsHref = (h: Hotel) => `/hotel/${h.slug}/rooms`;
const fromPrice = (h: Hotel) => Math.min(...h.rooms.map((r) => r.fromPrice));
const occupancy = (r: RoomCategory) => `${r.maxAdults + r.maxChildren} guests`;

/** Section wrapper with the collection's slower rhythm. */
export function Sec({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={clsx("mt-20 md:mt-36", className)}>{children}</section>;
}

export function Eyebrow({ children, className }: { children: string; className?: string }) {
  return <p className={clsx("lux-eyebrow", className)}><T>{children}</T></p>;
}

/** Eyebrow + display heading (+ optional intro). Title text is editable via DraftText. */
export function Head({ hotel, k, eyebrow, title, intro, center, className, light }: {
  hotel: Hotel; k: string; eyebrow: string; title: string; intro?: string; center?: boolean; className?: string; light?: boolean;
}) {
  return (
    <div className={clsx(center ? "mx-auto mb-10 max-w-[760px] text-center md:mb-16" : "mb-8 max-w-[760px] md:mb-14", light && "text-white", className)}>
      <Eyebrow className={light ? "!text-white/85" : undefined}>{eyebrow}</Eyebrow>
      <span aria-hidden className={clsx("lux-rule mt-4", center && "mx-auto")} />
      <h2 className="lux-display mt-5 text-[34px] md:text-[48px] lg:text-[60px] [overflow-wrap:anywhere]"><DraftText slug={hotel.slug} k={k} fallback={title} /></h2>
      {intro && <p className={clsx("mt-4 text-[16px] leading-relaxed md:text-[18px]", light ? "text-white/85" : "text-muted")}>{intro}</p>}
    </div>
  );
}

function Rating({ hotel, className }: { hotel: Hotel; className?: string }) {
  if (!showRating(hotel)) return null;
  return (
    <p className={clsx("flex items-center gap-1.5 text-[14px]", className)}>
      <Star className="size-4 fill-current" aria-hidden /> <b>{hotel.reviewScore}</b> <span className="opacity-80">· {hotel.reviewCount} <T>reviews</T></span>
    </p>
  );
}

function Stars({ n }: { n?: number }) {
  if (!n) return null;
  return <span aria-label={`${n}-star`} className="tracking-[0.2em]">{"★".repeat(Math.min(n, 7))}</span>;
}

/* ================= HERO ================= */
export type HeroVariant = "center" | "left" | "split" | "framed";

/**
 * Luxury hero. Phone: tall photo with the headline on a gradient, booking bar under it.
 * Desktop: `center`/`left` = full-bleed; `split` = text column + tall photo; `framed` = inset photo with a paper margin.
 */
export function LuxHero({ hotel, variant = "center", eyebrow, src, children }: {
  hotel: Hotel; variant?: HeroVariant; eyebrow?: string; src?: string; children?: ReactNode;
}) {
  const img = src ?? hotel.heroPhoto;
  const kicker = eyebrow ?? `${hotel.area}, ${hotel.city}`;
  const from = fromPrice(hotel);
  const title = <DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} />;
  const intro = <DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} />;
  return (
    <section className="relative">
      {/* phone */}
      <div className="relative mx-3 mt-2 h-[min(74svh,640px)] min-h-[440px] overflow-hidden rounded-[var(--lux-r)] text-white md:hidden">
        <PhotoIn className="absolute inset-0"><Image src={img} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" quality={80} className="object-cover" /></PhotoIn>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <HeroIn delay={0.05} className="absolute inset-x-0 bottom-0 p-5">
          <p className="lux-eyebrow !text-white/90">{kicker}</p>
          <h1 className="lux-display mt-3 text-[38px] text-white">{title}</h1>
          <Rating hotel={hotel} className="mt-3" />
        </HeroIn>
      </div>
      {/* desktop */}
      {variant === "split" ? (
        <Container className="hidden pt-10 md:block lg:pt-14">
          <div className="grid grid-cols-[1fr_1.05fr] items-center gap-12 lg:gap-20">
            <HeroIn delay={0.05}>
              <p className="lux-eyebrow">{kicker}</p>
              <span aria-hidden className="lux-rule mt-5" />
              <h1 className="lux-display mt-6 text-[56px] lg:text-[84px]">{title}</h1>
              <p className="mt-6 max-w-[500px] text-[18px] leading-relaxed text-muted">{intro}</p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px]">
                {Number.isFinite(from) && <span><span className="text-muted"><T>From</T></span> <b className="tabular-nums">{formatMoney(from)}</b> <span className="text-muted"><T>/ night</T></span></span>}
                <Rating hotel={hotel} />
              </div>
            </HeroIn>
            <HeroIn delay={0.1}>
              <div className="relative h-[min(78svh,760px)] min-h-[520px] overflow-hidden rounded-[var(--lux-r)]">
                <Image src={img} alt={hotel.name} fill priority fetchPriority="high" sizes="(max-width: 1240px) 55vw, 660px" quality={82} className="object-cover" />
                {children}
              </div>
            </HeroIn>
          </div>
        </Container>
      ) : (
        <div className={clsx("relative hidden overflow-hidden text-white md:block", variant === "framed" ? "mx-6 mt-4 h-[min(84svh,860px)] min-h-[560px] rounded-[var(--lux-r)] lg:mx-10" : "h-[min(92svh,940px)] min-h-[600px]")}>
          <PhotoIn className="absolute inset-0"><Image src={img} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" quality={82} className="object-cover" /></PhotoIn>
          <div className={clsx("absolute inset-0", variant === "left" ? "bg-gradient-to-r from-black/70 via-black/35 to-black/5" : "bg-[radial-gradient(60%_50%_at_50%_45%,rgb(0_0_0/0.42),transparent_75%),linear-gradient(to_bottom,rgb(0_0_0/0.4),rgb(0_0_0/0.2)_40%,rgb(0_0_0/0.6))]")} />
          {children}
          <Container className={clsx("relative flex h-full flex-col pb-28", variant === "left" ? "justify-end" : "items-center justify-center text-center")}>
            <HeroIn delay={0.05} className={variant === "left" ? "max-w-[720px]" : "max-w-[940px]"}>
              <p className="lux-eyebrow !text-white/90">{kicker}{hotel.stars ? <span className="ml-3"><Stars n={hotel.stars} /></span> : null}</p>
              <span aria-hidden className={clsx("lux-rule mt-5 !bg-white/70", variant !== "left" && "mx-auto")} />
              <h1 className="lux-display mt-6 text-[60px] text-white lg:text-[92px]">{title}</h1>
              <p className={clsx("mt-6 max-w-[580px] text-[18px] leading-relaxed text-white/90", variant !== "left" && "mx-auto")}>{intro}</p>
              <Rating hotel={hotel} className={clsx("mt-5", variant !== "left" && "justify-center")} />
            </HeroIn>
          </Container>
        </div>
      )}
      <Container className="relative z-10 mt-4 md:hidden">
        <p className="text-[15px] leading-relaxed text-muted">{intro}</p>
      </Container>
      <Container className={clsx("relative z-10 mt-4", variant === "split" ? "md:mt-10" : "md:-mt-16")}>
        <HeroIn delay={0.2} className="lux-search mx-auto max-w-[1040px]"><SearchBar /></HeroIn>
      </Container>
    </section>
  );
}

/* ================= ROOMS ================= */
function RoomMeta({ r }: { r: RoomCategory }) {
  return (
    <p className="text-[13.5px] text-muted">
      {occupancy(r)} · {r.bed}{r.sizeSqft ? ` · ${r.sizeSqft} sq ft` : ""}{r.view ? ` · ${r.view}` : ""}
    </p>
  );
}

function Price({ r }: { r: RoomCategory }) {
  return (
    <span className="text-[15px]"><span className="text-muted"><T>From</T> </span><b className="tabular-nums">{formatMoney(r.fromPrice)}</b><span className="text-muted"> <T>/ night</T></span></span>
  );
}

/** Editorial alternating rows (optionally numbered I, II, III…). */
export function RoomRows({ hotel, numbered, limit = 4 }: { hotel: Hotel; numbered?: boolean; limit?: number }) {
  const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
  return (
    <div className="space-y-16 md:space-y-28">
      {hotel.rooms.slice(0, limit).map((r, i) => (
        <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
          <Reveal className={clsx("grid items-center gap-6 md:grid-cols-[1.25fr_1fr] md:gap-16", i % 2 && "md:[&>*:first-child]:order-2")}>
            <Link href={roomHref(hotel, r)} className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--lux-r)] md:aspect-[5/4]" aria-label={r.name}>
              <Image src={r.photos[0]} alt="" fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]" />
            </Link>
            <div>
              {numbered && <p aria-hidden className="lux-display text-[44px] text-[color:var(--lux-accent)] md:text-[64px]">{ROMAN[i]}</p>}
              <p className="lux-eyebrow">{r.kind === "suite" ? "Suite" : r.kind === "villa" ? "Villa" : r.kind === "cottage" ? "Cottage" : "Room"}</p>
              <h3 className="lux-display mt-3 text-[30px] md:text-[44px]">{r.name}</h3>
              <p className="mt-4 text-[16px] leading-relaxed text-muted md:text-[17px]">{r.description}</p>
              <div className="mt-4"><RoomMeta r={r} /></div>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Price r={r} />
                <Link href={roomHref(hotel, r)} className="lux-link"><T>Discover</T> <ArrowRight className="size-4" aria-hidden /></Link>
              </div>
            </div>
          </Reveal>
        </SiteVisible>
      ))}
    </div>
  );
}

/** Tall cards in a swipe row (phone) / grid (desktop). */
export function RoomCards({ hotel, cols = 3, aspect = "aspect-[3/4]" }: { hotel: Hotel; cols?: 2 | 3; aspect?: string }) {
  return (
    <RevealGroup className={clsx("no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:gap-7 md:overflow-visible md:px-0", cols === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3")}>
      {hotel.rooms.map((r) => (
        <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
          <RevealItem className="w-[80%] max-w-[360px] shrink-0 snap-start md:w-auto md:max-w-none">
            <Link href={roomHref(hotel, r)} className="lux-card group block">
              <div className={clsx("relative overflow-hidden rounded-[var(--lux-r)]", aspect)}>
                <Image src={r.photos[0]} alt="" fill sizes="(max-width: 768px) 80vw, 400px" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
              </div>
              <h3 className="lux-display mt-5 text-[26px] md:text-[30px]">{r.name}</h3>
              <div className="mt-1.5"><RoomMeta r={r} /></div>
              <p className="mt-3 flex items-center justify-between gap-3"><Price r={r} /><ArrowUpRight className="size-[18px] text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></p>
            </Link>
          </RevealItem>
        </SiteVisible>
      ))}
    </RevealGroup>
  );
}

/* ================= AMENITIES ================= */
export function Amenities({ hotel, src, eyebrow = "The house", title = "Every comfort, quietly done", k = "amenities.title" }: { hotel: Hotel; src?: string; eyebrow?: string; title?: string; k?: string }) {
  const img = src ?? photo(hotel, /pool|lounge|lobby|spa/);
  return (
    <Sec>
      <Container>
        <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-16">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[var(--lux-r)] md:order-2"><Image src={img} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" /></Reveal>
          <Reveal delay={0.05}>
            <Head hotel={hotel} k={k} eyebrow={eyebrow} title={title} className="!mb-8" />
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {hotel.facilities.map((f) => {
                const Icon = facIcon(f.icon);
                return (
                  <li key={f.name} className="flex gap-3.5 border-t border-line py-4">
                    <Icon className="mt-0.5 size-5 shrink-0 text-[color:var(--lux-accent-ink)]" strokeWidth={1.4} aria-hidden />
                    <span><b className="block text-[15.5px] font-semibold">{f.name}</b><span className="text-[14px] text-muted">{f.short}</span></span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </Container>
    </Sec>
  );
}

/* ================= GALLERY ================= */
export function Mosaic({ hotel, photos, eyebrow = "Gallery", title = "A closer look", k = "gallery.title" }: { hotel: Hotel; photos?: string[]; eyebrow?: string; title?: string; k?: string }) {
  const p = (photos ?? hotel.gallery).slice(0, 5);
  if (p.length < 3) return null;
  return (
    <Sec>
      <Container>
        <Reveal><Head hotel={hotel} k={k} eyebrow={eyebrow} title={title} center /></Reveal>
        <RevealGroup className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          {p.map((src, i) => (
            <RevealItem key={src} className={clsx("relative overflow-hidden rounded-[var(--lux-r)]", i === 0 ? "col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto" : "aspect-square", p.length === 3 && i > 0 && "md:col-span-2 md:aspect-[2/1]")}>
              <Image src={src} alt="" fill sizes={i === 0 ? "(max-width: 768px) 100vw, 620px" : "(max-width: 768px) 50vw, 300px"} className="object-cover" />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Sec>
  );
}

/* ================= EXPERIENCES ================= */
export function Experiences({ hotel, cats = ["activity", "spa", "celebration", "dining"], eyebrow = "Experiences", title = "Days worth remembering", k = "experiences.title", intro }: {
  hotel: Hotel; cats?: Hotel["services"][number]["category"][]; eyebrow?: string; title?: string; k?: string; intro?: string;
}) {
  const items = hotel.services.filter((s) => cats.includes(s.category) && s.photo).slice(0, 4);
  if (!items.length) return null;
  return (
    <Sec>
      <Container>
        <Reveal><Head hotel={hotel} k={k} eyebrow={eyebrow} title={title} intro={intro} /></Reveal>
        <RevealGroup className={clsx("grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-7 md:gap-y-10", items.length === 3 ? "lg:grid-cols-3" : items.length >= 4 && "lg:grid-cols-4")}>
          {items.map((s) => (
            <SiteVisible key={s.id} slug={hotel.slug} kind="services" id={s.id}>
              <RevealItem>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--lux-r)]"><Image src={s.photo!} alt="" fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover" /></div>
                <h3 className="lux-display mt-4 text-[20px] md:mt-5 md:text-[24px]">{s.name}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted md:mt-2 md:text-[15px]">{s.short}</p>
                <p className="mt-3 text-[14.5px]">{s.price > 0 ? <><b className="tabular-nums">{formatMoney(s.price)}</b> <span className="text-muted">{s.unit}</span></> : <b><T>Included</T></b>}</p>
              </RevealItem>
            </SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </Sec>
  );
}

/* ================= DINING ================= */
export function Dining({ hotel, eyebrow = "Dining", title = "At the table", k = "dining.title", src }: { hotel: Hotel; eyebrow?: string; title?: string; k?: string; src?: string }) {
  const venues = hotel.outlets.length
    ? hotel.outlets.map((o) => ({ id: o.id, name: o.name, short: o.short, meta: `${o.hours} · ${o.location}`, photo: o.photo }))
    : hotel.services.filter((s) => s.category === "dining").map((s) => ({ id: s.id, name: s.name, short: s.short, meta: `${formatMoney(s.price)} ${s.unit}`, photo: s.photo }));
  if (!venues.length) return null;
  const img = src ?? venues.find((v) => v.photo)?.photo ?? photo(hotel, /dining|lounge/);
  return (
    <Sec>
      <Container>
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16">
          <Reveal className="relative aspect-[5/4] overflow-hidden rounded-[var(--lux-r)]"><Image src={img} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" /></Reveal>
          <Reveal delay={0.05}>
            <Head hotel={hotel} k={k} eyebrow={eyebrow} title={title} className="!mb-6" />
            <ul className="divide-y divide-line border-y border-line">
              {venues.map((v) => (
                <li key={v.id} className="py-5">
                  <h3 className="lux-display text-[24px]">{v.name}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{v.short}</p>
                  <p className="mt-2 text-[13.5px] font-medium tabular-nums">{v.meta}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </Sec>
  );
}

/* ================= TIMELINE ================= */
export function Timeline({ hotel, items, eyebrow, title, k, center }: {
  hotel: Hotel; items?: { time: string; title: string; text: string }[]; eyebrow: string; title: string; k: string; center?: boolean;
}) {
  if (!items?.length) return null;
  return (
    <Sec>
      <Container className="max-w-[980px]">
        <Reveal><Head hotel={hotel} k={k} eyebrow={eyebrow} title={title} center={center} /></Reveal>
        <Reveal>
          <ol className="relative border-l border-line pl-7 md:border-l-0 md:pl-0">
            {items.map((d, i) => (
              <li key={`${d.time}-${i}`} className="relative pb-9 md:grid md:grid-cols-[180px_1fr] md:gap-10 md:border-t md:border-line md:py-8">
                <span aria-hidden className="absolute -left-[33px] top-1.5 size-3 rounded-full border-2 border-[color:var(--lux-accent)] bg-canvas md:hidden" />
                <p className="lux-display text-[22px] tabular-nums text-[color:var(--lux-accent-ink)] md:text-[28px]">{d.time}</p>
                <div>
                  <h3 className="mt-1 text-[18px] font-semibold md:mt-0 md:text-[20px]">{d.title}</h3>
                  <p className="mt-1.5 text-[15.5px] leading-relaxed text-muted">{d.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </Sec>
  );
}

/* ================= REVIEWS ================= */
export function Quote({ hotel, eyebrow = "Guests" }: { hotel: Hotel; eyebrow?: string }) {
  if (!hotel.reviews.length) return null;
  const [lead, ...rest] = [...hotel.reviews].sort((a, b) => b.score - a.score || b.text.length - a.text.length);
  return (
    <Sec>
      <Container className="max-w-[1080px]">
        <Reveal className="text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <span aria-hidden className="lux-rule mx-auto mt-4" />
          <SiteVisible slug={hotel.slug} kind="reviews" id={lead.id}>
            <figure className="mt-8">
              <blockquote className="lux-display mx-auto max-w-[880px] text-[28px] md:text-[46px]">“{lead.text}”</blockquote>
              <figcaption className="mt-6 text-[14.5px] text-muted">{lead.name} · {lead.from} · {lead.stayed}</figcaption>
            </figure>
          </SiteVisible>
          {showRating(hotel) && <p className="mt-6 text-[15px]"><b className="tabular-nums">{hotel.reviewScore}</b> / 5 <span className="text-muted">· {hotel.reviewCount} <T>reviews</T></span></p>}
        </Reveal>
        {rest.length > 0 && (
          <RevealGroup className="mt-12 grid gap-6 border-t border-line pt-10 md:grid-cols-3">
            {rest.slice(0, 3).map((r) => (
              <SiteVisible key={r.id} slug={hotel.slug} kind="reviews" id={r.id}>
                <RevealItem>
                  <figure>
                    <blockquote className="text-[16px] leading-relaxed">“{r.text}”</blockquote>
                    <figcaption className="mt-3 text-[13.5px] text-muted">{r.name} · {r.from}</figcaption>
                  </figure>
                </RevealItem>
              </SiteVisible>
            ))}
          </RevealGroup>
        )}
      </Container>
    </Sec>
  );
}

/* ================= OFFERS ================= */
export function Offers({ hotel, eyebrow = "Book direct", title = "Privileges for direct guests", k = "offers.title" }: { hotel: Hotel; eyebrow?: string; title?: string; k?: string }) {
  const offers = visibleOffers(hotel).slice(0, 3);
  if (!offers.length) return null;
  return (
    <Sec>
      <Container>
        <Reveal><Head hotel={hotel} k={k} eyebrow={eyebrow} title={title} /></Reveal>
        <RevealGroup className={clsx("grid gap-5", offers.length > 1 && "md:grid-cols-2", offers.length > 2 && "lg:grid-cols-3")}>
          {offers.map((o) => (
            <SiteVisible key={o.id} slug={hotel.slug} kind="offers" id={o.id}>
              <RevealItem>
                <Link href={`/hotel/${hotel.slug}/offers`} className="lux-card group flex h-full flex-col border border-line p-7 transition-colors hover:border-[color:var(--lux-accent)] rounded-[var(--lux-r)]">
                  <p className="lux-display text-[40px] text-[color:var(--lux-accent-ink)]">{o.value}</p>
                  <h3 className="mt-3 text-[18px] font-semibold">{o.title}</h3>
                  <p className="mt-1.5 text-[15px] text-muted">{o.conditions}</p>
                  <span className="lux-link mt-auto pt-6"><T>View offer</T> <ArrowRight className="size-4" aria-hidden /></span>
                </Link>
              </RevealItem>
            </SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </Sec>
  );
}

/* ================= ARRIVAL ================= */
export function Arrival({ hotel, src, eyebrow = "Arrival", title, k = "arrival.title" }: { hotel: Hotel; src?: string; eyebrow?: string; title?: string; k?: string }) {
  if (!hotel.nearby?.length) return null;
  const transfer = hotel.services.find((s) => s.category === "transfer");
  return (
    <Sec>
      <Container>
        <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-16">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[var(--lux-r)]"><Image src={src ?? photo(hotel, /beach|tower|garden|jetty|path|shore/)} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" /></Reveal>
          <Reveal delay={0.05}>
            <Head hotel={hotel} k={k} eyebrow={eyebrow} title={title ?? `${hotel.area}, ${hotel.city}`} className="!mb-6" />
            <p className="text-[15px] text-muted">{hotel.address}</p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {hotel.nearby.map((n) => (
                <li key={n.name} className="flex items-center justify-between gap-3 py-3.5">
                  <span className="flex items-center gap-3 text-[15px]">{n.mode === "walk" ? <Footprints className="size-[18px] text-muted" aria-hidden /> : <Car className="size-[18px] text-muted" aria-hidden />}{n.name}</span>
                  <span className="shrink-0 font-semibold tabular-nums">{n.time}</span>
                </li>
              ))}
            </ul>
            {transfer && <SiteVisible slug={hotel.slug} kind="services" id={transfer.id}><p className="mt-4 text-[15px]"><b>{transfer.name}</b> — {transfer.short} <span className="whitespace-nowrap font-semibold tabular-nums">{formatMoney(transfer.price)} {transfer.unit}</span></p></SiteVisible>}
            <a href={mapsLink(hotel)} target="_blank" rel="noopener" className="lux-btn-ghost mt-6"><Navigation className="size-4" aria-hidden /> <T>Get directions</T></a>
          </Reveal>
        </div>
      </Container>
    </Sec>
  );
}

/* ================= FAQ ================= */
export function Faq({ hotel, eyebrow = "Good to know", title = "Before you arrive", k = "faq.title" }: { hotel: Hotel; eyebrow?: string; title?: string; k?: string }) {
  if (!hotel.faq?.length) return null;
  return (
    <Sec>
      <Container className="max-w-[900px]">
        <Reveal><Head hotel={hotel} k={k} eyebrow={eyebrow} title={title} center /></Reveal>
        <div className="divide-y divide-line border-y border-line">
          {hotel.faq.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold">
                {f.q}<span aria-hidden className="text-[22px] font-light transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Sec>
  );
}

/* ================= CONCIERGE + RESERVE ================= */
export function Concierge({ hotel, light }: { hotel: Hotel; light?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href={roomsHref(hotel)} className="lux-btn"><T>Reserve your stay</T> <ArrowRight className="size-4" aria-hidden /></Link>
      {hotel.whatsapp && <a href={waLink(hotel, `Hello ${hotel.name}, I'd like to plan a stay.`)} target="_blank" rel="noopener" className={clsx("lux-btn-ghost", light && "lux-btn-ghost-light")}><MessageCircle className="size-4" aria-hidden /> <T>Concierge on WhatsApp</T></a>}
      <a href={telLink(hotel)} className={clsx("lux-btn-ghost", light && "lux-btn-ghost-light")}><Phone className="size-4" aria-hidden /> <T>Call</T></a>
    </div>
  );
}

export function Reserve({ hotel, src, title = "Your stay begins here", k = "reserve.title", eyebrow = "Reservations" }: { hotel: Hotel; src?: string; title?: string; k?: string; eyebrow?: string }) {
  return (
    <section className="mt-20 pb-6 md:mt-36 md:pb-10">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[var(--lux-r)] text-white">
          <div className="absolute inset-0"><Image src={src ?? photo(hotel, /sunset|night|pool/)} alt="" fill sizes="(max-width: 1240px) 100vw, 1240px" className="object-cover" /></div>
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative px-6 py-16 text-center md:px-16 md:py-28">
            <p className="lux-eyebrow !text-white/85"><T>{eyebrow}</T></p>
            <span aria-hidden className="lux-rule mx-auto mt-4 !bg-white/70" />
            <h2 className="lux-display mx-auto mt-6 max-w-[760px] text-[36px] text-white md:text-[64px]"><DraftText slug={hotel.slug} k={k} fallback={title} /></h2>
            <p className="mx-auto mt-4 max-w-[560px] text-[16px] text-white/85">{hotel.checkIn} <T>check-in</T> · {hotel.checkOut} <T>check-out</T> · {hotel.policies.cancellation}</p>
            <div className="mt-8 flex justify-center"><Concierge hotel={hotel} light /></div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/** Small "facts" row: check-in/out, stars, rating, a highlight. */
export function Facts({ hotel }: { hotel: Hotel }) {
  const items = [
    hotel.stars ? { k: "Category", v: `${hotel.stars}-star` } : null,
    { k: "Check-in", v: hotel.checkIn },
    { k: "Check-out", v: hotel.checkOut },
    showRating(hotel) ? { k: "Guests rate us", v: `${hotel.reviewScore} / 5` } : { k: "Highlights", v: hotel.highlights[0] ?? "" },
  ].filter(Boolean) as { k: string; v: string }[];
  return (
    <Container className="mt-14 md:mt-20">
      <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4">
        {items.map((it, i) => (
          <div key={it.k} className={clsx("px-2 py-5 text-center md:py-7", i % 2 === 1 && "border-l border-line", i >= 2 && "border-t border-line md:border-t-0", i === 2 && "md:border-l")}>
            <dt className="lux-eyebrow !tracking-[0.2em]"><T>{it.k}</T></dt>
            <dd className="lux-display mt-2 text-[22px] md:text-[28px]">{it.v}</dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}

/* ================= PAGE ================= */
import { DraftSections } from "@/components/site-draft/Draft";
import { MANIFESTS } from "../manifest";
import type { MasterTheme } from "@/lib/types";

/** Renders the parts in the manifest's section order (Website Management can hide / reorder them). */
export function LuxPage({ hotel, master, parts }: { hotel: Hotel; master: MasterTheme; parts: Record<string, ReactNode> }) {
  const items = MANIFESTS[master].sections.filter((s) => parts[s.id] != null).map((s) => ({ id: s.id, node: parts[s.id] }));
  return <div className="lux pb-4"><DraftSections slug={hotel.slug} master={master} items={items} /></div>;
}
