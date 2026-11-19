import { Suspense } from "react";
import { DraftText } from "@/components/site-draft/Draft";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BedDouble, Check, ChevronLeft, Clock, Eye, Ruler, Users } from "lucide-react";
import { getHotel, listHotelSlugs } from "@/lib/data";
import { Gallery } from "@/components/ui/Gallery";
import { RatePicker } from "@/components/rooms/RatePicker";
import { RoomCard } from "@/components/rooms/RoomCard";
import { Skel } from "@/components/ui/Skeleton";
import { Reveal } from "@/components/motion/Reveal";
import { MasterSwitch } from "@/components/site-draft/Draft";
import { PLAN_RULES } from "@/lib/data";
import { PAID_IDS, fallbackMaster } from "@/themes/paid";
import { THEME_ROOM } from "@/themes/pages";
import type { MasterTheme } from "@/lib/types";

export async function generateStaticParams() {
  const out: { slug: string; room: string }[] = [];
  for (const slug of listHotelSlugs()) {
    const h = await getHotel(slug);
    h?.rooms.forEach((r) => out.push({ slug, room: r.slug }));
  }
  return out;
}

export async function generateMetadata(props: PageProps<"/hotel/[slug]/rooms/[room]">): Promise<Metadata> {
  "use cache";
  const { slug, room } = await props.params;
  const r = (await getHotel(slug))?.rooms.find((x) => x.slug === room);
  return r ? { title: r.name, description: r.short } : {};
}

export default async function RoomPage(props: PageProps<"/hotel/[slug]/rooms/[room]">) {
  const { slug, room: roomSlug } = await props.params;
  const hotel = await getHotel(slug);
  const room = hotel?.rooms.find((r) => r.slug === roomSlug);
  if (!hotel || !room) notFound();
  const others = hotel.rooms.filter((r) => r.id !== room.id).slice(0, 3);
  const facts = [
    { icon: Users, label: `Up to ${room.maxAdults} adults${room.maxChildren ? ` + ${room.maxChildren} child` : ""}` },
    { icon: BedDouble, label: room.bed },
    room.sizeSqft && { icon: Ruler, label: `${room.sizeSqft} sq ft` },
    room.view && { icon: Eye, label: `${room.view} view` },
  ].filter(Boolean) as { icon: typeof Users; label: string }[];

  const shared = (
    <div className="pb-28 md:pb-20">
      <div className="mx-auto max-w-[1240px] md:px-6 md:pt-6">
        <Link href={`/hotel/${slug}/rooms`} className="hidden items-center gap-1 text-sm font-semibold text-muted hover:text-ink md:mb-4 md:inline-flex">
          <ChevronLeft className="size-4" /> All rooms
        </Link>
        <Gallery photos={room.photos} alt={room.name} />
      </div>

      <div className="mx-auto mt-6 grid max-w-[1240px] gap-8 px-4 sm:px-6 md:mt-10 lg:grid-cols-[1fr_400px] lg:gap-12">
        <Reveal className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-action">{room.kind}</p>
          <h1 className="mt-1 text-[30px] font-bold leading-tight md:text-[40px]">{room.name}</h1>
          <ul className="mt-4 flex flex-wrap gap-2">
            {facts.map((f) => (
              <li key={f.label} className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[14px]">
                <f.icon className="size-4 text-muted" /> {f.label}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink/80 md:text-[17px]">{room.description}</p>

          <h2 className="mt-10 text-xl font-bold">In the room</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {room.amenities.map((a) => (
              <li key={a} className="flex items-center gap-2.5 text-[15px]">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-action"><Check className="size-4" /></span>
                {a}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-xl font-bold">Good to know</h2>
          <dl className="mt-4 divide-y divide-line rounded-3xl border border-line bg-surface">
            <div className="flex gap-4 p-4"><dt className="flex w-32 shrink-0 items-center gap-2 font-semibold"><Clock className="size-4 text-muted" /> Check-in</dt><dd className="text-muted">From {hotel.checkIn} · check-out by {hotel.checkOut}</dd></div>
            <div className="flex gap-4 p-4"><dt className="w-32 shrink-0 font-semibold">Cancellation</dt><dd className="text-muted"><DraftText slug={hotel.slug} k="policy.cancellation" fallback={hotel.policies.cancellation} /></dd></div>
            <div className="flex gap-4 p-4"><dt className="w-32 shrink-0 font-semibold">Children</dt><dd className="text-muted"><DraftText slug={hotel.slug} k="policy.children" fallback={hotel.policies.children} /></dd></div>
            <div className="flex gap-4 p-4"><dt className="w-32 shrink-0 font-semibold">Tax</dt><dd className="text-muted">{hotel.policies.tax}</dd></div>
          </dl>
        </Reveal>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:self-start">
          <Suspense fallback={<Skel className="h-[520px] w-full rounded-[28px]" />}>
            <RatePicker hotel={hotel} room={room} />
          </Suspense>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mx-auto mt-16 max-w-[1240px] px-4 sm:px-6">
          <h2 className="mb-5 text-2xl font-bold">Other ways to stay</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((r) => (
              <RoomCard key={r.id} room={r} href={`/hotel/${slug}/rooms/${r.slug}`} layout="vertical" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
  const masters = [...(PLAN_RULES[hotel.plan].masters as readonly MasterTheme[]), ...PAID_IDS];
  const views = Object.fromEntries(masters.map((m) => { const V = THEME_ROOM[m]; return [m, V ? <V key={m} hotel={hotel} room={room} master={m} /> : shared]; }));
  return <MasterSwitch slug={hotel.slug} initial={hotel.theme.master} fallback={fallbackMaster(hotel)} homes={views} />;
}
