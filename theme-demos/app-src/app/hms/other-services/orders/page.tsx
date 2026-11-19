import { Suspense } from "react";
import { OrdersPage } from "@/components/hms/services/pages";

export default function Page() {
  return <Suspense fallback={null}><OrdersPage /></Suspense>;
}
