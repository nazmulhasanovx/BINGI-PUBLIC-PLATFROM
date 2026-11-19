// Master themes: one Home layout per master; every other page is shared.
// Add a theme: create src/themes/<name>/Home.tsx, register it here, add a manifest entry (themes/manifest.ts),
// a demo property (src/data) and allow it in PLAN_RULES (lib/data.ts).
import type { ComponentType } from "react";
import type { Hotel, MasterTheme } from "@/lib/types";
import { GrandHome } from "./grand/Home";
import { CityHome } from "./city/Home";
import { NestHome } from "./nest/Home";
import { CottageHome } from "./cottage/Home";
import { VillaHome } from "./villa/Home";
import { FlatHome } from "./flat/Home";
import { EscapeHome } from "./escape/Home";
import { BunkHome } from "./bunk/Home";
import { DriftHome } from "./drift/Home";
import { CanopyHome } from "./canopy/Home";
import { PodHome } from "./pod/Home";
import { OrbitHome } from "./orbit/Home";
import { IsleHome } from "./isle/Home";
import { SIG_HOMES } from "./sig/homes";
import { EstateHome } from "./estate/Home";
import { SummitHome } from "./summit/Home";
import { HavenHome } from "./haven/Home";
import { NoirHome } from "./noir/Home";
import { MaisonHome } from "./maison/Home";
import { ZamindarHome } from "./zamindar/Home";

export const THEME_HOMES: Record<MasterTheme, ComponentType<{ hotel: Hotel }>> = {
  grand: GrandHome,
  city: CityHome,
  nest: NestHome,
  cottage: CottageHome,
  villa: VillaHome,
  flat: FlatHome,
  escape: EscapeHome,
  bunk: BunkHome,
  drift: DriftHome,
  canopy: CanopyHome,
  pod: PodHome,
  orbit: OrbitHome,
  isle: IsleHome,
  ...SIG_HOMES,
  estate: EstateHome,
  summit: SummitHome,
  haven: HavenHome,
  noir: NoirHome,
  maison: MaisonHome,
  zamindar: ZamindarHome,
};

export const MASTERS: { id: MasterTheme; name: string; plan: string; demo?: string }[] = [
  { id: "nest", name: "NEST", plan: "Starter", demo: "tea-valley" },
  { id: "cottage", name: "COTTAGE", plan: "Starter", demo: "mistwood" },
  { id: "bunk", name: "BUNK", plan: "Starter", demo: "wave-bunk" },
  { id: "city", name: "CITY", plan: "Business", demo: "sea-pearl" },
  { id: "villa", name: "VILLA", plan: "Business", demo: "shalbon" },
  { id: "flat", name: "FLAT", plan: "Business", demo: "lakeview" },
  { id: "escape", name: "ESCAPE", plan: "Business", demo: "coral-cove" },
  { id: "grand", name: "GRAND", plan: "Ultra", demo: "azure-bay" },
];

/** Paid themes (Theme Store) with their demo properties. */
export const PAID_MASTERS: { id: MasterTheme; name: string; plan: string; demo?: string }[] = [
  { id: "drift", name: "DRIFT", plan: "Paid", demo: "haor-bilash" },
  { id: "canopy", name: "CANOPY", plan: "Paid", demo: "canopy-nest" },
  { id: "pod", name: "POD", plan: "Paid", demo: "skypod" },
  { id: "orbit", name: "ORBIT", plan: "Paid", demo: "altura" },
  { id: "isle", name: "ISLE", plan: "Luxury", demo: "nila-island" },
  { id: "aurel", name: "AUREL", plan: "Signature", demo: "aurel-banani" },
  { id: "courtyard", name: "COURTYARD", plan: "Signature", demo: "the-courtyard" },
  { id: "axis", name: "AXIS", plan: "Signature", demo: "axis-gulshan" },
  { id: "waypoint", name: "WAYPOINT", plan: "Signature", demo: "waypoint-inn" },
  { id: "shanti", name: "SHANTI", plan: "Signature", demo: "shanti-guest-house" },
  { id: "reside", name: "RESIDE", plan: "Signature", demo: "haven-residences" },
  { id: "commons", name: "COMMONS", plan: "Signature", demo: "common-ground" },
  { id: "roots", name: "ROOTS", plan: "Signature", demo: "roots-homestay" },
  { id: "morning", name: "MORNING", plan: "Signature", demo: "morning-house" },
  { id: "matir", name: "MATIR", plan: "Signature", demo: "matir-farm" },
  { id: "estate", name: "ESTATE", plan: "Luxury", demo: "bonolota-estate" },
  { id: "summit", name: "SUMMIT", plan: "Luxury", demo: "meghchura" },
  { id: "haven", name: "HAVEN", plan: "Luxury", demo: "haven-lalakhal" },
  { id: "noir", name: "NOIR", plan: "Luxury", demo: "obsidian-gulshan" },
  { id: "maison", name: "MAISON", plan: "Luxury", demo: "maison-gulshan" },
  { id: "zamindar", name: "ZAMINDAR", plan: "Luxury", demo: "shonali-rajbari" },
];
