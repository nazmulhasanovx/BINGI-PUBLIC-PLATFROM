"use client";
import Link from "next/link";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ChartColumn, ChevronDown, Hourglass, Briefcase, Building2, CalendarDays, CircleCheck, DoorOpen, Globe, LayoutGrid, List, Moon, Settings2, UserPlus, Phone, Plus, Store, Sun, Plane } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { channelLabel, dmy, dow, dueOf, flags, payState, useBookings, type BStatus, type Booking, type Bk, type Channel, type PayState } from "@/lib/bookings/store";
import { useBkMode, type BkMode } from "@/lib/bookings/mode";
import { useGuests, type GuestRow } from "@/lib/guests/store";
import { useProperty } from "../property";
import { Menu } from "../staff/ui";

type Ctx = { bk: Bk; guests: Map<string, GuestRow>; g: ReturnType<typeof useGuests>; mode: BkMode; open: (code: string | null, view?: "checkin" | "checkout") => void; toast: (t: string) => void };
const C = createContext<Ctx | null>(null);
export const BkCtx = C;
export type BkCtxValue = Ctx;
export function Toast({ text }: { text: string }) {
  return <div role="status" className="hms-up fixed bottom-6 left-1/2 z-[95] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0f1720] px-4 py-2.5 text-[14px] font-medium text-white shadow-lg"><CircleCheck className="size-4 shrink-0 text-[#7ee2a8]" />{text}</div>;
}
export const useBk = () => useContext(C)!;

export type BkTab = "today" | "calendar" | "board" | "list" | "waitlist" | "reports" | "close" | "settings";
/** Live HMS structure: one bookings table, plus Calendar and Room board views; the rest sits under More. */
const VIEWS: { id: BkTab; label: string; href: string; icon: typeof Sun }[] = [
  { id: "list", label: "Table", href: "/hms/bookings", icon: List },
  { id: "calendar", label: "Calendar", href: "/hms/bookings/calendar", icon: CalendarDays },
  { id: "board", label: "Room board", href: "/hms/bookings/board", icon: LayoutGrid },
];
const MORE: { id: BkTab; label: string; href: string; icon: typeof Sun }[] = [
  { id: "waitlist", label: "Waitlist", href: "/hms/bookings/waitlist", icon: Hourglass },
  { id: "close", label: "Day close (night audit)", href: "/hms/bookings/close", icon: Moon },
  { id: "reports", label: "Booking reports", href: "/hms/bookings/reports", icon: ChartColumn },
  { id: "settings", label: "Booking policies", href: "/hms/settings/policies", icon: Settings2 },
];
export const viewBtn = (on: boolean) => clsx("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-[14px] font-semibold transition-colors", on ? "bg-[#ffecec] text-[#c8232e]" : "text-[#4d5664] hover:bg-hms-hover hover:text-hms-ink");

/** Bookings use one view everywhere (the old Easy / Details switch showed nearly the same screen). */
export function ModeSwitch() { return null; }

function ViewBar({ tab }: { tab: BkTab }) {
  const t = tab === "today" ? "list" : tab;
  const more = MORE.find((m) => m.id === t);
  return (
    <nav aria-label="Bookings views" className="flex shrink-0 items-center gap-1">
      {VIEWS.map((v) => <Link key={v.id} href={v.href} aria-current={t === v.id ? "page" : undefined} className={viewBtn(t === v.id)}><v.icon className="size-4" />{v.label}</Link>)}
      <details className="relative">
        <summary className={clsx(viewBtn(!!more), "cursor-pointer list-none [&::-webkit-details-marker]:hidden")}>{more ? more.label.replace(/ \(.*/, "") : "More"}<ChevronDown className="size-4" /></summary>
        <div className="hms-pop absolute right-0 top-full z-30 mt-1 w-[230px] rounded-2xl border border-hms-line bg-white p-1.5 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.25)]">
          {MORE.map((m) => <Link key={m.id} href={m.href} aria-current={t === m.id ? "page" : undefined} className={clsx("flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] hover:bg-hms-hover", t === m.id && "font-semibold text-[#c8232e]")}><m.icon className="size-4 text-hms-muted" />{m.label}</Link>)}
        </div>
      </details>
    </nav>
  );
}

export function BookingsFrame({ tab, children, sub, bar }: { tab: BkTab; children: ReactNode; sub?: ReactNode; bar?: ReactNode }) {
  const h = useProperty();
  const bk = useBookings(h);
  const g = useGuests(h);
  const { mode } = useBkMode();
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [toastText, setToast] = useState(() => sp.get("made") ?? "");
  useEffect(() => { if (!toastText) return; const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); }, [toastText]);
  const guests = useMemo(() => new Map(g.rows.map((r) => [r.id, r])), [g.rows]);
  // Old links (?b=CODE on a list) go straight to the booking page.
  const code = sp.get("b");
  useEffect(() => { if (code) router.replace(`/hms/bookings/view?b=${code}${sp.get("do") ? `&do=${sp.get("do")}` : ""}`); }, [code, router, sp]);
  // Bookings open as one full page with tabs (like the live HMS Manage Booking), never a side panel.
  const open = useCallback((c: string | null, view?: "checkin" | "checkout") => {
    if (c) router.push(`/hms/bookings/view?b=${c}${view ? `&do=${view}` : ""}&from=${encodeURIComponent(path)}`);
  }, [router, path]);
  const msg = sp.get("made");
  useEffect(() => { if (msg) { const q = new URLSearchParams(sp.toString()); q.delete("made"); router.replace(`${path}?${q}`, { scroll: false }); } }, [msg, sp, router, path]);
  return (
    <C.Provider value={{ bk, guests, g, mode, open, toast: setToast }}>
      <div className="h-full overflow-y-auto"><div className="hms-page">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-bold tracking-[-0.01em]">Bookings</h1>
            <p className="text-[14px] text-hms-muted">Manage your hotel reservations · Today {dow(TODAY)}, {dmy(TODAY)}</p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Link href="/hms/bookings/walkin" className={clsx(bSoft, "ml-auto sm:ml-0")}><UserPlus className="size-4" /><span className="hidden sm:inline">Walk-in</span><span className="sr-only sm:hidden">Walk-in</span></Link>
            <Link href="/hms/bookings/new" className={bMain}><Plus className="size-4" />New booking</Link>
            <Menu label="More actions" items={[{ label: "Reset demo bookings", onClick: () => { bk.reset(); setToast("Demo bookings reset"); }, danger: true }]} />
          </div>
        </div>
        {sub}
        <div className={clsx(card, "mt-4 flex flex-wrap items-center gap-2 p-1.5")}>
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">{bar ?? <span className="px-2.5 text-[14.5px] font-semibold">{[...VIEWS, ...MORE].find((v) => v.id === tab)?.label}</span>}</div>
          <div className="no-scrollbar flex max-w-full overflow-x-auto"><ViewBar tab={tab} /></div>
        </div>
        <div className="mt-4">{bk.ready ? children : <p role="status" className="py-10 text-[14px] text-hms-muted">Loading bookings…</p>}</div>
      </div></div>
      {toastText && <Toast text={toastText} />}
    </C.Provider>
  );
}

// ---------- pills (booking status, payment and flags are always separate) ----------
const ST: Record<BStatus, string> = {
  Confirmed: "bg-[#e8f0fe] text-[#1d4ed8]", "Checked in": "bg-[#e5f5ec] text-[#16693a]", "Checked out": "bg-hms-hover text-[#4d5664]",
  Cancelled: "bg-[#fdecec] text-[#b42318]", "No-show": "bg-[#fdecec] text-[#b42318]",
};
const STL: Record<BStatus, string> = { Confirmed: "Confirmed", "Checked in": "In house", "Checked out": "Checked out", Cancelled: "Cancelled", "No-show": "No-show" };
export const statusLabel = (s: BStatus) => STL[s];
export function StatusPill({ s }: { s: BStatus }) {
  return <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[12.5px] font-semibold", ST[s])}><span className="size-1.5 rounded-full bg-current" />{STL[s]}</span>;
}
const PS: Record<PayState, string> = { Paid: "text-[#16693a]", "Partly paid": "text-[#a15c00]", Due: "text-[#b42318]", "Refund due": "text-[#6b55e0]" };
export function PayPill({ b }: { b: Booking }) {
  const p = payState(b);
  return <span className={clsx("inline-flex items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold", PS[p])}>{p}</span>;
}
const CH: Record<Channel, [typeof Globe, string]> = {
  "Walk-in": [DoorOpen, "bg-[#eef0f3] text-[#3a414c]"], Phone: [Phone, "bg-[#eef0f3] text-[#3a414c]"], Website: [Globe, "bg-[#e8f0fe] text-[#1d4ed8]"],
  Marketplace: [Store, "bg-hms-coral-soft text-hms-red"], OTA: [Plane, "bg-[#f1edff] text-[#5b45c9]"], Agent: [Briefcase, "bg-[#fdf3d9] text-[#7a4a0b]"], Corporate: [Building2, "bg-[#e5f5ec] text-[#16693a]"],
};
/** Where the booking came from — shown everywhere the same way. */
export function ChannelBadge({ b }: { b: Pick<Booking, "channel" | "ota"> }) {
  const [I, tone] = CH[b.channel] ?? CH["Walk-in"];
  return <span className={clsx("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[12px] font-semibold", tone)}><I className="size-3.5" aria-hidden />{channelLabel(b)}</span>;
}
export const channelIcon = (c: Channel) => (CH[c] ?? CH["Walk-in"])[0];
export function Flags({ b }: { b: Booking }) {
  const f = flags(b);
  if (!f.length) return null;
  return <>{f.map((x) => <span key={x} className="inline-flex whitespace-nowrap rounded-md bg-[#fff4e0] px-2 py-0.5 text-[12px] font-semibold text-[#8a4b00]">{x}</span>)}</>;
}
export const due = dueOf;
export const card = "rounded-2xl border border-hms-line bg-white";
// Buttons (live HMS foundation): one red main action per screen; white with a 1 px border for the rest. 12 px corners.
const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,transform,box-shadow] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45";
export const bMain = clsx(base, "btn-glow h-11 px-5 text-[14.5px] text-white");
export const bSoft = clsx(base, "h-11 border border-hms-line bg-white px-4 text-[14.5px] text-hms-ink hover:bg-hms-hover");
export const bSmall = clsx(base, "h-9 px-3.5 text-[13.5px]");
export const bDark = clsx(base, "h-10 border border-hms-line bg-white px-4 text-[14px] text-hms-ink hover:bg-hms-hover");
