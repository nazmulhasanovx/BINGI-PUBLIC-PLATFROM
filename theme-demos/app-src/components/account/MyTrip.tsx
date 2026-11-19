"use client";

import { useState } from "react";
import clsx from "clsx";
import { BedDouble, CalendarDays, ChevronRight, FileText, LogOut, MessageCircle, Navigation, Receipt, ShoppingBag, User, UserCircle2 } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { formatMoney } from "@/lib/data";
import { useGuestState, type GuestBooking } from "@/lib/store";
import { PhoneOtp } from "./PhoneOtp";
import { InvoiceDoc } from "./InvoiceDoc";
import { Sheet } from "@/components/ui/Sheet";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { PriceLines, StayHeader, paidLabelFor } from "@/components/stay/StaySummary";
import { BOOKING_STATUS, PAYMENT_STATUS, icsFor } from "@/components/stay/Confirmation";
import { shortDate } from "@/components/booking/BookingProvider";

type Tab = "overview" | "bookings" | "orders" | "invoices" | "profile";
const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "overview", label: "My Trip", icon: CalendarDays },
  { id: "bookings", label: "Bookings", icon: BedDouble },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "profile", label: "Profile", icon: UserCircle2 },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

export function MyTrip({ hotel }: { hotel: Hotel }) {
  const base = `/hotel/${hotel.slug}`;
  const { ready, session, bookings, signIn, signOut, cancelBooking } = useGuestState(hotel.slug);
  const [tab, setTab] = useState<Tab>("overview");
  const [open, setOpen] = useState<GuestBooking | null>(null);
  const [bill, setBill] = useState<GuestBooking | null>(null);

  if (!ready) return <ListSkeleton rows={2} />;

  if (!session)
    return (
      <div className="mx-auto max-w-md px-4 py-6 md:py-20">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-action"><User className="size-7" /></span>
        <h1 className="mt-5 text-[28px] font-bold">Sign in to My Trip</h1>
        <p className="mt-2 text-muted">Use the mobile number you booked with. Your BinGi account works here and on bingi.app.</p>
        <div className="mt-6 rounded-3xl border border-line bg-surface p-5 shadow-card">
          <PhoneOtp onVerified={(phone) => signIn({ phone })} />
        </div>
      </div>
    );

  const mine = bookings.filter((b) => b.guest.phone === session.phone);
  const upcoming = mine
    .filter((b) => b.bookingStatus !== "cancelled" && b.stay.checkOut >= todayISO())
    .sort((a, b) => a.stay.checkIn.localeCompare(b.stay.checkIn))[0];
  const firstName = (session.name ?? mine[0]?.guest.name ?? "").split(" ")[0];

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 pt-6 sm:px-6 md:pt-10">
      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        <nav aria-label="My Trip" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:mb-0 lg:flex-col lg:self-start lg:rounded-3xl lg:border lg:border-line lg:bg-surface lg:p-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={clsx(
                "flex h-11 shrink-0 items-center gap-2.5 rounded-full border px-4 text-[15px] font-semibold lg:rounded-2xl lg:border-0",
                tab === t.id ? "border-action bg-brand-soft text-action" : "border-line bg-surface text-ink hover:bg-canvas",
              )}
            >
              <t.icon className="size-[18px]" /> {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {tab === "overview" && (
            <>
              <h1 className="text-[28px] font-bold md:text-4xl">{firstName ? `Welcome back, ${firstName}` : "Your trip"}</h1>
              {upcoming ? (
                <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_1fr]">
                  <section className="rounded-3xl border border-line bg-surface p-5 shadow-card">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Status b={upcoming} />
                    </div>
                    <StayHeader hotel={hotel} stay={upcoming.stay} />
                    <p className="mt-4 text-sm text-muted">Reference <b className="text-ink">{upcoming.id}</b></p>
                    <div className="mt-5 grid gap-2 sm:grid-cols-3">
                      <Button onClick={() => setOpen(upcoming)}>Details</Button>
                      <ButtonLink variant="outline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ", " + hotel.address)}`}><Navigation className="size-4" /> Directions</ButtonLink>
                      {hotel.whatsapp && <ButtonLink variant="outline" href={`https://wa.me/${hotel.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, booking ${upcoming.id}`)}`}><MessageCircle className="size-4" /> Message</ButtonLink>}
                    </div>
                  </section>
                  <Itinerary hotel={hotel} b={upcoming} />
                </div>
              ) : (
                <Empty icon={CalendarDays} title="No upcoming stay" text="When you book, your dates, extras and itinerary appear here." action={<ButtonLink href={`${base}/rooms`}>Find a room</ButtonLink>} />
              )}
            </>
          )}

          {tab === "bookings" && (
            <>
              <h1 className="text-2xl font-bold md:text-3xl">Bookings</h1>
              {mine.length ? (
                <ul className="mt-5 space-y-3">
                  {mine.map((b) => (
                    <li key={b.id}>
                      <button onClick={() => setOpen(b)} className="flex w-full items-center gap-4 rounded-3xl border border-line bg-surface p-4 text-left hover:border-brand-ring">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{hotel.rooms.find((r) => r.slug === b.stay.roomSlug)?.name}</p>
                          <p className="text-sm text-muted">{shortDate(b.stay.checkIn)} – {shortDate(b.stay.checkOut)} · {b.id}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5"><Status b={b} small /></div>
                        </div>
                        <span className="text-right"><span className="block font-bold tabular-nums">{formatMoney(b.quote.total)}</span></span>
                        <ChevronRight className="size-5 text-muted" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty icon={BedDouble} title="No bookings yet" text="Bookings you make with this number appear here." action={<ButtonLink href={`${base}/rooms`}>Find a room</ButtonLink>} />
              )}
            </>
          )}

          {tab === "orders" && (
            <>
              <h1 className="text-2xl font-bold md:text-3xl">Orders & services</h1>
              {mine.some((b) => b.extras.length) ? (
                <ul className="mt-5 space-y-3">
                  {mine.flatMap((b) =>
                    b.extras.map((e) => {
                      const s = hotel.services.find((x) => x.id === e.serviceId);
                      return (
                        <li key={b.id + e.serviceId} className="flex items-center justify-between gap-4 rounded-3xl border border-line bg-surface p-4">
                          <div>
                            <p className="font-semibold">{s?.name} × {e.qty}</p>
                            <p className="text-sm text-muted">For stay {b.id} · time arranged by the hotel</p>
                          </div>
                          <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", b.bookingStatus === "cancelled" ? "bg-line text-muted" : "bg-amber-50 text-amber-800")}>
                            {b.bookingStatus === "cancelled" ? "Cancelled" : "Requested"}
                          </span>
                        </li>
                      );
                    }),
                  )}
                </ul>
              ) : (
                <Empty icon={ShoppingBag} title="No orders yet" text="Extras you add to a booking, and food you order during your stay, show up here." />
              )}
            </>
          )}

          {tab === "invoices" && (
            <>
              <h1 className="text-2xl font-bold md:text-3xl">Invoices</h1>

              {mine.length ? (
                <ul className="mt-5 space-y-3">
                  {mine.map((b) => (
                    <li key={b.id} className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4">
                      <FileText className="size-6 shrink-0 text-muted" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{b.id.replace("WBK", "BILL")}</p>
                        <p className="text-sm text-muted">{formatMoney(b.quote.total)} · balance {formatMoney(b.bookingStatus === "cancelled" ? 0 : b.quote.total - b.payment.dueNow)}</p>
                      </div>
                      <button onClick={() => setBill(b)} className="h-10 rounded-full bg-brand-soft px-4 text-sm font-semibold text-action">View bill</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty icon={Receipt} title="No invoices yet" text="Invoices appear here after you check out." />
              )}
            </>
          )}

          {tab === "profile" && (
            <>
              <h1 className="text-2xl font-bold md:text-3xl">Profile</h1>
              <dl className="mt-5 divide-y divide-line rounded-3xl border border-line bg-surface">
                <div className="flex justify-between gap-4 p-4"><dt className="text-muted">Name</dt><dd className="font-semibold">{session.name ?? mine[0]?.guest.name ?? "—"}</dd></div>
                <div className="flex justify-between gap-4 p-4"><dt className="text-muted">Mobile</dt><dd className="font-semibold">{session.phone} <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">verified</span></dd></div>
                <div className="flex justify-between gap-4 p-4"><dt className="text-muted">Account</dt><dd className="text-right font-semibold">BinGi guest account<span className="block text-xs font-normal text-muted">also works on bingi.app</span></dd></div>
              </dl>
              <Button variant="outline" className="mt-5" onClick={signOut}><LogOut className="size-4" /> Sign out</Button>
            </>
          )}
        </div>
      </div>

      <Sheet open={!!bill} onClose={() => setBill(null)} title="Bill">
        {bill && <InvoiceDoc hotel={hotel} b={bookings.find((x) => x.id === bill.id) ?? bill} />}
      </Sheet>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `Booking ${open.id}` : ""}>
        {open && <BookingDetail hotel={hotel} b={bookings.find((x) => x.id === open.id) ?? open} onCancel={cancelBooking} />}
      </Sheet>
    </div>
  );
}

function Status({ b, small }: { b: GuestBooking; small?: boolean }) {
  const cls = small ? "px-2 py-0.5 text-[12px]" : "px-3 py-1.5 text-[13px]";
  return (
    <>
      <span className={clsx("rounded-full font-semibold", cls, BOOKING_STATUS[b.bookingStatus].cls)}>{BOOKING_STATUS[b.bookingStatus].label}</span>
      {b.bookingStatus !== "cancelled" && <span className={clsx("rounded-full font-semibold", cls, PAYMENT_STATUS[b.paymentStatus].cls)}>{PAYMENT_STATUS[b.paymentStatus].label}</span>}
    </>
  );
}

function Itinerary({ hotel, b }: { hotel: Hotel; b: GuestBooking }) {
  const items = [
    { day: b.stay.checkIn, title: "Arrive & check in", sub: `From ${hotel.checkIn}${b.guest.arrival ? ` · you said ${b.guest.arrival}` : ""}` },
    ...b.extras.map((e) => {
      const s = hotel.services.find((x) => x.id === e.serviceId);
      return { day: "", title: `${s?.name ?? "Extra"}${e.qty > 1 ? ` × ${e.qty}` : ""}`, sub: "Time arranged with the front desk" };
    }),
    { day: b.stay.checkOut, title: "Check out", sub: `By ${hotel.checkOut}` },
  ];
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Itinerary</h2>
        <a href={icsFor(hotel, b)} download={`${b.id}.ics`} className="text-sm font-semibold text-action">Add to calendar</a>
      </div>
      <ol className="relative mt-4 space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-[2px] before:bg-line">
        {items.map((i, n) => (
          <li key={n} className="relative flex gap-4 pl-0">
            <span className={clsx("relative z-10 mt-1 size-4 shrink-0 rounded-full border-[3px] bg-surface", i.day ? "border-action" : "border-brand-ring")} />
            <div>
              {i.day && <p className="text-xs font-semibold uppercase tracking-wide text-action">{shortDate(i.day)}</p>}
              <p className="font-semibold">{i.title}</p>
              <p className="text-sm text-muted">{i.sub}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function BookingDetail({ hotel, b, onCancel }: { hotel: Hotel; b: GuestBooking; onCancel: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [now] = useState(() => Date.now());
  const hoursToCheckIn = (+new Date(b.stay.checkIn + "T14:00:00") - now) / 36e5;
  const free = hoursToCheckIn > 48;
  const canCancel = b.bookingStatus !== "cancelled" && hoursToCheckIn > 0;
  return (
    <div className="space-y-5 pb-4">
      <div className="flex flex-wrap gap-2"><Status b={b} /></div>
      <StayHeader hotel={hotel} stay={b.stay} />
      <div className="rounded-2xl border border-line p-4"><PriceLines q={b.quote} dueNow={b.payment.dueNow} paidLabel={paidLabelFor(b.payment.method, b.payment.provider)} /></div>
      <dl className="space-y-1 text-[14px]">
        <div className="flex justify-between"><dt className="text-muted">Guest</dt><dd>{b.guest.name}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Mobile</dt><dd>{b.guest.phone}</dd></div>
        {b.payment.reference && <div className="flex justify-between"><dt className="text-muted">Transaction ID</dt><dd>{b.payment.reference}</dd></div>}
      </dl>
      {canCancel &&
        (confirming ? (
          <div className="rounded-2xl bg-canvas p-4">
            <p className="font-semibold">{free ? "Cancel for free?" : "Cancel this booking?"}</p>
            <p className="mt-1 text-sm text-muted">{free ? "You are more than 48 hours before check-in, so there is no charge." : hotel.policies.cancellation}</p>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => { onCancel(b.id); setConfirming(false); }}>Yes, cancel</Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>Keep booking</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setConfirming(true)}>Cancel booking{free ? " (free)" : ""}</Button>
        ))}
    </div>
  );
}

function Empty({ icon: Icon, title, text, action }: { icon: typeof User; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-line bg-surface p-8 text-center">
      <Icon className="mx-auto size-8 text-muted" />
      <p className="mt-3 text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[15px] text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
