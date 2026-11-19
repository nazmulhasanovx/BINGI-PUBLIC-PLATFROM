import Link from "next/link";

/** Hotel logo slot. Demo uses a text mark; real hotels show the logo uploaded in HMS → Branding. */
export function Logo({ text, href, invert }: { text: string; href: string; invert?: boolean }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2.5" aria-label={`${text} home`}>
      <span className="grid size-8 place-items-center rounded-[10px] bg-brand text-white sm:size-9 sm:rounded-xl shadow-[0_6px_16px_-8px_var(--brand)]">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M3 17c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2" />
          <path d="M12 3v8M8 7l4-4 4 4" />
        </svg>
      </span>
      <span className={`font-heading text-[17px] font-bold sm:text-[19px] tracking-tight ${invert ? "text-white" : "text-ink"}`}>{text}</span>
    </Link>
  );
}
