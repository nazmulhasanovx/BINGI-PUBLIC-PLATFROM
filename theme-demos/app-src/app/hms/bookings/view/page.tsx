import { Suspense } from "react";
import { ManageBookingPage } from "@/components/hms/bookings/manage";

export default function Page() {
  return <Suspense><ManageBookingPage /></Suspense>;
}
