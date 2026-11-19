import { notFound } from "next/navigation";
import { PLAN_RULES, getHotel } from "@/lib/data";
import { THEME_HOMES } from "@/themes/registry";
import { MasterSwitch } from "@/components/site-draft/Draft";
import type { MasterTheme } from "@/lib/types";
import { PAID_IDS, fallbackMaster } from "@/themes/paid";

// Every layout the plan allows is rendered, plus the paid themes; the site record (HMS → Website Management) picks which one shows.
// Paid themes show only with an active licence (prototype: checked in the browser; production: checked here, on the server).
export default async function HotelHome(props: PageProps<"/hotel/[slug]">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();
  const allowed = [...(PLAN_RULES[hotel.plan].masters as readonly MasterTheme[]), ...PAID_IDS];
  const homes = Object.fromEntries(
    allowed.flatMap((m) => {
      const Home = THEME_HOMES[m];
      return Home ? [[m, <Home key={m} hotel={hotel} />]] : [];
    }),
  );
  return <MasterSwitch slug={hotel.slug} initial={hotel.theme.master} fallback={fallbackMaster(hotel)} homes={homes} />;
}
