import { Suspense } from "react";
import { CategoriesPage } from "@/components/hms/services/pages";

export default function Page() {
  return <Suspense fallback={null}><CategoriesPage /></Suspense>;
}
