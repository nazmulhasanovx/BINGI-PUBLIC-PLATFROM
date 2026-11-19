import type { AnchorHTMLAttributes } from "react";
import { go } from "./router";

export default function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const internal = href.startsWith("/");
  return (
    <a
      {...rest}
      href={internal ? `#${href}` : href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (internal) {
          e.preventDefault();
          go(href);
        }
      }}
    />
  );
}
