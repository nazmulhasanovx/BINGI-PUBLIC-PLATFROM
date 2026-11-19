import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coffee, ShoppingBag, Trees, UtensilsCrossed } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { FxScope } from "@/fx/fx";
import { Reveal } from "@/components/motion/Reveal";
import { T } from "@/lib/i18n";
import { LuxPage } from "../lux/kit";
import { photo } from "../shared";
import { facIcon } from "../paid-shared";
import { Diorama } from "./Diorama";
import { Contact, H, Photo, Rooms, W, href } from "./kit";
import { StayMode } from "./StayMode";
import { LongStayForm } from "./forms";

/** Monthly estimate = nightly from-price × 30 × (1 − the "28+ nights" offer). Labelled as an estimate everywhere. */
export function monthly(hotel: Hotel, nightly: number) {
  const off = hotel.offers.find((o) => /28|month/i.test(`${o.title} ${o.conditions}`));
  const pct = off ? Number(off.value.match(/(\d+)%/)?.[1] ?? 0) : 0;
  return { total: Math.round((nightly * 30 * (100 - pct)) / 100 / 100) * 100, pct };
}

const Cap = ({ children, light }: { children: string; light?: boolean }) => <p className={`sig-caps ${light ? "text-white/80" : "text-ink"}`}><T>{children}</T></p>;

/**
 * RESIDE (Signature · serviced apartments) — design 07. Gilda Display + Karla, warm taupe and ink.
 * Signature: Nightly / Monthly switch in the booking bar, a real 3D apartment plan (live · cook · rest · work), neighbourhood map, long-stay page.
 */
export function ResideHome({ hotel }: { hotel: Hotel }) {
  const from = Math.min(...hotel.rooms.map((r) => r.fromPrice));
  const m = monthly(hotel, from);
  const pins = [Coffee, ShoppingBag, Trees, UtensilsCrossed];
  return (
    <FxScope slug={hotel.slug} theme="reside">
      <LuxPage
        hotel={hotel}
        master="reside"
        parts={{
          hero: (
            <section className="relative">
              <div className="relative min-h-[560px] md:min-h-[600px]">
                <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" className="object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#f3eee7] via-[#f3eee7]/80 to-transparent" />
                <W className="relative pb-48 pt-14 md:pt-24">
                  <H hotel={hotel} k="hero.title" fallback={hotel.tagline} as="h1" className="max-w-[520px] text-[54px] md:text-[78px]" />
                  <p className="sig-caps mt-5 max-w-[300px] !leading-[2] text-ink">{hotel.type} for short or long stays.</p>
                  <span aria-hidden className="mt-6 block h-px w-12 bg-ink" />
                </W>
                <W className="absolute inset-x-0 bottom-6"><StayMode hotel={hotel} monthlyFrom={m.total} pct={m.pct} /></W>
              </div>
            </section>
          ),
          signature: (
            <section className="bg-[#5f4e40] py-14 text-white md:py-20">
              <W className="grid items-center gap-8 md:grid-cols-[0.75fr_1.4fr]">
                <Reveal>
                  <Cap light>Explore the space</Cap>
                  <H hotel={hotel} k="signature.title" fallback="A home that flows with you." className="mt-4 text-[42px] text-white md:text-[56px]" />
                  <p className="mt-4 max-w-[340px] text-[16px] text-white/90">Thoughtful spaces for living, cooking, resting and working — all in one place.</p>
                </Reveal>
                <Diorama scene="reside" fallback={photo(hotel, /living|kitchen/)} labels={[{ key: "live", title: "Live" }, { key: "cook", title: "Cook" }, { key: "rest", title: "Rest" }, { key: "work", title: "Work" }]} className="h-[380px] md:h-[540px]" />
              </W>
            </section>
          ),
          rooms: (
            <section className="py-14 md:py-20">
              <W className="grid gap-8 lg:grid-cols-[260px_1fr]">
                <Reveal><Cap>Accommodations</Cap><H hotel={hotel} k="rooms.title" fallback="Find your ideal stay." className="mt-3 text-[40px] md:text-[48px]" /><p className="mt-3 text-[15.5px] text-muted">Fully furnished apartments for solo stays, couples or longer time together.</p></Reveal>
                <Rooms hotel={hotel} look="card" />
              </W>
            </section>
          ),
          amenities: (
            <section className="border-y border-line bg-surface py-10">
              <W className="grid items-center gap-6 lg:grid-cols-[240px_1fr]">
                <div><Cap>Included services</Cap><H hotel={hotel} k="amenities.title" fallback="More than a stay." className="mt-2 text-[32px]" /></div>
                <ul className="grid grid-cols-3 gap-y-6 md:grid-cols-6">{hotel.facilities.map((f) => { const I = facIcon(f.icon); return <li key={f.name} className="flex flex-col items-center gap-2 px-2 text-center text-[13px]"><I className="size-7" strokeWidth={1.3} aria-hidden /><span className="font-semibold">{f.name}</span></li>; })}</ul>
              </W>
            </section>
          ),
          arrival: (
            <section className="py-14 md:py-20">
              <W className="grid items-center gap-8 md:grid-cols-[0.8fr_1.4fr]">
                <Reveal><Cap>The neighborhood</Cap><H hotel={hotel} k="arrival.title" fallback="Right where it all connects." className="mt-3 text-[40px] md:text-[48px]" /><p className="mt-3 text-[15.5px] text-muted">Stay close to cafés, green spaces, shopping and the city&apos;s best spots.</p><Link href={href(hotel, "/explore")} className="lux-btn mt-6 !h-11"><T>Explore the neighborhood</T> <ArrowRight className="size-4" aria-hidden /></Link><Contact hotel={hotel} className="mt-5" /></Reveal>
                <Reveal className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-[#e8e1d6]">
                  <svg aria-hidden viewBox="0 0 160 100" className="absolute inset-0 h-full w-full">
                    {Array.from({ length: 8 }).map((_, x) => Array.from({ length: 5 }).map((__, y) => <rect key={`${x}-${y}`} x={4 + x * 20} y={4 + y * 20} width="15" height="15" rx="1.5" fill={(x + y) % 5 === 0 ? "#b9c9a4" : "#d6cdbf"} />))}
                    <path d="M0 52 H160 M82 0 V100" stroke="#fbf9f5" strokeWidth="3" />
                  </svg>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[4px] bg-[#1e1b18] px-3 py-2 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">{hotel.logoText}</span>
                  {(hotel.nearby ?? []).slice(0, 4).map((n, i) => { const I = pins[i]; const pos = [["14%", "18%"], ["70%", "14%"], ["74%", "62%"], ["16%", "70%"]][i]; return <span key={n.name} className="absolute flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-semibold shadow" style={{ left: pos[0], top: pos[1] }}><I className="size-4" aria-hidden />{n.name.split(" ")[0]} · {n.time}</span>; })}
                </Reveal>
              </W>
            </section>
          ),
          offers: (
            <section className="grid md:grid-cols-[1.3fr_1fr]">
              <Photo src={photo(hotel, /bed-2|bed/)} className="min-h-[280px] md:min-h-[380px]" sizes="(max-width: 768px) 100vw, 60vw" />
              <div className="flex flex-col justify-center px-6 py-12 md:px-14">
                <Cap>Long stay</Cap>
                <H hotel={hotel} k="offers.title" fallback="Settle in for longer." className="mt-3 text-[38px] md:text-[46px]" />
                <p className="mt-3 text-[16px] text-muted">Flexible monthly stays with the comfort of home and the ease of a hotel. From about <b className="text-ink">{formatMoney(m.total)}</b> a month (estimate{m.pct ? `, ${m.pct}% long-stay rate` : ""}).</p>
                <Link href={href(hotel, "/long-stay")} className="lux-btn mt-6 self-start !h-11"><T>Book a monthly stay</T> <ArrowRight className="size-4" aria-hidden /></Link>
              </div>
            </section>
          ),
          gallery: (
            <section className="py-14 md:py-20">
              <W className="grid items-center gap-8 lg:grid-cols-[260px_1fr]">
                <div><Cap>Our story</Cap><H hotel={hotel} k="gallery.title" fallback="Modern stays with a human touch." className="mt-3 text-[34px] md:text-[40px]" /></div>
                <div className="grid grid-cols-3 gap-3">{hotel.gallery.slice(0, 3).map((g) => <Photo key={g} src={g} className="aspect-[4/3]" sizes="(max-width: 768px) 33vw, 300px" />)}</div>
              </W>
            </section>
          ),
          reserve: null,
        }}
      />
    </FxScope>
  );
}

/** RESIDE → /long-stay: monthly estimates per apartment + request form (prototype). */
export function ResideLongStay({ hotel }: { hotel: Hotel }) {
  return (
    <div className="pb-20">
      <W className="pt-10 md:pt-16">
        <p className="sig-caps text-ink">Long stay</p>
        <h1 className="lux-display mt-3 text-[52px] md:text-[88px]">Settle in for longer.</h1>
        <p className="mt-4 max-w-[620px] text-[17px] text-muted">Monthly stays include housekeeping twice a week, Wi-Fi, utilities and a starter pantry. Prices below are estimates — the team confirms your exact monthly rate.</p>
      </W>
      <W className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]">
        <ul className="divide-y divide-line border-y border-line">
          {hotel.rooms.map((r) => { const m = monthly(hotel, r.fromPrice); return (
            <li key={r.id} className="grid grid-cols-[110px_1fr_auto] items-center gap-5 py-5">
              <div className="relative aspect-square overflow-hidden rounded-[4px]"><Image src={r.photos[0]} alt="" fill sizes="110px" className="object-cover" /></div>
              <div><h2 className="lux-display text-[26px]">{r.name}</h2><p className="text-[14px] text-muted">{r.sizeSqft} sq ft · sleeps {r.maxAdults + r.maxChildren}</p></div>
              <p className="text-right"><b className="block text-[20px] tabular-nums">{formatMoney(m.total)}</b><span className="text-[13px] text-muted">/ month · estimate</span></p>
            </li>
          ); })}
        </ul>
        <LongStayForm hotel={hotel} />
      </W>
    </div>
  );
}
