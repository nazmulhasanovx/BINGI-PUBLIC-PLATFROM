import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Presentation, Users, UtensilsCrossed } from "lucide-react";
import { availablePages, getHotel } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { EventEnquiry } from "@/components/explore/EventEnquiry";

export const metadata: Metadata = { title: "Events & celebrations" };

export default async function EventsPage(props: PageProps<"/hotel/[slug]/events">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel || !availablePages(hotel).events) notFound();
  const points = [
    { icon: Users, t: "Weddings & holud", s: "Lawn and beachfront set-ups with catering." },
    { icon: Presentation, t: "Meetings", s: "Meeting room for up to 30, projector and coffee breaks." },
    { icon: UtensilsCrossed, t: "Private dinners", s: "Beach BBQ and set menus for groups." },
  ];
  return (
    <>
      <PageHero slug={hotel.slug} pageId="events" title="Events & celebrations" photo={hotel.pagePhotos.events} />
      <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
        <ul className="space-y-3">
          {points.map((p) => (
            <li key={p.t} className="flex gap-4 rounded-3xl border border-line bg-surface p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-action"><p.icon className="size-6" /></span>
              <span><span className="block font-semibold">{p.t}</span><span className="text-[14px] text-muted">{p.s}</span></span>
            </li>
          ))}
        </ul>
        <EventEnquiry hotelName={hotel.name} />
      </div>
    </>
  );
}
