import { Suspense } from "react";
import { TodayPage } from "@/components/hms/bookings/today";

export default function Page() {
  return <Suspense><TodayPage /></Suspense>;
}
