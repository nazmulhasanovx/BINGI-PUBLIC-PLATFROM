import { Suspense } from "react";
import { SettingsPage } from "@/components/hms/meals/pages";

export default function Page() {
  return <Suspense fallback={null}><SettingsPage /></Suspense>;
}
