import type { Hotel } from "@/lib/types";
import { Hero } from "./Hero";
import { DineAndDo, FactsStrip, FeaturedStays, LocationBlock, OffersTeaser, QuickLinks, Reviews } from "@/components/sections/HomeSections";
import { DraftSections } from "@/components/site-draft/Draft";

/** GRAND (Ultra): luxury, photo-led, dining + experiences up front. Section ids = themes/manifest.ts. */
export function GrandHome({ hotel }: { hotel: Hotel }) {
  return (
    <DraftSections
      slug={hotel.slug}
      master="grand"
      items={[
        { id: "hero", node: <Hero hotel={hotel} /> },
        { id: "quick-links", node: <QuickLinks hotel={hotel} /> },
        { id: "facts", node: <FactsStrip hotel={hotel} /> },
        { id: "featured-stays", node: <FeaturedStays hotel={hotel} /> },
        { id: "dine-do", node: <DineAndDo hotel={hotel} /> },
        { id: "offers", node: <OffersTeaser hotel={hotel} /> },
        { id: "reviews", node: <Reviews hotel={hotel} /> },
        { id: "location", node: <LocationBlock hotel={hotel} /> },
      ]}
    />
  );
}
