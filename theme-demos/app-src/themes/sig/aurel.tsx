import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { FxScope } from "@/fx/fx";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SiteVisible } from "@/components/site-draft/Draft";
import { T } from "@/lib/i18n";
import { LuxPage } from "../lux/kit";
import { photo } from "../shared";
import { Diorama } from "./Diorama";
import { Contact, Book, Btn, H, Kick, W, href, roomLink } from "./kit";

/**
 * AUREL (Signature · city hotel) — design 01. Anton condensed caps, warm paper canvas, terracotta red.
 * Signature: a real 3D floor cutaway (lobby → suite → rooftop pool) with labels from Facilities.
 */
export function AurelHome({ hotel }: { hotel: Hotel }) {
  const f = hotel.facilities;
  return (
    <FxScope slug={hotel.slug} theme="aurel">
      <LuxPage
        hotel={hotel}
        master="aurel"
        parts={{
          hero: (
            <section className="relative overflow-hidden">
              <div className="grid md:grid-cols-[1fr_1.15fr]">
                <W className="order-2 py-8 md:order-1 md:py-20 md:pr-0">
                  <Kick>{`Hotel ${hotel.logoText}`}</Kick>
                  <H hotel={hotel} k="hero.title" fallback={hotel.tagline} as="h1" className="mt-5 text-[56px] uppercase md:text-[112px]" />
                  <p className="sig-caps mt-6 max-w-[360px] !text-[12px] !leading-[1.9] text-ink"><T>{hotel.type}</T> · {hotel.area}, {hotel.city}</p>
                  <div className="mt-7"><Btn to={href(hotel, "/rooms")} ghost className="!border-[color:var(--lux-accent)] !text-[color:var(--lux-accent-ink)]">{`Discover ${hotel.logoText}`}</Btn></div>
                </W>
                <div className="relative order-1 h-[52svh] min-h-[320px] md:order-2 md:h-auto md:min-h-[640px]">
                  <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
                  <div aria-hidden className="absolute inset-y-0 left-0 hidden w-40 bg-gradient-to-r from-canvas to-transparent md:block" />
                </div>
              </div>
              <W className="-mt-6 md:-mt-14"><Book /></W>
            </section>
          ),
          signature: (
            <section className="py-16 md:py-28">
              <W className="grid items-center gap-8 md:grid-cols-[0.8fr_1.4fr]">
                <Reveal>
                  <Kick>The building</Kick>
                  <H hotel={hotel} k="signature.title" fallback="A vertical journey of stay, dine and unwind." className="mt-5 text-[48px] uppercase md:text-[64px]" />
                  <span aria-hidden className="mt-6 block h-[3px] w-12 bg-[color:var(--lux-accent)]" />
                  <p className="sig-caps mt-6 text-ink">{`Discover ${hotel.logoText} floor by floor.`}</p>
                </Reveal>
                <Diorama scene="aurel" fallback={photo(hotel, /pool/)} labels={[
                  { key: "top", title: f[0]?.name ?? "Rooftop", sub: f[0]?.short },
                  { key: "mid", title: f[1]?.name ?? "Suites", sub: f[1]?.short },
                  { key: "low", title: f[2]?.name ?? "Lobby", sub: f[2]?.short },
                ]} />
              </W>
            </section>
          ),
          rooms: (
            <section className="pb-16 md:pb-28">
              <W className="grid gap-8 lg:grid-cols-[300px_1fr]">
                <Reveal>
                  <Kick>Accommodations</Kick>
                  <H hotel={hotel} k="rooms.title" fallback="Rooms for every stay." className="mt-5 text-[48px] uppercase md:text-[60px]" />
                  <p className="sig-caps mt-5 !leading-[1.9] text-ink">Thoughtfully designed spaces with modern comforts.</p>
                  <div className="mt-6"><Btn to={href(hotel, "/rooms")} ghost className="!border-[color:var(--lux-accent)] !text-[color:var(--lux-accent-ink)]">View all rooms</Btn></div>
                </Reveal>
                <RevealGroup className="grid gap-4 sm:grid-cols-3">
                  {hotel.rooms.map((r) => (
                    <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
                      <RevealItem>
                        <Link href={roomLink(hotel, r)} className="group block bg-surface shadow-[0_14px_30px_-20px_rgb(0_0_0/0.4)]">
                          <div className="relative aspect-[4/3] overflow-hidden"><Image src={r.photos[0]} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                          <div className="flex items-end justify-between gap-3 p-4">
                            <span><b className="sig-caps block !text-[12.5px] text-ink">{r.name}</b><span className="sig-caps mt-1 block !text-[10.5px] !tracking-[0.14em] text-muted">{r.short}</span></span>
                            <ArrowRight className="size-5 shrink-0 text-[color:var(--lux-accent-ink)] transition-transform group-hover:translate-x-1" aria-hidden />
                          </div>
                        </Link>
                      </RevealItem>
                    </SiteVisible>
                  ))}
                </RevealGroup>
              </W>
            </section>
          ),
          dining: hotel.outlets[0] ? (
            <section className="relative overflow-hidden bg-[#1f1a17] text-white">
              <div className="grid md:grid-cols-[0.9fr_1.4fr]">
                <W className="relative z-10 py-14 md:py-24 md:pr-0">
                  <Kick className="!text-[#e88b6e]">{`Dining at ${hotel.logoText}`}</Kick>
                  <H hotel={hotel} k="dining.title" fallback="Modern cuisine with a local soul." className="mt-5 text-[46px] uppercase text-white md:text-[60px]" />
                  <p className="sig-caps mt-5 max-w-[320px] !leading-[1.9] text-white/85">{hotel.outlets[0].short}</p>
                  <div className="mt-6"><Btn to={href(hotel, "/dining")} ghost light>Explore dining</Btn></div>
                </W>
                <div className="relative min-h-[300px] md:min-h-[420px]">
                  <Image src={hotel.outlets[0].photo ?? hotel.heroPhoto} alt="" fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" />
                  <div aria-hidden className="absolute inset-y-0 left-0 hidden w-48 bg-gradient-to-r from-[#1f1a17] to-transparent md:block" />
                </div>
              </div>
            </section>
          ) : null,
          experiences: (
            <section className="py-16 md:py-24">
              <W className="grid gap-8 lg:grid-cols-[300px_1fr]">
                <Reveal>
                  <Kick>Experiences</Kick>
                  <H hotel={hotel} k="experiences.title" fallback="The city at your door." className="mt-5 text-[48px] uppercase md:text-[60px]" />
                  <p className="sig-caps mt-5 !leading-[1.9] text-ink">Curated experiences that bring you closer to the culture, flavours and energy of the city.</p>
                </Reveal>
                <RevealGroup className="grid gap-4 sm:grid-cols-3">
                  {hotel.services.filter((s) => s.photo).slice(0, 3).map((s) => (
                    <RevealItem key={s.id}>
                      <Link href={href(hotel, "/experiences")} className="group block bg-surface shadow-[0_14px_30px_-20px_rgb(0_0_0/0.4)]">
                        <div className="relative aspect-[16/10] overflow-hidden"><Image src={s.photo!} alt="" fill sizes="320px" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                        <div className="flex items-end justify-between gap-3 p-4"><span><b className="sig-caps block !text-[12.5px] text-ink">{s.name}</b><span className="mt-1 block text-[12.5px] text-muted">{s.short}</span></span><ArrowRight className="size-5 shrink-0 text-[color:var(--lux-accent-ink)]" aria-hidden /></div>
                      </Link>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </W>
            </section>
          ),
          reserve: (
            <section className="relative overflow-hidden bg-[#B83A22] text-white">
              <div aria-hidden className="absolute inset-y-0 left-0 hidden w-[24%] md:block"><Image src={photo(hotel, /tower|hero/)} alt="" fill sizes="25vw" className="object-cover opacity-60 mix-blend-luminosity" /></div>
              <W className="relative py-14 text-center md:py-16 md:pl-[26%]">
                <p className="sig-caps text-white/85">Book your stay</p>
                <H hotel={hotel} k="reserve.title" fallback={`Make ${hotel.logoText} your next stop.`} className="mt-3 text-[44px] uppercase text-white md:text-[64px]" />
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href={href(hotel, "/rooms")} className="inline-flex h-12 items-center gap-2 bg-white px-6 text-[12.5px] font-bold uppercase tracking-[0.16em] text-[#8f2c18]">Check availability <ArrowRight className="size-4" aria-hidden /></Link>
                </div>
                <p className="sig-caps mt-5 text-white/85">{hotel.highlights.join(" · ")}</p>
                <Contact hotel={hotel} light className="mt-6 justify-center" />
              </W>
            </section>
          ),
        }}
      />
    </FxScope>
  );
}
