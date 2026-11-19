"use client";

import clsx from "clsx";

export function Chips<T extends string>({ items, value, onChange, label }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label={label}>
      {items.map((k) => (
        <button
          key={k.id}
          role="tab"
          aria-selected={value === k.id}
          onClick={() => onChange(k.id)}
          className={clsx(
            "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
            value === k.id ? "border-action bg-action text-on-action" : "border-line bg-surface text-ink hover:border-brand-ring",
          )}
        >
          {k.label}
        </button>
      ))}
    </div>
  );
}
