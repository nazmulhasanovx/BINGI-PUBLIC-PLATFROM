import { Suspense } from "react";
import { PayrollRunPage } from "@/components/hms/staff/payroll";

async function Inner({ params }: { params: Promise<{ run: string }> }) {
  const { run } = await params;
  return <PayrollRunPage id={decodeURIComponent(run)} />;
}

export function generateStaticParams() {
  return [{ run: "2026-10" }];
}

export default function Page(props: PageProps<"/hms/staff/payroll/[run]">) {
  return (
    <Suspense fallback={null}>
      <Inner params={props.params} />
    </Suspense>
  );
}
