"use client";
import { can } from "@/lib/plan";
// HMS Dashboard (operating property). Layout from Nazmul's reference (10 Nov 2026):
// greeting → 4 KPIs → Today's priorities + Website & booking → Arriving today + plan card.
// Data: rooms come from the Rooms store, staff from the HRM store, website from Website Management.
// Priorities read every module (Bookings, Payments, Restaurant, Chat, Expenses, Communication) — each line
// only shows when there is something to do. Demo data in the prototype (header shows "Prototype · demo data").
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import {
  ArrowRight, BedDouble, ChevronRight, Boxes, CalendarCheck, ChefHat, ClipboardCheck, Monitor, Plus, QrCode, Sparkles, UserRoundCheck, UsersRound, Wallet, Brush,
} from "lucide-react";
import type { Hotel } from "@/lib/types";
import { useRooms, TODAY } from "@/lib/rooms/store";
import { useHrm, TODAY as HRM_TODAY } from "@/lib/hrm/store";
import { useSite } from "@/lib/site";
import { PLANS } from "@/lib/onboarding/store";
import { useProperty } from "./property";
import { statusOf, useInventory } from "@/lib/inventory/store";
import { type BookingStatus } from "@/lib/bookings/demo";
import { useStays } from "@/lib/bookings/store";
import { useGuestNames } from "@/lib/guests/store";
import { useBookings } from "@/lib/bookings/store";
import { useGuestState } from "@/lib/store";
import { refundsDue, toCollect } from "@/lib/payments/ledger";
import { useExpenses } from "@/lib/expenses/store";
import { useRestaurant } from "./meals/shared";
import { useChatData } from "./chat/page";
import { useCommData } from "./communication/data";
import { AlertTriangle, Globe, MessageSquare, Receipt, RotateCcw } from "lucide-react";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const short = (iso: string) => `${iso.slice(8, 10)} ${MON[Number(iso.slice(5, 7)) - 1]}`;
/** "10–12 Nov" in one month, "30 Nov – 02 Dec" across months. */
const stay = (a: string, b: string) => (a.slice(0, 7) === b.slice(0, 7) ? `${a.slice(8, 10)}–${short(b)}` : `${short(a)} – ${short(b)}`);
const bdt = (n: number) => `BDT ${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

export function Dashboard() {
  const [allPri, setAllPri] = useState(false);
  const h = useProperty();
  const { st } = useRooms(h);
  const { st: hrm } = useHrm();
  const site = useSite(h);
  const inv = useInventory(h);
  const lowStock = inv.items.filter((i) => statusOf(i) !== "In stock").length;

  const rooms = useMemo(() => {
    const cat = new Map(st.categories.map((c) => [c.id, c]));
    const live = st.units.filter((u) => u.status === "published");
    const list = (live.length ? live : st.units.filter((u) => u.status !== "archived"));
    return list.map((u) => ({ code: u.code, type: cat.get(u.category)?.name ?? "Room", rate: u.rate ?? cat.get(u.category)?.baseRate ?? 0 }));
  }, [st]);
  const bookings = useStays(h);
  const gmap = useGuestNames(h);
  const names = useMemo(() => new Map([...gmap].map(([id, g]) => [id, g.name])), [gmap]);

  const arriving = bookings.filter((b) => b.status === "Confirmed" && b.from === TODAY);
  const inHouse = bookings.filter((b) => b.status !== "Checked out" && b.from <= TODAY && b.to > TODAY);
  const departing = bookings.filter((b) => b.status === "Checked in" && b.to === TODAY);
  const occupancy = rooms.length ? Math.round((inHouse.length / rooms.length) * 100) : 0;
  const available = rooms.length - inHouse.length;
  const revenue = inHouse.reduce((s, b) => s + b.total / b.nights, 0);

  const hasRestaurant = can(h, "restaurant");
  const hasHrm = can(h, "hrm");
  const active = hrm.employees.filter((e) => e.status === "active");
  const att = hrm.attendance[HRM_TODAY] ?? {};
  const onDuty = active.filter((e) => att[e.id]?.status === "present" || att[e.id]?.status === "half").length;
  const attIssues = active.filter((e) => !att[e.id] || att[e.id].status === "absent").length;

  const hk = can(h, "housekeeping");
  const bk = useBookings(h);
  const rest = useRestaurant();
  const chat = useChatData().chat;
  const ex = useExpenses(h);
  const comm = useCommData().comm;
  const qrWaiting = hasRestaurant ? rest.m.st.orders.filter((o) => o.status === "approval").length : 0;
  const ordersToday = rest.m.st.orders.filter((o) => o.at.startsWith(TODAY) && o.status !== "cancelled" && o.status !== "declined").length;
  const menuItems = rest.m.st.items.filter((i) => i.available).length;
  const collect = toCollect(bk.list, TODAY).filter((x) => x.rank <= 3);
  const refunds = refundsDue(bk.list).length;
  const exPending = can(h, "expenses") ? ex.st.expenses.filter((e) => e.status === "pending").length : 0;
  const failed = comm.st.log.filter((m) => m.status === "failed").length;
  const n = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;
  const webReq = useGuestState(h.slug).bookings.filter((b) => b.bookingStatus === "pending").length;
  const priorities = [
    { icon: Globe, text: `${n(webReq, "website request")} to accept`, href: "/hms/bookings", show: webReq > 0 },
    { icon: Wallet, text: `${n(collect.length, "guest")} to collect from today`, href: "/hms/payments?tab=collect", show: collect.length > 0 },
    { icon: Brush, text: `${n(departing.length, "room")} to clean after check-out`, href: "/hms/housekeeping", show: hk && departing.length > 0 },
    { icon: CalendarCheck, text: `${n(departing.length, "guest")} checking out`, href: "/hms/bookings", show: !hk && departing.length > 0 },
    { icon: QrCode, text: `${n(qrWaiting, "QR order")} waiting for approval`, href: "/hms/meals/orders", show: qrWaiting > 0 },
    { icon: MessageSquare, text: `${n(chat.unread, "unread guest message")}`, href: "/hms/chat", show: chat.unread > 0 },
    { icon: Receipt, text: `${n(exPending, "expense")} waiting approval`, href: "/hms/operations?tab=list", show: exPending > 0 },
    { icon: RotateCcw, text: `${n(refunds, "refund")} to give back`, href: "/hms/payments?tab=refunds", show: refunds > 0 },
    { icon: AlertTriangle, text: `${n(failed, "message")} not delivered`, href: "/hms/communication?tab=history", show: failed > 0 },
    { icon: UserRoundCheck, text: `${n(attIssues, "attendance exception")}`, href: "/hms/staff/attendance", show: hasHrm && attIssues > 0 },
  ].filter((p) => p.show);

  const hour = new Date().getHours();
  const day = new Date(`${TODAY}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }).replace(",", "");
  const kpis = [
    { label: "Arriving today", value: String(arriving.length), icon: CalendarCheck, card: "bg-[#fdefe7]", ink: "text-[#d9622b]" },
    { label: "Occupancy", value: `${occupancy}%`, sub: `${inHouse.length} of ${rooms.length} rooms`, icon: BedDouble, card: "bg-[#eeebfc]", ink: "text-[#6b55e0]" },
    { label: "Available rooms", value: String(available), icon: BedDouble, card: "bg-[#fdf3d9]", ink: "text-[#a76f00]" },
    { label: "Room revenue today", value: bdt(revenue), icon: Wallet, card: "bg-[#e5f5ec]", ink: "text-[#1c7d45]" },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="hms-page space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold tracking-[-0.01em]">{hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"}, Md Yeapas</h1>
            <p className="text-[14px] text-hms-muted">{day}</p>
          </div>
          <Link href="/hms/bookings/new" className="inline-flex h-10 items-center gap-1.5 rounded-lg btn-glow px-4 text-[14px] font-semibold text-white"><Plus className="size-4" />New booking</Link>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className={clsx("flex items-center gap-3 rounded-xl p-3.5 sm:gap-4 sm:p-4", k.card)}>
              <span className={clsx("hidden size-12 shrink-0 sm:grid place-items-center rounded-xl bg-white shadow-[0_1px_2px_rgb(0_0_0/0.05)]", k.ink)}><k.icon className="size-[22px]" strokeWidth={1.8} /></span>
              <div className="min-w-0">
                <p className="truncate text-[19px] font-bold leading-tight tabular-nums sm:text-[22px]">{k.value}</p>
                <p className="text-[13.5px] text-[#4d5664]">{k.label}</p>
                {k.sub && <p className="text-[12.5px] text-[#4d5664]">{k.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
          <section aria-labelledby="pri" className="flex flex-col gap-4 rounded-xl border border-hms-line bg-white p-5 sm:flex-row sm:items-center">
            <span className="hidden size-[104px] shrink-0 place-items-center rounded-2xl bg-[#fdefe7] sm:grid"><span className="grid size-14 place-items-center rounded-xl bg-white text-[#1c7d45] shadow-sm"><ClipboardCheck className="size-7" strokeWidth={1.7} /></span></span>
            <div className="min-w-0 flex-1">
              <h2 id="pri" className="text-[18px] font-bold">Today&apos;s priorities</h2>
              <ul className="mt-2.5 space-y-2">
                {priorities.slice(0, allPri ? 99 : 5).map((p) => (
                  <li key={p.text}><Link href={p.href} className="flex items-center gap-2.5 text-[14.5px] hover:text-hms-red"><p.icon className="size-[18px] shrink-0 text-hms-red" strokeWidth={1.8} />{p.text}</Link></li>
                ))}
                {priorities.length === 0 && <li className="text-[14.5px] text-hms-muted">All clear — nothing waiting right now.</li>}
                {priorities.length > 5 && <li><button onClick={() => setAllPri(!allPri)} className="text-[13.5px] font-semibold text-hms-red underline underline-offset-2">{allPri ? "Show less" : `Show ${priorities.length - 5} more`}</button></li>}
              </ul>
            </div>
            <Link href={priorities[0]?.href ?? "/hms/bookings"} className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#0f1720] px-6 text-[14px] font-semibold text-white hover:bg-black">{priorities.length ? "Start with the first" : "Open bookings"}</Link>
          </section>
          <WebsiteCard h={h} published={!!site.rec.published} domain={site.rec.domain.status === "verified" || site.rec.domain.status === "live"} />
        </div>

        <div className="grid gap-4 min-[1360px]:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
          <section aria-labelledby="arr" className="min-w-0 rounded-xl border border-hms-line bg-white">
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h2 id="arr" className="text-[18px] font-bold">Arriving today ({arriving.length})</h2>
              <Link href="/hms/bookings" className="text-[13.5px] font-semibold text-hms-red">View all</Link>
            </div>
            {arriving.length ? (
              <><div className="hidden overflow-x-auto px-2 pb-3 lg:block">
                <table className="w-full min-w-[540px] text-[14px]">
                  <thead><tr className="text-left text-[12.5px] text-hms-muted"><th className="px-2.5 py-2 font-medium">Guest</th><th className="px-2.5 py-2 font-medium">Room</th><th className="px-2.5 py-2 font-medium">Stay</th><th className="px-2.5 py-2 font-medium">Booking</th><th className="px-2.5 py-2 font-medium">Payment</th><th className="px-2.5 py-2 text-right font-medium"><span className="sr-only">Action</span></th></tr></thead>
                  <tbody>
                    {arriving.map((b) => { const guest = names.get(b.guestId) ?? "Guest"; return (
                      <tr key={b.code} className="border-t border-hms-line">
                        <td className="px-2.5 py-2.5"><span className="flex items-center gap-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-hms-coral-soft text-[11px] font-bold text-hms-red">{guest.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span><span className="block max-w-[130px] truncate font-semibold" title={guest}>{guest}</span></span></td>
                        <td className="px-2.5 py-2.5"><span className="font-medium tabular-nums">{b.room}</span><span className="block max-w-[100px] truncate text-[12px] text-hms-muted" title={b.type}>{b.type}</span></td>
                        <td className="px-2.5 py-2.5 whitespace-nowrap tabular-nums">{stay(b.from, b.to)}</td>
                        <td className="px-2.5 py-2.5"><StatusChip s={b.status} /></td>
                        <td className="px-2.5 py-2.5 whitespace-nowrap tabular-nums">{b.due > 0 ? <span className="font-semibold text-hms-red">{bdt(b.due)} due</span> : <span className="text-[#16693a]">Paid</span>}</td>
                        <td className="px-2.5 py-2.5 text-right"><Link href={`/hms/bookings/view?b=${b.code}`} aria-label={`Open booking for ${guest}`} className="inline-flex h-8 items-center gap-0.5 rounded-lg border border-hms-line pl-2.5 pr-1.5 text-[13px] font-medium hover:bg-hms-hover">Open<ChevronRight className="size-3.5" /></Link></td>
                      </tr>
                    ); })}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-hms-line border-t border-hms-line lg:hidden">
                {arriving.map((b) => { const guest = names.get(b.guestId) ?? "Guest"; return (
                  <li key={b.code}><Link href={`/hms/bookings/view?b=${b.code}`} className="flex items-center gap-3 px-4 py-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-hms-coral-soft text-[12px] font-bold text-hms-red">{guest.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{guest}</span><span className="block text-[12.5px] text-hms-muted">Room {b.room} · {stay(b.from, b.to)}</span></span>
                    <span className="text-right text-[12.5px]">{b.due > 0 ? <span className="font-semibold text-hms-red">{bdt(b.due)} due</span> : <span className="text-[#16693a]">Paid</span>}</span>
                  </Link></li>); })}
              </ul></>
            ) : <p className="px-5 pb-5 text-[14px] text-hms-muted">No arrivals today. Add rooms and publish them to start taking bookings.</p>}
          </section>
          <PlanCard onDuty={onDuty} lowStock={lowStock} hasHrm={hasHrm} hasRestaurant={hasRestaurant} qr={qrWaiting} orders={ordersToday} menu={menuItems} />
        </div>
      </div>
    </div>
  );
}

function StatusChip({ s }: { s: BookingStatus }) {
  const c = s === "Confirmed" ? "bg-[#e5f5ec] text-[#16693a]" : s === "Checked in" ? "bg-[#e8f0fe] text-[#1d4ed8]" : "bg-hms-hover text-[#4d5664]";
  return <span className={clsx("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[12.5px] font-semibold", c)}>{s === "Confirmed" && "✓ "}{s}</span>;
}

function WebsiteCard({ h, published, domain }: { h: Hotel; published: boolean; domain: boolean }) {
  const fees = h.plan === "enterprise" ? null : PLANS[h.plan].fees;
  const cells: [string, string][] = fees ? [["Marketplace", `${fees[0]}%`], ["Web booking", `${fees[1]}%`], ["Walk-in", `${fees[2]}%`]] : [["Booking fees", "As quoted"]];
  return (
    <section aria-labelledby="web" className="rounded-xl border border-hms-line bg-white p-5">
      <h2 id="web" className="text-[18px] font-bold">Website & booking</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={clsx("rounded-md px-2 py-0.5 text-[12.5px] font-semibold", published ? "bg-[#e5f5ec] text-[#16693a]" : "bg-[#fdf3d9] text-[#7a5200]")}>{published ? "✓ Published" : "Not published"}</span>
        <span className={clsx("rounded-md px-2 py-0.5 text-[12.5px] font-semibold", domain ? "bg-[#e5f5ec] text-[#16693a]" : "bg-hms-hover text-hms-muted")}>{domain ? "✓ Domain connected" : "Free BinGi address"}</span>
      </div>
      <p className="mt-3 text-[12px] font-medium text-hms-muted">Booking fees · {h.plan === "enterprise" ? "Custom" : PLANS[h.plan].label}</p>
      <dl className="mt-1 grid grid-cols-3 divide-x divide-hms-line">
        {cells.map(([k, v]) => <div key={k} className="px-2 first:pl-0"><dt className="truncate text-[12.5px] text-hms-muted">{k}</dt><dd className="text-[18px] font-bold tabular-nums">{v}</dd></div>)}
      </dl>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-hms-line pt-3">
        <Link href="/hms/website/design" className="inline-flex items-center gap-1.5 text-[13.5px] text-[#4d5664] hover:text-hms-ink"><Monitor className="size-4" />All themes</Link>
        <Link href="/hms/website/overview" className="inline-flex h-9 items-center rounded-lg border border-hms-line px-3.5 text-[13.5px] font-semibold hover:bg-hms-hover">Manage website</Link>
      </div>
    </section>
  );
}

/** Third card by plan: Ultra = team & inventory · Business = restaurant today · Starter = upgrade. */
function PlanCard({ onDuty, lowStock, hasHrm, hasRestaurant, qr, orders, menu }: { onDuty: number; lowStock: number; hasHrm: boolean; hasRestaurant: boolean; qr: number; orders: number; menu: number }) {
  if (hasHrm) {
    const rows: [typeof UsersRound, string, string][] = [[UsersRound, "Staff on duty", String(onDuty)], [Boxes, "Low stock", `${lowStock} item${lowStock === 1 ? "" : "s"}`], [ChefHat, "Restaurant orders today", String(orders)]];
    return <Rows title="Team & inventory" rows={rows} cta="Open Staff" href="/hms/staff" />;
  }
  if (hasRestaurant) {
    const rows: [typeof UsersRound, string, string][] = [[QrCode, "QR orders waiting", String(qr)], [ChefHat, "Orders today", String(orders)], [Sparkles, "Menu items on sale", String(menu)]];
    return <Rows title="Restaurant today" rows={rows} cta="Open meals" href="/hms/meals" />;
  }
  return (
    <section className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-[#b11c29] to-[#7a1320] p-5 text-white">
      <div><Sparkles className="size-6" /><h2 className="mt-3 text-[18px] font-bold">Need more tools?</h2><p className="mt-1 text-[14px] text-white/85">Business adds housekeeping, restaurant & QR ordering and expenses — and lower booking fees.</p></div>
      <Link href="/hms/settings/billing" className="mt-5 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-white px-4 text-[14px] font-semibold text-[#8e1621]">See Business <ArrowRight className="size-4" /></Link>
    </section>
  );
}

function Rows({ title, rows, cta, href }: { title: string; rows: [typeof UsersRound, string, string][]; cta: string; href: string }) {
  return (
    <section className="flex flex-col rounded-xl border border-hms-line bg-white p-5">
      <h2 className="text-[18px] font-bold">{title}</h2>
      <ul className="mt-2 flex-1 divide-y divide-hms-line">
        {rows.map(([I, k, v]) => (
          <li key={k} className="flex items-center gap-3 py-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-[#fdefe7] text-[#d9622b]"><I className="size-[18px]" strokeWidth={1.8} /></span>
            <span className="flex-1 text-[14.5px]">{k}</span>
            <span className="text-[18px] font-bold tabular-nums">{v}</span>
          </li>
        ))}
      </ul>
      <Link href={href} className="mt-3 inline-flex h-10 items-center justify-center rounded-lg border border-hms-line text-[14px] font-semibold hover:bg-hms-hover">{cta}</Link>
    </section>
  );
}

