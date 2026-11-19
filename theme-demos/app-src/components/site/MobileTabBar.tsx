"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { motion } from "framer-motion";
import { BedDouble, CalendarPlus, Compass, House, User } from "lucide-react";
import { useBooking } from "@/components/booking/BookingProvider";
import { useT } from "@/lib/i18n";

/** Phone: app-style bottom tab bar. Hidden inside the booking flow, where each page has its own action bar. */
export function MobileTabBar({ base }: { base: string }) {
  const pathname = usePathname();
  const { openSearch } = useBooking();
  const t = useT();
  if (/\/(rooms\/[^/]+|stay|checkout|confirmation)(\/|$)/.test(pathname)) return null;

  const tabs = [
    { href: base, label: "Home", icon: House, active: pathname === base },
    { href: `${base}/rooms`, label: "Rooms", icon: BedDouble, active: pathname.startsWith(`${base}/rooms`) },
    null,
    { href: `${base}/explore`, label: "Explore", icon: Compass, active: /\/(explore|dining|experiences|offers|events|policies)/.test(pathname) },
    { href: `${base}/my-trip`, label: "My Trip", icon: User, active: pathname.startsWith(`${base}/my-trip`) },
  ];

  return (
    <nav aria-label="App" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface shadow-[0_-8px_24px_-18px_rgb(22_24_29/0.35)] md:hidden">
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
        {tabs.map((tab, i) =>
          tab ? (
            <li key={tab.href}>
              <Link href={tab.href} aria-current={tab.active ? "page" : undefined} className="relative flex h-14 flex-col items-center justify-center gap-0.5 active:scale-95">
                {tab.active && <motion.span layoutId="tab-dot" className="absolute top-1 h-1 w-6 rounded-full bg-brand" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                <tab.icon className={clsx("size-[22px] transition-colors", tab.active ? "text-action" : "text-muted")} strokeWidth={tab.active ? 2.3 : 1.8} />
                <span className={clsx("text-[11px] font-semibold", tab.active ? "text-action" : "text-muted")}>{t(tab.label)}</span>
              </Link>
            </li>
          ) : (
            <li key={`book-${i}`} className="flex justify-center">
              <button
                onClick={openSearch}
                aria-label={t("Book your stay")}
                className="-mt-6 grid size-14 place-items-center rounded-full bg-action text-on-action shadow-[0_10px_24px_-8px_var(--action)] ring-4 ring-surface active:scale-95"
              >
                <CalendarPlus className="size-6" />
              </button>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
