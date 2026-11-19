// Data adapter. Today: demo data. Later: BinGi HMS public API (see technology/data-contract.md).
import { azureBay, azureBayPaused } from "@/data/azure-bay";
import { seaPearl } from "@/data/sea-pearl";
import { teaValley } from "@/data/tea-valley";
import { mistwood } from "@/data/mistwood";
import { shalbon } from "@/data/shalbon";
import { lakeview } from "@/data/lakeview";
import { coralCove } from "@/data/coral-cove";
import { waveBunk } from "@/data/wave-bunk";
import { haorBilash } from "@/data/haor-bilash";
import { canopyNest } from "@/data/canopy-nest";
import { skypod } from "@/data/skypod";
import { altura } from "@/data/altura";
import { nilaIsland } from "@/data/nila-island";
import { SIGNATURE } from "@/data/signature";
import { bonolotaEstate } from "@/data/bonolota-estate";
import { meghchura } from "@/data/meghchura";
import { havenLalakhal } from "@/data/haven-lalakhal";
import { obsidianGulshan } from "@/data/obsidian-gulshan";
import { maisonGulshan } from "@/data/maison-gulshan";
import { shonaliRajbari } from "@/data/shonali-rajbari";
import type { Hotel } from "./types";

const HOTELS: Record<string, Hotel> = { [azureBay.slug]: azureBay, [seaPearl.slug]: seaPearl, [teaValley.slug]: teaValley, [mistwood.slug]: mistwood, [shalbon.slug]: shalbon, [lakeview.slug]: lakeview, [coralCove.slug]: coralCove, [waveBunk.slug]: waveBunk, [haorBilash.slug]: haorBilash, [canopyNest.slug]: canopyNest, [skypod.slug]: skypod, [altura.slug]: altura, [nilaIsland.slug]: nilaIsland, ...Object.fromEntries(SIGNATURE.map((h) => [h.slug, h])), [bonolotaEstate.slug]: bonolotaEstate, [meghchura.slug]: meghchura, [havenLalakhal.slug]: havenLalakhal, [obsidianGulshan.slug]: obsidianGulshan, [maisonGulshan.slug]: maisonGulshan, [shonaliRajbari.slug]: shonaliRajbari, [azureBayPaused.slug]: azureBayPaused };

export async function getHotel(slug: string): Promise<Hotel | null> {
  return HOTELS[slug] ?? null;
}

/** Hotels prerendered at build time. Paused sites render on request. */
export function listHotelSlugs(): string[] {
  return Object.values(HOTELS).filter((h) => h.status === "live").map((h) => h.slug);
}

export function formatMoney(v: number, currency = "BDT"): string {
  const n = new Intl.NumberFormat("en-IN").format(Math.round(v));
  return currency === "BDT" ? `৳${n}` : `${currency} ${n}`;
}

/** Plan → which master layout and modules the website may show. */
export const PLAN_RULES = {
  starter: { masters: ["nest", "cottage", "bunk"], restaurant: false, events: false },
  business: { masters: ["nest", "cottage", "bunk", "city", "villa", "flat", "escape"], restaurant: false, events: false },
  ultra: { masters: ["nest", "cottage", "bunk", "city", "villa", "flat", "escape", "grand"], restaurant: true, events: true },
  enterprise: { masters: ["nest", "cottage", "bunk", "city", "villa", "flat", "escape", "grand"], restaurant: true, events: true },
} as const;

/** Pages shown = allowed by the plan AND have data. Empty sections disappear from the nav automatically. */
export function availablePages(h: Hotel) {
  const rule = PLAN_RULES[h.plan];
  return {
    dining: rule.restaurant && h.outlets.length > 0,
    experiences: h.services.some((s) => s.photo),
    offers: h.offers.some((o) => o.kind === "discount" || h.flags.packages),
    events: rule.events && h.flags.events,
  };
}

export function visibleOffers(h: Hotel) {
  return h.offers.filter((o) => o.kind === "discount" || h.flags.packages);
}

/** Ratings shown only with 5+ real reviews. */
export function showRating(h: Hotel) {
  return h.reviewScore !== undefined && h.reviewCount >= 5;
}
