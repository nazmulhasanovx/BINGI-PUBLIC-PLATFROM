"use client";
import { createPortal } from "react-dom";
// Onboarding v7.3 — real workspace layout (host-extranet style, like Airbnb / Booking.com):
// white top bar · left sidebar with the steps and what's complete · one question in the main area · bottom bar.
// Plain controls: 8px buttons, 12px cards, form-style radio/checkbox marks, no illustrations or emoji.
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useState, type ReactNode } from "react";
import { Check, ChevronRight, CircleHelp, HelpCircle, MessageCircle, Phone, X } from "lucide-react";
import { setOnbLang, useL } from "@/lib/onboarding/store";

export function Header({ right, title }: { right?: ReactNode; title?: ReactNode }) {
  const [help, setHelp] = useState(false);
  const { t, lang } = useL();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e3e7ec] bg-white px-4 sm:px-6">
      <Link href="/onboarding" className="flex shrink-0 items-center" aria-label="BinGi">
        <Image src="/brand/bingi-master.svg" alt="BinGi" width={84} height={28} className="h-7 w-auto" priority />
      </Link>
      {title && <span className="hidden h-6 w-px bg-[#e3e7ec] sm:block" />}
      {title && <span className="hidden min-w-0 truncate text-[14.5px] font-medium text-[#4d5664] sm:block">{title}</span>}
      <span className="hidden rounded bg-hms-amber-soft px-1.5 py-0.5 text-[11px] font-semibold text-hms-amber md:inline">Prototype</span>
      <div className="ml-auto flex items-center gap-2">
        <div role="group" aria-label="Language" className="flex rounded-lg border border-[#d3d8df] p-0.5 text-[13px] font-semibold">
          {(["bn", "en"] as const).map((l) => <button key={l} onClick={() => setOnbLang(l)} aria-pressed={lang === l} className={clsx("h-7 rounded-md px-2.5", lang === l ? "bg-[#0f1720] text-white" : "text-[#4d5664] hover:bg-[#e9edf2]")}>{l === "bn" ? "বাংলা" : "EN"}</button>)}
        </div>
        <button onClick={() => setHelp(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#d3d8df] px-3 text-[14px] font-medium hover:bg-[#e9edf2]"><HelpCircle className="size-[17px]" aria-hidden /><span className="hidden sm:inline">{t("সাহায্য", "Help")}</span><span className="sr-only sm:hidden">{t("সাহায্য", "Help")}</span></button>
        {right}
      </div>
      {help && <HelpSheet onClose={() => setHelp(false)} />}
    </header>
  );
}

function HelpSheet({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const { t } = useL();
  return createPortal(
    <div className="bingi-ui fixed inset-0 z-50 flex items-end justify-center bg-[#0f1720]/30 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t("সাহায্য", "Help")} onClick={(e) => e.stopPropagation()} className="onb-in w-full max-w-[420px] rounded-t-xl bg-white p-6 shadow-xl sm:rounded-xl">
        <div className="flex items-center justify-between"><h2 className="text-[18px] font-semibold">{t("সেটআপে সাহায্য লাগবে?", "Need help setting up?")}</h2><button onClick={onClose} aria-label={t("বন্ধ করুন", "Close")} className="grid size-9 place-items-center rounded-lg hover:bg-[#e9edf2]"><X className="size-5" /></button></div>
        <p className="mt-1 text-[14.5px] text-[#4d5664]">{t("BinGi টিম ফোনে আপনার সাথে সেটআপ করে দেবে। আপনার কাজ সেভ থাকবে।", "The BinGi team can set it up with you on a call. Your progress is saved.")}</p>
        <div className="mt-4 grid gap-2">
          <button onClick={() => setSent(true)} className="flex items-center gap-3 rounded-lg border border-[#d3d8df] p-3.5 text-left hover:bg-[#f4f6f8]"><Phone className="size-5 text-[#b11c29]" /><span className="text-[15px] font-medium">{t("আমাকে কল করুন", "Call me back")}</span></button>
          <button onClick={() => setSent(true)} className="flex items-center gap-3 rounded-lg border border-[#d3d8df] p-3.5 text-left hover:bg-[#f4f6f8]"><MessageCircle className="size-5 text-[#1c7d45]" /><span className="text-[15px] font-medium">WhatsApp</span></button>
        </div>
        {sent && <p role="status" className="mt-3 rounded-lg bg-[#eef8f1] px-3 py-2 text-[13.5px] text-[#1c6b3c]">{t("অনুরোধ নেওয়া হয়েছে (প্রোটোটাইপ — এখনো পাঠানো হয় না)।", "Request noted (prototype — not sent yet).")}</p>}
      </div>
    </div>,
    document.body,
  );
}

export function Canvas({ children }: { children: ReactNode }) {
  return <div className="bingi-ui min-h-dvh bg-[#f4f6f8] text-[#0f1720]">{children}</div>;
}

/** Workspace: sidebar (steps) + main question + bottom bar with a progress line. */
export function Card({ sidebar, mobileNav, progress, children, footer, aside, wide }: { sidebar: ReactNode; mobileNav?: ReactNode; progress: number; children: ReactNode; footer: ReactNode; aside?: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-[calc(100dvh-64px)]">
      <aside className="hidden w-[300px] shrink-0 border-r border-[#e3e7ec] bg-white lg:block"><div className="sticky top-16 max-h-[calc(100dvh-64px)] overflow-y-auto">{sidebar}</div></aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {mobileNav && <div className="border-b border-[#e3e7ec] bg-white lg:hidden">{mobileNav}</div>}
        <main className="flex-1 px-4 pb-10 pt-6 sm:px-10 sm:pt-10">
          <div className={clsx("mx-auto", wide ? "max-w-[1040px]" : aside ? "max-w-[680px] xl:grid xl:max-w-[1040px] xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-12" : "max-w-[680px]")}>
            <div className="min-w-0">{children}</div>
            {aside && <aside className="hidden xl:block"><div className="sticky top-[104px]">{aside}</div></aside>}
          </div>
        </main>
        <div className="sticky bottom-0 z-20 bg-white">
          <div className="h-1 bg-[#e3e7ec]" aria-hidden><div className="h-full bg-[#0f1720] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
          <div className={clsx("mx-auto px-4 py-3 sm:px-10", wide || aside ? "max-w-[760px] xl:max-w-[1120px]" : "max-w-[760px]")}>{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function Q({ title, sub, why, children }: { title: string; sub?: ReactNode; why?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { t } = useL();
  return (
    <section>
      <div className="flex items-start gap-2">
        <h1 className="text-[24px] font-semibold leading-[1.3] tracking-[-0.01em] sm:text-[28px]">{title}</h1>
        {why && <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t("কেন জিজ্ঞেস করছি?", "Why we ask")} className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-[#4d5664] hover:bg-[#e9edf2] hover:text-[#0f1720]"><CircleHelp className="size-5" /></button>}
      </div>
      {open && why && <p className="onb-in mt-2 rounded-lg border border-[#e3e7ec] bg-[#f4f6f8] px-3.5 py-2.5 text-[14.5px] text-[#4d5664]">{why}</p>}
      {sub && <p className="mt-2 text-[15.5px] leading-relaxed text-[#4d5664]">{sub}</p>}
      <div className="mt-7">{children}</div>
    </section>
  );
}

export function Foot({ back, children }: { back?: () => void; children: ReactNode }) {
  const { t } = useL();
  return (
    <div className="flex items-center gap-2">
      {back ? <button onClick={back} className="-ml-2 h-11 rounded-lg px-2 text-[15px] font-semibold underline-offset-4 hover:underline">{t("পেছনে", "Back")}</button> : <span />}
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  );
}

export function Primary({ children, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={clsx("inline-flex h-11 items-center justify-center gap-1.5 rounded-lg btn-glow px-5 text-[15px] font-semibold text-white disabled:opacity-50", className)}>{children}</button>;
}
export function Next({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { t } = useL();
  return <Primary {...p}>{children ?? t("পরের ধাপ", "Next")}<ChevronRight className="size-[18px]" aria-hidden /></Primary>;
}
export function Later({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { t } = useL();
  return <button {...p} className="h-11 rounded-lg px-3 text-[14.5px] font-semibold text-[#4d5664] underline-offset-4 hover:underline">{children ?? t("পরে করবো", "Do it later")}</button>;
}
export function Ghost({ children, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={clsx("inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-[#858c97] bg-white px-4 text-[15px] font-semibold text-[#0f1720] hover:border-[#0f1720]", className)}>{children}</button>;
}

/** Option row/tile — form-style mark (radio for one choice, checkbox for many). */
export function Tile({ on, onClick, title, sub, icon, badge, disabled, locked, role = "button", big, children }: { on: boolean; onClick: () => void; title: string; sub?: string; icon?: ReactNode; badge?: string; disabled?: boolean; locked?: boolean; role?: "button" | "radio"; big?: boolean; children?: ReactNode }) {
  const radio = role === "radio";
  return (
    <div className={clsx("rounded-xl border bg-white transition-[border-color,box-shadow] duration-150", on ? "border-[#0f1720] shadow-[inset_0_0_0_1px_#0f1720]" : "border-[#c6ccd4] hover:border-[#9aa0ac]", disabled && "opacity-50")}>
      <button type="button" role={radio ? "radio" : undefined} aria-checked={radio ? on : undefined} aria-pressed={radio ? undefined : on} aria-disabled={locked || undefined}
        onClick={locked ? undefined : onClick} disabled={disabled}
        className={clsx("flex w-full items-center gap-3.5 px-4 text-left", big ? "min-h-[76px] py-3.5" : "min-h-[60px] py-3")}>
        {icon && <span className="grid size-10 shrink-0 place-items-center text-[#0f1720]">{icon}</span>}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 text-[15.5px] font-semibold leading-snug">{title}{badge && <span className="rounded bg-[#e9edf2] px-1.5 py-0.5 text-[11.5px] font-medium text-[#4d5664]">{badge}</span>}</span>
          {sub && <span className="mt-0.5 block text-[13.5px] leading-snug text-[#4d5664]">{sub}</span>}
        </span>
        <span aria-hidden className={clsx("grid size-5 shrink-0 place-items-center border-2 transition-colors", radio ? "rounded-full" : "rounded", on ? "border-[#b11c29] bg-[#b11c29] text-white" : "border-[#b8bdc7] bg-white")}>{on && (radio ? <span className="size-2 rounded-full bg-white" /> : <Check className="size-3.5" strokeWidth={3} />)}</span>
      </button>
      {on && children && <div className="onb-in border-t border-[#e3e7ec] px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

export function Chip({ on, onClick, children, disabled, title, label }: { on: boolean; onClick: () => void; children: ReactNode; disabled?: boolean; title?: string; label?: string }) {
  return (
    <button type="button" aria-pressed={on} aria-label={label} onClick={onClick} disabled={disabled} title={title}
      className={clsx("inline-flex h-10 items-center gap-1.5 rounded-lg border px-3.5 text-[14.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50", on ? "border-[#0f1720] bg-[#0f1720] text-white" : "border-[#858c97] bg-white text-[#0f1720] hover:border-[#0f1720]")}>
      {on && <Check className="size-4" aria-hidden />}{children}
    </button>
  );
}

export function Stepper({ value, set, min = 0, max = 99, label }: { value: number; set: (n: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label={label}>
      <button type="button" aria-label={`${label} −`} onClick={() => set(Math.max(min, value - 1))} disabled={value <= min} className="grid size-9 place-items-center rounded-full border border-[#b8bdc7] text-[18px] font-medium hover:border-[#0f1720] disabled:opacity-30">−</button>
      <span className="min-w-[28px] text-center text-[17px] font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label={`${label} +`} onClick={() => set(Math.min(max, value + 1))} disabled={value >= max} className="grid size-9 place-items-center rounded-full border border-[#b8bdc7] text-[18px] font-medium hover:border-[#0f1720] disabled:opacity-30">+</button>
    </div>
  );
}

export function Errors({ list }: { list: string[] }) {
  if (!list.length) return null;
  return <div role="alert" className="onb-in mb-5 rounded-lg border border-[#f3c7c3] bg-[#fff5f4] px-4 py-3 text-[14.5px] font-medium text-[#9b241d]">{list.map((e) => <p key={e}>{e}</p>)}</div>;
}

export const field = "h-11 w-full rounded-lg border border-[#858c97] bg-white px-3.5 text-[15.5px] outline-none transition-colors placeholder:text-[#8a8f9c] focus:border-[#0f1720] focus:ring-2 focus:ring-[#0f1720]/10";
export const label = "block text-[14px] font-semibold";
