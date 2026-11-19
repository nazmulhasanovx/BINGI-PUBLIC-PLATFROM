"use client";
import { can } from "@/lib/plan";
import Link from "next/link";
import clsx from "clsx";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Check, CircleCheck, Circle, ImagePlus, Lock, Monitor, Plus, Printer as PrinterIcon, Trash2 } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { useProperty, PROPERTIES, setProperty } from "../property";
import { useSettings, AREAS, type Settings, type Perm, type Role, type Area } from "@/lib/settings/store";
import { usePrefs } from "@/lib/settings/prefs";
import { useBookings, OTAS, tk, type Settings as BkSettings } from "@/lib/bookings/store";
import { invoiceHtml, regCardHtml } from "@/lib/bookings/docs";
import { useGuestNames } from "@/lib/guests/store";
import { useRooms, priceBreak } from "@/lib/rooms/store";
import { useHousekeeping } from "@/lib/housekeeping/store";
import { useHrm, type Employee } from "@/lib/hrm/store";
import { useSite } from "@/lib/site";
import { PLAN_LABEL } from "@/themes/manifest";
import { hasRestaurant } from "../bookings/extras";
import { hasServices } from "@/lib/services/store";
import { printHtml } from "../meals/print";
import { PhotoButton } from "../photo";
import { useNavMode } from "../Shell";
import { Badge, Btn, Card, Field, Input, PageHead, PlanLock, Segmented, TextArea, Toggle } from "../website/ui";

type Ctx = { h: Hotel; s: Settings; save: ReturnType<typeof useSettings>["save"]; toast: (t: string) => void };
export const SCtx = createContext<Ctx | null>(null);
const useS = () => useContext(SCtx)!;

/** Edit a copy; a sticky bar appears only when something changed. */
function useDraft<T>(src: T) {
  const [d, setD] = useState<T>(src);
  const [base, setBase] = useState(() => JSON.stringify(src));
  const now = JSON.stringify(src);
  // Saved data arrived or changed (first load from this browser, save, property switch): follow it unless the user is editing.
  if (now !== base) { setBase(now); if (JSON.stringify(d) === base) setD(src); }
  const dirty = JSON.stringify(d) !== now;
  return { d, setD, dirty, discard: () => setD(src) };
}
function SaveBar({ dirty, onSave, onDiscard }: { dirty: boolean; onSave: () => void; onDiscard: () => void }) {
  useEffect(() => { unsaved.dirty = dirty; return () => { unsaved.dirty = false; }; }, [dirty]);
  useEffect(() => { if (!dirty) return; const f = (e: BeforeUnloadEvent) => e.preventDefault(); window.addEventListener("beforeunload", f); return () => window.removeEventListener("beforeunload", f); }, [dirty]);
  if (!dirty) return null;
  return (
    <div className="sticky bottom-3 z-10 mt-5 flex items-center gap-3 rounded-2xl border border-hms-line bg-white/95 px-4 py-3 shadow-[0_6px_24px_rgb(0_0_0/0.08)] backdrop-blur">
      <span className="flex-1 text-[14px] font-medium">Unsaved changes</span>
      <Btn variant="outline" onClick={onDiscard}>Discard</Btn>
      <Btn onClick={onSave}>Save</Btn>
    </div>
  );
}
const Sel = ({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: (string | [string, string])[]; label: string }) => (
  <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-hms-line bg-white px-3 text-[14px] outline-none focus:border-hms-coral">
    {options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option>; })}
  </select>
);
const Num = ({ value, onChange, label, suffix }: { value: number; onChange: (n: number) => void; label: string; suffix?: string }) => (
  <div className="relative"><Input aria-label={label} inputMode="numeric" value={String(value)} onChange={(e) => onChange(Number(e.target.value.replace(/[^\d.]/g, "")) || 0)} className={suffix ? "pr-10" : ""} />{suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-hms-muted">{suffix}</span>}</div>
);
function ToggleRow({ title, desc, on, onChange, right }: { title: string; desc?: string; on: boolean; onChange: (v: boolean) => void; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-hms-line py-3.5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="min-w-0 flex-1"><p className="text-[14.5px] font-medium">{title}</p>{desc && <p className="text-[13px] text-hms-muted">{desc}</p>}</div>
      {right}<Toggle label={title} on={on} onChange={onChange} />
    </div>
  );
}
const Grid = ({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) => <div className={clsx("grid gap-4", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>{children}</div>;
const Go = ({ href, children }: { href: string; children: ReactNode }) => <Link href={href} className="inline-flex items-center gap-1 text-[13.5px] font-medium text-hms-blue hover:underline">{children}<ArrowUpRight className="size-3.5" /></Link>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const okPhone = (v: string) => { const d = v.replace(/\D/g, ""); return /^(?:880|0)1[3-9]\d{8}$/.test(d) || /^(?:880|0)[2-9]\d{6,9}$/.test(d); };
/** Settings pages register “unsaved changes” here so the left list can ask before leaving. */
export const unsaved = { dirty: false };

// ============ Overview ============
export function OverviewPage() {
  const { h, s } = useS();
  const hrm = useHrm();
  const staffIn = hrm.st.employees.filter((e) => e.access === "linked" || e.access === "invited").length;
  const items: [boolean, string, string][] = [
    [!!(s.profile.phone && s.profile.email), "Contact phone and email", "profile"],
    [!!s.branding.logo, "Hotel logo", "branding"],
    [!!(s.profile.bin || s.profile.tin), "VAT / tax registration number", "profile"],
    [s.policy.reviewed, "Booking policies checked", "policies"],
    [s.payments.some((p) => p.enabled && p.kind !== "cash" && p.account.trim()), "A payment method besides cash", "payments"],
    [!!s.profile.billingName, "Billing contact", "profile"],
    [staffIn > 1, "Staff invited to the HMS", "users"],
  ];
  const done = items.filter((i) => i[0]).length;
  return (
    <>
      <PageHead title="Settings" desc={<>{h.name} · <Badge tone="blue">{PLAN_LABEL[h.plan]}</Badge></>} />
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card title="Setup checklist" action={<span className="text-[13px] font-semibold tabular-nums text-hms-muted">{done} of {items.length}</span>}>
          <div className="mb-3 h-2 rounded-full bg-hms-hover"><div className="h-2 rounded-full bg-hms-green transition-[width]" style={{ width: `${(done / items.length) * 100}%` }} /></div>
          <ul className="divide-y divide-hms-line">
            {items.map(([ok, t, to]) => (
              <li key={t}><Link href={`/hms/settings/${to}`} className="flex items-center gap-3 py-2.5 text-[14px] hover:text-hms-coral">
                {ok ? <CircleCheck className="size-5 text-hms-green" /> : <Circle className="size-5 text-[#c3c8d0]" />}
                <span className={clsx("flex-1", ok && "text-hms-muted line-through decoration-[#c3c8d0]")}>{t}</span>
                {!ok && <span className="text-[13px] font-medium text-hms-blue">Set up</span>}
              </Link></li>
            ))}
          </ul>
        </Card>
        <Card title="Recent changes" action={<Go href="/hms/settings/activity">All activity</Go>}>
          {s.log.length ? <ul className="space-y-2.5">{s.log.slice(0, 6).map((l, i) => <li key={i} className="text-[13.5px]"><p>{l.text}</p><p className="text-[12px] text-hms-muted">{l.at.slice(11, 16)} · {l.by}</p></li>)}</ul>
            : <p className="text-[14px] text-hms-muted">No changes yet.</p>}
        </Card>
      </div>
    </>
  );
}

// ============ Property ============
export function ProfilePage() {
  const { s, save, toast } = useS();
  const f = useDraft(s.profile); const p = f.d; const set = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement>) => f.setD({ ...p, [k]: e.target.value });
  const { st: rooms } = useRooms(useProperty());
  return (
    <>
      <PageHead title="Property profile" desc="Shown on invoices, confirmations and your website." />
      <div className="space-y-4">
        <Card title="Property">
          <Grid><Field label="Property name"><Input value={p.name} onChange={set("name")} /></Field>
            <Field label="Property type" hint={<>{rooms.units.length} rooms · change rooms in <Link className="text-hms-blue underline underline-offset-2" href="/hms/rooms">Rooms</Link></>}><Input value={p.type.replace(/^\w/, (c) => c.toUpperCase())} readOnly className="bg-hms-hover" /></Field>
            <Field label="Phone"><Input inputMode="tel" value={p.phone} onChange={set("phone")} placeholder="01XXX-XXXXXX" /></Field>
            <Field label="Email"><Input type="email" value={p.email} onChange={set("email")} /></Field>
            <Field label="Address"><Input value={p.address} onChange={set("address")} /></Field>
            <div className="grid grid-cols-2 gap-4"><Field label="City"><Input value={p.city} onChange={set("city")} /></Field><Field label="Postcode"><Input inputMode="numeric" value={p.postcode} onChange={set("postcode")} /></Field></div>
          </Grid>
        </Card>
        <Card title="Business registration" desc="Printed on invoices when filled.">
          <Grid cols={3}><Field label="Trade licence no."><Input value={p.tradeLicense} onChange={set("tradeLicense")} /></Field><Field label="TIN"><Input value={p.tin} onChange={set("tin")} /></Field><Field label="VAT BIN"><Input value={p.bin} onChange={set("bin")} /></Field></Grid>
        </Card>
        <Card title="Billing contact" desc="Who gets BinGi bills and reminders.">
          <Grid cols={3}><Field label="Name"><Input value={p.billingName} onChange={set("billingName")} /></Field><Field label="Phone"><Input inputMode="tel" value={p.billingPhone} onChange={set("billingPhone")} /></Field><Field label="Email"><Input type="email" value={p.billingEmail} onChange={set("billingEmail")} /></Field></Grid>
        </Card>
      </div>
      <SaveBar dirty={f.dirty} onDiscard={f.discard} onSave={() => {
        if (!p.name.trim()) return toast("Property name can't be empty");
        if (p.email && !EMAIL.test(p.email.trim())) return toast("Check the email address");
        if (p.billingEmail && !EMAIL.test(p.billingEmail.trim())) return toast("Check the billing email");
        if (p.phone && !okPhone(p.phone)) return toast("Check the phone number");
        if (p.billingPhone && !okPhone(p.billingPhone)) return toast("Check the billing phone");
        save((x) => { x.profile = p; }, "Property profile updated"); toast("Property profile saved"); }} />
    </>
  );
}

export function BrandingPage() {
  const { h } = useS();
  return (
    <>
      <PageHead title="Branding" desc="Your logo on invoices, documents and guest pages." />
      <Card>
        <BrandSlot k="logo" label="Hotel logo" hint="PNG or SVG, transparent background" wide />
        <BrandSlot k="icon" label="App icon" hint="Square, at least 180 × 180 px" />
        {hasRestaurant(h) ? <BrandSlot k="restaurantLogo" label="Restaurant logo" hint="On menus and restaurant receipts" wide />
          : <div className="flex items-center gap-4 pt-4"><div className="flex-1"><p className="text-[14.5px] font-medium text-hms-muted">Restaurant logo</p></div><PlanLock plan="Ultra" /></div>}
      </Card>
      <p className="mt-3 text-[13px] text-hms-muted">Website colours and fonts: <Go href="/hms/website/design">Website Management</Go></p>
    </>
  );
}

function BrandSlot({ k, label, hint, wide }: { k: keyof Settings["branding"]; label: string; hint: string; wide?: boolean }) {
  const { s, save, toast } = useS();
  const v = s.branding[k];
  return (
    <div className="flex items-center gap-4 border-b border-hms-line py-4 first:pt-0 last:border-b-0 last:pb-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded data URL */}
      <div className={clsx("grid shrink-0 place-items-center overflow-hidden rounded-xl border border-hms-line bg-hms-hover", wide ? "h-16 w-36" : "size-16")}>{v ? <img src={v} alt="" className="max-h-full max-w-full object-contain p-1.5" /> : <ImagePlus className="size-5 text-hms-muted" />}</div>
      <div className="min-w-0 flex-1"><p className="text-[14.5px] font-medium">{label}</p><p className="text-[13px] text-hms-muted">{hint}</p></div>
      {v && <Btn variant="ghost" onClick={() => { save((x) => { delete x.branding[k]; }, `${label} removed`); toast(`${label} removed`); }}>Remove</Btn>}
      <PhotoButton label={`Upload ${label.toLowerCase()}`} onPhoto={(src) => { save((x) => { x.branding[k] = src; }, `${label} updated`); toast(`${label} saved`); }} onError={toast} className="inline-flex h-9 items-center rounded-full border border-hms-line bg-white px-4 text-[14px] font-medium hover:bg-hms-hover">{v ? "Replace" : "Upload"}</PhotoButton>
    </div>
  );
}

export function RegionalPage() {
  const { s, save, toast } = useS();
  const f = useDraft(s.regional); const r = f.d;
  const date = r.dateFmt === "DD MMM YYYY" ? "10 Nov 2026" : r.dateFmt === "DD/MM/YYYY" ? "10/11/2026" : "2026-11-10";
  return (
    <>
      <PageHead title="Language & region" desc="For everyone at this property." />
      <Card>
        <Grid>
          <Field label="Country"><Input value="Bangladesh" readOnly className="bg-hms-hover" /></Field>
          <Field label="Time zone"><Sel label="Time zone" value={r.tz} onChange={(v) => f.setD({ ...r, tz: v })} options={["Asia/Dhaka (GMT+6)", "Asia/Kolkata (GMT+5:30)", "Asia/Dubai (GMT+4)", "UTC"]} /></Field>
          <Field label="Currency" hint="Changing currency needs BinGi support — old amounts are not converted."><Input value={r.currency} readOnly className="bg-hms-hover" /></Field>
          <Field label="Date format"><Sel label="Date format" value={r.dateFmt} onChange={(v) => f.setD({ ...r, dateFmt: v as typeof r.dateFmt })} options={[["DD MMM YYYY", "10 Nov 2026"], ["DD/MM/YYYY", "10/11/2026"], ["YYYY-MM-DD", "2026-11-10"]]} /></Field>
          <Field label="Time format"><Segmented value={r.timeFmt} onChange={(v) => f.setD({ ...r, timeFmt: v })} options={[{ v: "12", label: "4:30 PM" }, { v: "24", label: "16:30" }]} /></Field>
          <Field label="Staff language"><Sel label="Staff language" value={r.lang} onChange={(v) => f.setD({ ...r, lang: v })} options={["English", "Bangla"]} /></Field>
          <Field label="Second language (optional)"><Sel label="Second language" value={r.lang2} onChange={(v) => f.setD({ ...r, lang2: v })} options={[["", "None"], "English", "Bangla"]} /></Field>
        </Grid>
        <p className="mt-4 rounded-xl bg-hms-hover px-4 py-3 text-[13.5px]">Looks like: <b>{date}</b> · <b>{r.timeFmt === "12" ? "4:30 PM" : "16:30"}</b> · <b>৳5,750</b></p>
      </Card>
      <SaveBar dirty={f.dirty} onDiscard={f.discard} onSave={() => { save((x) => { x.regional = r; }, "Language & region updated"); toast("Saved"); }} />
    </>
  );
}

// ============ Stay & operations ============
type PolicyDraft = { bk: BkSettings; p: Settings["policy"] };
export function PoliciesPage() {
  const { h, s, save, toast } = useS();
  const bk = useBookings(h);
  const f = useDraft<PolicyDraft>({ bk: bk.settings, p: s.policy }); const { bk: b, p } = f.d;
  const setB = (patch: Partial<BkSettings>) => f.setD({ ...f.d, bk: { ...b, ...patch } });
  const setP = (patch: Partial<Settings["policy"]>) => f.setD({ ...f.d, p: { ...p, ...patch } });
  const MODES: [string, string][] = [["request", "On request"], ["charge", "With a fee"], ["free", "Free"], ["none", "Not offered"]];
  return (
    <>
      <PageHead title="Booking policies" desc="Used by Bookings, confirmations and your website." />
      <div className="space-y-4">
        <Card title="Check-in & check-out">
          <Grid>
            <Field label="Check-in from"><Input type="time" value={b.checkIn} onChange={(e) => setB({ checkIn: e.target.value })} /></Field>
            <Field label="Check-out by"><Input type="time" value={b.checkOut} onChange={(e) => setB({ checkOut: e.target.value })} /></Field>
            <Field label="Early check-in"><div className={clsx("grid gap-2", p.early === "charge" && "grid-cols-[1fr_120px]")}><Sel label="Early check-in" value={p.early} onChange={(v) => setP({ early: v as typeof p.early })} options={MODES} />{p.early === "charge" && <Num label="Early check-in fee" value={b.earlyFee} onChange={(n) => setB({ earlyFee: n })} suffix="৳" />}</div></Field>
            <Field label="Late check-out"><div className={clsx("grid gap-2", p.late === "charge" && "grid-cols-[1fr_120px]")}><Sel label="Late check-out" value={p.late} onChange={(v) => setP({ late: v as typeof p.late })} options={MODES} />{p.late === "charge" && <Num label="Late check-out fee" value={b.lateFee} onChange={(n) => setB({ lateFee: n })} suffix="৳" />}</div></Field>
          </Grid>
        </Card>
        <Card title="Cancellation & no-show" desc="Bookings suggests this fee when staff cancel.">
          <Grid cols={3}>
            <Field label="Free cancellation until" hint="days before arrival"><Num label="Free cancellation days" value={b.freeCancelDays} onChange={(n) => setB({ freeCancelDays: Math.min(60, Math.floor(n)) })} /></Field>
            <Field label="Late cancellation fee" hint="of the first night"><Num label="Late cancellation fee" value={b.cancelFeePct} onChange={(n) => setB({ cancelFeePct: Math.min(100, n) })} suffix="%" /></Field>
            <Field label="No-show fee" hint="of the first night"><Num label="No-show fee" value={b.noShowFeePct} onChange={(n) => setB({ noShowFeePct: Math.min(100, n) })} suffix="%" /></Field>
          </Grid>
        </Card>
        <Card title="Payment">
          <Grid cols={3}>
            <Field label="Website bookings pay"><Sel label="Website bookings pay" value={p.websitePay} onChange={(v) => setP({ websitePay: v as typeof p.websitePay })} options={[["full", "Full amount"], ["advance", "An advance"], ["hotel", "At the hotel"]]} /></Field>
            {p.websitePay === "advance" && <Field label="Advance"><Num label="Advance percent" value={p.advancePct} onChange={(n) => setP({ advancePct: Math.min(100, n) })} suffix="%" /></Field>}
            <Field label="Security deposit at check-in" hint="Held, not part of the bill"><Num label="Security deposit" value={b.depositDefault} onChange={(n) => setB({ depositDefault: n })} suffix="৳" /></Field>
          </Grid>
        </Card>
        <Card title="Children & extra bed">
          <Grid cols={3}>
            <Field label="Children stay free up to age"><Num label="Children free age" value={p.childFreeAge} onChange={(n) => setP({ childFreeAge: Math.min(17, n) })} /></Field>
            <Field label="Extra bed"><Segmented value={p.extraBed ? "y" : "n"} onChange={(v) => setP({ extraBed: v === "y" })} options={[{ v: "y", label: "Available" }, { v: "n", label: "Not available" }]} /></Field>
            {p.extraBed && <Field label="Extra bed price" hint="per night"><Num label="Extra bed price" value={p.extraBedPrice} onChange={(n) => setP({ extraBedPrice: n })} suffix="৳" /></Field>}
          </Grid>
        </Card>
      </div>
      <SaveBar dirty={f.dirty} onDiscard={f.discard} onSave={() => {
        if (b.checkOut >= b.checkIn) return toast("Check-out time must be before check-in time");
        const nb = { ...b, earlyFee: p.early === "charge" ? b.earlyFee : 0, lateFee: p.late === "charge" ? b.lateFee : 0 };
        bk.saveSettings(nb); save((x) => { x.policy = { ...p, reviewed: true }; }, "Booking policies updated"); f.setD({ bk: nb, p: { ...p, reviewed: true } }); toast("Booking policies saved");
      }} />
    </>
  );
}

export function TaxesPage() {
  const { h, s, save, toast } = useS();
  const { st: rooms } = useRooms(h);
  const own = rooms.categories.filter((c) => c.syncTax === false);
  const f = useDraft(s.tax); const t = f.d;
  const ex = priceBreak(5000, { vat: t.vat, service: t.service });
  return (
    <>
      <PageHead title="Taxes & pricing" desc="Hotel default — every room type follows it unless it has its own." />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card title="Taxes & charges">
            <Grid>
              <Field label="VAT"><Num label="VAT" value={t.vat} onChange={(n) => f.setD({ ...t, vat: Math.min(100, n) })} suffix="%" /></Field>
              <Field label="Service charge"><Num label="Service charge" value={t.service} onChange={(n) => f.setD({ ...t, service: Math.min(100, n) })} suffix="%" /></Field>
            </Grid>
            <p className="mt-3 text-[13px] text-hms-muted">Rooms use these. Restaurant and Other Services set their own in <Link href="/hms/meals/settings" className="text-hms-blue underline underline-offset-2">Restaurant</Link> and <Link href="/hms/other-services/setup" className="text-hms-blue underline underline-offset-2">Other Services</Link>.</p>
            {own.length > 0 && <p className="mt-1 text-[13px] text-hms-muted">{own.length} room type{own.length > 1 ? "s use their" : " uses its"} own rate: {own.map((c) => c.name).join(", ")} · <Link href="/hms/rooms" className="text-hms-blue underline underline-offset-2">Rooms</Link></p>}
          </Card>
          <Card title="Price limits">
            <Grid cols={3}>
              <Field label="Lowest room price" hint="0 = no limit"><Num label="Lowest room price" value={t.minRate} onChange={(n) => f.setD({ ...t, minRate: n })} suffix="৳" /></Field>
              <Field label="Front desk discount up to" hint="on rooms"><Num label="Front desk discount limit" value={t.discountLimit} onChange={(n) => f.setD({ ...t, discountLimit: Math.min(100, n) })} suffix="%" /></Field>
              <Field label="Bigger discounts by"><Sel label="Bigger discounts approved by" value={t.discountBy} onChange={(v) => f.setD({ ...t, discountBy: v as typeof t.discountBy })} options={["Manager", "Owner"]} /></Field>
            </Grid>
          </Card>
        </div>
        <Card title="Example · one night">
          <dl className="space-y-1.5 text-[14px]">
            <div className="flex justify-between"><dt>Room</dt><dd className="tabular-nums">{tk(ex.base)}</dd></div>
            <div className="flex justify-between"><dt>Service charge {t.service}%</dt><dd className="tabular-nums">{tk(ex.service)}</dd></div>
            <div className="flex justify-between"><dt>VAT {t.vat}% <span className="text-hms-muted">on room + service</span></dt><dd className="tabular-nums">{tk(ex.vat)}</dd></div>
            <div className="flex justify-between border-t border-hms-line pt-2 text-[16px] font-semibold"><dt>Guest pays</dt><dd className="tabular-nums">{tk(ex.total)}</dd></div>
          </dl>
          <p className="mt-3 text-[12.5px] text-hms-muted">New bookings only. Existing bookings keep their tax.</p>
        </Card>
      </div>
      <SaveBar dirty={f.dirty} onDiscard={f.discard} onSave={() => { save((x) => { x.tax = t; }, `Taxes: VAT ${t.vat}% · service ${t.service}%`); toast("Taxes saved"); }} />
    </>
  );
}

export function HousekeepingRulesPage() {
  const { s, save, toast } = useS();
  const f = useDraft(s.hk); const r = f.d;
  const flow = ["Check-out", ...(r.dirtyOnCheckout ? ["Dirty"] : []), "Cleaning", "Clean", ...(r.inspection ? ["Inspected"] : []), "Ready"];
  return (
    <>
      <PageHead title="Housekeeping rules" />
      <Card>
        <ToggleRow title="Room becomes Dirty at check-out" desc="And a cleaning task opens." on={r.dirtyOnCheckout} onChange={(v) => f.setD({ ...r, dirtyOnCheckout: v })} />
        <ToggleRow title="Inspection before Ready" desc="A supervisor marks the room Inspected." on={r.inspection} onChange={(v) => f.setD({ ...r, inspection: v })} />
        <ToggleRow title="Out-of-order rooms come back by themselves" desc="On the “back on” date." on={r.autoRelease} onChange={(v) => f.setD({ ...r, autoRelease: v })} />
        <div className="flex items-center gap-4 pt-3.5"><p className="flex-1 text-[14.5px] font-medium">New task priority</p><div className="w-40"><Sel label="New task priority" value={r.priority} onChange={(v) => f.setD({ ...r, priority: v as typeof r.priority })} options={["Low", "Normal", "High"]} /></div></div>
      </Card>
      <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[13.5px]">{flow.map((x, i) => <span key={x} className="flex items-center gap-1.5"><span className="rounded-full bg-white px-2.5 py-1 font-medium ring-1 ring-hms-line">{x}</span>{i < flow.length - 1 && <span className="text-hms-muted">→</span>}</span>)}</p>
      <p className="mt-2 text-[13px]"><Go href="/hms/housekeeping">Open Housekeeping</Go></p>
      <SaveBar dirty={f.dirty} onDiscard={f.discard} onSave={() => { save((x) => { x.hk = r; }, "Housekeeping rules updated"); toast("Housekeeping rules saved"); }} />
    </>
  );
}

export function RestaurantPage() {
  const { h } = useS();
  if (!hasRestaurant(h)) return (<><PageHead title="Restaurant & inventory" /><Card><div className="flex items-center gap-3"><Lock className="size-5 text-hms-muted" /><p className="flex-1 text-[14.5px]">Restaurant & Bar comes with Business (full on Ultra). Inventory comes with Ultra.</p><Go href="/hms/settings/billing">See plan</Go></div></Card></>);
  const links: [string, string, string][] = [
    ["Restaurant settings", "Order approval, opening hours, restaurant VAT & service charge", "/hms/meals/settings"],
    ["Menu", "Items, prices, recipes", "/hms/meals/menu"],
    ["Tables & QR", "Tables, rooms and QR codes", "/hms/meals/tables"],
    ...(can(h, "inventory") ? [["Inventory setup", "Stores, units, approvals", "/hms/inventory/setup"] as [string, string, string]] : []),
    ["Printers", "Receipt and kitchen printers", "/hms/settings/documents"],
  ];
  return (
    <>
      <PageHead title="Restaurant & inventory" desc="Each is set up inside its own module." />
      <Card pad={false}>{links.map(([t, d, href]) => <Link key={t} href={href} className="flex items-center gap-4 border-b border-hms-line px-5 py-3.5 last:border-b-0 hover:bg-hms-hover"><span className="min-w-0 flex-1"><b className="block text-[14.5px] font-medium">{t}</b><span className="text-[13px] text-hms-muted">{d}</span></span><ArrowUpRight className="size-4 text-hms-muted" /></Link>)}</Card>
    </>
  );
}

// ============ Online ============
export function ChannelsPage() {
  const { h } = useS();
  const site = useSite(h);
  const o = site.rec.online;
  return (
    <>
      <PageHead title="Website & channels" desc="Where bookings come from." />
      <div className="space-y-4">
        <Card title="Direct">
          <ChRow name="Your website" desc={site.rec.publishedAt ? `bingi.app/hotel/${h.slug}` : "Not published yet"} status={o.booking ? "Taking bookings" : "Bookings paused"} tone={o.booking ? "green" : "gray"} href="/hms/website/online" />
          <ChRow name="BinGi Marketplace" desc="Guests find you on bingi.app" status={o.marketplace ? "Listed" : "Paused"} tone={o.marketplace ? "green" : "gray"} href="/hms/website/online" />
          <ChRow name="Walk-in & phone" desc="Front desk books in Bookings" status="Always on" tone="green" href="/hms/bookings/walkin" />
        </Card>
        <Card title="OTAs" desc="Enter OTA bookings by hand with the OTA booking ID — Bookings shows the source.">
          {OTAS.map((n) => <ChRow key={n} name={n} desc="Rates, availability and bookings sync" status="Coming soon" tone="amber" />)}
        </Card>
      </div>
    </>
  );
}

function ChRow({ name, desc, status, tone, href }: { name: string; desc: string; status: string; tone: "green" | "gray" | "amber"; href?: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-hms-line py-3.5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="min-w-0 flex-1"><p className="text-[14.5px] font-medium">{name}</p><p className="text-[13px] text-hms-muted">{desc}</p></div>
      <Badge tone={tone}>{status}</Badge>{href && <Go href={href}>Manage</Go>}
    </div>
  );
}

// ============ Money ============
export function PaymentsPage() {
  const { s, save, toast } = useS();
  const f = useDraft(s.payments); const rows = f.d;
  const set = (id: string, patch: Partial<(typeof rows)[number]>) => f.setD(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  return (
    <>
      <PageHead title="Guest payments" desc="How guests can pay you. Cash goes to the Cashbox." />
      <Card pad={false}>
        <div className="hidden grid-cols-[1.3fr_1.4fr_90px_90px_60px] gap-3 border-b border-hms-line px-5 py-2.5 text-[12.5px] font-semibold text-hms-muted md:grid"><span>Method</span><span>Account</span><span>At hotel</span><span>Website</span><span>On</span></div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2.5 border-b border-hms-line px-5 py-3 last:border-b-0 md:grid-cols-[1.3fr_1.4fr_90px_90px_60px]">
            <p className={clsx("flex items-center gap-2 text-[14.5px] font-medium", !r.enabled && "text-hms-muted")}>{r.name}{r.upcoming && <Badge tone="amber">Coming soon</Badge>}</p>
            <span className="justify-self-end md:order-last md:justify-self-start"><Toggle label={`${r.name} on`} on={r.enabled} disabled={r.upcoming || r.kind === "cash"} onChange={(v) => set(r.id, { enabled: v })} /></span>
            <div className="col-span-2 md:col-span-1">{r.kind === "cash" ? <span className="text-[13.5px] text-hms-muted">Cashbox</span> : r.upcoming ? <span className="text-[13.5px] text-hms-muted">—</span> : <Input aria-label={`${r.name} account`} value={r.account} onChange={(e) => set(r.id, { account: e.target.value })} placeholder={r.kind === "mfs" ? "Merchant / personal number" : "Bank, account no., branch"} />}</div>
            <label className="col-span-2 flex items-center gap-2 text-[13px] text-hms-muted md:col-span-1"><Toggle label={`${r.name} at the hotel`} on={r.enabled && r.atProperty} disabled={!r.enabled || r.upcoming} onChange={(v) => set(r.id, { atProperty: v })} /><span className="md:hidden">At the hotel</span></label>
            <label className="col-span-2 flex items-center gap-2 text-[13px] text-hms-muted md:col-span-1"><Toggle label={`${r.name} on website`} on={r.enabled && r.onWebsite} disabled={!r.enabled || r.upcoming || r.kind === "cash"} onChange={(v) => set(r.id, { onWebsite: v })} /><span className="md:hidden">On website</span></label>
          </div>
        ))}
      </Card>
      <p className="mt-3 text-[13px] text-hms-muted">Website payments are recorded by staff after checking — no live gateway in this prototype.</p>
      <SaveBar dirty={f.dirty} onDiscard={f.discard} onSave={() => {
        const miss = rows.find((r) => r.enabled && !r.upcoming && r.kind !== "cash" && r.kind !== "gateway" && r.id !== "card" && !r.account.trim());
        if (miss) return toast(`Add the ${miss.name} account first`);
        save((x) => { x.payments = rows; }, "Guest payment methods updated"); toast("Payment methods saved");
      }} />
    </>
  );
}

export function DocumentsPage() {
  const { h, s, save, toast } = useS();
  const bk = useBookings(h);
  const names = useGuestNames(h);
  const [tab, setTab] = useState<"invoice" | "contract" | "printers">("invoice");
  const f = useDraft({ docs: s.docs, printers: s.printers }); const d = f.d.docs; const pr = f.d.printers;
  const setD = (patch: Partial<Settings["docs"]>) => f.setD({ ...f.d, docs: { ...d, ...patch } });
  const setC = (patch: Partial<Settings["docs"]["contract"]>) => setD({ contract: { ...d.contract, ...patch } });
  const sample = bk.list.find((b) => b.status === "Checked in") ?? bk.list[0];
  const [pn, setPn] = useState(""); const [pk, setPk] = useState<Settings["printers"][number]["kind"]>("Receipt (80 mm)"); const [pw, setPw] = useState("Front desk");
  const doSave = () => { save((x) => { x.docs = d; x.printers = pr; }, "Invoices & documents updated"); toast("Saved"); };
  return (
    <>
      <PageHead title="Invoices & documents" actions={<Segmented value={tab} onChange={setTab} options={[{ v: "invoice", label: "Invoice" }, { v: "contract", label: "Stay agreement" }, { v: "printers", label: "Printers" }]} />} />
      {tab === "invoice" && <div className="space-y-4">
        <Card title="Invoice" action={sample && <Btn variant="outline" onClick={() => { if (f.dirty) doSave(); printHtml(invoiceHtml(h, sample, names.get(sample.guestId), [])); }}><PrinterIcon className="size-4" />Preview</Btn>}>
          <p className="mb-4 text-[13.5px] text-hms-muted">Name, address and BIN from <Link href="/hms/settings/profile" className="text-hms-blue underline underline-offset-2">Property profile</Link>; logo from <Link href="/hms/settings/branding" className="text-hms-blue underline underline-offset-2">Branding</Link>.</p>
          <Grid cols={3}>
            <Field label="Number starts with"><Input value={d.prefix} onChange={(e) => setD({ prefix: e.target.value.slice(0, 8) })} /></Field>
            <Field label="Paper"><Segmented value={d.paper} onChange={(v) => setD({ paper: v })} options={[{ v: "A4", label: "A4" }, { v: "Thermal", label: "Receipt printer" }]} /></Field>
            <Field label="Logo on invoice"><Toggle label="Logo on invoice" on={d.showLogo} onChange={(v) => setD({ showLogo: v })} /></Field>
          </Grid>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Terms (optional)" count={`${d.terms.length}/500`}><TextArea value={d.terms} maxLength={500} onChange={(e) => setD({ terms: e.target.value })} /></Field>
            <Field label="Footer" count={`${d.footer.length}/200`}><TextArea value={d.footer} maxLength={200} onChange={(e) => setD({ footer: e.target.value })} /></Field>
          </div>
        </Card>
        <p className="text-[13px] text-hms-muted">Confirmation and pre-arrival texts: <Go href="/hms/settings/messages">Guest messages</Go></p>
      </div>}
      {tab === "contract" && <Card title="Stay agreement" desc="Printed on the registration card for the guest to sign." action={sample && d.contract.on && <Btn variant="outline" onClick={() => { if (f.dirty) doSave(); printHtml(regCardHtml(h, sample, names.get(sample.guestId))); }}><PrinterIcon className="size-4" />Preview</Btn>}>
        <ToggleRow title="Use a stay agreement" on={d.contract.on} onChange={(v) => setC({ on: v })} />
        {d.contract.on && <div className="mt-4 space-y-4">
          <Grid><Field label="Title"><Input value={d.contract.title} onChange={(e) => setC({ title: e.target.value })} /></Field>
            <Field label="Guest signs at"><Segmented value={d.contract.signBefore} onChange={(v) => setC({ signBefore: v })} options={[{ v: "Check-in", label: "Check-in" }, { v: "Booking", label: "Booking" }]} /></Field></Grid>
          <Field label="Opening line"><Input value={d.contract.intro} onChange={(e) => setC({ intro: e.target.value })} /></Field>
          <Field label="House rules & terms"><TextArea value={d.contract.rules} onChange={(e) => setC({ rules: e.target.value })} placeholder="Quiet hours, visitors, smoking, damage, payment…" className="min-h-[140px]" /></Field>
        </div>}
      </Card>}
      {tab === "printers" && <Card title="Printers" desc="Connected to the computer or network at the hotel.">
        {pr.length ? <ul className="mb-4 divide-y divide-hms-line">{pr.map((p) => <li key={p.id} className="flex items-center gap-3 py-2.5"><PrinterIcon className="size-4 text-hms-muted" /><span className="flex-1 text-[14px]"><b>{p.name}</b> · {p.kind} · {p.where}</span><button aria-label={`Remove ${p.name}`} onClick={() => f.setD({ ...f.d, printers: pr.filter((x) => x.id !== p.id) })} className="grid size-8 place-items-center rounded-lg text-hms-muted hover:bg-hms-hover"><Trash2 className="size-4" /></button></li>)}</ul> : <p className="mb-4 text-[14px] text-hms-muted">No printer added — documents print with the browser dialog.</p>}
        <div className="grid gap-2 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
          <Input aria-label="Printer name" value={pn} onChange={(e) => setPn(e.target.value)} placeholder="Printer name" />
          <Sel label="Printer type" value={pk} onChange={(v) => setPk(v as typeof pk)} options={["Receipt (80 mm)", "Kitchen (KOT)", "A4"]} />
          <Sel label="Printer place" value={pw} onChange={setPw} options={["Front desk", "Kitchen", "Bar", "Restaurant", "Back office"]} />
          <Btn variant="outline" disabled={!pn.trim()} onClick={() => { f.setD({ ...f.d, printers: [...pr, { id: `p${Date.now().toString(36)}`, name: pn.trim(), kind: pk, where: pw }] }); setPn(""); }}><Plus className="size-4" />Add</Btn>
        </div>
      </Card>}
      <SaveBar dirty={f.dirty} onDiscard={f.discard} onSave={doSave} />
    </>
  );
}

export function BillingPage() {
  const { h } = useS();
  const { st: rooms } = useRooms(h);
  const mods: [string, boolean][] = [["Bookings, Rooms, Guests, Housekeeping", true], ["Cashbox & Reports", true], ["Other Services", hasServices(h)], ["Restaurant & Bar, Inventory", hasRestaurant(h)], ["Website & Marketplace", true]];
  return (
    <>
      <PageHead title="Billing & plan" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Your plan" action={<Badge tone="blue">{PLAN_LABEL[h.plan]}</Badge>}>
          <p className="text-[14px]">{rooms.units.length} rooms set up</p>
          <ul className="mt-3 space-y-1.5">{mods.map(([m, on]) => <li key={m} className={clsx("flex items-center gap-2 text-[14px]", !on && "text-hms-muted")}>{on ? <Check className="size-4 text-hms-green" /> : <Lock className="size-4" />}{m}</li>)}</ul>
          <p className="mt-4 text-[13px] text-hms-muted">To change plan or add rooms, contact BinGi.</p>
        </Card>
        <Card title="Bills">
          <p className="text-[14px] text-hms-muted">Bills and payment history come from BinGi billing — not connected in this prototype.</p>
          <p className="mt-3 text-[13px]">Billing contact: <Link href="/hms/settings/profile" className="text-hms-blue underline underline-offset-2">Property profile</Link></p>
        </Card>
      </div>
    </>
  );
}

// ============ Messages ============
export function MessagesPage() {
  const { s } = useS();
  const on = s.messages.rules.filter((r) => r.email || r.sms).length;
  return (
    <>
      <PageHead title="Guest messages" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Automatic emails & SMS" desc={`${on} of ${s.messages.rules.length} messages are on. Rules, texts, credits and delivery are managed in one place.`}>
          <Link href="/hms/communication?tab=auto" className="inline-flex h-10 items-center rounded-lg border border-hms-line px-4 text-[14px] font-semibold hover:bg-hms-hover">Open Communication Center</Link>
        </Card>
        <Card title="Chat replies" desc={`${s.messages.shortcuts.length} quick replies, payment note and location for guest chat.`}>
          <Link href="/hms/chat" className="inline-flex h-10 items-center rounded-lg border border-hms-line px-4 text-[14px] font-semibold hover:bg-hms-hover">Open Chat</Link>
        </Card>
      </div>
    </>
  );
}

// ============ Access ============
const roleFor = (e: Employee) => e.dept === "Management" ? "manager" : e.dept === "Front Office" ? "front" : e.dept === "Housekeeping" ? "hk" : e.dept === "Kitchen" ? "fnb" : e.dept === "Finance" ? "accountant" : "";
export function UsersPage() {
  const { s, save, toast } = useS();
  const hrm = useHrm();
  const [tab, setTab] = useState<"users" | "roles">("users");
  const people = hrm.st.employees.filter((e) => e.status === "active");
  const ACCESS: Record<Employee["access"], [string, "green" | "amber" | "gray" | "red"]> = { linked: ["Active", "green"], invited: ["Invited", "amber"], "not-invited": ["No access", "gray"], disabled: ["Turned off", "red"] };
  const setAccess = (e: Employee, a: Employee["access"]) => { hrm.update((x) => { const y = x.employees.find((z) => z.id === e.id); if (y) y.access = a; }, `${e.name}: HMS access ${a}`); save(() => {}, `${e.name} — ${a === "invited" ? "invited" : a === "disabled" ? "access turned off" : "access back on"}`); toast(a === "invited" ? `Invite sent to ${e.name}` : `${e.name} updated`); };
  const rf = useDraft<Role[]>(s.roles); const roles = rf.d; const setRoles = rf.setD; const rolesDirty = rf.dirty;
  const [newRole, setNewRole] = useState("");
  const used = (id: string) => people.some((e) => (s.userRoles[e.id] ?? roleFor(e)) === id && (e.access === "linked" || e.access === "invited"));
  return (
    <>
      <PageHead title="Users & roles" desc="Who can open the HMS and what they can change. Staff records stay in Staff." actions={<Segmented value={tab} onChange={setTab} options={[{ v: "users", label: "Users" }, { v: "roles", label: "Roles" }]} />} />
      {tab === "users" && <Card pad={false}>
        <div className="flex items-center gap-3 border-b border-hms-line px-5 py-3"><span className="grid size-9 place-items-center rounded-full bg-hms-coral text-[13px] font-semibold text-white">YO</span><p className="flex-1 text-[14px] font-medium">You</p><Badge tone="purple">Owner</Badge></div>
        {people.map((e) => {
          const role = s.userRoles[e.id] ?? roleFor(e); const [al, at] = ACCESS[e.access];
          return (
            <div key={e.id} className="grid grid-cols-[36px_1fr_auto] items-center gap-x-3 gap-y-2 border-b border-hms-line px-5 py-3 last:border-b-0 sm:flex">
              <span className="grid size-9 place-items-center rounded-full bg-hms-hover text-[13px] font-semibold">{e.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-medium">{e.name}</p><p className="truncate text-[12.5px] text-hms-muted">{e.position} · {e.phone}</p></div>
              <span className="text-right sm:w-[84px]"><Badge tone={at}>{al}</Badge></span>
              <div className="col-start-2 min-w-0 sm:w-40"><Sel label={`Role of ${e.name}`} value={role} onChange={(v) => { save((x) => { x.userRoles[e.id] = v; }, `${e.name} → ${s.roles.find((r) => r.id === v)?.name ?? "no role"}`); toast("Role changed"); }} options={[["", "No role"], ...s.roles.filter((r) => !r.locked).map((r) => [r.id, r.name] as [string, string])]} /></div>
              <span className="col-start-3 flex justify-end sm:w-[92px]">
                {e.access === "not-invited" && <Btn variant="outline" disabled={!role} onClick={() => setAccess(e, "invited")} aria-label={`Invite ${e.name}`}>Invite</Btn>}
                {(e.access === "linked" || e.access === "invited") && <Btn variant="ghost" onClick={() => setAccess(e, "disabled")} aria-label={`Turn off access for ${e.name}`}>Turn off</Btn>}
                {e.access === "disabled" && <Btn variant="outline" onClick={() => setAccess(e, "linked")} aria-label={`Turn on access for ${e.name}`}>Turn on</Btn>}
              </span>
            </div>
          );
        })}
      </Card>}
      {tab === "roles" && <>
        <Card pad={false}>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-[13.5px]">
            <thead><tr className="border-b border-hms-line text-left text-[12.5px] text-hms-muted"><th className="px-5 py-2.5 font-semibold">Area</th>{roles.map((r) => <th key={r.id} className="px-2 font-semibold">{r.name}{!r.locked && !DEFAULT_IDS.includes(r.id) && !used(r.id) && <button aria-label={`Delete role ${r.name}`} onClick={() => setRoles(roles.filter((x) => x.id !== r.id))} className="ml-1 align-middle text-hms-muted hover:text-hms-red"><Trash2 className="inline size-3.5" /></button>}</th>)}</tr></thead>
            <tbody>{AREAS.map((a) => <tr key={a} className="border-b border-hms-line last:border-b-0"><td className="px-5 py-2 font-medium">{a}</td>{roles.map((r) => <td key={r.id} className="px-2 py-1.5">{r.locked ? <span className="text-hms-muted">Full</span> : <PermSel value={r.perms[a]} label={`${r.name} · ${a}`} onChange={(v) => setRoles(roles.map((x) => (x.id === r.id ? { ...x, perms: { ...x.perms, [a]: v } } : x)))} />}</td>)}</tr>)}</tbody>
          </table></div>
        </Card>
        <div className="mt-3 flex gap-2"><Input aria-label="New role name" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="New role, e.g. Night auditor" className="max-w-xs" /><Btn variant="outline" disabled={!newRole.trim()} onClick={() => { setRoles([...roles, { id: `r${Date.now().toString(36)}`, name: newRole.trim(), perms: { ...(roles.find((r) => r.id === "front")?.perms ?? DEFAULT_PERMS) } }]); setNewRole(""); }}><Plus className="size-4" />Add role</Btn></div>
        <SaveBar dirty={rolesDirty} onDiscard={rf.discard} onSave={() => { save((x) => { x.roles = roles; }, "Role permissions updated"); toast("Roles saved"); }} />
      </>}
    </>
  );
}
const DEFAULT_IDS = ["owner", "manager", "front", "accountant", "hk", "fnb"];
const DEFAULT_PERMS = Object.fromEntries(AREAS.map((a) => [a, "none"])) as Record<Area, Perm>;
function PermSel({ value, onChange, label }: { value: Perm; onChange: (v: Perm) => void; label: string }) {
  return <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as Perm)} className={clsx("h-8 w-full rounded-lg border px-1.5 text-[13px]", value === "edit" ? "border-[#b8e2c8] bg-hms-green-soft text-hms-green" : value === "view" ? "border-[#c3d5fa] bg-hms-blue-soft text-hms-blue" : "border-hms-line bg-white text-hms-muted")}><option value="none">—</option><option value="view">View</option><option value="edit">Edit</option></select>;
}

export function SecurityPage() {
  const { s, save, toast } = useS();
  const f = useDraft(s.security); const x = f.d;
  return (
    <>
      <PageHead title="Security" />
      <div className="space-y-4">
        <Card>
          <ToggleRow title="Two-step sign-in for me" desc="A code on your phone at every new sign-in." on={x.twoStep} onChange={(v) => f.setD({ ...x, twoStep: v })} />
          <ToggleRow title="Two-step sign-in for all staff" on={x.staffTwoStep} onChange={(v) => f.setD({ ...x, staffTwoStep: v })} />
          <div className="flex items-center gap-4 pt-3.5"><p className="flex-1 text-[14.5px] font-medium">Sign out after no use for</p><div className="w-40"><Sel label="Sign out after" value={String(x.timeout)} onChange={(v) => f.setD({ ...x, timeout: Number(v) })} options={[["15", "15 minutes"], ["30", "30 minutes"], ["60", "1 hour"], ["240", "4 hours"], ["0", "Never"]]} /></div></div>
        </Card>
        <Card title="Signed in now">
          <div className="flex items-center gap-3"><Monitor className="size-5 text-hms-muted" /><p className="flex-1 text-[14px]">This browser <Badge tone="green">This device</Badge></p></div>
        </Card>
        <p className="text-[13px] text-hms-muted">Password is changed from the BinGi sign-in page. Prototype: these choices are saved; codes are not sent.</p>
      </div>
      <SaveBar dirty={f.dirty} onDiscard={f.discard} onSave={() => { save((y) => { y.security = x; }, "Security settings updated"); toast("Security saved"); }} />
    </>
  );
}

export function PropertiesPage() {
  const { h } = useS();
  return (
    <>
      <PageHead title="Properties" desc="Each property has its own rooms, staff access and settings." actions={<Link href="/onboarding" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-hms-coral px-4 text-[14px] font-medium text-white hover:bg-[#8e1621]"><Plus className="size-4" />Add a property</Link>} />
      <Card pad={false}>
        {PROPERTIES.map((p) => (
          <div key={p.slug} className="flex items-center gap-3 border-b border-hms-line px-5 py-3 last:border-b-0">
            <div className="min-w-0 flex-1"><p className="text-[14px] font-medium">{p.name}</p><p className="text-[12.5px] text-hms-muted">{p.city} · {PLAN_LABEL[p.plan]}</p></div>
            {p.slug === h.slug ? <Badge tone="green">Open now</Badge> : <Btn variant="outline" onClick={() => setProperty(p.slug)}>Open</Btn>}
          </div>
        ))}
      </Card>
    </>
  );
}

// ============ System ============
export function ActivityPage() {
  const { h, s } = useS();
  const { st: rooms } = useRooms(h);
  const hk = useHousekeeping(h);
  const bk = useBookings(h);
  const [mod, setMod] = useState("All");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const r: { at: string; mod: string; by: string; text: string }[] = [];
    for (const l of s.log) r.push({ at: l.at, mod: "Settings", by: l.by, text: l.text });
    for (const l of rooms.activity) r.push({ at: l.at, mod: "Rooms", by: "—", text: l.text });
    for (const l of hk.st.log) r.push({ at: l.at, mod: "Housekeeping", by: l.by, text: l.text });
    for (const b of bk.list) for (const l of b.log) r.push({ at: l.at, mod: "Bookings", by: l.by, text: `${b.code} · ${l.text}` });
    return r.sort((a, b) => b.at.localeCompare(a.at));
  }, [s.log, rooms.activity, hk.st.log, bk.list]);
  const k = q.trim().toLowerCase();
  const shown = rows.filter((r) => (mod === "All" || r.mod === mod) && (!k || r.text.toLowerCase().includes(k) || r.by.toLowerCase().includes(k)));
  const csv = () => { const t = ["When,Area,By,What", ...shown.map((r) => [r.at.replace("T", " "), r.mod, r.by, r.text].map((v) => `"${v.replace(/"/g, '""')}"`).join(","))].join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([t], { type: "text/csv" })); a.download = `activity-${h.slug}.csv`; a.click(); };
  return (
    <>
      <PageHead title="Activity log" desc="What changed, when and by whom. Read-only." actions={<Btn variant="outline" onClick={csv}>Download CSV</Btn>} />
      <div className="mb-3 flex flex-wrap gap-2"><div className="w-44"><Sel label="Area" value={mod} onChange={setMod} options={["All", "Bookings", "Housekeeping", "Rooms", "Settings"]} /></div><Input aria-label="Search activity" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="max-w-xs" /></div>
      <Card pad={false}>
        {shown.length ? <ul className="divide-y divide-hms-line">{shown.slice(0, 150).map((r, i) => <li key={i} className="grid grid-cols-[110px_110px_1fr] gap-3 px-5 py-2.5 text-[13.5px] max-sm:grid-cols-1 max-sm:gap-0"><span className="tabular-nums text-hms-muted">{r.at.slice(5, 10).split("-").reverse().join("/")} {r.at.slice(11, 16)}</span><span className="font-medium">{r.mod}</span><span>{r.text} <span className="text-hms-muted">· {r.by}</span></span></li>)}</ul>
          : <p className="px-5 py-10 text-center text-[14px] text-hms-muted">Nothing found.</p>}
      </Card>
      {shown.length > 150 && <p className="mt-2 text-[12.5px] text-hms-muted">Showing the latest 150 of {shown.length}.</p>}
    </>
  );
}

export function PreferencesPage() {
  const [prefs, setPrefs] = usePrefs();
  const [nav, setNav] = useNavMode();
  return (
    <>
      <PageHead title="My preferences" desc="Only for you, on this device." />
      <Card>
        <div className="flex flex-wrap items-center gap-4 border-b border-hms-line pb-3.5"><p className="flex-1 text-[14.5px] font-medium">Sidebar</p><Segmented value={nav as "flat" | "expandable"} onChange={setNav} options={[{ v: "flat", label: "Show all" }, { v: "expandable", label: "Fold groups" }]} /></div>
        <div className="flex flex-wrap items-center gap-4 border-b border-hms-line py-3.5"><p className="flex-1 text-[14.5px] font-medium">Text size</p><Segmented value={String(prefs.zoom)} onChange={(v) => setPrefs({ zoom: Number(v) as 90 })} options={[{ v: "90", label: "Small" }, { v: "100", label: "Normal" }, { v: "110", label: "Large" }, { v: "120", label: "Larger" }]} /></div>
        <ToggleRow title="Reduce motion" desc="Turns off page and panel animations." on={prefs.reduceMotion} onChange={(v) => setPrefs({ reduceMotion: v })} />
      </Card>
    </>
  );
}
