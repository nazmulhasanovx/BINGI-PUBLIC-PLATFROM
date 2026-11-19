import { Suspense } from "react";
import { HousekeepingPage } from "@/components/hms/housekeeping/page";

export default function Page() {
  return <Suspense fallback={null}><HousekeepingPage /></Suspense>;
}
