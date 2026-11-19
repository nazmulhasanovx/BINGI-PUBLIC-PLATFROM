"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { THEMES, isThemeId, themeById, tokensFor, type ThemeId } from "@/lib/theme";
import type { MasterTheme } from "@/lib/types";
import { MASTERS, PAID_MASTERS } from "@/themes/registry";
const ALL_MASTERS = [...MASTERS, ...PAID_MASTERS];
import { useIsPreview, useSiteView } from "@/lib/site";

/**
 * Theme switcher bar for designers/developers (top of every hotel page).
 * Not part of a hotel's live site: turn it off with NEXT_PUBLIC_THEME_SWITCHER=off.
 * In production the hotel's theme comes from HMS → Website Management → Theme & Appearance.
 * Choice is kept in this browser (localStorage); ?theme=<id> in the URL also works.
 */
// Kept per master theme, so GRAND and CITY demos keep their own colour.
const keysFor = (m: MasterTheme) => ({ KEY: `bingi-theme-${m}`, HKEY: `bingi-heading-${m}` });
const listeners = new Set<() => void>();
const sub = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const read = (k: string) => {
  try {
    return localStorage.getItem(k) ?? "";
  } catch {
    return "";
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
  listeners.forEach((l) => l());
};

export function ThemePreview({ slug, defaultTheme, defaultHeading, master: hotelMaster }: { slug: string; defaultTheme: ThemeId; defaultHeading: "sans" | "serif"; master: MasterTheme }) {
  // The site record (HMS → Website Management) sets the real colour/font/layout; this bar only overrides it for designers.
  const doc = useSiteView(slug);
  const preview = useIsPreview();
  const master = doc?.master ?? hotelMaster;
  const { KEY, HKEY } = keysFor(master);
  const params = useSearchParams();
  const q = params.get("theme");
  const stored = useSyncExternalStore(sub, () => read(KEY), () => "");
  const storedH = useSyncExternalStore(sub, () => read(HKEY), () => "");
  const baseTheme = doc?.palette ?? defaultTheme;
  const baseHeading = doc?.heading ?? defaultHeading;
  const active: ThemeId = preview ? baseTheme : isThemeId(q) ? q : isThemeId(stored) ? stored : baseTheme;
  const heading = preview ? baseHeading : storedH === "serif" || storedH === "sans" ? storedH : baseHeading;

  useEffect(() => {
    if (isThemeId(q) && q !== read(KEY)) write(KEY, q);
  }, [q, KEY]);

  useEffect(() => {
    const el = document.getElementById("hotel-theme");
    if (!el) return;
    Object.entries(tokensFor(active)).forEach(([k, v]) => el.style.setProperty(k, v));
    el.dataset.theme = active;
    el.dataset.heading = heading;
  }, [active, heading]);

  if (process.env.NEXT_PUBLIC_THEME_SWITCHER === "off" || preview) return null;

  const t = themeById(active);
  return (
    <>
    <PhoneThemeButton active={active} heading={heading} master={master} />
    <div className="hidden border-b border-ink/10 bg-[#16181d] text-white md:block">
      <div className="no-scrollbar mx-auto flex h-12 max-w-[1240px] items-center gap-3 overflow-x-auto px-4 sm:px-6">
        <LayoutSwitch master={master} />
        <span className="h-5 w-px shrink-0 bg-white/20" />
        <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold">
          <Palette className="size-4 opacity-80" /> <span className="hidden sm:inline">Theme</span>
        </span>
        <div className="flex shrink-0 items-center gap-1" role="radiogroup" aria-label="Colour theme">
          {THEMES.map((th, i) => (
            <button
              key={th.id}
              role="radio"
              aria-checked={active === th.id}
              title={`${i + 1}. ${th.name} ${th.brand}`}
              aria-label={th.name}
              onClick={() => write(KEY, th.id)}
              className={clsx("grid size-6 place-items-center rounded-full transition-transform hover:scale-110", active === th.id && "ring-2 ring-white ring-offset-2 ring-offset-[#16181d]")}
              style={{ background: th.brand }}
            >
              {active === th.id && <Check className="size-3.5 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
        <span className="hidden shrink-0 text-[13px] text-white/70 2xl:inline">
          <b className="text-white">{t.name}</b> <code className="ml-1 text-white/60">{t.brand}</code>
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-white/10 p-0.5 text-[12px] font-semibold" role="group" aria-label="Heading font">
          {(["sans", "serif"] as const).map((h) => (
            <button key={h} onClick={() => write(HKEY, h)} aria-pressed={heading === h} className={clsx("h-7 rounded-full px-3", heading === h ? "bg-white text-[#16181d]" : "text-white/80 hover:text-white")}>
              {h === "sans" ? "Sans" : "Serif"}
            </button>
          ))}
        </div>
        <Link href="/theme-lab" className="hidden h-8 shrink-0 items-center rounded-full border border-white/20 px-3 text-[12px] font-semibold hover:bg-white/10 md:flex">
          Theme Lab
        </Link>
      </div>
    </div>
    </>
  );
}

/** Phone: small dark palette button in the header (left of the menu) that opens the switcher as a sheet. */
function PhoneThemeButton({ active, heading, master }: { active: ThemeId; heading: "sans" | "serif"; master: MasterTheme }) {
  const [open, setOpen] = useState(false);
  const { KEY, HKEY } = keysFor(master);
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Theme switcher"
        className="fixed right-[64px] top-[9px] z-50 grid size-10 place-items-center rounded-full bg-[#16181d] text-white active:scale-95"
      >
        <Palette className="size-[18px]" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Theme (preview)">
        <p className="mb-2 text-sm font-semibold">Layout</p>
        <div className="mb-5 grid grid-cols-3 gap-2">
          {ALL_MASTERS.map((m) => m.demo ? (
            <Link key={m.id} href={`/hotel/${m.demo}`} onClick={() => setOpen(false)} className={clsx("rounded-2xl border p-2.5 text-center", m.id === master ? "border-[#16181d] bg-[#16181d] text-white" : "border-line")}>
              <span className="block text-[14px] font-bold">{m.name}</span><span className="text-[11px] opacity-70">{m.plan}</span>
            </Link>
          ) : (
            <span key={m.id} className="rounded-2xl border border-dashed border-line p-2.5 text-center text-muted">
              <span className="block text-[14px] font-bold">{m.name}</span><span className="text-[11px]">Soon</span>
            </span>
          ))}
        </div>
        <p className="mb-2 text-sm font-semibold">Colour</p>
        <div className="grid grid-cols-5 gap-3 pb-2">
          {THEMES.map((th) => (
            <button key={th.id} onClick={() => write(KEY, th.id)} className="flex flex-col items-center gap-1.5" aria-pressed={active === th.id}>
              <span className={clsx("grid size-12 place-items-center rounded-full", active === th.id && "ring-2 ring-ink ring-offset-2")} style={{ background: th.brand }}>
                {active === th.id && <Check className="size-5 text-white" strokeWidth={3} />}
              </span>
              <span className="text-[11px] font-semibold text-muted">{th.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-canvas p-3">
          <span className="text-sm font-semibold">Heading font</span>
          <div className="flex gap-1 rounded-full bg-surface p-1 text-[13px] font-semibold">
            {(["sans", "serif"] as const).map((h) => (
              <button key={h} onClick={() => write(HKEY, h)} className={clsx("h-8 rounded-full px-4", heading === h ? "bg-[#16181d] text-white" : "text-muted")}>{h === "sans" ? "Sans" : "Serif"}</button>
            ))}
          </div>
        </div>
        <Link href="/theme-lab" className="mt-3 flex h-11 items-center justify-center rounded-full border border-line text-sm font-semibold">Open Theme Lab</Link>
      </Sheet>
    </div>
  );
}

/** Desktop: which master layout (one per plan). Each opens its demo hotel. */
function LayoutSwitch({ master }: { master: MasterTheme }) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 p-0.5 text-[12px] font-semibold" role="group" aria-label="Layout">
      {ALL_MASTERS.map((m) =>
        m.demo ? (
          <Link key={m.id} href={`/hotel/${m.demo}`} aria-current={m.id === master ? "page" : undefined} title={m.plan === "Paid" ? "Paid theme (Theme Store)" : m.plan === "Luxury" ? "Luxury Collection (Theme Store)" : m.plan === "Signature" ? "Signature Collection (Theme Store)" : `${m.plan} plan`} className={clsx("flex h-7 items-center rounded-full px-2", m.id === master ? "bg-white text-[#16181d]" : m.plan === "Paid" ? "text-[#e9d5ff] hover:text-white" : m.plan === "Luxury" ? "text-[#f1dfb6] hover:text-white" : m.plan === "Signature" ? "text-[#b9f3d0] hover:text-white" : "text-white/80 hover:text-white")}>
            {m.name}
          </Link>
        ) : (
          <span key={m.id} title={`${m.plan} plan — coming next`} className="flex h-7 items-center rounded-full px-3 text-white/40">{m.name} · soon</span>
        )
      )}
    </div>
  );
}
