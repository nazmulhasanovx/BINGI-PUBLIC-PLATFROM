"use client";
// HRM UI kit — matches design-ref/hrm (Team & HR screens).
import clsx from "clsx";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, X } from "lucide-react";
import { initials } from "@/lib/hrm/store";

export const RED = "btn-glow text-white";

export function Btn({ children, kind = "outline", className, ...rest }: { kind?: "primary" | "outline" | "ghost" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-[14.5px] font-medium transition-[background,transform,opacity] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
        kind === "primary" && RED,
        kind === "outline" && "border border-[#d3d8df] bg-white hover:bg-[#f4f6f8]",
        kind === "ghost" && "hover:bg-[#e9edf2]",
        kind === "danger" && "border border-[#f3c4c0] bg-white text-[#b11c29] hover:bg-[#ffe7e4]",
        className,
      )}
    >
      {children}
    </button>
  );
}

const TONES = {
  green: "bg-[#e7f6ec] text-[#1c7d45]",
  red: "bg-[#fde5e4] text-[#b11c29]",
  gray: "bg-[#e9edf2] text-[#4d5664]",
  blue: "bg-[#e6efff] text-[#2457c5]",
  amber: "bg-[#fdf1d8] text-[#9c5f0e]",
  purple: "bg-[#efe9fd] text-[#6b3fc4]",
};
export type Tone = keyof typeof TONES;
export function Chip({ children, tone = "gray", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={clsx("inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-[13.5px] font-medium", TONES[tone], className)}>{children}</span>;
}

const AV = ["bg-[#ffe7e4] text-[#b11c29]", "bg-[#fdf1df] text-[#a65a0f]", "bg-[#e7effd] text-[#1d4ed8]", "bg-[#efe9fd] text-[#6b3fc4]", "bg-[#e5f6ea] text-[#1c7d45]", "bg-[#e3f4fa] text-[#1d7592]"];
export function Avatar({ name, id, size = 42 }: { name: string; id?: string; size?: number }) {
  const n = id ? Number(id.replace(/\D/g, "")) : name.length;
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-full font-semibold", AV[n % AV.length])} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}
export function Person({ name, id, sub }: { name: string; id: string; sub?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={name} id={id} />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold">{name}</span>
        <span className="block text-[13.5px] text-[#4d5664]">{sub ?? id}</span>
      </span>
    </span>
  );
}

/** Pill tabs (top nav and inner tabs). */
export function Pills<T extends string>({ value, onChange, items, size = "md", choice }: { value: T; onChange: (v: T) => void; items: { v: T; label: ReactNode }[]; size?: "md" | "sm"; choice?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1" role={choice ? "radiogroup" : "tablist"}>
      {items.map((i) => (
        <button
          key={i.v}
          role={choice ? "radio" : "tab"}
          aria-selected={choice ? undefined : value === i.v}
          aria-checked={choice ? value === i.v : undefined}
          onClick={() => onChange(i.v)}
          className={clsx("rounded-xl font-medium transition-colors", size === "md" ? "h-10 px-4 text-[15px]" : "h-9 px-3.5 text-[14.5px]", value === i.v ? "bg-[#ffe7e4] text-[#b11c29]" : "text-[#2a2e38] hover:bg-[#e9edf2]")}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}
/** Outlined filter chips (All · Active · Inactive…). */
export function FilterChips<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { v: T; label: ReactNode }[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((i) => (
        <button key={i.v} onClick={() => onChange(i.v)} className={clsx("h-9 rounded-lg border px-3.5 text-[14.5px] font-medium", value === i.v ? "border-transparent bg-[#ffe7e4] text-[#b11c29]" : "border-[#d3d8df] bg-white hover:bg-[#f4f6f8]")}>
          {i.label}
        </button>
      ))}
    </div>
  );
}

export function Card({ children, className, title, right, pad = true }: { children: ReactNode; className?: string; title?: ReactNode; right?: ReactNode; pad?: boolean }) {
  return (
    <section className={clsx("rounded-2xl border border-[#e3e7ec] bg-white", pad && "p-5", className)}>
      {(title || right) && (
        <div className={clsx("mb-4 flex items-center justify-between gap-3", !pad && "px-5 pt-5")}>
          <h2 className="text-[19px] font-semibold">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

/** Simple table: header row on gray, rows with dividers. */
export function Table({ cols, children, className }: { cols: { label: ReactNode; w?: string; align?: "right" | "center" }[]; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("overflow-x-auto", className)} tabIndex={0} role="region" aria-label="Table">
      <table className="w-full min-w-[860px] border-separate border-spacing-0 text-[15px]">
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} style={{ width: c.w }} className={clsx("bg-[#f4f6f8] px-3 py-2.5 text-left text-[14.5px] font-semibold first:rounded-l-xl last:rounded-r-xl", c.align === "right" && "text-right", c.align === "center" && "text-center")}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:border-b [&_td]:border-[#e3e7ec] [&_td]:px-3 [&_td]:py-2.5 [&_tr:last-child_td]:border-b-0">{children}</tbody>
      </table>
    </div>
  );
}

export function Pager({ page, pages, onPage, from, to, total }: { page: number; pages: number; onPage: (p: number) => void; from: number; to: number; total: number }) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <span className="text-[14.5px] text-[#4d5664]">Showing {total ? `${from}–${to}` : 0} of {total}</span>
      <div className="flex items-center gap-1.5">
        <button aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="grid size-9 place-items-center rounded-lg border border-[#d3d8df] bg-white disabled:opacity-40"><ChevronLeft className="size-4" /></button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => onPage(p)} className={clsx("grid size-9 place-items-center rounded-lg text-[14px]", p === page ? "bg-[#f2766e] text-white" : "border border-[#d3d8df] bg-white")}>{p}</button>
        ))}
        <button aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="grid size-9 place-items-center rounded-lg border border-[#d3d8df] bg-white disabled:opacity-40"><ChevronRight className="size-4" /></button>
      </div>
    </div>
  );
}

/** Right-side drawer for forms and reviews. */
export function Drawer({ title, onClose, children, footer, wide }: { title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="hms-fade fixed inset-0 z-[70] flex justify-end bg-[#1b2136]/25" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined} className={clsx("hms-drawer-r flex h-full w-full flex-col bg-white shadow-2xl", wide ? "max-w-[620px]" : "max-w-[460px]")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#e3e7ec] px-6 py-4">
          <h2 className="text-[20px] font-semibold">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-[#e9edf2]"><X className="size-5" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[#e3e7ec] px-6 py-4">{footer}</div>}
      </aside>
    </div>
  );
}

/** Form field. Use `group` when the content is several controls (chips, buttons) rather than one input. */
export function Field({ label, children, hint, group }: { label: string; children: ReactNode; hint?: string; group?: boolean }) {
  const inner = (
    <>
      <span className="mb-1.5 block text-[14px] font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12.5px] text-[#4d5664]">{hint}</span>}
    </>
  );
  return group ? <div role="group" aria-label={label} className="block">{inner}</div> : <label className="block">{inner}</label>;
}
export const inputCls = "h-10 w-full rounded-xl border border-[#d3d8df] bg-white px-3 text-[14.5px] outline-none focus:border-[#b11c29] focus:ring-4 focus:ring-[#b11c29]/10";
export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...p} className={clsx(inputCls, p.className)} />; }
export function Select({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...p} className={clsx(inputCls, "pr-8", p.className)}>{children}</select>; }
export function Area(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...p} className={clsx(inputCls, "h-auto min-h-[84px] py-2", p.className)} />; }

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#e9edf2] text-[#4d5664]">{icon}</span>
      <p className="mt-3 text-[16px] font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-[420px] text-[14px] text-[#4d5664]">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Small "…" menu. */
export function Menu({ items, label = "Actions" }: { items: { label: string; onClick: () => void; danger?: boolean }[]; label?: string }) {
  return (
    <details className="relative">
      <summary aria-label={label} className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-[#d3d8df] bg-white text-[18px] leading-none hover:bg-[#f4f6f8] [&::-webkit-details-marker]:hidden"><MoreHorizontal className="size-5" aria-hidden /></summary>
      <div className="hms-pop absolute right-0 top-full z-30 mt-1 w-[200px] rounded-xl border border-[#e3e7ec] bg-white p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)]">
        {items.map((i) => (
          <button key={i.label} onClick={(e) => { (e.currentTarget.closest("details") as HTMLDetailsElement).open = false; i.onClick(); }} className={clsx("block w-full rounded-lg px-3 py-2 text-left text-[14px] hover:bg-[#f4f6f8]", i.danger && "text-[#b11c29]")}>
            {i.label}
          </button>
        ))}
      </div>
    </details>
  );
}

export function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return <div role="status" className="hms-up fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-xl bg-[#0f1720] px-4 py-2.5 text-[14px] font-medium text-white shadow-lg">{text}</div>;
}

/** Read a URL query value on the client without effects (null during SSR). */
const subUrl = (f: () => void) => { window.addEventListener("hashchange", f); window.addEventListener("popstate", f); return () => { window.removeEventListener("hashchange", f); window.removeEventListener("popstate", f); }; };
export function useQuery(name: string): string | null {
  // works for normal URLs (?s=x) and the single-file preview (#/path?s=x)
  return useSyncExternalStore(subUrl, () => new URLSearchParams(window.location.search).get(name) ?? new URLSearchParams(window.location.hash.split("?")[1] ?? "").get(name), () => null);
}
