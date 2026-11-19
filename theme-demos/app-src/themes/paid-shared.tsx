// Shared bits for the paid themes (DRIFT, CANOPY, POD, ORBIT).
import { Bath, Briefcase, Car, Clock, Coffee, Dumbbell, Flame, Leaf, Lock, Plane, Plug, Sailboat, ShieldCheck, Sparkles, Sun, Utensils, Waves, Wifi } from "lucide-react";
import type { ReactNode } from "react";
import { T } from "@/lib/i18n";

export const FAC_ICON: Record<string, typeof Wifi> = {
  sun: Sun, utensils: Utensils, shield: ShieldCheck, plug: Plug, bath: Bath, boat: Sailboat, leaf: Leaf, flame: Flame, wifi: Wifi,
  clock: Clock, lock: Lock, coffee: Coffee, plane: Plane, waves: Waves, briefcase: Briefcase, dumbbell: Dumbbell, car: Car,
};
export const facIcon = (k: string) => FAC_ICON[k] ?? Sparkles;

/** Label + heading used by the paid themes (each passes its own look). */
export function Eyebrow({ children, className }: { children: string; className?: string }) {
  return <p className={className}><T>{children}</T></p>;
}

export function Illustration({ children }: { children: ReactNode }) {
  return <p className="mt-3 flex items-center gap-1.5 text-[12.5px] opacity-75"><Sparkles className="size-3.5" aria-hidden /> {children}</p>;
}
