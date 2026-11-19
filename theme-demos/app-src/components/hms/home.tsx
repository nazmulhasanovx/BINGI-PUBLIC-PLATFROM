"use client";
import { useSyncExternalStore } from "react";
import { useDraftFor } from "@/lib/onboarding/store";
import { Dashboard } from "./dashboard";
import { useProperty } from "./property";
import { SetupDashboard } from "./setup-dashboard";

const noop = () => () => {};
/** Onboarding properties (not approved yet) get the setup dashboard; operating properties get the full dashboard. */
export function HmsHomeSwitch() {
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const h = useProperty();
  const d = useDraftFor(h.slug);
  if (ready && d && d.status !== "draft") return <SetupDashboard d={d} />;
  // Greeting and dates use the visitor's clock, so the dashboard renders on the client only.
  if (!ready) return <p className="p-6 text-[14px] text-hms-muted" role="status">Loading dashboard…</p>;
  return <Dashboard />;
}
