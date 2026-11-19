import { Suspense } from "react";
import { AddPage } from "@/components/hms/rooms/wizard";

export default function Page() {
  return <Suspense fallback={null}><AddPage /></Suspense>;
}
