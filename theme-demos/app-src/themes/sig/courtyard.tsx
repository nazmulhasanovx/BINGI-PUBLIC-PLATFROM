import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { T } from "@/lib/i18n";
import { LuxPage } from "../lux/kit";
import { photo } from "../shared";
import { Contact, Book, H, Kick, Photo, Rooms, Tiles, W, href } from "./kit";

const Arrow = ({ to, children, light }: { to: string; children: string; light?: boolean }) => (
  <Link href={to} className={`sig-caps inline-flex items-center gap-2 border-b pb-1 ${light ? "border-white/60 text-white" : "border-[color:var(--lux-accent)] text-[color:var(--lux-accent-ink)]"}`}><T>{children}</T> <ArrowRight className="size-3.5" aria-hidden /></Link>
);

/**
 * COURTYARD (Signature · boutique) — design 03. DM Serif Display with italics, Montserrat caps, maroon on warm stone.
 * Signature: the house told as "01 — Our story" with its own Story page; suites in arched frames.
 */
export function CourtyardHome({ hotel }: { hotel: Hotel }) {
  const outlet = hotel.outlets[0];
  return (
    <LuxPage
      hotel={hotel}
      master="courtyard"
      parts={{
        hero: (
          <section className="relative">
            <W className="grid gap-6 pt-6 md:grid-cols-[0.75fr_1.25fr] md:items-end md:pt-10">
              <div className="order-2 pb-6 md:order-1 md:pb-28">
                <Kick rule={false}>{hotel.type}</Kick>
                <H hotel={hotel} k="hero.title" fallback={hotel.tagline} as="h1" className="mt-4 text-[52px] text-[color:var(--lux-accent-ink)] md:text-[76px]" />
                <span aria-hidden className="mt-6 block h-px w-12 bg-[color:var(--lux-accent)]" />
                <p className="sig-caps mt-6 max-w-[300px] !leading-[2] !tracking-[0.2em] text-ink">{hotel.intro}</p>
              </div>
              <Photo src={hotel.heroPhoto} priority alt={hotel.name} sizes="(max-width: 768px) 100vw, 760px" className="order-1 aspect-[4/3] rounded-t-[999px] md:order-2 md:aspect-[5/4] [border-radius:50%_50%_0_0/40%_40%_0_0]" />
            </W>
            <W className="-mt-4 md:-mt-16"><Book /></W>
          </section>
        ),
        story: (
          <section className="py-16 md:py-24">
            <W className="grid items-center gap-8 md:grid-cols-[auto_1fr_1.6fr] md:gap-12">
              <Reveal><p aria-hidden className="lux-display text-[120px] italic leading-none text-[color:var(--lux-accent-ink)] md:text-[180px]">01</p></Reveal>
              <Reveal>
                <Kick rule={false}>Our story</Kick>
                <H hotel={hotel} k="story.title" fallback="A Courtyard with a Story" className="mt-3 text-[38px] md:text-[48px]" />
                <span aria-hidden className="mt-5 block h-px w-10 bg-[color:var(--lux-accent)]" />
                <p className="sig-caps mt-5 !leading-[2] text-ink">A restored townhouse turned boutique retreat, celebrating local heritage, craft and the art of slow living.</p>
                <div className="mt-6"><Arrow to={href(hotel, "/story")}>Discover our story</Arrow></div>
              </Reveal>
              <div className="grid grid-cols-2 gap-4">
                <Photo src={photo(hotel, /jali|garden/)} className="aspect-[4/5]" sizes="(max-width: 768px) 50vw, 340px" />
                <Photo src={photo(hotel, /salon|atrium/)} className="aspect-[4/5]" sizes="(max-width: 768px) 50vw, 340px" />
              </div>
            </W>
          </section>
        ),
        rooms: (
          <section className="pb-16 md:pb-24">
            <W className="grid gap-8 lg:grid-cols-[260px_1fr]">
              <Reveal>
                <Kick rule={false}>Accommodations</Kick>
                <h2 className="lux-display mt-3 text-[44px] md:text-[54px]">Suites with <em className="text-[color:var(--lux-accent-ink)]">Character</em></h2>
                <span aria-hidden className="mt-5 block h-px w-10 bg-[color:var(--lux-accent)]" />
                <p className="sig-caps mt-5 !leading-[2] text-ink">{hotel.rooms.length} distinct spaces, the same sense of place.</p>
              </Reveal>
              <Rooms hotel={hotel} look="arch" />
            </W>
          </section>
        ),
        dining: outlet ? (
          <section className="grid md:grid-cols-2">
            <Photo src={outlet.photo ?? photo(hotel, /dish|dining/)} className="min-h-[300px] md:min-h-[460px]" sizes="(max-width: 768px) 100vw, 50vw" />
            <div className="flex flex-col justify-center bg-[color:var(--lux-accent)] px-6 py-14 text-white md:px-16">
              <p className="sig-caps text-white/80">{`Dine at ${hotel.name}`}</p>
              <H hotel={hotel} k="dining.title" fallback="Local Flavors, Courtyard Style" className="mt-3 text-[40px] text-white md:text-[54px]" />
              <span aria-hidden className="mt-5 block h-px w-10 bg-white/60" />
              <p className="sig-caps mt-5 max-w-[380px] !leading-[2] text-white/85">{outlet.short}</p>
              <div className="mt-7"><Link href={href(hotel, "/dining")} className="sig-caps inline-flex h-11 items-center gap-2 border border-white/70 px-5 text-white hover:bg-white/10"><T>Explore our dining</T> <ArrowRight className="size-3.5" aria-hidden /></Link></div>
            </div>
          </section>
        ) : null,
        experiences: (
          <section className="py-16 md:py-24">
            <W className="grid gap-8 lg:grid-cols-[260px_1fr]">
              <Reveal>
                <Kick rule={false}>Experience the region</Kick>
                <h2 className="lux-display mt-3 text-[44px] md:text-[52px]">Culture, Craft &amp; <em className="text-[color:var(--lux-accent-ink)]">Local Life</em></h2>
                <p className="sig-caps mt-5 !leading-[2] text-ink">Curated experiences that connect you with the people, places and traditions around us.</p>
              </Reveal>
              <Tiles hotel={hotel} />
            </W>
          </section>
        ),
        reserve: (
          <section className="grid md:grid-cols-[1.6fr_1fr]">
            <Photo src={photo(hotel, /atrium/)} className="min-h-[300px] md:min-h-[420px]" sizes="(max-width: 768px) 100vw, 62vw" />
            <div className="flex flex-col justify-center bg-[#3b1d17] px-6 py-14 text-white md:px-12">
              <p className="sig-caps text-white/75">{hotel.name}</p>
              <h2 className="lux-display mt-3 text-[42px] text-white md:text-[52px]">Make It <em>Your Retreat</em></h2>
              <p className="sig-caps mt-5 !leading-[2] text-white/80">Book your stay and experience the courtyard for yourself.</p>
              <div className="mt-7"><Link href={href(hotel, "/rooms")} className="sig-caps inline-flex h-11 items-center gap-2 bg-white px-5 text-[color:var(--lux-accent-ink)]"><T>Book your stay</T> <ArrowRight className="size-3.5" aria-hidden /></Link></div>
              <Contact hotel={hotel} light className="mt-6" />
            </div>
          </section>
        ),
      }}
    />
  );
}

/** Courtyard → /story page: the house through time (Day plan field) + photos. */
export function CourtyardStory({ hotel }: { hotel: Hotel }) {
  const items = hotel.dayPlan ?? [];
  return (
    <div className="pb-20">
      <W className="pt-10 md:pt-16">
        <Kick rule={false}>Our story</Kick>
        <h1 className="lux-display mt-3 text-[56px] text-[color:var(--lux-accent-ink)] md:text-[96px]">A Courtyard with a <em>Story</em></h1>
        <p className="mt-5 max-w-[640px] text-[17px] leading-relaxed text-muted">{hotel.intro}</p>
      </W>
      <W className="mt-12 grid gap-10 md:grid-cols-[1fr_1.1fr]">
        <Photo src={photo(hotel, /atrium|arch/)} className="aspect-[4/5] [border-radius:50%_50%_0_0/34%_34%_0_0]" sizes="(max-width: 768px) 100vw, 560px" />
        <ol>
          {items.map((d, i) => (
            <li key={d.time} className="grid grid-cols-[96px_1fr] gap-5 border-t border-line py-8">
              <p className="lux-display text-[56px] italic leading-none text-[color:var(--lux-accent-ink)]">{String(i + 1).padStart(2, "0")}</p>
              <div><p className="sig-caps text-muted">{d.time}</p><h2 className="lux-display mt-2 text-[30px]">{d.title}</h2><p className="mt-2 text-[16px] leading-relaxed text-muted">{d.text}</p></div>
            </li>
          ))}
        </ol>
      </W>
    </div>
  );
}
