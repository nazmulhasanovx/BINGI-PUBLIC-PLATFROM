// Links that are not next/link (iframes, plain <a target=_blank>) must also work in the
// single-file preview build, which runs on a hash router (window.__BINGI_SPA__).
const isSpa = () => typeof window !== "undefined" && !!(window as unknown as { __BINGI_SPA__?: boolean }).__BINGI_SPA__;

export function hrefFor(path: string): string {
  return isSpa() ? `${window.location.pathname}#${path}` : path;
}

/** Query string of the current page (hash part in the preview build). */
export function currentSearch(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  if (isSpa()) return new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  return new URLSearchParams(window.location.search);
}
