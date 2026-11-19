// Category presets — chosen automatically from the property type set in onboarding.
// They change labels and which special sections a theme shows; the engine and data stay the same.
// Status: labels in use; special sections (zone map, dorm beds, single-page home) — planned.
import type { PropertyType } from "./types";

export interface Preset {
  place: string; // "resort", "hotel"… used in sentences
  placeTitle: string; // "Resort", "Hotel"…
  unitsLabel: string; // what the rooms are called
  sections: { zoneMap?: boolean; villaDetails?: boolean; bedPricing?: boolean; host?: boolean; singlePage?: boolean; meetings?: boolean; longStay?: boolean };
}

export const PRESETS: Record<PropertyType, Preset> = {
  hotel: { place: "hotel", placeTitle: "Hotel", unitsLabel: "Rooms", sections: { meetings: true } },
  resort: { place: "resort", placeTitle: "Resort", unitsLabel: "Rooms & villas", sections: { zoneMap: true, villaDetails: true } },
  "guest-house": { place: "guest house", placeTitle: "Guest house", unitsLabel: "Rooms", sections: { host: true } },
  home: { place: "home", placeTitle: "Home", unitsLabel: "The home", sections: { host: true, singlePage: true } },
  "serviced-apartment": { place: "apartments", placeTitle: "Serviced apartments", unitsLabel: "Apartments", sections: { longStay: true } },
  hostel: { place: "hostel", placeTitle: "Hostel", unitsLabel: "Beds & dorms", sections: { bedPricing: true } },
  cottage: { place: "cottages", placeTitle: "Cottages", unitsLabel: "Cottages", sections: { host: true } },
  villa: { place: "villas", placeTitle: "Villas", unitsLabel: "Villas", sections: { villaDetails: true } },
  other: { place: "property", placeTitle: "Property", unitsLabel: "Places to stay", sections: {} },
};

export function presetFor(t: PropertyType): Preset {
  return PRESETS[t] ?? PRESETS.other;
}
