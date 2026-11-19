import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Car, ConciergeBell, Leaf, Flame, Dumbbell, Flower2, Wifi, Mail, MessageCircle, Phone, Presentation, Sparkles, Umbrella, UtensilsCrossed, Waves } from "lucide-react";
import { availablePages, getHotel } from "@/lib/data";
import { presetFor } from "@/lib/presets";
import { PageHero } from "@/components/site/PageHero";
import { SectionTabs } from "@/components/explore/SectionTabs";
import { Gallery } from "@/components/ui/Gallery";
import { LocationBlock } from "@/components/sections/HomeSections";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Explore" };

const ICONS: Record<string, typeof Waves> = { waves: Waves, umbrella: Umbrella, flower: Flower2, utensils: UtensilsCrossed, presentation: Presentation, car: Car, dumbbell: Dumbbell, wifi: Wifi, concierge: ConciergeBell, leaf: Leaf, flame: Flame };

export default async function ExplorePage(props: PageProps<"/hotel/[slug]/explore">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();
  const units = hotel.rooms.reduce((s, r) => s + r.units, 0);
  const stats = [
    hotel.stars && { k: `${hotel.stars}-star`, v: presetFor(hotel.propertyType).placeTitle },
    { k: String(units), v: presetFor(hotel.propertyType).unitsLabel },
    availablePages(hotel).dining && { k: String(hotel.outlets.length), v: hotel.outlets.length > 1 ? "Places to eat" : "Restaurant" },
    { k: hotel.checkIn, v: "Check-in" },
  ].filter(Boolean) as { k: string; v: string }[];
  const tel = `tel:${hotel.phone.replace(/[^+\d]/g, "")}`;

  return (
    <>
      <PageHero slug={hotel.slug} pageId="explore" title={hotel.name} photo={hotel.pagePhotos.explore} />
      <SectionTabs
        items={[
          { id: "about", label: "About" },
          { id: "facilities", label: "Facilities" },
          { id: "gallery", label: "Gallery" },
          { id: "location", label: "Location" },
          { id: "contact", label: "Contact" },
        ]}
      />
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <section id="about" className="scroll-mt-32 py-12 md:py-16">
        <Reveal className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[28px]">
            <Image src={hotel.pagePhotos.explore ?? hotel.heroPhoto} alt={hotel.name} fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold md:text-[32px] md:leading-tight">{hotel.tagline}</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink/80">{hotel.intro}</p>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.v} className="rounded-2xl bg-brand-soft p-3.5">
                  <dt className="font-heading text-xl font-bold">{s.k}</dt>
                  <dd className="text-[13px] text-muted">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
        </section>

        <section id="facilities" className="scroll-mt-32 border-t border-line py-12 md:py-16">
          <h2 className="text-2xl font-bold md:text-[32px]">Facilities</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {hotel.facilities.map((f, i) => {
              const Icon = ICONS[f.icon] ?? Sparkles;
              return (
                <li key={f.name}>
                <Reveal delay={i * 0.05} className="h-full rounded-3xl border border-line bg-surface p-4 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-soft text-action"><Icon className="size-6" /></span>
                  <p className="mt-3 font-semibold">{f.name}</p>
                  <p className="mt-1 text-[13px] text-muted">{f.short}</p>
                </Reveal>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="gallery" className="scroll-mt-32 border-t border-line py-12 md:py-16">
          <h2 className="mb-6 text-2xl font-bold md:text-[32px]">Gallery</h2>
          <Reveal>
            <Gallery photos={[...hotel.gallery, ...hotel.rooms.map((r) => r.photos[0])]} alt={hotel.name} layout="grid" />
          </Reveal>
        </section>
      </div>

      <div id="location" className="scroll-mt-32 border-t border-line">
        <LocationBlock hotel={hotel} />
      </div>

      <section id="contact" className="scroll-mt-32 border-t border-line bg-surface">
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 md:py-16">
          <h2 className="text-2xl font-bold md:text-[32px]">Contact</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <a href={tel} className="flex items-center gap-3 rounded-3xl border border-line p-4 hover:border-brand-ring"><Phone className="size-5 text-action" /><span><span className="block font-semibold">Call</span><span className="text-sm text-muted">{hotel.phone}</span></span></a>
            {hotel.whatsapp && <a href={`https://wa.me/${hotel.whatsapp.replace(/\D/g, "")}`} className="flex items-center gap-3 rounded-3xl border border-line p-4 hover:border-brand-ring"><MessageCircle className="size-5 text-action" /><span><span className="block font-semibold">WhatsApp</span><span className="text-sm text-muted">Chat with us</span></span></a>}
            <a href={`mailto:${hotel.email}`} className="flex items-center gap-3 rounded-3xl border border-line p-4 hover:border-brand-ring"><Mail className="size-5 text-action" /><span><span className="block font-semibold">Email</span><span className="text-sm text-muted">{hotel.email}</span></span></a>
          </div>
          {availablePages(hotel).events && (
            <Link href={`/hotel/${slug}/events`} className="group mt-4 flex items-center justify-between rounded-3xl bg-brand-soft p-5">
              <span className="font-semibold">Weddings, meetings & groups — send an enquiry</span>
              <ArrowRight className="size-5 shrink-0 text-action transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
