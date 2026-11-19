import { Suspense } from "react";
import { DiscountsPage } from "@/components/hms/rates/pages";

export default function Page() {
  return <Suspense fallback={null}><DiscountsPage /></Suspense>;
}
