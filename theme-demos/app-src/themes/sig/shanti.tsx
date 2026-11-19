import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SiteVisible } from "@/components/site-draft/Draft";
import { SearchBar } from "@/components/booking/SearchBar";
import { T } from "@/lib/i18n";
import { LuxPage } from "../lux/kit";
import { photo } from "../shared";
import { Contact, H, W, href, roomLink } from "./kit";

const Script = ({ children, className = "" }: { children: string; className?: string }) => <p className={`sig-script text-[34px] leading-none text-[color:var(--lux-accent-ink)] md:text-[40px] ${className}`}><T>{children}</T></p>;
const Pill = ({ to, children, solid }: { to: string; children: string; solid?: boolean }) => (
  <Link href={to} className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-bold ${solid ? "bg-[#55673A] text-white" : "border-2 border-[color:var(--lux-accent)] text-[color:var(--lux-accent-ink)]"}`}><T>{children}</T> <ArrowRight className="size-4" aria-hidden /></Link>
);
const wave = "[border-radius:0_46%_40%_0/0_60%_40%_0]";

/**
 * SHANTI (Signature · guest house) — design 06. Lora + Nunito with Caveat handwriting, sage green and peach.
 * Organic wave-shaped photos, the host's own words, home breakfast and the garden.
 */
export function ShantiHome({ hotel }: { hotel: Hotel }) {
  const breakfast = hotel.services.find((s) => s.category === "dining");
  return (
    <LuxPage
      hotel={hotel}
      master="shanti"
      parts={{
        hero: (
          <section className="relative">
            <div className="grid md:grid-cols-[1fr_1.2fr]">
              <W className="order-2 py-8 md:order-1 md:py-24 md:pr-0">
                <H hotel={hotel} k="hero.title" fallback={hotel.tagline} as="h1" className="max-w-[440px] text-[46px] leading-[1.06] md:text-[58px]" />
                <svg aria-hidden viewBox="0 0 200 14" className="mt-2 h-3 w-44 text-[color:var(--lux-accent)]"><path d="M2 9 C 70 2, 130 4, 198 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                <p className="mt-5 max-w-[380px] text-[17px] leading-relaxed text-muted">{hotel.intro}</p>
              </W>
              <div className="relative order-1 min-h-[300px] md:order-2 md:min-h-[520px]">
                <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="(max-width: 768px) 100vw, 60vw" className="object-cover md:[mask-image:linear-gradient(to_right,transparent,black_22%)]" />
              </div>
            </div>
            <W className="relative z-10 -mt-6 md:-mt-24">
              <div className="mx-auto grid max-w-[1040px] items-center gap-3 rounded-[24px] bg-surface p-3 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.4)] md:grid-cols-[150px_1fr]">
                <p className="hidden pl-4 md:block"><span className="sig-script block text-[40px] leading-none text-[color:var(--lux-accent-ink)]">Book</span><span className="sig-caps text-ink">your stay</span></p>
                <div className="[&_form]:!border-0 [&_form]:!shadow-none [&>button]:!shadow-none"><SearchBar /></div>
              </div>
            </W>
          </section>
        ),
        story: (
          <section className="py-14 md:py-20">
            <div className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
              <Reveal className={`relative aspect-[16/9] overflow-hidden ${wave}`}><Image src={photo(hotel, /bungalow|garden/)} alt="" fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" /></Reveal>
              <Reveal className="px-5 md:px-0 md:pr-16">
                <Script>Our Home</Script>
                <H hotel={hotel} k="story.title" fallback={`The Story of ${hotel.logoText}`} className="mt-1 text-[38px] md:text-[44px]" />
                <p className="mt-3 max-w-[440px] text-[16px] leading-relaxed text-muted">{hotel.host?.note ?? hotel.intro}</p>
                {hotel.host && <p className="mt-3 text-[14px] font-semibold">— {hotel.host.name}, {hotel.host.role.toLowerCase()} since {hotel.host.since}</p>}
                <div className="mt-6"><Pill to={href(hotel, "/explore")}>Our Story</Pill></div>
              </Reveal>
            </div>
          </section>
        ),
        rooms: (
          <section className="bg-[#e3e6d6] py-14 md:py-20">
            <W>
              <Reveal className="text-center"><Script>Stay</Script><H hotel={hotel} k="rooms.title" fallback="Our Guest Rooms" className="mt-1 text-[40px] md:text-[48px]" /><p className="mt-2 text-[16px] text-muted">{hotel.rooms.length} comfortable rooms, each with its own character and a warm, homely feel.</p></Reveal>
              <RevealGroup className="mt-10 grid gap-6 md:grid-cols-3">
                {hotel.rooms.map((r) => (
                  <SiteVisible key={r.id} slug={hotel.slug} kind="rooms" id={r.id}>
                    <RevealItem>
                      <Link href={roomLink(hotel, r)} className="group block overflow-hidden rounded-[20px] bg-surface shadow-[0_14px_30px_-20px_rgb(0_0_0/0.35)]">
                        <div className="relative aspect-[16/10] overflow-hidden"><Image src={r.photos[0]} alt="" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                        <div className="p-5"><h3 className="lux-display text-[24px]">{r.name}</h3><p className="mt-1 text-[15px] text-muted">{r.short}</p><p className="mt-3 inline-flex items-center gap-2 text-[15px] font-bold text-[color:var(--lux-accent-ink)]"><T>View Room</T> <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></p></div>
                      </Link>
                    </RevealItem>
                  </SiteVisible>
                ))}
              </RevealGroup>
            </W>
          </section>
        ),
        dining: breakfast ? (
          <section className="grid items-center md:grid-cols-[0.8fr_1.2fr]">
            <W className="py-12 md:py-0 md:pl-[max(24px,calc((100vw-1240px)/2+24px))] md:pr-10">
              <Script>Home Breakfast</Script>
              <H hotel={hotel} k="dining.title" fallback="A Fresh Start Each Morning" className="mt-1 text-[38px] md:text-[46px]" />
              <p className="mt-3 max-w-[400px] text-[16px] leading-relaxed text-muted">{breakfast.short} {hotel.facilities.find((f) => /breakfast/i.test(f.name))?.short ?? ""}</p>
              <div className="mt-6"><Pill to={href(hotel, "/experiences")} solid>{`Breakfast at ${hotel.logoText}`}</Pill></div>
            </W>
            <div className="relative min-h-[320px] md:min-h-[460px]"><Image src={breakfast.photo ?? photo(hotel, /breakfast/)} alt="" fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover md:[mask-image:linear-gradient(to_right,transparent,black_18%)]" /></div>
          </section>
        ) : null,
        gallery: (
          <section className="py-14 md:py-20">
            <W className="grid items-center gap-8 lg:grid-cols-[280px_1fr]">
              <Reveal><Script>Our Spaces</Script><H hotel={hotel} k="gallery.title" fallback="Garden, Lounge and More" className="mt-1 text-[36px] md:text-[42px]" /><p className="mt-3 text-[15.5px] text-muted">Relax in our green garden, share a quiet moment in the lounge and feel at home throughout the house.</p><div className="mt-5"><Pill to={href(hotel, "/explore")}>View Gallery</Pill></div></Reveal>
              <div className="grid grid-cols-3 gap-3 md:gap-4">{hotel.gallery.slice(0, 3).map((g) => <div key={g} className="relative aspect-[4/5] overflow-hidden rounded-[18px]"><Image src={g} alt="" fill sizes="(max-width: 768px) 33vw, 300px" className="object-cover" /></div>)}</div>
            </W>
          </section>
        ),
        reserve: (
          <section className="grid md:grid-cols-[1.2fr_1fr]">
            <div className="relative min-h-[280px] md:min-h-[380px]"><Image src={photo(hotel, /veranda|balcony/)} alt="" fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" /></div>
            <div className="flex flex-col justify-center bg-[#f6cdb6] px-6 py-12 md:-ml-24 md:rounded-l-[120px] md:pl-28 md:pr-12">
              <Script>Come Stay</Script>
              <H hotel={hotel} k="reserve.title" fallback={`Make ${hotel.logoText} Your Next Getaway`} className="mt-1 text-[36px] md:text-[44px]" />
              <p className="mt-2 text-[16px] text-[#5a4a3e]">A warm, welcoming home for a restful escape.</p>
              <div className="mt-6"><Pill to={href(hotel, "/rooms")} solid>Book Your Stay</Pill></div>
              <Contact hotel={hotel} className="mt-5" />
            </div>
          </section>
        ),
      }}
    />
  );
}
