import { Suspense } from "react";
import { GuestProfilePage } from "@/components/hms/guests/profile";
import { DEMO_GUESTS } from "@/lib/bookings/demo";

async function Inner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GuestProfilePage id={decodeURIComponent(id)} />;
}

export function generateStaticParams() {
  return DEMO_GUESTS.map((g) => ({ id: g.id }));
}

export default function Page(props: PageProps<"/hms/guests/[id]">) {
  return (
    <Suspense fallback={null}>
      <Inner params={props.params} />
    </Suspense>
  );
}
