import type { Metadata } from "next";

export const metadata: Metadata = { title: "BinGi — Set up your property (prototype)", robots: { index: false } };

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
