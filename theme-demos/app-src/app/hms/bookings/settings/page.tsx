import { redirect } from "next/navigation";

/** Booking policies have one home: Settings › Booking policies. */
export default function Page() {
  redirect("/hms/settings/policies");
}
