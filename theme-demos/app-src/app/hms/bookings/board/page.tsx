import { Suspense } from "react";
import { BoardPage } from "@/components/hms/bookings/board";

export default function Page() {
  return <Suspense><BoardPage /></Suspense>;
}
