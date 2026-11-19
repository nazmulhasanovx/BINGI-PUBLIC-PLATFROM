"use client";
// Small HMS UI kit used by Website Management (same look as the live HMS: white cards, cool-gray canvas, coral actions).
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, Lock } from "lucide-react";
import { createContext, useContext, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

/** Inside a tab, a page shows no title of its own — only its actions. */
export const Embedded = createContext(false);

export function PageHead({ title, desc, actions, eyebrow }: { title: string; desc?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  const embedded = useContext(Embedded);
  if (embedded) return actions ? <div className="mb-4 flex flex-wrap items-center justify-end gap-2">{actions}</div> : null;
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-hms-muted">{eyebrow}</p>}
        <h1 className="text-[24px] font-bold leading-tight tracking-[-0.01em]">{title}</h1>
        {desc && <p className="mt-1.5 max-w-[720px] text-[15px] text-hms-muted">{desc}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, title, desc, action, pad = true }: { children?: ReactNode; className?: string; title?: ReactNode; desc?: ReactNode; action?: ReactNode; pad?: boolean }) {
  const embedded = useContext(Embedded);
  if (embedded) desc = undefined;
  return (
    <section className={clsx("rounded-2xl border border-hms-line bg-white", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-4">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold">{title}</h2>
            {desc && <p className="mt-0.5 text-[13px] text-hms-muted">{desc}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Btn({ children, variant = "primary", className, ...rest }: { variant?: "primary" | "outline" | "ghost" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-[background,transform,opacity] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
        variant === "primary" && "bg-hms-coral text-white hover:bg-[#8e1621]",
        variant === "outline" && "border border-hms-line bg-white hover:bg-hms-hover",
        variant === "ghost" && "text-hms-ink hover:bg-hms-hover",
        variant === "danger" && "border border-red-200 bg-white text-hms-red hover:bg-red-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[13px] font-medium text-hms-blue hover:underline">
      {label} <ArrowUpRight className="size-3.5" />
    </Link>
  );
}

export function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange?: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      className={clsx("relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-40", on ? "bg-hms-coral" : "bg-[#d9d9e0]")}
    >
      <span className={clsx("absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] duration-200", on ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "amber" | "red" | "blue" | "purple" }) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium",
        tone === "gray" && "bg-hms-hover text-hms-muted",
        tone === "green" && "bg-hms-green-soft text-hms-green",
        tone === "amber" && "bg-hms-amber-soft text-hms-amber",
        tone === "red" && "bg-hms-coral-soft text-hms-red",
        tone === "blue" && "bg-hms-blue-soft text-hms-blue",
        tone === "purple" && "bg-[#f3eefe] text-[#6d28d9]",
      )}
    >
      {children}
    </span>
  );
}

export function PlanLock({ plan }: { plan: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-hms-hover px-2 py-0.5 text-[12px] font-medium text-hms-muted">
      <Lock className="size-3" /> {plan}
    </span>
  );
}

export function Field({ label, hint, children, count }: { label: string; hint?: ReactNode; children: ReactNode; count?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[14px] font-medium">{label}</span>
        {count && <span className="text-[12px] tabular-nums text-hms-muted">{count}</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-hms-muted">{hint}</span>}
    </label>
  );
}

const inputCls = "w-full rounded-xl border border-hms-line bg-white px-3.5 text-[14px] outline-none transition-[border,box-shadow] placeholder:text-[#9ca3af] focus:border-hms-coral focus:ring-4 focus:ring-hms-coral/10";
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputCls, "h-10", props.className)} />;
}
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(inputCls, "min-h-[88px] py-2.5 leading-relaxed", props.className)} />;
}

export function Empty({ icon, title, desc, action }: { icon: ReactNode; title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-hms-hover text-hms-muted">{icon}</span>
      <p className="mt-3 text-[15px] font-semibold">{title}</p>
      <p className="mt-1 max-w-[420px] text-[13px] text-hms-muted">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("flex items-center gap-4 border-b border-hms-line px-5 py-3.5 last:border-b-0", className)}>{children}</div>;
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-full border border-hms-line bg-hms-hover p-0.5 text-[13px] font-medium">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className={clsx("h-8 rounded-full px-3.5 transition-colors", value === o.v ? "bg-white shadow-sm" : "text-hms-muted hover:text-hms-ink")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Honest label for settings the themes don't read yet (prototype → HMS API wiring). */
export function NotWired({ what }: { what?: string }) {
  void what;
  return <p className="mb-4 text-[12px] text-hms-muted">Saved now · shows on the site after HMS API connect</p>;
}
