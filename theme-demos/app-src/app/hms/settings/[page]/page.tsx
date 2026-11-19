import { notFound } from "next/navigation";
import { SettingsModule } from "@/components/hms/settings/module";

const IDS = ["overview", "profile", "branding", "regional", "policies", "taxes", "housekeeping", "restaurant", "channels", "payments", "documents", "billing", "messages", "users", "security", "properties", "activity", "preferences"];
export function generateStaticParams() { return IDS.map((page) => ({ page })); }

export default async function SettingsPage(props: PageProps<"/hms/settings/[page]">) {
  const { page } = await props.params;
  if (!IDS.includes(page)) notFound();
  return <SettingsModule page={page} />;
}
