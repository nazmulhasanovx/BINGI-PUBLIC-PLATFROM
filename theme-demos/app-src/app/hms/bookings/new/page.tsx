import { Suspense } from "react";
import { NewBookingPage } from "@/components/hms/bookings/new";

export default function Page() {
  return <Suspense><NewBookingPage /></Suspense>;
}
