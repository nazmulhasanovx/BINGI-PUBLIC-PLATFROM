import { Suspense } from "react";
import { PosPage } from "@/components/hms/meals/pos";

export default function Page() {
  return <Suspense fallback={null}><PosPage /></Suspense>;
}
