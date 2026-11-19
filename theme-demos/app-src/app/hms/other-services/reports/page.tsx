import { Suspense } from "react";
import { ReportsPage } from "@/components/hms/services/pages";

export default function Page() {
  return <Suspense fallback={null}><ReportsPage /></Suspense>;
}
