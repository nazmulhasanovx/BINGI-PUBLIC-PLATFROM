"use client";
// Guests module: one place for guests and their reviews (Nazmul, 10 Nov 2026). Shared frame and small parts.
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Star, X } from "lucide-react";
import type { GuestState } from "@/lib/guests/store";

export function GuestsFrame({ tab, counts, action, children }: { tab: "guests" | "reviews"; counts: { guests: number; reply: number }; action?: ReactNode; children: ReactNode }) {
  const tabs = [
    { id: "guests", label: "Guests", href: "/hms/guests", n: counts.guests, hot: false },
    { id: "reviews", label: "Reviews", href: "/hms/guests/reviews", n: counts.reply, hot: counts.reply > 0 },
  ];
  return (
    <div className="h-full overflow-y-auto">
      <div className="hms-page">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold tracking-[-0.01em]">Guests</h1>
            <p className="text-[14px] text-hms-muted">Everyone who stays with you, their visits and what they said.</p>
          </div>
          {action}
        </div>
        <nav aria-label="Guests sections" className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-hms-line">
          {tabs.map((t) => (
            <Link key={t.id} href={t.href} aria-current={tab === t.id ? "page" : undefined}
              className={clsx("-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-[14.5px] font-semibold", tab === t.id ? "border-hms-red text-hms-ink" : "border-transparent text-hms-muted hover:text-hms-ink")}>
              {t.label}
              <span className={clsx("rounded-full px-1.5 text-[12px] font-semibold tabular-nums", t.hot ? "bg-hms-red text-white" : "bg-hms-hover text-[#4d5664]")}>{t.n}{t.hot ? " to reply" : ""}</span>
            </Link>
          ))}
        </nav>
        <div key={tab} className="hms-page-in mt-5">{children}</div>
      </div>
    </div>
  );
}

export const btn = "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-[14px] font-semibold transition-colors disabled:opacity-50";
export const btnPrimary = clsx(btn, "btn-glow text-white");
export const btnLine = clsx(btn, "border border-hms-line bg-white hover:bg-hms-hover");
/** Square icon button (no horizontal padding, so the icon is never squeezed). */
export const btnIcon = "inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-hms-line bg-white transition-colors hover:bg-hms-hover disabled:opacity-50";
export const input = "h-11 w-full rounded-lg border border-[#858c97] bg-white px-3 text-[15px] outline-none focus:border-hms-ink focus:ring-2 focus:ring-hms-ink/10";
export const lbl = "mb-1.5 block text-[13.5px] font-semibold";

export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`} role="img">
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? "fill-[#f5a524] text-[#f5a524]" : "fill-[#e3e7ec] text-[#e3e7ec]"} />)}
    </span>
  );
}

export function StateChip({ s }: { s: GuestState }) {
  const c: Record<GuestState, string> = {
    "In house": "bg-[#e8f0fe] text-[#1d4ed8]", "Arriving today": "bg-[#fdefe7] text-[#b4501f]", Upcoming: "bg-[#eeebfc] text-[#5b44c9]",
    "Checked out": "bg-hms-hover text-[#4d5664]", "No stay yet": "bg-hms-hover text-[#4d5664]",
  };
  return <span className={clsx("inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[12.5px] font-semibold", c[s])}>{s}</span>;
}

export function Tag({ tone, children }: { tone: "vip" | "red" | "gray" | "green" | "amber"; children: ReactNode }) {
  const c = { vip: "bg-[#fdf3d9] text-[#7a5200]", red: "bg-[#fde8e8] text-[#a11d2a]", gray: "bg-hms-hover text-[#4d5664]", green: "bg-[#e5f5ec] text-[#16693a]", amber: "bg-[#fdf3d9] text-[#7a5200]" }[tone];
  return <span className={clsx("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold", c)}>{children}</span>;
}

/** Right-side sheet, portaled so fixed positioning is never broken by a parent. */
export function Sheet({ title, sub, onClose, children, footer, wide }: { title: string; sub?: string; onClose: () => void; children: ReactNode; footer: ReactNode; wide?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    const el = panel.current;
    if (el && !el.contains(document.activeElement)) (el.querySelector<HTMLElement>("[autofocus], input, select, textarea") ?? el).focus();
    // Keep Tab inside the sheet; Escape closes; focus returns to the opener.
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); close.current(); return; }
      if (e.key !== "Tab" || !el) return;
      const f = [...el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1)!.focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; back?.focus?.(); };
  }, []);
  return createPortal(
    <div className="hms-app hms-fade fixed inset-0 z-[90] flex justify-end bg-black/25" onClick={onClose}>
      <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className={`hms-drawer-r flex h-full w-full ${wide ? "max-w-[780px]" : "max-w-[520px]"} flex-col bg-white shadow-2xl outline-none`}>
        <div className="flex items-start gap-3 border-b border-hms-line px-5 py-4">
          <div className="flex-1"><h2 className="text-[18px] font-bold">{title}</h2>{sub && <p className="text-[13.5px] text-hms-muted">{sub}</p>}</div>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover"><X className="size-5" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        <div className="flex gap-2 border-t border-hms-line px-5 py-3">{footer}</div>
      </div>
    </div>,
    document.body,
  );
}
