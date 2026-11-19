import { Suspense } from "react";
import { TodayPage } from "@/components/hms/services/pages";

export default function Page() {
  return <Suspense fallback={null}><TodayPage /></Suspense>;
}
