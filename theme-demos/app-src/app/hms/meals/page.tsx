import { Suspense } from "react";
import { OverviewPage } from "@/components/hms/meals/pages";

export default function Page() {
  return <Suspense fallback={null}><OverviewPage /></Suspense>;
}
