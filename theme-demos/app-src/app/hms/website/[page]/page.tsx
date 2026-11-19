import { notFound } from "next/navigation";
import { WM_PAGES } from "@/components/hms/website/pages";
import { WebsiteModule } from "@/components/hms/website/WebsiteModule";

export function generateStaticParams() {
  return WM_PAGES.map((p) => ({ page: p.id }));
}

export default async function WebsitePage(props: PageProps<"/hms/website/[page]">) {
  const { page } = await props.params;
  if (!WM_PAGES.some((p) => p.id === page)) notFound();
  return <WebsiteModule page={page} />;
}
