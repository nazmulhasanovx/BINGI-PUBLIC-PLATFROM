import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHotel } from "@/lib/data";
import { MyTrip } from "@/components/account/MyTrip";

export const metadata: Metadata = { title: "My Trip", robots: { index: false } };

export default async function MyTripPage(props: PageProps<"/hotel/[slug]/my-trip">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();
  return <MyTrip hotel={hotel} />;
}
