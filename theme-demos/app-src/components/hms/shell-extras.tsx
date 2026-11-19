"use client";
// Header tools that used to be dead buttons: ⌘K search, notifications, language, account.
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Bell, Boxes, CalendarCheck, Check, ChevronDown, CircleHelp, CornerDownLeft, Languages, LogOut, MessageSquareReply, Search, Sparkles, User, UserRoundCheck, type LucideIcon } from "lucide-react";
import { useProperty } from "./property";
import { useGuests } from "@/lib/guests/store";
import { hasInventory, statusOf, useInventory } from "@/lib/inventory/store";
import { hasServices, useServices } from "@/lib/services/store";
import { channelLabel, dm, useBookings } from "@/lib/bookings/store";
import { useGuestState } from "@/lib/store";
import { TODAY } from "@/lib/rooms/store";
import { useHrm, TODAY as HRM_TODAY } from "@/lib/hrm/store";

/** Click-outside + Escape for a small popover. */
export function usePop() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const c = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", c); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", c); document.removeEventListener("keydown", k); };
  }, [open]);
  return { open, setOpen, ref };
}
const panel = "hms-pop absolute right-0 top-full z-50 mt-2 rounded-2xl border border-hms-line bg-white p-1.5 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.25)]";

import { refundsDue, toCollect } from "@/lib/payments/ledger";
import { useExpenses } from "@/lib/expenses/store";
import { can } from "@/lib/plan";
import { useChatData } from "./chat/page";
import { useCommData } from "./communication/data";
import { useRestaurant } from "./meals/shared";
import { useNewsNotes } from "./news";
import { AlertTriangle, Globe, Megaphone, MessageSquare, QrCode, Receipt, RotateCcw, Wallet } from "lucide-react";

// ---------------- Notifications (derived from real prototype data) ----------------
type Note = { id: string; icon: LucideIcon; tone: string; title: string; sub: string; href: string };
function useNotes(): Note[] {
  const h = useProperty();
  const g = useGuests(h);
  const inv = useInventory(h);
  const svc = useServices(h);
  const { st: hrm } = useHrm();
  const bk = useBookings(h);
  const chat = useChatData().chat;
  const ex = useExpenses(h);
  const comm = useCommData().comm;
  const rest = useRestaurant();
  const web = useGuestState(h.slug).bookings.filter((b) => b.bookingStatus === "pending").length;
  return useMemo(() => {
    const out: Note[] = [];
    if (web) out.push({ id: `web-${web}`, icon: Globe, tone: "bg-[#e8f0fe] text-[#1d4ed8]", title: `${web} website request${web === 1 ? "" : "s"} to accept`, sub: "Accept or decline in Bookings › Today", href: "/hms/bookings" });
    const pl = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
    const col = toCollect(bk.list, TODAY).filter((x) => x.rank <= 3);
    if (col.length) out.push({ id: `pay-${col.length}`, icon: Wallet, tone: "bg-[#fde8e8] text-[#b11c29]", title: `${pl(col.length, "guest")} to collect from`, sub: `${col.map((x) => x.b.code).slice(0, 3).join(", ")} · ৳${new Intl.NumberFormat("en-IN").format(col.reduce((s, x) => s + x.due, 0))}`, href: "/hms/payments?tab=collect" });
    if (chat.unread) out.push({ id: `chat-${chat.unread}`, icon: MessageSquare, tone: "bg-[#e8f0fe] text-[#1d4ed8]", title: `${pl(chat.unread, "unread guest message")}`, sub: "Reply in Chat", href: "/hms/chat" });
    const qr = can(h, "restaurant") ? rest.m.st.orders.filter((o) => o.status === "approval").length : 0;
    if (qr) out.push({ id: `qr-${qr}`, icon: QrCode, tone: "bg-[#fdefe7] text-[#d9622b]", title: `${pl(qr, "order")} waiting for approval`, sub: "QR / POS orders in Restaurant & Bar", href: "/hms/meals/orders" });
    const pend = can(h, "expenses") ? ex.st.expenses.filter((e) => e.status === "pending").length : 0;
    if (pend) out.push({ id: `ex-${pend}`, icon: Receipt, tone: "bg-[#fdf3d9] text-[#a76f00]", title: `${pl(pend, "expense")} waiting approval`, sub: "Above the approval limit", href: "/hms/operations?tab=list" });
    const rf = refundsDue(bk.list).length;
    if (rf) out.push({ id: `rf-${rf}`, icon: RotateCcw, tone: "bg-[#fde8e8] text-[#b11c29]", title: `${pl(rf, "refund")} to give back`, sub: "Guests paid more than the bill", href: "/hms/payments?tab=refunds" });
    const fail = comm.st.log.filter((m) => m.status === "failed").length;
    if (fail) out.push({ id: `msg-${fail}`, icon: AlertTriangle, tone: "bg-[#fde8e8] text-[#b11c29]", title: `${pl(fail, "message")} not delivered`, sub: "Check the number or email, then resend", href: "/hms/communication?tab=history" });
    const arriving = g.rows.filter((r) => r.state === "Arriving today");
    if (arriving.length) out.push({ id: "arr", icon: CalendarCheck, tone: "bg-[#fdefe7] text-[#d9622b]", title: `${arriving.length} guest${arriving.length > 1 ? "s" : ""} arriving today`, sub: arriving.map((r) => r.name).slice(0, 3).join(", "), href: "/hms/guests" });
    const noId = g.rows.filter((r) => r.state === "In house" && r.idMissing);
    if (noId.length) out.push({ id: "id", icon: UserRoundCheck, tone: "bg-[#fde8e8] text-[#b11c29]", title: `${noId.length} in-house guest${noId.length > 1 ? "s" : ""} without ID`, sub: "Collect ID at the front desk", href: "/hms/guests" });
    const reply = g.reviews.filter((r) => !r.reply).length;
    if (reply) out.push({ id: "rv", icon: MessageSquareReply, tone: "bg-[#fdf3d9] text-[#a76f00]", title: `${reply} review${reply > 1 ? "s" : ""} waiting for a reply`, sub: "Replies show after BinGi approves", href: "/hms/guests/reviews" });
    if (hasInventory(h)) {
      const low = inv.items.filter((i) => statusOf(i) !== "In stock");
      if (low.length) out.push({ id: "inv", icon: Boxes, tone: "bg-[#f1edff] text-[#6b55e0]", title: `${low.length} item${low.length > 1 ? "s" : ""} low or out of stock`, sub: low.map((i) => i.name).slice(0, 3).join(", "), href: "/hms/inventory" });
      const att = hrm.attendance[HRM_TODAY] ?? {};
      const miss = hrm.employees.filter((e) => e.status === "active" && (!att[e.id] || att[e.id].status === "absent")).length;
      if (miss) out.push({ id: "att", icon: UserRoundCheck, tone: "bg-[#e8f0fe] text-[#1d4ed8]", title: `${miss} attendance exception${miss > 1 ? "s" : ""}`, sub: "Absent or not marked today", href: "/hms/staff/attendance" });
    }
    if (hasServices(h)) {
      const sched = svc.st.orders.filter((o) => !o.cancelled && o.when !== "now").length;
      if (sched) out.push({ id: "svc", icon: Sparkles, tone: "bg-[#e5f5ec] text-[#1c7d45]", title: `${sched} scheduled service order${sched > 1 ? "s" : ""}`, sub: "Check times in Other Services", href: "/hms/other-services/orders" });
    }
    return out;
  }, [g.rows, g.reviews, inv.items, svc.st.orders, hrm, h, bk.list, chat.unread, ex.st.expenses, comm.st.log, rest.m.st.orders, web]);
}

const READ_KEY = "hms-notes-read";
const readSubs = new Set<() => void>();
const readRaw = () => { try { return localStorage.getItem(READ_KEY) ?? "[]"; } catch { return "[]"; } };
export function Notifications() {
  const own = useNotes();
  const news = useNewsNotes();
  const notes = useMemo(() => [...news, ...own], [news, own]);
  const { open, setOpen, ref } = usePop();
  const raw = useSyncExternalStore((f) => { readSubs.add(f); return () => { readSubs.delete(f); }; }, readRaw, () => "[]");
  const read: string[] = useMemo(() => { try { return JSON.parse(raw); } catch { return []; } }, [raw]);
  const unread = notes.filter((n) => !read.includes(n.id)).length;
  const markAll = () => { try { localStorage.setItem(READ_KEY, JSON.stringify(notes.map((n) => n.id))); } catch {} readSubs.forEach((f) => f()); };
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="dialog" aria-expanded={open} aria-label={`Notifications${unread ? `, ${unread} new` : ""}`} className="relative grid size-9 place-items-center rounded-lg hover:bg-hms-hover">
        <Bell className="size-[17px]" />
        {unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-hms-red px-1 text-[10px] font-bold leading-4 text-white">{unread}</span>}
      </button>
      {open && (
        <div role="dialog" aria-label="Notifications" className={clsx(panel, "w-[min(360px,calc(100vw-24px))]")}>
          <div className="flex items-center justify-between px-2.5 py-2"><p className="text-[15px] font-bold">Today</p>{unread > 0 && <button onClick={markAll} className="text-[13px] font-semibold text-hms-red">Mark all read</button>}</div>
          {notes.length === 0 ? <p className="px-2.5 pb-3 text-[14px] text-hms-muted">All clear — nothing needs you right now.</p> : (
            <ul>{notes.map((n) => (
              <li key={n.id}><Link href={n.href} onClick={() => setOpen(false)} className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 hover:bg-hms-hover">
                <span className={clsx("grid size-9 shrink-0 place-items-center rounded-lg", n.tone)}><n.icon className="size-[18px]" /></span>
                <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold">{n.title}</span><span className="block truncate text-[12.5px] text-hms-muted">{n.sub}</span></span>
                {!read.includes(n.id) && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-hms-red" aria-label="New" />}
              </Link></li>
            ))}</ul>
          )}
          <p className="border-t border-hms-line px-2.5 pb-1 pt-2 text-[11.5px] text-hms-muted">Built from this property’s data and BinGi news. Push / SMS alerts are not connected yet.</p>
        </div>
      )}
    </div>
  );
}

// ---------------- Language ----------------
export function LanguageMenu() {
  const { open, setOpen, ref } = usePop();
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Language: English" className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-[14px] text-hms-ink hover:bg-hms-hover"><Languages className="size-[17px]" /> EN</button>
      {open && (
        <div role="menu" className={clsx(panel, "w-[220px]")}>
          <button role="menuitemradio" aria-checked onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] hover:bg-hms-hover"><span className="flex-1">English</span><Check className="size-4 text-hms-red" /></button>
          <button role="menuitemradio" aria-checked={false} aria-disabled className="flex w-full cursor-default items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] text-hms-muted"><span className="flex-1">বাংলা</span><span className="rounded-md bg-hms-hover px-1.5 py-0.5 text-[11px] font-semibold">Coming soon</span></button>
        </div>
      )}
    </div>
  );
}

// ---------------- Account ----------------
export function AccountMenu() {
  const h = useProperty();
  const { open, setOpen, ref } = usePop();
  return (
    <div ref={ref} className="relative ml-1">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-hms-hover">
        <span className="grid size-8 place-items-center rounded-full bg-hms-coral-soft text-[12px] font-bold text-hms-red">MY</span>
        <span className="hidden text-[14px] font-semibold sm:inline">Md Yeapas</span>
        <ChevronDown className={clsx("size-4 text-hms-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className={clsx(panel, "w-[260px]")}>
          <div className="px-3 py-2.5"><p className="text-[14.5px] font-bold">Md Yeapas</p><p className="text-[12.5px] text-hms-muted">Owner · {h.name}</p></div>
          <div className="my-1 border-t border-hms-line" />
          <Link role="menuitem" href="/hms/staff/people" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] hover:bg-hms-hover"><User className="size-4 text-hms-muted" />My profile</Link>
          <Link role="menuitem" href="/hms/news" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] hover:bg-hms-hover"><Megaphone className="size-4 text-hms-muted" />BinGi news & updates</Link>
          <Link role="menuitem" href="/hms/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] hover:bg-hms-hover"><CircleHelp className="size-4 text-hms-muted" />Help & settings</Link>
          <Link role="menuitem" href="/onboarding" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] hover:bg-hms-hover"><LogOut className="size-4 text-hms-muted" />Sign out <span className="ml-auto text-[11.5px] text-hms-muted">demo</span></Link>
        </div>
      )}
    </div>
  );
}

// ---------------- ⌘K search ----------------
export type NavTarget = { label: string; href: string; icon: LucideIcon };
type Hit = { label: string; sub: string; href: string; group: string; icon?: LucideIcon };

export function SearchBox({ items }: { items: NavTarget[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.isContentEditable)) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Search (⌘K)" className="hidden h-9 w-[210px] items-center gap-2 rounded-full bg-hms-hover px-3 text-left text-[13px] text-hms-muted hover:bg-[#e3e7ec] lg:flex">
        <Search className="size-4 shrink-0" /><span className="flex-1 truncate whitespace-nowrap">Search…</span><kbd className="font-sans text-[11px] font-semibold">⌘K</kbd>
      </button>
      <button onClick={() => setOpen(true)} aria-label="Search" className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover lg:hidden"><Search className="size-[17px]" /></button>
      {open && <Palette items={items} onClose={() => setOpen(false)} />}
    </>
  );
}

function Palette({ items, onClose }: { items: NavTarget[]; onClose: () => void }) {
  const h = useProperty();
  const router = useRouter();
  const g = useGuests(h);
  const inv = useInventory(h);
  const svc = useServices(h);
  const bk = useBookings(h);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const back = useRef<HTMLElement | null>(null);
  useEffect(() => { back.current = document.activeElement as HTMLElement; document.body.style.overflow = "hidden"; const b = back.current; return () => { document.body.style.overflow = ""; b?.focus?.(); }; }, []);
  const hits: Hit[] = useMemo(() => {
    const k = q.trim().toLowerCase();
    const m = (s: string) => !k || s.toLowerCase().includes(k);
    const kd = k.replace(/\D/g, "");
    const pages = items.filter((x) => m(x.label)).map((x) => ({ label: x.label, sub: "Go to", href: x.href, group: "Pages", icon: x.icon }));
    if (!k) return pages.slice(0, 8);
    const guests = g.rows.filter((r) => m(r.name) || m(r.id) || (kd.length >= 3 && r.phone.replace(/\D/g, "").includes(kd))).slice(0, 5).map((r) => ({ label: r.name, sub: `${r.state} · ${r.phone}`, href: `/hms/guests/${r.id}`, group: "Guests" }));
    const stock = hasInventory(h) ? inv.items.filter((x) => m(x.name) || m(x.sku)).slice(0, 4).map((x) => ({ label: x.name, sub: `${x.sku} · ${x.qty} ${x.unit} · ${statusOf(x)}`, href: "/hms/inventory", group: "Inventory" })) : [];
    const services = hasServices(h) ? svc.st.services.filter((x) => !x.archived && m(x.name)).slice(0, 4).map((x) => ({ label: x.name, sub: `৳${x.price} · ${x.duration}`, href: "/hms/other-services", group: "Services" })) : [];
    const gname = new Map(g.rows.map((r) => [r.id, r]));
    const bookings = bk.list.filter((b) => { const r = gname.get(b.guestId); return m(b.code) || (b.channelRef && m(b.channelRef)) || (b.unit && k === b.unit.toLowerCase()) || (r && (m(r.name) || (kd.length >= 3 && r.phone.replace(/\D/g, "").includes(kd)))); })
      .sort((a, c) => Math.abs(Date.parse(a.from) - Date.parse(TODAY)) - Math.abs(Date.parse(c.from) - Date.parse(TODAY))).slice(0, 5)
      .map((b) => ({ label: `${gname.get(b.guestId)?.name ?? "Guest"} · ${b.code}`, sub: `${b.unit ? `Room ${b.unit} · ` : ""}${dm(b.from)} → ${dm(b.to)} · ${b.status} · ${channelLabel(b)}`, href: `/hms/bookings/view?b=${b.code}`, group: "Bookings" }));
    return [...pages.slice(0, 5), ...bookings, ...guests, ...stock, ...services];
  }, [q, items, g.rows, inv.items, svc.st.services, h, bk.list]);
  const sel = Math.min(i, Math.max(0, hits.length - 1));
  const go = (x?: Hit) => { if (!x) return; onClose(); router.push(x.href); };
  const groups = [...new Set(hits.map((x) => x.group))];
  return createPortal(
    <div className="hms-app hms-fade fixed inset-0 z-[100] flex items-start justify-center bg-black/25 px-3 pt-[12vh]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Search" onClick={(e) => e.stopPropagation()} className="hms-pop w-full max-w-[560px] overflow-hidden rounded-2xl border border-hms-line bg-white shadow-2xl" style={{ transformOrigin: "top center" }}>
        <label className="flex h-14 items-center gap-3 border-b border-hms-line px-4">
          <Search className="size-5 text-hms-muted" /><span className="sr-only">Search</span>
          <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} role="combobox" aria-expanded aria-controls="pal-list" aria-activedescendant={hits[sel] ? `pal-${sel}` : undefined}
            onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(hits.length - 1, x + 1)); } else if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); } else if (e.key === "Enter") go(hits[sel]); else if (e.key === "Escape") onClose(); }}
            placeholder="Search bookings, guests, phone, room, pages…" className="h-full flex-1 bg-transparent text-[16px] outline-none focus-visible:outline-none" />
          <kbd className="rounded-md border border-hms-line px-1.5 text-[11px] text-hms-muted">Esc</kbd>
        </label>
        <ul id="pal-list" role="listbox" aria-label="Results" className="max-h-[min(420px,60vh)] overflow-y-auto p-1.5">
          {hits.length === 0 && <li className="px-3 py-8 text-center text-[14px] text-hms-muted">Nothing found for “{q}”.</li>}
          {groups.map((grp) => (
            <li key={grp} role="presentation">
              <p className="px-3 pb-1 pt-2 text-[11.5px] font-semibold uppercase tracking-wider text-hms-muted">{grp}</p>
              <ul role="presentation">{hits.map((x, n) => x.group !== grp ? null : (
                <li key={x.group + x.href + x.label} id={`pal-${n}`} role="option" aria-selected={n === sel} onMouseEnter={() => setI(n)} onClick={() => go(x)}
                  className={clsx("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2", n === sel ? "bg-hms-coral-soft" : "")}>
                  {x.icon ? <x.icon className="size-4 text-hms-muted" /> : <span className="grid size-6 place-items-center rounded-full bg-hms-hover text-[10px] font-bold">{x.label.slice(0, 1)}</span>}
                  <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold">{x.label}</span><span className="block truncate text-[12.5px] text-hms-muted">{x.sub}</span></span>
                  {n === sel && <CornerDownLeft className="size-4 text-hms-muted" />}
                </li>
              ))}</ul>
            </li>
          ))}
        </ul>
        <p className="flex gap-4 border-t border-hms-line px-4 py-2 text-[12px] text-hms-muted"><span>↑↓ move</span><span>↵ open</span><span>Esc close</span><span className="ml-auto">⌘K or /</span></p>
      </div>
    </div>,
    document.body,
  );
}

export function IconBtn({ label, children, onClick }: { label: string; children: ReactNode; onClick?: () => void }) {
  return <button aria-label={label} onClick={onClick} className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover">{children}</button>;
}
