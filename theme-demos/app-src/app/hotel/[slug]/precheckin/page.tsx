import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHotel } from "@/lib/data";
import { PreCheckin } from "@/components/stay/PreCheckin";

export const metadata: Metadata = { title: "Online check-in", robots: { index: false } };

export default async function PreCheckinPage(props: PageProps<"/hotel/[slug]/precheckin">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();
  return <Suspense><PreCheckin hotel={hotel} /></Suspense>;
}
