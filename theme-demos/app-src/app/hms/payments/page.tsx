import { Suspense } from "react";
import { PaymentsPage } from "@/components/hms/payments/page";

export default function Page() {
  return <Suspense fallback={null}><PaymentsPage /></Suspense>;
}
