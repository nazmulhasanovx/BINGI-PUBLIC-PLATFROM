import { Suspense } from "react";
import { CalendarPage } from "@/components/hms/bookings/calendar";

export default function Page() {
  return <Suspense><CalendarPage /></Suspense>;
}
