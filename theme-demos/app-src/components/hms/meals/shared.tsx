"use client";
// Restaurant & Bar — shared hook, chips, order sheet and payment sheet.
import { imgSrc } from "@/lib/img";
import { can } from "@/lib/plan";
import clsx from "clsx";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BedDouble, CakeSlice, Clock, Coffee, EggFried, Leaf, MapPin, Plus, Printer, Salad, Sandwich, ShoppingBag, Soup, Truck, UtensilsCrossed } from "lucide-react";
import { TODAY, useRooms } from "@/lib/rooms/store";
import { drawerFor, postCash } from "@/lib/cashbox/store";
import { METHOD_LABEL, SERVICE_LABEL, SOURCE_LABEL, STATUS_LABEL, bill, tk, type Discount, type Item, type Order, type PayMethod, type Payment, type Service, type Status } from "@/lib/meals/seed";
import { ageOf, useMeals } from "@/lib/meals/store";
import { useCashboxData } from "../cashbox/pages";
import { Sheet, btnLine, btnPrimary, input, lbl } from "../guests/ui";
import { useOutlet } from "./frame";
import { billHtml, kotHtml, printHtml } from "./print";

export function useToast() { const [t, setT] = useState(""); const show = (m: string) => { setT(m); setTimeout(() => setT((x) => (x === m ? "" : x)), 2800); }; return [t, show] as const; }

/** Everything a Restaurant & Bar screen needs: menu/orders, in-house guests for room service, cashbox link. */
export function useRestaurant() {
  const { h, refs, stays, names } = useCashboxData();
  const { st: rooms } = useRooms(h);
  const inHouse = useMemo(() => stays.filter((s) => s.status === "Checked in" && s.from <= TODAY && s.to > TODAY).map((s) => ({ room: s.room, guest: names.get(s.guestId) ?? "Guest" })).sort((a, b) => a.room.localeCompare(b.room, undefined, { numeric: true })), [stays, names]);
  const roomCodes = useMemo(() => rooms.units.filter((u) => u.status === "published").map((u) => u.code), [rooms.units]);
  const m = useMeals(h, inHouse, roomCodes);
  const [outlet] = useOutlet(m.outlets);
  const placeName = (o: Order) => o.service === "room" ? `Room ${o.room ?? "—"}` : o.place ? m.st.places.find((p) => p.id === o.place)?.name ?? o.place : o.service === "takeaway" ? "Takeaway" : SERVICE_LABEL[o.service];
  return { h, m, refs, inHouse, outlet, placeName };
}
export type Restaurant = ReturnType<typeof useRestaurant>;

export const STATUS_TONE: Record<Status, string> = {
  approval: "bg-[#fdf3d9] text-[#7a4a0b]", queued: "bg-[#eef0f3] text-[#3a414c]", preparing: "bg-[#e6efff] text-[#2457c5]", ready: "bg-[#e7f6ec] text-[#1c7d45]",
  served: "bg-[#f1f3f6] text-[#4d5664]", declined: "bg-[#fde5e4] text-[#b11c29]", cancelled: "bg-[#fde5e4] text-[#b11c29]",
};
export function StatusChip({ s }: { s: Status }) { return <span className={clsx("inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[12.5px] font-semibold", STATUS_TONE[s])}>{STATUS_LABEL[s]}</span>; }
export function PayChip({ o }: { o: Order }) {
  if (o.status === "cancelled" || o.status === "declined") return <span className="text-[12.5px] text-hms-muted">—</span>;
  return o.pay === "unpaid" ? <span className="inline-flex whitespace-nowrap rounded-md bg-[#fde5e4] px-2 py-0.5 text-[12.5px] font-semibold text-[#b11c29]">Unpaid</span>
    : <span className="inline-flex whitespace-nowrap rounded-md bg-[#e7f6ec] px-2 py-0.5 text-[12.5px] font-semibold text-[#1c7d45]">{o.pay === "room" ? `Room ${o.room} bill` : o.payments?.length ? o.payments.map((p) => METHOD_LABEL[p.method]).join(" + ") : METHOD_LABEL[o.method ?? "cash"]}</span>;
}
export const SERVICE_ICON: Record<Service, typeof UtensilsCrossed> = { dinein: UtensilsCrossed, room: BedDouble, takeaway: ShoppingBag, delivery: Truck };

const CAT_ICON: Record<string, typeof UtensilsCrossed> = { "c-bf": EggFried, "c-st": Salad, "c-lo": Soup, "c-in": Sandwich, "c-de": CakeSlice, "c-dr": Coffee };
/** Tile for a dish: its photo, or a soft tile with the category icon until a photo is uploaded. */
export function Dish({ it, className }: { it: Pick<Item, "name" | "photo" | "veg"> & { cat?: string }; className?: string }) {
  const I = CAT_ICON[it.cat ?? ""] ?? UtensilsCrossed;
  return (
    <span className={clsx("relative grid shrink-0 place-items-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,#fbf3ea,#f3e6d8)] text-[#b07a4a]", className)}>
      {it.photo ? <img src={imgSrc(it.photo)} alt="" className="absolute inset-0 size-full object-cover" /> : <I className="size-[34%] max-h-12 max-w-12" strokeWidth={1.5} aria-hidden />}
      {it.veg && <span className="absolute bottom-1 left-1 grid size-4 place-items-center rounded bg-white/90 text-[#1c7d45]" title="Vegetarian"><Leaf className="size-3" aria-label="Vegetarian" /></span>}
    </span>
  );
}

// ---------------- Order sheet ----------------
/** One order: what was ordered, where, the bill, and the next step (approve, kitchen, serve, pay, cancel). */
export function OrderSheet({ r, id, onClose, onDone, onPay }: { r: Restaurant; id: string; onClose: () => void; onDone: (m: string) => void; onPay: () => void }) {
  const o = r.m.st.orders.find((x) => x.id === id);
  const [reason, setReason] = useState("");
  const [asking, setAsking] = useState<"decline" | "cancel" | null>(null);
  if (!o) return null;
  const b = bill(o);
  const Icon = SERVICE_ICON[o.service];
  const next: [Status, string] | null = o.status === "queued" ? ["preparing", "Start preparing"] : o.status === "preparing" ? ["ready", "Mark ready"] : o.status === "ready" ? ["served", "Mark served"] : null;
  const canCancel = ["queued", "preparing"].includes(o.status) && o.pay === "unpaid";
  return (
    <Sheet title={`Order ${o.no}`} sub={`${o.at.slice(11, 16)} · ${SOURCE_LABEL[o.source]} · ${o.outlet}`} onClose={onClose}
      footer={asking ? <><button onClick={() => setAsking(null)} className={clsx(btnLine, "flex-1")}>Back</button><button onClick={() => { if (!reason.trim()) return; r.m.setStatus(o.id, asking === "decline" ? "declined" : "cancelled", reason.trim()); onDone(`${o.no} ${asking === "decline" ? "declined" : "cancelled"}`); }} disabled={!reason.trim()} className={clsx(btnPrimary, "flex-[1.4]")}>{asking === "decline" ? "Decline order" : "Cancel order"}</button></>
        : o.status === "approval" ? <><button onClick={() => setAsking("decline")} className={clsx(btnLine, "flex-1")}>Decline</button><button onClick={() => { r.m.setStatus(o.id, "queued"); onDone(`${o.no} sent to the kitchen`); }} className={clsx(btnPrimary, "flex-[1.4]")}>Approve &amp; send to kitchen</button></>
        : <>{canCancel && <button onClick={() => setAsking("cancel")} className={clsx(btnLine, "flex-1")}>Cancel order</button>}{o.pay === "unpaid" && !["cancelled", "declined"].includes(o.status) && <button onClick={onPay} className={clsx(next ? btnLine : btnPrimary, "flex-1")}>Take payment</button>}{next && <button onClick={() => { r.m.setStatus(o.id, next[0]); onDone(`${o.no}: ${STATUS_LABEL[next[0]].toLowerCase()}`); }} className={clsx(btnPrimary, "flex-[1.3]")}>{next[1]}</button>}{!next && o.pay !== "unpaid" && <button onClick={onClose} className={clsx(btnLine, "flex-1")}>Close</button>}</>}>
      {asking ? (
        <div><label htmlFor="o-why" className={lbl}>Reason</label><input id="o-why" autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder={asking === "decline" ? "e.g. Item not available" : "e.g. Guest changed mind"} className={input} /><p className="mt-2 text-[13px] text-hms-muted">{asking === "decline" ? "The guest sees that the order was declined." : "The kitchen stops this order."}</p></div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2"><StatusChip s={o.status} /><PayChip o={o} />{o.reason && <span className="text-[13px] text-hms-muted">· {o.reason}</span>}</div>
          <div className="flex items-center gap-3 rounded-xl bg-[#f4f6f8] px-3 py-2.5 text-[14px]"><Icon className="size-5 text-hms-muted" aria-hidden /><span className="flex-1"><b>{SERVICE_LABEL[o.service]}</b> · {r.placeName(o)}{o.guest ? ` · ${o.guest}` : ""}</span>{o.at.slice(0, 10) === TODAY && !["served", "cancelled", "declined"].includes(o.status) && <span className="flex items-center gap-1 text-[13px] text-hms-muted"><Clock className="size-3.5" aria-hidden />{ageOf(o)} min</span>}</div>
          <ul className="divide-y divide-hms-line rounded-xl border border-hms-line">{o.lines.map((l, i) => <li key={i} className="flex justify-between gap-3 px-3 py-2.5 text-[14px]"><span><b className="tabular-nums">{l.qty}×</b> {l.name}{(l.round ?? 1) > 1 && <span className="ml-1.5 rounded bg-[#eef0f3] px-1.5 text-[11.5px] font-semibold text-hms-muted">added</span>}{l.note && <span className="block text-[12.5px] text-[#a4500f]">{l.note}</span>}</span><span className="tabular-nums">{tk(l.price * l.qty)}</span></li>)}</ul>
          <div className="flex flex-wrap gap-2">
            {o.pay === "unpaid" && !["cancelled", "declined", "approval"].includes(o.status) && <Link href={`/hms/meals/pos?order=${o.id}`} className={clsx(btnLine, "h-9 px-3")}><Plus className="size-4" aria-hidden />Add items</Link>}
            <button onClick={() => printHtml(billHtml(o, r.h.name, r.placeName(o)))} className={clsx(btnLine, "h-9 px-3")}><Printer className="size-4" aria-hidden />Print bill</button>
            {!["cancelled", "declined", "served"].includes(o.status) && <button onClick={() => printHtml(kotHtml(o, r.placeName(o)))} className={clsx(btnLine, "h-9 px-3")}><Printer className="size-4" aria-hidden />Print KOT</button>}
          </div>
          <dl className="space-y-1 text-[14px]">
            <div className="flex justify-between"><dt className="text-hms-muted">Subtotal</dt><dd className="tabular-nums">{tk(b.sub)}</dd></div>
            {b.disc > 0 && <div className="flex justify-between text-[#1c7d45]"><dt>Discount{o.discount?.reason ? ` · ${o.discount.reason}` : ""}</dt><dd className="tabular-nums">−{tk(b.disc)}</dd></div>}
            <div className="flex justify-between"><dt className="text-hms-muted">Service charge ({o.sc}%)</dt><dd className="tabular-nums">{tk(b.sc)}</dd></div>
            <div className="flex justify-between"><dt className="text-hms-muted">VAT ({o.vat}%)</dt><dd className="tabular-nums">{tk(b.vat)}</dd></div>
            <div className="flex justify-between border-t border-hms-line pt-2 text-[16px] font-bold"><dt>Total</dt><dd className="tabular-nums">{tk(b.total)}</dd></div>
          </dl>
          {o.pay !== "unpaid" && <p className="text-[13px] text-hms-muted">{o.pay === "room" ? `Added to room ${o.room}'s bill — paid at checkout (main cashbox).` : o.payments?.length ? `Paid ${o.payments.map((p) => `${METHOD_LABEL[p.method]} ${tk(p.amount)}`).join(" + ")} at ${o.paidAt?.slice(11, 16)}.` : `Paid by ${METHOD_LABEL[o.method ?? "cash"].toLowerCase()} at ${o.paidAt?.slice(11, 16)}.`}</p>}
        </div>
      )}
    </Sheet>
  );
}

// ---------------- Payment sheet ----------------
/** Discount (with reason), then one method — or split between cash and card/bKash. Cash goes to the right cashbox. */
export function PaySheet({ r, id, onClose, onDone }: { r: Restaurant; id: string; onClose: () => void; onDone: (m: string) => void }) {
  const o = r.m.st.orders.find((x) => x.id === id)!;
  const roomOk = r.inHouse.length > 0;
  const [method, setMethod] = useState<PayMethod>(o.service === "room" ? "room" : "cash");
  const [dk, setDk] = useState<"percent" | "fixed">(o.discount?.kind ?? "percent");
  const [dv, setDv] = useState(o.discount ? String(o.discount.value) : "");
  const [dr, setDr] = useState(o.discount?.reason ?? "");
  const [showDisc, setShowDisc] = useState(!!o.discount);
  const [room, setRoom] = useState(o.room ?? "");
  const [splitCash, setSplitCash] = useState("");
  const [splitOther, setSplitOther] = useState<"card" | "bkash">("card");
  const [err, setErr] = useState("");
  const dNum = Number(dv) || 0;
  const disc: Discount | undefined = showDisc && dNum > 0 ? { kind: dk, value: dNum, reason: dr.trim() } : undefined;
  const b = bill({ ...o, discount: disc });
  const [got, setGot] = useState("");
  const recv = got === "" ? b.total : Number(got) || 0;
  const drawer = drawerFor(r.h, r.refs, o.outlet);
  const sc = Math.min(Number(splitCash) || 0, b.total);
  const src = o.service === "room" ? "roomservice" as const : o.service === "takeaway" ? "takeaway" as const : "dinein" as const;
  const save = () => {
    setErr("");
    if (disc && !disc.reason) return setErr("Add a reason for the discount");
    if (disc && ((disc.kind === "percent" && disc.value > 50) || (disc.kind === "fixed" && disc.value > bill(o).sub / 2))) return setErr("Discount above 50% needs a manager in the live HMS");
    let payments: Payment[] | undefined;
    if (method === "cash") {
      if (recv < b.total) return setErr(`Received is less than ${tk(b.total)}`);
      const e = postCash(r.h, r.refs, o.outlet, { amount: b.total, source: src, ref: o.no, party: o.guest });
      if (e) return setErr(e);
    }
    if (method === "split") {
      if (!(sc > 0 && sc < b.total)) return setErr("Enter the cash part (less than the total)");
      const e = postCash(r.h, r.refs, o.outlet, { amount: sc, source: src, ref: o.no, party: o.guest });
      if (e) return setErr(e);
      payments = [{ method: "cash", amount: sc }, { method: splitOther, amount: b.total - sc }];
    }
    if (method === "room" && !r.inHouse.some((x) => x.room === room)) return setErr("Pick a room with a guest staying now");
    r.m.setDiscount(o.id, disc);
    r.m.pay(o.id, method, method === "room" ? room : undefined, payments);
    onDone(method === "cash" ? `${tk(b.total)} cash · ${drawer.name}${recv > b.total ? ` · change ${tk(recv - b.total)}` : ""}` : method === "split" ? `${tk(sc)} cash + ${tk(b.total - sc)} ${METHOD_LABEL[splitOther]}` : method === "room" ? `${tk(b.total)} added to room ${room}'s bill` : `${tk(b.total)} paid by ${METHOD_LABEL[method].toLowerCase()}`);
  };
  return (
    <Sheet title="Take payment" sub={`${o.no} · ${r.placeName(o)}`} onClose={onClose}
      footer={<><button onClick={onClose} className={clsx(btnLine, "flex-1")}>Cancel</button><button onClick={save} className={clsx(btnPrimary, "flex-[1.4]")}>{method === "room" ? `Charge ${tk(b.total)} to room` : `Paid ${tk(b.total)}`}</button></>}>
      <div className="space-y-4">
        <div className="rounded-xl bg-[#f4f6f8] p-3 text-[14px]">
          <div className="flex justify-between"><span className="text-hms-muted">Food</span><span className="tabular-nums">{tk(b.sub)}</span></div>
          {b.disc > 0 && <div className="flex justify-between text-[#1c7d45]"><span>Discount</span><span className="tabular-nums">−{tk(b.disc)}</span></div>}
          <div className="flex justify-between"><span className="text-hms-muted">Service charge + VAT</span><span className="tabular-nums">{tk(b.sc + b.vat)}</span></div>
          <div className="mt-1 flex justify-between border-t border-hms-line pt-1.5 text-[18px] font-bold"><span>To pay</span><span className="tabular-nums">{tk(b.total)}</span></div>
        </div>
        {!showDisc ? <button onClick={() => setShowDisc(true)} className="text-[13.5px] font-semibold text-hms-red">+ Add discount</button> : (
          <div className="rounded-xl border border-hms-line p-3">
            <div className="flex items-center justify-between"><p className="text-[14px] font-semibold">Discount</p><button onClick={() => { setShowDisc(false); setDv(""); setDr(""); }} className="text-[13px] text-hms-muted underline">Remove</button></div>
            <div className="mt-2 flex gap-2">
              <div role="radiogroup" aria-label="Discount type" className="flex rounded-lg bg-[#e9edf2] p-1">{([["percent", "%"], ["fixed", "৳"]] as const).map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={dk === v} onClick={() => setDk(v)} className={clsx("h-8 w-10 rounded-md text-[14px] font-semibold", dk === v ? "bg-white shadow-sm" : "text-[#4d5664]")}>{l}</button>)}</div>
              <input aria-label="Discount amount" inputMode="numeric" value={dv} onChange={(e) => setDv(e.target.value.replace(/\D/g, ""))} placeholder={dk === "percent" ? "10" : "200"} className="h-10 w-24 rounded-lg border border-[#858c97] px-2.5 text-[15px] outline-none focus:border-hms-ink" />
              <input aria-label="Discount reason" value={dr} onChange={(e) => setDr(e.target.value)} placeholder="Reason, e.g. Regular guest" className="h-10 min-w-0 flex-1 rounded-lg border border-[#858c97] px-2.5 text-[14px] outline-none focus:border-hms-ink" />
            </div>
          </div>
        )}
        <div><p className={lbl}>How</p><div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(["cash", "card", "bkash", "split", "room"] as PayMethod[]).map((k) => <button key={k} type="button" role="radio" aria-checked={method === k} disabled={k === "room" && !roomOk} onClick={() => setMethod(k)} className={clsx("h-11 rounded-lg border text-[14px] font-semibold disabled:opacity-40", method === k ? "border-hms-ink shadow-[inset_0_0_0_1px] shadow-hms-ink" : "border-hms-line")}>{k === "split" ? "Cash + card" : METHOD_LABEL[k]}</button>)}
        </div></div>
        {method === "cash" && <div><label htmlFor="p-got" className={lbl}>Cash received (৳)</label><input id="p-got" autoFocus inputMode="numeric" value={got} onChange={(e) => setGot(e.target.value.replace(/\D/g, ""))} placeholder={String(b.total)} className={clsx(input, "text-[18px] font-semibold")} />
          <div className="mt-2 flex flex-wrap gap-1.5">{[b.total, Math.ceil(b.total / 500) * 500, Math.ceil(b.total / 1000) * 1000].filter((v, i, a) => a.indexOf(v) === i).map((v) => <button key={v} type="button" onClick={() => setGot(String(v))} className="rounded-full border border-hms-line px-3 py-1 text-[13px] font-semibold tabular-nums hover:bg-hms-hover">{tk(v)}</button>)}</div>
          {recv > b.total && <p className="mt-2 text-[16px] font-bold text-[#1c7d45]">Change: {tk(recv - b.total)}</p>}</div>}
        {method === "split" && <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="p-sc" className={lbl}>Cash part (৳)</label><input id="p-sc" autoFocus inputMode="numeric" value={splitCash} onChange={(e) => setSplitCash(e.target.value.replace(/\D/g, ""))} className={input} /></div>
          <div><p className={lbl}>Rest {tk(Math.max(0, b.total - sc))} by</p><div role="radiogroup" aria-label="Rest paid by" className="flex rounded-lg bg-[#e9edf2] p-1">{(["card", "bkash"] as const).map((v) => <button key={v} type="button" role="radio" aria-checked={splitOther === v} onClick={() => setSplitOther(v)} className={clsx("h-9 flex-1 rounded-md text-[13.5px] font-semibold", splitOther === v ? "bg-white shadow-sm" : "text-[#4d5664]")}>{METHOD_LABEL[v]}</button>)}</div></div>
        </div>}
        {(method === "cash" || method === "split") && <p className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-[13px]", drawer.open ? "bg-[#eef8f2] text-[#165f37]" : "bg-[#fdf3d9] text-[#7a4a0b]")}><MapPin className="size-4 shrink-0" aria-hidden />{drawer.open ? `Cash goes to ${drawer.name}.` : `${drawer.name} is not open. Open it in Cashbox first.`}</p>}
        {method === "room" && <div><label htmlFor="p-room" className={lbl}>Room (guest staying now)</label><select id="p-room" value={room} onChange={(e) => setRoom(e.target.value)} className={input}><option value="">Choose a room</option>{r.inHouse.map((g) => <option key={g.room} value={g.room}>Room {g.room} · {g.guest}</option>)}</select><p className="mt-1 text-[12.5px] text-hms-muted">Not cash. The guest pays at checkout at the front desk.</p></div>}
        {(method === "card" || method === "bkash") && <p className="text-[13px] text-hms-muted">Not cash, so nothing goes to a cashbox. Card and bKash payments are listed in Payments in the live HMS.</p>}
        {err && <p role="alert" className="rounded-lg bg-[#fde5e4] px-3 py-2 text-[13.5px] font-medium text-[#a3261f]">{err}</p>}
      </div>
    </Sheet>
  );
}

/** Sidebar badge: QR / POS orders waiting for approval (only when the plan has Restaurant). */
export function MealsBadge({ active }: { active: boolean }) {
  const { h, m } = useRestaurant();
  const n = m.st.orders.filter((o) => o.status === "approval").length;
  if (!n || !can(h, "restaurant")) return null;
  return <span aria-label={`${n} waiting`} className={clsx("grid size-5 place-items-center rounded-full text-[11px] font-semibold", active ? "bg-white/20" : "bg-hms-coral-soft text-hms-red")}>{n}</span>;
}
