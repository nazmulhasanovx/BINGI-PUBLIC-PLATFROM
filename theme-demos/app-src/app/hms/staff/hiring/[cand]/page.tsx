import { Suspense } from "react";
import { CandidatePage } from "@/components/hms/staff/hiring";

async function Inner({ params }: { params: Promise<{ cand: string }> }) {
  const { cand } = await params;
  return <CandidatePage id={decodeURIComponent(cand)} />;
}

export function generateStaticParams() {
  return [{ cand: "CAND001" }, { cand: "CAND002" }, { cand: "CAND003" }];
}

export default function Page(props: PageProps<"/hms/staff/hiring/[cand]">) {
  return (
    <Suspense fallback={null}>
      <Inner params={props.params} />
    </Suspense>
  );
}
