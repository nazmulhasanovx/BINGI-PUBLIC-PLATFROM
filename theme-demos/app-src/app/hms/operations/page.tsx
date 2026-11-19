import { Suspense } from "react";
import { ExpensesPage } from "@/components/hms/expenses/page";

export default function Page() {
  return <Suspense fallback={null}><ExpensesPage /></Suspense>;
}
