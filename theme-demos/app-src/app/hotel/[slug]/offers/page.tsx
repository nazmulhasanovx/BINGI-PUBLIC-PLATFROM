import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { availablePages, getHotel, visibleOffers } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { OpenSearchButton } from "@/components/booking/OpenSearchButton";
import { Reveal } from "@/components/motion/Reveal";
import { SiteVisible } from "@/components/site-draft/Draft";

export const metadata: Metadata = { title: "Offers" };

export default async function OffersPage(props: PageProps<"/hotel/[slug]/offers">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel || !availablePages(hotel).offers) notFound();
  const offers = visibleOffers(hotel);
  return (
    <>
      <PageHero slug={hotel.slug} pageId="offers" title="Offers" photo={hotel.pagePhotos.offers} />
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 md:py-12">
        <p className="mb-6 flex items-start gap-3 rounded-2xl bg-brand-soft p-4 text-[14px]">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-action" />
          <span>Applied automatically — best offer for your dates.</span>
        </p>
        <ul className="grid gap-4 md:grid-cols-2 md:gap-5">
          {offers.map((o, i) => (
            <SiteVisible key={o.id} slug={hotel.slug} kind="offers" id={o.id}><li>
            <Reveal delay={i * 0.08} className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
              {o.photo && (
                <div className="relative aspect-[16/8]">
                  <Image src={o.photo} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
                  <span className="absolute right-3 top-3 rounded-full bg-action px-3 py-1.5 text-sm font-bold text-on-action">{o.value}</span>
                </div>
              )}
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h2 className="text-xl font-bold">{o.title}</h2>
                <p className="mt-1 text-[15px] text-muted">{o.short}</p>
                <p className="mt-3 rounded-xl bg-canvas px-3 py-2 text-[13px] text-muted">{o.conditions}</p>
                <div className="mt-5 md:mt-auto md:pt-5">
                  <OpenSearchButton label="Check dates" />
                </div>
              </div>
            </Reveal>
            </li></SiteVisible>
          ))}
        </ul>
      </div>
    </>
  );
}
