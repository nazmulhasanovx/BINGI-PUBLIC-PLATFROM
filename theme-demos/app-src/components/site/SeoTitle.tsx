"use client";
// Applies Website Management › Google & Sharing (title template + description) on the live site / preview.
// Server metadata stays the default; this only overrides when the hotel changed the template.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSiteView } from "@/lib/site";

const NAMES: Record<string, string> = { "": "Home", rooms: "Rooms", offers: "Offers", dining: "Dining", experiences: "Experiences", explore: "Explore", events: "Events", policies: "Policies", stay: "Your stay", checkout: "Checkout", confirmation: "Booking confirmed", "my-trip": "My trip", precheckin: "Online check-in" };

export function SeoTitle({ slug, name }: { slug: string; name: string }) {
  const doc = useSiteView(slug);
  const path = usePathname() ?? "";
  const tpl = doc?.seo?.titleTemplate ?? "";
  const desc = doc?.seo?.description ?? "";
  useEffect(() => {
    if (!tpl || tpl === `{{page}} — ${name}`) return;
    const seg = path.split(`/hotel/${slug}`)[1]?.split("/").filter(Boolean)[0] ?? "";
    document.title = tpl.replace(/\{\{page\}\}/g, NAMES[seg] ?? seg.replace(/-/g, " "));
  }, [tpl, path, slug, name]);
  useEffect(() => {
    if (!desc) return;
    let m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
    m.content = desc;
  }, [desc]);
  return null;
}
