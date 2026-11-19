import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Minus, Navigation } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney, showRating } from "@/lib/data";
import { SearchBar } from "@/components/booking/SearchBar";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { DraftText, SiteVisible } from "@/components/site-draft/Draft";
import { FxScope } from "@/fx/fx";
import { T } from "@/lib/i18n";
import { mapsLink, photo } from "../shared";
import { Concierge, LuxPage, roomHref } from "../lux/kit";
import { Voyage } from "./Voyage";
import { overWater } from "./util";

/**
 * ISLE v2 (Luxury Collection) — island and overwater villa resorts.
 * Signature: a real-time 3D island built from the hotel's villas; the guest scrolls from the speedboat arrival to sunset.
 * Type: Italiana (display) · Manrope (text) · Bodoni Moda italic (accent numbers and quotes).
 */
export function IsleHome({ hotel }: { hotel: Hotel }) {
  return (
    <FxScope slug={hotel.slug} theme="isle">
      <LuxPage
        hotel={hotel}
        master="isle"
        parts={{
          hero: <Voyage hotel={hotel} />,
          facts: <BookBand hotel={hotel} />,
          signature: <Compare hotel={hotel} />,
          journey: <TideClock hotel={hotel} />,
          experiences: <Postcards hotel={hotel} />,
          dining: <Menu hotel={hotel} />,
          gallery: <Strip hotel={hotel} />,
          reviews: <GuestBook hotel={hotel} />,
          arrival: <Route hotel={hotel} />,
          reserve: <Last hotel={hotel} />,
        }}
      />
    </FxScope>
  );
}

function Title({ hotel, k, eyebrow, title, center, light }: { hotel: Hotel; k: string; eyebrow: string; title: string; center?: boolean; light?: boolean }) {
  return (
    <div className={center ? "mx-auto mb-10 max-w-[780px] text-center md:mb-16" : "mb-8 max-w-[780px] md:mb-14"}>
      <p className={`isle-accent text-[17px] md:text-[20px] ${light ? "text-white/85" : "text-[color:var(--lux-accent-ink)]"}`}><T>{eyebrow}</T></p>
      <h2 className={`lux-display mt-3 text-[40px] md:text-[76px] ${light ? "text-white" : ""}`}><DraftText slug={hotel.slug} k={k} fallback={title} /></h2>
    </div>
  );
}

/* ---------- Book band: the booking bar on a sand band, with the honest "from" price ---------- */
function BookBand({ hotel }: { hotel: Hotel }) {
  const from = Math.min(...hotel.rooms.map((r) => r.fromPrice));
  return (
    <section className="relative z-10 bg-[#efe6d4]">
      <Container className="grid gap-5 py-8 md:grid-cols-[220px_1fr] md:items-center md:py-10">
        <div>
          <p className="isle-accent text-[18px] text-[color:var(--lux-accent-ink)]"><T>Plan your stay</T></p>
          {Number.isFinite(from) && <p className="mt-1 text-[14.5px] text-muted"><T>Villas from</T> <b className="text-ink tabular-nums">{formatMoney(from)}</b> <T>/ night</T></p>}
        </div>
        <SearchBar />
      </Container>
    </section>
  );
}

/* ---------- Signature 2: villa comparison (what really differs between villas) ---------- */
function Compare({ hotel }: { hotel: Hotel }) {
  const rows: { label: string; get: (r: Hotel["rooms"][number]) => React.ReactNode }[] = [
    { label: "Where", get: (r) => (overWater(r.view) ? "Over the water" : "On the beach") },
    { label: "Size", get: (r) => (r.sizeSqft ? `${r.sizeSqft.toLocaleString()} sq ft` : "—") },
    { label: "Sleeps", get: (r) => `${r.maxAdults + r.maxChildren}` },
    { label: "Private pool", get: (r) => (r.amenities.some((a) => /pool/i.test(a)) ? <Check className="mx-auto size-4" aria-label="Yes" /> : <Minus className="mx-auto size-4 opacity-40" aria-label="No" />) },
    { label: "From / night", get: (r) => <b className="tabular-nums">{formatMoney(r.fromPrice)}</b> },
  ];
  return (
    <section className="mt-20 md:mt-36">
      <Container>
        <Reveal><Title hotel={hotel} k="signature.title" eyebrow="Choose your villa" title="Four villas, side by side" center /></Reveal>
        <Reveal>
          <div tabIndex={0} role="region" aria-label="Villa comparison" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
            <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-center">
              <thead>
                <tr>
                  <th scope="col" className="w-[150px] text-left align-bottom"><span className="sr-only">Villa</span></th>
                  {hotel.rooms.map((r) => (
                    <th key={r.id} scope="col" className="px-2 pb-5 align-bottom font-normal">
                      <SiteVisible slug={hotel.slug} kind="rooms" id={r.id}>
                        <Link href={roomHref(hotel, r)} className="group block">
                          <div className="relative mx-auto aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-[22px]"><Image src={r.photos[0]} alt="" fill sizes="220px" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" /></div>
                          <span className="lux-display mt-4 block text-[24px] md:text-[28px]">{r.name}</span>
                        </Link>
                      </SiteVisible>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="border-t border-line py-4 text-left text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">{row.label}</th>
                    {hotel.rooms.map((r) => <td key={r.id} className="border-t border-line px-2 py-4 text-[15px]">{row.get(r)}</td>)}
                  </tr>
                ))}
                <tr>
                  <td />
                  {hotel.rooms.map((r) => <td key={r.id} className="px-2 pt-5"><Link href={roomHref(hotel, r)} className="lux-link"><T>View villa</T> <ArrowRight className="size-4" aria-hidden /></Link></td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- Tide clock: the day plan on a 24-hour dial ---------- */
function TideClock({ hotel }: { hotel: Hotel }) {
  const items = hotel.dayPlan ?? [];
  if (!items.length) return null;
  const angle = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return (((h || 0) + (m || 0) / 60) / 24) * 360 - 90;
  };
  return (
    <section className="mt-20 overflow-hidden bg-[#0e2a30] py-20 text-white md:mt-36 md:py-32">
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1fr] md:gap-20">
          <Reveal className="relative mx-auto aspect-square w-full max-w-[460px]">
            <svg viewBox="-110 -110 220 220" className="h-full w-full" role="img" aria-label="Day plan on a 24-hour clock">
              <defs>
                <linearGradient id="isle-tide" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#58d6cf" /><stop offset="1" stopColor="#ff9a5a" /></linearGradient>
              </defs>
              <circle r="96" fill="none" stroke="rgb(255 255 255 / 0.15)" />
              <circle r="72" fill="none" stroke="url(#isle-tide)" strokeWidth="10" strokeDasharray="2 4" opacity="0.65" />
              {Array.from({ length: 24 }).map((_, h) => {
                const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
                return <line key={h} x1={Math.cos(a) * 88} y1={Math.sin(a) * 88} x2={Math.cos(a) * (h % 6 ? 92 : 96)} y2={Math.sin(a) * (h % 6 ? 92 : 96)} stroke="rgb(255 255 255 / 0.45)" strokeWidth={h % 6 ? 0.6 : 1.4} />;
              })}
              {[["0:00", "midnight"], ["6:00", "6"], ["12:00", "noon"], ["18:00", "18"]].map(([t, l]) => {
                const a = (angle(t) * Math.PI) / 180;
                return <text key={t} x={Math.cos(a) * 104} y={Math.sin(a) * 104 + 2.5} textAnchor="middle" fontSize="7" fill="rgb(255 255 255 / 0.6)">{l}</text>;
              })}
              {items.map((d, i) => {
                const a = (angle(d.time) * Math.PI) / 180;
                return (
                  <g key={d.time + i}>
                    <line x1="0" y1="0" x2={Math.cos(a) * 72} y2={Math.sin(a) * 72} stroke="rgb(255 255 255 / 0.25)" strokeWidth="0.6" />
                    <circle cx={Math.cos(a) * 72} cy={Math.sin(a) * 72} r="6" fill="#0e2a30" stroke="#58d6cf" strokeWidth="1.6" />
                    <text x={Math.cos(a) * 72} y={Math.sin(a) * 72 + 2.2} textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">{i + 1}</text>
                  </g>
                );
              })}
              <text y="-4" textAnchor="middle" fontSize="14" fill="#fff" style={{ fontFamily: "var(--font-heading)" }}>A day</text>
              <text y="12" textAnchor="middle" fontSize="9" fill="rgb(255 255 255 / 0.7)" style={{ fontFamily: "var(--isle-accent)", fontStyle: "italic" }}>by the tide</text>
            </svg>
          </Reveal>
          <Reveal>
            <Title hotel={hotel} k="journey.title" eyebrow="The tide clock" title="Days move with the water" light />
            <ol className="space-y-5">
              {items.map((d, i) => (
                <li key={d.time + i} className="grid grid-cols-[34px_70px_1fr] items-baseline gap-3">
                  <span className="grid size-[26px] place-items-center rounded-full border border-[#58d6cf] text-[12px] font-bold">{i + 1}</span>
                  <span className="isle-accent text-[20px] tabular-nums text-[#9fe7e1]">{d.time}</span>
                  <span><b className="block text-[16.5px]">{d.title}</b><span className="text-[14.5px] text-white/75">{d.text}</span></span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Experiences as postcards ---------- */
function Postcards({ hotel }: { hotel: Hotel }) {
  const items = hotel.services.filter((s) => s.photo && s.category !== "transfer");
  if (!items.length) return null;
  const tilt = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-1"];
  return (
    <section className="mt-20 md:mt-36">
      <Container>
        <Reveal><Title hotel={hotel} k="experiences.title" eyebrow="Wish you were here" title="Postcards from the island" /></Reveal>
      </Container>
      <div tabIndex={0} role="region" aria-label="Experiences" className="no-scrollbar snap-x snap-mandatory scroll-px-4 overflow-x-auto sm:scroll-px-6">
      <RevealGroup className="flex gap-6 px-4 pb-10 pt-4 sm:px-6 md:mx-auto md:max-w-[1240px] md:gap-8">
        {items.map((s, i) => (
          <SiteVisible key={s.id} slug={hotel.slug} kind="services" id={s.id}>
            <RevealItem className={`w-[78%] max-w-[330px] shrink-0 snap-start ${tilt[i % tilt.length]} transition-transform duration-500 hover:rotate-0`}>
              <article className="bg-white p-3 pb-5 shadow-[0_18px_40px_-18px_rgb(14_42_48/0.45)]">
                <div className="relative aspect-[4/3] overflow-hidden"><Image src={s.photo!} alt="" fill sizes="330px" className="object-cover" /></div>
                <div className="flex items-start justify-between gap-3 px-1 pt-4">
                  <div>
                    <h3 className="isle-accent text-[22px] leading-tight">{s.name}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{s.short}</p>
                  </div>
                  <span aria-hidden className="grid size-12 shrink-0 rotate-6 place-items-center border border-dashed border-[color:var(--lux-accent)] text-[9px] font-bold uppercase leading-tight tracking-wider text-[color:var(--lux-accent-ink)]">{hotel.logoText}<br />post</span>
                </div>
                <p className="mt-3 px-1 text-[14px]"><b className="tabular-nums">{formatMoney(s.price)}</b> <span className="text-muted">{s.unit}</span></p>
              </article>
            </RevealItem>
          </SiteVisible>
        ))}
      </RevealGroup>
      </div>
    </section>
  );
}

/* ---------- Dining as a printed menu card ---------- */
function Menu({ hotel }: { hotel: Hotel }) {
  if (!hotel.outlets.length) return null;
  return (
    <section className="mt-20 md:mt-36">
      <Container>
        <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:items-stretch md:gap-0">
          <Reveal className="relative min-h-[360px] overflow-hidden rounded-[var(--lux-r)] md:rounded-r-none"><Image src={photo(hotel, /jetty|sunset/)} alt="" fill sizes="(max-width: 768px) 100vw, 660px" className="object-cover" /></Reveal>
          <Reveal className="rounded-[var(--lux-r)] border border-line bg-surface p-7 md:rounded-l-none md:p-12">
            <p className="isle-accent text-center text-[18px] text-[color:var(--lux-accent-ink)]"><T>Dining on the island</T></p>
            <h2 className="lux-display mt-2 text-center text-[38px] md:text-[54px]"><DraftText slug={hotel.slug} k="dining.title" fallback="Tonight's tables" /></h2>
            <div aria-hidden className="mx-auto mt-5 flex w-24 items-center gap-2 text-[color:var(--lux-accent)]"><span className="h-px flex-1 bg-current" />✦<span className="h-px flex-1 bg-current" /></div>
            <ul className="mt-6 space-y-6">
              {hotel.outlets.map((o) => (
                <li key={o.id} className="text-center">
                  <h3 className="lux-display text-[26px]">{o.name}</h3>
                  <p className="mx-auto mt-1 max-w-[380px] text-[14.5px] leading-relaxed text-muted">{o.short}</p>
                  <p className="mt-1.5 text-[12.5px] font-semibold uppercase tracking-[0.16em]">{o.hours} · {o.location}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center"><Link href={`/hotel/${hotel.slug}/dining`} className="lux-link"><T>Dining & table requests</T> <ArrowRight className="size-4" aria-hidden /></Link></p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Gallery: a wide drifting strip ---------- */
function Strip({ hotel }: { hotel: Hotel }) {
  const g = hotel.gallery.slice(0, 6);
  if (g.length < 3) return null;
  return (
    <section className="mt-20 md:mt-36" aria-label="Gallery">
      <div tabIndex={0} role="region" aria-label="Photos of the island" className="no-scrollbar flex gap-3 overflow-x-auto px-4 md:gap-5 md:px-10">
        {g.map((src, i) => (
          <div key={src} className={`relative shrink-0 overflow-hidden rounded-[var(--lux-r)] ${i % 3 === 0 ? "h-[300px] w-[440px] md:h-[460px] md:w-[680px]" : i % 3 === 1 ? "mt-10 h-[260px] w-[220px] md:h-[380px] md:w-[320px]" : "h-[300px] w-[300px] md:h-[420px] md:w-[420px]"}`}>
            <Image src={src} alt="" fill sizes="680px" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Reviews as a guest book ---------- */
function GuestBook({ hotel }: { hotel: Hotel }) {
  if (!hotel.reviews.length) return null;
  return (
    <section className="mt-20 md:mt-36">
      <Container className="max-w-[1100px]">
        <Reveal><Title hotel={hotel} k="reviews.title" eyebrow={showRating(hotel) ? `${hotel.reviewScore} / 5 from ${hotel.reviewCount} guests` : "Guests"} title="From the guest book" center /></Reveal>
        <RevealGroup className="columns-1 gap-6 md:columns-2 lg:columns-3">
          {hotel.reviews.map((r, i) => (
            <SiteVisible key={r.id} slug={hotel.slug} kind="reviews" id={r.id}>
              <RevealItem className={`mb-6 break-inside-avoid rounded-[22px] p-6 ${i === 0 ? "bg-[#0e2a30] text-white" : "border border-line bg-surface"}`}>
                <figure>
                  <blockquote className={`isle-accent leading-snug ${i === 0 ? "text-[26px]" : "text-[19px]"}`}>“{r.text}”</blockquote>
                  <figcaption className={`mt-4 text-[13px] ${i === 0 ? "text-white/75" : "text-muted"}`}>{r.name} · {r.from} · {r.stayed}</figcaption>
                </figure>
              </RevealItem>
            </SiteVisible>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

/* ---------- Arrival route: jetty → island as a drawn sea route ---------- */
function Route({ hotel }: { hotel: Hotel }) {
  if (!hotel.nearby?.length) return null;
  const transfer = hotel.services.find((s) => s.category === "transfer");
  return (
    <section className="mt-20 md:mt-36">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16">
          <Reveal className="relative overflow-hidden rounded-[var(--lux-r)] bg-[#d9f1ee] p-4">
            <svg viewBox="0 0 400 260" className="h-auto w-full" role="img" aria-label={`Speedboat route to ${hotel.area}`}>
              <path d="M0 0 H130 C 110 60, 140 120, 120 160 C 100 200, 130 240, 110 260 H0Z" fill="#efe3c8" />
              <path d="M0 0 H118 C 98 60, 128 120, 108 160 C 88 200, 118 240, 98 260 H0Z" fill="#cfe3b9" />
              <ellipse cx="320" cy="120" rx="44" ry="32" fill="#efe3c8" />
              <ellipse cx="320" cy="120" rx="30" ry="20" fill="#9cc58a" />
              <path d="M128 150 C 190 190, 250 60, 290 110" fill="none" stroke="#0e6866" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" />
              <circle cx="128" cy="150" r="6" fill="#0e2a30" /><circle cx="292" cy="112" r="6" fill="#0e2a30" />
              <text x="60" y="140" fontSize="11" fill="#0e2a30" fontWeight="700">Jetty</text>
              <text x="300" y="168" fontSize="12" fill="#0e2a30" fontWeight="700">{hotel.name.split(" ")[0]}</text>
              {transfer && <text x="196" y="96" fontSize="11" fill="#0e6866" style={{ fontFamily: "var(--isle-accent)", fontStyle: "italic" }}>{hotel.nearby[0]?.time} by speedboat</text>}
            </svg>
          </Reveal>
          <Reveal>
            <Title hotel={hotel} k="arrival.title" eyebrow="Getting here" title={`${hotel.area}, ${hotel.city}`} />
            <p className="text-[15px] text-muted">{hotel.address}</p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {hotel.nearby.map((n) => <li key={n.name} className="flex justify-between gap-4 py-3.5 text-[15px]"><span>{n.name}</span><b className="tabular-nums">{n.time}</b></li>)}
            </ul>
            {transfer && <p className="mt-4 text-[15px]"><b>{transfer.name}</b> — {transfer.short} <span className="whitespace-nowrap font-semibold tabular-nums">{formatMoney(transfer.price)} {transfer.unit}</span></p>}
            <a href={mapsLink(hotel)} target="_blank" rel="noopener" className="lux-btn-ghost mt-6"><Navigation className="size-4" aria-hidden /> <T>Get directions</T></a>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Last: sunset band ---------- */
function Last({ hotel }: { hotel: Hotel }) {
  return (
    <section className="relative mt-20 overflow-hidden text-white md:mt-36">
      <Image src={photo(hotel, /sunset/)} alt="" fill sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/30" />
      <Container className="relative py-24 text-center md:py-40">
        <p className="isle-accent text-[22px] text-white/90"><T>Until then</T></p>
        <h2 className="lux-display mx-auto mt-3 max-w-[900px] text-[48px] text-white md:text-[96px]"><DraftText slug={hotel.slug} k="reserve.title" fallback="The lagoon is waiting" /></h2>
        <div className="mt-9 flex justify-center"><Concierge hotel={hotel} light /></div>
        <Link href={`/hotel/${hotel.slug}/island`} className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/85 hover:text-white"><T>Explore the island map</T> <ArrowUpRight className="size-4" aria-hidden /></Link>
      </Container>
    </section>
  );
}
