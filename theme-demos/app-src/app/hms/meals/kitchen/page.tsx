import { Suspense } from "react";
import { KitchenPage } from "@/components/hms/meals/pages";

export default function Page() {
  return <Suspense fallback={null}><KitchenPage /></Suspense>;
}
