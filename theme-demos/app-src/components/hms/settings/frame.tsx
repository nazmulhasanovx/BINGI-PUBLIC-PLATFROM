"use client";
// HMS Settings — same two-pane frame as the live HMS and Website Management: grouped list on the left, one page on the right.
// Cleaned from the live 25 items to 17: duplicates merged (Appearance + Personal preferences + Activity widget → My preferences;
// Notification rules + Guest messaging → Guest messages; Invoices + Contract + Confirmation letters → Invoices & documents;
// Booking channels + Website & marketplace → Website & channels). Billing lives here only.
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { unsaved } from "./pages";
import { Activity, BedDouble, Brush, Building2, CalendarClock, CreditCard, FileText, Globe, Home, KeyRound, Languages, MessageSquare, Palette, Receipt, Search, ShieldCheck, SlidersHorizontal, UtensilsCrossed, Users } from "lucide-react";

export type SPage = { id: string; label: string; group: string; icon: ComponentType<{ className?: string; strokeWidth?: number }>; kw: string };
export const S_PAGES: SPage[] = [
  { id: "overview", label: "Overview", group: "", icon: Home, kw: "setup checklist recent changes" },
  { id: "profile", label: "Property profile", group: "Property", icon: Building2, kw: "name address phone email trade licence tin bin billing contact" },
  { id: "branding", label: "Branding", group: "Property", icon: Palette, kw: "logo favicon icon restaurant logo" },
  { id: "regional", label: "Language & region", group: "Property", icon: Languages, kw: "time zone currency date time format language country" },
  { id: "policies", label: "Booking policies", group: "Stay & operations", icon: CalendarClock, kw: "check-in check-out early late cancellation no-show deposit child extra bed advance" },
  { id: "taxes", label: "Taxes & pricing", group: "Stay & operations", icon: Receipt, kw: "vat service charge minimum rate discount approval" },
  { id: "housekeeping", label: "Housekeeping rules", group: "Stay & operations", icon: Brush, kw: "dirty inspection out of order priority" },
  { id: "restaurant", label: "Restaurant & inventory", group: "Stay & operations", icon: UtensilsCrossed, kw: "kitchen accept printer pos inventory modules" },
  { id: "channels", label: "Website & channels", group: "Online", icon: Globe, kw: "website marketplace ota booking.com agoda expedia airbnb online booking" },
  { id: "payments", label: "Guest payments", group: "Money", icon: CreditCard, kw: "cash bkash nagad card bank gateway payment methods" },
  { id: "documents", label: "Invoices & documents", group: "Money", icon: FileText, kw: "invoice receipt prefix terms footer paper contract letter confirmation printer" },
  { id: "billing", label: "Billing & plan", group: "Money", icon: BedDouble, kw: "plan subscription bills upgrade modules" },
  { id: "messages", label: "Guest messages", group: "Messages", icon: MessageSquare, kw: "notification email sms whatsapp template chat shortcut location" },
  { id: "users", label: "Users & roles", group: "Access", icon: Users, kw: "staff invite permissions role access" },
  { id: "security", label: "Security", group: "Access", icon: ShieldCheck, kw: "password two-step 2fa sessions timeout" },
  { id: "properties", label: "Properties", group: "Access", icon: KeyRound, kw: "branch branches property switch add property" },
  { id: "activity", label: "Activity log", group: "System", icon: Activity, kw: "audit log changes history export data" },
  { id: "preferences", label: "My preferences", group: "System", icon: SlidersHorizontal, kw: "appearance sidebar text size motion personal" },
];

/** Ask before leaving a page with unsaved changes. */
function leaveGuard(e: React.MouseEvent) {
  if (unsaved.dirty && !window.confirm("You have unsaved changes. Leave without saving?")) e.preventDefault();
  else unsaved.dirty = false;
}

export function SettingsNav({ active }: { active: string }) {
  const [q, setQ] = useState("");
  const k = q.trim().toLowerCase();
  const list = S_PAGES.filter((p) => !k || p.label.toLowerCase().includes(k) || p.kw.includes(k) || p.group.toLowerCase().includes(k));
  const groups = [...new Set(list.map((p) => p.group))];
  return (
    <aside className="no-scrollbar hidden w-[228px] shrink-0 overflow-y-auto border-r border-hms-line bg-hms-nav px-2.5 py-3 lg:block" aria-label="Settings">
      <label className="relative mb-2 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-hms-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search settings" aria-label="Search settings" className="h-9 w-full rounded-lg border border-hms-line bg-white pl-9 pr-3 text-[13.5px] outline-none focus:border-hms-coral" />
      </label>
      {groups.map((g) => (
        <div key={g || "top"} className={g ? "mt-2.5" : ""}>
          {g && <p className="px-3 pb-0.5 text-[11.5px] font-medium text-hms-muted">{g}</p>}
          {list.filter((p) => p.group === g).map((p) => {
            const Icon = p.icon; const on = p.id === active;
            return (
              <Link key={p.id} href={`/hms/settings/${p.id}`} aria-current={on ? "page" : undefined} onClick={leaveGuard}
                className={clsx("flex h-[30px] items-center gap-2.5 rounded-lg px-3 text-[13.5px] transition-colors", on ? "bg-white font-semibold text-hms-coral shadow-[0_1px_3px_rgb(0_0_0/0.08)]" : "text-hms-ink hover:bg-white/70")}>
                <Icon className="size-4 shrink-0" strokeWidth={on ? 2.2 : 1.8} />{p.label}
              </Link>
            );
          })}
        </div>
      ))}
      {!list.length && <p className="px-3 py-2 text-[13px] text-hms-muted">Nothing matches “{q}”.</p>}
    </aside>
  );
}

export function SettingsPhoneNav({ active }: { active: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ block: "nearest", inline: "center" }); }, [active]);
  return (
    <nav aria-label="Settings pages" className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto border-b border-hms-line bg-white px-4 py-2 lg:hidden">
      {S_PAGES.map((p) => {
        const on = p.id === active; const Icon = p.icon;
        return (
          <Link key={p.id} ref={on ? ref : undefined} href={`/hms/settings/${p.id}`} onClick={leaveGuard} aria-current={on ? "page" : undefined}
            className={clsx("flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[14px] transition-colors", on ? "bg-hms-coral font-semibold text-white" : "bg-hms-nav text-hms-ink")}>
            <Icon className="size-4" strokeWidth={on ? 2.2 : 1.8} /> {p.label}
          </Link>
        );
      })}
    </nav>
  );
}
