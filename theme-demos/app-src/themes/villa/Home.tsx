import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Car, CheckCircle2, Clock, Footprints, MessageCircle, Navigation, PawPrint, Ruler, ShieldCheck, Star, Users, Waves, Baby, Ban } from "lucide-react";
import type { ReactNode } from "react";
import type { Hotel, RoomCategory } from "@/lib/types";
import { formatMoney, showRating } from "@/lib/data";
import { SearchBar } from "@/components/booking/SearchBar";
import { HeroIn, PhotoIn, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { Reviews } from "@/components/sections/HomeSections";
import { DraftSections, DraftText, SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { FromPrice, PhoneHeroCard, mapsLink, waLink } from "../shared";

/**
 * VILLA (Business plan) — private villas and pool villas.
 * Guests book the whole place, so the page answers: how many bedrooms, how many people, is the pool private, what's included, what are the rules.
 */
export function VillaHome({ hotel }: { hotel: Hotel }) {
  return (
    <DraftSections
      slug={hotel.slug}
      master="villa"
      items={[
        { id: "hero", node: <Hero hotel={hotel} /> },
        { id: "villas", node: <Villas hotel={hotel} /> },
        { id: "inside", node: <Inside hotel={hotel} /> },
        { id: "included", node: <Included hotel={hotel} /> },
        { id: "rules", node: <Rules hotel={hotel} /> },
        { id: "location", node: <Location hotel={hotel} /> },
        { id: "reviews", node: <Reviews hotel={hotel} /> },
        { id: "enquire", node: <Enquire hotel={hotel} /> },
      ]}
    />
  );
}

function Head({ label, title, sub }: { label: string; title: ReactNode; sub?: string }) {
  return (
    <div className="mb-6 max-w-[720px] md:mb-12">
      <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-muted md:text-[13px]"><T>{label}</T></p>
      <h2 className="mt-2 font-heading text-[28px] leading-[1.1] md:mt-3 md:text-[48px]">{typeof title === "string" ? <T>{title}</T> : title}</h2>
      {sub && <p className="mt-3 text-[15px] text-muted md:text-[17px]">{sub}</p>}
    </div>
  );
}

/* ---------- Hero: full-width photo, quiet type ---------- */
function Hero({ hotel }: { hotel: Hotel }) {
  const villas = hotel.rooms.reduce((n, r) => n + r.units, 0);
  return (
    <section>
      <PhoneHeroCard hotel={hotel} radius={20} />
      <div className="relative hidden h-[min(86svh,820px)] min-h-[560px] overflow-hidden md:block">
        <PhotoIn className="absolute inset-0">
          <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" quality={85} className="object-cover" />
        </PhotoIn>
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
        <Container className="relative flex h-full flex-col justify-end pb-28 text-white">
          <HeroIn delay={0.05}>
            <p className="text-[13px] font-medium uppercase tracking-[0.22em] opacity-90">{villas} private villas · {hotel.area}, {hotel.city}</p>
            <h1 className="mt-3 max-w-[860px] font-heading text-[60px] leading-[1.02] lg:text-[76px]"><DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} /></h1>
            <p className="mt-4 max-w-[560px] text-[18px] leading-relaxed opacity-90"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
          </HeroIn>
        </Container>
      </div>
      <Container className="pt-5 md:hidden">
        <HeroIn delay={0.05}>
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-muted">{villas} private villas · {hotel.city}</p>
          <h1 className="mt-2 font-heading text-[32px] leading-[1.08]"><DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} /></h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted"><DraftText slug={hotel.slug} k="hero.intro" fallback={hotel.intro} /></p>
          {showRating(hotel) && <p className="mt-3 flex items-center gap-1.5 text-[14px]"><Star className="size-4 fill-brand text-brand" /> <b>{hotel.reviewScore}</b> <span className="text-muted">· {hotel.reviewCount} reviews</span></p>}
        </HeroIn>
      </Container>
      <Container className="relative z-10 mt-4 md:-mt-12">
        <HeroIn delay={0.2} className="mx-auto max-w-[1040px]"><SearchBar /></HeroIn>
      </Container>
    </section>
  );
}

function Spec({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return <li className="flex items-center gap-2 text-[14px] md:text-[15px]"><Icon className="size-[18px] shrink-0 text-action" strokeWidth={1.75} /> {label}</li>;
}

function specs(r: RoomCategory) {
  return [
    { icon: BedDouble, label: `${r.bedrooms ?? 1} bedroom${(r.bedrooms ?? 1) > 1 ? "s" : ""}` },
    { icon: Users, label: `Up to ${r.maxAdults + r.maxChildren} guests` },
    ...(r.sizeSqft ? [{ icon: Ruler, label: `${r.sizeSqft.toLocaleString("en-IN")} sq ft` }] : []),
    ...(r.specs ?? []).slice(0, 3).map((s) => ({ icon: /pool/i.test(s) ? Waves : CheckCircle2, label: s })),
  ];
}

/* ---------- Villas: one wide card each ---------- */
function Villas({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal><Head label="The villas" title={<DraftText slug={hotel.slug} k="villas.title" fallback="Choose your villa" />} /></Reveal>
        <div className="space-y-6 md:space-y-10">
          {hotel.rooms.map((r) => (
            <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
              <Reveal>
                <article className="grid overflow-hidden rounded-[20px] border border-line bg-surface md:grid-cols-[1.25fr_1fr]">
                  <Link href={`${base}/rooms/${r.slug}`} className="group relative block aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[420px]">
                    <Image src={r.photos[0]} alt={r.name} fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                  </Link>
                  <div className="flex flex-col p-5 md:p-10">
                    <h3 className="font-heading text-[26px] leading-tight md:text-[36px]">{r.name}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted md:text-[16px]">{r.description}</p>
                    <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">{specs(r).map((s) => <Spec key={s.label} {...s} />)}</ul>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
                      <FromPrice room={r} className="text-[17px]" />
                      <Link href={`${base}/rooms/${r.slug}`} className="inline-flex h-12 items-center gap-2 rounded-full bg-action px-6 text-[15px] font-semibold text-on-action transition-transform active:scale-[0.98]">
                        <T>Book the villa</T> <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            </SiteVisible>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Inside: a photo walk-through ---------- */
function Inside({ hotel }: { hotel: Hotel }) {
  const pics = hotel.gallery.slice(0, 5);
  if (pics.length < 3) return null;
  const label = (src: string) => src.split("/").pop()!.replace(/\.\w+$/, "").replace(/-/g, " ");
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal><Head label="Inside" title={<DraftText slug={hotel.slug} k="copy.walk-through-the-villa" fallback="Walk through the villa" />} /></Reveal>
        <RevealGroup className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          {pics.map((p, i) => (
            <RevealItem key={p} className={`relative overflow-hidden rounded-[16px] ${i === 0 ? "col-span-2 aspect-[16/10] md:row-span-2 md:aspect-auto" : "aspect-square"}`}>
              <Image src={p} alt={label(p)} fill sizes={i === 0 ? "(max-width: 768px) 100vw, 620px" : "(max-width: 768px) 50vw, 300px"} className="object-cover" />
              <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/45 px-2.5 py-1 text-[12px] capitalize text-white backdrop-blur">{label(p)}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Included vs on request (price 0 = included) ---------- */
function Included({ hotel }: { hotel: Hotel }) {
  const inc = hotel.services.filter((s) => s.price === 0);
  const req = hotel.services.filter((s) => s.price > 0);
  if (!hotel.services.length) return null;
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal><Head label="Service" title={<DraftText slug={hotel.slug} k="copy.what-s-included-what-s-on-request" fallback="What's included, what's on request" />} /></Reveal>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {[{ t: "Included with every villa", items: inc, included: true }, { t: "On request", items: req, included: false }].filter((g) => g.items.length).map((g) => (
            <Reveal key={g.t} className="rounded-[20px] border border-line bg-surface p-5 md:p-8">
              <p className="text-[15px] font-semibold"><T>{g.t}</T></p>
              <ul className="mt-4 divide-y divide-line">
                {g.items.map((s) => (
                  <SiteVisible key={s.id} slug={hotel.slug} kind="services" id={s.id}><li className="flex items-start justify-between gap-4 py-3.5">
                    <span className="flex gap-3">
                      <CheckCircle2 className={`mt-0.5 size-[18px] shrink-0 ${g.included ? "text-action" : "text-muted"}`} />
                      <span><span className="block text-[15px] font-medium">{s.name}</span><span className="text-[14px] text-muted">{s.short}</span></span>
                    </span>
                    {!g.included && <span className="shrink-0 text-right text-[14px]"><b>{formatMoney(s.price)}</b><span className="block text-muted">{s.unit}</span></span>}
                  </li></SiteVisible>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- House rules ---------- */
function Rules({ hotel }: { hotel: Hotel }) {
  const adv = hotel.payments.find((p) => p.kind === "advance");
  const rules = [
    { icon: Clock, title: `Check-in ${hotel.checkIn}`, text: `Check-out ${hotel.checkOut}` },
    { icon: ShieldCheck, title: adv ? `${adv.percent}% advance to confirm` : "Pay at the villa", text: hotel.policies.cancellation },
    { icon: Baby, title: "Children", text: hotel.policies.children },
    { icon: PawPrint, title: "Pets", text: hotel.policies.pets },
    ...(hotel.houseRules ?? []).map((r) => ({ icon: Ban, title: r.title, text: r.text })),
  ];
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal><Head label="Good to know" title={<DraftText slug={hotel.slug} k="copy.house-rules" fallback="House rules" />} /></Reveal>
        <RevealGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((r) => (
            <RevealItem key={r.title} className="flex gap-3.5 border-t border-line pt-5">
              <r.icon className="mt-0.5 size-5 shrink-0 text-action" strokeWidth={1.75} />
              <div><p className="text-[16px] font-semibold"><T>{r.title}</T></p><p className="mt-1 text-[14.5px] leading-relaxed text-muted">{r.text}</p></div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Location ---------- */
function Location({ hotel }: { hotel: Hotel }) {
  if (!hotel.nearby?.length) return null;
  return (
    <section className="mt-14 md:mt-28">
      <Container>
        <Reveal className="grid gap-6 rounded-[20px] bg-brand-soft p-5 md:grid-cols-[1fr_1.2fr] md:gap-14 md:p-12">
          <div>
            <Head label="Location" title={`${hotel.area}, ${hotel.city}`} sub={hotel.address} />
            <a href={mapsLink(hotel)} target="_blank" rel="noopener" className="-mt-2 inline-flex h-12 items-center gap-2 rounded-full bg-action px-6 text-[15px] font-semibold text-on-action md:-mt-6"><Navigation className="size-4" /> <T>Get directions</T></a>
          </div>
          <ul className="divide-y divide-line self-center">
            {hotel.nearby.map((n) => (
              <li key={n.name} className="flex items-center justify-between gap-3 py-3.5">
                <span className="flex items-center gap-3 text-[15px] md:text-[16px]">{n.mode === "walk" ? <Footprints className="size-[18px] text-muted" /> : <Car className="size-[18px] text-muted" />}{n.name}</span>
                <span className="shrink-0 font-semibold tabular-nums">{n.time}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- Enquire: events, shoots, long stays ---------- */
function Enquire({ hotel }: { hotel: Hotel }) {
  return (
    <section className="mb-12 mt-14 md:mb-24 md:mt-24">
      <Container>
        <Reveal className="grid overflow-hidden rounded-[20px] bg-ink text-white md:grid-cols-2">
          <div className="p-6 md:p-14">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] opacity-70"><T>Private events & long stays</T></p>
            <h2 className="mt-3 font-heading text-[28px] leading-tight md:text-[44px]"><DraftText slug={hotel.slug} k="copy.birthdays-shoots-family-weekends" fallback="Birthdays, shoots, family weekends" /></h2>
            <p className="mt-3 text-[15px] opacity-80 md:text-[17px]">Tell us your date, group size and occasion on WhatsApp and we will send a price.</p>
            <a href={waLink(hotel, `Hello, I'd like a quote for ${hotel.name}. Date: , guests: , occasion: `)} target="_blank" rel="noopener" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-[#1d1d1f]">
              <MessageCircle className="size-[18px]" /> <T>Ask on WhatsApp</T>
            </a>
          </div>
          <div className="relative min-h-[240px]"><Image src={hotel.gallery[1] ?? hotel.heroPhoto} alt="" fill sizes="(max-width: 768px) 100vw, 620px" className="object-cover" /></div>
        </Reveal>
      </Container>
    </section>
  );
}
