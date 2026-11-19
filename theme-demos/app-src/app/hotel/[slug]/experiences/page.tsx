import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { availablePages, getHotel } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { ExperienceList } from "@/components/explore/ExperienceList";

export const metadata: Metadata = { title: "Experiences" };

export default async function ExperiencesPage(props: PageProps<"/hotel/[slug]/experiences">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel || !availablePages(hotel).experiences) notFound();
  return (
    <>
      <PageHero slug={hotel.slug} pageId="experiences" title="Experiences" photo={hotel.pagePhotos.experiences} />
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 md:py-12">
        <ExperienceList hotel={hotel} />
      </div>
    </>
  );
}
