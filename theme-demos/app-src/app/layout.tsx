import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/playfair-display";
import "@fontsource/anton";
import "@fontsource-variable/archivo";
import "@fontsource/dm-serif-display";
import "@fontsource/dm-serif-display/400-italic.css";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/lora";
import "@fontsource-variable/lora/wght-italic.css";
import "@fontsource-variable/caveat";
import "@fontsource-variable/nunito";
import "@fontsource/alfa-slab-one";
import "@fontsource-variable/nunito-sans";
import "@fontsource/archivo-black";
import "@fontsource-variable/space-grotesk";
import "@fontsource/permanent-marker";
import "@fontsource/libre-baskerville";
import "@fontsource/libre-baskerville/400-italic.css";
import "@fontsource/satisfy";
import "@fontsource/gilda-display";
import "@fontsource-variable/karla";
import "@fontsource/young-serif";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource/italiana";
import "@fontsource-variable/manrope";
import "@fontsource-variable/bodoni-moda/wght-italic.css";
import "@fontsource-variable/work-sans";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/outfit";
import "@fontsource-variable/figtree";
import "@fontsource-variable/mulish";
import "@fontsource-variable/sora";
import "@fontsource-variable/rubik";
import "@fontsource-variable/quicksand";
import "@fontsource-variable/jost";
import "@fontsource/marcellus";
import "@fontsource/spectral/500.css";
import "@fontsource/spectral/500-italic.css";
import "@fontsource-variable/literata";
import "@fontsource-variable/literata/wght-italic.css";
import "@fontsource/rozha-one";
import "@fontsource/prata";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/600.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://bingi.app"),
  title: "BinGi Hotel Website — GRAND theme",
  description: "Hotel website and direct booking by BinGi Hotel Management Technology.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
