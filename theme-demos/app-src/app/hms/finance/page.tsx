import { Suspense } from "react";
import { FinancePage } from "@/components/hms/finance/page";

export default function Page() {
  return <Suspense fallback={null}><FinancePage /></Suspense>;
}
