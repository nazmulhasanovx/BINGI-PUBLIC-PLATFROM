import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Hotel } from "@/lib/types";
import type { NavItem } from "./nav";
import { Logo } from "./Logo";
import { availablePages } from "@/lib/data";
import { T } from "@/lib/i18n";
import { DraftInfo } from "@/components/site-draft/Draft";

const icons = {
  facebook: <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v7h4v-7H17l.5-4h-4V8.8c0-.5.3-.8.5-.8Z" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" />
    </>
  ),
  youtube: <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />,
};

function Col({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted"><T>{title}</T></p>
      <ul className="mt-3 space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex min-h-9 items-center text-[15px] text-ink/80 hover:text-action">
              <T>{l.label}</T>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter({ hotel, nav }: { hotel: Hotel; nav: NavItem[] }) {
  const base = `/hotel/${hotel.slug}`;
  const has = (label: string) => nav.some((n) => n.label === label);
  const stay = [
    { href: `${base}/rooms`, label: "Rooms" },
    has("Offers") && { href: `${base}/offers`, label: "Offers" },
    { href: `${base}/my-trip`, label: "My Trip" },
    { href: `${base}/policies`, label: "Policies" },
  ].filter(Boolean) as { href: string; label: string }[];
  const hotelLinks = [
    has("Dining") && { href: `${base}/dining`, label: "Dining" },
    has("Experiences") && { href: `${base}/experiences`, label: "Experiences" },
    availablePages(hotel).events && { href: `${base}/events`, label: "Events" },
    { href: `${base}/explore`, label: "Explore" },
  ].filter(Boolean) as { href: string; label: string }[];
  const tel = `tel:${hotel.phone.replace(/[^+\d]/g, "")}`;

  return (
    <footer className="mt-auto border-t border-line bg-surface pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 md:py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 md:gap-y-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.3fr] lg:gap-10">
          {/* brand */}
          <div className="col-span-2 lg:col-span-1">
            <Logo text={hotel.logoText} href={base} />
            <p className="mt-2 max-w-xs text-[14px] text-muted md:mt-3 md:text-[15px]">{hotel.tagline}</p>
            <div className="mt-5 flex gap-2">
              {(Object.keys(icons) as (keyof typeof icons)[]).map((k) =>
                hotel.social[k] ? (
                  <a key={k} href={hotel.social[k]} aria-label={k} className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors hover:border-brand-ring hover:text-action">
                    <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>{icons[k]}</svg>
                  </a>
                ) : null,
              )}
            </div>
          </div>

          <div className="hidden md:block"><Col title="Stay" links={stay} /></div>
          <div className="hidden md:block"><Col title="About" links={hotelLinks} /></div>

          {/* contact */}
          <div className="col-span-2 lg:col-span-1">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted"><T>Contact</T></p>
            <ul className="mt-3 space-y-1 text-[15px] text-ink/80">
              <li className="flex min-h-9 items-start gap-3 py-1.5"><MapPin className="mt-0.5 size-[18px] shrink-0 text-muted" /> <DraftInfo slug={hotel.slug} field="address" fallback={hotel.address} /></li>
              <li><a href={tel} className="flex min-h-9 items-center gap-3 hover:text-action"><Phone className="size-[18px] shrink-0 text-muted" /> <DraftInfo slug={hotel.slug} field="phone" fallback={hotel.phone} /></a></li>
              <li><a href={`mailto:${hotel.email}`} className="flex min-h-9 items-center gap-3 break-all hover:text-action"><Mail className="size-[18px] shrink-0 text-muted" /> <DraftInfo slug={hotel.slug} field="email" fallback={hotel.email} /></a></li>
            </ul>
            <p className="mt-3 text-[13px] text-muted">Check-in {hotel.checkIn} · Check-out {hotel.checkOut}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1240px] flex-col-reverse items-start gap-3 px-4 py-4 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {hotel.name}</span>
          <a href="https://technology.bingi.com.bd" className="flex min-h-10 items-center gap-2 hover:text-ink">
            <T>Website & booking by</T>
            <Image src="/brand/bingi-master.svg" alt="BinGi" width={66} height={22} className="h-[22px] w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
}
