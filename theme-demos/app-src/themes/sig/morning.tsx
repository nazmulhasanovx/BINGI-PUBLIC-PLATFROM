import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { LuxPage } from "../lux/kit";
import { photo } from "../shared";
import { Contact, Book, H, W, href, price, roomLink } from "./kit";

const Sun = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 120 70" className={className}>
    <path d="M20 66 A40 40 0 0 1 100 66Z" fill="#F2B705" />
    {Array.from({ length: 7 }).map((_, i) => { const a = Math.PI + (i / 6) * Math.PI; return <line key={i} x1={60 + Math.cos(a) * 48} y1={66 + Math.sin(a) * 48} x2={60 + Math.cos(a) * 60} y2={66 + Math.sin(a) * 60} stroke="#F2B705" strokeWidth="5" strokeLinecap="round" />; })}
  </svg>
);
const Under = () => <svg aria-hidden viewBox="0 0 200 14" className="mt-1 h-3 w-40"><path d="M3 10 C 60 2, 140 2, 197 9" fill="none" stroke="#F2B705" strokeWidth="5" strokeLinecap="round" /></svg>;
const Pill = ({ to, children, yellow }: { to: string; children: string; yellow?: boolean }) => (
  <Link href={to} className={`inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-extrabold ${yellow ? "bg-[#F2B705] text-[#3a2414]" : "bg-[#3a2414] text-white"}`}><T>{children}</T> <ArrowRight className="size-4" aria-hidden /></Link>
);

/**
 * MORNING (Signature · bed & breakfast) — design 10. Fraunces 800 italic + Nunito, sunflower yellow and roast brown.
 * Breakfast first (with its own page), sun motif, wavy section edges.
 */
export function MorningHome({ hotel }: { hotel: Hotel }) {
  const bf = hotel.services.filter((s) => s.category === "dining" && s.photo);
  return (
    <LuxPage
      hotel={hotel}
      master="morning"
      parts={{
        hero: (
          <section className="relative">
            <div className="grid md:grid-cols-[1fr_1fr]">
              <W className="relative z-10 order-2 py-8 md:order-1 md:py-20 md:pr-0">
                <H hotel={hotel} k="hero.title" fallback={hotel.tagline} as="h1" className="max-w-[520px] text-[50px] leading-[1.02] md:text-[70px]" />
                <Under />
                <p className="sig-caps mt-5 max-w-[300px] !leading-[2] text-ink">{hotel.type} for slower, brighter days.</p>
              </W>
              <div className="relative order-1 grid min-h-[320px] grid-cols-2 md:order-2 md:min-h-[540px]">
                <div className="relative"><Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /></div>
                <div className="relative [clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)] md:-ml-16"><Image src={hotel.rooms[0]?.photos[0] ?? hotel.heroPhoto} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /></div>
              </div>
            </div>
            <W className="-mt-6 md:-mt-16"><Book /></W>
          </section>
        ),
        dining: bf.length ? (
          <section className="py-14 md:py-20">
            <W className="grid items-center gap-8 lg:grid-cols-[auto_200px_1fr]">
              <Reveal><Sun className="h-12 w-24" /><H hotel={hotel} k="dining.title" fallback="A Better Morning, Always." className="mt-2 max-w-[300px] text-[40px] leading-[1.02] md:text-[46px]" /><Under /></Reveal>
              <Reveal className="lg:border-l lg:border-line lg:pl-8"><p className="sig-caps text-ink">{`Breakfast at ${hotel.logoText}`}</p><p className="mt-3 text-[15.5px] text-muted">Fresh, seasonal and made with care to start your day right. {hotel.facilities.find((f) => /breakfast/i.test(f.name))?.short}</p><Link href={href(hotel, "/breakfast")} className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-extrabold underline decoration-[#F2B705] decoration-[3px] underline-offset-4">See the menu <ArrowRight className="size-4" aria-hidden /></Link></Reveal>
              <RevealGroup className="grid grid-cols-3 gap-3">
                {bf.slice(0, 3).map((s) => <RevealItem key={s.id} className="relative aspect-[4/5] overflow-hidden rounded-[22px]"><Image src={s.photo!} alt="" fill sizes="(max-width: 768px) 33vw, 260px" className="object-cover" /><span className="absolute inset-x-2 bottom-2 rounded-full bg-white/95 px-3 py-1.5 text-center text-[12.5px] font-extrabold">{s.name}</span></RevealItem>)}
              </RevealGroup>
            </W>
          </section>
        ) : null,
        rooms: (
          <section className="bg-[#FCEBB7] py-14 md:py-20">
            <W className="grid gap-8 lg:grid-cols-[240px_1fr]">
              <Reveal><p className="sig-caps text-ink">Accommodations</p><H hotel={hotel} k="rooms.title" fallback={`Rest Well at ${hotel.name}.`} className="mt-2 text-[38px] leading-[1.02] md:text-[44px]" /><Under /></Reveal>
              <RevealGroup className="grid gap-4 sm:grid-cols-3">
                {hotel.rooms.map((r) => (
                  <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
                    <RevealItem>
                      <Link href={roomLink(hotel, r)} className="group block overflow-hidden rounded-[22px] bg-white">
                        <div className="relative aspect-[4/3] overflow-hidden"><Image src={r.photos[0]} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                        <div className="flex items-end justify-between gap-3 p-4"><span><b className="lux-display block text-[21px]">{r.name}</b><span className="sig-caps mt-1 block !text-[10.5px] text-muted">{r.short.replace(/\.$/, "").replace(/, /g, " · ")}</span></span><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F2B705]"><ArrowRight className="size-4" aria-hidden /></span></div>
                      </Link>
                    </RevealItem>
                  </SiteVisible>
                ))}
              </RevealGroup>
            </W>
          </section>
        ),
        experiences: (
          <section className="grid items-center md:grid-cols-[1.2fr_1fr]">
            <div className="relative min-h-[300px] md:min-h-[400px]"><Image src={photo(hotel, /garden|balcony/)} alt="" fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" /></div>
            <div className="bg-canvas px-6 py-12 md:-ml-24 md:rounded-l-[200px] md:py-20 md:pl-32 md:pr-12">
              <p className="sig-caps text-ink">Experiences</p>
              <H hotel={hotel} k="experiences.title" fallback="Slow Mornings in the Garden." className="mt-2 text-[38px] leading-[1.02] md:text-[44px]" /><Under />
              <p className="mt-4 max-w-[380px] text-[16px] text-muted">Savour your breakfast outdoors, read, and let the day unfold at a gentler pace.</p>
            </div>
          </section>
        ),
        arrival: (
          <section className="grid items-center md:grid-cols-[1fr_1.2fr]">
            <W className="py-12 md:py-20 md:pl-[max(24px,calc((100vw-1240px)/2+24px))]">
              <p className="sig-caps text-ink">The neighbourhood</p>
              <H hotel={hotel} k="arrival.title" fallback="A Charming Stroll Away." className="mt-2 text-[38px] leading-[1.02] md:text-[44px]" /><Under />
              <ul className="mt-4 space-y-1.5 text-[15.5px]">{(hotel.nearby ?? []).map((n) => <li key={n.name} className="flex justify-between gap-4 border-b border-line py-2"><span>{n.name}</span><b className="tabular-nums">{n.time}</b></li>)}</ul>
              <div className="mt-6"><Pill to={href(hotel, "/explore")} yellow>Explore the neighbourhood</Pill></div>
            </W>
            <div className="relative min-h-[300px] md:min-h-[420px] md:rounded-l-[160px] md:[overflow:hidden]"><Image src={photo(hotel, /garden|pigeons/)} alt="" fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" /></div>
          </section>
        ),
        reserve: (
          <section className="relative mt-6 bg-[#F2B705] pb-12 pt-16 text-[#3a2414]">
            <svg aria-hidden viewBox="0 0 1440 40" preserveAspectRatio="none" className="absolute inset-x-0 -top-px h-8 w-full text-canvas"><path d="M0 0 H1440 V10 C 1200 40, 960 0, 720 18 S 240 40, 0 10Z" fill="currentColor" /></svg>
            <W className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div className="flex items-center gap-5"><Sun className="h-10 w-20 [&_path]:fill-[#3a2414] [&_line]:stroke-[#3a2414]" /><H hotel={hotel} k="reserve.title" fallback="Ready for a Brighter Morning?" className="text-[32px] leading-[1.05] md:text-[40px]" /></div>
              <Pill to={href(hotel, "/rooms")}>Book Your Stay</Pill>
            </W>
            <W className="mt-6"><Contact hotel={hotel} /></W>
          </section>
        ),
      }}
    />
  );
}

/** MORNING → /breakfast: what's served and when. */
export function MorningBreakfast({ hotel }: { hotel: Hotel }) {
  const items = hotel.services.filter((s) => s.category === "dining" || s.category === "celebration");
  return (
    <div className="pb-20">
      <W className="grid items-center gap-8 pt-10 md:grid-cols-[1fr_1fr] md:pt-16">
        <div><Sun className="h-14 w-28" /><h1 className="lux-display mt-3 text-[56px] leading-[1] md:text-[84px]">Breakfast</h1><Under /><p className="mt-5 max-w-[460px] text-[17px] text-muted">{hotel.facilities.find((f) => /breakfast/i.test(f.name))?.short} — included with every room. Tell us about allergies when you book.</p></div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]"><Image src={photo(hotel, /breakfast/, hotel.heroPhoto)} alt="" fill priority sizes="(max-width: 768px) 100vw, 600px" className="object-cover" /></div>
      </W>
      <W className="mt-14 grid gap-10 md:grid-cols-2">
        <ul className="divide-y divide-line border-y border-line">{items.map((s) => <li key={s.id} className="flex items-start justify-between gap-4 py-5"><span><b className="lux-display block text-[24px]">{s.name}</b><span className="text-[15px] text-muted">{s.short}</span></span><b className="shrink-0 rounded-full bg-[#FCEBB7] px-3 py-1 text-[13px]">{s.price ? price(s.price) : "Included"}</b></li>)}</ul>
        <ol className="space-y-4">{(hotel.dayPlan ?? []).map((d) => <li key={d.time} className="grid grid-cols-[80px_1fr] gap-4 rounded-[22px] bg-surface p-5"><b className="lux-display text-[26px]">{d.time}</b><span><b className="block">{d.title}</b><span className="text-[14.5px] text-muted">{d.text}</span></span></li>)}</ol>
      </W>
    </div>
  );
}
