import { redirect } from "next/navigation";

/** One bookings table now (live HMS structure) — it lives at /hms/bookings. */
export default function Page() {
  redirect("/hms/bookings");
}
