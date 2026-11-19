import { Suspense } from "react";
import { SetupPage } from "@/components/hms/services/pages";

export default function Page() {
  return <Suspense fallback={null}><SetupPage /></Suspense>;
}
