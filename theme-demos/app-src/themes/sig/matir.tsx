import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CookingPot, Home, Sprout, Utensils, Wheat } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { FxScope } from "@/fx/fx";
import { Reveal } from "@/components/motion/Reveal";
import { T } from "@/lib/i18n";
import { LuxPage } from "../lux/kit";
import { photo } from "../shared";
import { Diorama } from "./Diorama";
import { Contact, Book, H, Rooms, Tiles, W, href, price } from "./kit";

const Kick = ({ children, light }: { children: string; light?: boolean }) => <p className={`sig-caps flex items-center gap-3 ${light ? "text-[#f3e3c7]" : "text-[color:var(--lux-accent-ink)]"}`}><T>{children}</T><span aria-hidden className="h-px w-10 bg-current" /></p>;
const Btn = ({ to, children, solid, light }: { to: string; children: string; solid?: boolean; light?: boolean }) => (
  <Link href={to} className={`inline-flex h-11 items-center gap-2 rounded-[6px] px-5 text-[14.5px] font-bold ${solid ? "bg-[#A5461F] text-white" : light ? "border border-[#f3e3c7] text-[#f3e3c7]" : "border border-[color:var(--lux-accent)] text-[color:var(--lux-accent-ink)]"}`}><T>{children}</T> <ArrowRight className="size-4" aria-hidden /></Link>
);
const HI = [Sprout, Utensils, Home];

/**
 * MATIR (Signature · farm stay) — design 12. Young Serif + Nunito Sans, rust, leaf green and paddy gold.
 * Signature: a real 3D farm diorama built from the cottages in Rooms, plus an "Our Farm" page.
 */
export function MatirHome({ hotel }: { hotel: Hotel }) {
  const units = hotel.rooms.reduce((n, r) => n + r.units, 0);
  return (
    <FxScope slug={hotel.slug} theme="matir">
      <LuxPage
        hotel={hotel}
        master="matir"
        parts={{
          hero: (
            <section className="relative">
              <div className="relative min-h-[560px] text-white md:min-h-[600px]">
                <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" className="object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
                <W className="relative pb-44 pt-16 md:pt-24">
                  <H hotel={hotel} k="hero.title" fallback={hotel.tagline} as="h1" className="max-w-[540px] text-[48px] leading-[1.04] text-white md:text-[66px]" />
                  <svg aria-hidden viewBox="0 0 200 12" className="mt-2 h-3 w-44"><path d="M2 8 C 60 2, 140 3, 198 9" fill="none" stroke="#d2693c" strokeWidth="4" strokeLinecap="round" /></svg>
                  <p className="mt-4 max-w-[380px] text-[18px] text-white/90">{hotel.intro.split(" — ")[0]}</p>
                </W>
                <W className="absolute inset-x-0 bottom-6"><Book /></W>
              </div>
            </section>
          ),
          signature: (
            <section className="py-14 md:py-20">
              <W className="grid items-center gap-8 md:grid-cols-[0.8fr_1.4fr]">
                <Reveal>
                  <Kick>The farm</Kick>
                  <H hotel={hotel} k="signature.title" fallback="A Living Farm Stay" className="mt-3 text-[42px] md:text-[54px]" />
                  <p className="mt-3 max-w-[380px] text-[16px] text-muted">Cottages, fields, gardens and a pond — all part of a working farm, where you can stay, explore and be involved.</p>
                  <ul className="mt-6 grid grid-cols-3 divide-x divide-line">{hotel.highlights.map((h, i) => { const I = HI[i % 3]; return <li key={h} className="flex flex-col items-center gap-2 px-2 text-center text-[13px] font-semibold"><I className="size-6 text-[color:var(--lux-accent-ink)]" strokeWidth={1.6} aria-hidden />{h}</li>; })}</ul>
                </Reveal>
                <Diorama scene="matir" count={units} fallback={photo(hotel, /terraces|paddy/)} labels={[{ key: "cottages", title: `${units} cottages` }, { key: "pond", title: "Fish pond" }, { key: "fields", title: "Fields" }, { key: "kitchen", title: "Farm kitchen" }]} className="h-[380px] md:h-[560px]" />
              </W>
            </section>
          ),
          rooms: (
            <section className="bg-[#53643a] py-14 text-white md:py-20">
              <W className="grid gap-8 lg:grid-cols-[260px_1fr]">
                <Reveal><Kick light>Stay</Kick><H hotel={hotel} k="rooms.title" fallback="Our Cottages" className="mt-3 text-[42px] text-white md:text-[52px]" /><p className="mt-3 text-[16px] text-white/85">Rustic comfort, natural materials and peaceful farm views.</p><div className="mt-6"><Btn to={href(hotel, "/rooms")} light>View all stays</Btn></div></Reveal>
                <div className="[&_a]:text-ink"><Rooms hotel={hotel} look="card" /></div>
              </W>
            </section>
          ),
          dining: (
            <section className="grid md:grid-cols-[1fr_1fr]">
              <div className="relative min-h-[300px] md:min-h-[420px]"><Image src={hotel.services.find((s) => s.category === "dining")?.photo ?? photo(hotel, /rice/)} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
              <div className="flex flex-col justify-center px-6 py-12 md:px-14">
                <Kick>Our food</Kick>
                <H hotel={hotel} k="dining.title" fallback="From Field to Table" className="mt-3 text-[40px] md:text-[50px]" />
                <p className="mt-3 max-w-[420px] text-[16px] text-muted">Fresh, seasonal meals made with ingredients grown right here on the farm.</p>
                <ul className="mt-6 grid max-w-[420px] grid-cols-3 divide-x divide-line">{[[Sprout, "Farm-grown produce"], [CookingPot, "Home-style cooking"], [Wheat, "Seasonal menus"]].map(([I, l]) => { const Icon = I as typeof Sprout; return <li key={l as string} className="flex flex-col items-center gap-2 px-2 text-center text-[13px] font-semibold"><Icon className="size-6 text-[color:var(--lux-accent-ink)]" strokeWidth={1.6} aria-hidden />{l as string}</li>; })}</ul>
              </div>
            </section>
          ),
          experiences: (
            <section className="py-14 md:py-20">
              <W className="grid gap-8 lg:grid-cols-[260px_1fr]">
                <Reveal><Kick>Experiences</Kick><H hotel={hotel} k="experiences.title" fallback="Hands-on Rural Living" className="mt-3 text-[38px] md:text-[44px]" /><p className="mt-3 text-[16px] text-muted">Get closer to the land with simple, memorable farm experiences.</p><div className="mt-6"><Btn to={href(hotel, "/experiences")} solid>Explore experiences</Btn></div></Reveal>
                <Tiles hotel={hotel} over cats={["activity"]} />
              </W>
            </section>
          ),
          story: (
            <section className="grid md:grid-cols-[1.1fr_1fr]">
              <div className="relative min-h-[300px] md:min-h-[400px]"><Image src={photo(hotel, /farmer|paddy/)} alt="" fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" /></div>
              <div className="flex flex-col justify-center px-6 py-12 md:px-14">
                <Kick>Our story</Kick>
                <H hotel={hotel} k="story.title" fallback="A Farm, A Story, A Stay" className="mt-3 text-[38px] md:text-[46px]" />
                <p className="mt-3 max-w-[420px] text-[16px] text-muted">{hotel.logoText} is our idea of a simpler, more connected life — where farming, food and hospitality come together.</p>
                <div className="mt-6"><Btn to={href(hotel, "/farm")}>Explore our farm</Btn></div>
              </div>
            </section>
          ),
          reserve: (
            <section className="bg-[#A5461F] text-white">
              <W className="flex flex-col items-start gap-5 py-10 md:flex-row md:items-center md:justify-between">
                <H hotel={hotel} k="reserve.title" fallback="Plan Your Farm Stay" className="text-[34px] text-white md:text-[42px]" />
                <p className="max-w-[320px] text-[15.5px] text-white/90 md:border-l md:border-white/40 md:pl-6">Come for a stay, stay for the land, the food and the feeling.</p>
                <Link href={href(hotel, "/rooms")} className="inline-flex h-12 items-center gap-2 rounded-[6px] bg-[#fffaf0] px-6 font-bold text-[#8a3918]"><CalendarDays className="size-4" aria-hidden /><T>Check availability</T> <ArrowRight className="size-4" aria-hidden /></Link>
              </W>
              <W className="pb-10"><Contact hotel={hotel} light /></W>
            </section>
          ),
        }}
      />
    </FxScope>
  );
}

/** MATIR → /farm: the farm in 3D, what grows here and what guests can join. */
export function MatirFarm({ hotel }: { hotel: Hotel }) {
  const units = hotel.rooms.reduce((n, r) => n + r.units, 0);
  return (
    <FxScope slug={hotel.slug} theme="matir">
      <div className="pb-20">
        <W className="pt-10 md:pt-16"><Kick>Our farm</Kick><h1 className="lux-display mt-3 text-[52px] md:text-[84px]">The farm, up close</h1><p className="mt-4 max-w-[620px] text-[17px] text-muted">{hotel.intro}</p></W>
        <W className="mt-8"><Diorama scene="matir" count={units} fallback={photo(hotel, /terraces/)} labels={[{ key: "cottages", title: `${units} cottages` }, { key: "pond", title: "Fish pond" }, { key: "fields", title: "Fields" }, { key: "kitchen", title: "Farm kitchen" }]} className="h-[420px] md:h-[640px]" /></W>
        <W className="mt-12 grid gap-10 md:grid-cols-2">
          <div><h2 className="lux-display text-[34px]">On the farm</h2><ul className="mt-4 divide-y divide-line border-y border-line">{hotel.facilities.map((f) => <li key={f.name} className="flex justify-between gap-4 py-3.5"><b>{f.name}</b><span className="text-right text-muted">{f.short}</span></li>)}</ul></div>
          <div><h2 className="lux-display text-[34px]">Join in</h2><ul className="mt-4 divide-y divide-line border-y border-line">{hotel.services.filter((s) => s.category === "activity").map((s) => <li key={s.id} className="flex justify-between gap-4 py-3.5"><span><b className="block">{s.name}</b><span className="text-[14px] text-muted">{s.short}</span></span><b className="shrink-0 tabular-nums">{s.price ? price(s.price) : "Included"}</b></li>)}</ul></div>
        </W>
      </div>
    </FxScope>
  );
}
