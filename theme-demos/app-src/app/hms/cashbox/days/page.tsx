import { Suspense } from "react";
import { DaysPage } from "@/components/hms/cashbox/pages";

export default function Page() {
  return <Suspense fallback={null}><DaysPage /></Suspense>;
}
