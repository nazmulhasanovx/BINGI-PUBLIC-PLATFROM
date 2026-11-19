"use client";
// Manage booking — one full page with tabs on top (like the live HMS), every change made right here.
// Actions (check in/out, payment, move, dates, cancel) open as an inline panel under the header — no side drawers.
import Link from "next/link";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, CalendarRange, Copy, CreditCard, LogIn, LogOut, MessageCircle, MoreHorizontal, MoveRight, Phone, Printer, Undo2, UserRound, X as XIcon } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { bill, channelLabel, chargesOf, dm, dmy, dow, heldMeals, paidOf, preMealTotal, timeOf, tk, totalOf, useBookings, type Booking, type Companion } from "@/lib/bookings/store";
import { confirmationHtml, fillMsg, invoiceHtml, precheckUrl, receiptHtml, regCardHtml } from "@/lib/bookings/docs";
import { printHtml } from "../meals/print";
import { useBkMode } from "@/lib/bookings/mode";
import { useRates } from "@/lib/rates/store";
import { useGuests } from "@/lib/guests/store";
import { useServices } from "@/lib/services/store";
import { postCash, postCashOut } from "@/lib/cashbox/store";
import { useProperty } from "../property";
import { useRestaurant } from "../meals/shared";
import { useCashboxData } from "../cashbox/pages";
import { BkCtx, ChannelBadge, Flags, ModeSwitch, PayPill, StatusPill, Toast, bMain, bSoft, card, useBk, type BkCtxValue } from "./ui";
import { CancelView, CheckInView, CheckOutView, DatesView, DetailsEdit, MoveView, PayView, Row, useExtras } from "./actions";
import { ExtrasList, ExtrasPicker, MealPlan, hasRestaurant } from "./extras";
import { GuestFields, StayFields, guestErrors, guestToDraft, type GuestDraft, type StayDraft } from "./guestform";

type Panel = null | "checkin" | "checkout" | "pay" | "move" | "dates" | "cancel";
type Tab = "overview" | "stay" | "guest" | "extras" | "bill" | "docs" | "activity";

export function ManageBookingPage() {
  const h = useProperty();
  const sp = useSearchParams();
  const router = useRouter();
  const bk = useBookings(h);
  const g = useGuests(h);
  const { mode } = useBkMode();
  const [toast, setToast] = useState(() => sp.get("made") ?? "");
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); }, [toast]);
  const guests = useMemo(() => new Map(g.rows.map((r) => [r.id, r])), [g.rows]);
  const code = sp.get("b") ?? "";
  const b = bk.list.find((x) => x.code === code);
  const ctx: BkCtxValue = { bk, guests, g, mode, toast: setToast, open: (c, v) => c && router.push(`/hms/bookings/view?b=${c}${v ? `&do=${v}` : ""}`) };
  const back = sp.get("from") || "/hms/bookings";
  return (
    <BkCtx.Provider value={ctx}>
      <div className="h-full overflow-y-auto bg-[#f4f6f8]"><div className="hms-page">
        <div className="flex items-center gap-3">
          <Link href={back} aria-label="Back to bookings" className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-hms-line hover:bg-hms-hover"><ArrowLeft className="size-5" /></Link>
          <p className="mr-auto text-[14px] font-semibold text-hms-muted">Booking</p>
          <ModeSwitch />
        </div>
        {!bk.ready ? <p role="status" className="py-10 text-[14px] text-hms-muted">Loading booking…</p>
          : !b ? <div className={clsx(card, "mt-4 px-6 py-14 text-center")}><p className="text-[17px] font-bold">Booking not found</p><p className="mt-1 text-[14px] text-hms-muted">{code || "No booking code"} isn&apos;t in this property.</p><Link href="/hms/bookings" className={clsx(bMain, "mt-4")}>All bookings</Link></div>
          : <Manage key={b.code} b={b} start={sp.get("do")} />}
      </div></div>
      {toast && <Toast text={toast} />}
    </BkCtx.Provider>
  );
}

function Manage({ b, start }: { b: Booking; start: string | null }) {
  const h = useProperty();
  const { bk, guests, mode, toast } = useCtx();
  const rates = useRates(h);
  const cbx = useCashboxData();
  const ex = useExtras(b);
  const guest = guests.get(b.guestId);
  const details = mode === "details";
  const [panel, setPanel] = useState<Panel>(start === "checkin" && b.status === "Confirmed" && b.from <= TODAY ? "checkin" : start === "checkout" && b.status === "Checked in" ? "checkout" : start === "pay" ? "pay" : null);
  const [tab, setTab] = useState<Tab>("overview");
  const [more, setMore] = useState(false);
  const active = b.status === "Confirmed" || b.status === "Checked in";
  const paid = paidOf(b);
  const folio = totalOf(b) + (active ? ex.total : 0);
  const balance = folio - paid;
  const priceOn = (d: string) => { const u = bk.unitByCode.get(b.unit); if (!u) return rates.catPrice(b.categoryId, d).price; const p = rates.unitPrice(u, d).price; return rates.deal(u.category, d, p, u.id)?.price ?? p; };
  const takeCash = (amount: number, ref: string) => postCash(h, cbx.refs, "front-desk", { amount, source: "booking", ref, party: guest?.name });
  const done = (m: string) => { toast(m); setPanel(null); };
  const open = (p: Panel) => { setPanel(p); setMore(false); requestAnimationFrame(() => document.getElementById("bk-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" })); };
  const canIn = b.status === "Confirmed" && b.from <= TODAY;
  const vp = { b, onBack: () => setPanel(null), onClose: () => setPanel(null), onDone: done };

  const primary = canIn ? <button onClick={() => open("checkin")} className={bMain}><LogIn className="size-4" />Check in</button>
    : b.status === "Checked in" ? <button onClick={() => open("checkout")} className={bMain}><LogOut className="size-4" />Check out</button>
    : balance !== 0 ? <button onClick={() => open("pay")} className={bMain}>{balance < 0 ? "Refund" : "Take payment"}</button> : null;
  const TABS: [Tab, string][] = [["overview", "Overview"], ["stay", "Stay & room"], ["guest", "Guest"], ["extras", "Meals & services"], ["bill", "Bill & payments"], ["docs", "Documents & messages"], ...(details ? [["activity", "Activity"] as [Tab, string]] : [])];
  const extrasCount = (b.preMeals?.length ?? 0) + ex.svcOrders.length;

  return (
    <>
      {/* ---------- header ---------- */}
      <section className={clsx(card, "mt-4 p-4 sm:p-5")}>
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-[24px] font-bold tracking-[-0.01em]">{guest?.name ?? "Guest"}{guest?.vip && <span className="rounded bg-[#fdf3d9] px-1.5 py-0.5 text-[12px] font-bold text-[#7a4a0b]">VIP</span>}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13.5px]">
              <span className="font-mono font-semibold text-[#4d5664]">{b.code}</span>
              <ChannelBadge b={b} />{b.channelRef && <span className="text-hms-muted">{b.channelRef}</span>}
              <StatusPill s={b.status} /><PayPill b={b} /><Flags b={b} />
              {b.group && <Link href={`/hms/bookings/group?g=${b.group}`} className="rounded-md bg-hms-hover px-2 py-0.5 text-[12px] font-semibold text-[#4d5664] hover:text-hms-ink">Group {b.group} · {bk.list.filter((x) => x.group === b.group).length} rooms →</Link>}
            </div>
            <p className="mt-2 text-[15px]"><b>{b.unit ? `Room ${b.unit}` : <span className="text-[#a15c00]">No room yet</span>}</b> <span className="text-hms-muted">· {b.type}</span> · {dow(b.from)} {dm(b.from)} → {dow(b.to)} {dm(b.to)} · {b.nights.length} night{b.nights.length > 1 ? "s" : ""} · {b.adults + b.children} guest{b.adults + b.children > 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {primary}
            {active && <button onClick={() => open("pay")} className={bSoft}><CreditCard className="size-4" />Payment</button>}
            {(active || (b.status === "Checked in" && b.checkedInAt?.startsWith(TODAY))) && (
              <div className="relative">
                <button onClick={() => setMore(!more)} aria-expanded={more} aria-label="More actions" className={clsx(bSoft, "px-3")}><MoreHorizontal className="size-5" /></button>
                {more && <div role="menu" className="hms-pop absolute right-0 top-12 z-20 w-56 rounded-xl border border-hms-line bg-white p-1 shadow-lg">
                  <MenuItem icon={CalendarRange} label={b.status === "Checked in" ? "Extend or shorten stay" : "Change dates"} onClick={() => open("dates")} />
                  <MenuItem icon={MoveRight} label={b.unit ? "Move room" : "Assign room"} onClick={() => open("move")} />
                  {b.status === "Checked in" && b.checkedInAt?.startsWith(TODAY) && <MenuItem icon={Undo2} label="Undo check-in" onClick={() => { bk.undoCheckIn(b.code); toast("Check-in undone"); setMore(false); }} />}
                  {b.status === "Confirmed" && <MenuItem icon={XIcon} label={b.from < TODAY ? "No-show / cancel" : "Cancel booking"} danger onClick={() => open("cancel")} />}
                </div>}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x divide-hms-line overflow-hidden rounded-xl bg-[#f7f8fa]">
          {[["Total", tk(folio), ""], ["Paid", tk(paid), "text-[#16693a]"], [balance < 0 ? "To refund" : "Balance", tk(Math.abs(balance)), balance > 0 ? "text-[#b42318]" : balance < 0 ? "text-[#6b55e0]" : "text-[#16693a]"]].map(([k, v, tone]) => (
            <div key={k} className="px-3 py-2.5 sm:px-4"><p className="text-[12.5px] text-hms-muted">{k}</p><p className={clsx("text-[18px] font-bold tabular-nums sm:text-[20px]", tone)}>{v}</p></div>
          ))}
        </div>
      </section>

      {panel && <div id="bk-panel" className="mt-4">
        {panel === "checkin" && <CheckInView {...vp} extras={ex.total} takeCash={takeCash} />}
        {panel === "checkout" && <CheckOutView {...vp} extras={ex} takeCash={takeCash} giveCash={(amount, ref) => postCashOut(h, cbx.refs, { amount, ref, party: guest?.name })} />}
        {panel === "pay" && <PayView {...vp} balance={balance} takeCash={takeCash} refund={(amount, ref) => postCashOut(h, cbx.refs, { amount, ref, party: guest?.name })} />}
        {panel === "move" && <MoveView {...vp} priceOn={priceOn} />}
        {panel === "dates" && <DatesView {...vp} priceOn={priceOn} />}
        {panel === "cancel" && <CancelView {...vp} />}
      </div>}

      {/* ---------- tabs ---------- */}
      <nav role="tablist" aria-label="Booking" className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-hms-line">
        {TABS.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={clsx("-mb-px shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-[14.5px] font-semibold transition-colors", tab === id ? "border-[#c8232e] text-[#c8232e]" : "border-transparent text-hms-muted hover:text-hms-ink")}>{l}{id === "extras" && extrasCount > 0 && <span className="ml-1.5 rounded-full bg-hms-hover px-1.5 text-[12px]">{extrasCount}</span>}</button>)}
      </nav>
      <div key={tab} className="hms-fade mt-4">
        {tab === "overview" && <Overview b={b} ex={ex} folio={folio} balance={balance} go={setTab} />}
        {tab === "stay" && <StayTab b={b} openPanel={open} />}
        {tab === "guest" && <GuestTab b={b} />}
        {tab === "extras" && <ExtrasTab b={b} ex={ex} />}
        {tab === "bill" && <BillTab b={b} ex={ex} balance={balance} openPanel={open} />}
        {tab === "docs" && <DocsTab b={b} ex={ex} />}
        {tab === "activity" && <Activity b={b} />}
      </div>
    </>
  );
}
const useCtx = useBk;

function MenuItem({ icon: I, label, onClick, danger }: { icon: typeof LogIn; label: string; onClick: () => void; danger?: boolean }) {
  return <button role="menuitem" onClick={onClick} className={clsx("flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium hover:bg-hms-hover", danger && "text-[#b42318]")}><I className="size-4" />{label}</button>;
}
const Box = ({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={clsx(card, "p-4 sm:p-5", className)} aria-label={title}><div className="mb-2 flex items-center justify-between gap-2"><h2 className="text-[16px] font-bold">{title}</h2>{action}</div>{children}</section>
);
const Link2 = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => <button onClick={onClick} className="text-[13.5px] font-semibold text-hms-red">{children}</button>;
const KV = ({ k, v }: { k: string; v: ReactNode }) => <div className="flex justify-between gap-3 py-1.5 text-[14px]"><span className="text-hms-muted">{k}</span><span className="text-right font-medium">{v || "—"}</span></div>;

type Ex = ReturnType<typeof useExtras>;
function Overview({ b, ex, folio, balance, go }: { b: Booking; ex: Ex; folio: number; balance: number; go: (t: Tab) => void }) {
  const { guests, mode } = useCtx();
  const guest = guests.get(b.guestId);
  const upcoming = [
    ...(b.preMeals ?? []).filter((m) => !m.sent).map((m) => ({ k: m.id, when: `${m.date}T${m.time}`, t: `${m.qty}× ${m.name}`, s: "Meal" })),
    ...ex.svcOrders.map((o) => ({ k: o.id, when: o.when, t: `${o.qty}× ${o.name}`, s: o.status })),
  ].sort((a, c) => a.when.localeCompare(c.when)).slice(0, 4);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Box title="Stay" action={<Link2 onClick={() => go("stay")}>Edit</Link2>}>
        <KV k="Room" v={b.unit ? `${b.unit} · ${b.type}` : "Not assigned"} />
        <KV k="Dates" v={`${dmy(b.from)} → ${dmy(b.to)}`} />
        <KV k="Guests" v={`${b.adults} adult${b.adults > 1 ? "s" : ""}${b.children ? `, ${b.children} child` : ""}${b.companions?.length ? ` · ${b.companions.length} named` : ""}`} />
        <KV k="Source" v={<span className="inline-flex items-center gap-1.5"><ChannelBadge b={b} />{b.channelRef && <span className="text-hms-muted">{b.channelRef}</span>}</span>} />
        {(b.purpose || mode === "details") && <KV k="Purpose" v={b.purpose} />}
        {(b.eta || mode === "details") && <KV k="Arrival time" v={b.eta} />}
        {b.checkedInAt && <KV k="Checked in" v={`${dm(b.checkedInAt.slice(0, 10))} ${timeOf(b.checkedInAt)}`} />}
        {b.note && <p className="mt-2 rounded-lg bg-[#fdf8ec] px-3 py-2 text-[13.5px] text-[#6b4309]">“{b.note}”</p>}
      </Box>
      <Box title="Guest" action={<Link2 onClick={() => go("guest")}>Edit</Link2>}>
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-hms-coral-soft text-hms-red"><UserRound className="size-5" /></span><div className="min-w-0"><p className="font-semibold">{guest?.name}</p><p className="flex items-center gap-1 text-[13px] text-hms-muted"><Phone className="size-3.5" />{guest?.phone}</p></div></div>
        <KV k="ID" v={guest?.idNo ? `${guest.idType} ${guest.idNo}` : <span className="text-[#a15c00]">Missing</span>} />
        <KV k="Nationality" v={guest?.country} />
        <KV k="Stays here" v={guest ? `${guest.stays.length}` : ""} />
        {b.payer?.kind === "Company" && <KV k="Paid by" v={b.payer.name} />}
        {b.booker && <KV k="Booked by" v={`${b.booker.name} · ${b.booker.phone}`} />}
        {guest && guest.prefs.length > 0 && <p className="mt-1 text-[13px] text-[#4d5664]">Likes: {guest.prefs.join(", ")}</p>}
      </Box>
      <Box title="Bill" action={<Link2 onClick={() => go("bill")}>Open bill</Link2>}>
        <Row k="Room (incl. VAT & service)" v={tk(bill(b).total)} />
        {heldMeals(b).length > 0 && <Row k="Meals booked" v={tk(heldMeals(b).reduce((s, m) => s + preMealTotal(m), 0))} />}
        {chargesOf(b) > 0 && <Row k="Extra charges" v={tk(chargesOf(b))} />}
        {b.deposit && !b.deposit.settled && <Row k="Deposit held (not on bill)" v={tk(b.deposit.amount)} tone="text-[#6b55e0]" />}
        {ex.total > 0 && <Row k="Services & restaurant" v={tk(ex.total)} />}
        <Row k="Paid" v={tk(paidOf(b))} tone="text-[#16693a]" />
        <div className="mt-1 border-t border-hms-line pt-1"><Row strong k={balance < 0 ? "To refund" : "Balance"} v={tk(Math.abs(balance))} tone={balance > 0 ? "text-[#b42318]" : ""} /></div>
        <p className="mt-1 text-[12px] text-hms-muted">Total {tk(folio)}</p>
      </Box>
      <Box title="Meals & services" action={<Link2 onClick={() => go("extras")}>{upcoming.length ? "See all" : "Add"}</Link2>}>
        {upcoming.length ? <ul className="divide-y divide-hms-line">{upcoming.map((u) => <li key={u.k} className="flex justify-between gap-3 py-2 text-[14px]"><span className="font-medium">{u.t}</span><span className="text-hms-muted">{dm(u.when.slice(0, 10))} · {u.when.slice(11, 16) || "now"} · {u.s}</span></li>)}</ul> : <p className="py-3 text-[14px] text-hms-muted">Nothing booked yet.</p>}
      </Box>
    </div>
  );
}

function StayTab({ b, openPanel }: { b: Booking; openPanel: (p: Panel) => void }) {
  const { bk, mode, toast } = useCtx();
  const active = b.status === "Confirmed" || b.status === "Checked in";
  const [s, setS] = useState<StayDraft>({ purpose: b.purpose ?? "", comingFrom: b.comingFrom ?? "", goingTo: b.goingTo ?? "", eta: b.eta ?? "", companions: b.companions ?? [], booker: b.booker ?? null, payer: b.payer ?? { kind: "Guest" }, note: b.note });
  const dirty = JSON.stringify(s) !== JSON.stringify({ purpose: b.purpose ?? "", comingFrom: b.comingFrom ?? "", goingTo: b.goingTo ?? "", eta: b.eta ?? "", companions: b.companions ?? [], booker: b.booker ?? null, payer: b.payer ?? { kind: "Guest" }, note: b.note });
  const save = () => {
    const comps: Companion[] = s.companions.filter((c) => c.name.trim());
    bk.update(b.code, { purpose: s.purpose || undefined, comingFrom: s.comingFrom || undefined, goingTo: s.goingTo || undefined, eta: s.eta || undefined, companions: comps.length ? comps : undefined, booker: s.booker?.name.trim() ? s.booker : undefined, payer: s.payer.kind === "Company" ? s.payer : undefined, note: s.note.trim() }, "Stay register updated");
    toast("Stay details saved");
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Box title="Room & dates" className={mode === "details" ? "" : "lg:col-span-2"}>
        <KV k="Room" v={b.unit ? `${b.unit} · ${b.type}` : "Not assigned"} />
        <KV k="Check-in" v={`${dow(b.from)} ${dmy(b.from)}`} />
        <KV k="Check-out" v={`${dow(b.to)} ${dmy(b.to)}`} />
        <KV k="Nights" v={String(b.nights.length)} />
        {active && <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => openPanel("dates")} className={bSoft}><CalendarRange className="size-4" />{b.status === "Checked in" ? "Extend / shorten" : "Change dates"}</button><button onClick={() => openPanel("move")} className={bSoft}><MoveRight className="size-4" />{b.unit ? "Move room" : "Assign room"}</button></div>}
        <div className="mt-3"><MealPlan cat={bk.cats.get(b.categoryId)} /></div>
        {active && <DetailsEdit b={b} />}
      </Box>
      {mode === "details" ? <Box title="Price per night">{b.nights.map((n) => <Row key={n.date} k={`${dow(n.date)} ${dm(n.date)}`} v={tk(n.base)} />)}<p className="mt-1 text-[12px] text-hms-muted">Before VAT &amp; service charge</p></Box> : null}
      <div className="lg:col-span-2">
        <StayFields s={s} set={(p) => setS({ ...s, ...p })} details adults={b.adults} />
        {dirty && <div className="mt-2 flex justify-end gap-2"><button onClick={() => setS({ purpose: b.purpose ?? "", comingFrom: b.comingFrom ?? "", goingTo: b.goingTo ?? "", eta: b.eta ?? "", companions: b.companions ?? [], booker: b.booker ?? null, payer: b.payer ?? { kind: "Guest" }, note: b.note })} className={bSoft}>Undo</button><button onClick={save} className={bMain}>Save stay details</button></div>}
      </div>
    </div>
  );
}

function GuestTab({ b }: { b: Booking }) {
  const { guests, g, mode, toast } = useCtx();
  const guest = guests.get(b.guestId);
  const [d, setD] = useState<GuestDraft | null>(guest ? guestToDraft(guest) : null);
  const [tried, setTried] = useState(false);
  if (!guest || !d) return <p className="py-6 text-[14px] text-hms-muted">Guest not found.</p>;
  const dirty = JSON.stringify(d) !== JSON.stringify(guestToDraft(guest));
  const dup = g.findByPhone(d.phone, guest.id);
  const save = () => {
    setTried(true);
    if (Object.keys(guestErrors(d)).length || dup) return;
    g.saveGuest({ ...guest, name: d.name.trim(), phone: d.phone.trim(), email: d.email.trim(), country: d.country, address: d.address, idType: d.idType, idNo: d.idNo, idFront: d.idFront, idBack: d.idBack, gender: d.gender, dob: d.dob || undefined, occupation: d.occupation || undefined, visaNo: d.visaNo || undefined, visaExpiry: d.visaExpiry || undefined, prefs: d.prefs, vip: !!d.vip, verified: guest.verified || (!!d.idNo && !!d.idFront) });
    toast("Guest profile saved");
  };
  return (
    <Box title="Guest details" action={<Link href={`/hms/guests/${guest.id}`} className="text-[13.5px] font-semibold text-hms-red">Full profile</Link>}>
      <GuestFields g={d} set={(p) => setD({ ...d, ...p })} tried={tried} details={mode === "details"} />
      {dup && <p role="alert" className="mt-3 text-[13px] font-medium text-[#b42318]">That phone belongs to {dup.name}.</p>}
      {dirty && <div className="mt-3 flex justify-end gap-2"><button onClick={() => { setD(guestToDraft(guest)); setTried(false); }} className={bSoft}>Undo</button><button onClick={save} className={bMain}>Save to guest profile</button></div>}
      <p className="mt-3 text-[12.5px] text-hms-muted">Saved on the guest&apos;s profile, so the next booking fills in by itself.</p>
    </Box>
  );
}

function ExtrasTab({ b, ex }: { b: Booking; ex: Ex }) {
  const h = useProperty();
  const { bk, guests, toast } = useCtx();
  const svc = useServices(h);
  const r = useRestaurant();
  const guest = guests.get(b.guestId);
  const active = b.status === "Confirmed" || b.status === "Checked in";
  const send = (id: string) => {
    const m = b.preMeals?.find((x) => x.id === id); if (!m) return;
    const o = r.m.create({ outlet: r.outlet, source: "pos", service: "room", room: b.unit, guest: guest?.name, lines: [{ item: m.item, name: m.name, price: m.price, qty: m.qty, note: m.note }] });
    r.m.pay(o.id, "room", b.unit);
    bk.mealSent(b.code, m.id, o.no);
    toast(`${m.qty}× ${m.name} sent to kitchen · ${o.no} · on Room ${b.unit} bill`);
  };
  return (
    <div className="space-y-4">
      <Box title="On this booking" action={<MealPlan cat={bk.cats.get(b.categoryId)} />}>
        <ExtrasList meals={b.preMeals ?? []} services={ex.svcOrders.map((o) => ({ id: o.id, name: o.name, qty: o.qty, date: o.when.slice(0, 10), time: o.when.slice(11, 16) || "now", total: o.total, status: o.status, locked: o.paid || o.status === "Done" || o.status === "In progress" }))}
          onRemoveMeal={active ? (id) => { bk.removeMeal(b.code, id); toast("Meal removed"); } : undefined}
          onRemoveService={active ? (id) => { svc.cancelOrder(id, "Removed from booking"); toast("Service cancelled"); } : undefined}
          onSend={(m) => send(m.id)} canSend={(m) => b.status === "Checked in" && m.date <= TODAY && !!b.unit && hasRestaurant(h)} />
        {ex.lines.filter((l) => l.from.startsWith("Restaurant")).length > 0 && <p className="mt-2 text-[13px] text-hms-muted">Restaurant orders charged to the room: {ex.lines.filter((l) => l.from.startsWith("Restaurant")).map((l) => `${l.label} ${tk(l.amount)}`).join(", ")}</p>}
      </Box>
      {active && <Box title="Add meals or services">
        <ExtrasPicker h={h} from={b.from} to={b.to} room={b.unit}
          onMeals={(m) => { bk.addMeals(b.code, m); toast(`${m.reduce((s, x) => s + x.qty, 0)} meal(s) added`); }}
          onServices={(list) => {
            for (const s of list) { const res = svc.saveOrder({ service: s.service, qty: s.qty, unitPrice: s.unitPrice, method: "booking", booking: { code: b.code, guest: guest?.name ?? "Guest", room: b.unit, phone: guest?.phone ?? "" }, when: { date: s.date, time: s.time }, payment: "Unpaid", sc: s.sc, vat: s.vat, status: "confirmed", source: "staff" }); if ("error" in res) return res.error; }
            toast(`${list.length} service(s) booked`);
          }} />
      </Box>}
    </div>
  );
}

function BillTab({ b, ex, balance, openPanel }: { b: Booking; ex: Ex; balance: number; openPanel: (p: Panel) => void }) {
  const h = useProperty();
  const { bk, toast, guests } = useCtx();
  const cbx = useCashboxData();
  const rb = bill(b);
  const held = heldMeals(b);
  const active = b.status === "Confirmed" || b.status === "Checked in";
  const [label, setLabel] = useState("Minibar");
  const [amount, setAmount] = useState("");
  const [depAmt, setDepAmt] = useState(String(bk.settings.depositDefault));
  const [depM, setDepM] = useState<"Cash" | "bKash" | "Card" | "Bank">("Cash");
  const [err, setErr] = useState("");
  const guest = guests.get(b.guestId);
  const dep = b.deposit;
  const addCharge = () => { const a = Number(amount) || 0; if (!label.trim() || a <= 0) return setErr("Enter what it is and the amount"); bk.addCharge(b.code, label.trim(), a); setAmount(""); setErr(""); toast(`${label} ${tk(a)} added to the bill`); };
  const takeDep = () => { const a = Number(depAmt) || 0; if (a <= 0) return; if (depM === "Cash") { const e = postCash(h, cbx.refs, "front-desk", { amount: a, source: "booking", ref: `${b.code} deposit`, party: guest?.name }); if (e) return setErr(e); } bk.takeDeposit(b.code, a, depM); setErr(""); toast(`Deposit ${tk(a)} taken`); };
  const returnDep = (used: number) => { if (!dep) return; const back = dep.amount - used; if (back > 0 && dep.method === "Cash") { const e = postCashOut(h, cbx.refs, { amount: back, ref: `${b.code} deposit`, party: guest?.name }); if (e) return setErr(e); } bk.settleDeposit(b.code, used); toast(used ? `${tk(used)} of the deposit used for the bill${back ? ` · ${tk(back)} returned` : ""}` : `Deposit ${tk(back)} returned`); };
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Box title="Charges">
        <Row k={`Room · ${b.nights.length} night${b.nights.length > 1 ? "s" : ""}${b.mealPlan ? ` incl. ${b.mealPlan.name}` : ""}`} v={tk(rb.rooms)} />
        {rb.discount > 0 && <Row k="Discount" v={`−${tk(rb.discount)}`} tone="text-[#16693a]" />}
        <Row k={`Service charge ${b.tax.service}%`} v={tk(rb.service)} />
        <Row k={`VAT ${b.tax.vat}%`} v={tk(rb.vat)} />
        {held.map((m) => <Row key={m.id} k={`${m.qty}× ${m.name} · ${dm(m.date)}`} v={tk(preMealTotal(m))} />)}
        {(b.charges ?? []).map((c) => <div key={c.id} className="flex items-center gap-2"><div className="flex-1"><Row k={c.label} v={tk(c.amount)} /></div>{active && <button onClick={() => { bk.removeCharge(b.code, c.id); toast(`${c.label} removed`); }} aria-label={`Remove ${c.label}`} className="text-[12.5px] font-semibold text-[#b42318]">Remove</button>}</div>)}
        {active && ex.lines.map((l, i) => <Row key={i} k={<span>{l.label}<span className="block text-[12px] text-hms-muted">{l.from}</span></span>} v={tk(l.amount)} />)}
        {(b.status === "Cancelled" || b.status === "No-show") && <Row k={`${b.status} · fee`} v={tk(totalOf(b))} />}
        <div className="mt-1 border-t border-hms-line pt-1"><Row strong k="Total" v={tk(totalOf(b) + (active ? ex.total : 0))} /></div>
        {active && <div className="mt-3 rounded-xl bg-[#f7f8fa] p-3">
          <p className="text-[13px] font-semibold">Add a charge</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{["Minibar", "Laundry", "Damage", "Extra bed", "Room service", "Other"].map((x) => <button key={x} onClick={() => setLabel(x)} className={clsx("rounded-full px-3 py-1 text-[12.5px] font-semibold", label === x ? "bg-hms-ink text-white" : "bg-white ring-1 ring-hms-line")}>{x}</button>)}</div>
          <div className="mt-2 flex gap-2"><input aria-label="Charge name" value={label} onChange={(e) => setLabel(e.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-hms-line bg-white px-3 text-[14px]" /><input aria-label="Charge amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="৳ incl. VAT" className="h-10 w-32 rounded-lg border border-hms-line bg-white px-3 text-[14px]" /><button onClick={addCharge} className={clsx(bMain, "!h-10 px-4")}>Add</button></div>
        </div>}
      </Box>
      <div className="space-y-4">
        <Box title="Payments" action={balance !== 0 ? <button onClick={() => openPanel("pay")} className={clsx(bMain, "!h-9 px-3.5 text-[13.5px]")}>{balance < 0 ? "Refund" : "Take payment"}</button> : undefined}>
          {b.payments.length ? b.payments.map((p) => <Row key={p.id} k={<span>{p.amount < 0 ? "Refund" : p.note ?? "Payment"} · {p.method}<span className="block text-[12px] text-hms-muted">{dm(p.at.slice(0, 10))} {timeOf(p.at)} · {p.by}</span></span>} v={tk(p.amount)} tone={p.amount < 0 ? "text-[#6b55e0]" : "text-[#16693a]"} />) : <p className="py-2 text-[14px] text-hms-muted">No payments yet.</p>}
          <div className="mt-1 border-t border-hms-line pt-1"><Row strong k={balance < 0 ? "To refund" : "Balance"} v={tk(Math.abs(balance))} tone={balance > 0 ? "text-[#b42318]" : ""} /></div>
          {b.payer?.kind === "Company" && <p className="mt-2 text-[13px] text-hms-muted">Bill to: <b>{b.payer.name}</b></p>}
        </Box>
        <Box title="Security deposit">
          {!dep ? (active ? <div className="flex flex-wrap items-center gap-2"><input aria-label="Deposit amount" inputMode="numeric" value={depAmt} onChange={(e) => setDepAmt(e.target.value.replace(/\D/g, ""))} className="h-10 w-28 rounded-lg border border-hms-line px-3 text-[14px]" /><select aria-label="Deposit method" value={depM} onChange={(e) => setDepM(e.target.value as typeof depM)} className="h-10 rounded-lg border border-hms-line bg-white px-2 text-[14px]">{["Cash", "bKash", "Card", "Bank"].map((m) => <option key={m}>{m}</option>)}</select><button onClick={takeDep} className={clsx(bSoft, "!h-10")}>Take deposit</button></div> : <p className="text-[14px] text-hms-muted">No deposit.</p>)
            : dep.settled ? <p className="text-[14px]">{tk(dep.amount)} · {dep.method} — {dep.settled.used ? `${tk(dep.settled.used)} used for the bill` : ""}{dep.settled.used && dep.settled.returned ? ", " : ""}{dep.settled.returned ? `${tk(dep.settled.returned)} returned` : ""}</p>
            : <><p className="text-[14px]">Holding <b>{tk(dep.amount)}</b> · {dep.method} · {dm(dep.at.slice(0, 10))}</p><p className="text-[12.5px] text-hms-muted">Not part of the bill.</p>
              <div className="mt-2 flex flex-wrap gap-2"><button onClick={() => returnDep(0)} className={clsx(bSoft, "!h-9 text-[13.5px]")}>Return all</button>{balance > 0 && <button onClick={() => returnDep(Math.min(dep.amount, balance))} className={clsx(bSoft, "!h-9 text-[13.5px]")}>Use {tk(Math.min(dep.amount, balance))} for the bill</button>}</div></>}
        </Box>
        {err && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 text-[13.5px] font-medium text-[#b42318]">{err}</p>}
      </div>
    </div>
  );
}

function DocsTab({ b, ex }: { b: Booking; ex: Ex }) {
  const h = useProperty();
  const { bk, guests, toast } = useCtx();
  const g = guests.get(b.guestId);
  const S = bk.settings;
  const extras = (b.status === "Confirmed" || b.status === "Checked in") ? ex.lines : [];
  const docs: [string, string, () => string][] = [
    ["Booking confirmation", "Dates, room, price and policy — send before arrival", () => confirmationHtml(h, b, g, S)],
    ["Registration card", "Guest details, ID and signature — at check-in", () => regCardHtml(h, b, g)],
    [b.payer?.kind === "Company" ? `Invoice to ${b.payer.name}` : "Invoice", "Every charge, payments and balance", () => invoiceHtml(h, b, g, extras)],
  ];
  const link = precheckUrl(h, b);
  const msgs: [string, string][] = [["Confirmation message", fillMsg(S.confirmMsg, h, b, g, S)], ["Pre-arrival message", fillMsg(S.preArrivalMsg, h, b, g, S)]];
  const wa = (t: string) => `https://wa.me/${(g?.phone ?? "").replace(/\D/g, "").replace(/^0/, "880")}?text=${encodeURIComponent(t)}`;
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); toast("Message copied"); } catch { toast("Copy not allowed here — select the text"); } };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Box title="Documents">
        <ul className="divide-y divide-hms-line">
          {docs.map(([t, s, f]) => <li key={t} className="flex items-center gap-3 py-2.5"><span className="min-w-0 flex-1"><b className="block text-[14px]">{t}</b><span className="text-[12.5px] text-hms-muted">{s}</span></span><button onClick={() => printHtml(f())} className={clsx(bSoft, "!h-9 px-3 text-[13.5px]")}><Printer className="size-4" />Print / PDF</button></li>)}
          {b.payments.map((p) => <li key={p.id} className="flex items-center gap-3 py-2.5"><span className="min-w-0 flex-1"><b className="block text-[14px]">{p.amount < 0 ? "Refund" : "Receipt"} · {tk(Math.abs(p.amount))}</b><span className="text-[12.5px] text-hms-muted">{p.method} · {dm(p.at.slice(0, 10))} {timeOf(p.at)}</span></span><button onClick={() => printHtml(receiptHtml(h, b, g, p))} className={clsx(bSoft, "!h-9 px-3 text-[13.5px]")}><Printer className="size-4" />Print</button></li>)}
        </ul>
        <p className="mt-2 text-[12.5px] text-hms-muted">Choose “Save as PDF” in the print dialog to keep or send a file.</p>
        {b.status === "Confirmed" && <div className="mt-3 rounded-xl bg-[#f7f8fa] p-3">
          <p className="text-[13px] font-semibold">Online pre-check-in {b.precheck ? <span className="text-[#16693a]">· done {dm(b.precheck.at.slice(0, 10))} {timeOf(b.precheck.at)}</span> : <span className="font-normal text-hms-muted">· not yet</span>}</p>
          <p className="mt-1 break-all text-[12.5px] text-[#3a414c]">{link}</p>
          <div className="mt-2 flex gap-2"><button onClick={() => copy(link)} className={clsx(bSoft, "!h-9 px-3 text-[13.5px]")}><Copy className="size-4" />Copy link</button><a href={link} target="_blank" rel="noreferrer" className={clsx(bSoft, "!h-9 px-3 text-[13.5px]")}>Open</a></div>
          <p className="mt-1.5 text-[12px] text-hms-muted">Guest confirms with the last 4 digits of their phone. Prototype: answers save in this browser only.</p>
        </div>}
      </Box>
      <Box title="Messages to the guest">
        {msgs.map(([t, m]) => (
          <div key={t} className="mb-3 rounded-xl bg-[#f7f8fa] p-3 last:mb-0">
            <p className="text-[13px] font-semibold">{t}</p>
            <p className="mt-1 whitespace-pre-wrap text-[13.5px] text-[#3a414c]">{m}</p>
            <div className="mt-2 flex flex-wrap gap-2"><button onClick={() => copy(m)} className={clsx(bSoft, "!h-9 px-3 text-[13.5px]")}><Copy className="size-4" />Copy</button>{g?.phone && <a href={wa(m)} target="_blank" rel="noreferrer" className={clsx(bSoft, "!h-9 px-3 text-[13.5px]")}><MessageCircle className="size-4" />WhatsApp</a>}</div>
          </div>
        ))}
        <p className="text-[12.5px] text-hms-muted">WhatsApp opens on this device. Edit these texts and automatic email / SMS in <Link href="/hms/communication?tab=auto" className="underline underline-offset-2">Communication Center</Link> · <Link href={`/hms/chat?b=${b.code}`} className="font-semibold text-hms-red underline underline-offset-2">Chat with guest</Link></p>
      </Box>
    </div>
  );
}

function Activity({ b }: { b: Booking }) {
  return (
    <Box title="Activity">
      <ol className="space-y-0 border-l-2 border-hms-line pl-4">
        {[...b.log].reverse().map((l, i) => <li key={i} className="relative pb-3"><span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-white bg-[#9aa1ad]" /><p className="text-[14px]">{l.text}</p><p className="text-[12px] text-hms-muted">{dm(l.at.slice(0, 10))} {timeOf(l.at)} · {l.by}</p></li>)}
      </ol>
      <p className="mt-1 text-[12.5px] text-hms-muted">Source: {channelLabel(b)}{b.channelRef ? ` · ${b.channelRef}` : ""} · created {dm(b.created.slice(0, 10))}</p>
    </Box>
  );
}
