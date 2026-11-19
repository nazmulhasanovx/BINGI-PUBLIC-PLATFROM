import { Suspense } from "react";
import { ReportsPage } from "@/components/hms/meals/pages";

export default function Page() {
  return <Suspense fallback={null}><ReportsPage /></Suspense>;
}
