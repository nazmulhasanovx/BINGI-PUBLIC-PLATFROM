import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, MapPin } from "lucide-react";
import { availablePages, getHotel } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { DiningMenu, TableRequest } from "@/components/explore/DiningMenu";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Dining" };

export default async function DiningPage(props: PageProps<"/hotel/[slug]/dining">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel || !availablePages(hotel).dining) notFound();
  return (
    <>
      <PageHero slug={hotel.slug} pageId="dining" title="Dining" photo={hotel.pagePhotos.dining} />
      <div className="mx-auto max-w-[1240px] space-y-14 px-4 py-10 sm:px-6 md:py-14">
        <section className="grid gap-4 md:gap-5 lg:grid-cols-2">
          {hotel.outlets.map((o, i) => (
            <Reveal key={o.id} delay={i * 0.08}>
            <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card sm:flex-row lg:flex-col xl:flex-row">
              {o.photo ? (
                <div className="relative aspect-[16/10] sm:aspect-auto sm:w-2/5 lg:aspect-[16/9] lg:w-full xl:aspect-auto xl:w-2/5">
                  <Image src={o.photo} alt={o.name} fill sizes="(max-width: 1024px) 100vw, 500px" className="object-cover" />
                </div>
              ) : (
                <div className="hidden w-2/5 bg-brand-soft sm:block lg:hidden xl:block" />
              )}
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h2 className="text-2xl font-bold">{o.name}</h2>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-muted">
                  <span className="flex items-center gap-1.5"><Clock className="size-4" /> {o.hours}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {o.location}</span>
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5 md:mt-auto md:pt-5">
                  <ButtonLink href="#menu">View menu</ButtonLink>
                  {o.tableRequest && <TableRequest outlet={o} />}
                </div>
              </div>
            </article>
            </Reveal>
          ))}
        </section>
        {hotel.menu.length > 0 && <DiningMenu hotel={hotel} />}
      </div>
    </>
  );
}
