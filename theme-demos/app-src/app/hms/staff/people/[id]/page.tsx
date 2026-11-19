import { Suspense } from "react";
import { EmployeePage } from "@/components/hms/staff/people";

async function Inner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeePage id={decodeURIComponent(id)} />;
}

export function generateStaticParams() {
  return [{ id: "EMP001" }, { id: "EMP002" }, { id: "EMP003" }, { id: "EMP004" }, { id: "EMP005" }, { id: "EMP006" }, { id: "EMP007" }, { id: "EMP008" }, { id: "EMP009" }, { id: "EMP010" }, { id: "EMP011" }, { id: "EMP012" }, { id: "EMP013" }, { id: "EMP014" }, { id: "EMP015" }, { id: "EMP016" }, { id: "EMP017" }, { id: "EMP018" }, { id: "EMP019" }, { id: "EMP020" }, { id: "EMP021" }, { id: "EMP022" }, { id: "EMP023" }, { id: "EMP024" }];
}

export default function Page(props: PageProps<"/hms/staff/people/[id]">) {
  return (
    <Suspense fallback={null}>
      <Inner params={props.params} />
    </Suspense>
  );
}
