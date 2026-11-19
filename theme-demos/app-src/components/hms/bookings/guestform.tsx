"use client";
// Guest details + guest register for a stay. Same fields in New booking (step 2) and on the booking page (Guest tab).
// Guest fields are saved to the guest's profile (Guests); register fields belong to this booking.
import clsx from "clsx";
import { useState, type ReactNode } from "react";
import { ChevronDown, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { PREFS, COUNTRIES, validId, validPhone, type Guest, type IdType } from "@/lib/guests/store";
import { PURPOSES, type Companion } from "@/lib/bookings/store";
import { imgSrc } from "@/lib/img";
import { PhotoButton } from "../photo";
import { input, lbl } from "../guests/ui";

export type GuestDraft = Pick<Guest, "name" | "phone" | "email" | "country" | "address" | "idType" | "idNo" | "idFront" | "idBack" | "gender" | "dob" | "occupation" | "visaNo" | "visaExpiry" | "prefs" | "vip">;
export type StayDraft = { purpose: string; comingFrom: string; goingTo: string; eta: string; companions: Companion[]; booker: { name: string; phone: string } | null; payer: { kind: "Guest" | "Company"; name?: string }; note: string };
export const emptyGuest = (): GuestDraft => ({ name: "", phone: "", email: "", country: "Bangladesh", address: "", idType: "NID", idNo: "", gender: undefined, dob: "", occupation: "", visaNo: "", visaExpiry: "", prefs: [], vip: false });
export const emptyStay = (): StayDraft => ({ purpose: "", comingFrom: "", goingTo: "", eta: "", companions: [], booker: null, payer: { kind: "Guest" }, note: "" });
export const guestToDraft = (g: Guest): GuestDraft => ({ name: g.name, phone: g.phone, email: g.email, country: g.country, address: g.address, idType: g.idType || "NID", idNo: g.idNo, idFront: g.idFront, idBack: g.idBack, gender: g.gender, dob: g.dob ?? "", occupation: g.occupation ?? "", visaNo: g.visaNo ?? "", visaExpiry: g.visaExpiry ?? "", prefs: g.prefs, vip: g.vip });

/** Field problems. Phone + name + country are required; ID is optional but must be valid when given. */
export function guestErrors(g: GuestDraft) {
  const e: Record<string, string> = {};
  if (g.name.trim().length < 2) e.name = "Enter the guest's full name";
  if (!validPhone(g.phone, g.country)) e.phone = "Enter a valid phone number";
  if (g.email && !/^\S+@\S+\.\S+$/.test(g.email)) e.email = "Check the email";
  if (g.idNo && !validId(g.idType as IdType, g.idNo)) e.idNo = `That ${g.idType} number doesn't look right`;
  if (g.country !== "Bangladesh" && g.idType !== "Passport" && g.idNo) e.idNo = "Foreign guests need a passport";
  return e;
}

const F = ({ id, label, err, children, className }: { id?: string; label: ReactNode; err?: string; children: ReactNode; className?: string }) => (
  <div className={className}><label htmlFor={id} className={lbl}>{label}</label>{children}{err && <p className="mt-1 text-[12.5px] font-medium text-[#b42318]">{err}</p>}</div>
);
const opt = <span className="font-normal text-hms-muted">(optional)</span>;

function Fold({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-hms-line">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between px-4 py-3 text-left text-[14px] font-semibold">{title}<ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} /></button>
      {open && <div className="hms-fade border-t border-hms-line px-4 py-4">{children}</div>}
    </div>
  );
}

export function GuestFields({ g, set, tried, hidePhone }: { g: GuestDraft; set: (p: Partial<GuestDraft>) => void; tried: boolean; details: boolean; hidePhone?: boolean }) {
  const e = tried ? guestErrors(g) : {};
  // Extra fields stay folded until needed — open when this guest already has some of them.
  const [more, setMore] = useState(() => !!(g.address || g.idFront || g.dob || g.occupation));
  const [photoErr, setPhotoErr] = useState("");
  const foreign = g.country !== "Bangladesh";
  const idPhoto = (side: "idFront" | "idBack", label: string) => (
    <div>
      <p className={lbl}>{label}</p>
      {g[side] ? (
        <div className="relative h-24 overflow-hidden rounded-xl border border-hms-line">
          {/* eslint-disable-next-line @next/next/no-img-element -- uploaded ID photo */}
          <img src={imgSrc(g[side]!)} alt={label} className="size-full object-cover" />
          <button type="button" onClick={() => set({ [side]: undefined })} aria-label={`Remove ${label}`} className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-lg bg-white/90 shadow"><X className="size-4" /></button>
        </div>
      ) : (
        <PhotoButton label={`Upload ${label}`} onPhoto={(v) => { setPhotoErr(""); set({ [side]: v }); }} onError={setPhotoErr} className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#9aa1ad] text-[13px] font-semibold text-[#4d5664] hover:bg-hms-hover">
          <ImagePlus className="size-5" />Upload
        </PhotoButton>
      )}
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <F id="g-name" label="Full name" err={e.name}><input id="g-name" value={g.name} onChange={(x) => set({ name: x.target.value })} className={input} placeholder="As on ID" /></F>
        {!hidePhone && <F id="g-phone" label="Phone" err={e.phone}><input id="g-phone" inputMode="tel" value={g.phone} onChange={(x) => set({ phone: x.target.value })} className={input} placeholder={g.country === "Bangladesh" ? "01XXX-XXXXXX" : "+ country code"} /></F>}
        <F id="g-cty" label="Nationality"><select id="g-cty" value={g.country} onChange={(x) => set({ country: x.target.value, idType: x.target.value === "Bangladesh" ? g.idType : "Passport" })} className={input}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></F>
        <F id="g-email" label={<>Email {opt}</>} err={e.email}><input id="g-email" type="email" value={g.email} onChange={(x) => set({ email: x.target.value })} className={input} /></F>
      </div>
      <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
        <F id="g-idt" label="ID type"><select id="g-idt" value={g.idType} onChange={(x) => set({ idType: x.target.value as IdType })} className={input}>{(foreign ? ["Passport"] : ["NID", "Passport", "Driving licence"]).map((t) => <option key={t}>{t}</option>)}</select></F>
        <F id="g-idn" label={<>{g.idType || "ID"} number {opt}</>} err={e.idNo}><input id="g-idn" value={g.idNo} onChange={(x) => set({ idNo: x.target.value.trim() })} className={input} placeholder={g.idType === "NID" ? "10, 13 or 17 digits" : "Number"} /></F>
      </div>
      <p className="-mt-1 flex items-center gap-2 text-[12.5px] text-hms-muted"><button type="button" disabled className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-[#c9ced6] px-2.5 font-semibold text-[#6b7280]">Scan ID</button>Auto-fill from an NID/passport photo · Coming soon</p>
      {foreign && (
        <div className="grid gap-3 sm:grid-cols-2">
          <F id="g-visa" label={<>Visa number {opt}</>}><input id="g-visa" value={g.visaNo ?? ""} onChange={(x) => set({ visaNo: x.target.value })} className={input} /></F>
          <F id="g-vexp" label={<>Visa valid until {opt}</>}><input id="g-vexp" type="date" value={g.visaExpiry ?? ""} onChange={(x) => set({ visaExpiry: x.target.value })} className={input} /></F>
        </div>
      )}
      <Fold title="More guest details — ID photo, birthday, address" open={more} onToggle={() => setMore(!more)}>
        <div className="grid gap-3 sm:grid-cols-2">
          {idPhoto("idFront", "ID front")}
          {idPhoto("idBack", "ID back")}
          {photoErr && <p className="text-[12.5px] font-medium text-[#b42318] sm:col-span-2">{photoErr}</p>}
          <F id="g-gen" label="Gender"><select id="g-gen" value={g.gender ?? ""} onChange={(x) => set({ gender: (x.target.value || undefined) as GuestDraft["gender"] })} className={input}><option value="">—</option><option>Male</option><option>Female</option><option>Other</option></select></F>
          <F id="g-dob" label="Date of birth"><input id="g-dob" type="date" value={g.dob ?? ""} onChange={(x) => set({ dob: x.target.value })} className={input} /></F>
          <F id="g-addr" label="Address" className="sm:col-span-2"><input id="g-addr" value={g.address} onChange={(x) => set({ address: x.target.value })} className={input} placeholder="House, road, area, city" /></F>
          <F id="g-occ" label="Occupation"><input id="g-occ" value={g.occupation ?? ""} onChange={(x) => set({ occupation: x.target.value })} className={input} /></F>
          <div className="flex items-end"><label className="flex h-11 items-center gap-2 text-[14px] font-semibold"><input type="checkbox" checked={!!g.vip} onChange={(x) => set({ vip: x.target.checked })} className="size-4 accent-[#b11c29]" />VIP guest</label></div>
          <div className="sm:col-span-2"><p className={lbl}>Preferences</p><div className="flex flex-wrap gap-1.5">{PREFS.map((p) => { const on = g.prefs.includes(p); return <button key={p} type="button" aria-pressed={on} onClick={() => set({ prefs: on ? g.prefs.filter((x) => x !== p) : [...g.prefs, p] })} className={clsx("rounded-full px-3 py-1 text-[13px] font-semibold", on ? "bg-hms-ink text-white" : "bg-[#eef0f3] text-[#3a414c]")}>{p}</button>; })}</div></div>
        </div>
      </Fold>
    </div>
  );
}

export function StayFields({ s, set, adults }: { s: StayDraft; set: (p: Partial<StayDraft>) => void; details: boolean; adults: number }) {
  const [open, setOpen] = useState(() => !!(s.purpose || s.comingFrom || s.companions.length || s.booker));
  const comp = (i: number, p: Partial<Companion>) => set({ companions: s.companions.map((c, k) => (k === i ? { ...c, ...p } : c)) });
  return (
    <Fold title={`Stay register — purpose, companions${s.booker || s.payer.kind === "Company" ? ", booker, payer" : ""}`} open={open} onToggle={() => setOpen(!open)}>
      <div className="space-y-4">
        <div><p className={lbl}>Purpose of visit</p><div className="flex flex-wrap gap-1.5">{PURPOSES.map((p) => <button key={p} type="button" aria-pressed={s.purpose === p} onClick={() => set({ purpose: s.purpose === p ? "" : p })} className={clsx("rounded-full px-3 py-1.5 text-[13px] font-semibold", s.purpose === p ? "bg-hms-ink text-white" : "bg-[#eef0f3] text-[#3a414c]")}>{p}</button>)}</div></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <F id="s-from" label="Coming from"><input id="s-from" value={s.comingFrom} onChange={(x) => set({ comingFrom: x.target.value })} className={input} placeholder="City" /></F>
          <F id="s-to" label="Going to next"><input id="s-to" value={s.goingTo} onChange={(x) => set({ goingTo: x.target.value })} className={input} placeholder="City" /></F>
          <F id="s-eta" label="Arrival time"><input id="s-eta" type="time" value={s.eta} onChange={(x) => set({ eta: x.target.value })} className={input} /></F>
        </div>
        <div>
          <div className="flex items-center justify-between"><p className={lbl}>Other guests in the room {adults > 1 && !s.companions.length ? <span className="font-normal text-hms-muted">({adults - 1} more adult{adults > 2 ? "s" : ""})</span> : null}</p>
            <button type="button" onClick={() => set({ companions: [...s.companions, { name: "", idType: "NID", idNo: "", relation: "" }] })} className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-hms-red"><Plus className="size-4" />Add person</button></div>
          {s.companions.length > 0 && <ul className="mt-1 space-y-2">{s.companions.map((c, i) => (
            <li key={i} className="grid grid-cols-2 gap-2 rounded-xl bg-[#f7f8fa] p-2 sm:grid-cols-[1.4fr_110px_1fr_1fr_auto]">
              <input aria-label={`Person ${i + 1} name`} value={c.name} onChange={(x) => comp(i, { name: x.target.value })} placeholder="Name" className={clsx(input, "col-span-2 sm:col-span-1")} />
              <select aria-label={`Person ${i + 1} ID type`} value={c.idType} onChange={(x) => comp(i, { idType: x.target.value })} className={input}><option>NID</option><option>Passport</option><option>Birth certificate</option><option>Driving licence</option></select>
              <input aria-label={`Person ${i + 1} ID number`} value={c.idNo} onChange={(x) => comp(i, { idNo: x.target.value })} placeholder="ID number" className={input} />
              <input aria-label={`Person ${i + 1} relation`} value={c.relation} onChange={(x) => comp(i, { relation: x.target.value })} placeholder="Relation" className={input} />
              <button type="button" onClick={() => set({ companions: s.companions.filter((_, k) => k !== i) })} aria-label={`Remove person ${i + 1}`} className="grid h-11 w-11 place-items-center rounded-lg text-[#b42318] hover:bg-[#fdecec]"><Trash2 className="size-4" /></button>
            </li>
          ))}</ul>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-hms-line p-3">
            <label className="flex items-center gap-2 text-[14px] font-semibold"><input type="checkbox" checked={!!s.booker} onChange={(x) => set({ booker: x.target.checked ? { name: "", phone: "" } : null })} className="size-4 accent-[#b11c29]" />Booked by someone else</label>
            {s.booker && <div className="mt-2 grid gap-2"><input aria-label="Booker name" value={s.booker.name} onChange={(x) => set({ booker: { ...s.booker!, name: x.target.value } })} placeholder="Booker name" className={input} /><input aria-label="Booker phone" value={s.booker.phone} onChange={(x) => set({ booker: { ...s.booker!, phone: x.target.value } })} placeholder="Booker phone" className={input} /></div>}
          </div>
          <div className="rounded-xl border border-hms-line p-3">
            <label className="flex items-center gap-2 text-[14px] font-semibold"><input type="checkbox" checked={s.payer.kind === "Company"} onChange={(x) => set({ payer: x.target.checked ? { kind: "Company", name: "" } : { kind: "Guest" } })} className="size-4 accent-[#b11c29]" />Company pays the bill</label>
            {s.payer.kind === "Company" && <input aria-label="Company name" value={s.payer.name ?? ""} onChange={(x) => set({ payer: { kind: "Company", name: x.target.value } })} placeholder="Company name" className={clsx(input, "mt-2")} />}
          </div>
        </div>
        <F id="s-note" label="Special request"><input id="s-note" value={s.note} onChange={(x) => set({ note: x.target.value })} className={input} placeholder="Late arrival, extra pillow, airport pickup…" /></F>
      </div>
    </Fold>
  );
}
