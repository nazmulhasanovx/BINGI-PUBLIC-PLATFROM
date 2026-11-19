import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Briefcase, MapPin, MonitorPlay, Presentation, Users } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { FxScope } from "@/fx/fx";
import { Reveal } from "@/components/motion/Reveal";
import { T } from "@/lib/i18n";
import { LuxPage } from "../lux/kit";
import { photo } from "../shared";
import { Diorama } from "./Diorama";
import { Contact, Book, H, Photo, Rooms, W, href } from "./kit";
import { MeetForm } from "./forms";

const Line = ({ children, light }: { children: string; light?: boolean }) => (
  <p className={`flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] ${light ? "text-white/85" : "text-ink"}`}><T>{children}</T><span aria-hidden className="h-px w-10 bg-current" /></p>
);

/**
 * AXIS (Signature · business hotel) — design 04. Montserrat 800 + Inter, electric blue on white.
 * Signature: a real 3D business suite with Work / Rest / Recharge labels; a Meet page with a meeting enquiry.
 */
export function AxisHome({ hotel }: { hotel: Hotel }) {
  const icons = [Briefcase, BedDouble, MapPin];
  const subs = ["Work, meet and stay productive.", "Comfort designed for busy travellers.", "Easy access to the city's key districts."];
  const outlet = hotel.outlets[0];
  return (
    <FxScope slug={hotel.slug} theme="axis">
      <LuxPage
        hotel={hotel}
        master="axis"
        parts={{
          hero: (
            <section className="relative">
              <div className="relative h-[70svh] min-h-[460px] text-white md:h-[600px]">
                <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" className="object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0b1530]/90 via-[#0b1530]/55 to-transparent" />
                <W className="relative flex h-full flex-col justify-center pb-16">
                  <Line light>{`${hotel.logoText} / ${hotel.type}`}</Line>
                  <H hotel={hotel} k="hero.title" fallback={hotel.tagline} as="h1" className="mt-4 max-w-[560px] text-[48px] text-white md:text-[72px]" />
                  <p className="mt-4 max-w-[420px] text-[16px] text-white/85">{hotel.intro}</p>
                </W>
              </div>
              <W className="-mt-12"><Book /></W>
            </section>
          ),
          facts: (
            <W className="grid gap-4 py-10 md:grid-cols-3 md:divide-x md:divide-line">
              {hotel.highlights.slice(0, 3).map((h, i) => {
                const I = icons[i];
                return <div key={h} className="flex items-center gap-4 md:px-6"><span className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-surface text-[color:var(--lux-accent-ink)]"><I className="size-6" aria-hidden /></span><span><b className="block text-[18px] font-extrabold">{h}</b><span className="text-[14px] text-muted">{subs[i]}</span></span></div>;
              })}
            </W>
          ),
          signature: (
            <section className="bg-[#e7effd] py-14 md:py-20">
              <W className="grid items-center gap-8 md:grid-cols-[0.8fr_1.4fr]">
                <Reveal>
                  <Line>The business suite</Line>
                  <H hotel={hotel} k="signature.title" fallback="A smarter space to work, rest and recharge." className="mt-4 text-[38px] md:text-[54px]" />
                </Reveal>
                <Diorama scene="axis" fallback={photo(hotel, /desk|conference/)} labels={[{ key: "work", title: "Work" }, { key: "rest", title: "Rest" }, { key: "recharge", title: "Recharge" }]} className="h-[380px] md:h-[520px]" />
              </W>
            </section>
          ),
          rooms: (
            <section className="py-16 md:py-24">
              <W className="grid gap-8 lg:grid-cols-[280px_1fr]">
                <Reveal><Line>Accommodations</Line><H hotel={hotel} k="rooms.title" fallback="Stays for every business journey." className="mt-4 text-[38px] md:text-[48px]" /></Reveal>
                <Rooms hotel={hotel} look="boxed" />
              </W>
            </section>
          ),
          experiences: (
            <section className="grid md:grid-cols-[1.1fr_1fr]">
              <Photo src={photo(hotel, /conference|meeting/)} className="min-h-[300px] md:min-h-[440px]" sizes="(max-width: 768px) 100vw, 55vw" />
              <div className="flex flex-col justify-center px-6 py-12 md:px-14">
                <Line>{`Meet at ${hotel.logoText}`}</Line>
                <H hotel={hotel} k="experiences.title" fallback="Meet, plan and move forward." className="mt-4 text-[38px] md:text-[48px]" />
                <p className="mt-4 text-[16px] text-muted">Versatile meeting spaces for business sessions, team gatherings and client events.</p>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[15px] font-semibold">
                  {[[Users, "Boardroom"], [Presentation, "Meeting Room"], [MonitorPlay, "Event Space"]].map(([I, l]) => { const Icon = I as typeof Users; return <li key={l as string} className="flex items-center gap-2"><Icon className="size-5 text-[color:var(--lux-accent-ink)]" aria-hidden />{l as string}</li>; })}
                </ul>
                <Link href={href(hotel, "/meet")} className="lux-btn mt-7 self-start !rounded-[4px]"><T>Plan a meeting</T> <ArrowRight className="size-4" aria-hidden /></Link>
              </div>
            </section>
          ),
          dining: (
            <section className="grid md:grid-cols-4">
              {outlet && <Photo src={outlet.photo ?? photo(hotel, /dining/)} className="min-h-[240px]" sizes="(max-width: 768px) 100vw, 25vw" />}
              {outlet && <div className="flex flex-col justify-center bg-surface px-6 py-10"><Line>Dining</Line><h2 className="lux-display mt-3 text-[30px]">Modern dining for work and wind down.</h2><p className="mt-3 text-[14.5px] text-muted">{outlet.short}</p><Link href={href(hotel, "/dining")} aria-label="Dining" className="mt-4 grid size-10 place-items-center rounded-[4px] border border-line"><ArrowRight className="size-4" aria-hidden /></Link></div>}
              <Photo src={photo(hotel, /night|lobby/)} className="min-h-[240px]" sizes="(max-width: 768px) 100vw, 25vw" />
              <div className="flex flex-col justify-center px-6 py-10"><Line>City access</Line><h2 className="lux-display mt-3 text-[30px]">The city at your doorstep.</h2><ul className="mt-3 space-y-1.5 text-[14.5px] text-muted">{(hotel.nearby ?? []).map((n) => <li key={n.name} className="flex justify-between gap-3"><span>{n.name}</span><b className="text-ink tabular-nums">{n.time}</b></li>)}</ul></div>
            </section>
          ),
          reserve: (
            <section className="bg-[#1447E6] text-white">
              <W className="flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
                <div><Line light>Ready to stay?</Line><H hotel={hotel} k="reserve.title" fallback={`Book your stay at ${hotel.name}.`} className="mt-3 text-[34px] text-white md:text-[44px]" /></div>
                <Link href={href(hotel, "/rooms")} className="inline-flex h-12 items-center gap-2 rounded-[4px] bg-white px-7 text-[13px] font-bold uppercase tracking-[0.12em] text-[#0b1530]"><T>Check availability</T> <ArrowRight className="size-4" aria-hidden /></Link>
              </W>
              <W className="pb-10"><Contact hotel={hotel} light /></W>
            </section>
          ),
        }}
      />
    </FxScope>
  );
}

/** AXIS → /meet: meeting spaces + enquiry (prototype — nothing is sent). */
export function AxisMeet({ hotel }: { hotel: Hotel }) {
  const spaces = hotel.facilities.filter((f) => f.icon === "briefcase");
  const paid = hotel.services.filter((s) => s.category === "activity");
  return (
    <div className="pb-20">
      <section className="relative h-[46svh] min-h-[320px] text-white">
        <Image src={photo(hotel, /conference/)} alt="" fill priority sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[#0b1530]/70" />
        <W className="relative flex h-full flex-col justify-end pb-10"><Line light>{`Meet at ${hotel.logoText}`}</Line><h1 className="lux-display mt-3 text-[48px] text-white md:text-[72px]">Meetings &amp; events</h1></W>
      </section>
      <W className="mt-12 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <ul className="grid gap-4 sm:grid-cols-3">{spaces.map((s) => <li key={s.name} className="rounded-[6px] border border-line p-5"><Briefcase className="size-6 text-[color:var(--lux-accent-ink)]" aria-hidden /><b className="mt-3 block text-[18px]">{s.name}</b><span className="text-[14px] text-muted">{s.short}</span></li>)}</ul>
          <h2 className="lux-display mt-12 text-[30px]">Packages</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">{paid.map((p) => <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4"><span><b>{p.name}</b><span className="block text-[14px] text-muted">{p.short}</span></span><b className="tabular-nums">{p.price ? `৳${p.price.toLocaleString("en-IN")}` : "On request"} <span className="text-[13px] font-normal text-muted">{p.unit}</span></b></li>)}</ul>
        </div>
        <MeetForm hotel={hotel} />
      </W>
    </div>
  );
}
