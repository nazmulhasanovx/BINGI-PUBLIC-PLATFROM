import { Suspense } from "react";
import { MealsCashboxPage } from "@/components/hms/cashbox/pages";

export default function Page() {
  return <Suspense fallback={null}><MealsCashboxPage /></Suspense>;
}
