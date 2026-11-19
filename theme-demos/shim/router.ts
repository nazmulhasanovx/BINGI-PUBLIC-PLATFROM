// Tiny hash router so the Next.js app runs as one self-contained page.
import { useSyncExternalStore } from "react";

export function currentRoute(): string {
  const h = typeof location !== "undefined" ? location.hash : "";
  return h.startsWith("#/") ? h.slice(1) : "/themes";
}
function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
export function useRoute() {
  return useSyncExternalStore(subscribe, currentRoute, () => "/themes");
}
export function go(path: string, replace = false) {
  // plain hash navigation: works inside sandboxed frames (no pushState needed)
  if (replace) location.replace(`#${path}`);
  else {
    location.hash = path;
    const l = (window as unknown as { __lenis?: { scrollTo: (t: number, o: object) => void } }).__lenis;
    if (l) l.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }
}
export function split(route: string) {
  const [path, query = ""] = route.split("?");
  return { path: path.replace(/\/+$/, "") || "/", query };
}
