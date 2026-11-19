import { Suspense } from "react";
import { NewsPage } from "@/components/hms/news";

export default function Page() {
  return <Suspense fallback={null}><NewsPage /></Suspense>;
}
