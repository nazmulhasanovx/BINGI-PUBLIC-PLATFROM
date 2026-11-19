import { DraftText } from "@/components/site-draft/Draft";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { T } from "@/lib/i18n";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("mx-auto w-full max-w-[1240px] px-4 sm:px-6", className)}>{children}</div>;
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  link,
  slug,
}: {
  eyebrow?: string;
  title: string;
  /** Pass the hotel slug to make the title editable in Website Management (Preview › Edit). */
  slug?: string;
  sub?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-action">{eyebrow}</p>}
        <h2 className="text-[20px] font-bold md:text-[32px] md:leading-tight">{slug ? <DraftText slug={slug} k={`copy.${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}`} fallback={title} /> : <T>{title}</T>}</h2>
        {sub && <p className="mt-2 max-w-xl text-[15px] text-muted md:text-base">{sub}</p>}
      </div>
      {link && (
        <Link href={link.href} className="group hidden shrink-0 items-center gap-1.5 text-[15px] font-semibold text-action sm:flex">
          <T>{link.label}</T> <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function MobileMore({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-2xl border border-line bg-surface text-[14px] font-semibold text-action active:scale-[0.98] sm:hidden">
      {label} <ArrowRight className="size-4" />
    </Link>
  );
}
