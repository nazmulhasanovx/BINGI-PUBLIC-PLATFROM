import { Suspense } from "react";
import { WaitlistPage } from "@/components/hms/bookings/waitlist";

export default function Page() {
  return <Suspense><WaitlistPage /></Suspense>;
}
