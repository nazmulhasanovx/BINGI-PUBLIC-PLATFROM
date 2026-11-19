// One home for "which plan includes what". Mirrors the public pricing compare table
// (bingi-public-platfrom/website/src/data/pricing.ts, approved 11 Nov 2026). Change it here only.
import { PLAN_LABEL, planAllows } from "@/themes/manifest";
import type { Hotel } from "./types";

export type Feature =
  | "housekeeping" | "restaurant" | "restaurantFull" | "qrOrdering" | "expenses" | "services"
  | "hrm" | "inventory" | "diningPage";

/** Lowest plan that includes the feature. Restaurant is "Limited" on Business (one outlet) and full on Ultra. */
export const MIN_PLAN: Record<Feature, Hotel["plan"]> = {
  housekeeping: "business", restaurant: "business", restaurantFull: "ultra", qrOrdering: "business",
  expenses: "business", services: "business", hrm: "ultra", inventory: "ultra", diningPage: "ultra",
};

export const can = (h: Pick<Hotel, "plan">, f: Feature) => planAllows(h.plan, MIN_PLAN[f]);
export const minPlanLabel = (f: Feature) => PLAN_LABEL[MIN_PLAN[f]];
export const planLabel = (h: Pick<Hotel, "plan">) => PLAN_LABEL[h.plan];
/** Where every "see plan / upgrade" link goes (subscription lives in Settings › Billing). */
export const BILLING_HREF = "/hms/settings/billing";
