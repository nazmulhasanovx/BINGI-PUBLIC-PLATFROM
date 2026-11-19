import type { ReactNode } from "react";

/** Soft page transition between routes. Pure CSS (no JS wait) so the first paint is never delayed. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>;
}
