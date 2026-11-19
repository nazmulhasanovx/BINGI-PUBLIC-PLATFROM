import { useMemo } from "react";
import { go, split, useRoute } from "./router";

export class NotFoundError extends Error {}
export function notFound(): never {
  throw new NotFoundError("not found");
}
export function useRouter() {
  return {
    push: (p: string) => go(p),
    replace: (p: string) => go(p, true),
    back: () => history.back(),
    refresh: () => {},
    prefetch: () => {},
  };
}
export function usePathname() {
  return split(useRoute()).path;
}
export function useSearchParams() {
  const q = split(useRoute()).query;
  return useMemo(() => new URLSearchParams(q), [q]);
}
export function useParams<T = Record<string, string>>(): T {
  const p = split(useRoute()).path.split("/");
  return { slug: p[2] ?? "" } as T;
}

export function redirect(path: string): never {
  location.replace(`#${path}`);
  throw new NotFoundError("redirect");
}
