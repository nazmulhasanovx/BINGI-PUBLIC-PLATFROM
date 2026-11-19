import { Suspense } from "react";
import { MovementsPage } from "@/components/hms/cashbox/pages";

export default function Page() {
  return <Suspense fallback={null}><MovementsPage /></Suspense>;
}
