"use client";
import clsx from "clsx";
import { useMemo, useState, type ReactNode } from "react";
import { BedDouble, Brush, CircleAlert, LogIn, LogOut, X as XIcon } from "lucide-react";
import { TODAY } from "@/lib/rooms/store";
import { addDays } from "@/lib/bookings/demo";
import { METHODS, bill, dm, dmy, dueOf, nightsBetween, paidOf, policyFee, tk, totalOf, type Booking, type Night, type PayMethod } from "@/lib/bookings/store";
import { useServices, orderTotal, STATUS_LABEL, statusOf, type WorkStatus } from "@/lib/services/store";
import { bill as mealBill } from "@/lib/meals/seed";
import { validId, type IdType } from "@/lib/guests/store";
import { useHousekeeping } from "@/lib/housekeeping/store";
import { useProperty } from "../property";
import { useRestaurant } from "../meals/shared";
import { input, lbl } from "../guests/ui";
import { bMain, bSmall, bSoft, useBk } from "./ui";

export const Row = ({ k, v, strong, tone }: { k: ReactNode; v: ReactNode; strong?: boolean; tone?: string }) => (
  <div className={clsx("flex items-baseline justify-between gap-3 py-1 text-[14px]", strong && "font-bold")}><span className={strong ? "" : "text-[#4d5664]"}>{k}</span><span className={clsx("tabular-nums", tone)}>{v}</span></div>
);
const Err = ({ children }: { children: ReactNode }) => <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-[#fdecec] px-3 py-2 text-[13.5px] font-medium text-[#b42318]"><CircleAlert className="mt-0.5 size-4 shrink-0" />{children}</p>;
const Hint = ({ children }: { children: ReactNode }) => <p className="mt-2 text-[12.5px] text-hms-muted">{children}</p>;

/** Charges that sit on the room bill from other modules: unpaid booking service orders + restaurant "charged to room". */
export function useExtras(b: Booking) {
  const h = useProperty();
  const svc = useServices(h);
  const r = useRestaurant();
  return useMemo(() => {
    const lines: { label: string; amount: number; from: string }[] = [];
    const svcOrders: { id: string; name: string; qty: number; when: string; total: number; status: string; paid: boolean }[] = [];
    for (const o of svc.st.orders) {
      if (o.cancelled || o.method !== "booking" || o.booking?.code !== b.code) continue;
      const name = svc.st.services.find((s) => s.id === o.service)?.name ?? "Service";
      svcOrders.push({ id: o.id, name, qty: o.qty, when: o.when === "now" ? o.created : `${o.when.date}T${o.when.time}`, total: orderTotal(o), status: o.payment === "Paid" ? "Paid" : STATUS_LABEL[statusOf(o) as WorkStatus] ?? "Booked", paid: o.payment === "Paid" });
      if (o.payment === "Unpaid") lines.push({ label: name, amount: orderTotal(o), from: `Other Services · ${o.id}` });
    }
    if (b.unit && b.status === "Checked in") for (const o of r.m.st.orders) if (o.pay === "room" && o.room === b.unit && o.status !== "cancelled" && o.status !== "declined" && (o.at ?? "").slice(0, 10) >= b.from) lines.push({ label: `Restaurant ${o.no}`, amount: mealBill(o).total, from: "Restaurant & Bar · charged to room" });
    return { lines, svcOrders, total: lines.reduce((s, l) => s + l.amount, 0), settle: () => svc.settleBooking(b.code) };
  }, [svc, r.m.st.orders, b]);
}

/** Guests count + room discount, edited in place (the special request lives in the stay register only). */
export function DetailsEdit({ b }: { b: Booking }) {
  const { bk, toast } = useBk();
  const [f, setF] = useState({ adults: String(b.adults), children: String(b.children), discount: String(b.discount || "") });
  const dirty = f.adults !== String(b.adults) || f.children !== String(b.children) || f.discount !== String(b.discount || "");
  const rooms = b.nights.reduce((s, n) => s + n.base, 0);
  const bad = Number(f.discount || 0) > rooms;
  if (b.status !== "Confirmed" && b.status !== "Checked in") return null;
  return (
    <div className="mt-4 border-t border-hms-line pt-4">
      <div className="grid grid-cols-3 gap-2">
        <div><label htmlFor="e-ad" className={lbl}>Adults</label><input id="e-ad" type="number" min={1} max={9} value={f.adults} onChange={(e) => setF({ ...f, adults: e.target.value })} className={input} /></div>
        <div><label htmlFor="e-ch" className={lbl}>Children</label><input id="e-ch" type="number" min={0} max={9} value={f.children} onChange={(e) => setF({ ...f, children: e.target.value })} className={input} /></div>
        <div><label htmlFor="e-di" className={lbl}>Discount ৳</label><input id="e-di" inputMode="numeric" value={f.discount} onChange={(e) => setF({ ...f, discount: e.target.value.replace(/\D/g, "") })} className={input} placeholder="0" /></div>
      </div>
      {bad && <p className="mt-1 text-[12.5px] font-medium text-[#b42318]">Discount is more than the room charges ({tk(rooms)})</p>}
      {dirty && <div className="mt-2 flex justify-end gap-2"><button onClick={() => setF({ adults: String(b.adults), children: String(b.children), discount: String(b.discount || "") })} className={clsx(bSmall, "bg-[#eef0f3] hover:bg-[#e3e6eb]")}>Undo</button><button disabled={bad || Number(f.adults) < 1} onClick={() => { bk.update(b.code, { adults: Math.max(1, Number(f.adults)), children: Math.max(0, Number(f.children) || 0), discount: Number(f.discount) || 0 }, "Guests / discount updated"); toast("Booking updated"); }} className={clsx(bSmall, "btn-glow text-white")}>Save changes</button></div>}
    </div>
  );
}

// ---------------- shared bits for action views ----------------
export type ViewProps = { b: Booking; onBack: () => void; onClose: () => void; onDone: (m: string) => void };
/** Inline action panel inside the booking page (no side drawers). */
function ActionSheet({ title, sub, onBack, footer, children }: { title: string; sub: string; onBack: () => void; onClose: () => void; footer: ReactNode; children: ReactNode }) {
  return (
    <section role="region" aria-label={title} className="hms-up overflow-hidden rounded-2xl border-2 border-hms-ink/80 bg-white shadow-[0_12px_32px_-18px_rgb(15_23_32/0.35)]">
      <div className="flex items-start gap-3 border-b border-hms-line px-5 py-3.5">
        <div className="min-w-0 flex-1"><h2 className="text-[17px] font-bold">{title}</h2><p className="truncate text-[13px] text-hms-muted">{sub}</p></div>
        <button onClick={onBack} aria-label={`Close ${title}`} className="grid size-9 place-items-center rounded-lg hover:bg-hms-hover"><XIcon className="size-5" /></button>
      </div>
      <div className="px-5 py-4">{children}</div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-hms-line bg-[#fafbfc] px-5 py-3"><button onClick={onBack} className={bSoft}>Cancel</button>{footer}</div>
    </section>
  );
}
function MethodPick({ value, onChange }: { value: PayMethod; onChange: (m: PayMethod) => void }) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-4 gap-1.5">
      {METHODS.map((m) => <button key={m} type="button" role="radio" aria-checked={value === m} onClick={() => onChange(m)} className={clsx("h-10 rounded-lg border text-[14px] font-semibold", value === m ? "border-hms-ink bg-hms-ink text-white" : "border-hms-line bg-white hover:bg-hms-hover")}>{m}</button>)}
    </div>
  );
}
const money = (v: string) => v.replace(/[^\d]/g, "");

export function CheckInView({ b, extras, onBack, onClose, onDone, takeCash }: ViewProps & { extras: number; takeCash: (n: number, ref: string) => string }) {
  const { bk, guests, g } = useBk();
  const hk = useHousekeeping(useProperty());
  const guest = guests.get(b.guestId);
  const free = bk.freeUnits(TODAY > b.from ? TODAY : b.from, b.to, b.code);
  const [unit, setUnit] = useState(b.unit && free.some((u) => u.code === b.unit) ? b.unit : b.unit || "");
  const [idType, setIdType] = useState<IdType>(guest?.idNo ? guest.idType : (b.precheck?.idType as IdType) || guest?.idType || "NID");
  const [idNo, setIdNo] = useState(guest?.idNo || b.precheck?.idNo || "");
  const owe = Math.max(0, dueOf(b) + extras);
  // Never pre-filled: taking money is always a deliberate tap.
  const [amt, setAmt] = useState("");
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [err, setErr] = useState("");
  const S = bk.settings;
  const [early, setEarly] = useState(false);
  const [dep, setDep] = useState(false);
  const [depAmt, setDepAmt] = useState(String(S.depositDefault));
  const [depMethod, setDepMethod] = useState<PayMethod>("Cash");
  const same = free.filter((u) => u.category === b.categoryId);
  const go = () => {
    setErr("");
    if (guest?.blocked) return setErr(`${guest.name} is blocked (${guest.blocked.reason})`);
    if (idNo && !validId(idType, idNo)) return setErr(`That ${idType} number doesn't look right`);
    if (unit !== b.unit) { const e = bk.assign(b.code, unit); if (e) return setErr(e); }
    const a = Number(amt) || 0;
    const d = dep ? Number(depAmt) || 0 : 0;
    if (a > 0 && method === "Cash") { const e = takeCash(a, b.code); if (e) return setErr(e); }
    if (d > 0 && depMethod === "Cash") { const e = takeCash(d, `${b.code} deposit`); if (e) return setErr(e); }
    const e = bk.checkIn(b.code); if (e) return setErr(e);
    if (early) bk.addCharge(b.code, "Early check-in", S.earlyFee);
    if (a > 0) bk.pay(b.code, a, method, "At check-in");
    if (d > 0) bk.takeDeposit(b.code, d, depMethod);
    if (guest && idNo && (idNo !== guest.idNo || idType !== guest.idType)) g.saveGuest({ id: guest.id, name: guest.name, phone: guest.phone, email: guest.email, country: guest.country, address: guest.address, idType, idNo, idFront: guest.idFront, idBack: guest.idBack, verified: guest.verified, vip: guest.vip, blocked: guest.blocked, prefs: guest.prefs, notes: guest.notes, marketing: guest.marketing, created: guest.created });
    onDone(`${guest?.name ?? "Guest"} checked in to Room ${unit}${a ? ` · ${tk(a)} ${method}` : ""}`);
  };
  return (
    <ActionSheet title="Check in" sub={`${guest?.name ?? "Guest"} · ${b.code} · ${b.nights.length} night${b.nights.length > 1 ? "s" : ""}`} onBack={onBack} onClose={onClose}
      footer={<button onClick={go} disabled={!unit} className={clsx(bMain, "min-w-[200px] flex-1 sm:flex-none")}><LogIn className="size-4" />Check in{unit ? ` to Room ${unit}` : ""}</button>}>
      <div><label htmlFor="ci-room" className={lbl}>Room</label>
        <select id="ci-room" value={unit} onChange={(e) => setUnit(e.target.value)} className={input}>
          {!unit && <option value="">Choose a room</option>}
          {b.unit && !free.some((u) => u.code === b.unit) && <option value={b.unit}>Room {b.unit} (booked)</option>}
          {same.length > 0 && <optgroup label={`${b.type} — free`}>{same.map((u) => <option key={u.code} value={u.code}>Room {u.code}</option>)}</optgroup>}
          {free.filter((u) => u.category !== b.categoryId).length > 0 && <optgroup label="Other room types (price stays the same)">{free.filter((u) => u.category !== b.categoryId).map((u) => <option key={u.code} value={u.code}>Room {u.code} · {bk.cats.get(u.category)?.name}</option>)}</optgroup>}
        </select>
      </div>
      <div className="mt-4"><p className={lbl}>Guest ID {guest?.idNo ? <span className="font-normal text-hms-muted">· on file</span> : <span className="font-normal text-[#a15c00]">· optional, add now or later</span>}</p>
        <div className="grid grid-cols-[130px_1fr] gap-2">
          <select aria-label="ID type" value={idType} onChange={(e) => setIdType(e.target.value as IdType)} className={input}><option>NID</option><option>Passport</option><option>Driving licence</option></select>
          <input aria-label="ID number" value={idNo} onChange={(e) => setIdNo(e.target.value.trim())} placeholder={idType === "NID" ? "10, 13 or 17 digits" : "Number"} className={input} />
        </div>
      </div>
      {b.precheck && <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#e5f5ec] px-3.5 py-2.5 text-[13.5px] text-[#14532d]"><CircleAlert className="mt-0.5 size-4 shrink-0" /><span>Pre-checked in online{b.eta ? ` · arriving ${b.eta}` : ""}{b.precheck.note ? ` · “${b.precheck.note}”` : ""}. Check the ID matches.</span></p>}
      {unit && !hk.isReady(unit) && <p role="note" className="mt-3 flex items-start gap-2 rounded-xl bg-[#fff4e0] px-3.5 py-2.5 text-[13.5px] text-[#6b4309]"><Brush className="mt-0.5 size-4 shrink-0" /><span>Room {unit} is <b>{hk.stateOf(unit)}</b> — not cleaned yet. Pick a clean room above, or check in and let the guest wait.</span></p>}
      <GuestAlerts b={b} />
      <label className="mt-4 flex items-center gap-3 rounded-xl border border-hms-line px-3.5 py-2.5 text-[14px]"><input type="checkbox" checked={early} onChange={(e) => setEarly(e.target.checked)} className="size-4 accent-[#b11c29]" /><span className="flex-1">Early check-in (before {S.checkIn})</span><b className="tabular-nums">+{tk(S.earlyFee)}</b></label>
      <div className="mt-2 rounded-xl border border-hms-line px-3.5 py-2.5">
        <Row k="Room bill" v={tk(totalOf(b))} />{extras > 0 && <Row k="Extras on the bill" v={tk(extras)} />}{early && <Row k="Early check-in" v={tk(S.earlyFee)} />}<Row k="Paid" v={tk(paidOf(b))} /><Row strong k="Balance" v={tk(owe + (early ? S.earlyFee : 0))} />
      </div>
      <div className="mt-3"><label htmlFor="ci-amt" className={lbl}>Take payment now (optional)</label><input id="ci-amt" inputMode="numeric" value={amt} onChange={(e) => setAmt(money(e.target.value))} placeholder="0" className={input} />
        {owe > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{[owe, Math.round(owe / 2)].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((v, i) => <button key={v} type="button" onClick={() => setAmt(String(v))} className="rounded-full bg-[#eef0f3] px-3 py-1 text-[13px] font-semibold hover:bg-[#e3e6eb]">{i === 0 ? "Full" : "Half"} · {tk(v)}</button>)}</div>}</div>
      {Number(amt) > 0 && <div className="mt-2"><MethodPick value={method} onChange={setMethod} /></div>}
      <label className="mt-3 flex items-center gap-3 text-[14px] font-semibold"><input type="checkbox" checked={dep} onChange={(e) => setDep(e.target.checked)} className="size-4 accent-[#b11c29]" />Take a security deposit</label>
      {dep && <div className="mt-2 grid gap-2 sm:grid-cols-[160px_1fr]"><input aria-label="Deposit amount" inputMode="numeric" value={depAmt} onChange={(e) => setDepAmt(money(e.target.value))} className={input} /><MethodPick value={depMethod} onChange={setDepMethod} /></div>}
      {err && <Err>{err}</Err>}
    </ActionSheet>
  );
}

/** What front desk must see before handing over the key. */
export function GuestAlerts({ b }: { b: Booking }) {
  const { guests } = useBk();
  const g = guests.get(b.guestId);
  if (!g) return null;
  const a: [string, string][] = [];
  if (g.blocked) a.push(["Blocked", g.blocked.reason]);
  if (g.vip) a.push(["VIP", "Welcome personally"]);
  if (!g.idNo) a.push(["ID missing", "Collect NID / passport"]);
  if (g.country !== "Bangladesh" && !g.visaNo) a.push(["Visa", "Add visa details for Form-C"]);
  if (g.notes) a.push(["Note", g.notes]);
  if (g.prefs.length) a.push(["Likes", g.prefs.join(", ")]);
  if (b.note) a.push(["Request", b.note]);
  if (!a.length) return null;
  return (
    <ul aria-label="Guest alerts" className="mt-4 space-y-1 rounded-xl bg-[#fdf8ec] px-3.5 py-2.5 text-[13.5px] text-[#6b4309]">
      {a.map(([k, v]) => <li key={k + v}><b className={k === "Blocked" ? "text-[#b42318]" : ""}>{k}:</b> {v}</li>)}
    </ul>
  );
}

export function CheckOutView({ b, extras, onBack, onClose, onDone, takeCash, giveCash }: ViewProps & { extras: ReturnType<typeof useExtras>; takeCash: (n: number, ref: string) => string; giveCash?: (n: number, ref: string) => string }) {
  const { bk, guests } = useBk();
  const hk = useHousekeeping(useProperty());
  const guest = guests.get(b.guestId);
  const early = b.to > TODAY;
  const stayed = b.nights.filter((n) => n.date < TODAY);
  // Default: charge the booking as made. Staff tick this only when the hotel's policy refunds unused nights.
  const [shorten, setShorten] = useState(false);
  const nights = shorten ? (stayed.length ? stayed : b.nights.slice(0, 1)) : b.nights;
  const S = bk.settings;
  const [late, setLate] = useState(false);
  const dep = b.deposit && !b.deposit.settled ? b.deposit : undefined;
  const [useDep, setUseDep] = useState(true);
  const room = bill({ ...b, nights }).total;
  const stayBill = totalOf({ ...b, nights });
  const total = stayBill + extras.total + (late ? S.lateFee : 0);
  const before = total - paidOf(b);
  const depUsed = dep && useDep ? Math.max(0, Math.min(dep.amount, before)) : 0;
  const balance = before - depUsed;
  const [amt, setAmt] = useState("");
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [err, setErr] = useState("");
  const left = Math.max(0, balance - (Number(amt) || 0));
  const go = (leaveDue: boolean) => {
    setErr("");
    const a = Math.min(Number(amt) || 0, Math.max(0, balance));
    if (left > 0 && !leaveDue) return setErr(`${tk(left)} still due — collect it or use "Check out with balance due"`);
    if (a > 0 && method === "Cash") { const e = takeCash(a, b.code); if (e) return setErr(e); }
    const back = dep ? dep.amount - depUsed : 0;
    if (back > 0 && dep?.method === "Cash" && giveCash) { const e = giveCash(back, `${b.code} deposit`); if (e) return setErr(e); }
    if (late) bk.addCharge(b.code, "Late check-out", S.lateFee);
    if (dep) bk.settleDeposit(b.code, depUsed);
    if (a > 0) bk.pay(b.code, a, method, "At check-out");
    const e = bk.checkOut(b.code, { shorten, leaveDue, extras: extras.total }); if (e) return setErr(e);
    hk.vacated(b.unit, b.code);
    if (left === 0) extras.settle();
    onDone(`${guest?.name ?? "Guest"} checked out of Room ${b.unit}${left ? ` · ${tk(left)} still due` : ""}${back > 0 ? ` · return ${tk(back)} deposit` : ""}`);
  };
  return (
    <ActionSheet title="Check out" sub={`${guest?.name ?? "Guest"} · Room ${b.unit} · ${b.code}`} onBack={onBack} onClose={onClose}
      footer={<button onClick={() => go(false)} className={clsx(bMain, "min-w-[200px] flex-1 sm:flex-none")}><LogOut className="size-4" />{balance > 0 ? `Collect ${tk(Math.min(Number(amt) || 0, balance))} & check out` : "Check out"}</button>}>
      {b.to < TODAY && <p className="mb-3 rounded-lg bg-[#fff4e0] px-3 py-2 text-[13.5px] text-[#8a4b00]">Check-out was due {dmy(b.to)}. Extra nights are not charged automatically — change the dates first if they should be.</p>}
      {early && (
        <label className="mb-3 flex items-start gap-3 rounded-xl border border-hms-line px-3.5 py-3">
          <input type="checkbox" checked={shorten} onChange={(e) => setShorten(e.target.checked)} className="mt-1 size-4 accent-[#b11c29]" />
          <span><span className="block text-[14px] font-semibold">Leaving early? Charge only {Math.max(1, stayed.length)} night{Math.max(1, stayed.length) > 1 ? "s" : ""} stayed</span><span className="text-[12.5px] text-hms-muted">Booked until {dmy(b.to)} ({b.nights.length} nights). Untick to charge the full booking.</span></span>
        </label>
      )}
      <div className="rounded-xl border border-hms-line px-3.5 py-2.5">
        <Row k={`Room · ${nights.length} night${nights.length > 1 ? "s" : ""} (incl. VAT & service)`} v={tk(room)} />
        {stayBill - room > 0 && <Row k="Meals & charges on the booking" v={tk(stayBill - room)} />}
        {extras.lines.map((l, i) => <Row key={i} k={l.label} v={tk(l.amount)} />)}
        {late && <Row k="Late check-out" v={tk(S.lateFee)} />}
        <Row k="Paid" v={`−${tk(paidOf(b))}`} tone="text-[#16693a]" />
        {depUsed > 0 && <Row k="From deposit" v={`−${tk(depUsed)}`} tone="text-[#16693a]" />}
        <div className="mt-1 border-t border-hms-line pt-1"><Row strong k={balance < 0 ? "To refund" : "To pay now"} v={tk(Math.abs(balance))} tone={balance > 0 ? "text-[#b42318]" : ""} /></div>
      </div>
      <label className="mt-3 flex items-center gap-3 rounded-xl border border-hms-line px-3.5 py-2.5 text-[14px]"><input type="checkbox" checked={late} onChange={(e) => setLate(e.target.checked)} className="size-4 accent-[#b11c29]" /><span className="flex-1">Late check-out (after {S.checkOut})</span><b className="tabular-nums">+{tk(S.lateFee)}</b></label>
      {dep && <label className="mt-2 flex items-center gap-3 rounded-xl border border-hms-line px-3.5 py-2.5 text-[14px]"><input type="checkbox" checked={useDep} onChange={(e) => setUseDep(e.target.checked)} className="size-4 accent-[#b11c29]" /><span className="flex-1">Use the {tk(dep.amount)} deposit ({dep.method}) for the bill</span>{dep.amount - depUsed > 0 && <b className="text-[#6b55e0]">return {tk(dep.amount - depUsed)}</b>}</label>}
      {balance > 0 && <>
        <div className="mt-3"><label htmlFor="co-amt" className={lbl}>Amount received</label><input id="co-amt" inputMode="numeric" value={amt} onChange={(e) => setAmt(money(e.target.value))} className={input} /></div>
        <div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => setAmt(String(balance))} className="rounded-full bg-[#eef0f3] px-3 py-1 text-[13px] font-semibold hover:bg-[#e3e6eb]">Full · {tk(balance)}</button></div>
        <div className="mt-2"><MethodPick value={method} onChange={setMethod} /></div>
        {left > 0 && <button onClick={() => go(true)} className="mt-3 text-[13.5px] font-semibold text-[#b42318] underline underline-offset-4">Check out with {tk(left)} balance due</button>}
      </>}
      {balance < 0 && <Hint>Refund the extra {tk(-balance)} from Take payment → Refund after check-out.</Hint>}
      <p className="mt-4 flex items-start gap-2 rounded-lg bg-[#f4f6f8] px-3 py-2 text-[13px] text-[#4d5664]"><BedDouble className="mt-0.5 size-4 shrink-0" />Room {b.unit} becomes Dirty and a cleaning task goes to Housekeeping.</p>
      {err && <Err>{err}</Err>}
    </ActionSheet>
  );
}

export function PayView({ b, balance, onBack, onClose, onDone, takeCash, refund }: ViewProps & { balance: number; takeCash: (n: number, ref: string) => string; refund: (n: number, ref: string) => string }) {
  const { bk } = useBk();
  const isRefund = balance < 0;
  const [amt, setAmt] = useState(balance !== 0 ? String(Math.abs(balance)) : "");
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const go = () => {
    setErr("");
    const a = Number(amt) || 0;
    if (a <= 0) return setErr("Enter an amount");
    if (isRefund && a > -balance) return setErr(`Only ${tk(-balance)} can be refunded`);
    if (method === "Cash") { const e = isRefund ? refund(a, b.code) : takeCash(a, b.code); if (e) return setErr(e); }
    bk.pay(b.code, isRefund ? -a : a, method, note.trim() || undefined);
    onDone(`${isRefund ? "Refunded" : "Received"} ${tk(a)} · ${method}`);
  };
  return (
    <ActionSheet title={isRefund ? "Refund" : "Take payment"} sub={`${b.code} · ${isRefund ? "to refund" : "balance"} ${tk(Math.abs(balance))}`} onBack={onBack} onClose={onClose}
      footer={<button onClick={go} className={clsx(bMain, "min-w-[200px] flex-1 sm:flex-none")}>{isRefund ? "Record refund" : "Record payment"}{Number(amt) > 0 ? ` ${tk(Number(amt))}` : ""}</button>}>
      <div><label htmlFor="pay-amt" className={lbl}>Amount (৳)</label><input id="pay-amt" autoFocus inputMode="numeric" value={amt} onChange={(e) => setAmt(money(e.target.value))} className={input} placeholder="0" /></div>
      {!isRefund && balance > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{[balance, Math.round(balance / 2)].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((v, i) => <button key={v} type="button" onClick={() => setAmt(String(v))} className="rounded-full border border-hms-line px-3 py-1 text-[13px] font-semibold hover:bg-hms-hover">{i === 0 ? "Full" : "Half"} · {tk(v)}</button>)}</div>}
      <div className="mt-3"><p className={lbl}>Method</p><MethodPick value={method} onChange={setMethod} /><Hint>{method === "Cash" ? (isRefund ? "Paid out of the main Cashbox" : "Goes into the main Cashbox") : "Recorded only — no live gateway in this prototype"}</Hint></div>
      <div className="mt-3"><label htmlFor="pay-note" className={lbl}>Note (optional)</label><input id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} className={input} placeholder={method === "bKash" ? "Transaction ID" : method === "Card" ? "Last 4 digits" : ""} /></div>
      {err && <Err>{err}</Err>}
    </ActionSheet>
  );
}

export function MoveView({ b, onBack, onClose, onDone, priceOn }: ViewProps & { priceOn: (d: string) => number }) {
  const { bk, mode } = useBk();
  const hk = useHousekeeping(useProperty());
  const from = b.status === "Checked in" && TODAY > b.from ? TODAY : b.from;
  const free = bk.freeUnits(from, b.to, b.code).filter((u) => u.code !== b.unit);
  const [unit, setUnit] = useState("");
  const [reprice, setReprice] = useState(false);
  const [err, setErr] = useState("");
  const groups = new Map<string, typeof free>();
  for (const u of free) groups.set(u.category, [...(groups.get(u.category) ?? []), u]);
  const order = [...groups.keys()].sort((a, c) => (a === b.categoryId ? -1 : c === b.categoryId ? 1 : 0));
  const go = () => {
    setErr("");
    const u = bk.unitByCode.get(unit);
    let nights: Night[] | undefined;
    if (reprice && u) {
      // Nights already slept keep their price; the rest take the new room's price.
      nights = b.nights.map((n) => (n.date < from ? n : { date: n.date, base: priceOn(n.date) }));
    }
    const e = bk.assign(b.code, unit, nights); if (e) return setErr(e);
    if (b.status === "Checked in" && b.unit) hk.vacated(b.unit, b.code);
    onDone(b.unit ? `Moved to Room ${unit}` : `Room ${unit} assigned`);
  };
  return (
    <ActionSheet title={b.unit ? "Move room" : "Assign room"} sub={`${b.code} · ${dm(from)} → ${dm(b.to)}`} onBack={onBack} onClose={onClose}
      footer={<button onClick={go} disabled={!unit} className={clsx(bMain, "min-w-[200px] flex-1 sm:flex-none")}>{unit ? `${b.unit ? "Move" : "Assign"} to Room ${unit}` : "Pick a room"}</button>}>
      {free.length === 0 ? <p className="rounded-xl bg-[#f4f6f8] px-4 py-6 text-center text-[14px] text-hms-muted">No other room is free for these dates.</p> : order.map((c) => (
        <div key={c} className="mb-3">
          <p className="mb-1.5 text-[13px] font-semibold">{bk.cats.get(c)?.name}{c === b.categoryId && <span className="font-normal text-hms-muted"> · same type</span>}</p>
          <div role="radiogroup" aria-label={bk.cats.get(c)?.name} className="flex flex-wrap gap-1.5">
            {groups.get(c)!.map((u) => <button key={u.code} type="button" role="radio" aria-checked={unit === u.code} onClick={() => setUnit(u.code)} className={clsx("h-10 min-w-16 rounded-lg border px-3 text-[14px] font-semibold", unit === u.code ? "border-hms-red bg-hms-coral-soft text-hms-red" : "border-hms-line bg-white hover:bg-hms-hover")}>{u.code}</button>)}
          </div>
        </div>
      ))}
      {mode === "details" && unit && bk.unitByCode.get(unit)?.category !== b.categoryId && (
        <label className="mt-2 flex items-start gap-3 rounded-xl border border-hms-line px-3.5 py-3"><input type="checkbox" checked={reprice} onChange={(e) => setReprice(e.target.checked)} className="mt-1 size-4 accent-[#b11c29]" /><span className="text-[14px]"><b>Use the new room&apos;s price</b><span className="block text-[12.5px] text-hms-muted">Otherwise the guest keeps the booked price (free upgrade).</span></span></label>
      )}
      {mode === "easy" && <Hint>Price stays the same.</Hint>}
      {err && <Err>{err}</Err>}
    </ActionSheet>
  );
}

export function DatesView({ b, onBack, onClose, onDone, priceOn }: ViewProps & { priceOn: (d: string) => number }) {
  const { bk } = useBk();
  const inHouse = b.status === "Checked in";
  const [from, setFrom] = useState(b.from);
  const [to, setTo] = useState(b.to);
  const [err, setErr] = useState("");
  const old = new Map(b.nights.map((n) => [n.date, n.base]));
  const nights: Night[] = []; if (from < to) for (let d = from; d < to; d = addDays(d, 1)) nights.push({ date: d, base: old.get(d) ?? priceOn(d) });
  const before = bill(b).total, after = from < to ? bill({ ...b, nights }).total : before;
  const go = () => { setErr(""); const e = bk.setDates(b.code, from, to, priceOn); if (e) return setErr(e); onDone(`Dates changed · ${dm(from)} → ${dm(to)}`); };
  return (
    <ActionSheet title={inHouse ? "Extend or shorten stay" : "Change dates"} sub={`${b.code}${b.unit ? ` · Room ${b.unit}` : ""}`} onBack={onBack} onClose={onClose}
      footer={<button onClick={go} disabled={from >= to || (from === b.from && to === b.to)} className={clsx(bMain, "min-w-[200px] flex-1 sm:flex-none")}>Save new dates</button>}>
      <div className="grid grid-cols-2 gap-2">
        <div><label htmlFor="d-from" className={lbl}>Check-in</label><input id="d-from" type="date" value={from} disabled={inHouse} min={inHouse ? undefined : TODAY} onChange={(e) => e.target.value && setFrom(e.target.value)} className={input} /></div>
        <div><label htmlFor="d-to" className={lbl}>Check-out</label><input id="d-to" type="date" value={to} min={addDays(inHouse ? TODAY : from, 1)} onChange={(e) => e.target.value && setTo(e.target.value)} className={input} /></div>
      </div>
      {inHouse && <div className="mt-2 flex flex-wrap gap-1.5">{[1, 2, 3].map((n) => <button key={n} type="button" onClick={() => setTo(addDays(b.to, n))} className="rounded-full border border-hms-line px-3 py-1 text-[13px] font-semibold hover:bg-hms-hover">+{n} night{n > 1 ? "s" : ""}</button>)}</div>}
      <div className="mt-4 rounded-xl border border-hms-line px-3.5 py-2.5">
        <Row k="Nights" v={`${b.nights.length} → ${from < to ? nightsBetween(from, to) : "—"}`} />
        <Row k="Room bill" v={`${tk(before)} → ${tk(after)}`} />
        <Row strong k="Difference" v={`${after - before >= 0 ? "+" : "−"}${tk(Math.abs(after - before))}`} tone={after > before ? "text-[#b42318]" : "text-[#16693a]"} />
      </div>
      <Hint>New nights use the price from Discounts &amp; Rates.</Hint>
      {err && <Err>{err}</Err>}
    </ActionSheet>
  );
}

const REASONS = ["Guest cancelled", "Plans changed", "Payment not received", "Duplicate booking", "Other"];
export function CancelView({ b, onBack, onClose, onDone }: ViewProps) {
  const { bk } = useBk();
  const late = b.from < TODAY;
  const [kind, setKind] = useState<"Cancelled" | "No-show">(late ? "No-show" : "Cancelled");
  const [reason, setReason] = useState(late ? "Did not arrive" : REASONS[0]);
  const paid = paidOf(b);
  const S = bk.settings;
  const fee = policyFee(b, kind, S);
  const [keep, setKeep] = useState<string | null>(null);
  const k = keep === null ? fee : Number(keep) || 0;
  const go = () => { bk.cancel(b.code, kind, reason, k); onDone(`${b.code} ${kind === "No-show" ? "marked no-show" : "cancelled"}${paid - k > 0 ? ` · refund ${tk(paid - k)} due` : k > paid ? ` · ${tk(k - paid)} fee due` : ""}`); };
  const days = nightsBetween(TODAY, b.from);
  return (
    <ActionSheet title={late ? "Didn't arrive" : "Cancel booking"} sub={`${b.code} · ${dm(b.from)} → ${dm(b.to)}`} onBack={onBack} onClose={onClose}
      footer={<button onClick={go} className={clsx(bMain, "min-w-[200px] flex-1 !bg-[#b42318] sm:flex-none")}>{kind === "No-show" ? "Mark no-show" : "Cancel booking"}</button>}>
      {late && (
        <div role="radiogroup" aria-label="What happened" className="mb-3 flex rounded-lg bg-[#e9edf2] p-1">
          {(["No-show", "Cancelled"] as const).map((x) => <button key={x} type="button" role="radio" aria-checked={kind === x} onClick={() => { setKind(x); setKeep(null); setReason(x === "No-show" ? "Did not arrive" : REASONS[0]); }} className={clsx("flex-1 rounded-md py-1.5 text-[14px] font-semibold", kind === x ? "bg-white shadow-sm" : "text-[#4d5664]")}>{x === "No-show" ? "No-show" : "Guest cancelled"}</button>)}
        </div>
      )}
      {kind === "Cancelled" && <div><label htmlFor="c-r" className={lbl}>Reason</label><select id="c-r" value={reason} onChange={(e) => setReason(e.target.value)} className={input}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>}
      <p className="mt-3 text-[14px] text-[#4d5664]">{b.unit ? `Room ${b.unit}` : "The room"} becomes free for {dm(b.from)} – {dm(b.to)}.</p>
      <div className="mt-3 rounded-xl border border-hms-line px-3.5 py-3">
        <p className="text-[13px] text-hms-muted">Policy: {kind === "No-show" ? `no-show pays ${S.noShowFeePct}% of the first night` : days >= S.freeCancelDays ? `free — ${days} day(s) before arrival (free until ${S.freeCancelDays} days)` : `${S.cancelFeePct}% of the first night (less than ${S.freeCancelDays} days before arrival)`}</p>
        <div className="mt-2"><label htmlFor="c-keep" className={lbl}>Cancellation fee (৳)</label><input id="c-keep" inputMode="numeric" value={keep ?? String(fee)} onChange={(e) => setKeep(money(e.target.value))} className={input} /></div>
        <Row k="Paid" v={tk(paid)} />
        {paid > k ? <Row strong k="Refund due" v={tk(paid - k)} tone="text-[#6b55e0]" /> : k > paid ? <Row strong k="Fee still to collect" v={tk(k - paid)} tone="text-[#b42318]" /> : <Row strong k="Nothing to refund" v="—" />}
      </div>
    </ActionSheet>
  );
}
