// Signature Collection — Home component per theme (designs 01, 03–10, 12 from Nazmul, 2026-11-10).
import type { ComponentType } from "react";
import type { Hotel, SigTheme } from "@/lib/types";
import { AurelHome } from "./aurel";
import { CourtyardHome } from "./courtyard";
import { AxisHome } from "./axis";
import { WaypointHome } from "./waypoint";
import { ShantiHome } from "./shanti";
import { ResideHome } from "./reside";
import { CommonsHome } from "./commons";
import { RootsHome } from "./roots";
import { MorningHome } from "./morning";
import { MatirHome } from "./matir";

export const SIG_HOMES: Record<SigTheme, ComponentType<{ hotel: Hotel }>> = {
  aurel: AurelHome, courtyard: CourtyardHome, axis: AxisHome, waypoint: WaypointHome, shanti: ShantiHome,
  reside: ResideHome, commons: CommonsHome, roots: RootsHome, morning: MorningHome, matir: MatirHome,
};
