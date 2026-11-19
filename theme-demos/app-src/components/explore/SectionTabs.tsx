"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

/** Sticky in-page tabs that follow the scroll (Explore page). */
export function SectionTabs({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="sticky top-[var(--header-h)] z-30 border-b border-line bg-surface/90 backdrop-blur-xl">
      <ul className="no-scrollbar mx-auto flex max-w-[1240px] gap-1 overflow-x-auto px-4 sm:px-6">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "true" : undefined}
              className={clsx(
                "relative flex h-12 items-center whitespace-nowrap px-3 text-[15px] font-semibold transition-colors",
                active === i.id ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {i.label}
              {active === i.id && <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-brand" />}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
