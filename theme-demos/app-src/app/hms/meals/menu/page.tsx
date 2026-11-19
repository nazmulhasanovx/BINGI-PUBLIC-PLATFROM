import { Suspense } from "react";
import { MenuPage } from "@/components/hms/meals/setup";

export default function Page() {
  return <Suspense fallback={null}><MenuPage /></Suspense>;
}
