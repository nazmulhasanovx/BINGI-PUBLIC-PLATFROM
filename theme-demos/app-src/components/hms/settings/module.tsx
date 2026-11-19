"use client";
import { useState, type ComponentType } from "react";
import { useProperty } from "../property";
import { useSettings } from "@/lib/settings/store";
import { Toast } from "../bookings/ui";
import { SettingsNav, SettingsPhoneNav } from "./frame";
import * as P from "./pages";

const PAGES: Record<string, ComponentType> = {
  overview: P.OverviewPage, profile: P.ProfilePage, branding: P.BrandingPage, regional: P.RegionalPage,
  policies: P.PoliciesPage, taxes: P.TaxesPage, housekeeping: P.HousekeepingRulesPage, restaurant: P.RestaurantPage,
  channels: P.ChannelsPage, payments: P.PaymentsPage, documents: P.DocumentsPage, billing: P.BillingPage,
  messages: P.MessagesPage, users: P.UsersPage, security: P.SecurityPage, properties: P.PropertiesPage,
  activity: P.ActivityPage, preferences: P.PreferencesPage,
};
export const SETTINGS_PAGE_IDS = Object.keys(PAGES);

export function SettingsModule({ page }: { page: string }) {
  const h = useProperty();
  const { st, save } = useSettings(h);
  const [toast, setToast] = useState("");
  const say = (t: string) => { setToast(t); window.setTimeout(() => setToast(""), 2400); };
  const Page = PAGES[page] ?? P.OverviewPage;
  return (
    <P.SCtx.Provider value={{ h, s: st, save, toast: say }}>
      <div className="flex h-full min-h-0">
        <SettingsNav active={page} />
        <div className="flex min-w-0 flex-1 flex-col">
          <SettingsPhoneNav active={page} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div key={`${page}-${h.slug}`} className="hms-page hms-page-in max-w-[1180px]"><Page /></div>
          </div>
        </div>
      </div>
      {toast && <Toast text={toast} />}
    </P.SCtx.Provider>
  );
}
