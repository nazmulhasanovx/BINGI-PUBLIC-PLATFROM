import { Suspense } from "react";
import { CashSettingsPage } from "@/components/hms/cashbox/pages";

export default function Page() {
  return <Suspense fallback={null}><CashSettingsPage /></Suspense>;
}
