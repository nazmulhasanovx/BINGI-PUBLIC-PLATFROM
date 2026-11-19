// Shared defaults for the fictional Luxury Collection demo properties (5★–7★). Demo only.
import type { Hotel } from "@/lib/types";

type Base = Pick<Hotel, "policies" | "payments" | "taxes" | "social" | "flags" | "status" | "currency" | "country" | "menu" | "promoCodes">;

export function luxBase(code: string, phoneDigits: string): Base {
  return {
    currency: "BDT",
    country: "Bangladesh",
    menu: [],
    promoCodes: [{ code, percent: 10, label: `${code} 10%` }],
    policies: {
      cancellation: "Free cancellation up to 7 days before arrival.",
      children: "Children under 6 stay free in their parents' room.",
      pets: "Pets are not allowed.",
      tax: "10% service charge and 15% VAT are added at checkout.",
    },
    payments: [
      { kind: "pay-at-property" },
      { kind: "mfs-manual", provider: "bKash", number: phoneDigits },
      { kind: "advance", percent: 30 },
      { kind: "card-online", gatewayApproved: false },
    ],
    taxes: { vatPercent: 15, serviceChargePercent: 10, inclusive: false },
    social: { facebook: "#", instagram: "#" },
    flags: { packages: false, events: false },
    status: "live",
  };
}
