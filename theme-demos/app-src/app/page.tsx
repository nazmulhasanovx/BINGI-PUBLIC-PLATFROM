import { redirect } from "next/navigation";

// Default: the HMS. Theme demo list lives at /themes.
export default function Root() {
  redirect("/hms/website/overview");
}
