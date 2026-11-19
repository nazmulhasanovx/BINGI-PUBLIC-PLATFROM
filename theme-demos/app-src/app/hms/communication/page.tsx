import { Suspense } from "react";
import { CommunicationPage } from "@/components/hms/communication/page";

export default function Page() {
  return <Suspense fallback={null}><CommunicationPage /></Suspense>;
}
