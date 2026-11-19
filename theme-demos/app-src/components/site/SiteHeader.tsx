"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowRight, CalendarDays, Menu, MessageCircle, Phone, User } from "lucide-react";
import { Logo } from "./Logo";
import { Sheet } from "@/components/ui/Sheet";
import { useBooking } from "@/components/booking/BookingProvider";
import type { NavItem } from "./nav";
import { LangToggle, useT } from "@/lib/i18n";
import { useSiteView } from "@/lib/site";

export function SiteHeader({
  nav,
  logoText,
  phone,
  whatsapp,
  base,
}: {
  nav: NavItem[];
  logoText: string;
  phone: string;
  whatsapp?: string;
  base: string;
}) {
  // Menu items the hotel turned off in Website Management › Pages & Navigation.
  const doc = useSiteView(base.split("/").pop() ?? "");
  if (doc?.info.phone) phone = doc.info.phone;
  if (doc) whatsapp = doc.info.whatsapp || undefined;
  nav = doc ? nav.filter((n) => doc.pages[n.href === base ? "home" : (n.href.split("/").pop() ?? "")]?.menu !== false) : nav;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { openSearch } = useBooking();
  const t = useT();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const isActive = (href: string) => (href === base ? pathname === base : pathname.startsWith(href));

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-40 border-b bg-surface/90 backdrop-blur-xl transition-[border-color,box-shadow] duration-200",
          scrolled ? "border-line shadow-[0_6px_20px_-16px_rgb(22_24_29/0.35)]" : "border-transparent",
        )}
      >
        <div className="mx-auto flex h-[var(--header-h)] max-w-[1240px] items-center gap-4 px-4 sm:px-6">
          <Logo text={logoText} href={base} />

          <nav aria-label="Main" className="mx-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={clsx(
                      "relative rounded-full px-4 py-2 text-[15px] font-medium transition-colors",
                      isActive(n.href) ? "text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {t(n.label)}
                    {isActive(n.href) && <span className="absolute inset-x-4 -bottom-[13px] h-[2px] rounded-full bg-brand" />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link
              href={`${base}/my-trip`}
              className="hidden h-11 items-center gap-2 rounded-full border border-brand-ring px-4 text-[15px] font-semibold text-action hover:bg-brand-soft md:flex"
            >
              <User className="size-[18px]" /> {t("My Trip")}
            </Link>
            <button onClick={() => setMenu(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-full bg-canvas sm:size-11 sm:border sm:border-line sm:bg-transparent lg:hidden">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={menu} onClose={() => setMenu(false)} title={t("Menu")} side="right">
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setMenu(false)}
                  className={clsx(
                    "flex h-12 items-center justify-between rounded-2xl px-4 text-[17px] font-semibold",
                    isActive(n.href) ? "bg-brand-soft text-action" : "hover:bg-canvas",
                  )}
                >
                  {t(n.label)}
                  <ArrowRight className="size-4 opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={() => {
            setMenu(false);
            openSearch();
          }}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-action font-semibold text-on-action"
        >
          <CalendarDays className="size-5" /> {t("Book your stay")}
        </button>
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-canvas px-4 py-3 text-[15px] font-semibold">
          {t("Language")} <LangToggle />
        </div>
        <div className="mt-4 space-y-2 border-t border-line pt-5 text-[15px]">
          <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="flex h-11 items-center gap-3 rounded-xl px-2 hover:bg-canvas">
            <Phone className="size-5 text-muted" /> {phone}
          </a>
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} className="flex h-11 items-center gap-3 rounded-xl px-2 hover:bg-canvas">
              <MessageCircle className="size-5 text-muted" /> WhatsApp
            </a>
          )}
        </div>
      </Sheet>
    </>
  );
}
