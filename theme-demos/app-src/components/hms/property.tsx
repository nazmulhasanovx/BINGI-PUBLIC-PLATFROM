"use client";
// Which property the HMS is showing. Prototype: the demo hotels; production: the logged-in user's properties.
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { Hotel } from "@/lib/types";
import { azureBay } from "@/data/azure-bay";
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
import { useSubmittedHotels } from "@/lib/onboarding/store";

export const PROPERTIES: Hotel[] = [azureBay, seaPearl, teaValley, mistwood, shalbon, lakeview, coralCove, waveBunk, haorBilash, canopyNest, skypod, altura];
const KEY = "hms-property";
const listeners = new Set<() => void>();
const sub = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));
const read = () => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};
export function setProperty(slug: string) {
  try {
    localStorage.setItem(KEY, slug);
  } catch {}
  listeners.forEach((l) => l());
}

const Ctx = createContext<Hotel>(PROPERTIES[0]);
export function PropertyProvider({ children }: { children: ReactNode }) {
  const slug = useSyncExternalStore(sub, read, () => "");
  const mine = useSubmittedHotels();
  const hotel = mine.find((p) => p.slug === slug) ?? PROPERTIES.find((p) => p.slug === slug) ?? PROPERTIES[0];
  return <Ctx.Provider value={hotel}>{children}</Ctx.Provider>;
}
export const useProperty = () => useContext(Ctx);
/** Onboarding runs the Rooms screens on the property being set up. */
export function PropertyOverride({ hotel, children }: { hotel: Hotel; children: ReactNode }) {
  return <Ctx.Provider value={hotel}>{children}</Ctx.Provider>;
}
