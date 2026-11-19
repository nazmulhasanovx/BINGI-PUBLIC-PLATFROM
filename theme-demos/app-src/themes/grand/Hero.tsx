import { DraftText } from "@/components/site-draft/Draft";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { SearchBar } from "@/components/booking/SearchBar";
import { OpenSearchButton } from "@/components/booking/OpenSearchButton";
import { HeroIn, PhotoIn } from "@/components/motion/Reveal";
import { showRating } from "@/lib/data";
import { presetFor } from "@/lib/presets";

/** Phone: app-style photo card + title + search pill. Tablet/desktop: full-bleed hero with floating search bar. */
export function Hero({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  return (
    <section className="relative">
      <div className="relative mx-3 mt-2 h-[clamp(240px,36svh,330px)] overflow-hidden rounded-[28px] md:mx-0 md:mt-0 md:h-[clamp(520px,64vh,620px)] md:rounded-none">
        <PhotoIn className="absolute inset-0">
          <Image src={hotel.heroPhoto} alt={hotel.name} fill priority fetchPriority="high" sizes="100vw" quality={85} className="object-cover object-center" />
        </PhotoIn>
        {/* phone: small chips on the photo */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 md:hidden">
          {showRating(hotel) && (
            <span className="flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-[12px] font-semibold backdrop-blur">
              <Star className="size-3.5 fill-brand text-brand" /> {hotel.reviewScore} · {hotel.reviewCount}
            </span>
          )}
          <span className="rounded-full bg-surface/90 px-2.5 py-1 text-[12px] font-semibold backdrop-blur">{hotel.type}</span>
        </div>
        {/* tablet/desktop: light scrim + text over the photo */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-white/95 via-white/70 via-40% to-transparent to-70% md:block" />
        <div className="absolute inset-0 hidden items-center pb-16 md:flex">
          <div className="mx-auto w-full max-w-[1240px] px-6">
            <HeroIn className="max-w-[560px]" delay={0.15}>
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-action">
                {hotel.name} · {hotel.type}
              </p>
              <h2 className="mt-3 text-5xl font-bold leading-[1.06] lg:text-[56px]"><DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} /></h2>
              <div className="mt-7 flex gap-3">
                <OpenSearchButton />
                <ButtonLink href={`${base}/explore`} variant="white" size="lg">
                  {`Explore the ${presetFor(hotel.propertyType).place}`} <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </HeroIn>
          </div>
        </div>
      </div>

      {/* phone title (the page's h1; desktop shows the same line inside the photo) */}
      <HeroIn className="px-4 pt-4 md:sr-only" delay={0.1}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-action">{hotel.name}</p>
        <h1 className="mt-1 text-[26px] font-bold leading-[1.12]"><DraftText slug={hotel.slug} k="hero.title" fallback={hotel.tagline} /></h1>
      </HeroIn>

      <div className="relative z-10 mx-auto mt-4 max-w-[1040px] px-4 sm:px-6 md:-mt-[52px] lg:-mt-11">
        <HeroIn delay={0.3}>
          <SearchBar />
        </HeroIn>
      </div>
    </section>
  );
}
