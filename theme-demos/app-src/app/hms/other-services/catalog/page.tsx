import { Suspense } from "react";
import { CatalogPage } from "@/components/hms/services/pages";

export default function Page() {
  return <Suspense fallback={null}><CatalogPage /></Suspense>;
}
