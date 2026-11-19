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
import "./styles.css";
import { createRoot } from "react-dom/client";
import { useEffect, useState, type ReactNode } from "react";
import { split, useRoute } from "./shim/router";
import { NotFoundError } from "./shim/navigation";

import RootNotFound from "@/app/not-found";
import HotelLayout from "@/app/hotel/[slug]/layout";
import HotelNotFound from "@/app/hotel/[slug]/not-found";
import Home from "@/app/hotel/[slug]/page";
import Rooms from "@/app/hotel/[slug]/rooms/page";
import Room from "@/app/hotel/[slug]/rooms/[room]/page";
import Stay from "@/app/hotel/[slug]/stay/page";
import Checkout from "@/app/hotel/[slug]/checkout/page";
import Confirmation from "@/app/hotel/[slug]/confirmation/page";
import Dining from "@/app/hotel/[slug]/dining/page";
import Experiences from "@/app/hotel/[slug]/experiences/page";
import Offers from "@/app/hotel/[slug]/offers/page";
import Explore from "@/app/hotel/[slug]/explore/page";
import ThemeExtra from "@/app/hotel/[slug]/[page]/page";
import Events from "@/app/hotel/[slug]/events/page";
import Policies from "@/app/hotel/[slug]/policies/page";
import MyTrip from "@/app/hotel/[slug]/my-trip/page";

// Public-site theme demo: only the hotel website routes of the theme app (no HMS, no onboarding).
(window as unknown as { __BINGI_SPA__: boolean }).__BINGI_SPA__ = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Comp = (p: any) => ReactNode | Promise<ReactNode>;
const PAGES: Record<string, Comp> = {
  "": Home, rooms: Rooms, stay: Stay, checkout: Checkout, confirmation: Confirmation, dining: Dining,
  experiences: Experiences, offers: Offers, explore: Explore, events: Events, policies: Policies, "my-trip": MyTrip,
};

const BACK = "../themes/";

function Gone() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui", textAlign: "center", padding: 24 }}>
      <div>
        <p style={{ fontSize: 18, fontWeight: 600 }}>Choose a theme to preview</p>
        <a href={BACK} onClick={(e) => { if (window.self !== window.top) { e.preventDefault(); window.parent.postMessage("bingi:close-theme", "*"); } }} style={{ display: "inline-block", marginTop: 16, padding: "12px 20px", borderRadius: 999, background: "#B11C29", color: "#fff", textDecoration: "none" }}>All BinGi themes</a>
      </div>
    </main>
  );
}

async function resolve(route: string): Promise<ReactNode> {
  const { path } = split(route);
  const seg = path.split("/").filter(Boolean);
  if (seg[0] !== "hotel" || !seg[1]) return <Gone />;
  const slug = seg[1];
  const sub = seg.slice(2);
  let page: ReactNode;
  try {
    let P: Comp | undefined;
    let params: Record<string, string> = { slug };
    if (sub[0] === "rooms" && sub[1]) { P = Room; params = { slug, room: sub[1] }; }
    else if (sub.length <= 1) P = PAGES[sub[0] ?? ""];
    if (!P && sub.length === 1) { P = ThemeExtra as Comp; params = { slug, page: sub[0] }; }
    if (!P) throw new NotFoundError("");
    page = await P({ params: Promise.resolve(params) });
  } catch (e) {
    if (!(e instanceof NotFoundError)) throw e;
    page = <HotelNotFound />;
  }
  try {
    return await (HotelLayout as Comp)({ params: Promise.resolve({ slug }), children: page });
  } catch (e) {
    if (e instanceof NotFoundError) return <RootNotFound />;
    throw e;
  }
}

// Small fixed bar so a visitor always knows this is a demo and can go back.
function DemoBar() {
  if (window.self !== window.top) return null; // inside the site's viewer, which has its own bar
  return (
    <div style={{ position: "fixed", left: 12, bottom: 12, zIndex: 2147483000, display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 6px 14px", borderRadius: 999, background: "rgba(17,24,39,.88)", color: "#fff", font: "500 13px/1 system-ui, sans-serif", boxShadow: "0 10px 30px -10px rgba(0,0,0,.5)", backdropFilter: "blur(8px)" }}>
      <span>BinGi theme demo · sample hotel</span>
      <a href={BACK} onClick={(e) => { if (window.self !== window.top) { e.preventDefault(); window.parent.postMessage("bingi:close-theme", "*"); } }} style={{ color: "#111827", background: "#fff", borderRadius: 999, padding: "9px 14px", textDecoration: "none", fontWeight: 600 }}>← All themes</a>
    </div>
  );
}

function App() {
  const route = useRoute();
  const path = split(route).path;
  const [el, setEl] = useState<ReactNode>(null);
  useEffect(() => {
    let live = true;
    resolve(route).then((n) => live && setEl(n));
    return () => { live = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href") ?? "";
      if (href.startsWith("#") && !href.startsWith("#/")) {
        e.preventDefault();
        document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return <>{el}<DemoBar /></>;
}

createRoot(document.getElementById("root")!).render(<App />);
