import type { CSSProperties, ReactNode } from "react";
import { tokensFor, type ThemeId } from "@/lib/theme";
import type { MasterTheme } from "@/lib/types";

/** Applies a hotel's colour theme to everything inside it (server-rendered, no flash). */
export function ThemeScope({
  themeId,
  heading,
  master = "grand",
  children,
}: {
  master?: MasterTheme;
  themeId: ThemeId;
  heading: "sans" | "serif";
  children: ReactNode;
}) {
  return (
    <div id="hotel-theme" data-theme={themeId} data-heading={heading} data-master={master} style={tokensFor(themeId) as CSSProperties}>
      {children}
    </div>
  );
}
