import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHotel } from "@/lib/data";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { StayCart } from "@/components/stay/StayCart";

export const metadata: Metadata = { title: "Your stay", robots: { index: false } };

export default async function Page(props: PageProps<"/hotel/[slug]/stay">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();
  return (
    <Suspense fallback={<ListSkeleton rows={2} />}>
      <StayCart hotel={hotel} />
    </Suspense>
  );
}
