import type { Hotel } from "@/lib/types";
import { availablePages } from "@/lib/data";
import { THEME_EXTRA } from "@/themes/pages";

export interface NavItem {
  href: string;
  label: string;
}

/** Nav shows only pages that have data for this hotel. */
export function buildNav(h: Hotel): NavItem[] {
  const base = `/hotel/${h.slug}`;
  const p = availablePages(h);
  const extra = Object.entries(THEME_EXTRA[h.theme.master] ?? {}).map(([id, x]) => ({ href: `${base}/${id}`, label: x.label }));
  return [
    { href: base, label: "Home" },
    { href: `${base}/rooms`, label: h.theme.master === "isle" ? "Villas" : "Rooms" },
    ...extra,
    p.dining && { href: `${base}/dining`, label: "Dining" },
    p.experiences && { href: `${base}/experiences`, label: "Experiences" },
    p.offers && { href: `${base}/offers`, label: "Offers" },
    !extra.length && { href: `${base}/explore`, label: "Explore" },
  ].filter(Boolean) as NavItem[];
}
