import { Suspense } from "react";
import { RatesPage } from "@/components/hms/rates/pages";

export default function Page() {
  return <Suspense fallback={null}><RatesPage /></Suspense>;
}
