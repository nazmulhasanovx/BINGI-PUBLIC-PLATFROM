"use client";
import { can } from "@/lib/plan";
import { PlanGate } from "../plan-gate";
// Restaurant & Bar frame — same tabs as the live HMS Meal Management (Counter is folded into Orders/Overview
// as "Needs approval"), plus Cashbox. No data imports here, so Cashbox pages can use it without a cycle.
import Link from "next/link";
import clsx from "clsx";
import { useSyncExternalStore, type ReactNode } from "react";
import { CircleCheck, Plus } from "lucide-react";
import { useProperty } from "../property";
import { btnPrimary } from "../guests/ui";

export type MealsTab = "overview" | "pos" | "orders" | "kitchen" | "menu" | "tables" | "reports" | "cashbox" | "settings";
export const MEALS_TABS: [MealsTab, string, string][] = [
  ["overview", "Overview", "/hms/meals"], ["pos", "POS", "/hms/meals/pos"], ["orders", "Orders", "/hms/meals/orders"], ["kitchen", "Kitchen", "/hms/meals/kitchen"],
  ["menu", "Menu", "/hms/meals/menu"], ["tables", "Tables & QR", "/hms/meals/tables"], ["reports", "Reports", "/hms/meals/reports"],
  ["cashbox", "Cashbox", "/hms/meals/cashbox"], ["settings", "Settings", "/hms/meals/settings"],
];

// selected outlet (only shown when the property has more than one restaurant / bar)
const OKEY = "bingi-meals-outlet";
const subs = new Set<() => void>();
export function useOutlet(outlets: string[]) {
  const v = useSyncExternalStore((f) => (subs.add(f), () => void subs.delete(f)), () => { try { return localStorage.getItem(OKEY) ?? ""; } catch { return ""; } }, () => "");
  const cur = outlets.includes(v) ? v : outlets[0] ?? "Restaurant";
  return [cur, (o: string) => { try { localStorage.setItem(OKEY, o); } catch {} subs.forEach((f) => f()); }] as const;
}

export function MealsFrame({ tab, children, toast, outlets = [], wide, sub }: { tab: MealsTab; children: ReactNode; toast?: string; outlets?: string[]; wide?: boolean; sub?: string }) {
  const h = useProperty();
  // Business = Restaurant "Limited" (one outlet); Ultra = full (several restaurants / bars).
  if (!can(h, "restaurantFull")) outlets = outlets.slice(0, 1);
  const [outlet, setOutlet] = useOutlet(outlets);
  if (!can(h, "restaurant")) return <PlanGate h={h} f="restaurant" title="Restaurant & Bar" text="Take restaurant orders, run the kitchen screen and QR menus, and charge meals to the guest's room." />;
  return (
    <div className="h-full overflow-y-auto"><div className={"hms-page"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold tracking-[-0.01em]">Restaurant &amp; Bar</h1>
          <p className="text-[14.5px] text-hms-muted">{sub ?? `${h.name} · ${outlet}`}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {outlets.length > 1 && <select aria-label="Outlet" value={outlet} onChange={(e) => setOutlet(e.target.value)} className="h-10 rounded-lg border border-hms-line bg-white px-3 text-[14px]">{outlets.map((o) => <option key={o}>{o}</option>)}</select>}
          {tab !== "pos" && <Link href="/hms/meals/pos" className={clsx(btnPrimary, "h-10")}><Plus className="size-4" aria-hidden /><span className="hidden sm:inline">New order</span><span className="sm:hidden">New</span></Link>}
        </div>
      </div>
      <nav aria-label="Restaurant & Bar sections" className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-hms-line">
        {MEALS_TABS.map(([id, l, href]) => (
          <Link key={id} href={href} aria-current={tab === id ? "page" : undefined} className={clsx("-mb-px shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-[14.5px] font-semibold", tab === id ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}>{l}</Link>
        ))}
      </nav>
      <div key={tab} className="hms-page-in mt-5">{children}</div>
    </div>
    {toast && <div role="status" className="hms-up fixed bottom-6 left-1/2 z-[95] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0f1720] px-4 py-2.5 text-[14px] font-medium text-white shadow-lg"><CircleCheck className="size-4 shrink-0 text-[#7ee2a8]" />{toast}</div>}
    </div>
  );
}
