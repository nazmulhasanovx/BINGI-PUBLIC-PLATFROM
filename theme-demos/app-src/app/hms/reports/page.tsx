import { Suspense } from "react";
import { ReportsWorkspace } from "@/components/hms/reports/page";

export default function Page() {
  return <Suspense fallback={null}><ReportsWorkspace /></Suspense>;
}
