import { Suspense } from "react";
import { TablesPage } from "@/components/hms/meals/setup";

export default function Page() {
  return <Suspense fallback={null}><TablesPage /></Suspense>;
}
