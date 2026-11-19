import type { Metadata } from "next";
import { HmsShell } from "@/components/hms/Shell";

export const metadata: Metadata = { title: "BinGi HMS — Website Management (prototype)", robots: { index: false } };

export default function HmsLayout({ children }: LayoutProps<"/hms">) {
  return <HmsShell>{children}</HmsShell>;
}
