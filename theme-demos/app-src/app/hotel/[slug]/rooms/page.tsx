import { presetFor } from "@/lib/presets";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHotel } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { SearchBar } from "@/components/booking/SearchBar";
import { RoomsResults } from "@/components/rooms/RoomsResults";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { MasterSwitch } from "@/components/site-draft/Draft";
import { PLAN_RULES } from "@/lib/data";
import { PAID_IDS, fallbackMaster } from "@/themes/paid";
import { THEME_ROOMS } from "@/themes/pages";
import type { MasterTheme } from "@/lib/types";

export const metadata: Metadata = { title: "Rooms & suites" };

export default async function RoomsPage(props: PageProps<"/hotel/[slug]/rooms">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();
  const shared = (
    <>
      <PageHero slug={hotel.slug} pageId="rooms" title={presetFor(hotel.propertyType).unitsLabel} photo={hotel.pagePhotos.rooms ?? hotel.rooms[0]?.photos[0]} />
      <div className="relative z-10 mx-auto -mt-8 hidden max-w-[1040px] px-6 md:block">
        <SearchBar />
      </div>
      <Suspense fallback={<ListSkeleton />}>
        <RoomsResults hotel={hotel} />
      </Suspense>
    </>
  );
  // A theme may own this page (e.g. ISLE); every other theme shows the shared layout.
  const masters = [...(PLAN_RULES[hotel.plan].masters as readonly MasterTheme[]), ...PAID_IDS];
  const views = Object.fromEntries(masters.map((m) => { const V = THEME_ROOMS[m]; return [m, V ? <V key={m} hotel={hotel} master={m} /> : shared]; }));
  return <MasterSwitch slug={hotel.slug} initial={hotel.theme.master} fallback={fallbackMaster(hotel)} homes={views} />;
}
