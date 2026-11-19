import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHotel, listHotelSlugs } from "@/lib/data";
import { ThemeScope } from "@/components/theme/ThemeScope";
import { ThemePreview } from "@/components/theme/ThemePreview";
import { PreviewBridge } from "@/components/site-draft/Draft";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { TopBar } from "@/components/site/TopBar";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { buildNav } from "@/components/site/nav";
import { SitePaused } from "@/components/site/SitePaused";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { LangSync } from "@/lib/i18n";
import { SeoTitle } from "@/components/site/SeoTitle";
import { BookingPausedBar } from "@/components/site/BookingPaused";

export function generateStaticParams() {
  return listHotelSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: LayoutProps<"/hotel/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const h = await getHotel(slug);
  if (!h) return {};
  return {
    title: { default: `${h.name} — ${h.area}, ${h.city}`, template: `%s · ${h.name}` },
    description: h.intro,
    openGraph: { title: h.name, description: h.tagline, images: [h.heroPhoto] },
  };
}

export default async function HotelLayout(props: LayoutProps<"/hotel/[slug]">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();

  if (hotel.status === "paused")
    return (
      <ThemeScope themeId={hotel.theme.id} heading={hotel.theme.heading} master={hotel.theme.master}>
        <SitePaused hotel={hotel} />
      </ThemeScope>
    );

  const nav = buildNav(hotel);
  const base = `/hotel/${hotel.slug}`;

  return (
    <ThemeScope themeId={hotel.theme.id} heading={hotel.theme.heading} master={hotel.theme.master}>
      <SmoothScroll>
      <BookingProvider hotel={hotel}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:shadow-float">
          Skip to content
        </a>
        <LangSync />
        <SeoTitle slug={slug} name={hotel.name} />
        <BookingPausedBar hotel={hotel} />
        <PreviewBridge />
        <Suspense fallback={null}>
          <ThemePreview slug={hotel.slug} defaultTheme={hotel.theme.id} defaultHeading={hotel.theme.heading} master={hotel.theme.master} />
        </Suspense>
        <TopBar hotel={hotel} />
        <SiteHeader nav={nav} logoText={hotel.logoText} phone={hotel.phone} whatsapp={hotel.whatsapp} base={base} />
        <main id="main">{props.children}</main>
        <SiteFooter hotel={hotel} nav={nav} />
        <MobileTabBar base={base} />
      </BookingProvider>
      </SmoothScroll>
    </ThemeScope>
  );
}
