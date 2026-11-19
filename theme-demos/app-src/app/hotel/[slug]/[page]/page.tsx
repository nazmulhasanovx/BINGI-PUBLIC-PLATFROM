import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHotel, listHotelSlugs } from "@/lib/data";
import { THEME_EXTRA } from "@/themes/pages";

// Pages a theme adds on top of the shared site (e.g. ISLE → /island). Only exist for hotels on that theme.
export async function generateStaticParams() {
  const out: { slug: string; page: string }[] = [];
  for (const slug of listHotelSlugs()) {
    const h = await getHotel(slug);
    if (h) Object.keys(THEME_EXTRA[h.theme.master] ?? {}).forEach((page) => out.push({ slug, page }));
  }
  return out;
}

export async function generateMetadata(props: PageProps<"/hotel/[slug]/[page]">): Promise<Metadata> {
  const { slug, page } = await props.params;
  const h = await getHotel(slug);
  const x = h ? THEME_EXTRA[h.theme.master]?.[page] : undefined;
  return x ? { title: x.label } : {};
}

export default async function ThemeExtraPage(props: PageProps<"/hotel/[slug]/[page]">) {
  const { slug, page } = await props.params;
  const hotel = await getHotel(slug);
  const x = hotel ? THEME_EXTRA[hotel.theme.master]?.[page] : undefined;
  if (!hotel || !x) notFound();
  return <x.Page hotel={hotel} />;
}
