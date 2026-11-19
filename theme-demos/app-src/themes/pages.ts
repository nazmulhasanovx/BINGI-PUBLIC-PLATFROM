// Theme-owned inner pages (Luxury Collection v2). A theme can replace Rooms and Room detail with its own layout
// and add its own pages (e.g. ISLE → /island). Booking logic stays shared; only the layout changes.
import type { ComponentType } from "react";
import type { Hotel, MasterTheme, RoomCategory } from "@/lib/types";
import { IsleIsland, IsleRoom, IsleRooms } from "./isle/Pages";
import { ThemeRooms } from "./stay/lists";
import { ThemeRoom } from "./stay/details";
import { LUX_IDS, SIG_IDS } from "./paid";

/** Themes whose Rooms + Room pages come from src/themes/stay (ISLE keeps its own). */
export const STAY_IDS = [...LUX_IDS, ...SIG_IDS].filter((id) => id !== "isle");
import { CourtyardStory } from "./sig/courtyard";
import { AxisMeet } from "./sig/axis";
import { ResideLongStay } from "./sig/reside";
import { MorningBreakfast } from "./sig/morning";
import { MatirFarm } from "./sig/matir";

export const THEME_ROOMS: Partial<Record<MasterTheme, ComponentType<{ hotel: Hotel; master?: MasterTheme }>>> = { isle: IsleRooms, ...Object.fromEntries(STAY_IDS.map((id) => [id, ThemeRooms])) };
export const THEME_ROOM: Partial<Record<MasterTheme, ComponentType<{ hotel: Hotel; room: RoomCategory; master?: MasterTheme }>>> = { isle: IsleRoom, ...Object.fromEntries(STAY_IDS.map((id) => [id, ThemeRoom])) };
export const THEME_EXTRA: Partial<Record<MasterTheme, Record<string, { label: string; Page: ComponentType<{ hotel: Hotel }> }>>> = {
  isle: { island: { label: "The Island", Page: IsleIsland } },
  courtyard: { story: { label: "Our Story", Page: CourtyardStory } },
  axis: { meet: { label: "Meet", Page: AxisMeet } },
  reside: { "long-stay": { label: "Long Stay", Page: ResideLongStay } },
  morning: { breakfast: { label: "Breakfast", Page: MorningBreakfast } },
  matir: { farm: { label: "Our Farm", Page: MatirFarm } },
};
