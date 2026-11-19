"use client";
// New booking — the live HMS 4-step flow, cleaned up: Rooms & rates → Guest → Meals & services → Payment & review.
// One summary on the right the whole way. Nothing is saved until "Confirm booking".
import Link from "next/link";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Minus, Pencil, Plus, Search, UserRound } from "lucide-react";
import { TODAY, taxOf, type Category as RoomCat, type Unit } from "@/lib/rooms/store";
import { addDays } from "@/lib/bookings/demo";
import { CHANNELS, METHODS, OTAS, bill, dm, dow, nightsBetween, preMealTotal, tk, useBookings, type Channel, type NewBooking, type Night, type PayMethod, type PreMeal } from "@/lib/bookings/store";
import { useBkMode } from "@/lib/bookings/mode";
import { useRates } from "@/lib/rates/store";
import { phoneKey, useGuests } from "@/lib/guests/store";
import { useServices } from "@/lib/services/store";
import { drawerFor, postCash } from "@/lib/cashbox/store";
import { imgSrc } from "@/lib/img";
import { useProperty } from "../property";
import { useCashboxData } from "../cashbox/pages";
import { input, lbl } from "../guests/ui";
import { ChannelBadge, ModeSwitch, bMain, bSoft, channelIcon } from "./ui";
import { ExtrasList, ExtrasPicker, MealPlan, type SvcDraft } from "./extras";
import { GuestFields, StayFields, emptyGuest, emptyStay, guestErrors, guestToDraft, type GuestDraft, type StayDraft } from "./guestform";

const STEPS = [["Rooms & rates", "Dates and room"], ["Guest", "Who is staying"], ["Meals & services", "Optional"], ["Payment & review", "Confirm"]] as const;

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div><p className={lbl}>{label}</p>
      <div className="flex h-11 items-center rounded-lg border border-[#858c97] bg-white">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`} className="grid h-full w-10 place-items-center disabled:opacity-30"><Minus className="size-4" /></button>
        <span className="flex-1 text-center text-[15px] font-semibold tabular-nums" aria-live="polite">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`} className="grid h-full w-10 place-items-center disabled:opacity-30"><Plus className="size-4" /></button>
      </div>
    </div>
  );
}
const Card = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
  <section className="rounded-2xl border border-hms-line bg-white p-4 sm:p-5" aria-label={title}><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-bold">{title}</h2>{action}</div>{children}</section>
);

export function NewBookingPage() {
  const h = useProperty();
  const sp = useSearchParams();
  const router = useRouter();
  const bk = useBookings(h);
  const rates = useRates(h);
  const g = useGuests(h);
  const svc = useServices(h);
  const cbx = useCashboxData();
  const { mode } = useBkMode();
  const details = mode === "details";
  const qFrom = sp.get("from");
  const start = qFrom && qFrom >= TODAY ? qFrom : TODAY;

  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState(0);
  const [channel, setChannel] = useState<Channel>("Walk-in");
  const [ota, setOta] = useState(OTAS[0]);
  const [ref, setRef] = useState("");
  const [from, setFrom] = useState(start);
  const qTo = sp.get("to");
  const [to, setTo] = useState(qTo && qTo > start ? qTo : addDays(start, 1));
  const [adults, setAdults] = useState(() => Math.max(1, Math.min(8, Number(sp.get("adults")) || 2)));
  const [children, setChildren] = useState(0);
  const [picked, setPicked] = useState<string[]>(() => (sp.get("room") ? [sp.get("room")!] : []));
  const [phone, setPhone] = useState(() => sp.get("phone") ?? "");
  const [useId, setUseId] = useState<string | null>(() => sp.get("guest"));
  const [gd, setGd] = useState<GuestDraft | null>(null);
  const [stay, setStay] = useState<StayDraft>(emptyStay);
  const [meals, setMeals] = useState<PreMeal[]>([]);
  const [services, setServices] = useState<SvcDraft[]>([]);
  const [advance, setAdvance] = useState("");
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [discount, setDiscount] = useState("");
  const [plan, setPlan] = useState<("breakfast" | "lunch" | "dinner")[]>([]);
  const [tried, setTried] = useState<Record<number, boolean>>({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const n = nightsBetween(from, to);
  const datesOk = from >= TODAY && to > from;
  const free = useMemo(() => (datesOk ? new Set(bk.freeUnits(from, to).map((u) => u.code)) : new Set<string>()), [bk, from, to, datesOk]);
  const priceUnit = (code: string): { nights: Night[]; closed?: string; deal?: string } => {
    const u = bk.unitByCode.get(code)!;
    const out: Night[] = []; let closed: string | undefined; let deal: string | undefined;
    for (let d = from; d < to; d = addDays(d, 1)) {
      const p = rates.unitPrice(u, d); if (p.closed && !closed) closed = d;
      const dl = rates.deal(u.category, d, p.price, u.id); if (dl) deal = dl.c.name;
      out.push({ date: d, base: dl?.price ?? p.price });
    }
    return { nights: out, closed, deal };
  };
  const groups = useMemo(() => {
    const m = new Map<string, Unit[]>();
    for (const u of bk.units) m.set(u.category, [...(m.get(u.category) ?? []), u]);
    return [...m.entries()].map(([id, us]) => ({ id, cat: bk.cats.get(id)!, units: us.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })) })).filter((x) => x.cat);
  }, [bk.units, bk.cats]);
  const lines = datesOk ? picked.filter((c) => free.has(c)).map((c) => { const u = bk.unitByCode.get(c)!; const cat = bk.cats.get(u.category)!; return { code: c, u, cat, ...priceUnit(c), tax: taxOf(cat) }; }) : [];
  const lost = picked.filter((c) => !free.has(c));
  const roomsBase = lines.reduce((s, l) => s + l.nights.reduce((a, x) => a + x.base, 0), 0);
  const disc = Math.min(Number(discount) || 0, roomsBase);
  // Meal plan: extra (paid) meals every night for the adults in that room — billed with the room.
  const lineAdults = (i: number) => (i === 0 ? Math.max(1, adults - (lines.length - 1)) : 1);
  const planOf = (cat: RoomCat, ad: number) => { const ks = plan.filter((k) => cat.meals?.[k] === "extra" && cat.mealPrices?.[k]); return ks.length ? { name: ks.map((k) => k[0].toUpperCase() + k.slice(1)).join(" + ") + ` × ${ad}`, perNight: ks.reduce((s, k) => s + (cat.mealPrices![k] ?? 0), 0) * ad } : undefined; };
  const planOpts = (["breakfast", "lunch", "dinner"] as const).filter((k) => lines.some((l) => l.cat.meals?.[k] === "extra" && l.cat.mealPrices?.[k]));
  const bills = lines.map((l, i) => bill({ nights: l.nights, tax: l.tax, discount: i === 0 ? disc : 0, mealPlan: planOf(l.cat, lineAdults(i)) }));
  const roomTotal = bills.reduce((s, b) => s + b.total, 0);
  const mealsTotal = meals.reduce((s, m) => s + preMealTotal(m), 0);
  const svcTotal = services.reduce((s, x) => s + x.total, 0);
  const total = roomTotal + mealsTotal + svcTotal;
  const cap = lines.reduce((s, l) => s + l.cat.maxAdults + l.cat.maxChildren, 0);
  const minStay = lines.map((l) => rates.st.cat[l.u.category]?.[from]?.minStay).find((m) => m && n < m);
  const adv = Math.min(Number(advance) || 0, total);
  const room0 = lines[0]?.code ?? "";

  // ---- guest: phone first; a saved guest fills in, a new number opens the form
  const found = !useId && phoneKey(phone).length >= 8 ? g.findByPhone(phone) : undefined;
  const guest = useId ? g.rows.find((r) => r.id === useId) : undefined;
  const showForm = !!guest || (!found && phoneKey(phone).length >= 8);
  const draft: GuestDraft = gd ?? (guest ? guestToDraft(guest) : { ...emptyGuest(), name: sp.get("name") ?? "", phone });
  const shown: GuestDraft = guest ? draft : { ...draft, phone };
  const setDraft = (p: Partial<GuestDraft>) => setGd({ ...shown, ...p });

  const errors: Record<number, string[]> = {
    0: [
      ...(!datesOk ? [from < TODAY ? "Check-in can't be in the past" : "Check-out must be after check-in"] : []),
      ...(!lines.length ? ["Pick at least one room"] : []),
      ...(lines.find((l) => l.closed) ? [`${lines.find((l) => l.closed)!.cat.name} is closed for sale on ${dm(lines.find((l) => l.closed)!.closed!)}`] : []),
      ...(minStay ? [`Minimum stay is ${minStay} nights from ${dm(from)}`] : []),
      ...(lines.length && adults + children > cap ? [`Too many guests for ${lines.length === 1 ? "this room" : "these rooms"} (max ${cap})`] : []),
      ...(channel === "OTA" && !ref.trim() ? [`Enter the ${ota} booking ID`] : []),
    ],
    1: [
      ...(guest?.blocked ? [`${guest.name} is blocked (${guest.blocked.reason}) — unblock in Guests first`] : []),
      ...(!guest && found ? ["This phone belongs to a saved guest — use them"] : []),
      ...(!guest && !found && phoneKey(phone).length < 8 ? ["Enter the guest's phone number"] : []),
      ...(showForm ? Object.values(guestErrors(shown)) : []),
    ],
    2: [], 3: [],
  };
  const go = (k: number) => {
    setErr("");
    if (k > step) for (let i = step; i < k; i++) if (errors[i].length) { setTried({ ...tried, [i]: true }); setStep(i); return; }
    setStep(k); setSeen(Math.max(seen, k));
    document.getElementById("nb-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = () => {
    for (let i = 0; i < 3; i++) if (errors[i].length) { setTried({ ...tried, [i]: true }); setStep(i); return; }
    if (busy) return;
    if (adv > 0 && method === "Cash" && !drawerFor(h, cbx.refs, "front-desk").open) return setErr("Main cashbox is not open — open it, choose another method, or take the advance later.");
    setBusy(true);
    let guestId = guest?.id;
    const d = shown;
    const base = { name: d.name.trim(), phone: d.phone.trim(), email: d.email.trim(), country: d.country, address: d.address, idType: d.idType, idNo: d.idNo, idFront: d.idFront, idBack: d.idBack, gender: d.gender, dob: d.dob || undefined, occupation: d.occupation || undefined, visaNo: d.visaNo || undefined, visaExpiry: d.visaExpiry || undefined, prefs: d.prefs, vip: !!d.vip };
    if (guest) g.saveGuest({ id: guest.id, name: base.name, phone: base.phone, email: base.email, country: base.country, address: base.address, idType: base.idType, idNo: base.idNo, idFront: base.idFront, idBack: base.idBack, gender: base.gender, dob: base.dob, occupation: base.occupation, visaNo: base.visaNo, visaExpiry: base.visaExpiry, prefs: base.prefs, vip: base.vip, verified: guest.verified || (!!d.idNo && !!d.idFront), blocked: guest.blocked, notes: guest.notes, marketing: guest.marketing, created: guest.created });
    else { guestId = g.nextId(); g.saveGuest({ id: guestId, ...base, verified: !!d.idNo && !!d.idFront, notes: "", marketing: !!base.email, created: TODAY }); }
    const comps = stay.companions.filter((c) => c.name.trim());
    const items: NewBooking[] = lines.map((l, i) => ({
      guestId: guestId!, unit: l.code, categoryId: l.u.category, type: l.cat.name, from, to,
      adults: lineAdults(i), children: i === 0 ? children : 0, mealPlan: planOf(l.cat, lineAdults(i)),
      channel, ota: channel === "OTA" ? ota : undefined, channelRef: ref.trim() || undefined,
      nights: l.nights, tax: l.tax, discount: i === 0 ? disc : 0, note: stay.note.trim(),
      purpose: stay.purpose || undefined, comingFrom: stay.comingFrom || undefined, goingTo: stay.goingTo || undefined, eta: stay.eta || undefined,
      companions: i === 0 && comps.length ? comps : undefined,
      booker: stay.booker?.name.trim() ? stay.booker : undefined, payer: stay.payer.kind === "Company" ? stay.payer : undefined,
      preMeals: i === 0 && meals.length ? meals : undefined,
      advance: i === 0 && adv > 0 ? { amount: adv, method } : undefined,
    }));
    const r = bk.create(items);
    if (!r.ok) { setBusy(false); setStep(0); return setErr(r.error); }
    if (adv > 0 && method === "Cash") postCash(h, cbx.refs, "front-desk", { amount: adv, source: "booking", ref: r.codes[0], party: base.name });
    let svcFail = 0;
    for (const s of services) {
      const res = svc.saveOrder({ service: s.service, qty: s.qty, unitPrice: s.unitPrice, method: "booking", booking: { code: r.codes[0], guest: base.name, room: room0, phone: base.phone }, when: { date: s.date, time: s.time }, payment: "Unpaid", sc: s.sc, vat: s.vat, status: "confirmed", source: "staff" });
      if ("error" in res) svcFail++;
    }
    const msg = `${r.codes.length > 1 ? `${r.codes.length} rooms booked` : `${r.codes[0]} booked`} for ${base.name}${svcFail ? ` · ${svcFail} service not scheduled` : ""}`;
    router.push(`/hms/bookings/view?b=${r.codes[0]}&made=${encodeURIComponent(msg)}`);
  };
  const toggle = (c: string) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const errList = (k: number) => tried[k] && errors[k].length > 0 && <ul role="alert" className="space-y-1 rounded-xl bg-[#fdecec] px-4 py-2.5 text-[13.5px] font-medium text-[#b42318]">{errors[k].map((e) => <li key={e}>{e}</li>)}</ul>;
  const photo0 = lines[0] ? lines[0].cat.photos?.[0] ?? lines[0].cat.photo : undefined;
  const guestName = guest?.name ?? (showForm ? shown.name : "");

  const summary = (
    <div className="overflow-hidden rounded-2xl border border-hms-line bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element -- room photo */}
      {photo0 ? <img src={imgSrc(photo0)} alt="" className="h-32 w-full object-cover" /> : <div className="grid h-16 place-items-center bg-[#f4f6f8] text-[13px] text-hms-muted">No room picked yet</div>}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2"><h2 className="text-[16px] font-bold">{lines.length ? lines.map((l) => `Room ${l.code}`).join(", ") : "Summary"}</h2><ChannelBadge b={{ channel, ota }} /></div>
        <p className="text-[13.5px] text-[#4d5664]">{datesOk ? `${dow(from)} ${dm(from)} → ${dow(to)} ${dm(to)} · ${n} night${n > 1 ? "s" : ""}` : "Pick dates"} · {adults + children} guest{adults + children > 1 ? "s" : ""}</p>
        {guestName && <p className="mt-2 flex items-center gap-2 text-[14px] font-semibold"><UserRound className="size-4 text-hms-muted" />{guestName}</p>}
        <div className="mt-3 space-y-1 border-t border-hms-line pt-3 text-[14px]">
          <div className="flex justify-between"><span className="text-[#4d5664]">Rooms{plan.length && planOpts.length ? " + meal plan" : ""}</span><span className="tabular-nums">{tk(roomTotal)}</span></div>
          {disc > 0 && <div className="flex justify-between text-[#16693a]"><span>Discount</span><span>−{tk(disc)}</span></div>}
          {meals.length > 0 && <div className="flex justify-between"><span className="text-[#4d5664]">Meals ({meals.reduce((s, m) => s + m.qty, 0)})</span><span className="tabular-nums">{tk(mealsTotal)}</span></div>}
          {services.length > 0 && <div className="flex justify-between"><span className="text-[#4d5664]">Services ({services.length})</span><span className="tabular-nums">{tk(svcTotal)}</span></div>}
          <div className="flex justify-between border-t border-hms-line pt-2 text-[17px] font-bold"><span>Total</span><span className="tabular-nums">{tk(total)}</span></div>
          <p className="text-[12px] text-hms-muted">Incl. VAT &amp; service charge</p>
          {adv > 0 && <><div className="flex justify-between text-[#4d5664]"><span>Advance · {method}</span><span>−{tk(adv)}</span></div><div className="flex justify-between font-semibold"><span>Due at the hotel</span><span>{tk(total - adv)}</span></div></>}
        </div>
        {err && <p role="alert" className="mt-3 rounded-lg bg-[#fdecec] px-3 py-2 text-[13px] font-medium text-[#b42318]">{err}</p>}
        <div className="mt-4 hidden gap-2 lg:flex">
          {step > 0 && <button onClick={() => go(step - 1)} className={bSoft}><ArrowLeft className="size-4" />Back</button>}
          {step < 3 ? <button onClick={() => go(step + 1)} className={clsx(bMain, "flex-1")}>Next<ArrowRight className="size-4" /></button>
            : <button onClick={submit} disabled={busy} className={clsx(bMain, "flex-1")}><Check className="size-4" />Confirm booking</button>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-[#f4f6f8]"><div className="hms-page">
      <div id="nb-top" className="flex flex-wrap items-center gap-3">
        <Link href="/hms/bookings" aria-label="Back to bookings" className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-hms-line hover:bg-hms-hover"><ArrowLeft className="size-5" /></Link>
        <div className="mr-auto min-w-0"><h1 className="text-[24px] font-bold tracking-[-0.01em]">New booking</h1><p className="text-[14px] text-hms-muted">{h.name}</p></div>
        <ModeSwitch />
      </div>
      <ol className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-3" aria-label="Steps">
        {STEPS.map(([t, s], i) => {
          const done = i !== step && i <= seen && !errors[i].length && i < 3;
          return (
            <li key={t}><button onClick={() => i <= seen && go(i)} disabled={i > seen} aria-current={i === step ? "step" : undefined} aria-label={`Step ${i + 1}: ${t}`}
              className={clsx("flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors sm:px-3", i === step ? "bg-white ring-2 ring-hms-ink" : i <= seen ? "bg-white ring-1 ring-hms-line hover:ring-hms-ink" : "opacity-55")}>
              <span className={clsx("grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold", done ? "bg-[#16a34a] text-white" : i === step ? "bg-hms-ink text-white" : "bg-[#e3e6eb] text-[#4d5664]")}>{done ? <Check className="size-4" /> : i + 1}</span>
              <span className="hidden min-w-0 sm:block"><span className="block truncate text-[14px] font-semibold">{t}</span><span className="block truncate text-[12px] text-hms-muted">{s}</span></span>
            </button></li>
          );
        })}
      </ol>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div key={step} className="hms-page-in space-y-4">
          {step === 0 && <>
            {errList(0)}
            <Card title="Booking source">
              <div role="radiogroup" aria-label="Booking source" className="flex flex-wrap gap-1.5">
                {CHANNELS.map((c) => { const I = channelIcon(c); return <button key={c} type="button" role="radio" aria-checked={channel === c} onClick={() => setChannel(c)} className={clsx("inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-[14px] font-semibold transition-colors", channel === c ? "bg-hms-ink text-white" : "bg-[#eef0f3] text-[#3a414c] hover:bg-[#e3e6eb]")}><I className="size-4" />{c}</button>; })}
              </div>
              {channel !== "Walk-in" && channel !== "Phone" && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {channel === "OTA" && <div><label htmlFor="nb-ota" className={lbl}>Which OTA</label><select id="nb-ota" value={ota} onChange={(e) => setOta(e.target.value)} className={input}>{OTAS.map((o) => <option key={o}>{o}</option>)}</select></div>}
                  <div><label htmlFor="nb-ref" className={lbl}>{channel === "OTA" ? `${ota} booking ID` : channel === "Corporate" ? "Company / PO number" : channel === "Agent" ? "Agent / voucher" : "Reference"}{channel !== "OTA" && <span className="font-normal text-hms-muted"> (optional)</span>}</label><input id="nb-ref" value={ref} onChange={(e) => setRef(e.target.value)} className={input} /></div>
                  {channel === "OTA" && <p className="text-[12.5px] text-hms-muted sm:col-span-2">Recorded for your records — OTA sync is not connected in this prototype.</p>}
                </div>
              )}
            </Card>
            <Card title="Dates & guests">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div><label htmlFor="nb-from" className={lbl}>Check-in</label><input id="nb-from" type="date" min={TODAY} value={from} onChange={(e) => { const v = e.target.value; if (!v) return; setFrom(v); if (to <= v) setTo(addDays(v, 1)); }} className={input} /></div>
                <div><label htmlFor="nb-to" className={lbl}>Check-out · {n > 0 ? `${n} night${n > 1 ? "s" : ""}` : "—"}</label><input id="nb-to" type="date" min={addDays(from, 1)} value={to} onChange={(e) => e.target.value && setTo(e.target.value)} className={input} /></div>
                <Stepper label="Adults" value={adults} min={1} max={20} onChange={setAdults} />
                <Stepper label="Children" value={children} min={0} max={10} onChange={setChildren} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">{[1, 2, 3, 7].map((k) => <button key={k} type="button" onClick={() => setTo(addDays(from, k))} className={clsx("rounded-full px-3 py-1 text-[13px] font-semibold", n === k ? "bg-hms-ink text-white" : "bg-[#eef0f3] text-[#3a414c] hover:bg-[#e3e6eb]")}>{k} night{k > 1 ? "s" : ""}</button>)}</div>
            </Card>
            <Card title="Room" action={lines.length ? <span className="text-[13.5px] font-semibold text-hms-red">{lines.length} picked</span> : <span className="text-[13px] text-hms-muted">Tap one or more</span>}>
              {lost.length > 0 && <p className="mb-3 rounded-lg bg-[#fff4e0] px-3 py-2 text-[13.5px] text-[#8a4b00]">Room {lost.join(", ")} is not free on these dates and was left out.</p>}
              <div className="space-y-3">
                {groups.map(({ id, cat, units }) => {
                  const avail = units.filter((u) => free.has(u.code));
                  const sample = avail[0] ?? units[0];
                  const p = datesOk && sample ? priceUnit(sample.code) : undefined;
                  const avg = p ? Math.round(bill({ nights: p.nights, tax: taxOf(cat), discount: 0 }).total / Math.max(1, n)) : 0;
                  const photo = cat.photos?.[0] ?? cat.photo;
                  const ok = avail.length > 0 && !p?.closed;
                  return (
                    <div key={id} className={clsx("overflow-hidden rounded-xl border transition-colors", units.some((u) => picked.includes(u.code)) ? "border-hms-red ring-1 ring-hms-red" : "border-hms-line", !ok && "bg-[#f7f8fa]")}>
                      <div className="flex gap-3 p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- room photo */}
                        {photo ? <img src={imgSrc(photo)} alt="" className="h-[72px] w-[100px] shrink-0 rounded-lg object-cover" /> : <span className="h-[72px] w-[100px] shrink-0 rounded-lg bg-hms-hover" />}
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-baseline gap-x-2"><b className="text-[15.5px]">{cat.name}</b><span className="text-[12.5px] text-hms-muted">{cat.maxAdults} adult{cat.maxAdults > 1 ? "s" : ""}{cat.maxChildren ? ` + ${cat.maxChildren} child` : ""}</span></p>
                          {p && <p className="text-[14px]"><b className="tabular-nums">{tk(avg)}</b><span className="text-hms-muted"> / night</span>{p.deal && <span className="ml-2 rounded bg-[#e5f5ec] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#16693a]">{p.deal}</span>}</p>}
                          <div className="mt-1 flex flex-wrap items-center gap-2"><span className={clsx("text-[12.5px] font-semibold", ok ? "text-[#16693a]" : "text-[#b42318]")}>{p?.closed ? `Closed ${dm(p.closed)}` : avail.length ? `${avail.length} of ${units.length} free` : "Full"}</span><MealPlan cat={cat} /></div>
                        </div>
                      </div>
                      {ok && <div role="group" aria-label={`${cat.name} rooms`} className="flex flex-wrap gap-1.5 border-t border-hms-line bg-[#fafbfc] px-3 py-2.5">
                        {avail.map((u) => { const on = picked.includes(u.code); return <button key={u.code} type="button" aria-pressed={on} onClick={() => toggle(u.code)} aria-label={`Room ${u.code}`} className={clsx("inline-flex h-10 min-w-16 items-center justify-center rounded-lg px-3 text-[14.5px] font-semibold transition-colors", on ? "bg-hms-red text-white" : "bg-white ring-1 ring-hms-line hover:ring-hms-ink")}>{u.code}</button>; })}
                      </div>}
                    </div>
                  );
                })}
              </div>
            </Card>
          </>}

          {step === 1 && <>
            {errList(1)}
            <Card title="Guest" action={guest ? <button onClick={() => { setUseId(null); setGd(null); setPhone(""); }} className="text-[13.5px] font-semibold text-hms-red">Change guest</button> : undefined}>
              {guest ? (
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#f4f6f8] p-3">
                  <span className="grid size-10 place-items-center rounded-full bg-white text-hms-red"><UserRound className="size-5" /></span>
                  <div className="min-w-0 flex-1"><p className="font-semibold">{guest.name}{guest.vip && <span className="ml-2 rounded bg-[#fdf3d9] px-1.5 py-0.5 text-[11.5px] font-bold text-[#7a4a0b]">VIP</span>}</p><p className="text-[13px] text-hms-muted">Saved guest · {guest.stays.length ? `${guest.stays.length} stay${guest.stays.length > 1 ? "s" : ""}` : "no stays yet"}{guest.blocked ? " · Blocked" : ""}</p></div>
                </div>
              ) : (
                <div className="mb-4">
                  <label htmlFor="nb-ph" className={lbl}>Phone number</label>
                  <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-hms-muted" /><input id="nb-ph" inputMode="tel" autoComplete="off" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXX-XXXXXX or +country code" className={clsx(input, "pl-9")} /></div>
                  {found && <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#f4f6f8] p-3"><div className="min-w-0 flex-1"><p className="font-semibold">{found.name}</p><p className="text-[13px] text-hms-muted">Saved guest · {found.phone}</p></div><button onClick={() => { setUseId(found.id); setGd(null); }} className={bMain}>Use this guest</button></div>}
                  {!found && phoneKey(phone).length < 8 && <p className="mt-1 text-[12.5px] text-hms-muted">Saved guests fill in by themselves.</p>}
                </div>
              )}
              {showForm && <GuestFields g={shown} set={setDraft} tried={!!tried[1]} details={details} hidePhone={!guest} />}
            </Card>
            {showForm && <StayFields s={stay} set={(p) => setStay({ ...stay, ...p })} details={details} adults={adults} />}
          </>}

          {step === 2 && <>
            {planOpts.length > 0 && <Card title="Meal plan · every night">
              <div className="flex flex-wrap gap-2">
                {planOpts.map((k) => { const on = plan.includes(k); const price = lines.find((l) => l.cat.mealPrices?.[k])?.cat.mealPrices?.[k] ?? 0; return <button key={k} type="button" aria-pressed={on} onClick={() => setPlan(on ? plan.filter((x) => x !== k) : [...plan, k])} className={clsx("inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-[14px] font-semibold transition-colors", on ? "bg-hms-ink text-white" : "bg-white ring-1 ring-hms-line hover:ring-hms-ink")}>{on ? <Check className="size-4" /> : <Plus className="size-4" />}{k[0].toUpperCase() + k.slice(1)} · {tk(price)} / person</button>; })}
              </div>
              <p className="mt-2 text-[12.5px] text-hms-muted">{plan.length ? `Adds ${tk(lines.reduce((s, l, i) => s + (planOf(l.cat, lineAdults(i))?.perNight ?? 0), 0))} a night before VAT — on the room bill.` : "Included meals are already in the room price."}</p>
            </Card>}
            <Card title="Meals & services" action={lines[0] ? <MealPlan cat={lines[0].cat} /> : undefined}>
              <ExtrasPicker h={h} from={from} to={to} room={room0} onMeals={(m) => { setMeals([...meals, ...m]); }} onServices={(s) => { setServices([...services, ...s]); }} />
            </Card>
            <Card title={`On this booking${meals.length + services.length ? ` · ${tk(mealsTotal + svcTotal)}` : ""}`}>
              <ExtrasList meals={meals} services={services} onRemoveMeal={(id) => setMeals(meals.filter((m) => m.id !== id))} onRemoveService={(id) => setServices(services.filter((s) => s.id !== id))} />
              <p className="mt-2 text-[12.5px] text-hms-muted">Meals go to the kitchen on their day; services show in Other Services on their date.</p>
            </Card>
          </>}

          {step === 3 && <>
            <Card title="Review">
              <div className="grid gap-3 sm:grid-cols-2">
                <Review title="Stay" onEdit={() => go(0)}>{lines.map((l) => `Room ${l.code} · ${l.cat.name}`).join(", ")}<br />{dm(from)} → {dm(to)} · {n} night{n > 1 ? "s" : ""} · {adults} adult{adults > 1 ? "s" : ""}{children ? `, ${children} child` : ""}<br /><span className="inline-flex items-center gap-1.5 pt-1"><ChannelBadge b={{ channel, ota }} />{ref && <span className="text-hms-muted">{ref}</span>}</span></Review>
                <Review title="Guest" onEdit={() => go(1)}>{guestName}<br />{shown.phone} · {shown.country}<br />{shown.idNo ? `${shown.idType} ${shown.idNo}` : <span className="text-[#a15c00]">ID not added — add at check-in</span>}{stay.companions.filter((c) => c.name.trim()).length ? <><br />+ {stay.companions.filter((c) => c.name.trim()).length} other guest(s)</> : null}</Review>
                <Review title="Meals & services" onEdit={() => go(2)}>{meals.length + services.length ? `${meals.reduce((s, m) => s + m.qty, 0)} meal(s) · ${services.length} service(s) · ${tk(mealsTotal + svcTotal)}` : "None"}</Review>
                <Review title="Register" onEdit={() => go(1)}>{[stay.purpose, stay.comingFrom && `from ${stay.comingFrom}`, stay.eta && `arrives ${stay.eta}`, stay.payer.kind === "Company" && `paid by ${stay.payer.name || "company"}`, stay.booker?.name && `booked by ${stay.booker.name}`].filter(Boolean).join(" · ") || "—"}</Review>
              </div>
            </Card>
            <Card title="Advance payment" action={<span className="text-[13px] text-hms-muted">Optional</span>}>
              <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
                <div><label htmlFor="nb-adv" className={lbl}>Amount (৳)</label><input id="nb-adv" inputMode="numeric" value={advance} onChange={(e) => setAdvance(e.target.value.replace(/\D/g, ""))} placeholder="0" className={input} /></div>
                <div><p className={lbl}>Method</p><div role="radiogroup" aria-label="Advance method" className="grid grid-cols-4 gap-1.5">{METHODS.map((m) => <button key={m} type="button" role="radio" aria-checked={method === m} onClick={() => setMethod(m)} className={clsx("h-11 rounded-xl text-[14px] font-semibold", method === m ? "bg-hms-ink text-white" : "bg-[#eef0f3] text-[#3a414c] hover:bg-[#e3e6eb]")}>{m}</button>)}</div></div>
              </div>
              {total > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{[0.3, 0.5, 1].map((f) => <button key={f} type="button" onClick={() => setAdvance(String(Math.round(total * f)))} className="rounded-full bg-[#eef0f3] px-3 py-1 text-[13px] font-semibold hover:bg-[#e3e6eb]">{f === 1 ? "Full" : `${f * 100}%`} · {tk(total * f)}</button>)}</div>}
              {details && <div className="mt-4 border-t border-hms-line pt-4 sm:max-w-[260px]"><label htmlFor="nb-di" className={lbl}>Room discount (৳, before VAT)</label><input id="nb-di" inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value.replace(/\D/g, ""))} placeholder="0" className={input} /></div>}
            </Card>
          </>}
        </div>
        <aside id="nb-summary" className="lg:sticky lg:top-4">{summary}</aside>
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex items-center gap-2 border-t border-hms-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        {step > 0 && <button onClick={() => go(step - 1)} aria-label="Previous step" className={clsx(bSoft, "px-3")}><ArrowLeft className="size-4" /></button>}
        <div className="min-w-0 flex-1"><p className="text-[12px] text-hms-muted">Step {step + 1} of 4</p><p className="text-[17px] font-bold tabular-nums">{tk(total)}</p></div>
        {step < 3 ? <button onClick={() => go(step + 1)} className={bMain}>Next<ArrowRight className="size-4" /></button> : <button onClick={submit} disabled={busy} className={bMain}>Confirm</button>}
      </div>
    </div></div>
  );
}

function Review({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-[#f7f8fa] p-3.5">
      <div className="mb-1 flex items-center justify-between"><p className="text-[12.5px] font-semibold uppercase tracking-wide text-hms-muted">{title}</p><button onClick={onEdit} aria-label={`Edit ${title}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-hms-red"><Pencil className="size-3.5" />Edit</button></div>
      <p className="text-[14px] leading-6">{children}</p>
    </div>
  );
}
